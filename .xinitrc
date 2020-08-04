#!/bin/sh

#
# environment
#

# template vars
$XDG_SCRIPT_HOME/tui/detemplate $XDG_CONFIG_HOME/ranger/template.rc.conf

# set last redshift
$XDG_SCRIPT_HOME/tui/redshift "$(cat $REDSHIFT_LAST)"

# character input
# fcitx &

# notifications
envsubst < $XDG_CONFIG_HOME/dunst/template.dunstrc > $XDG_CONFIG_HOME/dunst/dunstrc && dunst &

#
# core programs 
#

# shortcut manager
sxhkd &

# compositor
picom --experimental-backends &

# status bar
$BAR_ARGS &

# window manager
exec bspwm

