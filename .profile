# environmental variables set on login

# config directory
export XDG_CONFIG_HOME="$HOME/.config"
# cache directory
export XDG_CACHE_HOME="$HOME/.cache"
# script directory
export XDG_SCRIPT_HOME="$HOME/.local/bin/scripts"
# data dirrectory
export XDG_DATA_HOME="$HOME/.local/share"

#
# default programs
#

export OS="$(uname)"

export EDITOR="nvim"

if [ $OS != "Darwin" ]; then
  export TERM="st"
  export TERMINAL="$TERM"
fi

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
export WM_TRANSPARENCY="0.95"

export NOTIF_WIDTH_OFFSET=-1000
export NOTIF_HEIGHT=100
export NOTIF_X_OFFSET=$(( $NOTIF_WIDTH_OFFSET * -1 / 2 ))
export NOTIF_Y_OFFSET=$(( $WM_GAPS + $WM_BAR_HEIGHT / 2 ))
export NOTIF_FRAME_WIDTH=3
export NOTIF_TRANSPARENCY=$(( 100 - ( $WM_TRANSPARENCY * 100 ) ))

export GTK2_RC_FILES="$XDG_CONFIG_HOME/gtk-2.0/gtkrc-2.0"

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

# eth0 and wlan0 interfaces
if [ $OS != "Darwin" ]; then
  export ETH_INTERFACE="$(ip -o link show | awk -F': ' '{print $2}' | grep e)"
  export WIFI_INTERFACE="$(ip -o link show | awk -F': ' '{print $2}' | grep w)"
fi

# fcitx character input
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx

# fzf read .gitignore
export FZF_DEFAULT_COMMAND='rg --files --hidden'

#
# config directories
#

export GIT_CONFIG="$XDG_CONFIG_HOME/git/config"
export GIT_TEMPLATE_DIR="$XDG_CONFIG_HOME/git/template"
export LESSHISTFILE="$XDG_CACHE_HOME/less_history"
export ZDOTDIR="$XDG_CONFIG_HOME/zsh/"
