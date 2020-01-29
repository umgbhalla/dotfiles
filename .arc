#!/bin/bash

LB='\033[1;94m'
RD='\033[1;31m'
NC='\033[0m'

function invalid() {
  echo -e "invalid usage: ${RD}$1${NC}"
}

error() {
  echo -e "error: ${RD}$1${NC}"
}

function format() {
  echo $1 | cut -d "." -f 2-
}

function outdir() {
  echo $1 | cut -d "." -f 1
}

if [[ $# < 1 ]]; then 
  echo -e "${LB}\
-----------------------------\n\
-----------------------------\n\
-       __ _ _ __ ___       -\n\
-      / _\` | '__/ __|      -\n\
-     | (_| | | | (__       -\n\
-      \\__,_|_|  \\___|      -\n\
-                           -\n\
-----------------------------\n\
-----------------------------\n${NC}"
  echo -e "Usage: ${LB}\tarc c[reate] <output-archive> <files>...\n\
\tarc e[xtract] <input-archive>${NC}"

else
  case $1 in  
    
    c|create)
      if [[ -z $2 ]]; then invalid "output file not specified"; exit; fi
      if [[ -z $3 ]]; then invalid "no input file(s) specified"; exit; fi
      case $(format $2) in
        zip)
          if ! hash zip 2>/dev/null; then error "zip is not installed. Try sudo pacman -S zip"; fi
          echo -e "${LB}"
          zip -v $2 ${@:3}
          echo -e "${NC}"        
          ;;

        # tar.xz)
        #   echo tar.xz
        #   ;;

        *)
          invalid "unknown format \".$(format $2)\""
          ;;

      esac
      ;;

    e|extract)
      case $(format $2) in
        zip)
          if ! hash unzip 2>/dev/null; then error "unzip is not installed. Try sudo pacman -S unzip"; fi
          echo -e "${LB}"
          unzip $2 -d $(outdir $2)
          echo -e "${NC}"
          ;;

        *)
          invalid "unknown format \".$(format $2)\""
          ;;
      esac
      ;;
    *) invalid "unknown parameter \"$1\"";;
  esac
fi

