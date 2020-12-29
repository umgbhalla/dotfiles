#!/bin/sh

#
# setup
#

PKGS=""

mkdir -p "$TMP_DIR"
mkdir -p "$XDG_CACHE_HOME"

#
# dependencies
#

#
# core development
#

# editor and utilities
PKGS="${PKGS} neovim ripgrep nodejs fzf"

# archives
PKGS="${PKGS} unzip-6.0p13"

# dev tools for projects
PKGS="${PKGS} nodejs"

# TODO add yarn
# https://classic.yarnpkg.com/en/docs/install/#alternatives-stable
# or compile from src?
# doas mkdir -p "/opt"
# cd "/opt"

# TODO python2 is required by node-sass.
# Remove when phased out of new versions
PKGS="${PKGS} python-2.7.18p0"

# required for ytui
PKGS="${PKGS} rust"

#
# Xorg
#

# window manager
PKGS="${PKGS} bspwm sxhkd"
# background display utils
PKGS="${PKGS} hsetroot"
# blue light filter
PKGS="${PKGS} redshift"
# fonts
PKGS="${PKGS} liberation-fonts adobe-source-code-pro zh-wqy-zenhei-ttf"
# compositor
PKGS="${PKGS} picom"
# system clipboard
PKGS="${PKGS} xclip"
# screenshot utilities
PKGS="${PKGS} slop xdotool"

#
# installation
#

doas pkg_add -I $PKGS # cannot be quoted


# optional - ports
# doas pkg_add portslist
# cd "$TMP_DIR"
# ftp https://cdn.openbsd.org/pub/OpenBSD/$(uname -r)/{ports.tar.gz,SHA256.sig}
# signify -Cp /etc/signify/openbsd-$(uname -r | cut -c 1,3)-base.pub -x SHA256.sig ports.tar.gz
# cd /usr
# doas tar vxzf "${TMP_DIR}/ports.tar.gz"

# terminal file browser
# required for vifm compilation
# PKGS="${PKGS} automake-1.16.2"
# git clone "https://github.com/vifm/vifm" "${XDG_CACHE_HOME}/vifm"
# cd "${XDG_CACHE_HOME}/vifm"
# git checkout "5a07de3549b065d318d2d43fdb2c94c4f5e4183e"
# ./configure

# xresources
cd "${XDG_CONFIG_HOME}/getxr"
doas make clean install

