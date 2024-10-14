<div align="center">
<img src="./docs/img/logo.png" alt="drawing" width="200" style="width:200px;"/></center>
<h1 align="center">FP-Rainbow</h1>
</div>

# 1. Fingerprint Collection

## :page_facing_up: Description

**FP-Rainbow** is a platform to measure the impact of the configuration parameters browsers and environment on their browser fingerprints. 
This directory contains the code to run chromium-based browsers, explore their configuration parameters, and collect their respective fingerprints.

#### :file_folder:  Files

```
.
├── 1_Fingerprint_Collection
│   ├── app
│   │   ├── build
│   │   │   └── browsers # The browsers executable
│   │   │       ├── chrome-linux-113.0.5672.63
│   │   │       ├── chrome-linux-114.0.5735.133
│   │   │       ├── chrome-linux-115.0.5790.170
│   │   │       ├── chrome-linux-116.0.5845.96
│   │   │       ├── chrome-linux-117.0.5938.149
│   │   │       ├── chrome-linux-118.0.5993.70
│   │   │       ├── chrome-linux-119.0.6045.105
│   │   │       ├── chrome-linux-120.0.6099.109
│   │   │       ├── chrome-linux-121.0.6167.184
│   │   │       ├── chrome-linux-122.0.6261.128
│   │   │       ├── chrome-linux-123.0.6312.122
│   │   │       ├── chrome-linux-124.0.6367.207
│   │   │       ├── chrome-linux-125.0.6422.141
│   │   │       ├── chrome-linux-126.0.6478.182
│   │   │       ├── chrome-linux-127.0.6533.119
│   │   │       ├── chrome-linux-128.0.6613.137
│   │   │       ├── chrome-linux-129.0.6668.58
│   │   │       └── chrome-linux-130.0.6710.0
│   │   ├── client
│   │   │   ├── Dockerfile_headful
│   │   │   ├── Dockerfile_headless
│   │   │   ├── dockerfiles
│   │   │   │   ├── headful
│   │   │   │   └── headless
│   │   │   ├── get_systeminformation.js
│   │   │   ├── multiple-browser-multiswitch.sh
│   │   │   ├── multiple-browser.sh
│   │   │   ├── multi-switch-selection # Switch sets
│   │   │   │   ├── chrome-linux-113.0.5672.63_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-114.0.5735.133_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-115.0.5790.170_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-116.0.5845.96_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-117.0.5938.149_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-118.0.5993.70_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-119.0.6045.105_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-120.0.6099.109_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-121.0.6167.184_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-122.0.6261.128_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-123.0.6312.122_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-124.0.6367.207_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-125.0.6422.141_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-126.0.6478.182_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-127.0.6533.119_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-128.0.6613.137_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-129.0.6668.58_multi_switch_selection.csv
│   │   │   │   ├── chrome-linux-130.0.6710.0_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-113.0.5672.63_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-114.0.5735.133_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-115.0.5790.170_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-116.0.5845.96_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-117.0.5938.149_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-118.0.5993.70_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-119.0.6045.105_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-120.0.6099.109_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-121.0.6167.184_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-122.0.6261.128_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-123.0.6312.122_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-124.0.6367.207_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-125.0.6422.141_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-126.0.6478.182_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-127.0.6533.119_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-128.0.6613.137_multi_switch_selection.csv
│   │   │   │   ├── headlesschrome-linux-129.0.6668.58_multi_switch_selection.csv
│   │   │   │   └── headlesschrome-linux-130.0.6710.0_multi_switch_selection.csv
│   │   │   ├── package.json
│   │   │   ├── puppeteer-switch-jsta-fpjs.js
│   │   │   └── puppeteer-switch-jsta-fpjs-multiswitch.js
│   │   ├── database
│   │   │   └── docker-compose.yml
│   │   ├── pre # Installation and initialization
│   │   │   ├── chromium-switches-list.json
│   │   │   ├── export_switch_to_db.js
│   │   │   ├── init_db.js
│   │   │   ├── package.json
│   │   │   └── prep.sh
│   │   └── server
│   │       ├── docker-compose.yml
│   │       ├── fpjs
│   │       │   ├── index.js
│   │       │   ├── package.json
│   │       │   └── public
│   │       └── jsta
│   │           ├── jta.html
│   │           ├── LICENSE
│   │           ├── package.json
│   │           └── server.js
│   ├── docs
│   │   └── img
│   │       └── logo.png
│   └── README.md
├── LICENCE
└── README.md

```

## :books: Documentation

### :rocket: Getting started

#### :wrench: Requirements

- docker
- docker-compose
- bash
- git
- npm
- wget
- zstandard

:whale: These scripts suppose your user is in the `docker` group and that you don't require `sudo` to run docker. Please verify this is the case either through the official documentation for your system or by trying the following commands.
You can verify your users groups with the `id` command.

:ok_person: If your current user is not in the `docker` groupe simply add it with this command `sudo usermod -aG docker $USER`, and open a new terminal.

:no_good: If you don't want to add your current user to the `docker` group, simply add `sudo` before each `docker` and `docker-compose` in the [./app/pre/prep.sh](./app/pre/prep.sh) file, and for [./app/client/multiple-browser.sh](./app/client/multiple-browser.sh) and [./app/client/multiple-browser-multiswitch.sh](./app/client/multiple-browser-multiswitch.sh).

#### :package: Installation

Run the file in [./app/pre/prep.sh](./app/pre/prep.sh)

```sh
cd ./app/pre
./prep.sh
```

This file creates the directory, installs the npm package, download the Chromium executable, runs the database and the web server. 
When it's finished, you can run the experimentation.

#### :microscope: Usage

After running [./app/pre/prep.sh](./app/pre/prep.sh), you can go to `./app/client` and run the experiment. 
To run the experiment, simply execute [multiple-browser.sh](./multiple-browser.sh). To run the multi-switch experiment (from a selection of impacted switches), simply execute [multiple-browser-multiswitch.sh](./multiple-browser-multiswitch.sh).
Both scripts explore the browser's command line switches, in headless and headful modes, from all available Chromium executables in [./app/build/browsers](./app/build/browsers/). Each time, the browser's fingerprint is collected in the server folder [./app/server/](./app/server/).

##### :eyes: Check results

To check the results, you can visit the database at [localhost:8032](http://localhost:8032/?pgsql=postgres&username=user&db=db_fp) and log in with the credentials found in [./app/database/.env](./app/database/.env)
All the fingerprints are generated in `./app/server/jsta/data` and `./app/server/fpjs/data`.
