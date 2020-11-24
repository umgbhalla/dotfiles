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
  h_padding="4"

  full="%{O$h_padding}"
  active="%{O$h_padding}"
  empty="%{O$h_padding}"

  volNum="0"

  case "$OS" in
    # just using the left channel
    "$OS_FREEBSD") volNum="$(mixer vol | grep -o '[^:]*$')" ;;
    "$OS_LINUX")
      if command -v "pulseaudio" >/dev/null; then
        volNum="$(pamixer --get-volume)"
      else
        volNum="$(amixer sget Master | tail -n 1 | cut -d " " -f 5)"
      fi
      ;;
  esac

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

SPACE_LEFT="%{B$BG}%{O$ICON_PADDING}%{O$ICON_PADDING}%{B-}\
%{O$ICON_PADDING}%{B$BG}%{O$ICON_PADDING}%{B-} "
SPACE_RIGHT=" %{B$BG}%{O$ICON_PADDING}%{B-}\
%{O$ICON_PADDING}%{B$BG}%{O$ICON_PADDING}%{O$ICON_PADDING}%{B-}"

echo "%{F$FG}%{l}${SPACE_LEFT}$LEFT%{c}$CENTER%{r}$RIGHT${SPACE_RIGHT}"
