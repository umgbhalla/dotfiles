source $HOME/.profile

# startx automatically on tty1
[ "$(tty)" = "/dev/tty1" ] && \
  ! pgrep -x Xorg >/dev/null && \
  exec startx -- -keeptty &> $XDG_CACHE_HOME/xorg.log
