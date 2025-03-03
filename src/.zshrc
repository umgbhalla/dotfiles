#                                      ██
#                                     ░██
#                       ██████  ██████░██      ██████  █████
#                      ░░░░██  ██░░░░ ░██████ ░░██░░█ ██░░░██
#                         ██  ░░█████ ░██░░░██ ░██ ░ ░██  ░░
#                    ██  ██    ░░░░░██░██  ░██ ░██   ░██   ██
#                   ░██ ██████ ██████ ░██  ░██░███   ░░█████
#                   ░░ ░░░░░░ ░░░░░░  ░░   ░░ ░░░     ░░░░░
#
#
#
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# export PATH=$HOME/bin:/usr/local/bin:$PATH
# Path to your oh-my-zsh installation.
export BROWSER=firefox
export ZSH=$HOME/.oh-my-zsh
export JAVA_HOME='/usr/lib/jvm/java-8-openjdk/jre/'
export PATH=$JAVA_HOME/bin:$PATH 
export ANDROID_SDK_ROOT='/opt/android-sdk'
export CHROME_EXECUTABLE='/usr/bin/google-chrome-stable'
export PATH=$PATH:$ANDROID_SDK_ROOT/tools/bin/
export PATH=$PATH:$ANDROID_ROOT/emulator
export PATH=$PATH:$ANDROID_SDK_ROOT/tools/
export PATH=$PATH:'/home/umang/.node_modules/bin'
export CM_LAUNCHER=rofi
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
export FZF_DEFAULT_OPS="--extended"

export VISUAL=nvim
export EDITOR="$VISUAL"

export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
export PATH=$PATH:/home/umang/.cargo/bin
# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
#ZSH_THEME="powerlevel10k/powerlevel10k"
# ZSH_THEME="agnoster"
ZSH_THEME="robbyrussell"

# ZSH_THEME="avit"
# ZSH_THEME="random"
# ZSH_THEME="wedisagree"

plugins=(fzf zsh-autosuggestions zsh-syntax-highlighting web-search)
### "bat" as manpager
export MANPAGER="sh -c 'col -bx | bat -l man -p'"

# navigation
alias q='exit'
alias ..='cd ..' 
alias ...='cd ../..'
alias .3='cd ../../..'
alias .4='cd ../../../..'
alias .5='cd ../../../../..'
alias .f='cd /mnt/F'
alias .d='cd /mnt/F/sys_dot_files'
alias .dd='cd ~/Downloads'
alias .u='cd /mnt/F/umgbhalla.github.io'
alias .dev='cd /mnt/F/dev'
alias .n='cd ~/.config/nvim/'
alias .t='/mnt/F/testingrepo'
alias .o='op . && exit' 
alias mtf='sudo mount /dev/nvme0n1p8 /mnt/F'

#aliases 
alias aot='mpv https://music.youtube.com/playlist\?list\=PL9PLUrw0CbcRbxo9kzgkbe0rB9CjvigOI --no-video'
alias b='bat'
alias batr="bat README.md"
alias bri='sudo brightnessctl -d amdgpu_bl0 set '
alias c='clipmenu'
# alias code='/usr/share/code/bin/code'
alias color="colorscript -e 32"
alias covid='curl https://corona-stats.online\?minimal\=true | bat'
alias ct='cht.sh' #curl cht.sh/:learn
alias f='tuxi -u'
alias gad='git add .'
alias gcl='git clone'
alias gct='git commit -m'
alias glg="git log --graph --abbrev-commit --decorate --format=format:'%C(bold green)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold yellow)(%ar)%C(reset)%C(auto)%d%C(reset)%n''          %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all"
alias gps='git push'
alias gs='git status'
alias gst='git status'
alias ixi="curl -F 'f:1=<-' ix.io"
alias lol=" figlet -c -f ~/.local/share/fonts/figlet-fonts/3d.flf "
alias m='micro'
alias mpp='mpv --no-video'
alias mu='youtube-dl -f "bestaudio/best" -ciw -o "%(title)s.%(ext)s" -v --extract-audio --audio-quality 0 --audio-format mp3'
alias n='nvim'
alias neo='neovide'
alias nn='nvim ~/.config/nvim/init.vim'
alias nz='nvim ~/.zshrc'
alias op='xdg-open'
alias pacman='sudo pacman'
alias qr='curl -F-=\<- qrenco.de'
alias r='ranger .'
alias rec='asciinema rec'
alias reload='source ~/.zshrc'
alias s='surf'
alias sai='sudo apt install' #hahaha
alias sc='tty-clock -SscC0'
alias serv='sudo service --status-all | bat'
alias spr="curl -F 'sprunge=<-' http://sprunge.us"
alias srt=' du -sh ./* | sort -n | bat'
alias ssy='sudo apt update && sudo apt upgrade'
alias v='vim'
alias vs='code'
alias vsf='code /mnt/F '
alias vsu='cd /mnt/F/umgbhalla.github.io && code .'
alias ytf=' ytfzf -t '
   
# confirm before removing something
alias rm='rm -i'


source $ZSH/oh-my-zsh.sh

open_with_fzf() {
    fd -t f -H -I | fzf -m --preview="xdg-mime query default {}" | xargs -ro -d "\n" xdg-open 2>&-
}
cd_with_fzf() {
    cd $HOME && cd "$(fd -t d | fzf --preview="tree -L 1 {}" --bind="space:toggle-preview" --preview-window=:hidden)"
}

alias cz='cd_with_fzf'
alias oz='open_with_fzf'
#
# User configuration

# Changing "ls" to "exa"
alias ld='(exa -ahl --color=always --group-directories-first) | bat ' # my preferred listing
alias l='(exa -a --color=always --group-directories-first) |bat '  # all files and dirs
alias la='(exa -l --color=always --group-directories-first) '  # long format
alias lt='(exa -aT --color=always --group-directories-first)| bat' # tree listing
# alias ls=exa
alias l.='exa -a | egrep "^\."'
alias g="google"


# only for git
#zstyle ':completion:*:*:git:*' fzf-search-display true
# or for everything
zstyle ':completion:*' fzf-search-display true


export NVM_DIR="/home/umang/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm


source ~/.profile

# eval "$(starship init zsh)"



#curl cheat.sh/
fpath=(~/.zsh.d/ $fpath)

alias ide="tmux  split-window -v -p 30 ;	tmux  split-window -h -p 50  "




#eval $(thefuck --alias)

#autoload -Uz compinit
#compinit
# Completion for kitty
#kitty + complete setup zsh | source /dev/stdin


# bindkey -v


POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

autoload -U +X bashcompinit && bashcompinit
complete -o nospace -C /usr/local/bin/bit bit

#typeset -g POWERLEVEL9K_INSTANT_PROMPT=off
#
#"figlet -c -f ~/.local/share/fonts/figlet-fonts/3d.flf hello magnus"  
#cat ~/.todo

