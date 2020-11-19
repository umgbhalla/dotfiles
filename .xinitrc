#!/bin/sh

# template vars
while read -r template; do
  eval "$DETEMPLATE $template"
done < "$XDG_CONFIG_HOME/templaterc"

# Xresource colors
# do NOT background; apps may not get updated resources
$XRDB_UPDATE

# set last redshift
"$REDSHIFT" set "$(cat $REDSHIFT_LAST)" &

# shortcut manager
sxhkd &

$COMPOSITOR_ARGS &

$BACKGROUND &

$BAR_ARGS &

# pulseaudio -D

$SWITCHTHEME "time" &

exec "$WM"
