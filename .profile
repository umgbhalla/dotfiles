# environmental variables set on login

# config directory
export XDG_CONFIG_HOME="$HOME/.config"
# cache directory
export XDG_CACHE_HOME="$HOME/.cache"
# script directory
export XDG_SCRIPT_HOME="$XDG_CONFIG_HOME/scripts"

#
# default programs
#

export EDITOR="nvim"

export TERM="st"
export TERMINAL="$TERM"

export BROWSER="brave"
export BROWSER_INCOGNITO="brave"

export BAR="polybar"
export BAR_ARGS="$BAR -r main"

export FILE_EXPLORER="ranger"

export SYSTEM_PROFILER="htop"

#
# display
#

# colors
export COLOR_BG="#2e3440"
export COLOR_FG="#eceff4"
# pink
export COLOR_PRIMARY="#febdf7"
# blue
export COLOR_SECONDARY="#81a1c1"
# purple
export COLOR_TERTIARY="#5d62ac"
# red
export COLOR_ALERT="#bf616a"

export WM_GAPS=10
export WM_BAR_HEIGHT=${$(( $WM_GAPS * 3 ))%.*}
export WM_TOP_PADDING=$(( $WM_GAPS + $WM_BAR_HEIGHT ))

export NOTIF_WIDTH_OFFSET=-1000
export NOTIF_HEIGHT=100
export NOTIF_X_OFFSET=$(( $NOTIF_WIDTH_OFFSET * -1 / 2 ))
export NOTIF_Y_OFFSET=$(( $WM_GAPS + $WM_BAR_HEIGHT / 2 ))

#
# path
#

export PATH="$HOME/.local/bin/:$PATH"

# to move global yarn directory
# mkdir -p ~/.local/share/yarn
# yarn config set prefix $HOME/.local/share/yarn
export PATH="$(yarn global bin):$PATH"

#
# variables
#

export KEYTIMEOUT=1 # reduce delay in zsh vi-mode change
export PROMPT_EOL_MARK="" # prevent partial line % from appearing
export RANGER_LOAD_DEFAULT_RC="FALSE"
export REDSHIFT_LAST="$XDG_CACHE_HOME/redshift_last"
export SHELL="/bin/zsh"

export ETH_INTERFACE="$(ip -o link show | awk -F': ' '{print $2}' | grep e)"
export WIFI_INTERFACE="$(ip -o link show | awk -F': ' '{print $2}' | grep w)"

#
# config directories
#

export GIT_CONFIG="$XDG_CONFIG_HOME/git/config"
export GIT_TEMPLATE_DIR="$XDG_CONFIG_HOME/git/template"
export LESSHISTFILE="$XDG_CACHE_HOME/less_history"
export ZDOTDIR="$XDG_CONFIG_HOME/zsh/"
