# zsh configuration

# include aliases
# to reduce prompt appearing time you'll need to remove this line...
# (but I don't want to)
[ -f $XDG_CONFIG_HOME/aliasrc ] && source $XDG_CONFIG_HOME/aliasrc

# autocompletion
autoload -Uz compinit
compinit
zstyle ':completion:*' menu select

# history
HISTFILE="$XDG_CACHE_HOME/zsh_history"
HISTSIZE=10000000
SAVEHIST=10000000
setopt BANG_HIST EXTENDED_HISTORY INC_APPEND_HISTORY SHARE_HISTORY HIST_IGNORE_SPACE HIST_REDUCE_BLANKS HIST_VERIFY
setopt HIST_EXPIRE_DUPS_FIRST HIST_IGNORE_DUPS HIST_IGNORE_ALL_DUPS HIST_FIND_NO_DUPS HIST_SAVE_NO_DUPS

# disable ctrl+s and ctrl+q 
stty -ixon

# shell prompt
export PROMPT="%F{yellow}[%f %F{cyan}%2~%f %F{yellow}]%f "

