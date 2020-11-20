#!/bin/sh

ICON_PADDING="7"
FG="$(xgetres "bar.foreground")"
BG="$(xgetres "bar.background")"

wm() {
  ws="$(bspc query -D --names -d)"
  title=""

  case "$ws" in
    "I")    title="%{O$ICON_PADDING}develop" ;;
    "II")   title="%{O$ICON_PADDING}browse " ;;
    "III")  title="%{O$ICON_PADDING}game   " ;;
    "IV")   title="%{O$ICON_PADDING}chat   " ;;
    "V")    title="%{O$ICON_PADDING}media  " ;;
    "IX")   title="%{O$ICON_PADDING}news   " ;;
    "X")    title="%{O$ICON_PADDING}music  " ;;
  esac

  title="$(echo "$title" | tr "[a-z]" "[A-Z]")"
  echo "%{B$BG} ${title} %{B-}"
}

capture() {
  [ -e "${TMP_DIR}/screenPid" ] && \
    echo "%{B$BG} %{F$LEMONBAR_ALERT}%{F$FG} %{B-}"
}

volume() {
  unit="5"

  full=""
  active=""
  empty=""

  h_padding="4"

  volNum="0"

  case "$OS" in
    # just using the left channel
    "$OS_FREEBSD") volNum="$(mixer vol | grep -o '[^:]*$')" ;;
    "$OS_LINUX") volNum="$(pamixer --get-volume)" ;;
  esac

  fullNum="$(echo "$volNum/$unit" | bc)"
  emptyNum="$(echo "100/$unit - $fullNum" | bc)"

  volFull="$(printf "%${fullNum}s" | awk "{gsub(/ /, \"${full}%{O$h_padding}\")};1")"
  volEmpty="$(printf "%${emptyNum}s" | awk "{gsub(/ /, \"${empty}%{O$h_padding}\")};1")"

  echo "%{B$BG} ${volFull}${active}%{O$h_padding}${volEmpty} %{B-}"
}

battery() {
  charging=""
  discharging=""

  case "$OS" in
    "$OS_FREEBSD")
      pow="$(apm)"

      bat="$(echo "$pow" | awk '/Remaining battery life/ {gsub("%","");print $4;exit}')"

      status="$(echo "$pow" | awk '/Battery Status/ {print $3;exit}')"
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
  capdatefmt="$(echo "$datefmt" | tr "[a-z]" "[A-Z]")"
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
