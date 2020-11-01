#!/bin/sh

bspwm() {
  ws=$(bspc query -D --names -d)
  case $ws in
    # TODO replace with icons
    I) echo " Development" ;;
    II) echo " Browsing" ;;
    III) echo " Gaming" ;;
    IV) echo -e " Chat" ;;
    V) echo -e " Media" ;;
    # ...
    IX) echo -e " News" ;;
    X) echo -e " Music" ;;
    # *) ;;
  esac
}

volume() {
  unit="5"

  full=""
  active=""
  empty=""

  case "$OS" in
    "$OS_FREEBSD")
      # just using the left channel
      volNum=$(mixer vol | awk '{print $NF}' | cut -d: -f1)


      fullNum=$(echo "$volNum/$unit" | bc)
      emptyNum=$(echo "100/$unit - $fullNum" | bc)

      vol=""

      n=0
      while [ "$n" -lt $fullNum ]; do
        vol="${vol}x"
        n=$(( n + 1 ))
      done

      vol="${vol}l"

      n=0
      while [ "$n" -lt $emptyNum ]; do
        vol="${vol}-"
        n=$(( n + 1 ))
      done

      echo -e "${vol}"
      ;;
    "$OS_LINUX")
      volNum="$(pulseaudio-ctl full-status | awk '{print $1}')"

      fullNum="$(echo "$volNum/$unit" | bc)"
      emptyNum="$(echo "100/$unit - $fullNum" | bc)"

      vol=""

      n=0
      while [ "$n" -lt "$fullNum" ]; do
        vol="${vol}${full}"
        n=$(( n + 1 ))
      done

      vol="${vol}${active}"

      n=0
      while [ "$n" -lt "$emptyNum" ]; do
        vol="${vol}${empty}"
        n=$(( n + 1 ))
      done

      echo "${vol}"
      ;;
    *) echo -e "vol not yet implemented" ;;
  esac
}

battery() {
  case "$OS" in
    "$OS_FREEBSD")
      bat=$(apm | awk '/Remaining battery/ {print $4;exit}')

      status=$(apm | awk '/Battery Status/ {print $3;exit}')
      if [ $status = "charging" ]; then status="c"
      else status="d"
      fi

      echo -e "${status} ${bat}"
      ;;
    "$OS_LINUX") ;;
    *) echo -e "bat not yet implemented" ;;
  esac
}

clock() {
  echo " $(date "+%a %h %d %H:%M")"
}

LEFT="$(bspwm)"
CENTER=""
RIGHT="$(volume) $(battery) $(clock)"

echo "%{F$BAR_FG}%{l}$LEFT%{c}$CENTER%{r}$RIGHT"
