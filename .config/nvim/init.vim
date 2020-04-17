" neovim configuration
"
" install plugins with vim-plug first:
" curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
" :PlugInstall

" ------------------------------------------------------------------------------
" plugins
" ------------------------------------------------------------------------------

call plug#begin('~/.vim/plugged')

Plug 'takac/vim-hardtime' " just to make things harder for you :)

call plug#end()

" ------------------------------------------------------------------------------
" plugin settings
" ------------------------------------------------------------------------------

let g:hardtime_default_on = 1 " hardtime on by default

" ------------------------------------------------------------------------------
"  general configuration
" ------------------------------------------------------------------------------

" disable swap files
set noswapfile

" line numbers
set number

" only search by case when using capital letters
set ignorecase
set smartcase

" turn magic on for regex
set magic

" show matching brackets
set showmatch

" use spaces instead of tabs
set expandtab
" one tab is x many spaces
set shiftwidth=2
set tabstop=2
set softtabstop=2

" enable for various plugin compatibility
set nocompatible

" enable incremental search (search highlights while typing)
set incsearch
set hlsearch
" pressing Esc will not remove search position
" set cpoptions+=x

" basic syntax highlighting
filetype plugin on
syntax on
filetype indent on

" disable arrow key bindings
" no pain, no gain
for i in ['Left', 'Down', 'Up', 'Right']
  execute 'nnoremap <' . i . '> :echo "' . i . ' has been disabled by the user."<CR>'
  execute 'vnoremap <' . i . '> <C-u>:echo "' . i . ' has been disabled by the user."<CR>'
  execute 'inoremap <' . i . '> <C-o>:echo "' . i . ' has been disabled by the user."<CR>'
endfor
