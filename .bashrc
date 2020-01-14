
# ----------------------------------------------------------------------------
# defaults
# ----------------------------------------------------------------------------

if [ "$(tty)" == "/dev/tty1" ]; then
  mkdir -p ~/.cache/sway
  sway > ~/.cache/sway/sway.log 2>&1
fi

alias ls="ls --color"
alias cp="cp -v"
alias mv="mv -v"
alias rm="rm -v"

# ----------------------------------------------------------------------------
# path/environment variables
# ----------------------------------------------------------------------------

export LS_COLORS="$LS_COLORS:ow=1;34:tw=1;35:"

export PATH=$PATH:~/.local/bin/
export PATH="/home/sam/.npm-global/bin:$PATH"

bind 'set bell-style none' # silence error ring

# ----------------------------------------------------------------------------
# aliases
# ----------------------------------------------------------------------------

# text editing
alias n="nvim"
alias v="nvim"
alias vi="nvim"
alias vim="nvim"

# auracle wrapper
function aur() {
  if [ "$1" == "clone" ]; then cd /tmp && auracle clone $2 && cd $2
  else auracle $@; fi
}

# trash
function trash() {
  mkdir -p ~/.local/share/Trash/files
  for file in "$@"
  do
    if [ ! -e "$file" ]; then
      # file does not exist
      echo -e "\e[91mtrash: cannot trash '$file': No such file or directory\e[0m"
    else
      if mv "$file" ~/.local/share/Trash/files &> /dev/null; then
        echo "trashed $file"
      else
        # file would overwrite another trashed file
        timestamp=$(date +%Y%m%d%H%M%S)
        if mv "$file" ~/.local/share/Trash/files/${file}_${timestamp} &> /dev/null; then
          echo "trashed $file as ${file}_${timestamp}"
        else
          echo -e "\e[91mtrash: cannot trash '$file': Error code $?"
        fi
      fi
    fi
  done
}

