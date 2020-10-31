#!/bin/sh

TMP_DIR=/tmp

#
# install official repository packages
#

sudo pkg install bspwm sxhkd

git clone https://github.com/krypt-n/bar.git $TMP_DIR/lemonbar-xft
cp -f $XDG_CONFIG_HOME/lemonbar/Makefile $TMP_DIR/lemonbar-xft/
cd $TMP_DIR/lemonbar-xft
sudo gmake clean install

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
sudo pkg install feh

#
# suckless utilities
#

$SBUILD st
