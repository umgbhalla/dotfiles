#!/bin/sh

sudo pkg install cmake gettext gmake meson ncurses pkgconf python

sudo portsnap fetch
sudo portsnap extract

PACKS="mmv" # what a god-tier utility
# PACKS="${PACKS} groff"

PACKS="${PACKS} xorg drm-kmod"
PACKS="${PACKS} bspwm sxhkd"
PACKS="${PACKS} sourcecodepro-ttf wqy-fonts"

# bar
git clone "https://github.com/krypt-n/bar.git" "${TMP_DIR}/lemonbar-xft"
cp -f "${XDG_CONFIG_HOME}/lemonbar/Makefile" "${TMP_DIR}/lemonbar-xft/"
cd "${TMP_DIR}/lemonbar-xft"
sudo gmake clean install

PACKS="${PACKS} picom"
PACKS="${PACKS} hsetroot"

PACKS="${PACKS} neovim node ripgrep"

git clone "https://github.com/jarun/nnn.git" "${TMP_DIR}/nnn"
cd "${TMP_DIR}/nnn"
g checkout 52b87a24925708aaa0ab57821386358136db48bd
sudo gmake O_NORL=1 O_NOMOUSE=1 O_NOBATCH=1 O_NOFIFO=1 O_NOSSN=1 clean install

PACKS="${PACKS} firefox"
# PACKS="${PACKS} vimb"
# PACKS="${PACKS} elinks"

PACKS="${PACKS} zathura-pdf-mupdf" # required for any document viewing
git clone "https://git.pwmt.org/pwmt/girara.git" "${TMP_DIR}/girara/"
cd "${TMP_DIR}/girara"
git checkout 1b60a46481f6ba37e7515ca80d6f627583f7100f
meson build
cd build
ninja
sudo ninja install
git clone "https://git.pwmt.org/pwmt/zathura.git" "${TMP_DIR}/zathura-git"
cd "${TMP_DIR}/zathura-git"
git checkout 02a8877f771b3af4c5a8758ded756aae7f469dcb
meson build
cd build
ninja
sudo ninja install

PACKS="${PACKS} htop"
PACKS="${PACKS} neofetch"

PACKS="${PACKS} redshift"

PACKS="${PACKS} xclip"
PACKS="${PACKS} fzf"
PACKS="${PACKS} feh mpv"
PACKS="${PACKS} slop"
PACKS="${PACKS} yarn"

PACKS="${PACKS} ncmpcpp"

# mpd
git clone "https://github.com/MusicPlayerDaemon/MPD.git" "${TMP_DIR}/mpd"
cd "${TMP_DIR}/mpd"
git checkout eb9f5339b683d037ab3224e362071e22991e0e83
meson . output/release
meson configure output/release -Dcpp_args="-I/usr/local/include" -Dpulse="disabled"
sudo ninja -C output/release install

PACKS="${PACKS} newsboat"

PACKS="${PACKS} texlive-full"

sudo pkg install $PACKS

# firefox profile setup
$DETEMPLATE "${XDG_CONFIG_HOME}/mozilla/template.user.js"
DISPLAY=:0 firefox -CreateProfile "${FF_PROFILE}"
baseDir="${HOME}/.mozilla/firefox"
profileDir="$(ls "${baseDir}" | grep ".${FF_PROFILE}")"
ffDir="${baseDir}/${profileDir}"
rm -f "${ffDir}/chrome" >/dev/null
rm -f "${ffDir}/user.js" >/dev/null
ln -sf "${XDG_CONFIG_HOME}/mozilla/profile/chrome" "${ffDir}/chrome"
ln -sf "${XDG_CONFIG_HOME}/mozilla/user.js" "${ffDir}/user.js"

# get Xresources script
git clone "https://github.com/tamirzb/xgetres.git" "${TMP_DIR}/xgetres"
cd "${TMP_DIR}/xgetres"
git checkout 2505f065e0c7ed990d8d71c0d8bd7106c8ab16f2
cp "${XDG_CONFIG_HOME}/xgetres/Makefile" "${TMP_DIR}/xgetres/"
sudo make clean install

$SBUILD st
$SBUILD herbe
$SBUILD slock

# gtk theme
$DETEMPLATE "${XDG_CONFIG_HOME}/${THEME}/gtk-3.0/template._colors.scss"
sudo mkdir -p "${GTK_THEME_DIR}"
sudo ln -sf "${XDG_CONFIG_HOME}/${THEME}" "${GTK_THEME_DIR}/${THEME}"
cd "${GTK_THEME_DIR}/${THEME}" && yarn && yarn build &

# fonts
mkdir -p "${FONT_DIR}"
sudo cp -v ${XDG_CONFIG_HOME}/fonts/* "${FONT_DIR}/"
fc-cache -f -v

# motd
echo "" | sudo tee "/etc/motd"
