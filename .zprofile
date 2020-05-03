
# xauthority declaration if not starting with x initially
export XDG_CONFIG_HOME="$HOME/.config"
export XAUTHORITY="$XDG_CONFIG_HOME/Xauthority"

# source .profile for non-interactive shells 
source $HOME/.profile

# startx automatically on tty1
[ "$(tty)" = "/dev/tty1" ] && ! pgrep -x Xorg >/dev/null && exec startx -- -keeptty &> $XDG_CACHE_HOME/xorg.log
