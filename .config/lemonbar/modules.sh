#!/bin/sh

SLEEP_TIME=30

bspwm() {
  ws=$(bspc query -D --names -d)
  case $ws in
    # TODO replace with icons
    I) echo -e "I Development" ;;
    II) echo -e "II Browsing" ;;
    III) echo -e "III Gaming" ;;
    IV) echo -e "IV Chat" ;;
    V) echo -e "V Media" ;;
    # ...
    IX) echo -e "IX News" ;;
    X) echo -e "X Music" ;;
    # *) ;;
  esac
}

network() {
  case $OS in
    *) echo -e "net not yet implemented" ;;
  esac
}

volume() {
  case $OS in
    $OS_FREEBSD)
      # just using the left channel
      vol=$(mixer vol | awk '{print $NF}' | cut -d: -f1)
      echo -e "vol ${vol}%"
      ;;
    *) echo -e "vol not yet implemented" ;;
  esac
}

battery() {
  case $OS in
    $OS_FREEBSD)
      echo -e "bat $(apm | awk '/Remaining battery/ {print $4;exit}')"
      ;;
    *) echo -e "bat not yet implemented" ;;
  esac
}

clock() {
  echo -e $(date "+%a %h %d %H:%M")
}

while :; do
  LEFT="$(bspwm)"
  CENTER=""
  RIGHT="$(network) $(volume) $(battery) $(clock)"

  echo -e "%{F$BAR_FG}%{l}$LEFT%{c}$CENTER%{r}$RIGHT"
  sleep $SLEEP_TIME &
  wait
done
