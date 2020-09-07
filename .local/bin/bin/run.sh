#!/bin/sh
# a script for executing other scripts in $XDG_SCRIPT_HOME

script=$(find $XDG_SCRIPT_HOME/* -type f -maxdepth 0 | sed 's/^\/.*\///' | $SHELLMENU --prompt="\>\ run\ ")

if [[ "$1" == "gui" ]]; then
  $XDG_SCRIPT_HOME/$script
else
  xdotool type --delay 10 "$XDG_SCRIPT_HOME/tui/$script"
fi
