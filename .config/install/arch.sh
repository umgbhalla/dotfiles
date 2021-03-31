#!/bin/sh

#
# setup
#

PREFIX="/usr/local"
BIN="${PREFIX}/bin"

PKGS=""
PKGSA=""
AUR=""

mkdir -p "$TMPDIR"
mkdir -p "$XDG_CACHE_HOME"
mkdir -p "$OPT_DIR"

#
# dependencies
#

# required by coc.nvim
PKGS="${PKGS} npm"

#
# core
#

# yay package management
git clone "https://aur.archlinux.org/yay-bin.git" "${TMPDIR}/yay"
cd "${TMPDIR}/yay" && makepkg -si

# documentation
PKGS="${PKGS} man"
# editor
PKGS="${PKGS} neovim ripgrep nodejs npm fzf"
# archives
PKGS="${PKGS} unzip"
# development languages
PKG="${PKGS} python"

#
# Xorg
#

# xorg
PKGS="${PKGS} xorg-server xorg-xinit"
PKGS="${PKGS} xf86-video-intel"
# wm
PKGS="${PKGS} bspwm sxhkd"
# terminal font
PKGS="${PKGS} libxft"
# fonts
PKGS="${PKGS} ttf-liberation adobe-source-code-pro-fonts wqy-zenhei"
# browser
PKGS="${PKGS} firefox"
# image viewer
PKGS="${PKGS} feh"
# screenshot utilities
PKGS="${PKGS} slop xdotool"
# redshift
PKGS="${PKGS} redshift"
# file manager
PKGS="${PKGS} vifm"
# compositor (fork installed below)
# PKGS="${PKGS} picom"
# display utils
PKGS="${PKGS} xorg-xsetroot"
PKGS="${PKGS} xorg-xsetroot"
# mouse/touchpad control
PKGS="${PKGS} xorg-xinput"
# clipboard
PKGS="${PKGS} xclip"
# ssh
PKGS="${PKGS} openssh"
# email client
# PKGS="${PKGS} neomutt"
# contact management
PKGS="${PKGS} abook"
# media player
PKGS="${PKGS} mpv"
PKGS="${PKGS} youtube-dl"
# rss reader
PKGS="${PKGS} newsboat"
# pdf viewer utility
PKGS="${PKGS} zathura girara zathura-pdf-mupdf"
# wifi - still don't have a good alternative editor here
PKGS="${PKGS} nm-connection-editor"

# dipslay utility
PKGS="${PKGS} xorg-xev"

# media manipulation
PKGS="${PKGS} ffmpeg"
# PKGS="${PKGS} mp3splt"
# PKGS="${PKGS} kdenlive breeze"
# image manipulation
# PKGS="${PKGS} gimp inkscape"

# dipslay pressed keys
PKGS="${PKGS} screenkey"

PKGS="${PKGS} alsa-utils"
# optional - pulseaudio
PKGS="${PKGS} pulseaudio pulseaudio-alsa pamixer pavucontrol"
PKGS="${PKGS} mpd ncmpcpp"

# tuning power consumption
PKGS="${PKGS} tlp brightnessctl"

# doc conversion (specifically, md to html)
# used for vim markdown previews
PKGS="${PKGS} pandoc"
# latex
# PKGS="${PKGS} texlive-most biber"
PKGS="${PKGS} texlive-most"
# dev tools for work/school/projects
# TODO python2 is required by node-sass.
# Remove when phased out of new versions
PKGS="${PKGS} nodejs deno yarn python2"

# gtk theme
PKGS="${PKGS} adapta-gtk-theme"
PKGS="${PKGS} ttf-roboto"

# various utilities/tools
PKGS="${PKGS} wget"

# firefox extensions
PKGS="${PKGS} firefox-tridactyl"

# torrents
PKGS="${PKGS} aria2"

# who doesn't like nethack?
PKGS="${PKGS} nethack"

# AUR="${AUR} mmv"

# status bar
AUR="${AUR} polybar"

# compositor fork with dual kawase and blur
AUR="${AUR} picom-ibhagwan-git"

# firefox extensions
AUR="${AUR} firefox-tridactyl-native"
AUR="${AUR} firefox-ublock-origin"
AUR="${AUR} firefox-extension-multi-account-containers"

# spotify
AUR="${AUR} spotify"
AUR="${AUR} ncspot"

# animated wallpaper eyecandy
AUR="${AUR} xwinwrap-git"

# system reporter
AUR="${AUR} pfetch"

# streaming/recording/video manipulation
# AUR="${AUR} obs-studio-git" # git version for latest loopback update
# PKGS="${PKGS} linux-headers dkms"
# PKGSA="${PKGSA} v4l2loopback-dkms" # if not already installed

# Unity development
# https://chrislabarge.com/posts/neovim-unity-engine/
# if there are still issues finding mono, set the following props
# "omnisharp.useGlobalMono": "always"
# "omnisharp.monoPath": "/usr/bin/mono"
# AUR="${AUR} unityhub"
# AUR="${AUR} mono-basic" # probably don't need this
# PKGS="${PKGS} mono"
# PKGS="${PKGS} dotnet-runtime dotnet-sdk" # probably don't need this
# PKGS="${PKGS} code" # probably don't need this (eventually)

