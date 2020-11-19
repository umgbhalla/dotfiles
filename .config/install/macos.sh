#!/bin/sh

# install brew
curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh

# brew

PACKS="git"
PACKS="${PACKS} neovim nodejs rg"
PACKS="${PACKS} yarn"
PACKS="${PACKS} fzf"

brew install $PACKS

# brew cask

PACKS=""
PACKS="${PACKS} iterm2"
PACKS="${PACKS} figma"
PACKS="${PACKS} firefox"

brew cask install $PACKS
