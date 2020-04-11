# zsh configuration

# include aliases
# to reduce prompt appearing time you'll need to remove this line...
# (but I don't want to)
[ -f $XDG_CONFIG_HOME/aliasrc ] && source $XDG_CONFIG_HOME/aliasrc

# history
HISTFILE="$XDG_CACHE_HOME/zsh_history"
HISTSIZE=20000
SAVEHIST=20000
setopt appendhistory

