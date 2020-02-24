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
  echo "$1" | cut -d "." -f 2-
}

function outdir() {
  echo "$1" | cut -d "." -f 1
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
      case $(format "$2") in
        zip)
          if ! hash zip 2>/dev/null; then error "zip is not installed. Try sudo pacman -S zip"; fi
          echo -e "${LB}"
          zip -v "$2" ${@:3}
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
      if [[ -z "$2" ]]; then invalid "input file not specified"; exit; fi
      case $(format "$2") in
        zip)
          if ! hash unzip 2>/dev/null; then error "unzip is not installed. Try sudo pacman -S unzip"; fi
          echo -e "${LB}"
          unzip "$2" -d "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        jar)
          if ! hash unzip 2>/dev/null; then error "unzip is not installed. Try sudo pacman -S unzip"; fi
          echo -e "${LB}"
          unzip "$2" -d "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        tar.bz2)
          if ! hash tar 2>/dev/null; then error "tar is not installed. Try sudo pacman -S tar"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && tar xvjf "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        tar.gz)
          if ! hash tar 2>/dev/null; then error "tar is not installed. Try sudo pacman -S tar"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && tar xvzf "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        bz2)
          if ! hash bunzip2 2>/dev/null; then error "bunzip2 is not installed. Try sudo pacman -S bunzip2"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && bunzip2 "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        rar)
          if ! hash unrar 2>/dev/null; then error "unrar is not installed. Try sudo pacman -S unrar"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && unrar x "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        gz)
          if ! hash gunzip 2>/dev/null; then error "gunzip is not installed. Try sudo pacman -S gunzip"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && gunzip "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        tar)
          if ! hash tar 2>/dev/null; then error "tar is not installed. Try sudo pacman -S tar"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && tar xf "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        tbz2)
          if ! hash tar 2>/dev/null; then error "tar is not installed. Try sudo pacman -S tar"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && tar xjf "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        tgz)
          if ! hash tar 2>/dev/null; then error "tar is not installed. Try sudo pacman -S tar"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && tar xzf "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        Z)
          if ! hash uncompress 2>/dev/null; then error "uncompress is not installed. Try sudo pacman -S uncompress"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && uncompress "$2" -C "$(outdir "$2")"
          echo -e "${NC}"
          ;;

        7z)
          if ! hash 7z 2>/dev/null; then error "7z is not installed. Try sudo pacman -S 7z"; fi
          echo -e "${LB}"
          mkdir -p "$(outdir "$2")" && 7z x "$2" -C "$(outdir "$2")"
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

