#!/bin/sh

ICON_PADDING="7"
FG="$(xgetres bar.foreground || "${BAR_FG}")"
BG="$(xgetres bar.background || "${BAR_BG}")"

wm() {
  ws="$(bspc query -D --names -d)"
  title=""

  case $ws in
    I) title="%{O$ICON_PADDING}develop" ;;
    II) title="%{O$ICON_PADDING}browse " ;;
    III) title="%{O$ICON_PADDING}game   " ;;
    IV) title="%{O$ICON_PADDING}chat   " ;;
    V) title="%{O$ICON_PADDING}media  " ;;
    IX) title="%{O$ICON_PADDING}news   " ;;
    X) title="%{O$ICON_PADDING}music  " ;;
  esac

  title="$(echo "$title" | awk '{print toupper($0)}')"
  echo "%{B$BG} ${title} %{B-}"
}

capture() {
  if [ -n "${SCREEN}" ] && \
  [ "$(${SCREEN} recording-status)" = "recording" ]; then
    echo "%{B$BG} %{F$LEMONBAR_ALERT}%{F$FG} %{B-}"
  fi
}

volume() {
  unit="5"

  full=""
  active=""
  empty=""

  v_padding="4"

  volNum="0"

  case "$OS" in
    # just using the left channel
    "$OS_FREEBSD") volNum="$(mixer vol | awk '{print $NF}' | cut -d: -f1)" ;;
    "$OS_LINUX") volNum="$(pamixer --get-volume)" ;;
  esac

  fullNum="$(echo "$volNum/$unit" | bc)"
  emptyNum="$(echo "100/$unit - $fullNum" | bc)"

  vol=""

  n="0"
  while [ "$n" -lt "$fullNum" ]; do
    vol="${vol}${full}%{O$v_padding}"
    n="$(( n + 1 ))"
  done

  vol="${vol}${active}%{O$v_padding}"

  n="0"
  while [ "$n" -lt "$emptyNum" ]; do
    vol="${vol}${empty}%{O$v_padding}"
    n="$(( n + 1 ))"
  done

  echo "%{B$BG} ${vol} %{B-}"
}

battery() {
  charging=""
  discharging=""

  case "$OS" in
    "$OS_FREEBSD")
      bat="$(apm | awk '/Remaining battery/ {gsub("%","");print $4;exit}')"

      status="$(apm | awk '/Battery Status/ {print $3;exit}')"
      if [ "$status" = "charging" ]; then status="$charging"
      else status="$discharging"
      fi

      echo "%{B$BG} ${status}%{O$ICON_PADDING}${bat} %{B-}"
      ;;
    "$OS_LINUX")
      bat="$(cat "/sys/class/power_supply/BAT0/capacity" 2>/dev/null)"

      if [ -n "$bat" ]; then
        status="$(cat "/sys/class/power_supply/BAT0/status")"
        if [ "$status" = "Charging" ]; then status="$charging"
        else status="$discharging"
        fi
        echo "%{B$BG} ${status}%{O$ICON_PADDING}${bat} %{B-}"
      fi
      ;;
    *) echo "bat not yet implemented" ;;
  esac
}

clock() {
  datefmt="$(date "+%m.%d %a %H:%M")"
  capdatefmt="$(echo "$datefmt" | awk '{print toupper($0)}')"
  echo "%{B$BG} %{O$ICON_PADDING}${capdatefmt} %{B-}"
}

LEFT="$(wm)"
CENTER=""
RIGHT="$(capture) $(volume) $(battery) $(clock)"

SPACE_LEFT="%{B$BG}%{O$ICON_PADDING}%{O$ICON_PADDING}%{B-}\
%{O$ICON_PADDING}%{B$BG}%{O$ICON_PADDING}%{B-} "
SPACE_RIGHT=" %{B$BG}%{O$ICON_PADDING}%{B-}\
%{O$ICON_PADDING}%{B$BG}%{O$ICON_PADDING}%{O$ICON_PADDING}%{B-}"

echo "%{F$FG}%{l}${SPACE_LEFT}$LEFT%{c}$CENTER%{r}$RIGHT${SPACE_RIGHT}"
