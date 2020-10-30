#!/bin/sh

SLEEP_TIME=30

bspwm() {
  echo -e $(bspc query -D --names -d)
}

battery() {
  echo -e $(apm | awk '/Remaining battery/ {print $4;exit}')
}

clock() {
  echo -e $(date "+%a %h %d %H:%M")
}

while :; do
  LEFT="$(bspwm)"
  CENTER=""
  RIGHT="$(battery) $(clock)"

  echo -e "%{F$BAR_FG}%{l}$LEFT%{c}$CENTER%{r}$RIGHT"
  sleep $SLEEP_TIME &
  wait
done
