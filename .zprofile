# environmental variables set on login

# config home directory
export XDG_CONFIG_HOME="$HOME/.config"

#
# default programs
#

export EDITOR="nvim"

export TERM="st"
export TERMINAL="$TERM"

export BROWSER="brave"
export BROWSER_INCOGNITO="brave"

#
# path
#

# to move global npm directory to local directory
# mkdir -p ~/.npm-global 
# npm config set prefix '~/.npm-global'
export PATH=$PATH:~/.local/bin/
export PATH="~/.npm-global/bin:$PATH"

#
# variables
#

export SHELL="/bin/zsh"

#
# config directories
#

export ZDOTDIR="$XDG_CONFIG_HOME/zsh/"
export XAUTHORITY="$XDG_CONFIG_HOME/Xauthority"

