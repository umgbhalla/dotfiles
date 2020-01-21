
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" plugins
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

call plug#begin('~/.vim/plugged')

Plug 'tpope/vim-sensible'               " basic Vim settings
Plug 'vim-airline/vim-airline'          " airline bar customization
Plug 'vim-airline/vim-airline-themes'   " airline bar theming
Plug 'tpope/vim-fugitive'               " git branch on airline
Plug 'airblade/vim-gitgutter'           " git gutter
Plug 'sainnhe/edge'                     " color scheme
Plug 'sheerun/vim-polyglot'             " improved syntax highlighting
Plug 'ctrlpvim/ctrlp.vim'               " fuzzy finder
Plug 'scrooloose/nerdtree'              " file explorer
Plug 'Xuyuanp/nerdtree-git-plugin'      " git in file explorer
Plug 'tpope/vim-commentary'             " commentng shortcut
Plug 'jiangmiao/auto-pairs'             " auto pair inserting

" language syntax

Plug 'alvan/vim-closetag'               " html auto-closing tags
Plug 'mattn/emmet-vim'                  " emmet (shorthand html generation)
Plug 'suy/vim-context-commentstring'    " commenting for React and jsx

" autocompletion

Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'neoclide/coc-tsserver'
Plug 'neoclide/coc-json'
Plug 'neoclide/coc-html'
Plug 'neoclide/coc-css'

call plug#end()

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" plugin settings
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

" airline bar icons
if !exists('g:airline_symbols') | let g:airline_symbols = {} | endif
let g:airline_symbols.linenr = ''
let g:airline_symbols.branch = ''
let g:airline_symbols.maxlinenr = ''
let g:airline_symbols.whitespace = ''
" if no version control is detected
let g:airline#extensions#branch#empty_message = '<untracked>'
" airline bar
let g:airline#extensions#default#layout = [
\   [ 'a', 'b', 'c' ],
\   [ 'x', 'y', 'z' ]
\ ]
let g:airline_section_c = airline#section#create(['file'])
let g:airline_section_x = airline#section#create(['Ln %l, Col %c'])
let g:airline_section_y = airline#section#create(['filetype'])
let g:airline_section_z = airline#section#create(['ffenc'])
let g:airline_extensions = ['branch', 'tabline']
" show project directory in the tabline
let g:airline#extensions#tabline#buffers_label = ''
" only show path in tab name if it contains another file with the same name
let g:airline#extensions#tabline#formatter = 'unique_tail'
" tabline separators
let g:airline#extensions#tabline#left_sep = ' '
let g:airline#extensions#tabline#left_alt_sep = ' '
let g:airline#extensions#tabline#right_sep = ' '
let g:airline#extensions#tabline#right_alt_sep = ' '

" disable fugitive mappings
let g:fugitive_no_maps = 1

" signcolumn should always display
if has('signcolumn') | set signcolumn='yes' | endif
" git gutter symbols
let g:gitgutter_sign_added = ''
let g:gitgutter_sign_modified = ''
let g:gitgutter_sign_removed = ''
let g:gitgutter_sign_modified_removed = ''
" disable gutter keymappings
let g:gitgutter_map_keys = 0
" update gutters every x milliseconds
set updatetime=300

" include more search results in fuzzy finder
let g:ctrlp_match_window = 'bottom,order:btt,min:1,max:15,results:15'
" show hidden file results
let g:ctrlp_show_hidden = 1
" fuzzy finder ignore files/folders
let g:ctrlp_user_command = ['.git/', 'git --git-dir=%s/.git ls-files -oc --exclude-standard']

