#!/bin/sh

# template vars
while read -r template; do
  eval "$DETEMPLATE $template"
done < "$XDG_CONFIG_HOME/templaterc"

# gtk theme
cd "$GTK_THEME_DIR/$THEME" && yarn && yarn build &

# Xresource colors
# do NOT background; apps may not get updated resources
$XRDB_UPDATE

# set last redshift
"$REDSHIFT" set "$(cat $REDSHIFT_LAST)" &

# shortcut manager
sxhkd &

# music server
killall mpd; mpd &

$COMPOSITOR_ARGS &

$BACKGROUND &

$BAR_ARGS &

# pulseaudio -D

# $SWITCHTHEME "time" &

exec "$WM"
