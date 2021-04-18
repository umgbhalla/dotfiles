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

" Source some settings
    source $HOME/.config/nvim/general/settings.vim

" Source some Keybinds
    source $HOME/.config/nvim/keys/mappings.vim
"
"Status-line
    set statusline=
    set statusline+=%#IncSearch#
    set statusline+=\ %y
    set statusline+=\ %r
    set statusline+=%#CursorLineNr#
    set statusline+=\ %F
    set statusline+=%= "Right side settings
    set statusline+=%#Search#
    set statusline+=\ %l/%L
    set statusline+=\ [%c]

" air-line
    let g:airline_powerline_fonts = 1

    if !exists('g:airline_symbols')
        let g:airline_symbols = {}
    endif


" airline symbols
    let g:airline_left_sep = ''
    let g:airline_left_alt_sep = ''
    let g:airline_right_sep = ''
    let g:airline_right_alt_sep = ''
    let g:airline_symbols.branch = 'b'
    let g:airline_symbols.readonly = 'L'
    let g:airline_symbols.linenr = '^'
    let g:airline_symbols.maxlinenr = ' l '

" Enable autocomplete
"    set wildmode=longest,list,full
       

"split open at the bottom now right
    :imap ii <Esc>


" Nert tree toggle
    map <C-n> :NERDTreeToggle<CR>


" source rc file again
    map <M-s> :source ~/.config/nvim/init.vim<CR>
       
" remaped arrow keys to resize panes
 "   nnoremap <Up> :resize +2<CR> 
 "   nnoremap <Down> :resize -2<CR>
 "   nnoremap <Left> :vertical resize +2<CR>
 "   nnoremap <Right> :vertical resize -2<CR>

" theme
    colorscheme nord
    set guifont=Hack
       

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


