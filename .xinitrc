#!/bin/sh

#
# environment
#

# template vars
$DETEMPLATE $XDG_CONFIG_HOME/ranger/template.rc.conf
$DETEMPLATE $XDG_CONFIG_HOME/zathura/template.zathurarc

# set last redshift
$REDSHIFT "$(cat $REDSHIFT_LAST)"

# notifications
$DETEMPLATE $XDG_CONFIG_HOME/dunst/template.dunstrc && dunst &

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

