# zsh configuration

# include aliases
source $HOME/.config/aliasrc

# history
HISTFILE=$HOME/.cache/zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt appendhistory

# load vcs info
autoload -Uz vcs_info
precmd() { vcs_info }
# format vcs_info_msg_0_
zstyle ':vcs_info:git:*' formats '%b'

# shell prompt
PROMPT="%F{yellow}%m%f %F{cyan}%2~%f %# "
RPROMPT="${vcs_info_msg_0_}"

