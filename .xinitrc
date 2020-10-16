#!/bin/sh

# template vars
while read -r template; do
  eval $DETEMPLATE $template
done < $XDG_CONFIG_HOME/templaterc

# Gtk theme
cd $HOME/.themes/DotfilesGtk && yarn build && cd

# Xresource colors
xrdb -merge $XDG_CONFIG_HOME/Xresources

# set last redshift
$REDSHIFT "$(cat $REDSHIFT_LAST)"

$NOTIFICATION_MANAGER &

# shortcut manager
sxhkd &

$COMPOSITOR_ARGS &

$BACKGROUND &

$BAR_ARGS &

exec $WM
