#!/bin/sh

SLEEP_TIME=30

bspwm() {
  echo -e $(bspc query -D --names)
}

battery() {
  echo -e $(apm | awk '/Remaining battery/ {print $4;exit}')
}

clock() {
  echo -e $(date "+%a %h %d %H:%M")
}

modules() {
  while true; do
    LEFT="$(bspwm)"
    CENTER=""
    RIGHT="$(battery) $(clock)"

    echo -e "%{F$BAR_FG}%{l}$LEFT%{c}$CENTER%{r}$RIGHT"
    sleep $SLEEP_TIME
  done
}

modules | $BAR -p \
  -g "${W_WIDTH}x14+${W_GAPS}+${W_GAPS}" \
  -f "-adobe-source code pro-medium-r-normal--0-0-0-0-m-0-iso8859-1"
