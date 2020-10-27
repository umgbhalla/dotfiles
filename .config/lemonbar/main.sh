#!/bin/sh

clock() {
  echo -e $(date "+%a %h %d %H:%M")
}

bar() {
  while true; do
    echo -e "%{F$BAR_FG}%{r}$(clock)"
    sleep 10
  done
}

bar | $BAR -p &
