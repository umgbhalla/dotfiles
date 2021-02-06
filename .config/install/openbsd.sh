#!/bin/sh

#
# setup
#

PREFIX="/usr/local"
BIN="${PREFIX}/bin"
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
# required by openh264 codec
PKGS="${PKGS} nasm"
# required by yarn
PKGS="${PKGS} node"
# required by biber
PKGS="${PKGS} p5-Log-Log4perl"
PKGS="${PKGS} p5-Module-Install"
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
# great low-level dev language
# required by ncspot, ytui
PKGS="${PKGS} rust rust-rustfmt"
# web utility downloader
PKGS="${PKGS} wget"
# god-tier utility
PKGS="${PKGS} mmv"

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
# compositor - ibhagwan's fork manually installed below until merged with master
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
# pdf document viewer
PKGS="${PKGS} zathura girara zathura-pdf-mupdf"
PKGS="${PKGS} evince-3.36.7" # pdf form filling
# document creation
PKGS="${PKGS} texlive_base texlive_texmf-full"
# music player
PKGS="${PKGS} mpd ncmpcpp"
# image editor (optional)
# PKGS="${PKGS} gimp"
# vector editor (optional)
# PKGS="${PKGS} inkscape"
# java (optional)
# PKGS="${PKGS} jdk-11.0.8.10.1v0"

#
# installation
#

doas pkg_add -I -m -v $PKGS # cannot be quoted

# ports
PORTS_DIR="/usr/ports"
doas mkdir -p "$PORTS_DIR"
cd "$TMP_DIR"
ftp https://cdn.openbsd.org/pub/OpenBSD/$(uname -r)/{ports.tar.gz,SHA256.sig}
signify -Cp /etc/signify/openbsd-$(uname -r | cut -c 1,3)-base.pub -x SHA256.sig ports.tar.gz
cd "/usr"
doas tar vxzf "${TMP_DIR}/ports.tar.gz"
# required for any port browsing
doas pkg_add portslist

# gcc 4.3+
cd "${PORTS_DIR}/lang/gcc"
doas make
doas make install clean
# symlink - possibly hazardous but evidently necessary
ln -sf "${BIN}/egcc" "${XDG_SCRIPT_HOME}/gcc"
ln -sf "${BIN}/eg++" "${XDG_SCRIPT_HOME}/g++"

# python symlink alias
ln -sf "${BIN}/python3" "${XDG_SCRIPT_HOME}/python"

# pip
# required by fzf, youtube-dl
curl "https://bootstrap.pypa.io/get-pip.py" -o "${TMP_DIR}/pip.py"
python "${TMP_DIR}/pip.py"

# # yarn
# yarn_ver="$(\
#   curl -L "https://api.github.com/repos/yarnpkg/yarn/releases/latest" | \
#   grep -m 1 "tar.gz" | \
#   cut -d '"' -f 4 | \
#   cut -d 'v' -f 2 | \
#   cut -d '.' -f 1-3
#   )"
# wget -v -O \
#   "${TMP_DIR}/yarn.tar.gz" \
#   "https://github.com/yarnpkg/yarn/releases/download/v${yarn_ver}/yarn-v${yarn_ver}.tar.gz"
# mkdir -p "${TMP_DIR}/yarn"
# tar vxzf "${TMP_DIR}/yarn.tar.gz" -C "${TMP_DIR}/yarn"
# yarn_install_dir="${XDG_DATA_HOME}/yarn"
# rm -r "$yarn_install_dir" 2>"/dev/null" # overwrite old installations
# mv "${TMP_DIR}/yarn/yarn-v${yarn_ver}" "$yarn_install_dir"
# ln -sf "${yarn_install_dir}/bin/yarn.js" "${XDG_SCRIPT_HOME}/yarn"

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
# firefox-tridactyl-native
# manually running install because we need to do additional work with unveil
# https://raw.githubusercontent.com/tridactyl/tridactyl/1.20.4/native/install.sh
tri_manifest="https://raw.githubusercontent.com/tridactyl/tridactyl/1.15.0/native/tridactyl.json"
tri_native="https://raw.githubusercontent.com/tridactyl/tridactyl/1.15.0/native/native_main.py"
tri_manifest_home="${HOME}/.mozilla/native-messaging-hosts/"
tri_native_home="${XDG_DATA_HOME}/tridactyl"
tri_manifest_file="${tri_manifest_home}/tridactyl.json"
tri_native_file="${tri_native_home}/native_main.py.new"
tri_native_file_final="${tri_native_home}/native_main.py"
# fetch files
curl -L --create-dirs -o "$tri_manifest_file" "$tri_manifest"
curl -L --create-dirs -o "$tri_native_file" "$tri_native"
# substitute native file path
sed_escape_native="$(echo "$tri_native_file_final" | sed 's/[&/\]/\\&/g')"
sed -i.bak "s/REPLACE_ME_WITH_SED/${sed_escape_native}/" "$tri_manifest_file"
# substitute python path
python_path="$(command -v python3)"
sed_escape_env="$(echo "/usr/bin/env" | sed 's/[&/\]/\\&/g')"
sed_escape_python="$(echo "$python_path" | sed 's/[&/\]/\\&/g')"
sed -i.bak "1s/.*/#!${sed_escape_env} ${sed_escape_python}/" "$tri_native_file"
mv "$tri_native_file" "$tri_native_file_final"
# unveil native messenger and make executable
chmod 755 "$tri_native_file_final"
ff_unveil_file="/etc/firefox/unveil.main"
if ! grep -qi "tridactyl" "$ff_unveil_file"; then
  echo "${tri_native_home} rx" | doas tee -a "$ff_unveil_file"
