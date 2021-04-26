#!/bin/sh

if [ $(pgrep "$BAR") ]; then
  echo "$POLYBAR_UPDATE_STR" >> "$POLYBAR_CONFIG"
  sed -i /${POLYBAR_UPDATE_STR}/d "$POLYBAR_CONFIG"
fi
