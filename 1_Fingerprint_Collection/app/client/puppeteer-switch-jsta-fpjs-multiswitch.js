const puppeteer = require('puppeteer-core');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({
    path: '../database/.env'
});
const getSystemInformation = require('./get_systeminformation.js');

const totalTime = performance.now();
const serverIP = "10.0.2.2";

const [,, scriptName, chromeVersion] = process.argv;

if (!scriptName || !chromeVersion) {
    console.error("Usage: node puppeteer-switch-jsta-fpjs-multiswitch.js <--headless,--headless-new,N/A> <chromeVersion>");
    process.exit(1);
}

const client = new Client({
    host: "postgres",
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
});

let headlessMod = false;
let headlessModArg = false;

if (scriptName.includes('--headless')) {
    console.log('Headless mod enable');
    headlessMod = true;
    headlessModArg = scriptName.includes('--headless-new') ? "new" : true;
} else {
    console.log('Headless mod disable');
}

async function getSwitchSets(version) {
    const filePath = path.join('multi-switch-selection', `${version}_multi_switch_selection.csv`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return fileContent.split('\n').filter(line => line.trim() !== '').map(line => line.split(','));
}

async function launchBrowser(switches) {
    switches.unshift("--disable-dev-shm-usage", "--no-sandbox", "--single-process", "--no-zygote");

    return await Promise.race([
        puppeteer.launch({
            headless: headlessModArg,
            executablePath: '/chromium/chrome',
            args: switches
        }),
        new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error(` |- Timeout (launchBrowser) for : ${switches.join(',')}`));
            }, 20000);
        })
    ]);
}

async function getBrowserVersion(browser) {
	const page = await browser.newPage()
	const chromeProcess = await browser.process()

	return {
		version: await page.browser().version(),
		fullCommandLine: `${chromeProcess.spawnargs.join(' ')}`,
		page: page
	}
}

async function makeRuntimeConfig(uuid, version, cmd, testNames) {
	let config = {
		fileInfos: {
			uuid: uuid,
			date: new Date().toISOString(),
			path: {fpjs: '../server/data/fpjs', jsta: '../server/data/jsta'}
		},
		runtimeConfig: {
			browserVersion: version,
			switch: [],
			headless: headlessModArg,
			os: {platform: os.platform(), version: os.release(), architecture: os.arch()},
			fullCommandLine: cmd
		}
	}

	for (let name of testNames) {
		config.runtimeConfig.switch.push({"name": name})
	}

	await client.query(`INSERT INTO "runtimeconfig" ("uuid", "date", "headless", "browserversion", "os_platform", "os_version", "os_architecture", "full_commandline", "status") VALUES ('${uuid}', '${new Date().toISOString()}', ${headlessMod}, '${version}', '${os.platform()}', '${os.release()}', '${os.arch()}', '${cmd}', 'wip');`);
	await client.query(`INSERT INTO "runtimeconfig_switch" ("runtimeconfig_uuid", "switch_id") SELECT '${uuid}', "id" FROM "switch" WHERE "name" IN (${testNames.map(name => `'${name}'`).join(', ')})`);

	return config
}

async function runTestPage(uuid, page) {
	try {
		await page.goto(`http://fingerprintjs:5000/#${uuid}`)
		await page.waitForTimeout(8000)
		await page.goto(`http://js-template-attacks:8080/record#${btoa(uuid)}`)
		await page.waitForSelector('#log > span:nth-child(49)')
		await page.reload()
		await page.waitForSelector('#log > span:nth-child(49)')
		await client.query(`UPDATE "runtimeconfig" SET "status" = 'success' WHERE "uuid" = '${uuid}'`)
	} catch (error) {
		if (error.name === 'TimeoutError') {
			console.log(` |- Timeout (runTestPage) for: ${uuid}`)
		} else {
			console.log(` |- ${error}`)
		}

		await client.query(`UPDATE "runtimeconfig" SET "status" = 'timeout' WHERE "uuid" = '${uuid}'`)
	}
}

async function createProfileFolder() {
	const profileFolderPath = path.join(process.cwd(), "/profile");

	await fs.rm(profileFolderPath, { recursive: true, force: true });
	await fs.mkdir(profileFolderPath, { recursive: true });

	const localStateFile = {
		"browser": {}
	};

	const jsonlocalStateFile = JSON.stringify(localStateFile, null, 2);

	await fs.writeFile(path.join(profileFolderPath, "Local State"), jsonlocalStateFile);
}

