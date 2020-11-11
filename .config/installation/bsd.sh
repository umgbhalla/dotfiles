#!/bin/sh

sudo pkg install cmake gmake meson pkgconf python

sudo portsnap fetch
sudo portsnap extract

PACKS=""
PACKS="${PACKS} xorg drm-kmod"
PACKS="${PACKS} bspwm sxhkd"
PACKS="${PACKS} sourcecodepro-ttf"

# bar
git clone "https://github.com/krypt-n/bar.git" "${TMP_DIR}/lemonbar-xft"
cp -f "${XDG_CONFIG_HOME}/lemonbar/Makefile" "${TMP_DIR}/lemonbar-xft/"
cd "${TMP_DIR}/lemonbar-xft"
sudo gmake clean install

PACKS="${PACKS} picom"
PACKS="${PACKS} hsetroot"

PACKS="${PACKS} neovim node ripgrep"
PACKS="${PACKS} vifm"
PACKS="${PACKS} firefox"

PACKS="${PACKS} gettext zathura-pdf-mupdf" # required for any document viewing
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
PACKS="${PACKS} feh"
PACKS="${PACKS} slop"
PACKS="${PACKS} yarn"

PACKS="${PACKS} textlive-full"

sudo pkg install $PACKS

# grub (optional) - TODO
# cd /usr/ports/sysutils/grub2-bhyve
# sudo make clean install

# get Xresources
git clone "https://github.com/tamirzb/xgetres.git" "${TMP_DIR}/xgetres"
cd "${TMP_DIR}/xgetres"
git checkout 2505f065e0c7ed990d8d71c0d8bd7106c8ab16f2
cp "${XDG_CONFIG_HOME}/xgetres/Makefile" "${TMP_DIR}/xgetres/"
sudo make clean install

# relink /bin/sh
# sudo ln -sf mksh /bin/sh

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
cp -v ${XDG_CONFIG_HOME}/fonts/* "${FONT_DIR}/"
fc-cache -f -v

# motd
echo "" | sudo tee "/etc/motd"
