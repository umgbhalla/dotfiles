#!/bin/sh

#
# environment
#

# template vars
$DETEMPLATE $XDG_CONFIG_HOME/picom/template.picom.conf 
$DETEMPLATE $XDG_CONFIG_HOME/dunst/template.dunstrc 
$DETEMPLATE $XDG_CONFIG_HOME/ranger/template.rc.conf
$DETEMPLATE $XDG_CONFIG_HOME/zathura/template.zathurarc

# set last redshift
$REDSHIFT "$(cat $REDSHIFT_LAST)"

$NOTIFICATION_MANAGER &

#
# core programs 
#

# shortcut manager
sxhkd &

$COMPOSITOR_ARGS &

$BACKGROUND &

$BAR_ARGS &

exec $WM
