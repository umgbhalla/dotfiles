#!/bin/sh

# try paru?
# commented to incentivize manual compilation
#
# git clone "https://aur.archlinux.org/yay.git" "$TMP_DIR/yay"
# cd "$TMP_DIR/yay" && makepkg -si

PACKS=""

# documentation
PACKS="${PACKS} man"

# xorg
PACKS="${PACKS} xorg-server xorg-xinit"

# git clone "https://github.com/baskerville/bspwm.git" "${TMP_DIR}/bspwm"
# cd "${TMP_DIR}/bspwm"
# git checkout 51983994fa078b7a7ce4fe796d4625a4ad1e4251
# sudo make clean install

# wm
PACKS="${PACKS} bspwm sxhkd"
# PACKS="${PACKS} libxft"
# editor
PACKS="${PACKS} neovim nodejs ripgrep"
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
#
PACKS="${PACKS} xorg-xsetroot hsetroot"
# clipboard
PACKS="${PACKS} xclip"
# system profiler
PACKS="${PACKS} htop"
# ssh
PACKS="${PACKS} openssh"
# media player
PACKS="${PACKS} mpv"
# rss reader
PACKS="${PACKS} newsboat"
# PACKS="${PACKS} yarn"
# pdf viewer utility
PACKS="${PACKS} zathura-pdf-mupdf"

# media manipulation
PACKS="${PACKS} ffmpeg"
# PACKS="${PACKS} kdenlive"

# PACKS="${PACKS} pulseaudio pulseaudio-alsa pamixer pavucontrol"
# PACKS="${PACKS} mpd ncmpcpp"

# PACKS="${PACKS} texlive-most biber"

# PACKS="${PACKS} figlet"

sudo pacman -S --needed $PACKS # cannot be quoted

# AUR="mmv"

# AUR="$AUR picom-ibhagwan-git"
# AUR="$AUR adobe-source-code-pro-fonts"
# AUR="$AUR zathura-git"
# AUR="$AUR youtube-dl"

# AUR="$AUR xgetres"

# yay -S --needed --batchinstall $AUR # cannot be quoted

# browser profile
# $DET "${XDG_CONFIG_HOME}/mozilla/template.user.js"
# firefox -CreateProfile "${FF_PROFILE}"
# baseDir="${HOME}/.mozilla/firefox"
# profileDir="$(ls "${baseDir}" | grep ".${FF_PROFILE}")"
# ffDir="${baseDir}/${profileDir}"
# rm -f "${ffDir}/chrome" >/dev/null
# rm -f "${ffDir}/user.js" >/dev/null
# ln -sf "${XDG_CONFIG_HOME}/mozilla/profile/chrome" "${ffDir}/chrome"
# ln -sf "${XDG_CONFIG_HOME}/mozilla/user.js" "${ffDir}/user.js"

# lemonbar
git clone "https://github.com/krypt-n/bar.git" "${TMP_DIR}/lemonbar"
cd "${TMP_DIR}/lemonbar"
sudo make clean install

# relink /bin/sh
sudo ln -sf mksh /bin/sh

# suckless
$SBUILD "st"
$SBUILD "herbe"

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

# login prompt
# if command -v "figlet"; then
#   issue="$(cat "/etc/hostname" | figlet -k | sed 's/\\/\\\\\\/g')"
#   issuestatus="(\\l) \\s \\\r \\\t"
#   # -e interprets \n as a new line character
#   echo -e "${issue}\n${issuestatus}" | sudo tee "/etc/issue" > /dev/null
# fi

# motd
echo "" | sudo tee "/etc/motd"
