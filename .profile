# environmental variables set on login

#
# directories
#

# config directory
export XDG_CONFIG_HOME="$HOME/.config"
# cache directory
export XDG_CACHE_HOME="$HOME/.cache"
# script directory
export XDG_SCRIPT_HOME="$HOME/.local/bin/scripts"
# data directory
export XDG_DATA_HOME="$HOME/.local/share"
# repo directory
export XDG_REPO_HOME="$HOME/Repos"

#
# default programs
#

export OS="$(uname)"
export OS_MACOS="Darwin"

export EDITOR="nvim"

if [ $OS != $OS_MACOS ]; then
  export TERM="st"
  export TERMINAL="$TERM"
fi

export BROWSER="brave"
export BROWSER_INCOGNITO="brave"

export FILE_EXPLORER="ranger"

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

export DETEMPLATE=$TUI_DIR/detemplate
export HEX2RGB=$TUI_DIR/hex2rgb
export REDSHIFT=$TUI_DIR/redshift
export SBUILD=$TUI_DIR/sbuild
export SCREENSHOT=$TUI_DIR/screenshot

#
# path
#

export PATH="$HOME/.local/bin/:$PATH"

#
# display
#

export WM_GAPS=10
export WM_BAR_HEIGHT=${$(( $WM_GAPS * 3 ))%.*}
export WM_TOP_PADDING=$(( $WM_GAPS + $WM_BAR_HEIGHT ))
export WM_TRANSPARENCY="0.95"

export NOTIF_WIDTH_OFFSET=-1000
export NOTIF_HEIGHT=100
export NOTIF_X_OFFSET=$(( $NOTIF_WIDTH_OFFSET * -1 / 2 ))
export NOTIF_Y_OFFSET=$(( $WM_GAPS + $WM_BAR_HEIGHT / 2 ))
export NOTIF_FRAME_WIDTH=3
export NOTIF_TRANSPARENCY=$(( 100 - ( $WM_TRANSPARENCY * 100 ) ))

export GTK2_RC_FILES="$XDG_CONFIG_HOME/gtk-2.0/gtkrc-2.0"

# index indicating which wallpaper to display
export WALLPAPER=4

# background command
export BACKGROUND="feh --bg-fill --no-fehbg $XDG_CONFIG_HOME/wallpapers/$WALLPAPER.png"

export C_BLACK_0="#2e3440"
# C_BLACK_0 with WM_TRANSPARENCY
export C_BLACK_0_A="$($HEX2RGB $C_BLACK_0 | sed -e s/b/ba/ -e s/\)/,$WM_TRANSPARENCY\)/)"
# C_BLACK_0 with 0 transparency
export C_BLACK_0_A_0="$($HEX2RGB $C_BLACK_0 | sed -e s/b/ba/ -e s/\)/,0\)/)"
export C_BLACK_1="#4c566a"

export C_RED_0="#bf616a"
export C_RED_1="$C_RED_0"

export C_PINK_0="#febdf7"

export C_GREEN_0="#a3bE8C"
export C_GREEN_1="$C_GREEN_0"

export C_YELLOW_0="#ebcb8b"
export C_YELLOW_1="$C_YELLOW_0"

export C_BLUE_0="#81a1c1"
export C_BLUE_1="$C_BLUE_0"

export C_MAGENTA_0="#5d62ac"
export C_MAGENTA_1="#b48ead"

export C_CYAN_0="#88c0d0"
export C_CYAN_1="#8fbcbb"

export C_GRAY_0="#e5e9f0"
export C_GRAY_1="#eceff4"

export COLOR_BG="$C_BLACK_0"
export COLOR_FG="$C_GRAY_1"

export COLOR_PRIMARY="$C_PINK_0"
export COLOR_SECONDARY="$C_BLUE_0"
export COLOR_TERTIARY="$C_MAGENTA_0"
export COLOR_ALERT="$C_RED_0"
