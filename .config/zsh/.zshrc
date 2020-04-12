# zsh configuration

# include aliases
# to reduce prompt appearing time you'll need to remove this line...
# (but I don't want to)
[ -f $XDG_CONFIG_HOME/aliasrc ] && source $XDG_CONFIG_HOME/aliasrc

# disable ctrl+s and ctrl+q 
stty -ixon

# history
HISTFILE="$XDG_CACHE_HOME/zsh_history"
HISTSIZE=
HISTFILESIZE=
SAVEHIST=
setopt appendhistory

# shell prompt
export PROMPT="%F{yellow}[%f %F{cyan}%2~%f %F{yellow}]%f "

