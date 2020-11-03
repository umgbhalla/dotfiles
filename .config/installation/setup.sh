#!/bin/sh

DIR="$(dirname $0)/packages"

# unset git config to prevent yay errors
gcfg="$GIT_CONFIG"
unset GIT_CONFIG

#
# install official repository packages
#

official="$DIR/official"
PACKS="$(sed 's/#.*$//' $official)"

echo "installing official repository packages..."
sudo pacman -S --needed $PACKS

#
# install AUR packages
#

aur="$DIR/aur"
PACKS="$(sed 's/#.*$//' $aur)"

echo "installing AUR packages..."
yay -S --needed --batchinstall $PACKS

#
# enable any services
#

echo "enabling services..."
sudo systemctl enable tlp
sudo systemctl start tlp

#
# suckless utilities
#

echo "building suckless utilities..."

$SBUILD st

#
# gtk theme
#

sudo ln -sf "$XDG_CONFIG_HOME/$THEME" "$GTK_THEME_DIR/$THEME"
cd "$GTK_THEME_DIR/$THEME" && yarn && yarn build &

#
# music player
#

# sudo chown -Rv ${USER}:wheel /opt/spotify

#
# fonts
#

FONT_DIR=$XDG_DATA_HOME/fonts

mkdir -p $FONT_DIR
cp -v $XDG_CONFIG_HOME/fonts/* $FONT_DIR/
fc-cache -f -v

# reset git config
GIT_CONFIG="$gcfg"
