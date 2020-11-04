#!/bin/sh

TMP_DIR="/tmp"

# unset git config to prevent yay errors
gcfg="$GIT_CONFIG"
unset GIT_CONFIG

PACKS="bspwm sxhkd"
PACKS="$PACKS libxft"
PACKS="$PACKS neovim nodejs ripgrep"
PACKS="$PACKS firefox"
PACKS="$PACKS fzf"
PACKS="$PACKS feh"
PACKS="$PACKS ttf-liberation"
PACKS="$PACKS redshift"
PACKS="$PACKS vifm ueberzug"
PACKS="$PACKS xorg-xsetroot hsetroot"
PACKS="$PACKS xclip"
PACKS="$PACKS htop"
PACKS="$PACKS man"
PACKS="$PACKS slop"
PACKS="$PACKS openssh"
PACKS="$PACKS mpy"
PACKS="$PACKS newsboat"
PACKS="$PACKS yarn"
PACKS="$PACKS zathura-pdf-mupdf"
PACKS="$PACKS ffmpeg"

sudo pacman -S --needed "$PACKS"

AUR="bc"
AUR="$AUR picom-ibhagwan-git"
AUR="$AUR adobe-source-code-pro-fonts"
AUR="$AUR pulseaudio pulseaudio-alsa pulseaudio-ctl"
AUR="$AUR zathura-git"
AUR="$AUR youtube-dl"
AUR="$AUR dunst"

yay -S --needed --batchinstall "$AUR"

git clone "https://github.com/krypt-n/bar.git" "$TMP_DIR/lemonbar-xft"
sudo make clean install

$SBUILD "st"

sudo ln -sf "$XDG_CONFIG_HOME/$THEME" "$GTK_THEME_DIR/$THEME"
cd "$GTK_THEME_DIR/$THEME" && yarn && yarn build &

FONT_DIR="$XDG_DATA_HOME/fonts"
mkdir -p "$FONT_DIR"
cp -v "$XDG_CONFIG_HOME/fonts/*" "$FONT_DIR/"
fc-cache -f -v

# reset git config
GIT_CONFIG="$gcfg"
