#!/bin/sh

# load xresources
xrdb $HOME/.config/Xresources

# window manager
exec bspwm
