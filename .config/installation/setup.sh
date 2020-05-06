#!/bin/sh

DIR="$(dirname $0)"

# unset git config to prevent yay errors
gcfg="$GIT_CONFIG"
unset GIT_CONFIG

#
# install official repository packages
#

PACKS="git"
for file in $DIR/official/*; do
  PACKS="$PACKS $(sed 's/#.*$//' $file)"
done

echo "installing official repository packages..."
sudo pacman -S --needed $PACKS

#
# install AUR packages
#

PACKS=""
for file in $DIR/aur/*; do
  PACKS="$PACKS $(sed 's/#.*$//' $file)"
done

# verify yay is installed
if ! pacman -Qi yay > /dev/null; then
  git clone https://aur.archlinux.org/yay.git /tmp/yay
  cd /tmp/yay && makepkg -si
fi

echo "installing AUR packages..."
yay -S --needed --batchinstall $PACKS

#
# enable any services
#

DAEMONS=""
for file in $DIR/system/*; do
  DAEMONS="$DAEMONS $(sed 's/#.*$//' $file)"
done

echo "enabling services..."
for service in $DAEMONS; do
  sudo systemctl enable $service
  sudo systemctl start $service
done

#
# suckless utilities
#

SUCKLESS=""
for file in $DIR/suckless/*; do
  SUCKLESS="$SUCKLESS $(sed 's/#.*$//' $file)"
done

echo "building suckless utilities..."
for utility in $SUCKLESS; do
  cd "$HOME/.config/$utility"
  envsubst < template.config.h > config.h
  sudo make clean install
done

#
# gtk theme
#

git clone https://github.com/EliverLara/Nordic.git /tmp/Nordic
sudo cp -r /tmp/Nordic /usr/share/themes

# reset git config
GIT_CONFIG="$gcfg"
