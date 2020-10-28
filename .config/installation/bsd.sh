#!/bin/sh

#
# install official repository packages
#

sudo pkg install bspwm sxhkd
sudo pkg install lemonbar

sudo pkg install sourcecodepro-ttf
sudo cp /usr/local/share/fonts/SourceCodePro/*.ttf /usr/local/share/fonts/TTF/
cat /usr/local/share/fonts/SourceCodePro/fonts.dir | sudo tee -a /usr/local/share/fonts/TTF/fonts.dir
cat /usr/local/share/fonts/SourceCodePro/fonts.scale | sudo tee -a /usr/local/share/fonts/TTF/fonts.scale
xset fp rehash

sudo pkg install picom
sudo pkg install hsetroot

sudo pkg install neovim node ripgrep
sudo pkg install vifm
sudo pkg install firefox
sudo pkg install zathura zathura-pdf-mupdf
sudo pkg install htop
sudo pkg install neofetch

sudo pkg install redshift
sudo pkg install dunst

sudo pkg install xclip
sudo pkg install fzf

#
# suckless utilities
#

$SBUILD st
