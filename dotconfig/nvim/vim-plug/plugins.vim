"                          ██                 ██
"                 ██████  ░██          █████ ░░
"                ░██░░░██ ░██ ██   ██ ██░░░██ ██ ███████   ██████
"                ░██  ░██ ░██░██  ░██░██  ░██░██░░██░░░██ ██░░░░
"                ░██████  ░██░██  ░██░░██████░██ ░██  ░██░░█████
"                ░██░░░   ░██░██  ░██ ░░░░░██░██ ░██  ░██ ░░░░░██
"                ░██      ███░░██████  █████ ░██ ███  ░██ ██████
"                ░░      ░░░  ░░░░░░  ░░░░░  ░░ ░░░   ░░ ░░░░░░
"

" auto-install vim-plug
if empty(glob('~/.config/nvim/autoload/plug.vim'))
  silent !curl -fLo ~/.config/nvim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  "autocmd VimEnter * PlugInstall
  "autocmd VimEnter * PlugInstall | source $MYVIMRC
endif

call plug#begin('~/.config/nvim/autoload/plugged')

    " Better Syntax Support
    Plug 'sheerun/vim-polyglot'
    
    " File Explorer
    "Plug 'scrooloose/NERDTree'
    
    " Auto pairs for '(' '[' '{'
    Plug 'jiangmiao/auto-pairs'
    
    " Theme 
    Plug 'arcticicestudio/nord-vim'
    
    " Airline
    Plug 'vim-airline/vim-airline'
    Plug 'vim-airline/vim-airline-themes'
    
    " Stable version of coc
    Plug 'neoclide/coc.nvim',{'branch': 'release'}
    " Keeping up to date with master
    Plug 'neoclide/coc.nvim', {'do': 'yarn install --frozen-lockfile'}
    " DON'T forget to CocInstall from https://github.com/neoclide/coc.nvim/wiki/Using-coc-extensions#implemented-coc-extensions
    "
    "ranger
    Plug 'kevinhwang91/rnvimr', {'do': 'make sync'}
    "
    "FZF
    Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
    Plug 'junegunn/fzf.vim'

    Plug 'airblade/vim-rooter'
    
    Plug 'norcalli/nvim-colorizer.lua'

    Plug 'junegunn/rainbow_parentheses.vim'

    Plug 'mhinz/vim-startify'

call plug#end()
