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

# required by lemonbar
PKGS="${PKGS} xcb"

# required by vifm
PKGS="${PKGS} automake-1.15.1"

#
# core development
#

# editor and utilities
PKGS="${PKGS} neovim ripgrep node fzf"

# because fzf complains about not being the latest version
git clone --depth 1 "https://github.com/junegunn/fzf.git" "${XDG_CACHE_HOME}/fzf"
cd "${XDG_CACHE_HOME}/fzf"
./install

# archives
PKGS="${PKGS} unzip-6.0p13"

# yarn
yarn_ver="$(curl -L "https://yarnpkg.com/latest-version")"
curl \
  -L "https://yarnpkg.com/downloads/${yarn_ver}/yarn-v${yarn_ver}.tar.gz" \
  -o "${TMP_DIR}/yarn.tar.gz"
yarn_install_dir="${XDG_DATA_HOME}/yarn"
tar vxzf "${TMP_DIR}/yarn.tar.gz" -C "${TMP_DIR}/yarn"
# overwrite old installations
rm -r "$yarn_install_dir"
mv "${TMP_DIR}/yarn/yarn-v${yarn_ver}" "$yarn_install_dir"
ln -sf "${yarn_install_dir}/bin/yarn" "${XDG_SCRIPT_HOME}/yarn"

# TODO python2 is required by node-sass.
# Remove when phased out of new versions
PKGS="${PKGS} python-2.7.18p0"

# required for ytui
PKGS="${PKGS} rust"

# web utility downloader
# PKGS="${PKGS} wget"

# god-tier utility
PKGS="${PKGS} mmv"

#
# Xorg
#

# window manager
PKGS="${PKGS} bspwm sxhkd"
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
# browser
PKGS="${PKGS} firefox"
# image viewer
PKGS="${PKGS} feh"
# media player
PKGS="${PKGS} mpv"
PKGS="${PKGS} youtube-dl"
# media manipulation
PKGS="${PKGS} ffmpeg mp3splt"
# rss reader
PKGS="${PKGS} newsboat"
# contact management
PKGS="${PKGS} abook"
# # email client
# PKGS="${PKGS} neomutt-20201127"
# pdf document viewer
PKGS="${PKGS} zathura girara zathura-pdf-mupdf"
# document creation
PKGS="${PKGS} texlive_base texlive_texmf-full"
# music player
PKGS="${PKGS} mpd ncmpcpp"
# system profiler
PKGS="${PKGS} neofetch"

#
# installation
#

doas pkg_add -I $PKGS # cannot be quoted

# ports (optional)
# doas pkg_add portslist
# cd "$TMP_DIR"
# ftp https://cdn.openbsd.org/pub/OpenBSD/$(uname -r)/{ports.tar.gz,SHA256.sig}
# signify -Cp /etc/signify/openbsd-$(uname -r | cut -c 1,3)-base.pub -x SHA256.sig ports.tar.gz
# cd /usr
# doas tar vxzf "${TMP_DIR}/ports.tar.gz"

# terminal file manager
git clone "https://github.com/vifm/vifm" "${XDG_CACHE_HOME}/vifm"
cd "${XDG_CACHE_HOME}/vifm"
git checkout "5a07de3549b065d318d2d43fdb2c94c4f5e4183e"
./configure
export AUTOCONF_VERSION="2.69"
export AUTOMAKE_VERSION="1.15"
make # individual make can probably be removed
doas make install
rm -rf "${XDG_CACHE_HOME}/vifm"

# status bar
git clone "https://github.com/krypt-n/bar.git" "${TMP_DIR}/lemonbar"
cp -f "${XDG_CONFIG_HOME}/lemonbar/Makefile" "${TMP_DIR}/lemonbar/"
cd "${TMP_DIR}/lemonbar"
doas make clean install

# xresources
cd "${XDG_CONFIG_HOME}/getxr"
doas make clean install

# font(s)
mkdir -p "$FONT_DIR"
cp -v $XDG_CONFIG_HOME/fonts/* "$FONT_DIR/"
fc-cache -f -v

# firefox profile
mkdir -p "${HOME}/.mozilla"
ln -sf "${XDG_CONFIG_HOME}/mozilla/firefox" "${HOME}/.mozilla/firefox"

# system profiler
git clone "https://github.com/bossley9/htop.git" "${XDG_CACHE_HOME}/htop"
cd "${XDG_CACHE_HOME}/htop"
export AUTOCONF_VERSION="2.69"
export AUTOMAKE_VERSION="1.15"
./autogen.sh
./configure
doas make clean install
rm -rf "${XDG_CACHE_HOME}/htop"

# gtk theme
doas mkdir -p "$GTK_THEME_DIR"
doas ln -sf "${XDG_CONFIG_HOME}/${THEME}" "${GTK_THEME_DIR}/${THEME}"

# pip
curl "https://bootstrap.pypa.io/get-pip.py" -o "${TMP_DIR}/pip.py"
python3 "${TMP_DIR}/pip.py"

# upgrade (fix) youtube-dl
pip install --upgrade youtube-dl

# ytui
cd "$XDG_CONFIG_HOME/ytui"
doas make clean install

# swallowing windows
git clone "https://github.com/salman-abedin/devour.git" "${TMP_DIR}/devour"
cd "${TMP_DIR}/devour"
git checkout "f1630794f0a6e96377373e8c1629ffa76f9b6cf4"
cp -f "${XDG_CONFIG_HOME}/devour/Makefile" "${TMP_DIR}/devour/"
doas make install

# # firefox extensions
# firefox-tridactyl"
# firefox-tridactyl-native"
# firefox-ublock-origin"
# firefox-extension-multi-account-containers"

# suckless utilities
$SBUILD "st"
$SBUILD "herbe"
#$SBUILD "slock"

# rc config
doas ln -sf "$XDG_CONFIG_HOME/etc/rc.conf.local" "/etc/rc.conf.local"

# motd
echo "" | doas tee "/etc/motd"
