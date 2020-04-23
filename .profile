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

# to move global npm directory to local directory
# mkdir -p ~/.npm-global 
# npm config set prefix '~/.npm-global'
export PATH="$PATH:$HOME/.npm-global/bin"

#
# variables
#

export RANGER_LOAD_DEFAULT_RC="FALSE"
export SHELL="/bin/zsh"

#
# config directories
#

export GIT_CONFIG="$XDG_CONFIG_HOME/git/config"
export GIT_TEMPLATE_DIR="$XDG_CONFIG_HOME/git/template"
export ZDOTDIR="$XDG_CONFIG_HOME/zsh/"

