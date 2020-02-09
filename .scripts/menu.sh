#!/bin/bash
urxvt -e bash -c "ls /usr/bin | fzf | xargs -r swaymsg -t command exec"
