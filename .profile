#!/bin/sh
# core environmental variables set on login

# operating systems

export OS="$(uname)"
export OS_MACOS="Darwin"
export OS_LINUX="Linux"
export OS_FREEBSD="FreeBSD"
export OS_OPENBSD="OpenBSD"

#
# directories
#

# config directory
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CONFIG_DIR="$XDG_CONFIG_HOME"
# cache directory
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_CACHE_DIR="$XDG_CACHE_HOME"
# script directory
export XDG_SCRIPT_HOME="$HOME/.local/bin"
# data directory
export XDG_DATA_HOME="$HOME/.local/share"
# repo directory
export XDG_REPO_HOME="$HOME/Repos"
# desktop directory
export XDG_DESKTOP_DIR="${XDG_CACHE_HOME}/Desktop"

# tmp directory
export TMP_DIR="/tmp"
# opt directory
export OPT_DIR="/opt"
# local font directory
export FONT_DIR="${XDG_DATA_HOME}/fonts"

#
# display
#

export RES_WIDTH="1920"
export RES_HEIGHT="1080"

export THEME_LIGHT="light"
export THEME_DARK="dark"

if [ -z "${CURRENT_THEME_MODE}" ]; then
  export CURRENT_THEME_MODE="${THEME_DARK}"
fi

export THEME="gtk-theme"
export GTK_THEME_DIR="/usr/share/themes"

export GTK_THEME="${THEME}:${CURRENT_THEME_MODE}"
export GTK2_RC_FILES="$XDG_CONFIG_HOME/gtk-2.0/gtkrc"

# window settings

export W_ALPHA="1"
export W_ALPHA_HEX="FF" # higher value means more opaque

export W_BORDER_WIDTH="1"
export W_CORNER_RADIUS="0"
export W_GAPS="16"

#
# default programs
#

# editor
export EDITOR="nvim"
export VISUAL="${EDITOR}"

# terminal
case "$OS" in
  "$OS_LINUX"|"$OS_FREEBSD"|"$OS_OPENBSD")
    export TERM="st"
    export TERM_ARGS="$TERM"
    ;;
  *) export TERM_ARGS="$TERM" ;;
esac
export TERMINAL="$TERM"

# browser
export BROWSER="firefox"
export BROWSER_ARGS="${BROWSER}"
export BROWSER_INCOGNITO="${BROWSER} -private-window"

# file explorer
export FILE_EXPLORER="vifm"
export FILE_EXPLORER_ARGS="${FILE_EXPLORER}"

# document viewer
export PDF_VIEWER="zathura"

# system profiler
export SYSTEM_PROFILER="htop"

# notifications
export NOTIFICATION_MANAGER="herbe"

# panel/bar
case "$OS" in
  "$OS_LINUX"|"$OS_FREEBSD"|"$OS_OPENBSD")
    # updated further in apprc file
    export BAR="lemonbar"
    export BAR_ARGS=""
    export BAR_UPDATE=""
    ;;
  *)
    export BAR=""
    export BAR_ARGS="$BAR"
    export BAR_UPDATE=""
    ;;
esac

# compositor
case "$OS" in
  "$OS_LINUX"|"$OS_FREEBSD"|"$OS_OPENBSD")
    export COMPOSITOR="picom"
    export COMPOSITOR_ARGS="${COMPOSITOR} -CG"
    ;;
  *)
    export COMPOSITOR=""
    export COMPOSITOR_ARGS="${COMPOSITOR}"
    ;;
esac

# music player
export MUSIC_PLAYER=""
export MUSIC_PLAYER_ARGS="${MUSIC_PLAYER}"
if [ "$OS" == "$OS_LINUX" ]; then
  export MUSIC_PLAYER="spotify"
  export MUSIC_PLAYER_ARGS="${MUSIC_PLAYER}"
fi

# pager
export PAGER="less"

# window manager
export WM="bspwm"

#
# variables
#

case "$OS" in
  "$OS_FREEBSD")
    export AUDIO_ARCH="oss"
    export AUDIO_OUTPUT="${AUDIO_ARCH}"
    ;;
  "$OS_OPENBSD")
    export AUDIO_ARCH="sndio"
    export AUDIO_OUTPUT="${AUDIO_ARCH}"
    ;;
  "$OS_LINUX")
    export AUDIO_ARCH="alsa"
    if command -v "pulseaudio" >/dev/null; then
      export AUDIO_OUTPUT="pulse"
    else
      export AUDIO_OUTPUT="alsa"
    fi
    ;;
