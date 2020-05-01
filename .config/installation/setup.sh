#!/bin/sh

DIR="$(dirname $0)"
CFG="$XDG_CONFIG_HOME"

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
yay -S --needed $PACKS

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
  cd "$CFG/$utility"
  sudo make clean install
done
