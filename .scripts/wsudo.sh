#!/bin/bash
# small script to enable root access to x-windows system 
# you may need to install xorg-xhost first.

xhost +SI:localuser:root
sudo $1
# disable root access after application terminates
xhost -SI:localuser:root
# print access status to allow verification that root access was removed
xhost
