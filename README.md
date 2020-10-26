# dotfiles

## Table of Contents
1. [What The \**** Are Dotfiles?](#what-are-dotfiles)
2. [Demonstration](#demonstration)
2. [System Information](#sysinfo)
3. [Cloning](#cloning)
4. [Manual Installation](#manual-installation)
5. [Additional Configuration or Notes](#addconfig)
6. [TODO](#todo)

## What The \**** Are Dotfiles? <a name="what-are-dotfiles"></a>
According to Quora, dotfiles are _"text-based configuration files that store settings of 
almost every application, service and tool running on your system."_

Essentially, the point of dotfiles is to have a centralized place to store all of your 
application, OS, and system settings. This becomes especially useful when you switch between 
one or two machines regularly (which I am forced to do via work and school). This is also 
useful if you made changes that broke applications and you would like to revert changes.

This introduces the concept of _ricing_, or optimizing a system for greater efficiency and
visual appeal. All too often, I see my fellow engineers struggle to navigate their machine
applications and interface quickly, which slows development and productivity. One of the most
essential parts of being able to use a machine or device effectively is tweaking and 
customizing the machine interfaces, keybindings, and programs to your needs.

In my case, I keep a regular maintenance of these dotfiles in hopes that other people will 
find use from my scripts and struggles to create an aesthetic and fully optimized system. 
I use these same dotfiles for both work and school.

#### Why Linux?

I wanted a solution that protected my privacy from the major tech corporations (**cough cough
Google Microsoft Apple**) while also providing wonderful shell tools like Unix's 
[9base](https://tools.suckless.org/9base/)
utilities. Using Linux also gives me the opportunity to optimize my system to max efficiency,
creating truly custom keybindings for every application, and freely tweak visual appearances
for my own satisfaction (e.g. I guarantee it's extremely hard to add a transparent dual-kawese
blur to all applications on Windows or MacOS).

Am I completely sold on Linux?

No.

While Linux is free and open-source, I want to try using even more optimized systems such as
the BSD family of systems. I plan to move in this direction and convert all my scripts to be 
POSIX-compliant, but it will likely be a few months before this shift happens (especially 
since I'm still attending school).

#### Reproducing this setup

I highly recommend against copying these dotfiles blindly unless you know exactly what each 
file does to your system. Some of the features or packages I use in my system are 
experimental, or built with specific hardware in mind. I take no responsibility for any 
damages or system failures you may encounter - that being said, if you come across a 
reproducible issue or would like to ask me questions, feel free to open an issue or contact 
me privately and I would be more than happy to help.

There are two routes you can follow to reproduce the exact same setup I have, one being more 
 tedious, but possibly less work in the long run.
  - If you would like to wipe an entire machine and begin from scratch with my setup, I have 
     outlined a clean installation according to my preferences in 
     [manual installation](#manual-installation). This may be a bit more work but guarantees that 
     the setup will work exactly the same as mine.
  - If you would like to install the dotfiles on top of an existing OS or setup, you can 
     follow the instructions below to clone my dotfiles into your setup. However, be 
     forewarned - I can't guarantee anything will work. You will likely have to fiddle with 
     the `.xinitrc` and `.profile` files a bit to get everything working properly, and it 
     may cost you a considerable amount of time to get everything to work in the long run.

I also have been working on compatibility with MacOS. While I cannot fix everything to work in 
MacOS, basic utilities and command-line aliases are compatible. See [cloning](#cloning).

> I use to primarily use `Wayland` and have a setup specifically set up for use with `Sway`. If 
> you have interest, you can check it out in 
> [this release](https://github.com/bossley9/dotfiles/tree/2020.03.11).

## Demonstration <a name="demonstration"></a>
![basic status bar with background](.config/installation/scr1.png)
![neofetch, a terminal instance, and blurry discord](.config/installation/scr2.png)
![tiled browser, tty-clock, and pdf viewer](.config/installation/scr3.png)
![a workspace with my nvim configuration](.config/installation/scr4.png)
![music player and file explorer in separate terminal windows](.config/installation/scr5.png)

## System Information <a name="sysinfo"></a>
Information taken from `neofetch` output.
```
OS: Arch Linux x86_64
Kernel: 5.8.5-arch1-1
Shell: zsh
WM: bspwm
Theme: Nordic [GTK2/3]
Icons: Adwaita [GTK2/3]
Terminal: st
Status Bar: polybar
Launcher: fzf/dmenu

Editor: neovim
Browser: brave (JSON Formatter, React Dev Tools, Redux Dev Tools), firefox, surf
File Exporer: ranger
System Profiler:  htop
```

## Cloning <a name="cloning"></a>

1. Clone this repository to your home folder using the steps outlined below.
    If you followed my [manual installation](#manual-installation),
    choose either `zsh` or `sh`.
    - `dash/sh`:
      ```sh
      git clone --recursive https://github.com/bossley9/dotfiles.git /tmp/dotfiles
      cd /tmp/dotfiles

      # you will need to manually copy every file (including dots) individually from
      # /tmp/dotfiles to $HOME/ since dash does not offer extended glob patterns.
      ```
    - `bash`:
      ```sh
      git clone --recursive https://github.com/bossley9/dotfiles.git /tmp/dotfiles
      shopt -s dotglob nullglob
      cp -rv /tmp/dotfiles/* $HOME/
      ```
    - `zsh`:
      ```sh
      git clone --recursive https://github.com/bossley9/dotfiles.git /tmp/dotfiles
      setopt -s glob_dots
      cp -rv /tmp/dotfiles/* $HOME/
      ```
2. Switch to a different virtual terminal. This is so that `x` does not begin running before
  all core programs are installed. On most distributions/operating systems, you can do this
  by typing `ctrl + alt + F2`.
3. Install required core packages for the configuration to work, as well as my preferred
    programs. I've written scripts in my dotfiles that install all necessary packages
    automatically. This script can be rerun to install any additional packages after an update
    to this repository, and you can even add your own packages to the files to install them.
    It will also enable system packages and build my `suckless` utilities.

    **FreeBSD:**
    ```sh
    . $HOME/.profile
    $XDG_CONFIG_HOME/installation/bsd.sh
    ```
    Restart and verify all packages are running properly.
    ```
    sudo reboot
    ```
    You may need to install certain packages or run certain commands in order to tweak
    everything accordingly. I've tried to include comments at the top of most relevant config
    files.

    **GNU/Linux:**
    ```sh
    . $HOME/.profile
    $XDG_CONFIG_HOME/installation/setup.sh
    ```
    Restart and verify all packages are running properly.
    ```
    sudo reboot
    ```
    You may need to install certain packages or run certain commands in order to tweak 
    everything accordingly. I've tried to include comments at the top of most relevant config 
    files.

    **MacOS:**
    ```sh
    source $HOME/.profile
    $HOME/.config/installation/macos.sh
    ```
    I suggest changing the terminal background to a darker theme for the best experience.
    In order to use the terminal buffer keymap(s) in `nvim`, make sure to set the `use option 
    as meta key` option in the profile keyboard settings.

## Manual Installation <a name="manual-installation"></a>

This section serves to aid those who would like to fully replicate my current working system,
including software/architecture specifics.

1. [Installation with Archlinux](#installation-with-archlinux)
2. [Installation with FreeBSD](#installation-with-freebsd) (WIP)

### Installation with Archlinux <a name="installation-with-archlinux"></a>

For the best personalized installation experience I suggest reading the Arch Wiki. It's 
surprisingly intuitive (for a _zoomer_ who hates reading documentation) and
goes into depth about customizing Arch to fit your standards. The configuration files included
in this project are all settings I prefer to use and may not fit your specific usage or
preferences.

Another disclaimer - I am a strong advocate for the `vim` text editor, and as such, I will use
`neovim` to edit files during installation. If you prefer clunky `emacs` or the more user-friendly
`nano`, feel free to use such.

#### Table of Contents
1. [Setup](#setup)
2. [Preliminary Internet](#preliminary-internet)
3. [System Time](#system-time)
4. [Disk Partitioning](#disk-partitioning)
5. [Distro Installation](#base-installation)
6. [Mounted Drives with Fstab](#mounted-drives-with-fstab)
7. [Time Zone and Localization](#time-zone-and-localization)
8. [Network Manager](#network-manager)
9. [Password](#password)
10. [Bootloader](#bootloader)
11. [Installation Wrapup](#installation-wrapup)
12. [Wifi](#wifi)
13. [Creating a User](#creating-a-user)
14. [Core Setup](#core-setup)

#### Setup <a name="setup"></a>

This setup guide assumes you understand the basics of Unix systems
(core utilities, command structure, shells, etc).

1. For this guide you will need the following tools:
    - A computer that will be wiped to install the new operating system
    - An internet connection (preferably ethernet)
    - A disposable usb drive that can be wiped
2. Download the latest [Archlinux](https://www.archlinux.org/download) installation iso from
    their website. I downloaded version `archlinux-2020.10.01-x86_64.iso`.
3. Burn the downloaded cd image onto the usb.
    This can be done using a number of different tools:
    - [Balena Etcher](https://www.balena.io/etcher)
    - [Rufus](https://rufus.ie)
    - [Mkusb](https://help.ubuntu.com/community/mkusb)
    - Or, if you prefer command line like me:
      ```
      sudo dd bs=4M if=/path/to/iso of=/dev/sdx status=progress
      ```
      where `/dev/sdx` is the root partition of the usb (do not include specific partition
      numbers). You may want to run `sudo fdisk -l` first to double check the partition name.
4. Boot the machine from the live usb (you may need to modify BIOS settings to boot from a
    usb hard drive). If you don't know how to do this, look up how to boot from a live usb
    and how to change the bios settings for your machine. Make sure you boot with UEFI.

Booting from the usb will open a menu. Choose to boot from the live usb.
After loading screens you will eventually land on a simple command prompt.

#### Preliminary Internet <a name="preliminary-internet"></a>

1. After verifying the ethernet cable is plugged in (if applicable), test the internet by
    typing the following command:
    ```
    ping archlinux.org
    ```
    If an internet connection has already been established, you will see an incremental
    output displaying packet information. If internet has not yet been set
    up on the machine, it will likely provide the following error:
    ```
    ping: archlinux.org: Name or service not known
    ```
    If a response appears, type `ctrl-c` to stop the ping and skip ahead to the next section.
2. If you arrived at this step, we'll assume no internet is connected.
    We'll need to get the names of all network cards with
    `ip link`. Remember the names of the cards that display. On most machines there are only
    three network cards:
    - `lo` represents a loopback device, which is kind of like a virtual network (this is how
        we access `127.0.0.1` and other localhost ports).
    - `eth0` represents an ethernet adapter. Usually the interface is given a more specific
        name, such as `enp34s0`. In this guide I will use `eth0` to represent the ethernet
        card name.
    - If your machine has a wifi card, it will be represented by `wlan0`. As with the 
        ethernet card, this is usually passes under a more specific name, like `wlp1s0`.
        In this guide I will use `wlan0` to represent the wireless card name.
3. We will now establish an internet connection to download all necessary packages.
    It is definitely possible to install the OS on the machine using only wifi (using a utility
    such as [`iwctl`](https://wiki.archlinux.org/index.php/Iwd#iwctl)), but I recommend
    against wifi if possible since it involves a lot more complication and will be subsequently
    slower during the install process.

    **To install with ethernet:**
    1. Copy the netctl example ethernet configuration.
        ```
        cp /etc/netctl/examples/ethernet-static /etc/netctl
        ```
    2. `vim /etc/netctl/ethernet-static` to change the interface to the interface found earlier.
        ```
        Interface=eth0
        ```
    3. Enable the configuration and reboot.
        ```
        netctl enable ethernet-static
        systemctl stop dhcpcd
        systemctl disable dhcpcd
        sudo reboot
        ```
    4. Verify `ping archlinux.org` produces a response.
      Do not proceed and repeat this section until a response appears.

    **To install with wifi:**
    1. Enter the `iwctl` prompt by typing `iwctl` in the command line.
    2. Verify the computer's wifi card with `device list`. This should display the wifi
    card(s) you saw earlier with `ip link`.
    3. Scan for networks using `station wlan0 scan`, where `wlan0` is the network card name.
        This command will not display any output and instead silently scan.
    4. List all scanned networks with `station wlan0 get-networks`.
    5. Connect to the internet network with `station wlan0 connect SSID`. This will prompt
        a password if required. Then type `exit` to return to the original prompt.
    6. Verify `ping archlinux.org` produces a response. Do not proceed and repeat this section
        until a response appears.

#### System Time <a name="systime"></a>
1. Update the system time.
    ```
    timedatectl set-ntp true
    ```

#### Disk Partitioning <a name="disk-partitioning"></a>
In this guide, we will be creating three partitions: a main partition for all files, a swap
partition for physical memory, and a FAT UEFI boot partition.

Run the `free -g` command to view the GB amount of memory installed in the system.
To be safe, we will make the swap partition to be twice the size amount of total RAM.

- To view the disks to partition, use `fdisk -l` to display all drives and note the drive 
you wish to install Arch on. Make sure this drive is not the usb drive. Mine is `/dev/sda`, 
and as such, I will be using this drive for the purposes of this guide. Run the following 
command to open the partitioning editor for that disk:
    ```
    fdisk /dev/sda
    ```
    You can list any existing partitions in this prompt (as well as disk size) using `p`.
- Delete all existing partitions on this drive by typing `d` consecutively and selecting
    existing partitions until it states that no partitions are defined.
- Type `g` to format the disk to use a GPT (GUID Partition Table). This is preferable on
    newer systems since it is more accurate than a label-based system, and is much more
    flexible when working with other operating systems in dual boot, such as Windows or
    the various BSDs.
- Type `n` to create a new partition, and `p` to make this a primary partition. Partition
    number and first sector can both be left at default. You can press `ENTER` to use the
    default for both of these prompts.
- The first partition will be the boot partition for our UEFI boot record. A reasonable size
    for this partition is 200MB.
    ```
    +200M
    ```
    If prompted to remove a signature, select `y`.
- The second partition is the swap partition, which will be twice the size of RAM.
    Using the same commands as before, create a new partition. My system has 32GB of RAM,
    so the partition created will be 2 x 32GB = 64GB.
    ```
    +64G
    ```
    Again, remove any existing signatures.
- The rest of the space will be used for the main partition (this may be different if you plan
    on dual-booting your system). Using the same commands, create a partition which uses the
    rest of the disk. When prompted for the last sector, type `ENTER` to use the rest of the
    space, and remove any existing signatures.
- Type `w` to write the changes to the hard drive (this is permanent). You will then be able
    to use `fdisk -l` to view the changes to the disk.
7. Change the partition extensions. In my case, my boot partition is `/dev/sda1`, swap is
    `/dev/sda2`, and my root partition is `/dev/sda2`.
    ```
    mkfs.fat -F32 /dev/sda1

    mkswap /dev/sda2
    swapon /dev/sda2

    mkfs.ext4 /dev/sda3
    ```
8. Mount the file partitions (the boot and root partitions).
    ```
    mount /dev/sda3 /mnt
    mkdir /mnt/efi
    mount /dev/sda1 /mnt/efi
    ```

#### Distro Installation <a name="distro-installation"></a>
1. Install the linux kernel and base. This will take some time to complete. I also
    recommend installing development tools (`base-devel`) and an editor (`vim`).
    ```
    pacstrap /mnt base base-devel linux linux-firmware vim
    ```

#### Mounted Drives with Fstab <a name="mounted-drives-with-fstab"></a>
`fstab` is used to record mounted (mountable) drives to the system.

1. Generate an `fstab` file.
    ```
    genfstab -U /mnt >> /mnt/etc/fstab
    ```
2. Then log into the system. This will change your prompt.
    ```
    arch-chroot /mnt
    ```

#### Time Zone and Localization <a name="time-zone-and-localization"></a>
- Set the time zone.
  ```
  ln -sf /usr/share/zoneinfo/Region/City /etc/localtime
  ```
  for example, since I currently live in the general EST Midwest area:
  ```
  ln -sf /usr/share/zoneinfo/America/Louisville /etc/localtime
  ```
- Sync the hardware clock.
  ```
  hwclock --systohc
  ```
- Edit `/etc/locale.gen` to enable locales. I speak and use English as my system language,
  but yours might be different. Adjust accordingly.
  ```
  en_US.UTF-8 UTF-8
  ```
  Then generate locales.
  ```
  locale-gen
  ```
- Edit `/etc/locale.conf` to set the system language.
  ```
  LANG=en_US.UTF-8
  ```
- Edit `/etc/hostname` to name the machine. I named mine `whitesnake`.
  ```
  whitesnake
  ```
- Edit `/etc/hosts` to update the host list accordingly:
  ```
  127.0.0.1   localhost
  ::1         localhost
  127.0.1.1   whitesnake.localdomain    whitesnake
  ```
#### Network Manager <a name="network-manager"></a>
1. Install a network manager. This is vital - without a network manager,
  you will not be able to use any network.
    ```
    pacman -S networkmanager
    ```
2. Enable `networkmanager` on boot.
    ```
    systemctl enable NetworkManager
    ```

#### Password <a name="password"></a>
1. Set a password for the root user.
    ```
    passwd
    ```

#### Bootloader <a name="bootloader"></a>
I use GRUB as a bootloader because it is simple, quick,
and works on both UEFI/BIOS systems. It also has a
customizeable appearance.
1. Install `grub` and `efibootmgr` for UEFI.
    ```
    pacman -S grub efibootmgr
    grub-install --target=x86_64-efi --efi-directory=/efi booloader-id=GRUB
    ```
2. Generate the `grub` configuration.
    ```
    grub-mkconfig -o /boot/grub/grub.cfg
    ```

#### Installation Wrapup <a name="installation-wrapup"></a>
1. Exit, unmount the filesystem, and shutdown. Safely remove the usb after the machine is
    powered off.
    ```
    exit
    umount -R /mnt
    shutdown -h now
    ```
2. Power on the machine. It should boot immediately into a login prompt.
    If no bootable devices are found, you may need to tweak BIOS settings in order to boot
    from UEFI. Then log in as the root user using `root` as your username and the password
    you set earlier. If it does not display a login prompt, the operating system was not set
    up correctly. Repeat the previous steps to install the operating system.

    Anddd we're done! Have fun with your system!

    ...kidding. We still have a bit of manual installation to do.

#### Wifi <a name="wifi"></a>
1. A wifi network connection can be set up from a terminal interface. Use `nmtui` to display
    and connect to the appropriate network. Alternatively, the command line utility exists.
    Run `nmcli d wifi list` to display all networks.
    Then connect with the appropriate SSID and password.
    ```
    nmcli d wifi connect SSID password PASSWORD
    ```
    The current network status can be displayed with the `nmcli radio` and `nmcli device` 
    commands.

#### Creating a User <a name="creating-a-user"></a>
1. Create a user. This is the user you will use to log in. I will create a user named `sam`.
    ```
    useradd -m -g wheel sam
    passwd sam
    ```
2. `EDITOR=vim visudo` to grant the new user sudo permissions.
    ```
    %wheel ALL=(ALL) ALL
    ```
3. Log out and log back in as the user.
    ```
    exit
    ```

#### Core Setup <a name="core-setup"></a>
- Install a system upgrade. It's good to do this on a clean install. Additionally, install
  useful package helpers like `git` and `yay`.
  ```
  sudo pacman -Syu
  sudo pacman -S git

  git clone https://aur.archlinux.org/yay.git /tmp/yay
  cd /tmp/yay && makepkg -si
  ```
- Setup the default shell. I currenly use `zsh`, but have considered switching to
  [dash](#using-the-dash-shell). set it as the default shell for the main user.
  ```
  sudo pacman -S zsh
  chsh -s /bin/zsh
  ```
- Install `X` server packages.
  ```
  sudo pacman -S xorg-server xorg-xinit
  ```
  My dotfiles will automatically use `st` as the default terminal emulator.
  If you choose to not use `st` as a terminal emulator, make sure you install at
  least one terminal emulator and change the `TERM` environment variable located in
  `.profile` and update the binding in `sxhkdrc`. If you do not have a terminal emulator
  installed and properly setup, my dotfiles will not work.
- Log out and log back in.
  ```
  exit
  ```
  If prompted to create a `zsh` startup file, you can press `q` to quit and do nothing. My
  dotfiles contain necessary `zsh` startup files. You can then remove old `bash` files.
  ```
  rm .bash*
  ```
- Finally, install my dotfiles. See [cloning](#cloning) for more details.

### Installation with FreeBSD <a name="installation-with-freebsd"></a>
If you are new to Unix systems, or are new to dotfiles, shells, scripting, and systems, I
highly recommend following the [Archlinux installation guide](#installation-with-archlinux)
instead of this one. This FreeBSD installation is more geared towards Unix regulars and
minimalistic power-users who are looking for a fully customizeable/extendable system.

In other words: _if you're new to the Linux/Unix utopia, this is probably not for you._

#### Table of Contents
1. [Setup](#setup-freebsd)
2. [Boot Start](#boot-start-freebsd)
3. [Hostname](#hostname-freebsd)
4. [Components](#components-freebsd)
5. [Disk Partitioning](#disk-partitioning-freebsd)
6. [Password](#password-freebsd)
7. [Network Prompt](#network-prompt-freebsd)
8. [Clock and Localization](#clock-and-localization-freebsd)
9. [System Configuration](#system-configuration-freebsd)
10. [System Hardening](#system-hardening-freebsd)
11. [Adding a User](#adding-a-user-freebsd)
12. [Basic Networking](#basic-networking-freebsd)
13. [Core Setup](#core-setup-freebsd)

#### Setup <a name="setup-freebsd"></a>
1. For this guide you will need the following tools:
    - A computer that will be wiped to install the new operating system
    - An internet connection (preferably ethernet)
    - A disposable usb drive that can be wiped
2. Download the latest [FreeBSD](https://www.freebsd.org/where.html) installation image
  from their website. I chose `amd64` architecture release `12.1`. When given the option, I
  selected the memstick image instead of a standard iso since it does not require an
  internet connection for the base installation, and wifi was difficult to set up
  without proper command line access.
3. Burn the downloaded cd image onto the usb.
4. Boot the machine from the live usb. This may require BIOS tweaking depending on your
  machine. Be sure to boot with UEFI if you plan on dual booting with Windows in the
  future.

Booting from the image will open the standard FreeBSD boot menu. You can either wait a
few seconds or press `ENTER` to select the multi-user boot.

#### Boot Start <a name="boot-start-freebsd"></a>
When prompted between `Install`, `Shell`, and `Live CD`, select `Install`. Then select
the keymap best suited for you. Generally the default selection is the best choice.

#### Hostname <a name="hostname-freebsd"></a>
Name your system.

#### Components <a name="components-freebsd"></a>
When choosing which components to install, select `kernel-dbg`, `lib32`, and `ports`.
`lib32` enables support for 32-bit libraries (like... the Steam client...) and the ports
tree is FreeBSD's software management system (the only time you should _not_ install this
is if your machine is intended to be used as a server).

#### Disk Partitioning <a name="disk-partitioning-freebsd"></a>
We will be partitioning our disk with ZFS. Select `Auto (ZFS)` to partition with ZFS.

- Change the swap size to be twice the size of ram. In my case, this is 64GB.
  ```
  64g
  ```
- Verify that the partition scheme is `GPT`, and either `(BIOS + UEFI)` or `(UEFI)`.
- Change the pool type to stripe, and select your disk you want FreeBSD to be installed on
  (usually this is named `ada0`).
- Proceed with installation to begin the base system installation process, as well as
  the ports tree.

#### Password <a name="password-freebsd"></a>
When prompted, type in the root password.

#### Network Prompt <a name="network-prompt-freebsd"></a>
Eventually the installation process will prompt you to select a network configuration.
As I mentioned earlier, it is much easier to set up a proper network configuration after
the installation process has finished. You can select `cancel`, and the installation process
will continue without a network connection.

#### Clock and Localization <a name="clock-and-localization-freebsd"></a>
- The installation will prompt if your CMOS clock is set to UTC. If you are switching
  from Windows to FreeBSD, it is highly likely that Windows reset your CMOS clock to
  the local timezone. If that is the case, select `No`.

  In most other cases you can select `Yes`. If you are unsure, you can verify the CMOS time
  in the system BIOS.
- Next, choose your country and region. This is used for timezone/localization settings.
- Set the system time. Generally this is very accurate and you can set the default time
  and date it provides.

#### System Configuration <a name="system-configuration-freebsd"></a>
You are now able to choose the types of services you would like to have run at boot time.
I have never had a need to enable any additional services other than the default `sshd` and
`dumpdev`.

#### System Hardening <a name="system-hardening-freebsd"></a>
FreeBSD has a wide variety of security features it offers (as opposed to Linux systems) out
of the box. I usually select `random_pid`, `clear_tmp`, and `disable_sendmail`.

#### Adding a User <a name="adding-a-user-freebsd"></a>
When prompted, select `Yes` to add a new user to the system. This will be the main user.
- Set the username and full name. I usually keep both the username and full name the same.
- Press `ENTER` to keep Uid and Login group as default.
- When prompted, be sure to add your user to the additional group `wheel`
  for sudo privileges.
- Press `ENTER` to keep Login class as default.
- Choose your system shell. I default to the Bourne `sh` shell because I find that I never
  need the additional bloat features csh and tcsh provide (and I am personally not a fan
  of the way they set environment variables).
- Use the default settings for the rest of the prompts regarding Home directory and
  password authentication, and when prompted, enter the password for the new user.
- Do _not_ lock out the account after creation. This is selected by default.
- Confirm the user settings you have provided.

After creating the user, you can exit the installation and reboot the system.

Instead of logging in as the system user, login as root with the password you
created earlier.

#### Basic Networking <a name="basic-networking-freebsd"></a>
- Use `sysctl net.wlan.devices` to determine your wifi device name. Mine is `iwm0`.
  Then enable the device in your `/etc/rc.conf`. In this example I will use `iwm0`.
  You will additionally need to use `vi` since it is the only editor installed by
  default.
  ```
  # wifi
  wlans_iwm0="wlan0"
  ifconfig_wlan0="WPA SYNCDHCP"
  ```
  Next, in `/etc/wpa_supplicant.conf`, list your network configuration and settings.
  ```
  network={
    ssid="YOUR SSID"
    psd="YOUR PSK"
  }
  ```
  Reboot, login to root, and verify that a network connection has been established
  with `ping freebsd.org`.
  ```
  reboot
  ```

#### Core Setup <a name="core-setup-freebsd"></a>
- Update the main package repositories and install core utilities.
  Install `pkg` when prompted.
  ```
  pkg update
  pkg install sudo git vim
  pkg install xorg pkgconf sourcecodepro-ttf
  ```
- Enable the `wheel` group with `visudo`:
  ```
  %wheel ALL=(ALL) ALL
  ```
- Logout and log back in as the main user.
  You will now be able to install packages using sudo.
- Set up graphics for X. I use an intel-based vga - if you are looking for a better
  general-purpose driver, try `drm-kmod`.
  ```
  sudo pkg install xf86-video-intel
  ```
  Then enable the module in your `/etc/rc.conf`:
  ```
  kld_list="/boot/modules/i915kms.ko"
  ```
  To prevent screen tearing and lag, add yourself to the video group.
  ```
  sudo pw groupmod video -m $USER
  ```
- Finally, install my dotfiles. See [cloning](#cloning) for more details.

## Additional Configuration or Notes <a name="addconfig"></a>
This list of additional configuration options are in no particular order. I've just added or
modified them when necessary.

- [Touchpad Settings](#touchpad-settings)
- [Disabling the Grub Menu](#disabling-grub-menu)
- [DaVinci Resolve](#davinci-resolve)
- [Gaming](#gaming)
- [Login](#login)
- [No dwm?](#no-dwm)
- [Glasscord](#glasscord)
- [User Custom CSS](#user-custom-css)
- [Fine-Tuning Package Installation](#fine-tuning-package-installation)
- [Using the Dash Shell](#using-the-dash-shell)

#### Touchpad settings <a name="touchpad-settings"></a>
By default, most linux distros disable natural scrolling and disable touchpad tapping. I 
personally find this very irritating. To change touchpad settings, 
`sudo nvim /etc/X11/xorg.conf.d/30-touchpad.conf` and add the following configuration:
```
Section "InputClass"
	Identifier "touchpad"
	Driver "libinput"
	MatchIsTouchpad "on"
	Option "Tapping" "on"
	Option "NaturalScrolling" "true"
EndSection
```
Then reboot to verify changes.

#### Disabling the Grub Menu <a name="disabling-grub-menu"></a>
If, like me, you don't plan on dual-booting or adding boot entries, you can disable the grub 
selection menu with `sudo nvim /etc/default/grub`:
```
GRUB_TIMEOUT=0
```
Update the grub, then reboot.
```
sudo grub-mkconfig -o /boot/grub/grub.cfg
sudo reboot
```

#### DaVinci Resolve <a name="davinci-resolve"></a>
`DaVinci Resolve` can be quite cumbersome to get working on a Linux system, especially for one 
using an AMD gpu. These are the steps I took to install it on my machine, being very 
particular on drivers.
```
sudo pacman -S xf86-video-amdgpu vulkan-radeon libva-mesa-driver
yay -S amdgpu-pro-libgl opencl-amd
sudo reboot
--------------------------------------------
yay -S davinci-resolve
```
It's also important that the free version that comes with Linux does not have `mp3/4` or 
`h.264` support.
I have a simple shell function written in `.config/aliasrc` which converts to the right 
codecs.

#### Gaming <a name="gaming"></a>
With these settings, I have been able to play every game I've tried.
> I use the following hardware components:
> - CPU: AMD Ryzen 9 3900x
> - GPU: AMD Radeon RX 580
>
> I specifically chose AMD products for my build since all Nvidia
> drivers are proprietary and I strongly advocate for open source 
> software. Sorry, no RTX. But I think it's best in the long run.

A lot of gaming applications (such as the Steam client and Wine client) are 32-bit 
architecture and require the `multilib` repository to be enabled. To enable, 
`sudo nvim /etc/pacman.conf` and uncomment the following section:
```
[multilib]
Include = /etc/pacman.d/mirrorlist
```
Then upgrade the system.
```
sudo pacman -Syu
```
You will also need to install the following packages. Many of these are essential for running 
games of any kind.
```
sudo pacman -S wine-staging giflib lib32-giflib libpng lib32-libpng libldap lib32-libldap gnutls lib32-gnutls mpg123 lib32-mpg123 openal lib32-openal v4l-utils lib32-v4l-utils libpulse lib32-libpulse libgpg-error lib32-libgpg-error alsa-plugins lib32-alsa-plugins alsa-lib lib32-alsa-lib libjpeg-turbo lib32-libjpeg-turbo sqlite lib32-sqlite libxcomposite lib32-libxcomposite libxinerama lib32-libgcrypt libgcrypt lib32-libxinerama ncurses lib32-ncurses opencl-icd-loader lib32-opencl-icd-loader libxslt lib32-libxslt libva lib32-libva gtk3 lib32-gtk3 gst-plugins-base-libs lib32-gst-plugins-base-libs vulkan-icd-loader lib32-vulkan-icd-loader
```
[Lutris also recommended that I install drivers specific to my GPU](https://github.com/lutris/docs/blob/master/InstallingDrivers.md).

#### Login <a name="login"></a>

The default login prompt is generic and simple. If you would like to modify it, you can use 
different X-run interfaces to beautify the login prompt. I aim for minimalism, and think that 
any X server running for the purposes of an aesthetic login prompt is unnecessary bloat. As 
an alternative, you can edit the `/etc/issue` file to modify what is displayed on the login 
prompt. In my setup, I use `figlet` to create a fancy hostname title on the login prompt.
```
cat /etc/hostname | figlet -k | { sed 's/\\/\\\\/g'; echo "(\l) \\s \\\r \\\t\n" } | sudo tee /etc/issue > /dev/null
```
You'll have to log out and log back in to notice changes.

#### No dwm? <a name="no-dwm"></a>
It might be surprising that I am such an advocate for suckless utilities and yet do not use
`dwm`, and to that statement I have a few reasons.

Conceptually, `dwm` is fantastic, and more tiling window managers should be formatted using
tags. 

However, a large deal-breaker for me is that `dwm` integrates mostly with status bars such as
`slstatus` or `i3blocks`. I have grown more than comfortable with `polybar`, its capabilities,
and modularity, and until a 
[`dwm` module is built into `polybar`](https://github.com/polybar/polybar/pull/2151), I have 
less reason to use it. Additionally, I have grown accustomed to managing key bindings in 
`sxhkd`. While other suckless utilities use application-specific key bindings, I prefer 
maintaining window manager key bindings from within `sxhkd`.

That being said, I've given this a lot of thought recently, and I may revisit `dwm` in the 
future. As such, I am leaving my module build of `dwm` included in my dotfiles should I 
ever switch to `dwm` down the road.

#### Glasscord <a name="glasscord"></a>
I prefer using `ibhagwan`'s [picom blur and rounded corners fork](https://github.com/ibhagwan/picom)
for as many applications as possible, and as such, I used to use
[Glasscord](https://github.com/AryToNeX/Glasscord) by [AryToNeX](https://github.com/AryToNeX)
to style Discord because it allows modification of all Electron-based applications to 
follow this pattern. Each installation is very similar, following 
[these steps](https://github.com/AryToNeX/Glasscord#how-do-i-install-it).

**However, modifications such as these are against Discord's [Terms of Service](), and as such,
I have stopped using them. Use them at your own risk.**

#### User Custom CSS <a name="user-custom-css"></a>
Firefox and a few other browsers offer support for custom user stylesheets which override the
default styles. This is mainly intended for accessibility purposes, but it can also be used
to customize the appearance of the browser.

To enable custom stylesheets on Firefox:
- open `about:config` in the address bar and set the following properties to `true`:
    - `gfx.webrender.all`
    - `toolkit.legacyUserProfileCustomizations.stylesheets`
- open your profile folder by opening `about:support` in the address bar and opening the 
    folder next to the profile directory. I prefer keeping all configuration files in the
    `$XDG_CONFIG_HOME` or `~/.config` directory, so my configuration is under 
    `$XDG_CONFIG_HOME/mozilla/profile`.
- to link my configuration to the Firefox profile:
    ```
    ln -s $XDG_CONFIG_HOME/mozilla/profile/chrome $FIREFOX_PROFILE_DIR/chrome
    ```
- restart Firefox and open `about:support` and verify that the `graphics` > `compositing` option 
    has changed from `basic` to `opengl`. Styles and transparency effects should now be enabled.

#### Fine-Tuning Package Installation <a name="fine-tuning-package-installation"></a>

There are a few configuration options that can be set to make package browsing and installation
more user-friendly in Pacman and Yay.

1. Add color support via `/etc/pacman.conf`:
```
Color
```

## Using the Dash Shell <a name="using-the-dash-shell"></a>

Dash is the Debian Almquist implementation of the original Bourne shell.
It is lightweight and POSIX-compliant by nature (and I find that in most
cases, you will never need Bash/Zsh-specific tools). Since `/bin/sh` is
also symlinked to `/bin/bash` by default on most Linux systems, we will redirect
it to dash and simply use `/bin/sh`.
```
sudo pacman -S dash
sudo ln -sfT dash /usr/bin/sh
chsh -s /bin/sh
```
To verify `/bin/sh` is never overwritten by bash on system updates, we need to add
a pacman hook.
```
git clone https://aur.archlinux.org/dashbinsh.git /tmp/dashbinsh
cd /tmp/dashbinsh && makepkg -si
```
Logout and log back in to verify the shell has succesfully changed.

## TODO <a name="todo"></a>
Below are a list of things in no particular order that I plan to do but haven't yet
implemented or had the time to configure.

+ pinyin input (fcitx?)
+ switch completely to ALSA, or find alternatives to switch audio inputs
+ contact management application
+ customize gtk theming
+ find a good remote desktop client
+ update color/styling for ff
+ switch from cmus to ncmpcpp
+ fix ffmpeg screen capture quality and audio
