const puppeteer = require('puppeteer-core')
const os = require('os')
const {v4: uuidv4} = require('uuid')
const {Client} = require('pg')
require('dotenv').config({
    path: '../database/.env'
});
const getSystemInformation = require('./get_systeminformation.js')
const path = require("path");
const fs = require("fs").promises;

const totalTime = performance.now()
const switchMultiple = false
const switchIdIncrement = 1
const serverIP = "10.0.2.2"

const client = new Client({
    host: "postgres",
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
});

if (process.argv[2] && process.argv[2] === '--headless') {
  console.log('Headless mod enable');
  var headlessMod = true;
  var headlessModArg = true;
} else if (process.argv[2] && process.argv[2] === '--headless-new') {
  console.log('Headless-new mod enable');
  var headlessMod = true;
  var headlessModArg = "new";
} else {
  console.log('Headless mod disable');
  var headlessMod = false;
  var headlessModArg = false;
}

async function getCurrentTestRange(testCount) {
	let sql = switchMultiple
		? `SELECT "name" FROM "switch" WHERE id BETWEEN ${testCount} AND ${testCount + switchIdIncrement} AND "tested" = 'notTested'`
		: `SELECT "name" FROM "switch" WHERE id = ${testCount} AND "tested" = 'notTested'`
	return await client.query(sql)
}

async function launchBrowser(testNames) {
	testNames.unshift("--disable-dev-shm-usage", "--no-sandbox", "--single-process", "--no-zygote") //, `--user-data-dir=${process.cwd()}/profile`)

	return await Promise.race([
		puppeteer.launch({
			headless: headlessModArg,
			executablePath: '/chromium/chrome',
			args: testNames
		}),
		new Promise((resolve, reject) => {
			setTimeout(() => {
				reject(new Error(` |- Timeout (launchBrowser) for : ${testNames.join(',')}`))
			}, 20000)
		})
	])
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

async function main() {
	client.connect()

	let testCount = 1

	try {
		await createProfileFolder()
	} catch (error) {
		console.log(` |- ${error}`)
	}

	while (testCount < 1750) {
		let executionBenchStart = performance.now()

		const res = await getCurrentTestRange(testCount)
		let nameId = switchMultiple ? `${testCount}-${testCount + switchIdIncrement}` : `${testCount}`
		testCount += switchIdIncrement

		let testNames = res.rows.map(row => row.name)

		if (testNames.length === 0) continue

		console.log("TestRange : "+nameId)

		let browser

		try {
			console.log(` |- Launch Browser ${testNames}`)
			browser = await launchBrowser(testNames)
		} catch (error) {
			console.log(` |- ${error}`)
			continue;
		}

		try {
			console.log(" |- Get browser version")
			let {version, fullCommandLine, page} = await getBrowserVersion(browser)

			console.log(" |- Generate unique UUID")
			let uuid = await generateUniqueUuid(client)

			console.log(" |- Make runtime config")
			let runtimeConfig = await makeRuntimeConfig(uuid, version, fullCommandLine, testNames)

			console.log(" |- Get system information")
			await getSystemInformation(uuid, client)
			console.log(`	|- UUID: ${uuid}`)

			console.log(" |- Run test page")
			await runTestPage(uuid, page)
		} catch (error) {
			console.log(` |- ${error}`)
		}

		try {
			console.log(" |- Await browser close")
			await Promise.race([
				browser.close(),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error("Timeout close browser"))
					}, 5000)
				})
			])
		} catch (error) {
			console.log(` |- ${error}`)
			browser.process().kill()
		}

		let executionBenchEnd = performance.now()
		console.log(` |- Time : ${executionBenchEnd - executionBenchStart}`)
	}

	client.end()
	console.log(`${process.env.CONTAINER_NAME}`)
	console.log(`\nTotal execution time : ${performance.now() - totalTime}\n`)
	process.exit()
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

main()
	.catch(r => {
		console.log(r)
		process.exit()
	})
