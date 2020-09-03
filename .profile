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
export WM_BAR_HEIGHT=28
export WM_BAR_WIDTH="100%:-$(( $WM_GAPS * 2 ))"
export WM_TOP_PADDING=$(( $WM_GAPS + $WM_BAR_HEIGHT ))
export WM_TRANSPARENCY="0.85"

export WINDOW_BORDER_RADIUS=8

export NOTIF_WIDTH=400
export NOTIF_HEIGHT=70
export NOTIF_ICON_SIZE=$(( $NOTIF_HEIGHT * 0.8 ))
export NOTIF_X_SYM="-"
export NOTIF_X_OFFSET=$(( $WM_GAPS * 2 ))
export NOTIF_Y_SYM="-"
export NOTIF_Y_OFFSET=$(( $WM_GAPS * 2 ))

export GTK2_RC_FILES="$XDG_CONFIG_HOME/gtk-2.0/gtkrc-2.0"

# index indicating which wallpaper to display
export WALLPAPER="synth"

# background command
export BACKGROUND="feh --bg-fill --no-fehbg $XDG_CONFIG_HOME/wallpapers/$WALLPAPER.png"

# font
export FONT_MONO="Source Code Pro Medium:pixelsize=15:antialias=true:autohint=true"
export FONT_SANS="Source Sans Pro Medium:bold:pixelsize=15:antialias=true:autohint=true"

export FONT_NOTIF="Source Code Pro Medium 12"

export FONT="$FONT_MONO";

export C_BLACK_0="#171520"
export C_BLACK_1="#4c516a"

export C_RED_0="#c83d65"
export C_RED_1="#f787a7"

export C_GREEN_0="#1a542d"
export C_GREEN_1="#369454"

export C_YELLOW_0="#e79751"
export C_YELLOW_1="#f1c42c"

export C_BLUE_0="#10385c"
export C_BLUE_1="#4079b7"

export C_MAGENTA_0="#7d45aa"
export C_MAGENTA_1="#a074c4"

export C_CYAN_0="#519aba"
export C_CYAN_1="#8dc9e4"

export C_GRAY_0="#e5e9f0"
export C_GRAY_1="#eceff4"

# C_BLACK_0 with WM_TRANSPARENCY
export C_BLACK_0_A="$($HEX2RGB $C_BLACK_0 | sed -e s/b/ba/ -e s/\)/,$WM_TRANSPARENCY\)/)"

# higher hex means higher transparency
export NOTIF_BG="${C_RED_0}99"

# higher hex means more opaque
export DISCORD_BG="${C_BLACK_0}aa"
export DISCORD_BG_DARK="${C_BLACK_0}22"
export DISCORD_FG="${C_GRAY_0}22"
export DISCORD_ACC_PRIMARY="${C_RED_0}55"
export POLYBAR_BG="#dd${C_BLACK_0:1}"

export COLOR_BG="$POLYBAR_BG"
export COLOR_FG="$C_GRAY_1"

export COLOR_PRIMARY="$C_RED_0"
export COLOR_SECONDARY="$C_CYAN_0"
export COLOR_TERTIARY="$C_MAGENTA_1"
export COLOR_ALERT="$C_RED_0"
