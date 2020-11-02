#!/bin/env zsh

bindkey -v # vi keybindings

# aliases
[ -f $XDG_CONFIG_HOME/aliasrc ] && . $XDG_CONFIG_HOME/aliasrc

# terminal ascii
FG=$WHITE
P=$RED
echo "${FG}\
 ┌―――――――――――――――――――――――――――――┬―――――――――┐
 ├―――――――――――――――――――――――――――――┘ ${P}▀${FG}  ${P}▀${FG}  ${P}▀${FG} │
 │                                       │
 │         ${P}/\\ ${FG}                           │\n\
 │        ${P}/  \\ ${FG}                          │\n\
 │       ${P}/\\   \\ ${FG}                         │\n\
 │      ${P}/      \\ ${FG}                        │\n\
 │     ${P}/   ,,   \\     i use arch btw ~  ${FG} │\n\
 │    ${P}/   |  |  -\\ ${FG}                      │\n\
 │   ${P}/_-''    ''-_\\ ${FG}                     │\n\
 │                                       │
 └―――――――――――――――――――――――――――――――――――――――┘
${NC}"

# scrollback
HISTFILE="$ZSH_HISTFILE"
HISTSIZE=1000000
SAVEHIST=1000000
setopt BANG_HIST EXTENDED_HISTORY INC_APPEND_HISTORY SHARE_HISTORY HIST_IGNORE_SPACE HIST_REDUCE_BLANKS HIST_VERIFY
setopt HIST_EXPIRE_DUPS_FIRST HIST_IGNORE_DUPS HIST_IGNORE_ALL_DUPS HIST_FIND_NO_DUPS HIST_SAVE_NO_DUPS

# disable ctrl+s and ctrl+q
stty -ixon

# prompt
export PROMPT="%2~ >> "
