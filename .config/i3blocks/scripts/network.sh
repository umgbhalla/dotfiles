#!/bin/bash

NET=$(iw dev | grep ssid | awk '{print $2}')

echo  $NET
echo  $NET

