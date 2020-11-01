#!/bin/sh

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

volume() {
  case $OS in
    $OS_FREEBSD)
      # just using the left channel
      volNum=$(mixer vol | awk '{print $NF}' | cut -d: -f1)

      unit=5

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
    *) echo -e "vol not yet implemented" ;;
  esac
}

battery() {
  case $OS in
    $OS_FREEBSD)
      bat=$(apm | awk '/Remaining battery/ {print $4;exit}')

      status=$(apm | awk '/Battery Status/ {print $3;exit}')
      if [ $status = "charging" ]; then status="c"
      else status="d"
      fi

      echo -e "${status} ${bat}"
      ;;
    *) echo -e "bat not yet implemented" ;;
  esac
}

clock() {
  echo -e $(date "+%a %h %d %H:%M")
}

LEFT="$(bspwm)"
CENTER=""
RIGHT="$(volume) $(battery) $(clock)"

echo "%{F$BAR_FG}%{l}$LEFT%{c}$CENTER%{r}$RIGHT"