esac
export DOLLAR="$" # vital for envsubst escaping
export ELINKS_CONFDIR="${XDG_CONFIG_HOME}/elinks"
export ELINKS_XTERM="st -e"
export FF_PROFILE="main"
export PROMPT_EOL_MARK="" # prevent partial line % from appearing
export REDSHIFT_LAST="$XDG_CACHE_HOME/redshift_last"
case "${OS}" in
  "${OS_LINUX}")
    export SHELL_NAME="mksh"
    export SHELL="/bin/${SHELL_NAME}"
    ;;
  "${OS_FREEBSD}")
    export SHELL_NAME="mksh"
    export SHELL="/usr/local/bin/${SHELL_NAME}"
    ;;
  *)
    export SHELL_NAME="sh"
    export SHELL="/bin/${SHELL_NAME}"
    ;;
esac
export UID="$(id -u)"
export VI_NAV_JUMP="5"
export VI_NAV_JUMP_LARGE="25"
export XRDB_RESOURCES="${XDG_CONFIG_HOME}/Xdefaults/Xresources"
export XRDB_UPDATE="xrdb -merge ${XRDB_RESOURCES}"

#
# cache and config directories
#

export ABOOK_CONFIG="$XDG_CONFIG_HOME/abook/abookrc"
export BOOKMARK_CONFIG="$XDG_DATA_HOME/sh_bookmarks"
export CARGO_HOME="$XDG_CACHE_HOME/cargo"
export ENV="$XDG_CONFIG_HOME/sh/shrc"
export GIT_CONFIG="$XDG_CONFIG_HOME/git/config"
export GIT_TEMPLATE_DIR="$XDG_CONFIG_HOME/git/template"
export GNUPGHOME="${XDG_CONFIG_HOME}/gnupg"
export LESSHISTFILE="$XDG_CACHE_HOME/less_history"
export LESSKEY="$XDG_CACHE_HOME/lesskey_generated"
export NEWSBOAT_CONFIG="$XDG_CONFIG_HOME/newsboat"
export NPM_CONFIG_CACHE="$XDG_CACHE_HOME/npm"
export PYTHONSTARTUP="$XDG_CONFIG_HOME/python/pythonrc"
export SH_HISTFILE="$XDG_CACHE_HOME/sh_history"
export YARN_CACHE_FOLDER="$XDG_CACHE_HOME/yarn"
export YARN_GLOBAL_DIR="$XDG_CACHE_HOME/yarn_global"
export YARN_RC_DIR="$XDG_CACHE_HOME"
export YARN_RC_FILENAME="$XDG_CONFIG_HOME/yarn/.yarnrc.yml"
export XAUTHORITY="${XDG_CONFIG_HOME}/Xdefaults/Xauthority"

#
# scripts
#

export AUDIO="$XDG_SCRIPT_HOME/audio"
export CURSOR="$XDG_SCRIPT_HOME/cursor"
export DETEMPLATE="$XDG_SCRIPT_HOME/detemplate"
export DET="$DETEMPLATE"
export HEX2FF="$XDG_SCRIPT_HOME/hex2ff"
export HEX2RGB="$XDG_SCRIPT_HOME/hex2rgb"
export LAUNCHER="$XDG_SCRIPT_HOME/launcher"
export REDSHIFT="$XDG_SCRIPT_HOME/rshift"
export RMONITOR="$XDG_SCRIPT_HOME/rmonitor"
export SBUILD="$XDG_SCRIPT_HOME/sbuild"
export SCREEN="$XDG_SCRIPT_HOME/screen"
export SHELLMENU="$XDG_SCRIPT_HOME/shell-menu"
export SETTHEME="$XDG_SCRIPT_HOME/set-theme"
export YT="$XDG_SCRIPT_HOME/yt"

#
# path
#

export PATH="$HOME/.local/bin:$PATH"

#
# includes
#

# colors
. "$XDG_CONFIG_HOME/colorrc"

# app-specific environment variables
. "$XDG_CONFIG_HOME/apprc"

#
# misc app variables (ordered after main app declarations)
#

# fzf
export FZF_DEFAULT_OPTS="--bind $FZF_BINDINGS --color=\"$FZF_COLORS\""

# Firefox profile
export BROWSER_ARGS="${BROWSER} -P ${FF_PROFILE}"

# background command
# xsetroot doesn't work here because the compositor overrides background changes
export BACKGROUND="hsetroot -solid ${G_BG} -cover ${XDG_CONFIG_HOME}/wallpapers/cover-${CURRENT_THEME_MODE}.jpg"

# startx
if command -v "startx" >/dev/null; then
  case "$(tty)" in
    "/dev/ttyv0" | "/dev/tty1" | "/dev/ttyC0")
      case "$OS" in
        "$OS_FREEBSD")
          exec startx -- -nocursor
          # sudo moused -p /dev/psm0
          # exec startx
          ;;
        "$OS_OPENBSD") exec startx ;;
        "$OS_LINUX") exec startx ;;
      esac
      ;;
  esac
fi
