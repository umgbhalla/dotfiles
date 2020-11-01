#!/bin/sh

# prevent multiple instances
if [ $(pgrep $BAR) ]; then
  echo "$BAR is already running."
  exit 1
fi

$XDG_CONFIG_HOME/lemonbar/modules.sh | $BAR -p \
  -n "lemonbar-dock" \
  -g "${W_WIDTH}x14+${W_GAPS}+${W_GAPS}" \
  -f "Source Code Pro" \
  &
# xdo lower -a lemonbar-dock
