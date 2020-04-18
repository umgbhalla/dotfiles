#!/bin/sh

# shortcut manager
sxhkd &

# compositor
picom &

# status bar
$BAR_ARGS &

# window manager
exec bspwm

