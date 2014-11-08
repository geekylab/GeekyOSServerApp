#!/bin/sh

cp geeky-mongo.service /etc/systemd/system/

systemctl disable /etc/systemd/system/geeky-mongo.service
systemctl enable /etc/systemd/system/geeky-mongo.service

systemctl stop geeky-mongo.service
systemctl start geeky-mongo.service