async function insertSwitches(client, uuid, testNames) {
    await client.query('BEGIN'); 

    try {
        for (const switchName of testNames) {
            const checkSwitch = await client.query('SELECT id FROM "switch" WHERE name = $1', [switchName]);
            let switchId;

            if (checkSwitch.rows.length === 0) {
                const insertSwitch = await client.query('INSERT INTO "switch" (name) VALUES ($1) RETURNING id', [switchName]);
                switchId = insertSwitch.rows[0].id;
            } else {
                switchId = checkSwitch.rows[0].id;
            }

	    console.log(`  |- Inserting switch: ${switchName} ${switchId}`);
            await client.query(`
                INSERT INTO "runtimeconfig_switch" ("runtimeconfig_uuid", "switch_id")
                VALUES ($1, $2)
                ON CONFLICT ("runtimeconfig_uuid", "switch_id") DO NOTHING
            `, [uuid, switchId]);
        }

        await client.query('COMMIT'); 
    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Error inserting switches:', error.message);
        throw error;
    }
}

async function main() {
	await client.connect()

    try {
        await createProfileFolder();
    } catch (error) {
        console.log(` |- Error creating profile folder: ${error.message}`);
    }

    const switchSets = await getSwitchSets(chromeVersion);

    for (let i = 0; i < switchSets.length; i++) {
        let executionBenchStart = performance.now();

        const testNames = switchSets[i];

        console.log(`TestSet : ${i + 1}/${switchSets.length}`);

        let browser;

        try {
            console.log(` |- Launch Browser with ${testNames.length} switches`);
            browser = await launchBrowser(testNames);
        } catch (error) {
            console.log(` |- Error launching browser: ${error.message}`);
            continue;
        }

        try {
            console.log(" |- Get browser version");
            let { version, fullCommandLine, page } = await getBrowserVersion(browser);

            console.log(" |- Generate unique UUID");
            let uuid = await generateUniqueUuid(client);

            console.log(" |- Make runtime config");
            let runtimeConfig = await makeRuntimeConfig(uuid, version, fullCommandLine, testNames);

            console.log(" |- Get system information");
            await getSystemInformation(uuid, client);
            console.log(`    |- UUID: ${uuid}`);

            console.log(" |- Run test page");
            await runTestPage(uuid, page);
	    console.log(" |- Inserting switches");
    	    await insertSwitches(client, uuid, testNames);
            /*for (const switchName of testNames) {
                await client.query(`
                    INSERT INTO "runtimeconfig_switch" ("runtimeconfig_uuid", "switch_id")
                    SELECT $1, "id" FROM "switch" WHERE "name" = $2
                `, [uuid, switchName]);
            }*/

        } catch (error) {
            console.log(` |- Error during test execution: ${error.message}`);
            console.log(` |- Full error details: ${JSON.stringify(error, null, 2)}`);
        }

        try {
            console.log(" |- Await browser close");
            await Promise.race([
                browser.close(),
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error("Timeout close browser"));
                    }, 5000);
                })
            ]);
        } catch (error) {
            console.log(` |- Error closing browser: ${error.message}`);
            browser.process().kill();
        }

        let executionBenchEnd = performance.now();
        console.log(` |- Time : ${executionBenchEnd - executionBenchStart}`);
    }

    await client.end();
    console.log(`${process.env.CONTAINER_NAME}`);
    console.log(`\nTotal execution time : ${performance.now() - totalTime}\n`);
    process.exit();
}

async function generateUniqueUuid() {
	let uuid = uuidv4()
	const result = await client.query(`SELECT COUNT(*) FROM "runtimeconfig" WHERE "uuid" = '${uuid}'`)
	let count = result.rows[0].count
	while (count > 0) {
		uuid = uuidv4()
		const result = await client.query(`SELECT COUNT(*) FROM "runtimeconfig" WHERE "uuid" = '${uuid}'`)
		count = result.rows[0].count
	}

	return uuid
}

main().catch(r => {
    console.log(r);
    process.exit();
});
