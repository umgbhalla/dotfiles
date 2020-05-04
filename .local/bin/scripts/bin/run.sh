#!/bin/sh
if [[ "$1" == "gui" ]]; then
  script=$(find $XDG_SCRIPT_HOME/* -type f -maxdepth 0 | sed 's/^\/.*\///' | dmenu -i -l 20 -p "Script:")
  $XDG_SCRIPT_HOME/./$script
else
  script=$(ls $XDG_SCRIPT_HOME/tui/* | sed 's/^\/.*\///' | dmenu -i -l 20 -p "Script:")
  xdotool type --delay 0 "$XDG_SCRIPT_HOME/tui/\./$script"
fi
