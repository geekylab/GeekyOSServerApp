#!/bin/bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
CONTAINER_NAME="GEEKY_MENU_ADMIN_API"
DOCKER=`which docker`
LISTEN_PORT=3000

#/usr/bin/docker run -p 3000:${LISTEN_PORT} -e LISTEN_PORT=${LISTEN_PORT} --link GEEKY_MONGO:GEEKY_MONGO -v /home/core/GeekyMenuAdmin/app:/app:rw --name GEEKY_MENU_ADMIN_API geekylab/geeky-menu-admin-api
RUN_COMMAND="${DOCKER} run -p ${LISTEN_PORT}:${LISTEN_PORT} --link GEEKY_MENU_CLOUD_APP:GEEKY_MENU_CLOUD_APP --link GEEKY_MONGO:GEEKY_MONGO -e LISTEN_PORT=${LISTEN_PORT} -v ${SCRIPTPATH}/app:/app:rw --name ${CONTAINER_NAME} geekylab/geeky-menu-admin-api"

$RUN_COMMAND
