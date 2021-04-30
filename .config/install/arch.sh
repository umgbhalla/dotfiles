#!/bin/sh

#
# setup
#

GUI=true

PKGS=""
PKGSA=""
AUR=""
ETC="/etc"

mkdir -p "$ETC"
mkdir -p "$TMPDIR"
mkdir -p "$OPT_DIR"

# AUR package management
git clone "https://aur.archlinux.org/paru-bin.git" "${TMPDIR}/paru"
cd "${TMPDIR}/paru" && makepkg -si

#
# core
#

# documentation
# no glaring differences between mandoc and man-db
PKGS="${PKGS} mandoc"
# editor
PKGS="${PKGS} neovim ripgrep nodejs npm fzf"
# file manager
PKGS="${PKGS} vifm"

# # development languages
# PKG="${PKGS} clang"
PKGS="${PKGS} python"
PKGS="${PKGS} rustup" # TODO setup?
PKGS="${PKGS} texlive-most biber"
PKGS="${PKGS} yarn"
# rss reader
PKGS="${PKGS} newsboat"
# ssh
PKGS="${PKGS} openssh"
# tuning and power management
PKGS="${PKGS} tlp brightnessctl"
# various utils
PKGS="${PKGS} dash"
PKGS="${PKGS} unzip wget"
# hackin
PKGS="${PKGS} nethack"

#
# Xorg
#

if [ "$GUI" == true ]; then

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
# compositor (fork installed below)
# PKGS="${PKGS} picom"
# display utils
PKGS="${PKGS} xorg-xsetroot"
PKGS="${PKGS} xorg-xsetroot"
# mouse/touchpad control
PKGS="${PKGS} xorg-xinput"
# clipboard
PKGS="${PKGS} xclip"
# email client
# PKGS="${PKGS} neomutt"
# contact management
PKGS="${PKGS} abook"
# media player
PKGS="${PKGS} mpv"
PKGS="${PKGS} youtube-dl"
# pdf viewer utility
PKGS="${PKGS} zathura girara zathura-pdf-mupdf"
# pdf editor
# PKGS="${PKGS} evince"
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

# doc conversion (specifically, md to html)
# used for vim markdown previews
PKGS="${PKGS} pandoc"
# dev tools for work/school/projects
# TODO python2 is required by node-sass.
# Remove when phased out of new versions
PKGS="${PKGS} nodejs deno yarn python2"

# gtk theme
PKGS="${PKGS} adapta-gtk-theme"
PKGS="${PKGS} ttf-roboto"

# firefox extensions
PKGS="${PKGS} firefox-tridactyl"

# torrents
PKGS="${PKGS} aria2"

# qrcodes
PKGS="${PKGS} qrencode"

# containers
# PKGS="${PKGS} lxd"

# DAW
# PKGS="${PKGS} lmms"

# password generator
# PKGS="${PKGS} pwgen"

# required by xmr-stack (possibly already installed)
# PKGS="${PKGS} hwloc openssl cmake libmicrohttpd"

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
# proves to be troublesome
# AUR="${AUR} spotify"
AUR="${AUR} ncspot"

# animated wallpaper eyecandy
# AUR="${AUR} xwinwrap-git"

# hardened malloc for security (closer to OpenBSD)
# AUR="${AUR} hardened-malloc-git"

# alt browser
# AUR="${AUR} nyxt-browser-git"

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

fi

#
# installation
#

sudo pacman -S $PKGS # cannot be quoted

if [ "$GUI" == true ]; then

# unmute audio channel
amixer sset Master unmute

# yay -S --batchinstall --needed --nocleanmenu --nodiffmenu --noprovides $AUR # cannot be quoted
paru -S $AUR

# after
sudo pacman -S --needed $PKGSA # cannot be quoted

fi

# enable power management
sudo systemctl enable --now tlp

# spreadsheets
git clone "https://github.com/andmarti1424/sc-im.git" "${TMPDIR}/sc-im"
cd "${TMPDIR}/sc-im/src"
cp "${XDG_CONFIG_HOME}/sc-im/Makefile" "${TMPDIR}/sc-im/src/"
make
sudo make install clean

# system profiler
git clone "https://github.com/bossley9/htop.git" "${TMPDIR}/htop"
cd "${TMPDIR}/htop"
./autogen.sh
./configure
sudo make install clean

# fetch
git clone "https://github.com/dylanaraps/pfetch.git" "${TMPDIR}/pfetch"
cd "${TMPDIR}/pfetch"
sudo make install

# relink /bin/sh
sudo ln -sfT "dash" "/usr/bin/sh"
PACMAN_HOOK_DIR="${ETC}/pacman.d/hooks"
sudo mkdir -p "$PACMAN_HOOK_DIR"
sudo cp "${XDG_CONFIG_HOME}${PACMAN_HOOK_DIR}/binsh.hook" "$PACMAN_HOOK_DIR"

# add color to /etc/pacman.conf
sudo sed -i 's/#\s*Color/Color/' "${ETC}/pacman.conf"

# system hardening
# umask 0077 as recommended by the NSA
sudo sed -i 's/^umask.*/umask 0077/' "${ETC}/profile"
# set security limits
securityLimits="${ETC}/security/limits.conf"
sudo cp -v "${XDG_CONFIG_HOME}${securityLimits}" "$securityLimits"
# prohibit ssh root login
sshConf="${ETC}/ssh/sshd_config"
sudo sed -i 's/#\s*PermitRootLogin.*/PermitRootLogin no/' "$sshConf"
# add 5 second delay between failed login attempts
pamLogin="${ETC}/pam.d/system-login"
sudo cp -v "${XDG_CONFIG_HOME}${pamLogin}" "$pamLogin"

# systemd
SYSD="/${ETC}/systemd"
sudo mkdir -p "${SYSD}"
# reduce the amount of journaling
journalConf="${SYSD}/journald.conf"
sudo cp -v "${XDG_CONFIG_HOME}${journalConf}" "$journalConf"
# power/lid events
loginConf="${SYSD}/logind.conf"
sudo cp -v "${XDG_CONFIG_HOME}${loginConf}" "$loginConf"

if [ "$GUI" == true ]; then

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

# xmr
# XMR_ARCHIVE="${TMPDIR}/xmr.tar.bz2"
# curl -L "https://downloads.getmonero.org/cli/linux64" -o "$XMR_ARCHIVE"
# mkdir -p "${TMPDIR}/xmr"
# tar xvjf "$XMR_ARCHIVE" -C "${TMPDIR}/xmr"
# cd "${TMPDIR}/xmr"
# mv "$(ls)" "$XMR_PATH"
# xmr-stak
# recommended: https://github.com/fireice-uk/xmr-stak

# eww (widgets)
# git clone "https://github.com/elkowar/eww" "${TMPDIR}/eww"
# cd "${TMPDIR}/eww"
# cargo build --release
# cd "target/release"
# chmod +x "eww"
# mv "eww" "${XDG_SCRIPT_HOME}/"

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
fc-cache -f -v

# touchpad
sudo ln -sf "$XDG_CONFIG_HOME/xorg.conf.d/30-touchpad.conf" "/etc/X11/xorg.conf.d/30-touchpad.conf"

fi

# grub
# timeout
grubConf="${ETC}/default/grub"
sudo sed -i 's/GRUB_TIMEOUT=.*/GRUB_TIMEOUT=0/' "$grubConf"
# regenerate
sudo grub-mkconfig -o "/boot/grub/grub.cfg"

echo -e "${YELLOW}It is recommended to reboot the system directly after running this sript.${NC}"
