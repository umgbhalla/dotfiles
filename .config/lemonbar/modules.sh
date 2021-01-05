#!/bin/sh

ICON_PADDING="7"
FG="$(getxr theme.fg || echo "$BAR_FG")"
BG=""

wm() {
  ws="$(bspc query -D --names -d)"
  title=""

  case "$ws" in
    "I")        title="%{O$ICON_PADDING}DEVELOP" ;;
    "II")       title="%{O$ICON_PADDING}BROWSE " ;;
    "III")      title="%{O$ICON_PADDING}GAME   " ;;
    "IV")       title="%{O$ICON_PADDING}CHAT   " ;;
    "V")        title="%{O$ICON_PADDING}MEDIA  " ;;
    "VI")       title="%{O$ICON_PADDING}HDMI1  " ;;
    "VII")      title="%{O$ICON_PADDING}HDMI2  " ;;
    "VIII")     title="%{O$ICON_PADDING}HDMI3  " ;;
    "IX")       title="%{O$ICON_PADDING}NEWS   " ;;
    "X")        title="%{O$ICON_PADDING}MUSIC  " ;;
  esac

  echo "%{B$BG} ${title} %{B-}"
}

capture() {
  [ -e "${TMP_DIR}/screenPid" ] && \
    echo "%{B$BG} %{F$LEMONBAR_ALERT}%{F$FG} %{B-}"
}

volume() {
  unit="5"
  h_padding="4"

  full="%{O$h_padding}"
  active="%{O$h_padding}"
  empty="%{O$h_padding}"

  volNum="$(audio vol get)"

  fullNum="$(( ${volNum}/${unit} ))"
  emptyNum="$(( 100/${unit} - ${fullNum} ))"

  volFull="$(printf "%${fullNum}s" | sed "s/ /${full}/g")"
  volEmpty="$(printf "%${emptyNum}s" | sed "s/ /${empty}/g")"

  echo "%{B$BG} %{O$h_padding}${volFull}${active}${volEmpty} %{B-}"
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
    "$OS_OPENBSD")
      pow="$(apm)"

      bat="$(echo "$pow" | awk '/Battery state/ {gsub("%","");print $4;exit}')"

      status="$(echo "$pow" | awk '/A\/C adapter state/ {print $4}')"
      if [ "$status" = "connected" ]; then status="$charging"
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
  esac
}

clock() {
  datefmt="$(date "+%m.%d %a %H:%M" | tr "[a-z]" "[A-Z]")"
  echo "%{B$BG} %{O$ICON_PADDING}${datefmt} %{B-}"
}

LEFT="$(wm)"
CENTER=""
RIGHT="$(capture) $(volume) $(battery) $(clock)"

SPACE_LEFT=""
SPACE_RIGHT=""

echo "%{F$FG}%{l}${SPACE_LEFT}$LEFT%{c}$CENTER%{r}$RIGHT${SPACE_RIGHT}"
