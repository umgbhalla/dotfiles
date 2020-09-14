#!/bin/sh

# template vars
while read -r template; do
  eval $DETEMPLATE $template
done < $XDG_CONFIG_HOME/templaterc

# set last redshift
$REDSHIFT "$(cat $REDSHIFT_LAST)"

$NOTIFICATION_MANAGER &

# shortcut manager
sxhkd &

$COMPOSITOR_ARGS &

$BACKGROUND &

$BAR_ARGS &

exec $WM
