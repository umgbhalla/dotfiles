#!/bin/sh

TMP_DIR=/tmp

#
# install official repository packages
#

# devel
sudo pkg install cmake meson

sudo pkg install bspwm sxhkd

# required for lemonbar to render under bspwm
git clone https://github.com/baskerville/xdo.git $TMP_DIR/xdo
cd $TMP_DIR/xdo
git checkout 688f10fda07ec36a3295b15c3191b6a203738c09
cp -f $XDG_CONFIG_HOME/xdo/Makefile $TMP_DIR/xdo/
sudo make clean install

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

sudo pkg install gettext # required by zathura
git clone https://git.pwmt.org/pwmt/girara.git $TMP_DIR/girara/
cd $TMP_DIR/girara
git checkout 1b60a46481f6ba37e7515ca80d6f627583f7100f
meson build
cd build
ninja
sudo ninja install
git clone https://git.pwmt.org/pwmt/zathura.git $TMP_DIR/zathura-git
cd $TMP_DIR/zathura-git
git checkout 02a8877f771b3af4c5a8758ded756aae7f469dcb
meson build
cd build
ninja
sudo ninja install
sudo pkg install zathura-pdf-mupdf # required for any document viewing

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
