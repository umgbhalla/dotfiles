#!/bin/sh

#
# install official repository packages
#

sudo pkg install bspwm sxhkd
sudo pkg install lemonbar
sudo pkg install picom
sudo pkg install hsetroot

sudo pkg install neovim node
sudo pkg install vifm
sudo pkg install firefox
sudo pkg install zathura zathura-pdf-mupdf
sudo pkg install htop
sudo pkg install neofetch

sudo pkg install redshift
sudo pkg install dunst
# sudo pkg install sourcecodepro-ttf

sudo pkg install xclip
sudo pkg install fzf

#
# suckless utilities
#

$SBUILD st
