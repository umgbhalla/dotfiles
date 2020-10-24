#!/bin/sh
# a script for executing other gui scripts from keybindings or command line

script=$(ls $GUI_DIR | $SHELLMENU)
$GUI_DIR/$script
