# core environmental variables set on login

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

if [ $CURRENT_THEME_MODE = $THEME_DARK ]; then
  export W_ALPHA=1
  export W_ALPHA_HEX="FF" # higher value means more opaque

  export W_BORDER_WIDTH=0
  export W_CORNER_RADIUS=2
  export W_GAPS=16
fi

#
# default programs
#

export OS="$(uname)"
export OS_MACOS="Darwin"

export EDITOR="nvim"

if [ $OS != $OS_MACOS ]; then
  export TERM="st"
  export TERM_ARGS="$TERM -A $W_ALPHA"
fi
export TERMINAL="$TERM"

export BROWSER="firefox"

export FILE_EXPLORER="ranger"

export MUSIC_PLAYER="spotify"
export MUSIC_PLAYER_ARGS="spicetify config current_theme DotfilesSpicetify && spicetify apply"

export PDF_VIEWER="zathura"

export SYSTEM_PROFILER="htop"

export NOTIFICATION_MANAGER="dunst"

export BAR="polybar"
export BAR_ARGS="$BAR -r main"

export COMPOSITOR="picom"
export COMPOSITOR_ARGS="$COMPOSITOR --experimental-backends"

export WM="bspwm"

#
# variables
#

export DOLLAR='$' # vital for envsubst escaping

export KEYTIMEOUT=1 # reduce delay in zsh vi-mode change
export PROMPT_EOL_MARK="" # prevent partial line % from appearing
export RANGER_LOAD_DEFAULT_RC="FALSE"
export REDSHIFT_LAST="$XDG_CACHE_HOME/redshift_last"
export SHELL="/bin/zsh"

# eth0 and wlan0 interfaces
if [ $OS != $OS_MACOS ]; then
  export ETH_INTERFACE="$(ip -o link show | awk -F': ' '{print $2}' | grep e)"
  export WIFI_INTERFACE="$(ip -o link show | awk -F': ' '{print $2}' | grep w)"
fi

# vertical line jumping
export VI_NAV_JUMP="5"
export VI_NAV_JUMP_LARGE="25"

#
# cache and config directories
#

export BOOKMARK_CONFIG="$XDG_CONFIG_HOME/bookmarks"
export GIT_CONFIG="$XDG_CONFIG_HOME/git/config"
export GIT_TEMPLATE_DIR="$XDG_CONFIG_HOME/git/template"
export LESSHISTFILE="$XDG_CACHE_HOME/less_history"
export NEWSBOAT_CONFIG="$XDG_CONFIG_HOME/newsboat"
export NPM_CONFIG_CACHE="$XDG_CACHE_HOME/npm"
export YARN_CACHE_FOLDER="$XDG_CACHE_HOME/yarn"
export YARN_GLOBAL_DIR="$XDG_CACHE_HOME/yarn_global"
export YARN_RC_DIR="$XDG_CACHE_HOME"
export ZDOTDIR="$XDG_CONFIG_HOME/zsh/"
export TUI_DIR="$XDG_SCRIPT_HOME/tui"

#
# scripts
#

export DETEMPLATE="$TUI_DIR/detemplate"
export HEX2FF="$TUI_DIR/hex2ff"
export HEX2RGB="$TUI_DIR/hex2rgb"
export LAUNCHER="$XDG_SCRIPT_HOME/launcher"
export REDSHIFT="$TUI_DIR/redshift"
export PROCESS="$TUI_DIR/process"
export SBUILD="$TUI_DIR/sbuild"
export SCREEN="$TUI_DIR/screen"
export SHELLMENU="$XDG_SCRIPT_HOME/shell-menu"

#
# path
#

export PATH="$HOME/.local/bin/:$PATH"

#
# includes
#

# colors
source $XDG_CONFIG_HOME/colorrc

# app-specific environment variables
source $XDG_CONFIG_HOME/apprc

#
# misc color (order)

# background command
# xsetroot doesn't work here because the compositor overrides background changes
export BACKGROUND="hsetroot -solid $G_BG -tile $XDG_CONFIG_HOME/wallpapers/tile.jpg"
