#!/bin/sh

PACKS=""
PACKS="${PACKS} cmake meson python"
PACKS="${PACKS} xorg drm-kmod"
PACKS="${PACKS} bspwm sxhkd"
PACKS="${PACKS} pkgconf"
PACKS="${PACKS} sourcecodepro-ttf"

# bar
git clone "https://github.com/krypt-n/bar.git" "${TMP_DIR}/lemonbar-xft"
cp -f "${XDG_CONFIG_HOME}/lemonbar/Makefile" "${TMP_DIR}/lemonbar-xft/"
cd "${TMP_DIR}/lemonbar-xft"
doas gmake clean install

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
doas ninja install
git clone "https://git.pwmt.org/pwmt/zathura.git" "${TMP_DIR}/zathura-git"
cd "${TMP_DIR}/zathura-git"
git checkout 02a8877f771b3af4c5a8758ded756aae7f469dcb
meson build
cd build
ninja
doas ninja install

PACKS="${PACKS} htop"
PACKS="${PACKS} neofetch"

PACKS="${PACKS} redshift"

PACKS="${PACKS} xclip"
PACKS="${PACKS} fzf"
PACKS="${PACKS} feh"

doas pkg install $PACKS

# relink /bin/sh
doas ln -sfT mksh /bin/sh

$SBUILD st
$SBUILD herbe

# gtk theme
doas mkdir -p "${GTK_THEME_DIR}"
doas ln -sf "${XDG_CONFIG_HOME}/${THEME}" "${GTK_THEME_DIR}/${THEME}"
cd "${GTK_THEME_DIR}/${THEME}" && yarn && yarn build &

# fonts
mkdir -p "${FONT_DIR}"
cp -v "${XDG_CONFIG_HOME}/fonts/*" "${FONT_DIR}/"
fc-cache -f -v

