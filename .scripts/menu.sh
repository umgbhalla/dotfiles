#!/bin/bash

termite --name applauncher -c ~/.config/termite/applauncher -e \
  "bash -c 'ls /usr/bin --color=no | fzf \
  --color=fg:#bbbbbb,bg:#2e3440,hl:#5f87af \
  --color=fg+:#dddddd,bg+:#3d4454,hl+:#43bde6 \
  --color=info:#b38344,prompt:#ffa742,pointer:#ffa742 \
  --color=marker:#adadad,spinner:#a855fa,header:#70b5a7 \
  | xargs -r swaymsg -t command exec'"