" don't show hidden files in file explorer by default
let NERDTreeShowHidden = 0
" close explorer on file open
let NERDTreeQuitOnOpen = 1
" keep file explorer closed on open
let g:NERDTreeHijackNetrw=0
" set window size
let NERDTreeWinSize = 25
" minimal ui
let NERDTreeMinimalUI = 1
" collapse folders if applicable
let NERDTreeCascadeSingleChildDir = 1
" let file explorer open directory by default
let NERDTreeChDirMode = 1
" specify which files/folders to ignore
let NERDTreeIgnore =  ['^.git$', '^node_modules$']
let NERDTreeIgnore += ['\.vim$[[dir]]', '\~$']
let NERDTreeIgnore += ['\.d$[[dir]]', '\.o$[[file]]', '\.dat$[[file]]', '\.ini$[[file]]']
let NERDTreeIgnore += ['\.png$','\.jpg$','\.gif$','\.mp3$','\.flac$', '\.ogg$', '\.mp4$','\.avi$','.webm$','.mkv$','\.pdf$', '\.zip$', '\.tar.gz$', '\.rar$']

" file explorer git icons
let g:NERDTreeIndicatorMapCustom = {
  \ "Modified"  : "",
  \ "Staged"    : "?",
  \ "Untracked" : "",
  \ "Renamed"   : "?",
  \ "Unmerged"  : "?",
  \ "Deleted"   : "",
  \ "Dirty"     : "?",
  \ "Clean"     : "?",
  \ "Ignored"   : "?",
  \ "Unknown"   : "?"
\ }

" change autopairs hotkey to not conflict with commenter
let g:AutoPairsShortcutToggle = '<leader>cfd' " just a random hotkey

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" language syntax settings
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

" html auto closing on these file types
let g:closetag_filenames = '*.html,*.xhtml,*.xml,*.js,*.html.erb,*.md'
" enter between html tags produces newline and tab
let g:user_emmet_settings = {
\   'html': {
\     'quote_char': '"' 
\   },
\   'javascript': {
\     'quote_char': "'"
\   }
\ }

" TAB to use emmet on html snippets when applicable

let s:emmetActivator = "\<Tab>"
autocmd BufRead,BufNewFile *.html,*.js,*.jsx,*.ts,*.tsx let s:emmetActivator = "\<C-x>\<C-e>"

" lorem TAB and
" lorem# TAB produces lorem ipsum filler content

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" autocomplete
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

" if hidden is not set, TextEdit might fail.
set hidden

" Some servers have issues with backup files, see #649
set nobackup
set nowritebackup

" don't give |ins-completion-menu| messages.
set shortmess+=c

" TAB autocompletion with emmet

let g:user_emmet_leader_key = '<C-e>'
let g:user_emmet_expandabbr_key = '<C-x><C-e>'
imap <silent><expr> <Tab> <SID>expand()

function! s:expand()
  if pumvisible()
    return "\<C-y>"
  endif
  let col = col('.') - 1
  if !col || getline('.')[col - 1]  =~# '\s'
    return "\<Tab>"
  endif
  return s:emmetActivator
endfunction

" fix autocomplete on <CR>
inoremap <silent> <expr> <CR> pumvisible() ? "\<Esc>i<Right>\<CR>" : "\<CR>"

" improve autocompletion display
set completeopt+=preview
set completeopt+=menu,menuone,noinsert,noselect

" TODO fix keymap
" inoremap <expr> <Down> pumvisible() ? "\<C-n>" : "\<Down>"

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" session management
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

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

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" terminal management
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

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
      call termopen('bash', {'on_exit': 'TExit'})
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

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" basic settings
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

" disable swap file creation due to manual session saving
set noswapfile

" line numbering
set number

" only search by case when using capital letters
set ignorecase
set smartcase

" turn magic on for regex
set magic

" show matching brackets
set showmatch

" blink cursor x tenths of a seconds
set mat=2

" use spaces instead of tabs
set expandtab

" one tab is x many spaces
set shiftwidth=2
set tabstop=2

" x number of lines to see above and below cursor at all times
set scrolloff=10

" enable for various plugin compatibility
set nocompatible

" enable incremental search (search highlights while typing)
set incsearch
set hlsearch

" allow <Left> and <Right> keys to wrap lines
set whichwrap+=<,>,[,]

" do not show highlighting of last character
set selection=exclusive

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" gui display
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

" color scheme
set background=dark
colorscheme edge
hi Normal       ctermbg=None
hi NonText      ctermbg=None
hi EndOfBuffer  ctermbg=None
hi Visual       ctermbg=240

" airline theme
let g:airline_theme='deus'

