#!/bin/sh

git clone "https://aur.archlinux.org/yay-bin.git" "$TMP_DIR/yay"
cd "$TMP_DIR/yay" && makepkg -si

PACKS=""

# documentation
PACKS="${PACKS} man"

# xorg
PACKS="${PACKS} xorg-server xorg-xinit"
# wm
PACKS="${PACKS} bspwm sxhkd"
# editor
PACKS="${PACKS} neovim nodejs ripgrep"
# terminal font
PACKS="${PACKS} libxft"
# fonts
PACKS="${PACKS} ttf-liberation adobe-source-code-pro-fonts wqy-zenhei"
# browser
PACKS="${PACKS} firefox"
# fuzzy finder
PACKS="${PACKS} fzf"
# image viewer
PACKS="${PACKS} feh"
# screenshot utility
PACKS="${PACKS} slop"
# redshift
PACKS="${PACKS} redshift"
# file manager
PACKS="${PACKS} vifm"
# compositor
PACKS="${PACKS} picom"
# display utils
PACKS="${PACKS} xorg-xsetroot hsetroot"
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
# pdf viewer utility
PACKS="${PACKS} zathura girara zathura-pdf-mupdf"

# media manipulation
PACKS="${PACKS} ffmpeg"
# PACKS="${PACKS} kdenlive"

PACKS="${PACKS} alsa-utils"
PACKS="${PACKS} mpd ncmpcpp"

PACKS="${PACKS} texlive-most biber"

# tuning power consumption
PACKS="${PACKS} tlp brightnessctl"

# PACKS="${PACKS} yarn python2"

sudo pacman -S --needed $PACKS # cannot be quoted

# unmute audio channel
amixer sset Master unmute

# enable power saving
sudo systemctl enable --now tlp

AUR="mmv"

# firefox extensions
AUR="${AUR} firefox-ublock-origin"
AUR="${AUR} firefox-extension-multi-account-containers"

yay -S --needed --batchinstall $AUR # cannot be quoted

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

SYSD="/etc/systemd"
# logind/power events
sudo mkdir -p "${SYSD}"
sudo cp "${XDG_CONFIG_HOME}${SYSD}/logind.conf" "${SYSD}/logind.conf"

# gtk theme
$DET "${XDG_CONFIG_HOME}/${THEME}/gtk-3.0/template.gtk.css"
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

# motd
echo "" | sudo tee "/etc/motd"