#
# installation
#

sudo pacman -S --needed $PKGS # cannot be quoted

# unmute audio channel
amixer sset Master unmute

# enable power saving
sudo systemctl enable --now tlp

yay -S --batchinstall --needed --nocleanmenu --nodiffmenu --noprovides $AUR # cannot be quoted

# after
sudo pacman -S --needed $PKGSA # cannot be quoted

# firefox profile
mkdir -p "${HOME}/.mozilla"
ln -sf "${XDG_CONFIG_HOME}/mozilla/firefox" "${HOME}/.mozilla/firefox"

# spotify with spicetify
sudo chmod a+wr "${OPT_DIR}/spotify"
sudo chmod a+wr "${OPT_DIR}/spotify/Apps" -R
yay -S --needed --nocleanmenu --nodiffmenu --noprovides spicetify-cli

# xresources
cd "${XDG_CONFIG_HOME}/getxr"
sudo make clean install

# relink /bin/sh
sudo ln -sf mksh /bin/sh

# suckless
sbuild "st"
sbuild "herbe"
sbuild "slock"

# swallowing windows
git clone "https://github.com/salman-abedin/devour.git" "${TMPDIR}/devour"
cd "${TMPDIR}/devour"
git checkout f1630794f0a6e96377373e8c1629ffa76f9b6cf4
sudo make install

# until ncpamixer proves itself to work without segfaulting, alsamixer works just fine...
# git clone "https://github.com/bossley9/ncpamixer.git" "${TMPDIR}/ncpamixer"
# cd "${TMPDIR}/ncpamixer"
# sudo make install

# rustup - required for ytui, eww
curl --proto '=https' -sSf "https://sh.rustup.rs" | sh

# alsamixer
git clone "https://github.com/bossley9/alsamixer.git" "${TMPDIR}/alsamixer"
cd "${TMPDIR}/alsamixer"
sudo make clean install

# contact management
# git clone "https://github.com/bossley9/abook.git" "${TMPDIR}/abook"
# cd "${TMPDIR}/abook"
# ./configure
# sudo make clean install

# ytui
cd "${XDG_CONFIG_HOME}/ytui"
sudo make clean install

# eww (widgets)
# git clone "https://github.com/elkowar/eww" "${TMPDIR}/eww"
# cd "${TMPDIR}/eww"
# cargo build --release
# cd "target/release"
# chmod +x "eww"
# mv "eww" "${XDG_SCRIPT_HOME}/"

# system profiler
git clone "https://github.com/bossley9/htop.git" "${TMPDIR}/htop"
cd "${TMPDIR}/htop"
./autogen.sh
./configure
sudo make clean install

SYSD="/etc/systemd"

# logind/power events
sudo mkdir -p "${SYSD}"
sudo cp "${XDG_CONFIG_HOME}${SYSD}/logind.conf" "${SYSD}/logind.conf"

# slock
SYSDSYS="${SYSD}/system"
sudo mkdir -p "${SYSDSYS}"
DISPLAY=:0 det "${XDG_CONFIG_HOME}${SYSDSYS}/template.slock@.service"
sudo ln -sf "${XDG_CONFIG_HOME}${SYSDSYS}/slock@.service" "${SYSDSYS}/slock@.service"
sudo systemctl enable "slock@${USER}.service"

# gtk theme
sudo mkdir -p "$GTK_THEME_DIR"
sudo ln -sf "${XDG_CONFIG_HOME}/${THEME}" "${GTK_THEME_DIR}/${THEME}"

# font(s)
mkdir -p "$FONT_DIR"
cp -v $XDG_CONFIG_HOME/fonts/* "$FONT_DIR/"
fc-cache -f -v

# touchpad
sudo ln -sf "$XDG_CONFIG_HOME/xorg.conf.d/30-touchpad.conf" "/etc/X11/xorg.conf.d/30-touchpad.conf"

# add color to /etc/pacman.conf
sudo sed -i 's/#Color/Color/' /etc/pacman.conf

# update grub config
# timeout
sudo sed -i 's/GRUB_TIMEOUT=.*/GRUB_TIMEOUT=0/' "/etc/default/grub"
# background
# sudo cp "${XDG_DATA_HOME}/wallpapers/grub.png" "/boot/grub/"
# sudo sed -i 's/#GRUB_BACKGROUND=.*/GRUB_BACKGROUND=\/boot\/grub\/grub.png/' "/etc/default/grub"
# verbose
sudo sed -i 's/quiet//' "/etc/default/grub"
# regenerate
sudo grub-mkconfig -o "/boot/grub/grub.cfg"

# disable udevd because it's unecesary
# sudo systemctl disable systemd-udevd
# sudo systemctl disable systemd-udevd-control.socket
# sudo systemctl disable systemd-udevd-kernel.socket

# motd
echo "" | sudo tee "/etc/motd"