" gutter color
let g:gitgutter_override_sign_column_highlight = 0
highlight SignColumn      ctermbg=None
highlight GitGutterAdd    ctermbg=None
highlight GitGutterChange ctermbg=None
highlight GitGutterDelete ctermbg=None
hi GitGutterChangeDelete  ctermbg=None

" redraw screen when vertical position has changed in WSL 
let s:screenLine = line("w0")
fu! RedrawScreen()
  if s:screenLine != line("w0") | let s:screenLine = line("w0") | redraw! | endif
endfunction

let uname = substitute(system('uname'), '\n', '', '')
if uname == 'Linux'
  let lines = readfile("/proc/version")
  if lines[0] =~ "Microsoft"
    au CursorMoved,CursorMovedI,VimResized,FocusGained * call RedrawScreen()
    set mousetime=30
    noremap <silent> <ScrollWheelUp> <ScrollWheelUp>:call RedrawScreen()<CR>
    noremap <silent> <ScrollWheelDown> <ScrollWheelDown>:call RedrawScreen()<CR>
  endif
endif

" window title
set title
au! BufEnter * let &titlestring = '[' . expand('%:p:h:t') . '] ' . expand('%:t') 

" remove extra lines below statusline
set cmdheight=1

" highlight line cursor rests on
" set cursorline
" hi Cursorline             ctermbg=241

" mouse support
set mouse=a

" change cursor to hairline in all modes but normal
set guicursor=n:block-Cursor
set guicursor+=v:ver100-iCursor
set guicursor+=c:ver100-iCursor
set guicursor+=i:ver100-iCursor

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" keyboard shortcuts
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

let mapleader=","

" BACKSPACE deletes highlighted characters
vnoremap <silent> <BS> d
vnoremap <silent> <CR> di<CR>

" CTRL + s to save

