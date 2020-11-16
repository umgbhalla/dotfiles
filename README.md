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

While Linux is free and open-source, I want to switch to using even more optimized systems
such as the BSD family of systems. I plan to move in this direction and convert all my
scripts to be POSIX-compliant, but it will likely be a few months before this shift
happens (especially since I'm still attending school).

> EDIT: Regardless of my student status, I am still actively seeking to convert all my
> scripts over. Stay tuned :3

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
Kernel: 5.9.3-arch1-1
Shell: ksh
WM: bspwm
Theme: custom [GTK2/3]
Icons: Adwaita [GTK2/3]
Terminal: st
Status Bar: lemonbar-xft
Launcher: fzf

Editor: neovim
Browser: firefox
File Exporer: vifm
Notifications: herbe
System Profiler:  htop
```

## Cloning <a name="cloning"></a>

1. Clone this repository to your home folder using the steps outlined below.
    If you followed my [manual installation](#manual-installation),
    choose `ksh`.
    - `mksh`/`ksh`:
      ```sh
      cd $HOME
      rm -r .*
      git clone --recursive https://github.com/bossley9/dotfiles.git .
      ```
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

    ```sh
    . $HOME/.profile
    $XDG_CONFIG_HOME/installation/openbsd.sh
    ```
    Restart and verify all packages are running properly.
    ```
    doas reboot
    ```

## Manual Installation <a name="manual-installation"></a>
This section is for someone who has a spare machine who would like to perfectly duplicate my system, including operating system and package installation.

If you are new to Unix systems, or are new to dotfiles, shells, scripting, and systems, I
highly recommend following the official
[Archlinux installation guide](https://wiki.archlinux.org/index.php/Installation_guide)
instead of this one. This installation is more geared towards Unix regulars and
minimalistic power-users who are looking for a fully customizeable/extendable system.

In other words: _if you're new to the Linux/BSD utopia, this is probably not for you._

#### Table of Contents
- [Setup](#setup)
- [Boot Start](#boot-start)
- [Password](#password)
- [Startup Services](#startup-services)
- [Creating a User](#creating-a-user)
- [Disk Partitioning](#disk-partitioning)
- [Set Installation](#set-installation)
- [Locales](#locales)
- [Networking](#networking)
- [Core Setup](#core-setup)

#### Setup <a name="setup"></a>
1. You will need the following tools:
    - A computer that will be wiped to install a new operating system
    - An internet connection (preferably ethernet)
    - A disposable usb drive that can be wiped
2. Download the latest [OpenBSD](https://www.openbsd.org/faq/faq4.html#Download)
  installation image from their website. I chose `amd64` architecture release
  `6.8`. When given the option, select `installXX.img` instead of a standard iso
  since it does not require an internet connection for the base installation,
  and wifi is difficult to set up without proper command line access.
    > because the disk image contains the both the necessary system files _and_ the ports
    > collection, it will be larger than many standard Unix distribution isos (but still
    > _much_ smaller than any Windows iso).
3. Burn the downloaded disk image onto the usb.
4. Boot the machine from the live usb. This may require BIOS tweaking depending on your
  machine. Be sure to boot with UEFI if you plan on dual booting with Windows in the
  future.

#### Boot Start <a name="boot-start"></a>
- When prompted between `(I)nstall`, `(U)pgrade`, `(A)utoinstall`, or `(S)hell`, select `(I)nstall`.
- Select the keymap best suited for you. Generally you can continue with the default
  selection but I always choose the `us` keyboard just to be safe.
- Name your system. I will name mine `automata`.
- If prompted for internet, select `done`. It's much easier to set up internet after a
  clean install.
- Choose a DNS domain name. This can be anything. I usually set it as HOSTNAME.domain
  (e.g. `automata.domain`). Then choose the default option `none` for DNS nameservers.

#### Password <a name="password"></a>
- When prompted, create a root password.

#### Startup Services <a name="startup-services"></a>
- If you would like ssh capabilities at boot (recommended), choose `yes` to start sshd
  by default.
- Say `no` to prevent xenodm from starting X for you. This will be set up manually.

#### Creating a User <a name="creating-a-user"></a>
- When prompted to setup a user, type in the username of the user.
- Press `ENTER` to use the username as the full name.
- Create a user password.
- Choose the default `no` to prevent root ssh login.

#### Disk Partitioning <a name="disk-partitioning"></a>
- Choose the disk you would like to use. _Make sure that it displays the disk you use
  and not only the usb drive installer_. I had to change my BIOS SATA Operation setting
  from `RAID On` to `AHCI` in order for the installer to detect my disk. You can type
  `?` to verify that you will install the operating system on the correct disk.

  I will be referring to my disk as `sd0`. Yours may be named differently.
- Choose `g` to use a GPT-labeled disk.
- Choose `a` to use the automatically created layout.
  This is sufficient for most use-cases.
- Initialize the disk you have chosen by typing `ENTER`.

#### Set Installation <a name="set-installation"></a>
- Type `disk` to install the file sets to the disk.
- Say `no` if prompted if the disk partition is already mounted,
  and choose the flash drive disk you ignored earlier. Usually this is selected by default.
- Press `ENTER` to specify the default partition for the install sets.
- Press `ENTER` to use the default pathname for the sets.
- Press `ENTER` once more to install all default sets.
- Type `yes` to continue without SHA256 checksum verification.
  > On a more system-critical machine this would not be ideal, but for the purposes of
  > installing on a personal-use computer, the installation should be fine.
- Once the installation has completed, select `done` to indicate the location of
  sets is no longer needed.

#### Locales <a name="locales"></a>
- Type the timezone area you live in. I chose `America`.
- If applicable, choose the sub-timezone you live in. I chose `Louisville`.

You can now press `ENTER` to reboot the system.

Instead of logging in as the system user, login as root with the password you
created earlier. You can also check your mail with `mail` ;)

#### Networking <a name="networking"></a>
- Use the `ifconfig` utility to list your wifi adapter device name. You can find a
  list of commonly supported wifi chipsets
  [here](https://www.openbsdhandbook.com/networking/wireless/#supported-chipsets).
  Mine is `iwm0` - replace this with your own device name.
- `vi /etc/hostname.iwm0` and add the following:
  ```
  join YOUR_SSID wpakey YOUR_PASSWORD
  dhcp
  ```
- I also will set up ethernet. My device name is `em0`.
  `vi /etc/hostname.em0` and add the following:
  ```
  dhcp
  ```
- To activate connections, type;
  ```
  sh /etc/netstart
  ```

  > After installing, it turns out that OpenBSD did not have the supported firmware for my network card (due to the refusal of free distribution from the manufacturer's side - screw you Intel), so I needed to connect to ethernet and run `fw_update`. After downloading the necessary firmware, I rebooted.

- Once a network has been configured, test the connection via `ping openbsd.org`. If the connection is successful, you should be able to observe a steady flow of packets. Type `ctrl+c` to exit back to the command line.

#### Core Setup <a name="core-setup"></a>
- Verify the consistency of install packages and install essential core utilities.
  ```
  pkg_check
  pkg_add git vim--no_x11
  ```
- Allow root permissions for the main user. `vim /etc/doas.conf`:
  ```
  permit persist :wheel
  ```
  Then add the main user to the `wheel` group, where USERNAME is the main user.
  ```
  usermod -G wheel sam
  ```
  Log out and log back in as the main user. You will now have root privileges via `doas`.




- Set up graphics for X. I use an intel-based vga, so installed
  an intel video package.
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
  Allow X to access devices. Edit `/etc/devfs.rules` as follows:
  ```
  add path 'dri/*' mode 0666 group operator
  ```
  Then add the user to the operator group:
  ```
  sudo pw groupmod operator -m $USER
  ```
  In order to properly clone my dotfiles you will need to empty the user home directory. Because
  `mksh` does not support globbing (or, a limited version), we will need to remove all dotfiles
  to clone directly into the directory.
  ```
  rm -r .*
  ```
- Finally, install my dotfiles. See [cloning](#cloning) for more details.

## Additional Configuration or Notes <a name="addconfig"></a>
This list of additional configuration options are in no particular order. I've just added or
modified them when necessary.

- [Grub Customization](#grub-customization)
- [Gaming](#gaming)
- [Fine-Tuning Package Installation](#fine-tuning-package-installation)
- [Serverauth Files](#serverauth-files)
- [Laptop Lid Suspension](#laptop-lid-suspension)
- [Remote Desktop](#remote-desktop)
- [Power Management in FreeBSD](#power-management-in-freebsd)

#### Grub Customization <a name="grub-customization"></a>
After each configuration, be sure to update the grub configuration,
then reboot to view changes.
```
sudo grub-mkconfig -o /boot/grub/grub.cfg
sudo reboot
```

If you don't plan on dual-booting or adding boot entries, you can disable the grub
selection menu at boot time with `sudo nvim /etc/default/grub`:
```
GRUB_TIMEOUT=0
```

You can add a background (such as the one I have provided under
`.config/wallpapers/grub.png`) by moving it to the `/boot/grub/` folder.
Be sure that the image is a png - grub is very particular about file formats and
png is the easiest format to use.
```
sudo cp "${XDG_CONFIG_HOME}/wallpapers/grub.png" "/boot/grub/"
```
Then, change the background option in `/etc/default/grub`.
```
GRUB_BACKGROUND="/boot/grub/grub.png"
```

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

#### Fine-Tuning Package Installation <a name="fine-tuning-package-installation"></a>

There are a few configuration options that can be set to make package browsing and installation
more user-friendly in Pacman and Yay.

1. Add color support via `/etc/pacman.conf`:
```
Color
```

## Serverauth Files <a name="serverauth-files"></a>
Xorg likes to populate the `$HOME` directory with `.serverauth.####` files. These files
simply save the session of X (similar to Xauthority) and can be redirected to Xauthority.
Edit `/usr/bin/startx` or `/usr/local/bin/startx` depending on your machine:
```
xserverauthfile=$XAUTHORITY
```

## Laptop Lid Suspension <a name="laptop-lid-suspension"></a>
By default, FreeBSD does not enable suspension on laptop lid close. To enable it, set the acpi
lid switch state in `/etc/sysctl.conf`:
```
hw.acpi.lid_switch_state=S3
```
To view all state options, try `sysctl hw.acpi`.

## Remote Desktop <a name="remote-desktop"></a>
While I haven't had the opportunity (or need) to spend much time using remote desktop
between my laptop and desktop, I have found that `x11vnc` is a lightweight server and
`tigervnc` is a good client. A server can be started with:
```
x11vnc -display :0 -passwd PASSWD_HERE
```

## Power Management in FreeBSD <a name="power-management-in-freebsd"></a>
Power saving is essential to any laptop. Here are a few tips to reduce [power consumption on
a FreeBSD](https://wiki.freebsd.org/TuningPowerConsumption) laptop.

- Enable `powerd` in `/etc/rc.conf`. This reduces power consumption by scaling cpu
  according to workload:
  ```
  powerd_enable="YES"
  ```
- Allow the CPU to turn off core clocks on idle. By default, the system runs CPUs at
  all times unless specified. Add to `/etc/rc.conf`:
  ```
  performance_cx_lowest="Cmax"
  economy_cx_lowest="Cmax"
  ```
- If you happen to use an Intel CPU with `drm-kmod`, adding the
  following to `/boot/loader.conf` will improve CPU efficiency:
  ```
  compat.linuxkpi.i915_fastboot=1
  compat.linuxkpi.i915_enable_fbc=1
  compat.linuxkpi.i915_enable_dc=2
  compat.linuxkpi.i915_disable_power_well=1
  ```
- Disable bluetooth if you don't use it. This is tricky since it is enabled by default in
  the kernel and cannot easily be disabled at boot time. However, there is a hacky
  solution for kernel module loading:
  ```
  mv /boot/kernel/ng_ubt.ko /boot/kernel/ng_ubt.ko.blacklisted
  ```
- Set the current wifi adapter to powersave mode to decrease radio time and increase
  power. This may reduce link latency, but in most cases, the effect is negligible. In
  `/etc/rc.conf` (make sure to choose the correct wifi adapter):
  ```
  ifconfig_wlan0="... powersave"
  ```
- Reduce sound interrupts to increae performance. In `/boot/loader.conf`:
  ```
  hw.snd.latency=7
  ```

## TODO <a name="todo"></a>
Below are a list of things in no particular order that I plan to do but haven't yet
implemented or had the time to configure.

+ [pinyin input (fcitx?)](https://forums.freebsd.org/threads/installing-chinese-input-method-in-freebsd-10-1.52314/)
+ fix pulse sound switching (idek what's wrong but it's buggy) and needs to be OSS/ALSA compatible
  + fix ffmpeg screen capture quality and audio
+ contact management application
