#!/bin/sh

git clone "https://aur.archlinux.org/yay-bin.git" "$TMP_DIR/yay"
cd "$TMP_DIR/yay" && makepkg -si

PACKS=""

# documentation
PACKS="${PACKS} man"

# xorg
PACKS="${PACKS} xorg-server xorg-xinit"
PACKS="${PACKS} xf86-video-intel"
# wm
PACKS="${PACKS} bspwm sxhkd"
# editor (fuzzy finder and coc compatibility)
PACKS="${PACKS} neovim ripgrep nodejs"
# terminal font
PACKS="${PACKS} libxft"
# fonts
PACKS="${PACKS} ttf-liberation adobe-source-code-pro-fonts wqy-zenhei"
# browser
PACKS="${PACKS} firefox"
# alt browser
# PACKS="${PACKS} elinks"
# fuzzy finder
PACKS="${PACKS} fzf"
# image viewer
PACKS="${PACKS} feh"
# screenshot utilities
PACKS="${PACKS} slop xdotool"
# redshift
PACKS="${PACKS} redshift"
# file manager
PACKS="${PACKS} vifm"
# compositor
PACKS="${PACKS} picom"
# display utils
PACKS="${PACKS} xorg-xsetroot hsetroot"
# mouse/touchpad control
PACKS="${PACKS} xorg-xinput"
# clipboard
PACKS="${PACKS} xclip"
# system profiler
PACKS="${PACKS} htop"
# ssh
PACKS="${PACKS} openssh"
# media player
PACKS="${PACKS} mpv"
PACKS="${PACKS} youtube-dl"
# rss reader
PACKS="${PACKS} newsboat"
# reddit viewer
# PACKS="${PACKS} rtv"
# pdf viewer utility
PACKS="${PACKS} zathura girara zathura-pdf-mupdf"

# media manipulation
PACKS="${PACKS} ffmpeg"
# PACKS="${PACKS} kdenlive"

PACKS="${PACKS} alsa-utils"
# PACKS="${PACKS} pulseaudio pulseaudio-alsa pamixer"
PACKS="${PACKS} mpd ncmpcpp"

# tuning power consumption
PACKS="${PACKS} tlp brightnessctl"

# doc conversion (specifically, md to html)
PACKS="${PACKS} pandoc"
# latex
PACKS="${PACKS} texlive-most biber"
# dev tools for work/school/projects
PACKS="${PACKS} nodejs deno yarn python2"

# firefox extensions
# PACKS="${PACKS} firefox-tridactyl"

sudo pacman -S --needed $PACKS # cannot be quoted

# unmute audio channel
amixer sset Master unmute

# enable power saving
sudo systemctl enable --now tlp

AUR="mmv"

# firefox extensions
AUR="${AUR} firefox-ublock-origin"
AUR="${AUR} firefox-extension-multi-account-containers"

yay -S --batchinstall --needed --noprovides $AUR # cannot be quoted

# xgetres for Xresources
git clone "https://github.com/tamirzb/xgetres.git" "${TMP_DIR}/xgetres"
cd "${TMP_DIR}/xgetres"
git checkout 2505f065e0c7ed990d8d71c0d8bd7106c8ab16f2
cp "${XDG_CONFIG_HOME}/xgetres/Makefile" "${TMP_DIR}/xgetres/"
sudo make clean install

# firefox profile
mkdir -p "${HOME}/.mozilla"
ln -sf "${XDG_CONFIG_HOME}/mozilla/firefox" "${HOME}/.mozilla/firefox"

# lemonbar
git clone "https://github.com/krypt-n/bar.git" "${TMP_DIR}/lemonbar"
cd "${TMP_DIR}/lemonbar"
sudo make clean install

# relink /bin/sh
sudo ln -sf mksh /bin/sh

# suckless
$SBUILD "st"
$SBUILD "herbe"
$SBUILD "slock"

# swallowing windows
git clone "https://github.com/salman-abedin/devour.git" "${TMP_DIR}/devour"
cd "${TMP_DIR}/devour"
git checkout f1630794f0a6e96377373e8c1629ffa76f9b6cf4
sudo make install

# alsamixer alternate
git clone "https://github.com/bossley9/alsamixer.git" "${TMP_DIR}/alsamixer"
cd "${TMP_DIR}/alsamixer"
sudo make clean install

# # pacmixer alternate
# git clone "https://github.com/bossley9/ncpamixer.git" "${TMP_DIR}/ncpamixer"
# cd "${TMP_DIR}/ncpamixer"
# sudo make install

# ytui
# cd $XDG_CONFIG_HOME/ytui
# sudo make clean install

SYSD="/etc/systemd"

# logind/power events
sudo mkdir -p "${SYSD}"
sudo cp "${XDG_CONFIG_HOME}${SYSD}/logind.conf" "${SYSD}/logind.conf"

# slock
SYSDSYS="${SYSD}/system"
sudo mkdir -p "${SYSDSYS}"
DISPLAY=:0 $DET "${XDG_CONFIG_HOME}/${SYSDSYS}/template.slock@.service"
sudo ln -sf "${XDG_CONFIG_HOME}/${SYSDSYS}/slock@.service" "${SYSDSYS}/slock@.service"
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
sudo cp "${XDG_CONFIG_HOME}/wallpapers/grub.png" "/boot/grub/"
sudo sed -i 's/#GRUB_BACKGROUND=.*/GRUB_BACKGROUND=\/boot\/grub\/grub.png/' "/etc/default/grub"
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
