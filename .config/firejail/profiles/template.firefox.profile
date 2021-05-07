# vim: set ft=sh :

include /etc/firejail/firefox.local
include /etc/firejail/globals.local

whitelist ${HOME}/Downloads

whitelist ${HOME}/.mozilla
whitelist ${XDG_CONFIG_HOME}/mozilla
whitelist ${XDG_CACHE_HOME}/mozilla

whitelist ${XDG_CONFIG_HOME}/pulse

whitelist ${XDG_CONFIG_HOME}/Xdefaults
whitelist ${XDG_CONFIG_HOME}/gtk-2.0
whitelist ${XDG_CONFIG_HOME}/gtk-3.0

# whitelist /usr/share
# whitelist /usr/share/firefox
# whitelist /usr/share/gnome-shell/search-providers/firefox-search-provider.ini
# whitelist /usr/share/gtk-doc/html
# whitelist /usr/share/mozilla
# whitelist /usr/share/webext
# include whitelist-usr-share-common.inc

# firefox requires a shell to launch on Arch.
#private-bin bash,dbus-launch,dbus-send,env,firefox,sh,which
# Fedora use shell scripts to launch firefox, at least this is required
#private-bin basename,bash,cat,dirname,expr,false,firefox,firefox-wayland,getenforce,ln,mkdir,pidof,restorecon,rm,rmdir,sed,sh,tclsh,true,uname
# private-etc must first be enabled in firefox-common.profile
#private-etc firefox

# dbus-user filter
# dbus-user.own org.mozilla.Firefox.*
# dbus-user.own org.mozilla.firefox.*
# dbus-user.own org.mpris.MediaPlayer2.firefox.*
# Uncomment or put in your firefox.local to enable native notifications.
#dbus-user.talk org.freedesktop.Notifications
# Uncomment or put in your firefox.local to allow to inhibit screensavers
#dbus-user.talk org.freedesktop.ScreenSaver
# Uncomment or put in your firefox.local for plasma browser integration
#dbus-user.own org.mpris.MediaPlayer2.plasma-browser-integration
#dbus-user.talk org.kde.JobViewServer
#dbus-user.talk org.kde.kuiserver
# ignore dbus-user none

# Redirect
# include firefox-common.profile

# Firejail profile for default
# This file is overwritten after every install/update
# Persistent local customizations
# include default.local
# Persistent global definitions
# include globals.local

# generic GUI profile
# depending on your usage, you can enable some of the commands below:

# include disable-common.inc
# include disable-devel.inc
# include disable-exec.inc
# include disable-interpreters.inc
# include disable-passwdmgr.inc
# include disable-programs.inc
# include disable-shell.inc
# include disable-write-mnt.inc
# include disable-xdg.inc

# include whitelist-common.inc
# include whitelist-runuser-common.inc
# include whitelist-usr-share-common.inc
# include whitelist-var-common.inc

# apparmor
# caps.drop all
# ipc-namespace
# machine-id
# net none
# netfilter
# no3d
# nodvd
# nogroups
# nonewprivs
# noroot
# nosound
# notv
# nou2f
# novideo
# protocol unix,inet,inet6
# seccomp
# shell none
# tracelog

# disable-mnt
# private
# private-bin program
# private-cache
# private-dev
# see /usr/share/doc/firejail/profile.template for more common private-etc paths.
# private-etc alternatives,fonts,machine-id
# private-lib
# private-opt none
# private-tmp

# dbus-user none
# dbus-system none

# memory-deny-write-execute
# read-only ${HOME}
