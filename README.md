# dotfiles
These are the dotfiles I use regularly in my work and school laptop.

Do not copy these dotfiles blindly unless you know exactly what you are doing to your system. A lot of the features or packages I use in my system are experimental or built with a specific hardware in mind. I take no responsibility for any damages or system failures you may encounter - that being said, if you come across a reproducible issue or would like to ask me questions, feel free to open an issue or contact me privately and I would be more than happy to help.

> I use to primarily experiment with Wayland on Arch. If you would like to use Wayland or are interested in replicating this setup, see [this release](https://github.com/bossley9/dotfiles/releases/tag/Wayland).

## Table of Contents
1. [System Information](#sysinfo)
2. [Cloning](#cloning)
3. [Manual Installation](#manualinstall)
4. [Personal Configuration](#personalconfig)

## System Information <a name="sysinfo"></a>

```
OS: Manjaro Linux x86_64
Kernel: 5.4.24-1-MANJARO
Shell: zsh
WM: bspwm
Theme: adwaita [GTK2], matcha-sea [GTK3]
Icons: adwaita [GTK2], papirus-dark-maia [GTK3]
Terminal: urxvt
Status Bar: lemonbar
Launcher: dmenu
```

## Cloning <a name="cloning"></a>

To clone this repository into your home directory, you may need to first follow the [manual installation](#manualinstall) instructions to make sure you have the proper packages installed, such as `bspwm`.

1. Clone this repository to your home folder.
    - `zsh`:
      ```zsh
      git clone https://github.com/bossley9/dotfiles.git /tmp/dotfiles
      setopt -s glob_dots
      mv /tmp/dotfiles/* ~/
      ```
    - `bash`:
      ```bash
        git clone https://github.com/bossley9/dotfiles.git /tmp/dotfiles
        shopt -s dotglob nullglob
        mv /tmp/dotfiles/* ~/
      ```

## Manual Installation <a name="manualinstall"></a>

This installation summarizes installing `bspwm` onto `Manjaro`.

#### Setup

1. Download the [Manjaro Gnome minimal edition](https://manjaro.org/downloads/official/gnome/). Since Gnome will eventually be replaced by `bspwm`, it doesn't necessary matter which window manager you choose, but I prefer `Gnome` because it is simple and will provide nice tweaking options later. I downloaded version `manjaro-gnome-19.0.2-minimal-200311-linux54.iso`.
2. Burn the cd image onto a usb. This can be done using a number of different tools:
    - [Balena Etcher](https://www.balena.io/etcher/)
    - [Rufus](https://rufus.ie/)
    - [Mkusb](https://help.ubuntu.com/community/mkusb)
    - Or, if you prefer command line like me:
      ```
      sudo dd bs=4M if=/path/to/iso of=/dev/sdx status=progress
      ```
      where `/dev/sdx` is the root partition of the usb (do not include specific partition numbers). You may want to run `sudo fdisk -l` first to double check the partition name.
3. Boot the machine from the live usb (you may need to modify BIOS settings to boot from a usb hard drive).

#### Distro installation

> Luckily, Manjaro does a fantastic job of setting up all the basic packages and tools for you. I used to manually integrate every feature I needed when I primarily used Archlinux, but I've since realized that the Manjaro minimal installs are nearly perfect for every use case.

1. After the grub bios screen, the system will boot into Manjaro's guest installation session. Connect the machine to internet (ethernet is recommended for a stable connection but definitely not required) and open `Install Manjaro Linux` located on the side bar.
2. Most of the settings will be your preference. Since I have experimental machines, I completely erased the disk to use Manjaro, but you may want to install alongside an existing partition (the hardware of my test machine was so old that I actually had to install Ubuntu first for drivers, then install Manjaro alongside it).
3. Instead of restarting, it might be better to shutdown, remove the usb, then power on, just to verify the machine is booting from the hard drive and not the live usb.

#### Core Package Configuration

1. Connect to a network on reboot and upgrade the system from the command line. Then install packages necessary for binary compilation and source control. Install all packages `base-devel` provides.
    ```
    sudo pacman -Syyuu
    sudo pacman -S base-devel
    sudo pacamn -S git
    ```
2. Install `zsh` as an improvement to the original `bash` shell.
    ```
    sudo pacman -S zsh
    chsh -s /bin/zsh
    ```
3. Install `yay`, an AUR helper.
    ```
    sudo pacman -S yay
    ```
3. Install the `bspwm` window manager and the `sxhkd` hotkey manager.
    ```
    sudo pacman -S bspwm sxhkd
    ```
4. Install a command line text editor. My preference is `vim`, but you can also use `vi`, `emacs`, or `nano`, the most user-friendly of command line text editors.
    ```
    sudo pacman -S vim
    ```
5. Install a terminal emulator. I use `urxvt` because it is lightweight and fast.
    ```
    sudo pacman -S rxvt-unicode
    ```
6. Install `openssh` to be able to ssh connect to other machines.
    ```
    sudo pacman -S openssh
    ```
7. Use any of my dotfiles or programs you would like at this point. **A `bspwm` configuration and an `sxhkd` configuration must be included or the window manager may not boot properly**. The exmaple configurations can be used with the commands below.
    ```
    mkdir -p ~/.config/bspwm
    cp /usr/share/doc/bspwm/examples/bspwmrc ~/.config/bspwm/
    mkdir -p ~/.config/sxhkd
    cp /usr/share/doc/bspwm/examples/sxhkrc ~/.config/sxhkd/
    ```
    Make sure the `sxhkd` configuration file is changed to open the correct terminal emulator.
8. Log out of the user you created. Then log back in, clicking on the gear icon below the password blank and choosing `bspwm` before typing the password. You will now boot into `bspwm`.

## Personal Configuration <a name="personalconfig"></a>

### Text/Code Editor/IDE

I use `vim` primarily due to its performance and multitude of quick hotkeys. It is also extremely customizable to your liking. It has a steep learning curve but is worth the while.
```
sudo pacman -S vim
```

I also use `code` due to its modern status quo and presentability. It is quite efficient and customizable (albeit not to the extents of `vim` in terms of keybindings and auto commands). `code` also provides a fantastic extension marketplace, where you can actually add `vim`-style keybindings.
```
sudo pacman -S code 
```

### Terminal Emulator

`urxvt` is quick and has a small memory footprint. It also supports unicode out of the box, hence the name.
```
sudo pacman -S rxvt-unicode
```

### Status Bar

`lemonbar` is simple to configure and performance-efficient on low-budget machines.
```
yay -S lemonbar-git
```

### Browser

`brave` is my browser of choice since it contains most aspects of Google Chrome's speed and efficiency, while providing better security and better profile management.
```
sudo pacman -S brave
```
### System Profilers

I always find myself drawn back to `htop` for its simplicity, speed, and low system footprint. It very clearly displays information, which can be filtered.
```
sudo pacman -S htop
```

### File Explorer

`nautilus` is very customizable and provides a pleasant and simple UI.
```
sudo pacman -S nautilus
```

