#!/bin/sh

TMP_DIR="/tmp"

# unset git config to prevent yay errors
gcfg="$GIT_CONFIG"
unset GIT_CONFIG

git clone "https://aur.archlinux.org/yay.git" "$TMP_DIR/yay"
cd "$TMP_DIR/yay" && makepkg -si

PACKS="xorg-server xorg-xinit"
PACKS="$PACKS bspwm sxhkd"
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
PACKS="$PACKS mpv"
PACKS="$PACKS newsboat"
PACKS="$PACKS yarn"
PACKS="$PACKS zathura-pdf-mupdf"
PACKS="$PACKS ffmpeg"
PACKS="$PACKS pulseaudio pulseaudio-alsa pamixer pavucontrol"

sudo pacman -S --needed $PACKS # cannot be quoted

AUR="bc"
AUR="$AUR picom-ibhagwan-git"
AUR="$AUR adobe-source-code-pro-fonts"
AUR="$AUR zathura-git"
AUR="$AUR youtube-dl"

yay -S --needed --batchinstall $AUR # cannot be quoted

git clone "https://github.com/krypt-n/bar.git" "$TMP_DIR/lemonbar-xft"
cd "$TMP_DIR/lemonbar-xft" && sudo make clean install

# relink /bin/sh
sudo ln -sfT mksh /bin/sh

# suckless
$SBUILD "st"
$SBUILD "herbe"

# gtk theme
sudo mkdir -p "$GTK_THEME_DIR"
sudo ln -sf "$XDG_CONFIG_HOME/$THEME" "$GTK_THEME_DIR/$THEME"
cd "$GTK_THEME_DIR/$THEME" && yarn && yarn build &

# font(s)
FONT_DIR="$XDG_DATA_HOME/fonts"
mkdir -p "$FONT_DIR"
cp -v $XDG_CONFIG_HOME/fonts/* "$FONT_DIR/"
fc-cache -f -v

# touchpad
sudo ln -sf "$XDG_CONFIG_HOME/xorg.conf.d/30-touchpad.conf" "/etc/X11/xorg.conf.d/30-touchpad.conf"

# login prompt
if command -v "figlet"; then
  issue="$(cat "/etc/hostname" | figlet -k | sed 's/\\/\\\\\\/g')"
  issuestatus="(\\l) \\s \\\r \\\t"
  # -e interprets \n as a new line character
  echo -e "${issue}\n${issuestatus}" | sudo tee "/etc/issue" > /dev/null
fi

# motd
echo "" | sudo tee "/etc/motd"

# reset git config
GIT_CONFIG="$gcfg"
