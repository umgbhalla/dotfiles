# dotfiles
These are the dotfiles I use regularly in my work and school laptop.

Do not copy these dotfiles blindly unless you know exactly what you are doing to your system. A lot of the features or packages I use in my system are experimental or built with a specific hardware in mind. I take no responsibility for any damages or system failures you may encounter - that being said, if you come across a reproducible issue or would like to ask me questions, feel free to open an issue or contact me privately and I would be happy to help.

## Table of Contents
1. [System Information](#sysinfo)
2. [Cloning](#cloning)
3. [Manual Installation](#manualinstall)

## System Information <a name="sysinfo"></a>

```
OS: Manjaro Linux x86_64
Kernel: 5.4.24-1-MANJARO
Shell: zsh
WM: bspwm
Theme: adwaita [GTK2], matcha-sea [GTK3]
Icons: adwaita [GTK2], papirus-dark-maia [GTK3]
Terminal: urxvt
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

> I use to experiment a lot with Wayland on Arch. To see the legacy installation for that setup, see [this release](https://github.com/bossley9/dotfiles/releases/tag/Wayland).

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

1. Connect to a network on reboot and upgrade the system from the command line.
    ```
    sudo pacman -Syyuu
    ```
2. Install `zsh` as an improvement to the original `bash` shell.
    ```
    sudo pacman -S zsh
    chsh -s /bin/zsh
    ```
3. Install `yay`, an AUR helper, and `git`, a source control client.
    ```
    sudo pacman -S yay git
    ```
3. Install the `bspwm` window manager and the `sxhkd` hotkey manager.
    ```
    sudo pacman -S bspwm sxhkd
    ```
4. Install a command line text editor. My preference is `vim`, but you can also use `vi`, `emacs`, or `nano`, the most user-friendly of command line text editors. I will be using `vim` for the rest of the setup.
    ```
    sudo pacman -S vim
    ```
5. Install the default `bsp` terminal and fuzzy menu.
    ```
    sudo pacman -S rxvt-unicode dmenu
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
8. Log out of the user you created. Then log back in, clicking on the gear icon below the password blank and choosing `bspwm` before typing the password. You will now boot into `bspwm`.

