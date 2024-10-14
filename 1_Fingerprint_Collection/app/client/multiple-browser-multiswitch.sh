#!/bin/bash

executable_path="../build/browsers/${1}*/"

for d in ${executable_path} ; do
    [ -L "${d%/}" ] && continue
    container_version=`echo "$d" | sed 's#.*/\([^/]*\)/$#\1#'`
    container_name=`echo "$container_version" | sed 's/[^a-zA-Z0-9]/_/g'`
    echo -e "Run : \e[1m${container_name}\e[0m"
    if docker ps -a | awk '{print $NF}' | grep -qE "^${container_name}$|^${container_name}_headless$"; then
	echo -e "	Remove existing container \e[1m${container_name}\e[0m"
    	docker stop ${container_name} "${container_name}_headless"
	docker rm ${container_name} "${container_name}_headless"
docker rm "${container_name}_headless"
    fi
    echo $container_name
    if [[ "$container_name" == "chrome_linux_128_0_6613_36" || "$container_name" == "chrome_linux_129_0_6666_0" || "$container_name" == "chrome_linux_130_0_6710_0" ]]; then
        docker run --name "${container_name}_headless" --env "CONTAINER_NAME:${container_name}" -v "$(pwd)/${d}:/chromium" -v "$(pwd)/puppeteer-switch-jsta-fpjs-multiswitch.js:/home/pptruser/puppeteer.js:ro" -v "$(pwd)/get_systeminformation.js:/home/pptruser/get_systeminformation.js:ro" -v "$(pwd)/../database/.env:/home/database/.env:ro" -v "$(pwd)/data:/home/pptruser/data" -v "$(pwd)/multi-switch-selection:/home/pptruser/multi-switch-selection" --network fp-docker -d puppeteer-xvfb:latest sh -c "Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp & node /home/pptruser/puppeteer.js --headless-new headless${container_version}"
    else
        docker run --name "${container_name}_headless" --env "CONTAINER_NAME:${container_name}" -v "$(pwd)/${d}:/chromium" -v "$(pwd)/puppeteer-switch-jsta-fpjs-multiswitch.js:/home/pptruser/puppeteer.js:ro" -v "$(pwd)/get_systeminformation.js:/home/pptruser/get_systeminformation.js:ro" -v "$(pwd)/../database/.env:/home/database/.env:ro" -v "$(pwd)/data:/home/pptruser/data" -v "$(pwd)/multi-switch-selection:/home/pptruser/multi-switch-selection" --network fp-docker -d puppeteer-xvfb:latest sh -c "Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp & node /home/pptruser/puppeteer.js --headless headless${container_version}"
    fi
    docker run --name "${container_name}" --env "CONTAINER_NAME:${container_name}" -v "$(pwd)/${d}:/chromium" -v "$(pwd)/puppeteer-switch-jsta-fpjs-multiswitch.js:/home/pptruser/puppeteer.js:ro" -v "$(pwd)/get_systeminformation.js:/home/pptruser/get_systeminformation.js:ro" -v "$(pwd)/../database/.env:/home/database/.env:ro" -v "$(pwd)/data:/home/pptruser/data" -v "$(pwd)/multi-switch-selection:/home/pptruser/multi-switch-selection" --network fp-docker -e "DISPLAY=:99" -e "QT_X11_NO_MITSHM=1" -d puppeteer-xvfb:latest sh -c "Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp & node /home/pptruser/puppeteer.js -- ${container_version}"
done

