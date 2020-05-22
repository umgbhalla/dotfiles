" neovim configuration

" ------------------------------------------------------------------------------
"  plugins
" ------------------------------------------------------------------------------

call plug#begin('~/.vim/plugged')

Plug 'sheerun/vim-polyglot' " improved syntax highlighting
Plug 'sainnhe/edge' " color scheme
Plug 'iamcco/markdown-preview.nvim', { 'do': 'cd app & yarn install'  }
" replace netrw with ranger
Plug 'rbgrouleff/bclose.vim'
Plug 'francoiscabrol/ranger.vim'
" linting and prettying
Plug 'dense-analysis/ale'
Plug 'prettier/vim-prettier', { 'do': 'yarn install' }

call plug#end()

" ------------------------------------------------------------------------------
"  plugin settings
" ------------------------------------------------------------------------------

"let g:ranger_map_keys = 0
map <c-b> :Ranger<CR>

let g:vim_jsx_pretty_colorful_config = 1

let g:ale_fix_on_save = 1
let g:ale_sign_column_always = 1
let g:ale_sign_error = '>>'
let g:ale_sign_warning = '--'
let g:ale_fixers = {
\   'javascript': ['prettier'],
\   'typescriptreact': ['prettier'],
\}

" ------------------------------------------------------------------------------
"  general configuration
" ------------------------------------------------------------------------------

" disable swap files
set noswapfile

" recursive path searching
set path+=**
set wildignore+=**/node_modules/**,**/.git/**

" look for tags in .git
set tags+=./.git/tags;

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
" and stop using vi stuff
set nocompatible

" enable incremental search (search highlights while typing)
set incsearch
set hlsearch
" pressing Esc will not remove search position
" set cpoptions+=x
" turn off highlighting
nnoremap <esc><esc> :silent! noh<cr>

" basic syntax highlighting
filetype plugin on
syntax on
filetype indent on

" automatically install plugins
autocmd VimEnter *
  \  if len(filter(values(g:plugs), '!isdirectory(v:val.dir)'))
  \|   PlugInstall --sync | q
  \| endif

" prevent comments from continuing to new lines
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o

" remove file name displayed in the command line bar
set shortmess+=F

" ------------------------------------------------------------------------------
"  coloring and display
" ------------------------------------------------------------------------------

" important!!
if ! has('macunix')
  set termguicolors
endif

" for dark version
set background=dark
" the configuration options should be placed before `colorscheme edge`
let g:edge_disable_italic_comment = 1
colorscheme edge
hi Normal                 ctermbg=None guibg=None
hi NonText                ctermbg=None guibg=None
hi EndOfBuffer            ctermbg=None guibg=None

" make visual highlight more visible
hi Visual cterm=reverse gui=reverse

" always display sign column
if has('signcolumn') | set signcolumn=yes | endif
hi SignColumn             ctermbg=None guibg=None
highlight ALEErrorSign    ctermbg=None guibg=None
highlight ALEWarningSign  ctermbg=None guibg=None
" removes highlights to the right of the line number column
let g:ale_set_highlights = 0

" disable visual/audio bell
set noerrorbells visualbell t_vb=
if has('autocmd')
  autocmd GUIEnter * set visualbell t_vb=
endif

" ------------------------------------------------------------------------------
"  hardcore mode - no pain, no gain
" ------------------------------------------------------------------------------

" disable arrow key bindings
for i in ['Left', 'Down', 'Up', 'Right']
  execute 'nnoremap <' . i . '> :echo "' . i . ' has been disabled by the user."<CR>'
  execute 'vnoremap <' . i . '> <C-u>:echo "' . i . ' has been disabled by the user."<CR>'
  execute 'inoremap <' . i . '> <C-o>:echo "' . i . ' has been disabled by the user."<CR>'
endfor

" ... but mouse user-friendliness
set mouse=a

" ------------------------------------------------------------------------------
"  terminal management
" ------------------------------------------------------------------------------

command Ttoggle call Ttoggle()

inoremap <M-`> <C-\><C-n>:Ttoggle<CR>
nnoremap <M-`> :Ttoggle<CR>
vnoremap <M-`> :Ttoggle<CR>
tnoremap <M-`> <C-\><C-n>:Ttoggle<CR>

tnoremap <silent> <Esc> <C-\><C-n>

let s:termState = 0
fu! Ttoggle()
  if s:termState == 0     " terminal is not open
    let s:termBuffNr = -1
    for b in range(1, bufnr('$'))
      if getbufvar(b, '&buftype', 'ERROR') ==# 'terminal'
        let s:termBuffNr = b
        break
      endif
    endfor

    belowright split
    resize 10

    if s:termBuffNr >= 0  " if terminal buffer already exists
      execute 'b' . s:termBuffNr
    else
      enew
      call termopen('zsh', {'on_exit': 'TExit'})
    endif

    set nonumber
    set norelativenumber
    set signcolumn=no
    set nocursorline

    startinsert
  else                    " terminal is open
    normal <C-v><C-\><C-n>
    hide
  endif
  let s:termState = ! s:termState
endfunction

fu! TExit(job_id, code, event) dict
  let s:termState = 0
  if winnr('$') ==# 1 | qa! | else | bw! | endif
endfunction

" ------------------------------------------------------------------------------
"  session management
" ------------------------------------------------------------------------------

let s:shouldSaveSession = 0
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | let s:shouldSaveSession = 1 | endif

fu! SaveSession()
  if s:shouldSaveSession == 0 | qa! | endif
    
  " close all terminal buffers  
  for b in range(1, bufnr('$'))
    if getbufvar(b, '&buftype', 'ERROR') ==# 'terminal' | execute 'bd!' . b | endif
  endfor
  
  " make directories
  execute 'silent !mkdir -p ~/.nvim'
  execute 'silent !mkdir -p ' . getcwd() . '/.nvim'

  execute 'mksession! ' . getcwd() . '/.nvim/session'
  execute 'mksession! ~/.nvim/session'
endfunction

fu! RestoreBuff(lastBuf)
  if bufexists(1)
    for l in range(1, a:lastBuf)
      if bufwinnr(l) == -1
        exec 'sbuffer ' . l
      endif
    endfor
  endif
endfunction

fu! RestoreSession()
  " only restore if called with no arguments
  if eval('@%') == ''
    " if current directory session exists
    if filereadable(getcwd() . '/.nvim/session')
      execute 'so ' . getcwd() . '/.nvim/session'
        call RestoreBuff(bufnr('$'))
    " if latest session exists
    elseif filereadable('~/.nvim/session')
      execute 'so ~/.nvim/session'
        call RestoreBuff(bufnr('$'))
    endif
  endif
endfunction

" saving session
autocmd VimLeavePre * call SaveSession()
autocmd VimEnter * nested call RestoreSession()
