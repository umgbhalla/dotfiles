# environmental variables set on login

# config directory
export XDG_CONFIG_HOME="$HOME/.config"
# cache directory
export XDG_CACHE_HOME="$HOME/.cache"
# script directory
export XDG_SCRIPTS_HOME="$XDG_CONFIG_HOME/scripts"

#
# default programs
#

export EDITOR="nvim"

export TERM="st"
export TERMINAL="$TERM"

export BROWSER="brave"
export BROWSER_INCOGNITO="brave"

export BAR="polybar"
export BAR_ARGS="$BAR main"

export FILE_EXPLORER="ranger"

export SYSTEM_PROFILER="htop"

#
# display
#

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
export RANGER_LOAD_DEFAULT_RC="FALSE"
export SHELL="/bin/zsh"

#
# config directories
#

export GIT_CONFIG="$XDG_CONFIG_HOME/git/config"
export GIT_TEMPLATE_DIR="$XDG_CONFIG_HOME/git/template"
export LESSHISTFILE="$XDG_CACHE_HOME/less_history"
export VIMINIT="source $XDG_CONFIG_HOME/vim/.vimrc"
export ZDOTDIR="$XDG_CONFIG_HOME/zsh/"

