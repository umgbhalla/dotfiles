#!/bin/sh

unit="5"
h_padding="4"

empty="―"
full="―"
active="│"

volNum="$(audio vol get)"

fullNum="$(( ${volNum}/${unit} ))"
emptyNum="$(( 100/${unit} - ${fullNum} ))"

[ $fullNum -ne 0 ] && volFull="$(printf "%${fullNum}s" | sed "s/ /${full}/g")"
volEmpty="$(printf "%${emptyNum}s" | sed "s/ /${empty}/g")"

echo "${volFull}${active}${volEmpty}"
