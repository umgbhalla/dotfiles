# Setup fzf
# ---------
if [[ ! "$PATH" == */home/umang/.fzf/bin* ]]; then
  export PATH="${PATH:+${PATH}:}/home/umang/.fzf/bin"
fi

# Auto-completion
# ---------------
[[ $- == *i* ]] && source "/home/umang/.fzf/shell/completion.zsh" 2> /dev/null

# Key bindings
# ------------
source "/home/umang/.fzf/shell/key-bindings.zsh"
