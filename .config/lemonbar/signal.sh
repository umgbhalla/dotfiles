#!/bin/sh

# grep is used with awk because awk only accepts regex and it
# would take more runtime to escape the string and awk it than
# grep and awk

# -w -w prevents output from being restricted to terminal width

modulePids=$(\
  ps aux -w -w | \
  grep "$XDG_CONFIG_HOME/lemonbar/modules.sh" | \
  awk '{print $2}' \
)

for pid in $modulePids; do
  pkill -P $pid # children (sleep)
  kill $pid
done

pkill -9 $BAR

$BAR_ARGS &