# font(s)
mkdir -p "$FONT_DIR"
cp -v $XDG_CONFIG_HOME/fonts/* "$FONT_DIR/"
fc-cache -f -v

# turn off console display after 60 seconds of inactivity
# wsconsctl display.screen_off=60000

echo WIP

#PACKS="${PACKS} xf86-video-intel"
## browser
#PACKS="${PACKS} firefox"
## image viewer
#PACKS="${PACKS} feh"
## email client
## PACKS="${PACKS} neomutt"
## contact management
#PACKS="${PACKS} abook"
## media player
#PACKS="${PACKS} mpv"
#PACKS="${PACKS} youtube-dl"
## rss reader
#PACKS="${PACKS} newsboat"
## reddit viewer
## PACKS="${PACKS} rtv"
## pdf viewer utility
#PACKS="${PACKS} zathura girara zathura-pdf-mupdf"

## media manipulation
#PACKS="${PACKS} ffmpeg"
## PACKS="${PACKS} mp3splt"
## PACKS="${PACKS} kdenlive"

#PACKS="${PACKS} alsa-utils"
## PACKS="${PACKS} pulseaudio pulseaudio-alsa pamixer"
#PACKS="${PACKS} mpd ncmpcpp"

## tuning power consumption
#PACKS="${PACKS} tlp brightnessctl"

## doc conversion (specifically, md to html)
#PACKS="${PACKS} pandoc"
## latex
#PACKS="${PACKS} texlive-most biber"
## dev tools for work/school/projects
#PACKS="${PACKS} nodejs deno yarn python2"
## required for ytui, and a good dev tool
#PACKS="${PACKS} rust"

## various utilities/tools
#PACKS="${PACKS} wget"

## firefox extensions
#PACKS="${PACKS} firefox-tridactyl"


## unmute audio channel
#amixer sset Master unmute

## enable power saving
#sudo systemctl enable --now tlp

#AUR="mmv"

## firefox extensions
#AUR="${AUR} firefox-tridactyl-native"
#AUR="${AUR} firefox-ublock-origin"
#AUR="${AUR} firefox-extension-multi-account-containers"

#yay -S --batchinstall --needed --nocleanmenu --nodiffmenu --noprovides $AUR # cannot be quoted

## firefox profile
#mkdir -p "${HOME}/.mozilla"
#ln -sf "${XDG_CONFIG_HOME}/mozilla/firefox" "${HOME}/.mozilla/firefox"

## lemonbar
#git clone "https://github.com/krypt-n/bar.git" "${TMP_DIR}/lemonbar"
#cd "${TMP_DIR}/lemonbar"
#sudo make clean install

## xresources
#cd "${XDG_CONFIG_HOME}/getxr"
#sudo make clean install

## relink /bin/sh
#sudo ln -sf mksh /bin/sh

# # suckless utilities
# $SBUILD "st"
#$SBUILD "herbe"
#$SBUILD "slock"

## swallowing windows
#git clone "https://github.com/salman-abedin/devour.git" "${TMP_DIR}/devour"
#cd "${TMP_DIR}/devour"
#git checkout f1630794f0a6e96377373e8c1629ffa76f9b6cf4
#sudo make install

## alsamixer alternate
#git clone "https://github.com/bossley9/alsamixer.git" "${TMP_DIR}/alsamixer"
#cd "${TMP_DIR}/alsamixer"
#sudo make clean install

## # pacmixer alternate
## git clone "https://github.com/bossley9/ncpamixer.git" "${TMP_DIR}/ncpamixer"
## cd "${TMP_DIR}/ncpamixer"
## sudo make install

## contact management
## git clone "https://github.com/bossley9/abook.git" "${TMP_DIR}/abook"
## cd "${TMP_DIR}/abook"
## ./configure
## sudo make clean install

## ytui
#cd "$XDG_CONFIG_HOME/ytui"
#sudo make clean install

## system profiler
#git clone "https://github.com/bossley9/htop.git" "${TMP_DIR}/htop"
#cd "${TMP_DIR}/htop"
#./autogen.sh
#./configure
#sudo make clean install

#SYSD="/etc/systemd"

## logind/power events
#sudo mkdir -p "${SYSD}"
#sudo cp "${XDG_CONFIG_HOME}${SYSD}/logind.conf" "${SYSD}/logind.conf"

## slock
#SYSDSYS="${SYSD}/system"
#sudo mkdir -p "${SYSDSYS}"
#DISPLAY=:0 $DET "${XDG_CONFIG_HOME}/${SYSDSYS}/template.slock@.service"
#sudo ln -sf "${XDG_CONFIG_HOME}/${SYSDSYS}/slock@.service" "${SYSDSYS}/slock@.service"
#sudo systemctl enable "slock@${USER}.service"

## gtk theme
#sudo mkdir -p "$GTK_THEME_DIR"
#sudo ln -sf "${XDG_CONFIG_HOME}/${THEME}" "${GTK_THEME_DIR}/${THEME}"

## font(s)
#mkdir -p "$FONT_DIR"
#cp -v $XDG_CONFIG_HOME/fonts/* "$FONT_DIR/"
#fc-cache -f -v

## touchpad
#sudo ln -sf "$XDG_CONFIG_HOME/xorg.conf.d/30-touchpad.conf" "/etc/X11/xorg.conf.d/30-touchpad.conf"

## add color to /etc/pacman.conf
#sudo sed -i 's/#Color/Color/' /etc/pacman.conf

## update grub config
## timeout
#sudo sed -i 's/GRUB_TIMEOUT=.*/GRUB_TIMEOUT=0/' "/etc/default/grub"
## background
#sudo cp "${XDG_CONFIG_HOME}/wallpapers/grub.png" "/boot/grub/"
#sudo sed -i 's/#GRUB_BACKGROUND=.*/GRUB_BACKGROUND=\/boot\/grub\/grub.png/' "/etc/default/grub"
## verbose
#sudo sed -i 's/quiet//' "/etc/default/grub"
## regenerate
#sudo grub-mkconfig -o "/boot/grub/grub.cfg"

## disable udevd because it's unecesary
## sudo systemctl disable systemd-udevd
## sudo systemctl disable systemd-udevd-control.socket
## sudo systemctl disable systemd-udevd-kernel.socket

## motd
#echo "" | sudo tee "/etc/motd"
