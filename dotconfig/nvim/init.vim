"
"                                                   ██
"                                                  ░░
"                ███████   █████   ██████  ██    ██ ██ ██████████
"               ░░██░░░██ ██░░░██ ██░░░░██░██   ░██░██░░██░░██░░██
"                ░██  ░██░███████░██   ░██░░██ ░██ ░██ ░██ ░██ ░██
"                ░██  ░██░██░░░░ ░██   ░██ ░░████  ░██ ░██ ░██ ░██
"                ███  ░██░░██████░░██████   ░░██   ░██ ███ ░██ ░██
"               ░░░   ░░  ░░░░░░  ░░░░░░     ░░    ░░ ░░░  ░░  ░░
"
"
"
"
"
"
" https://github.com/umgbhalla/

" Source all the plugins 
    source $HOME/.config/nvim/vim-plug/plugins.vim

    set runtimepath^=~/.vim runtimepath+=~/.vim/after
    let &packpath=&runtimepath

" Source SETTINGS
    source $HOME/.config/nvim/general/settings.vim

" Source KEYBINDS
    source $HOME/.config/nvim/keys/mappings.vim

" Source THEME 
    source $HOME/.config/nvim/themes/nord.vim
       
" Configs 
    
    " Source AIRLINE config
        source $HOME/.config/nvim/plug-config/airline.vim
           
    " Source COC config
        source $HOME/.config/nvim/plug-config/coc.vim
           


   " :imap ii <Esc>




" source rc file again
    map <M-s> :source ~/.config/nvim/init.vim<CR>
       
" remaped arrow keys to resize panes
 "   nnoremap <Up> :resize +2<CR> 
 "   nnoremap <Down> :resize -2<CR>
 "   nnoremap <Left> :vertical resize +2<CR>
 "   nnoremap <Right> :vertical resize -2<CR>

       

"" =================================================================================
"    set nocompatible
"    syntax on
"    set shortmess+=I
"    set relativenumber
"    set laststatus=2
"    set backspace=indent,eol,start
"    set hidden
"    set ignorecase
"    set smartcase
"   " set incsearch
"    nmap Q <Nop>    " 'Q' in normal mode enters Ex mode. You almost never want this.
"    set noerrorbells visualbell t_vb= " audio bell disbled
"    set mouse+=a " enable mouse support
"    set bg=dark
"
"" =================================================================================
"        
"" tabs
"    set tabstop=4
"    set softtabstop=4
"    set shiftwidth=4
"
"" convert tab to spaces
"    set expandtab
"    set autoindent " for python
"    set fileformat=unix

""system clipboard
"    set clipboard+=unnamedplus
        
" Remap splits navigation to just CTRL + hjkl
"    nnoremap <C-h> <C-w>h
"    nnoremap <C-j> <C-w>j
"    nnoremap <C-k> <C-w>k
"    nnoremap <C-l> <C-w>l

" remap shit
" map each number to its shift-key character
"    noremap 1 !
"    noremap 2 @
"    noremap 3 #
"    noremap 4 $
"    noremap 5 %
"    noremap 6 ^
"    noremap 7 &
"    noremap 8 *
"    noremap 9 (
"    noremap 0 )
"    noremap - _

" and then the opposite
"    noremap ! 1
"    noremap @ 2
"    noremap # 3
"    noremap $ 4
"    noremap % 5
"    noremap ^ 6
"    noremap & 7
"    noremap * 8
"    noremap ( 9
"    noremap ) 0
"    noremap _ -


" theme
"    set termguicolors
"    colorscheme nord
"    set guifont=Hack
"
" Enable autocomplete
"    set wildmode=longest,list,full
