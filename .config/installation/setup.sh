#!/bin/sh

DIR="$(dirname $0)"

# unset git config to prevent yay errors
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
  sudo make clean install
done

#
# login prompt eyecandy
#

echo "customizing login prompt..."
yay -S --needed figlet
echo "$(cat /etc/hostname | figlet -k)" | { sed 's/\\/\\\\/g'; echo "(\l) \\s \\\r\n" } | sudo tee /etc/issue > /dev/null
