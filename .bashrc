
LG='\033[1;32m'
LB='\033[1;94m'
NC='\033[0m'

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

# to move global npm directory to local directory
# mkdir -p ~/.npm-global 
# npm config set prefix '~/.npm-global'
export PATH=$PATH:~/.local/bin/
export PATH="~/.npm-global/bin:$PATH"

bind 'set bell-style none' # silence error ring

# ----------------------------------------------------------------------------
# aliases
# ----------------------------------------------------------------------------

# text editing
alias n="nvim"
alias v="nvim"
alias vi="nvim"
alias vim="nvim"

# system monitor
alias gotop="gotop -c monokai"

# osu cse linux servers
alias osuvpn="sudo openconnect --juniper vpn.coeit.osu.edu"
alias osu="ssh bossley.9@stdlinux.cse.ohio-state.edu"

# auracle wrapper
function aur() {
  if [ "$1" == "clone" ]; then cd /tmp && auracle clone $2 && cd $2
  else auracle $@; fi
}

# cache
function clear-cache() {
  function create_prompt () { echo -e "${LB}$1 (Y/N) ${NC}"; }

  read -p "$(create_prompt "Remove all files from /Downloads/?")" bDownloads
  case $bDownloads in
    [Yy]* ) echo "removing downloads..." && rm -rvf ~/Downloads/* 2> /dev/null;;
  esac

  read -p "$(create_prompt "Remove all files from trash?")" bTrash
  case $bTrash in
    [Yy]* ) echo "emptying trash..." && rm -rvf ~/.local/share/Trash/* 2> /dev/null;;
  esac

  read -p "$(create_prompt "Remove all package manager cache files?")" bPacCache
  case $bPacCache in
    [Yy]* ) echo "clearing package manager cache..." && sudo pacman -Sc;;
  esac  

  read -p "$(create_prompt "Remove all cache files?")" bCache
  case $bCache in
    [Yy]* ) echo "removing cache files..." && rm -rvf ~/.cache/* 2> /dev/null;;
  esac

  echo -e "${LG}done.${NC}"
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

# ----------------------------------------------------------------------------
# scripts
# ----------------------------------------------------------------------------

# afk fish farm
alias afk="~/.scripts/afk.sh"

# archive manager
alias arc="~/.scripts/arc.sh"

# sudo access to the display
alias wsudo="~/.scripts/wsudo.sh"
