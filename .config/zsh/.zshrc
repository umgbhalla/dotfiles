# zsh configuration

bindkey -v # explicitly set vi keybindings to enabled

# bindkey -M viins 'jj' vi-cmd-mode
bindkey -M viins '<M-;>' vi-cmd-mode
# bindkey -M viins '<M-h>' backward-delete-char
# bindkey '<M-j>' accept-line
typeset -g KEYTIMEOUT=25 # allow zsh to handle multichar bindings

# include aliases
# to reduce prompt appearing time you'll need to remove this line...
# (but I don't want to)
[ -f $XDG_CONFIG_HOME/aliasrc ] && source $XDG_CONFIG_HOME/aliasrc

# syntax highlighting
source $XDG_CONFIG_HOME/zsh/fsh/fast-syntax-highlighting.plugin.zsh

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

M=$MAGENTA
C=$CYAN
Y=$YELLOW
R=$RED

# just for fun
if xset q &>/dev/null; then
echo "$(tput cup "$LINES")${CYAN}\
 ┌―――――――――――――――――――――――――――――┬―――――――――┐
 ├―――――――――――――――――――――――――――――┘ ${R}▀${C}  ${R}▀${C}  ${R}▀${C} │
 │                                       │
 │         ${Y}/\\ ${C}                           │\n\
 │        ${Y}/  \\ ${C}                          │\n\
 │       ${Y}/\\   \\ ${C}                         │\n\
 │      ${Y}/      \\ ${C}                        │\n\
 │     ${Y}/   ,,   \\     i use arch btw    ${C} │\n\
 │    ${Y}/   |  |  -\\ ${C}                      │\n\
 │   ${Y}/_-''    ''-_\\ ${C}                     │\n\
 │                                       │
 └―――――――――――――――――――――――――――――――――――――――┘
${NC}"
fi

# shell prompt
export PROMPT="%F{c} %1v %F{m}%2~%f %F{c}>>%f "

# mode display
function viMode {
  RPS1="%F{c}${${KEYMAP/vicmd/NORMAL}/(main|viins)/INSERT}%f"
  RPS2=$RPS1
}
function zle-line-init zle-keymap-select {
  viMode
  zle reset-prompt
}
zle -N zle-line-init
zle -N zle-keymap-select
viMode