fi

# Spotify
cd "${PORTS_DIR}/audio/ncspot"
doas make install clean

# TODO Biber

# TODO Youtube movie codec

# libopen264
git clone "https://github.com/cisco/openh264" "${TMP_DIR}/openh264"
cd "${TMP_DIR}/openh264"
g checkout "992c1c147175126c3fe7ab78216aa0395f9e6c71"
gmake ARCH="x86_64"
doas gmake install

# # TODO Discord (work)
# wget -v -O "${TMP_DIR}/discord.tar.gz" "https://discord.com/api/download?platform=linux&format=tar.gz"
# mkdir -p "${TMP_DIR}/discord"
# tar vxzf "${TMP_DIR}/discord.tar.gz" -C "${TMP_DIR}/discord"
# discord_install_dir="${XDG_DATA_HOME}/discord"
# rm -r "$discord_install_dir" 2>"/dev/null" # overwrite old installations
# mv "${TMP_DIR}/discord/Discord" "$discord_install_dir"
# ln -sf "${discord_install_dir}/Discord" "${XDG_SCRIPT_HOME}/discord"

# # TODO Zoom (school)
# zoom_ver="5.4.57450.1220"
# wget -v -O \
#   "${TMP_DIR}/zoom.tar.xz" \
#   "https://zoom.us/client/${zoom_ver}/zoom_x86_64.pkg.tar.xz"
# mkdir -p "${TMP_DIR}/zoom"
# xz --decompress -v "${TMP_DIR}/zoom.tar.xz"
# tar xvf "${TMP_DIR}/zoom.tar" -C "${TMP_DIR}/zoom"

# Nethack (def a must)
nethack_ver="$(echo "$NETHACK_VER" | cut -d '.' -f 1-2)"
cd "${PORTS_DIR}/games/nethack/${nethack_ver}/"
doas make install clean

# update manual page paths in mandoc db
OLD_IFS="$IFS"
IFS=":"
for path in $MANPATH; do
  doas makewhatis "$path"
done
IFS="$OLD_IFS"

# grant staff privileges
doas usermod -G staff "$USER"

# grant webcam privileges
doas chown "$USER" "/dev/video0"

# power management/sleep states
doas rcctl enable apmd
doas rcctl set apmd flags -A
doas rcctl start apmd

# turn off mail server (not being used)
doas rcctl stop smtpd
doas rcctl disable smtpd

# turn off dbus (not being used)
doas rcctl stop messagebus
doas rcctl disable messagebus

# audio recording
doas rcctl set sndiod flags -s default -m play,mon -s mon
doas rcctl restart sndiod

# sysctl
doas ln -sf "${XDG_CONFIG_HOME}/etc/sysctl.conf" "/etc/sysctl.conf"

# wsconsctl
# does not work with symbolic link
doas cp "${XDG_CONFIG_HOME}/etc/wsconsctl.conf" "/etc/wsconsctl.conf"

# boot
# does not work with symbolic link
doas cp "${XDG_CONFIG_HOME}/etc/boot.conf" "/etc/boot.conf"

# login
doas cp "${XDG_CONFIG_HOME}/etc/login.conf" "/etc/login.conf"

# mk (ports)
doas cp "${XDG_CONFIG_HOME}/etc/mk.conf" "/etc/mk.conf"

# suckless utilities
sbuild "st"
sbuild "herbe"

# motd
echo "" | doas tee "/etc/motd"
