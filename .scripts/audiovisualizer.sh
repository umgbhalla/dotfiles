#!/bin/bash

case "$1" in
  on)
    swaymsg "gaps bottom all set 64"
    # only start glava if no instance exists
    pgrep glava >/dev/null || glava
    ;;
  off)
    swaymsg "gaps bottom all set 0"
    kill -9 $(pgrep glava)
    ;;
esac
