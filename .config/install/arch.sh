#!/bin/sh

#
# setup
#

GUI=true

PKGS=""
AURS=""
# installed after
PKGA=""
AURA=""

ETC="/etc"
SYSD="/${ETC}/systemd"
SYSDSYS="${SYSD}/system"

mkdir -p "$ETC"
mkdir -p "$SYSD"
mkdir -p "$SYSDSYS"
mkdir -p "$TMPDIR"
mkdir -p "$OPT_DIR"

# AUR package management
git clone "https://aur.archlinux.org/paru-bin.git" "${TMPDIR}/paru"
cd "${TMPDIR}/paru" && makepkg -si

#
# core
#

# documentation
PKGS="${PKGS} mandoc"
PKGS="${PKGS} neovim ripgrep nodejs npm fzf"
PKGS="${PKGS} vifm"

# development languages
PKGS="${PKGS} abook"
# PKGS="${PKGS} clang"
PKGS="${PKGS} deno"
PKGS="${PKGS} python"
# PKGS="${PKGS} python2"
PKGS="${PKGS} rustup"
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
AURS="${AURS} mmv"
PKGS="${PKGS} unzip wget"

# hackin
PKGS="${PKGS} nethack"

if [ "$GUI" == true ]; then

PKGS="${PKGS} xorg-server xorg-xinit"
PKGS="${PKGS} xorg-xsetroot"
PKGS="${PKGS} xorg-xinput"
PKGS="${PKGS} xdotool"
PKGS="${PKGS} xorg-xev"
# PKGS="${PKGS} xf86-video-intel"

PKGS="${PKGS} bspwm sxhkd"
AURS="${AURS} polybar"
AURS="${AURS} picom-ibhagwan-git"

# PKGA="${PKGA} firefox"
# PKGA="${PKGA} firefox-tridactyl"
# AURA="${AURA} firefox-tridactyl-native"
# AURA="${AURA} firefox-ublock-origin"
# AURA="${AURA} firefox-extension-multi-account-containers"

PKGS="${PKGS} feh"
PKGS="${PKGS} mpv"
PKGS="${PKGS} ffmpeg"
PKGS="${PKGS} screenkey"
PKGS="${PKGS} youtube-dl"
PKGS="${PKGS} xclip"
PKGS="${PKGS} slop"
PKGS="${PKGS} zathura girara zathura-pdf-mupdf"
# PKGS="${PKGS} gimp inkscape"
PKGS="${PKGS} mpd ncmpcpp"
# AURS="${AURS} ncspot"
# AURS="${AURS} spotify"

# PKGS="${PKGS} hsetroot"
PKGS="${PKGS} redshift"
PKGS="${PKGS} ttf-liberation"
PKGS="${PKGS} adobe-source-code-pro-fonts"
PKGS="${PKGS} wqy-zenhei"
PKGS="${PKGS} adapta-gtk-theme"
PKGS="${PKGS} ttf-roboto"

PKGS="${PKGS} pandoc"
PKGS="${PKGS} nm-connection-editor"






# terminal font
PKGS="${PKGS} libxft"
# PKGS="${PKGS} kdenlive breeze"
PKGS="${PKGS} alsa-utils"
# optional - pulseaudio
PKGS="${PKGS} pulseaudio pulseaudio-alsa pamixer pavucontrol"

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

# firefox extensions


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

# packages cannot be quoted
sudo pacman -S $PKGS

rustup default stable # rust configuration

for AUR in $AURS; do
  git clone "https://aur.archlinux.org/${AUR}.git" "${TMPDIR}/${AUR}"
  cd "${TMPDIR}/${AUR}"
  makepkg -si
done

sudo pacman -S $PKGA

for AUR in $AURA; do
  git clone "https://aur.archlinux.org/${AUR}.git" "${TMPDIR}/${AUR}"
  cd "${TMPDIR}/${AUR}"
  makepkg -si
done

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
# reduce the amount of journaling
journalConf="${SYSD}/journald.conf"
sudo cp -v "${XDG_CONFIG_HOME}${journalConf}" "$journalConf"
# power/lid events
loginConf="${SYSD}/logind.conf"
sudo cp -v "${XDG_CONFIG_HOME}${loginConf}" "$loginConf"

if [ "$GUI" == true ]; then

# suckless
sbuild "st"
sbuild "herbe"
sbuild "slock"

# slock
DISPLAY=":0" det "${XDG_CONFIG_HOME}${SYSDSYS}/template.slock@.service"
sudo ln -sf "${XDG_CONFIG_HOME}${SYSDSYS}/slock@.service" "${SYSDSYS}/slock@.service"
sudo systemctl enable "slock@${USER}.service"

# xresources
cd "${XDG_CONFIG_HOME}/getxr"
sudo make install clean

# swallowing windows
git clone "https://github.com/salman-abedin/devour.git" "${TMPDIR}/devour"
cd "${TMPDIR}/devour"
sudo make install

# ytui
# cd "${XDG_CONFIG_HOME}/ytui"
# sudo make clean install

# touchpad
touchpadConf="${ETC}/X11/xorg.conf.d/30-touchpad.conf"
sudo ln -sf "${XDG_CONFIG_HOME}${touchpadConf}" "$touchpadConf"

# TODO

# unmute audio channel
amixer sset Master unmute

# firefox profile
mkdir -p "${HOME}/.mozilla"
ln -sf "${XDG_CONFIG_HOME}/mozilla/firefox" "${HOME}/.mozilla/firefox"

# spotify with spicetify
sudo chmod a+wr "${OPT_DIR}/spotify"
sudo chmod a+wr "${OPT_DIR}/spotify/Apps" -R
yay -S --needed --nocleanmenu --nodiffmenu --noprovides spicetify-cli

# until ncpamixer proves itself to work without segfaulting, alsamixer works just fine...
# git clone "https://github.com/bossley9/ncpamixer.git" "${TMPDIR}/ncpamixer"
# cd "${TMPDIR}/ncpamixer"
# sudo make install

# alsamixer
git clone "https://github.com/bossley9/alsamixer.git" "${TMPDIR}/alsamixer"
cd "${TMPDIR}/alsamixer"
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

# font(s)
mkdir -p "$FONT_DIR"
fc-cache -f -v

fi

# grub
# timeout
grubConf="${ETC}/default/grub"
sudo sed -i 's/GRUB_TIMEOUT=.*/GRUB_TIMEOUT=0/' "$grubConf"
# regenerate
sudo grub-mkconfig -o "/boot/grub/grub.cfg"

echo -e "${YELLOW}It is recommended to reboot the system directly after running this sript.${NC}"
