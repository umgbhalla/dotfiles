#!/bin/bash

control=$(pulseaudio-ctl full-status)
mute=$(echo $control | awk '{ print $2 }')
micmute=$(echo $control | awk '{ print $3 }')
AUD=$(echo $control | awk '{ print $1 }')

if [ $mute == "no" ]; then
  if (($AUD >= 50)); then
    vol=
  elif (($AUD >= 30 && $AUD < 50)); then
    vol=
  else
    vol=
  fi
else
  vol=
fi

if [ $micmute == "no" ]; then
  mic=
else
  mic=
fi

echo $mic $vol $AUD%
echo $mic $vol $AUD%

if (($AUD >= 65 && $AUD < 85)); then
  echo "$2"
elif (($AUD >= 85)); then
  echo "$3"
fi
