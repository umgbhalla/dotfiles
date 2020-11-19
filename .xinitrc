#!/bin/sh

# set last redshift
"$REDSHIFT" set "$(cat $REDSHIFT_LAST)" &

# init compositor
$COMPOSITOR_ARGS

# init bar
$BAR_ARGS &

# theming
$SETTHEME "time" &

# shortcut manager
sxhkd &

exec "$WM"
