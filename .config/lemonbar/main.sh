#!/bin/sh

# prevent multiple instances
if [ $(pgrep $BAR) ]; then
  echo "$BAR is already running."
  exit 1
fi

$XDG_CONFIG_HOME/lemonbar/modules.sh | $BAR -p \
  -g "${W_WIDTH}x14+${W_GAPS}+${W_GAPS}" \
  -f "-adobe-source code pro-medium-r-normal--0-0-0-0-m-0-iso8859-1" &
