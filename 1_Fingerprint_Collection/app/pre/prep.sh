#!/bin/sh
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'
MSG_ERRO="[${RED}erro${NC}]"
MSG_INFO="[${GREEN}info${NC}]"
MSG_WARN="[${YELLOW}warn${NC}]"

# Check dependencies
dependencies="npm docker docker-compose node wget tar"

for dep in $dependencies
do
    if ! command -v $dep >/dev/null 2>&1
    then
        printf "${MSG_ERRO} Command %s is not available. Please install it and try again.\n" "$cmd"
        exit 1
    else
        printf "${MSG_INFO} Command %s is available.\n" "$dep"
    fi
done

if ! docker ps >/dev/null 2>&1
then
    printf "${MSG_ERRO} The current user does not have permissions to run Docker. Please add the user to the Docker group or use sudo.\n"
    exit 1
else
    printf "${MSG_INFO} The current user has permissions to run Docker.\n"
fi

printf "${MSG_INFO} All dependencies are satisfied and the user can run Docker.\n"

# Installation
echo "${MSG_INFO} Create data directory"
mkdir -p ../database/data/postgres
mkdir -p ../client/data/
mkdir -p ../server/fpjs/data
mkdir -p ../server/jsta/data

echo "${MSG_INFO} Prepare node"
npm install
cd ../server/jsta
npm install
cd ../fpjs
npm install
cd ../../client
npm install
cd ../pre

printf "${MSG_INFO} Build docker images\n"
cd ../client
if ! docker build -t puppeteer-fp-tester . -f Dockerfile_headless; then
    printf "${MSG_ERRO} Failed to build Docker image puppeteer-fp-tester\n"
    exit 1
fi
if ! docker build -t puppeteer-xvfb . -f Dockerfile_headful; then
    printf "${MSG_ERRO} Failed to build Docker image puppeteer-xvfb\n"
    exit 1
fi

echo "${MSG_INFO}  Prepare database"
echo "${MSG_INFO}  Run database"
cd ../database/
docker-compose up -d
cd ../pre
sleep 10
echo "${MSG_INFO} Run node for db"
node init_db.js
node export_switch_to_db.js
node export_flag_to_db.js

echo "${MSG_INFO} Run web server"
cd ../server
docker-compose up -d

echo "${MSG_INFO} Everything done"
echo "${MSG_INFO} To start the experimentation, run the .sh script in ../client"
