#!/bin/sh

DIR="$(dirname $0)"

# unset git config to prevent errors
gcfg="$GIT_CONFIG"
unset GIT_CONFIG

#
# install brew
#

/bin/sh -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

#
# install brew packages
#

PACKS="git"
for file in $DIR/brew/*; do
  PACKS="$PACKS $(sed 's/#.*$//' $file)"
done

echo "installing brew packages..."
brew install $PACKS

#
# install brew cask packages
#

PACKS=""
for file in $DIR/cask/*; do
  PACKS="$PACKS $(sed 's/#.*$//' $file)"
done

echo "installing brew cask packages..."
brew cask install $PACKS

#
# install vim-plug
#

sh -c 'curl -fLo "$XDG_DATA_HOME/nvim/site/autoload/plug.vim" --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

# reset git config
GIT_CONFIG="$gcfg"
