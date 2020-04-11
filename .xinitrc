#!/bin/sh

# shortcut manager
sxhkd &

# compositor
picom & 

# window manager
exec bspwm

