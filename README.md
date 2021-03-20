# dotfiles

## Table of Contents

1. [What Are Dotfiles?](#what-are-dotfiles)
2. [Demonstration](#demonstration)
3. [System Information](#system-information)
4. [Manual Installation](#manual-installation)
5. [Additional Configuration or Notes](#addconfig)
6. [TODO](#todo)

## What Are Dotfiles? <a name="what-are-dotfiles"></a>

Dotfiles are simply a collection of all configuration files and system files used in
a daily workflow. The point of maintaining dotfiles is to have a centralized place to
store all of your application, OS, and system settings. This becomes especially useful
when you switch between one or two devices regularly, such as between laptop and desktop,
or work laptop and home laptop. It provides a consistent experience across all devices.

The improved advantage of keeping this information in a version-controlled repository
is that it allows the ability to step back in history and revert changes, or store
experimental settings in branches (try doing the same thing in iCloud, OneDrive, or
Google sync).

With my dotfiles, I can use the same programs and workflows both at home and at school.
I've also worked on making my dotfiles operating system-agnostic - I maintain the same
experience on GNU/Linux distros, BSDs, MacOS, and Windows.

This gives way to the concept of _ricing_, or optimizing a system for greater efficiency and
visual appeal. All too often, I see my fellow engineers struggle to navigate their device
applications and interface quickly which slows their development and productivity.
One of the most essential parts of being able to use a piece of technology effectively
is tweaking and customizing the machine interfaces, keybindings, and programs to your
workflow and needs.

In my case, I keep my maintenance of these dotfiles public in hopes that other people might
benefit from my scripts and struggles to create an aesthetic and fully optimized system.

## Demonstration <a name="demonstration"></a>

![basic status bar with background](.config/install/scr1.png)
![neofetch, a terminal instance, and blurry discord](.config/install/scr2.png)
![tiled browser, tty-clock, and pdf viewer](.config/install/scr3.png)
![a workspace with my nvim configuration](.config/install/scr4.png)
![music player and file explorer in separate terminal windows](.config/install/scr5.png)

## System Information <a name="system-information"></a>

[BSPWM] Automata

```
Kernel: 5.9.11-arch2-1
Shell: mksh
WM: bspwm
compositor: picom
Theme: custom [GTK2/3]
Icons: Adwaita [GTK2/3]
Terminal: st
Status Bar: lemonbar-xft
Launcher: custom (st and fzf)

Editor: neovim
Browser: firefox
File Exporer: vifm
Notifications: herbe
System Profiler:  htop
```

## Manual Installation <a name="manual-installation"></a>

This section serves to aid those who would like to fully replicate my current working system
_including_ operating system, packages, and software/architecture specifics.

If you are new to Unix systems, dotfiles, shells, scripting, and systems, I
highly recommend installing and following the
[official Archlinux installation guide](https://wiki.archlinux.org/index.php/Installation_guide)
instead of this one. This installation is more geared towards Unix regulars and
minimalistic power-users looking for a fully customizeable/extendable system that is
POSIX-compliant and follows the
[Unix philosophy](https://en.wikipedia.org/wiki/Unix_philosophy).
I do not necessarily recommend people to follow this section since it's mostly just here
for my own benefit, but it may be helpful to some Unix users.

In other words: _if you're new to the non-proprietary Unix utopia, this installation is
probably not for you._

[You can follow my OpenBSD installation guide here.](.config/install/doc/openbsd.md)

[You can follow my Archlinux installation guide here.](.config/install/doc/arch.md)

## TODO <a name="todo"></a>

Below are a list of things in no particular order that I plan to do but haven't yet
implemented or had the time to configure.

- Switch to terminal email (Mutt?)
- nmtui keybindings and readable colors
- refine ytui script
