#!/bin/sh
pkill -9 $BAR
pkill -9 $BAR_ARGS
$BAR_ARGS &
