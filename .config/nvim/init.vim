" nvim configuration

" ------------------------------------------------------------------------------
"  general configuration
" ------------------------------------------------------------------------------

" disable swap files
set noswapfile

" line numbers
set number

" tab width
set tabstop=2
set shiftwidth=2
set expandtab

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
