" neovim configuration

" ------------------------------------------------------------------------------
"  plugins
" ------------------------------------------------------------------------------

call plug#begin('~/.vim/plugged')

" improved syntax highlighting
Plug 'sheerun/vim-polyglot'
" color scheme
Plug 'sainnhe/edge'
" markdown previews
Plug 'iamcco/markdown-preview.nvim', { 'do': 'cd app & yarn install'  }
" replace netrw with ranger
Plug 'rbgrouleff/bclose.vim'
Plug 'francoiscabrol/ranger.vim'
" linting and prettying
Plug 'dense-analysis/ale'
Plug 'prettier/vim-prettier', { 'do': 'yarn install' }
" fuzzy file finding
Plug 'ctrlpvim/ctrlp.vim'
" git diff
Plug 'airblade/vim-gitgutter'

call plug#end()

" ------------------------------------------------------------------------------
"  plugin settings
" ------------------------------------------------------------------------------

let g:ranger_map_keys = 0
map <c-b> :Ranger<CR>
" open ranger instead of netrw for folders
let g:ranger_replace_netrw = 1

let g:vim_jsx_pretty_colorful_config = 1

" ale configuration
let g:ale_fix_on_save = 1
let g:ale_sign_column_always = 1
let g:ale_sign_error = '>>'
let g:ale_sign_warning = '!!'
let g:ale_fixers = {
\   'javascript': ['prettier'],
\   'typescriptreact': ['prettier'],
\}
"let g:ale_set_balloons = 1
"let g:ale_hover_to_preview = 1

"let $FZF_DEFAULT_OPTS='--layout=reverse'
"let g:fzf_layout = { 'window': 'call FloatingFZF()' }
"
"function! FloatingFZF()
"  let buf = nvim_create_buf(v:false, v:true)
"  call setbufvar(buf, '&signcolumn', 'no')
"
"  let height = &lines - 3
"  let width = float2nr(&columns - (&columns * 2 / 10))
"  let col = float2nr((&columns - width) / 2)
"
"  let opts = {
"        \ 'relative': 'editor',
"        \ 'row': 1,
"        \ 'col': col,
"        \ 'width': width,
"        \ 'height': height
"        \ }
"
"  call nvim_open_win(buf, v:true, opts)
"endfunction

fu! TogglePrettierOnSave()
  if (g:ale_fix_on_save == 0)
    let g:ale_fix_on_save = 1
  else
    let g:ale_fix_on_save = 0
  endif
endfunction
command TogglePrettier call TogglePrettierOnSave()

" ctrlp fzf configuration
" include more search results in fuzzy finder
let g:ctrlp_match_window = 'bottom,order:btt,min:1,max:15,results:15'
" show hidden file results
let g:ctrlp_show_hidden = 1
" fuzzy finder ignore files/folders
let g:ctrlp_user_command = ['.git/', 'git --git-dir=%s/.git ls-files -oc --exclude-standard']
" refresh fuzzy finder cache every time a file is saved
autocmd FocusGained  * CtrlPClearCache
autocmd BufWritePost * CtrlPClearCache

" vim-gitgutter
" git gutter symbols
let g:gitgutter_sign_added = '++'
let g:gitgutter_sign_modified = '~~'
let g:gitgutter_sign_removed = '--'
" disable gutter keymappings
let g:gitgutter_map_keys = 0
" update gutters every x milliseconds
set updatetime=300

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
"
"  for more information on highlighting and current color scheme colors in use,
"  try looking at :highlight, or :h hi for more details.
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
hi Visual                 cterm=reverse gui=reverse

" always display sign column
if has('signcolumn') | set signcolumn=yes | endif
" always show gutter (set signcolumn=yes does not work in all use cases)
autocmd BufEnter * sign define dummy
autocmd BufEnter * execute 'sign place 9999 line=1 name=dummy buffer=' . bufnr('')
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

" improved matching brace visibility
if has('macunix')
  hi MatchParen             ctermbg=178 guibg=178 ctermfg=0 guifg=0
else
  hi MatchParen             cterm=reverse gui=reverse
endif

" gutter color
let g:gitgutter_override_sign_column_highlight = 0
hi SignColumn      ctermbg=None guibg=None
hi GitGutterAdd    ctermbg=None guibg=None
hi GitGutterChange ctermbg=None guibg=None
hi GitGutterDelete ctermbg=None guibg=None

" ------------------------------------------------------------------------------
"  navigation
" ------------------------------------------------------------------------------

" hardcore mode - no pain, no gain
" disable arrow key bindings
for i in ['Left', 'Down', 'Up', 'Right']
  execute 'nnoremap <' . i . '> :echo "' . i . ' has been disabled by the user."<CR>'
  execute 'vnoremap <' . i . '> <C-u>:echo "' . i . ' has been disabled by the user."<CR>'
  execute 'inoremap <' . i . '> <C-o>:echo "' . i . ' has been disabled by the user."<CR>'
endfor

" ... but mouse user-friendliness
set mouse=a

" ctrl+c to copy to system clipboard
" copy entire line
nnoremap <C-c> <Esc>v<S-v>"+y 
vnoremap <C-c> "+y

" faster vertical jumping
nnoremap <silent> <C-j> 5j
vnoremap <silent> <C-j> 5j

nnoremap <silent> <C-k> 5k
vnoremap <silent> <C-k> 5k

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
  
  " make directories and session
  execute 'silent !mkdir -p $XDG_CACHE_HOME/nvim' . trim(execute('pwd'))
  execute 'mksession! $XDG_CACHE_HOME/nvim' . trim(execute('pwd')) . '/session'
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
    if filereadable(expand('$XDG_CACHE_HOME/nvim' . trim(execute('pwd')) . '/session'))
      execute 'so $XDG_CACHE_HOME/nvim' . trim(execute('pwd')) . '/session'
      call RestoreBuff(bufnr('$'))
    endif
  endif
endfunction

" saving session
autocmd VimLeavePre * call SaveSession()
autocmd VimEnter * nested call RestoreSession()
