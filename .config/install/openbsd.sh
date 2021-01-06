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

# required by vifm
PKGS="${PKGS} automake-1.15.1"
# required by girara/zathura manual build
PKGS="${PKGS} gettext-tools"
# required by picom
PKGS="${PKGS} libev"
# required by picom, girara/zathura
PKGS="${PKGS} meson"
# required by picom
PKGS="${PKGS} uthash"
# required by lemonbar
PKGS="${PKGS} xcb"

#
# core development
#

# editor and utilities
PKGS="${PKGS} neovim ripgrep node fzf"
# archives
PKGS="${PKGS} unzip-6.0p13"
# TODO python2 is required by node-sass.
# Remove when phased out of new versions
PKGS="${PKGS} python-2.7.18p0"
# required for ytui
PKGS="${PKGS} rust rust-rustfmt"
# web utility downloader
PKGS="${PKGS} wget"
# god-tier utility
PKGS="${PKGS} mmv"

# colors in sys utils (optional)
# it can make ttys harder to read
# PKGS="${PKGS} colorls"
# package searching
PKGS="${PKGS} pkglocatedb"

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
# ibhagwan's fork manually installed below until merged with master
# PKGS="${PKGS} picom"
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
# email client
# PKGS="${PKGS} neomutt-20201127"
# pdf document viewer
PKGS="${PKGS} zathura girara zathura-pdf-mupdf"
# document creation
PKGS="${PKGS} texlive_base texlive_texmf-full"
# music player
PKGS="${PKGS} mpd ncmpcpp"
# image editor (optional)
# PKGS="${PKGS} gimp"
# pdf conversions (optional)
# PKGS="${PKGS} poppler-utils"

#
# installation
#

doas pkg_add -I -m -v $PKGS # cannot be quoted

# ports (optional)
# doas pkg_add portslist
# cd "$TMP_DIR"
# ftp https://cdn.openbsd.org/pub/OpenBSD/$(uname -r)/{ports.tar.gz,SHA256.sig}
# signify -Cp /etc/signify/openbsd-$(uname -r | cut -c 1,3)-base.pub -x SHA256.sig ports.tar.gz
# cd /usr
# doas tar vxzf "${TMP_DIR}/ports.tar.gz"

# pip
# required by fzf, youtube-dl
curl "https://bootstrap.pypa.io/get-pip.py" -o "${TMP_DIR}/pip.py"
python3 "${TMP_DIR}/pip.py"

# yarn
yarn_ver="$(curl -L "https://yarnpkg.com/latest-version")"
curl \
  -L "https://yarnpkg.com/downloads/${yarn_ver}/yarn-v${yarn_ver}.tar.gz" \
  -o "${TMP_DIR}/yarn.tar.gz"
yarn_install_dir="${XDG_DATA_HOME}/yarn"
mkdir -p "${TMP_DIR}/yarn"
tar vxzf "${TMP_DIR}/yarn.tar.gz" -C "${TMP_DIR}/yarn"
rm -r "$yarn_install_dir" 2>/dev/null # overwrite old installations
mv "${TMP_DIR}/yarn/yarn-v${yarn_ver}" "$yarn_install_dir"
ln -sf "${yarn_install_dir}/bin/yarn" "${XDG_SCRIPT_HOME}/yarn"

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

# compositor
git clone "https://github.com/ibhagwan/picom.git" "${TMP_DIR}/picom"
cd "${TMP_DIR}/picom"
git checkout "44b4970f70d6b23759a61a2b94d9bfb4351b41b1"
git submodule update --init --recursive
patch -i "${XDG_CONFIG_HOME}/picom/patch.diff"
CPPFLAGS="-I/usr/local/include -I/usr/X11R6/include" LDFLAGS="-L/usr/local/lib -L/usr/X11R6/lib" meson . build
meson configure build -Ddbus="false" -Db_colorout="never" -Dbuildtype="minsize" -Dauto_features="disabled"
doas ninja -C build install

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

# system profiler
git clone "https://github.com/bossley9/htop.git" "${XDG_CACHE_HOME}/htop"
cd "${XDG_CACHE_HOME}/htop"
export AUTOCONF_VERSION="2.69"
export AUTOMAKE_VERSION="1.15"
./autogen.sh
./configure
doas make clean install
rm -rf "${XDG_CACHE_HOME}/htop"

# system reporter
git clone "https://github.com/dylanaraps/pfetch.git" "${TMP_DIR}/pfetch"
cd "${TMP_DIR}/pfetch"
mv pfetch "${XDG_SCRIPT_HOME}/pfetch"

# document viewer update (pkg doesn't include the latest inverted color diff)
git clone "https://git.pwmt.org/pwmt/girara.git" "${TMP_DIR}/girara"
cd "${TMP_DIR}/girara"
git checkout "1b60a46481f6ba37e7515ca80d6f627583f7100f"
meson build
cd build
ninja
doas ninja install

git clone "https://git.pwmt.org/pwmt/zathura.git" "${TMP_DIR}/zathura-git"
cd "${TMP_DIR}/zathura-git"
git checkout "f0796be3fa73cefb2eb71b0274330a74f14188f3"
CFLAGS="-I/usr/local/include" LDFLAGS="-L/usr/local/lib" meson build
meson build
cd build
ninja
doas ninja install

# gtk theme
doas mkdir -p "$GTK_THEME_DIR"
doas ln -sf "${XDG_CONFIG_HOME}/${THEME}" "${GTK_THEME_DIR}/${THEME}"

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
# TODO firefox-tridactyl-native
# curl -fsSl "https://raw.githubusercontent.com/tridactyl/tridactyl/1.20.4/native/install.sh" | sh
# https://github.com/tridactyl/tridactyl/issues/1144

# update manual page paths in mandoc db
OLD_IFS="$IFS"
IFS=":"
for path in $MANPATH; do
  doas makewhatis "$path"
done
IFS="$OLD_IFS"

# grant staff privileges
doas usermod -G staff "$USER"

# power management/sleep states
doas rcctl enable apmd
doas rcctl set apmd flags -A
doas rcctl start apmd

doas ln -sf "${XDG_CONFIG_HOME}/etc/sysctl.conf" "/etc/sysctl.conf"

# suckless utilities
sbuild "st"
sbuild "herbe"

# motd
echo "" | doas tee "/etc/motd"
