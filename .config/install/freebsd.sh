#!/bin/sh

#
# setup
#

GUI=true

PREFIX="/usr/local"
BIN="${PREFIX}/bin"

PKGS=""
# PORTS=""

mkdir -p "$TMPDIR"
mkdir -p "$XDG_CACHE_HOME"
mkdir -p "$PORTS_DIR"

# update ports
doas portsnap fetch
doas portsnap extract
doas portsnap fetch update

#
# dependencies
#

# build dependencies
PKGS="${PKGS} meson ninja"
# required by ibhagwan picom
PKGS="${PKGS} libconfig libev uthash"
# required by firefox extensions
PKGS="${PKGS} wget"

#
# utilities
#

PKGS="${PKGS} mmv"

#
# core
#

# editor
PKGS="${PKGS} neovim ripgrep node npm fzf"
# file manager
PKGS="${PKGS} vifm"
# spreadsheets
PKGS="${PKGS} sc-im"
# development languages
PKGS="${PKGS} python"
PKGS="${PKGS} rust"
PKGS="${PKGS} texlive-full"
PKGS="${PKGS} yarn"
# fetch
PKGS="${PKGS} pfetch"
# rss reader
PKGS="${PKGS} newsboat"
# hackin
PKGS="${PKGS} nethack36-nox11-3.6.6_1"

if [ "$GUI" == true ]; then

PKGS="${PKGS} x11/xorg-minimal"
PKGS="${PKGS} xsetroot"
PKGS="${PKGS} xinput"
PKGS="${PKGS} xrandr"
PKGS="${PKGS} xrdb"
PKGS="${PKGS} drm-kmod"

PKGS="${PKGS} bspwm"
PKGS="${PKGS} sxhkd"
PKGS="${PKGS} polybar"

PKGS="${PKGS} firefox"

PKGS="${PKGS} feh"
PKGS="${PKGS} mpv"
PKGS="${PKGS} ffmpeg"
PKGS="${PKGS} xclip"
PKGS="${PKGS} slop"
PKGS="${PKGS} slop"
PKGS="${PKGS} zathura-pdf-mupdf"

PKGS="${PKGS} musicpd"
PKGS="${PKGS} ncmpcpp"

PKGS="${PKGS} hsetroot"
PKGS="${PKGS} redshift"
PKGS="${PKGS} sourcecodepro-ttf"
PKGS="${PKGS} wqy-fonts"

fi

#
# installation
#

doas pkg install $PKGS # cannot be quoted

# rustup - required for ytui
# TODO maybe try the package instead?
curl --proto '=https' -Sf "https://sh.rustup.rs" | sh

# system profiler
git clone "https://github.com/bossley9/htop.git" "${TMPDIR}/htop"
cd "${TMPDIR}/htop"
./autogen.sh
./configure
doas make install clean

# system profile
profile="/etc/profile"
doas cp -v "${XDG_CONFIG_HOME}${profile}" "$profile"

# TODO
# cd /usr/ports/ports-mgmt/portmaster
# sudo make clean install

# for port in "${PORTS[@]}"; do
#   cd "$port"
#   sudo make config-recursive
# done

# for port in "${PORTS[@]}"; do
#   cd "$port"
#   sudo make deinstall install clean
# done

if [ "$GUI" == true ]; then

# suckless
sbuild "st"
sbuild "herbe"
# TODO
# sbuild "slock"

# compositor
git clone "https://github.com/ibhagwan/picom" "${TMPDIR}/picom"
cd "${TMPDIR}/picom"
git submodule update --init --recursive
CPPFLAGS="-I/usr/local/include" LDFLAGS="-L/usr/local/lib" meson . build
meson configure build -Dcompton="false" -Ddbus="false" -Db_colorout="never" -Dbuildtype="minsize" -Dauto_features="disabled"
doas ninja -C build install

# pdf viewer
git clone "https://git.pwmt.org/pwmt/girara.git" "${TMPDIR}/girara/"
cd "${TMPDIR}/girara"
meson . build
doas ninja -C build install
git clone "https://git.pwmt.org/pwmt/zathura.git" "${TMPDIR}/zathura"
cd "${TMPDIR}/zathura"
meson . build
doas ninja -C build install

# pip
# required by youtube-dl
curl "https://bootstrap.pypa.io/get-pip.py" -o "${TMPDIR}/pip.py"
python "${TMPDIR}/pip.py"
# youtube-dl
pip install --upgrade youtube-dl
# ytui
# TODO
# cd "${XDG_CONFIG_HOME}/ytui"
# make
# doas make install clean
# # swallowing windows
git clone "https://github.com/salman-abedin/devour.git" "${TMPDIR}/devour"
cd "${TMPDIR}/devour"
cp -f "${XDG_CONFIG_HOME}/devour/Makefile" "${TMPDIR}/devour/"
doas make install

# firefox profile
mkdir -p "${HOME}/.mozilla"
ln -sf "${XDG_CONFIG_HOME}/mozilla/firefox" "${HOME}/.mozilla/firefox"
# firefox extensions
FF_EXT_DIR="${HOME}/.mozilla/firefox/${FF_PROFILE}/extensions"
mkdir -p "$FF_EXT_DIR"
# multi-containers
wget -v -O "${FF_EXT_DIR}/@testpilot-containers.xpi" \
  "https://addons.mozilla.org/firefox/downloads/file/3650825/firefox_multi_account_containers-7.1.0-fx.xpi"
# ublock origin
wget -v -O "${FF_EXT_DIR}/uBlock0@raymondhill.net.xpi" \
  "https://addons.cdn.mozilla.net/user-media/addons/607454/ublock_origin-1.17.4-an+fx.xpi"
# firefox-tridactyl
wget -v -O "${FF_EXT_DIR}/tridactyl.vim@cmcaine.co.uk.xpi" \
  "https://addons.mozilla.org/firefox/downloads/file/3697894/tridactyl-1.20.4-an+fx.xpi"

# xresources
cd "${XDG_CONFIG_HOME}/getxr"
doas make clean install

fi

# fonts
mkdir -p "$FONT_DIR"
fc-cache -f -v

# ssh
mkdir -p "$KEY_DIR"

# motd
echo "" | doas tee "/etc/motd.template"
