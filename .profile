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


# runtime directory
if [ $OS = $OS_FREEBSD ]; then
  export XDG_RUNTIME_DIR="/tmp"
fi

#
# display
#

export RES_WIDTH=1920
export RES_HEIGHT=1080

export THEME_LIGHT="light"
export THEME_DARK="dark"

export CURRENT_THEME_MODE="$THEME_LIGHT"

export THEME="DotfilesGtk"

export GTK_THEME="$THEME"
export GTK2_RC_FILES="$XDG_CONFIG_HOME/gtk-2.0/gtkrc"

# window settings

export W_ALPHA=1
export W_ALPHA_HEX="FF" # higher value means more opaque

export W_BORDER_WIDTH=3
export W_CORNER_RADIUS=0
export W_GAPS=16

#
# default programs
#

# editor
export EDITOR="nvim"

# terminal
case $OS in
  $OS_LINUX)
    export TERM="st"
    export TERM_ARGS="$TERM -A $W_ALPHA"
    ;;
  $OS_FREEBSD)
    export TERM="st"
    export TERM_ARGS="$TERM"
    ;;
  *) export TERM_ARGS="$TERM" ;;
esac
export TERMINAL="$TERM"

# browser
export BROWSER="firefox"

# file explorer
export FILE_EXPLORER="vifm"

export MUSIC_PLAYER="spotify"
export MUSIC_PLAYER_ARGS="spicetify config current_theme DotfilesSpicetify && spicetify apply"

export PDF_VIEWER="zathura"

export SYSTEM_PROFILER="htop"

# notifications
case $OS in
  $OS_LINUX) export NOTIFICATION_MANAGER="dunst" ;;
  *) export NOTIFICATION_MANAGER="" ;;
esac

# panel/bar
case $OS in
  $OS_LINUX)
    export BAR="polybar"
    export BAR_ARGS="$BAR -r main"
    ;;
  *)
    export BAR=""
    export BAR_ARGS="$BAR"
    ;;
esac

# compositor
case $OS in
  $OS_LINUX)
    export COMPOSITOR="picom"
    export COMPOSITOR_ARGS="$COMPOSITOR --experimental-backends"
    ;;
  *)
    export COMPOSITOR=""
    export COMPOSITOR_ARGS="$COMPOSITOR"
    ;;
esac

export WM="bspwm"

#
# variables
#

export DOLLAR='$' # vital for envsubst escaping

export KEYTIMEOUT=1 # reduce delay in zsh vi-mode change
export PROMPT_EOL_MARK="" # prevent partial line % from appearing
export RANGER_LOAD_DEFAULT_RC="FALSE"
export REDSHIFT_LAST="$XDG_CACHE_HOME/redshift_last"
export SHELL="/bin/sh" # explicit shell declaration

# TODO remove
if [ $OS = $OS_LINUX ]; then
  export SHELL="/bin/zsh"
fi

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
export YARN_CACHE_FOLDER="$XDG_CACHE_HOME/yarn"
export YARN_GLOBAL_DIR="$XDG_CACHE_HOME/yarn_global"
export YARN_RC_DIR="$XDG_CACHE_HOME"
export XAUTHORITY="$XDG_CONFIG_HOME/Xauthority"

# TODO remove
export ZDOTDIR="$XDG_CONFIG_HOME/zsh/"

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
export PROCESS="$TUI_DIR/process"
export SBUILD="$TUI_DIR/sbuild"
export SCREEN="$TUI_DIR/screen"
export SHELLMENU="$GUI_DIR/shell-menu"

#
# path
#

export PATH="$HOME/.local/bin:$PATH"

#
# includes
#

# colors
. $XDG_CONFIG_HOME/colorrc

# app-specific environment variables
. $XDG_CONFIG_HOME/apprc

#
# misc color (ordered after main color declarations)
#

export FZF_DEFAULT_OPTS="--color=\"$FZF_COLORS\""

# background command
# xsetroot doesn't work here because the compositor overrides background changes
export BACKGROUND="hsetroot -solid $G_BG -tile $XDG_CONFIG_HOME/wallpapers/tile-$CURRENT_THEME_MODE.jpg"

# startx
case $(tty) in
  "/dev/ttyv0" | "/dev/tty1")
    case $OS in
      $OS_FREEBSD)
        # ! pgrep -x Xorg >/dev/null && exec startx -- -nocursor
        sudo moused -p /dev/psm0
        ! pgrep -x Xorg >/dev/null && exec startx
        ;;
      *)
        ! pgrep -x Xorg >/dev/null && exec startx
        ;;
    esac
    ;;
esac
