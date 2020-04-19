# zsh configuration

# include aliases
# to reduce prompt appearing time you'll need to remove this line...
# (but I don't want to)
[ -f $XDG_CONFIG_HOME/aliasrc ] && source $XDG_CONFIG_HOME/aliasrc

# history
HISTFILE="$XDG_CACHE_HOME/zsh_history"
HISTSIZE=10000000
SAVEHIST=10000000
setopt BANG_HIST EXTENDED_HISTORY INC_APPEND_HISTORY SHARE_HISTORY HIST_IGNORE_SPACE HIST_REDUCE_BLANKS HIST_VERIFY
setopt HIST_EXPIRE_DUPS_FIRST HIST_IGNORE_DUPS HIST_IGNORE_ALL_DUPS HIST_FIND_NO_DUPS HIST_SAVE_NO_DUPS

# disable ctrl+s and ctrl+q 
stty -ixon

# vcs info
autoload -Uz vcs_info
precmd() {
  psvar=()
  vcs_info
  [[ -n $vcs_info_msg_0_ ]] && psvar[1]="$vcs_info_msg_0_"
}
zstyle ':vcs_info:git:*' formats '%b'
setopt prompt_subst

# just for fun
if xset q &>/dev/null; then
echo "$(tput cup "$LINES")${CYAN}\
        /\\ \n\
       /oo\\ \n\
      /\\ooo\\    ${MAGENTA}oH yEAh iN cAsE${CYAN}\n\
     /oooooo\\    ${MAGENTA}aNYoNe is WOnDeRInG${CYAN}\n\
    /ooo,,ooo\\    ${MAGENTA}i uSe aRCh bTw${CYAN}\n\
   /ooo|  |oo-\\ \n\
  /L-''    ''-L\\ \n\
${NC}"
fi

# shell prompt
export PROMPT="%F{cyan}┌—[%f%F{cyan}%m%f%F{cyan}]——[%f%F{cyan}%2~%f%F{cyan}]——[%f%F{magenta}%1v%f%F{cyan}]%f"$'\n'"%F{cyan}└——%f%F{magenta}>>%f "

# syntax highlighting
source $XDG_CONFIG_HOME/zsh/fsh/fast-syntax-highlighting.plugin.zsh

