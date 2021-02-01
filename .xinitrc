#!/bin/sh

# set last redshift
rshift set "$(cat $REDSHIFT_LAST)" &

# init compositor
$COMPOSITOR_ARGS &

# init bar
$BAR_ARGS &

# theming
stheme "dark" &

# shortcut manager
sxhkd &

# input method editor
# fcitx &

exec "$WM"
