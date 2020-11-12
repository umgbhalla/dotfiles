#!/bin/sh
# core environmental variables set on login

# operating systems

export OS="$(uname)"
export OS_MACOS="Darwin"
export OS_LINUX="Linux"
export OS_FREEBSD="FreeBSD"

#
# directories
#

# config directory
export XDG_CONFIG_HOME="$HOME/.config"
# cache directory
export XDG_CACHE_HOME="$HOME/.cache"
# script directory
export XDG_SCRIPT_HOME="$HOME/.local/bin"
# data directory
export XDG_DATA_HOME="$HOME/.local/share"
# repo directory
export XDG_REPO_HOME="$HOME/Repos"

# tmp directory
export TMP_DIR="/tmp"
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
  export CURRENT_THEME_MODE="${THEME_LIGHT}"
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
  "$OS_LINUX"|"$OS_FREEBSD")
    export TERM="st"
    export TERM_ARGS="$TERM"
    ;;
  *) export TERM_ARGS="$TERM" ;;
esac
export TERMINAL="$TERM"

# browser
export BROWSER="firefox"

# file explorer
export FILE_EXPLORER="nnn"
export FILE_EXPLORER_ARGS="${FILE_EXPLORER}"

export MUSIC_PLAYER="spotify"
export MUSIC_PLAYER_ARGS="spicetify config current_theme DotfilesSpicetify && spicetify apply"

export PDF_VIEWER="zathura"

export SYSTEM_PROFILER="htop"

# notifications
export NOTIFICATION_MANAGER="herbe"

# panel/bar
case "$OS" in
  "$OS_LINUX"|"$OS_FREEBSD")
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
case "${OS}" in
  "${OS_LINUX}"|"${OS_FREEBSD}")
    export COMPOSITOR="picom"
    export COMPOSITOR_ARGS="$COMPOSITOR -CG"
    ;;
  *)
    export COMPOSITOR=""
    export COMPOSITOR_ARGS="$COMPOSITOR"
    ;;
esac

export PAGER="less"

export WM="bspwm"

#
# variables
#


export DOLLAR="$" # vital for envsubst escaping
export NNN_BMS="b:${HOME};h:${HOME};d:${HOME}/Downloads;c:${XDG_CONFIG_HOME}"
export NNN_COLORS="1111"
export NNN_FCOLORS="0c04010a070d0b07010b0b01"
export NNN_OPTS="degHQ"
export NNN_TMPFILE="${XDG_CONFIG_HOME}/nnn/.lastd" # cannot be changed
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
export XRDB_UPDATE="xrdb -merge ${XDG_CONFIG_HOME}/Xresources"

# vertical line jumping
export VI_NAV_JUMP="5"
export VI_NAV_JUMP_LARGE="25"

#
# cache and config directories
#

export BOOKMARK_CONFIG="$XDG_CONFIG_HOME/bookmarks"
export ENV="$XDG_CONFIG_HOME/sh/shrc"
export GIT_CONFIG="$XDG_CONFIG_HOME/git/config"
export GIT_TEMPLATE_DIR="$XDG_CONFIG_HOME/git/template"
export LESSHISTFILE="$XDG_CACHE_HOME/less_history"
export NEWSBOAT_CONFIG="$XDG_CONFIG_HOME/newsboat"
export NPM_CONFIG_CACHE="$XDG_CACHE_HOME/npm"
export SH_HISTFILE="$XDG_CACHE_HOME/sh_history"
export YARN_CACHE_FOLDER="$XDG_CACHE_HOME/yarn"
export YARN_GLOBAL_DIR="$XDG_CACHE_HOME/yarn_global"
export YARN_RC_DIR="$XDG_CACHE_HOME"
export XAUTHORITY="$XDG_CONFIG_HOME/Xauthority"

#
# scripts
#

export GUI_DIR="$XDG_SCRIPT_HOME/gui"
export TUI_DIR="$XDG_SCRIPT_HOME/tui"

export AUDIO="$TUI_DIR/audio"
export DETEMPLATE="$TUI_DIR/detemplate"
export HEX2FF="$TUI_DIR/hex2ff"
export HEX2RGB="$TUI_DIR/hex2rgb"
export LAUNCHER="$GUI_DIR/launcher"
export REDSHIFT="$TUI_DIR/redshift"
export SBUILD="$TUI_DIR/sbuild"
export SCREEN="$TUI_DIR/screen"
export SHELLMENU="$GUI_DIR/shell-menu"
export SWITCHTHEME="$TUI_DIR/switch-theme"

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
# misc color (ordered after main color declarations)
#

export FZF_DEFAULT_OPTS="--color=\"$FZF_COLORS\""

# background command
# xsetroot doesn't work here because the compositor overrides background changes
export BACKGROUND="hsetroot -solid ${G_BG} -cover ${XDG_CONFIG_HOME}/wallpapers/cover-${CURRENT_THEME_MODE}.jpg"

# startx
if command -v "startx" >/dev/null; then
  case "$(tty)" in
    "/dev/ttyv0" | "/dev/tty1")
      case "$OS" in
        "$OS_FREEBSD")
          # exec startx -- -nocursor
          sudo moused -p /dev/psm0
          exec startx
          ;;
        *)
          exec startx
          ;;
      esac
      ;;
  esac
fi
