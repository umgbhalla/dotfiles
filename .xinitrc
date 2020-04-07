#!/bin/sh

# load xresources
xrdb $HOME/.config/Xresources

# auto brightness manager
clight --frames=20

# window manager
exec bspwm
