# zsh configuration

# include aliases
source $HOME/.config/aliasrc

# history
HISTFILE=$HOME/.cache/zsh_history
HISTSIZE=20000
SAVEHIST=20000
setopt appendhistory

# shell prompt
export PROMPT="%F{yellow}[%f %F{cyan}%2~%f %F{yellow}]%f "

