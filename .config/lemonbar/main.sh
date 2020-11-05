#!/bin/sh

MAX_SLEEP_TIME="30"

# prevent multiple instances
if [ $(pgrep "$BAR") ]; then
  echo "$BAR is already running."
  exit 1
fi

# create named pipe for input
[ -e "$BAR_FIFO" ] && rm "$BAR_FIFO"
mkfifo "$BAR_FIFO"

# generate initial input
while :; do
  "$BAR_UPDATE" &
  sleep "$MAX_SLEEP_TIME"
done &

# start bar and listen to input pipe
while cat "$BAR_FIFO"; do :; done | \
  "$BAR" \
  -p \
  -g "${W_WIDTH}x${BAR_HEIGHT}+${W_GAPS}+${W_GAPS}" \
  -f "${LEMONBAR_FONT}" \
  -f "Automata:pixelsize=28" \
  &