inoremap <silent><expr> <C-s> (&buftype ==# 'terminal' ? '<C-s>' : '<Esc>:w<CR>a')
nnoremap <silent><expr> <C-s> (&buftype ==# 'terminal' ? '<C-s>' : '<Esc>:w<CR>')
vnoremap <silent><expr> <C-s> (&buftype ==# 'terminal' ? '<C-s>' : '<Esc>:w<CR>')

" CTRL + <Left>
" CTRL + <Right> move faster along lines

inoremap <silent> <C-Left> <Esc>bi
nnoremap <C-Left> b
nnoremap <C-Left> v<Left>
vnoremap <C-Left> <S-Left>

inoremap <silent> <C-Right> <Esc>wwi
nnoremap <C-Right> w
vnoremap <C-Right> <S-Right>

" SHIFT + <Left>
" SHIFT + <Right>
" SHIFT + <Up>
" SHIFT + <Down> highlight text

inoremap <S-Left> <C-o>v<Left>
nnoremap <S-Left> v<Left>
vnoremap <S-Left> <Left>

inoremap <S-Right> <C-o>v<Right>
nnoremap <S-Right> v<Right>
vnoremap <S-Right> <Right>

inoremap <S-Up> <C-o>v<Up>
nnoremap <S-Up> v<Up>
vnoremap <S-Up> <Up>

inoremap <S-Down> <C-o>v<Down>
nnoremap <S-Down> v<Down>
vnoremap <S-Down> <Down>

" clear visual mode nav mappings

vnoremap <Left> <Esc><Left>
vnoremap <Right> <Esc><Right>
vnoremap <Up> <Esc><Up>
vnoremap <Down> <Esc><Down>

" tab navigation
" ALT + t opens a new tab
" ALT + w closes the current tab
" ALT + <Right> and
" ALT + <Left> switch tabs
" :new opens tabs vertically

inoremap <silent> <M-t> <Esc>:enew<CR>i
nnoremap <silent> <M-t> :enew<CR> 
vnoremap <silent> <M-t> :enew<CR> 

fu! DelBuff() " deleting buffers
  call SwBuff(1)
  if expand('#:p') != expand('%:p')
    if len(filter(range(1, bufnr('$')), 'buflisted(v:val)')) > 1
      execute 'bw#'
    endif
  endif
endfunction

fu! SwBuff(dir) " switching buffers
  let l:max = bufnr('$')
  let l:n = bufnr('%')

  if &buftype ==# 'terminal' | return | endif

  if a:dir > 0 | let l:n = l:n + 1 | else | let l:n = l:n - 1 | endif

  if l:n > l:max | let l:n = 1 | endif
  if l:n < 1 | let l:n = l:max | endif

  while getbufvar(l:n, '&buftype', 'ERROR') ==# 'nofile' 
        \ || getbufvar(l:n, '&buftype', 'ERROR') ==# 'terminal' 
        \ || !bufexists(l:n)

    if a:dir > 0 | let l:n = l:n + 1 | else | let l:n = l:n - 1 | endif
    if l:n > l:max | let l:n = 1 | endif
    if l:n < 1 | let l:n = l:max | endif
  endwhile

  execute 'b' . l:n
endfunction

inoremap <silent> <M-w> <Esc>:call DelBuff()<CR>i
nnoremap <silent> <M-w> :call DelBuff()<CR>
vnoremap <silent> <M-w> :call DelBuff()<CR>

for i in ['l', 'Right']
  execute 'inoremap <silent> <M-' . i . '> <Esc>:call SwBuff(1)<CR>i'
  execute 'nnoremap <silent> <M-' . i . '> :call SwBuff(1)<CR>'
  execute 'vnoremap <silent> <M-' . i . '> :call SwBuff(1)<CR>'
endfor

for i in ['h', 'Left']
  execute 'inoremap <silent> <M-' . i . '> <Esc>:call SwBuff(-1)<CR>i'
  execute 'nnoremap <silent> <M-' . i . '> :call SwBuff(-1)<CR>'
  execute 'vnoremap <silent> <M-' . i . '> :call SwBuff(-1)<CR>'
endfor

" always split windows vertically
cabbrev new vsplit
set splitright

" CTRL + <Up>
" CTRL + <Down> to scroll faster vertically

let scAmt = 5
for i in ['Up', 'Down']
  let key = i
  let key = '<' . key . '>'
 
  let insertScroll = ''
  let c = 0

  while c <= scAmt
    let insertScroll = insertScroll . key
    let c += 1
  endwhile

  execute 'inoremap <silent> <C-' . i . '> ' . insertScroll
  execute 'nnoremap <silent> <C-' . i . '> ' . scAmt . key
  execute 'vnoremap <silent> <C-' . i . '> ' . scAmt . key
endfor

" ALT + p to activate fuzzy finder
" CTRL + p is the default

inoremap <silent> <M-p> <Esc>:CtrlP<CR>
nnoremap <silent> <M-p> :CtrlP<CR>
vnoremap <silent> <M-p> <Esc>:CtrlP<CR>

" ALT + <Up> or
" ALT + <Down> to line swap
" ALT + k or
" ALT + j alternate mappings

for i in ['Up', 'k']
  execute "inoremap <silent> <M-" . i . "> <Esc>:m .-2<CR>==gi"
  execute "vnoremap <silent> <M-" . i . "> :m '<-2<CR>gv=gv"
  execute "nnoremap <silent> <M-" . i . "> :m .-2<CR>=="
endfor

for i in ['Down', 'j']
  execute "inoremap <silent> <M-" . i . "> <Esc>:m .+1<CR>==gi"
  execute "nnoremap <silent> <M-" . i . "> :m .+1<CR>=="
  execute "vnoremap <silent> <M-" . i . "> :m '>+1<CR>gv=gv"
endfor

" CTRL + b toggles the file explorer
" CTRL + h toggle displaying hidden files

inoremap <silent> <C-b> <Esc>:NERDTreeToggle<CR>
nnoremap <silent> <C-b> :NERDTreeToggle<CR>
vnoremap <silent> <C-b> :NERDTreeToggle<CR>
let NERDTreeMapToggleHidden='<C-h>'

" ALT + / to comment/uncomment line(s) (will not work with non-recursive mappings)
" CTRL + / alternate mapping

imap <M-/> <Esc>gc<Right><Right>i
nmap <M-/> gc<Right>
vmap <M-/> gc<Right>

" TAB to indent
" SHIFT + TAB to unindent

nnoremap <Tab> >>
vnoremap <Tab> >gv

inoremap <S-Tab> <C-d>
nnoremap <S-Tab> <<
vnoremap <S-Tab> <gv

" ALT + f to search
" CTRL + f alternate
" ESC + ESC to remove highlight
" F3 to skip to next search
" SHIFT + F3 to skip to the previous search

" pressing Esc will not remove search position
set cpoptions+=x

inoremap <M-f> <C-o>/
nnoremap <M-f> /
vnoremap <M-f> /

inoremap <C-f> <C-o>/
nnoremap <C-f> /
vnoremap <C-f> /

inoremap <silent> <Esc><Esc> <Esc>:nohls<CR>i
nnoremap <silent> <Esc><Esc> :nohls<CR>
vnoremap <silent> <Esc><Esc> :nohls<CR>

inoremap <F3> <Esc>nni
nnoremap <F3> n
vnoremap <F3> n

inoremap <F15> <Esc><S-n>i
nnoremap <F15> <S-n>
vnoremap <F15> <S-n>

" ALT + ` to toggle terminal window

command Ttoggle call Ttoggle()

inoremap <M-`> <C-\><C-n>:Ttoggle<CR>
nnoremap <M-`> :Ttoggle<CR>
vnoremap <M-`> :Ttoggle<CR>
tnoremap <M-`> <C-\><C-n>:Ttoggle<CR>

tnoremap <silent> <Esc> <C-\><C-n>

" CTRL + c to copy

set clipboard=unnamed,unnamedplus

" inoremap <silent> <C-c> <C-o><S-v>"*y
" nnoremap <silent> <C-c> <S-v>"*y 
" vnoremap <silent> <C-c> m`"*y``

" CTRL + x to cut

" inoremap <silent> <C-x> <C-o><S-v>"*y<Esc>d$i
" vnoremap <silent> <C-x> d

" CTRL + v to paste

" inoremap <silent> <Leader>v <C-v>
" inoremap <silent> <C-v> <Esc>"*pi<Right>

" TODO empty line comments
" TODO autocomplete one suggestion

" ALT + q to quit
" CTRL + q alternate

inoremap <M-q> <Esc>:call SaveSession()<CR>:q!<CR>
nnoremap <M-q> <Esc>:call SaveSession()<CR>:q!<CR>
vnoremap <M-q> <Esc>:call SaveSession()<CR>:q!<CR>

inoremap <C-q> <Esc>:call SaveSession()<CR>:q!<CR>
nnoremap <C-q> <Esc>:call SaveSession()<CR>:q!<CR>
vnoremap <C-q> <Esc>:call SaveSession()<CR>:q!<CR>

" CTRL + r to redo in insert mode
inoremap <silent> <C-r> <Esc><C-r>i

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" auto commands (events)
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

" refresh fuzzy finder cache every time a file issaved
autocmd FocusGained  * CtrlPClearCache
autocmd BufWritePost * CtrlPClearCache

" always show gutter (set signcolumn=yes does not work in all use cases)
autocmd BufEnter * sign define dummy
autocmd BufEnter * execute 'sign place 9999 line=1 name=dummy buffer=' . bufnr('')

" close file explorer if it is the last window open
autocmd BufEnter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

" prevent comments from continuing to new lines
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o

" saving session
autocmd VimLeavePre * call SaveSession()
autocmd VimEnter * nested call RestoreSession()

" start in insert mode
autocmd VimEnter * startinsert

" comment highlighting in json
autocmd FileType json syntax match Comment +\/\/.\+$+

" disable autocomplete in terminal buffers
autocmd FileType vim if bufname('%') == '[Command Line]' | let b:coc_suggest_disable = 1 | endif

" ------------------------------------------------------------------------
" ------------------------------------------------------------------------
" post settings
" ------------------------------------------------------------------------
" ------------------------------------------------------------------------

" remove mode display
set noshowmode
" remove last command from display
set noshowcmd
" remove file name displayed in the command line bar
set shortmess+=F

