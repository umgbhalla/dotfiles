#!/bin/sh

ICON_PADDING="7"
FG="$C_BLACK_0"

wm() {
  ws="$(bspc query -D --names -d)"
  title=""

  case "$ws" in
    "I")        title="%{O${ICON_PADDING}}DEVELOP" ;;
    "II")       title="%{O${ICON_PADDING}}BROWSE " ;;
    "III")      title="%{O${ICON_PADDING}}GAME   " ;;
    "IV")       title="%{O${ICON_PADDING}}CHAT   " ;;
    "V")        title="%{O${ICON_PADDING}}MEDIA  " ;;
    "VI")       title="%{O${ICON_PADDING}}HDMI1  " ;;
    "VII")      title="%{O${ICON_PADDING}}HDMI2  " ;;
    "VIII")     title="%{O${ICON_PADDING}}HDMI3  " ;;
    "IX")       title="%{O${ICON_PADDING}}NEWS   " ;;
    "X")        title="%{O${ICON_PADDING}}MUSIC  " ;;
  esac

  echo " ${title} "
}

capture() {
  [ -e "${TMPDIR}/screenPid" ] && \
    echo " %{F${LEMONBAR_ALERT}}%{F${FG}} "
}

volume() {
  unit="5"
  h_padding="4"

  full="%{O${h_padding}}"
  active="%{O${h_padding}}"
  empty="%{O${h_padding}}"

  volNum="$(audio vol get)"

  fullNum="$(( ${volNum}/${unit} ))"
  emptyNum="$(( 100/${unit} - ${fullNum} ))"

  [ $fullNum -ne 0 ] && volFull="$(printf "%${fullNum}s" | sed "s/ /${full}/g")"
  volEmpty="$(printf "%${emptyNum}s" | sed "s/ /${empty}/g")"

  echo " %{O${h_padding}}${volFull}${active}${volEmpty} "
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

      echo " ${status}%{O${ICON_PADDING}}${bat} "
      ;;
    "$OS_OPENBSD")
      pow="$(apm)"

      bat="$(echo "$pow" | awk '/Battery state/ {gsub("%","");print $4;exit}')"

      status="$(echo "$pow" | awk '/A\/C adapter state/ {print $4}')"
      if [ "$status" = "connected" ]; then status="$charging"
      else status="$discharging"
      fi

      echo " ${status}%{O${ICON_PADDING}}${bat} "
      ;;
    "$OS_LINUX")
      bat="$(cat "/sys/class/power_supply/BAT0/capacity" 2>/dev/null)"

      if [ -n "$bat" ]; then
        status="$(cat "/sys/class/power_supply/BAT0/status")"
        if [ "$status" = "Charging" ]; then status="$charging"
        else status="$discharging"
        fi
        echo " ${status}%{O${ICON_PADDING}}${bat} "
      fi
      ;;
  esac
}

clock() {
  datefmt="$(date "+%m.%d %a %H:%M" | tr "[a-z]" "[A-Z]")"
  echo " %{O${ICON_PADDING}}${datefmt} "
}

LEFT="$(wm)"
CENTER=""
RIGHT="$(capture) $(volume) $(battery) $(clock)"

echo "%{F${FG}}%{l}${LEFT}%{c}${CENTER}%{r}${RIGHT}"
