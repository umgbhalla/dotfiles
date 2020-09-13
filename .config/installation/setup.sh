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

systemServices="$DIR/system"
DAEMONS="$DAEMONS $(sed 's/#.*$//' $systemServices)"

echo "enabling services..."
for service in $DAEMONS; do
  sudo systemctl enable $service
  sudo systemctl start $service
done

#
# suckless utilities
#

sucklessUtilities="$DIR/suckless"
SUCKLESS="$(sed 's/#.*$//' $sucklessUtilities)"

echo "building suckless utilities..."
for utility in $SUCKLESS; do
  $SBUILD $utility
done

#
# gtk theme
#

# git clone https://github.com/EliverLara/Nordic.git /tmp/Nordic
# sudo cp -r /tmp/Nordic /usr/share/themes

#
# music player
#

sudo chmod -Rv ${USER}:wheel /opt/spotify

# reset git config
GIT_CONFIG="$gcfg"
