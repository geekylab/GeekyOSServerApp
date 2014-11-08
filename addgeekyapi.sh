#!/bin/sh

cp geeky-menu-api.service /etc/systemd/system/

systemctl disable /etc/systemd/system/geeky-menu-api.service
systemctl enable /etc/systemd/system/geeky-menu-api.service

systemctl stop geeky-menu-api.service
systemctl start geeky-menu-api.service
