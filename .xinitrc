#!/bin/sh

#
# environment settings
#

# redshift
$XDG_SCRIPT_HOME/tui/redshift "$(cat $REDSHIFT_LAST)"

#
# core programs 
#

# notifications
envsubst < $XDG_CONFIG_HOME/dunst/template.dunstrc > $XDG_CONFIG_HOME/dunst/dunstrc && dunst &

# shortcut manager
sxhkd &

# compositor
picom --experimental-backends &

# status bar
$BAR_ARGS &

# window manager
exec bspwm

