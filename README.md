# dotfiles
dotfiles

## Table of Contents
1. [System Information](#info)
2. [Setup](#setup)

## System Information <a name="info"></a>


> Information was taken from [`neofetch`](https://github.com/dylanaraps/neofetch).

```
                   -`                     
                  .o+`                   ------------- 
                 `ooo/                   OS: Arch Linux x86_64 
                `+oooo:                  Host: Latitude E7470 
               `+oooooo:                 Kernel: 5.4.8-arch1-1 
               -+oooooo+:                Uptime: 37 mins 
             `/:-:++oooo+:               Packages: 553 (pacman) 
            `/++++/+++++++:              Shell: bash 5.0.11 
           `/++++++++++++++:             WM: sway 
          `/+++ooooooooooooo/`           Theme: Adwaita [GTK2], Nordic [GTK3] 
         ./ooosssso++osssssso+`          Icons: Adwaita [GTK2/3] 
        .oossssso-````/ossssss+`         Terminal: termite 
       -osssssso.      :ssssssso.        Terminal Font: Monospace 9 
      :osssssss/        osssso+++.       CPU: Intel i7-6600U (4) @ 3.400GHz 
     /ossssssss/        +ssssooo/-       GPU: Intel Skylake GT2 [HD Graphics 520] 
   `/ossssso+/:-        -:/+osssso+-     Memory: 1059MiB / 15684MiB 
  `+sso+:-`                 `.-/+oso:
 `++:.                           `-/+/
 .`                                 `/
```

## Setup <a name="setup"></a>

Last updated: 2020-01-12

> Note: [Sway does not support Nvidia GPU drivers](https://github.com/swaywm/sway/wiki)

### Installation

- Download [Arch](https://github.com/swaywm/sway/wiki). My version was 2020-01-01.
- Burn the cd image onto a usb. This can be done via [Balena Etcher](https://www.balena.io/etcher/), [Rufus](https://rufus.ie/), or manually (Note not to include partition number):
    ```
    sudo dd bs=4M if=/path/to/iso of=/dev/sdx status=progress
    ```
- Plug ethernet into the machine and boot from the live usb.
- Test `ping archlinux.org` for a network response. If a response appears, skip this step. If no response appears:
  - Get the network card name.
    ```
    ip link
    ```
  - Copy the example configuration.
    ```
    cp /etc/netctl/examples/ethernet-static /etc/netctl/YOUR-NETWORK-CARD-HERE
    ```
  - Then, in `/etc/netctl/YOUR-NETWORK-CARD-HERE`:
    ```
    Interface=YOUR-NETWORK-CARD-HERE
    ```
  - Reboot with the configuration:
    ```
    netctl enable YOUR-NETWORK-CARD-HERE
    systemctl stop dhcpcd
    systemctl disable dhcpcd
    sudo reboot
    ```
  - verify `ping archlinux.org` produces a response. Do not proceed and repeat this step until a response appears.
- Update the system time.
  ```
  timedatectl set-ntp true
  ```
- Disk Partitioning:
  - To view disks beforehand:
    ```
    fdisk -l
    ```
  - Open the partition editor.
    ```
    cfdisk
    ```
  - Delete all partitions. Make two partitions: One for the root filesystem `/` and one for swap memory (10 GB).
    ```
    free space
    new
    ```
  - The root filesystem size will be the total size minus 10 GB.
    ```
    YOUR-FILESYSTEM-SIZE-MINUS-TEN-GIGABYTES
    primary
    bootable
    write
    ```
  - Next, the swap.
    ```
    free space
    new
    ENTER
    primary
    write
    quit
    ```
    You can verify the partition sizes with `fdisk -l`.
  - Next, overwrite any existing data and change the partition extensions.
    ```
    mkfs.etx4 /dev/sda1
    mkswap /dev/sda2
    swapon /dev/sda2
    ```
- Mount the created root partition.
  ```
  mount /dev/sda1 /mnt
  ```  
- Install the linux kernel and base. This will take some time to complete.
  ```
  pacstrap /mnt base linux linux-firmware
  ```
- Generate the `fstab` and log into the root partition.
  ```
  genfstab -U /mnt >> /mnt/etc/fstab
  arch-chroot /mnt
  ```
- Install vim (or emacs) to edit files:
  ```
  pacman -S vim
  ```
- Synchronize the local time and hardware clock, where `[region]` is your region and `[city]` is your city:
  ```
  ln -sf /usr/share/zoneinfo/[region]/[city] /etc/localtime
  hwclock --systohc
  ```
- Edit `/etc/locale.gen`:
  ```
  en_US.UTF-8 UTF-8
  ```
  Then generate locales.
  ```
  locale-gen
  ```
- Edit `/etc/locale.conf` to set the system language:
  ```
  LANG=en_US.UTF-8
  ```
- Name your computer in `/etc/hostname`:
  ```
  YOUR-HOSTNAME-HERE
  ```
  Then update `/etc/hosts` accordingly:
  ```
  127.0.0.1 localhost
  ::1 localhost
  127.0.1.1 YOUR-HOSTNAME-HERE.localdomain YOUR-HOSTNAME-HERE
  ```
- Change the root password.
  ```
  passwd
  ```
- Install and update the grub:
  ```
  pacman -S grub os-prober
  grub-install --target=i386-pc /dev/sda
  grub-mkconfig -o /boot/grub/grub.cfg
  ```
- Now exit, unmount the filesystem, and shutdown. Safely remove the usb after the machine is powered off.
  ```
  exit
  umount -R /mnt
  shutdown -h now
  ```
- Power on the machine. It should boot immediately into the Arch login. If not, repeat the previous steps to install Arch.

### System

- Create sudo privileges by installing sudo:
  ```
  pacman -S sudo
  ```
  Then create a sudo group:
  ```
  groupadd sudo
  ```
  Edit the sudoers file with the command `EDITOR=vim visudo`:
  ```
  %sudo   ALL=(ALL)   ALL
  ```
- Set up internet. Start by enabling ethernet network packages:
  ```
  systemctl enable systemd-networkd
  systemctl start systemd-networkd

  systemctl enable systemd-resolved
  systemctl start systemd-resolved
  ```
- Once more, use `ip link` to get the name of the network card, in addition to the wifi card.
  Edit `/etc/systemd/network/wired.network`:
  ```
  [Match]
  Name=YOUR-NETWORK-CARD-HERE

  [Network]
  DHCP=ipv4

  [DHCP]
  RouteMetric=10
  ```
  Edit `/etc/systemd/network/wireless.network`:
  ```
  [Match]
  Name=YOUR-WIFI-CARD-HERE

  [Network]
  DHCP=ipv4

  [DHCP]
  RouteMetric=20
  ```
  Restart the system network daemon.
  ```
  systemctl restart systemd-networkd
  ```
  <!--
  Reboot.
  ```
  reboot
  ```
  -->
- Set up wireless.
  ```
  pacman -S wpa_supplicant
  ```
  Edit `/etc/wap_supplicant/wpa_supplicant.conf`:
  ```
  ctrl_interface=/run/wpa_supplicant
  ctrl_interface_group=sudo
  update_config=1
  p2p_disabled=1
  ```
- Now make wifi enabled on boot.
  Edit `/etc/systemd/system/wireless.service`:
  ```
  [Unit]
  Description=wpa supplicant wifi service
  Wants=network.target
  Before=network.target
  BindsTo=sys-subsystem-net-devices-YOUR-WIFI-CARD.device
  After=sys-subsystem-net-devices-YOUR-WIFI-CARD.device

  [Service]
  Type=oneshot
  RemainAfterExit=yes

  ExecStart=/usr/sbin/ip link set dev YOUR-WIFI-CARD up
  ExecStart=/usr/sbin/wpa_supplicant -i YOUR-WIFI-CARD -B -c /etc/wpa_suplicant/wpa_supplicant.conf
  ExecStop=/usr/sbin/ip link set dev YOUR-WIFI-CARD down

  [Install]
  WantedBy=multi-user.target
  ```
  Enable the service.
  ```
  systemctl daemon-reload
  systemctl enable wireless
  systemctl start wireless
  ```
- Connect to a network nearby with `wpa_cli -i YOUR-WIFI-CARD`:
  ```
  scan # wait for scan to finish
  
  scan_results
  
  add_network # take result of this command as RESULT
  
  set_network RESULT ssid "WIFINAME"
  set_network RESULT psk "PASSWORD"
  
  # for connecting to a network with no password and a login portal (hotel wifi),
  # don't set the psk and instead type:
  # set_network RESULT key_mgmt NONE

  enable_network RESULT
  save config
  quit
  ```  
- Disconnect ethernet once connected. Reboot and verify wifi connection with `ping archlinux.org`.
- Create a user account.
  ```
  useradd -m YOUR-USERNAME
  usermod -aG sudo YOUR-USERNAME
  passwd YOUR-USERNAME
  ```
  Logout with `exit` and log back in as the created user.

### Desktop environment

- Update and upgrade the system
  ```
  sudo pacman -Syyuu  
  ```
- Install the `sway `window manager and the `wayland` server. This will take some time.
  ```
  sudo pacman -S wayland sway noto-fonts ttf-dejavu ttf-liberation
  ```
- Copy the default configuration.
  ```
  mkdir -p ~/.config/sway
  cp /etc/sway/config ~/.config/sway/config
  ```
- Add modules needed for sway with `sudo vim /etc/mkinitcpio.conf`:
  ```
  MODULES=(... intel_agp i915 ...)
  ```

> Note: This may be different [depending on your architecture](https://wiki.archlinux.org/index.php/kernel_mode_setting#Early_KMS_start).

- Compile modules and reboot.
  ```
  sudo mkinitcpio -p linux
  sudo reboot
  ```
- Install everything from `base-devel` for future package building.
  ```
  sudo pacman -S git base-devel man cmake
  ```  
- Install `pip`:
  ```
  curl https://bootstrap.pypa.io/get-pip.py | sudo python
  ```
- Install a desktop terminal:
  ```
  sudo pacman -S termite
  ```
- Install an `AUR` package manager:
  ```
  cd /tmp && git clone https://aur.archlinux.org/auracle-git.git
  cd auracle-git
  makepkg -si
  ```
- It's easiest to create a wrapper inside `~/.bashrc`, like so:
  ```bash
  # auracle wrapper
  function aur() {
    if [ "$1" == "clone" ]; then  
    cd /tmp && auracle clone $2 && cd $2
    else
    auracle $@
    fi
  }
  ```
- Set up `~/.bashrc` to start `sway` by default on `tty1`.
  ```bash
  if [ "$(tty)" == "/dev/tty1" ]; then
    mkdir -p ~/.cache/sway
    sway > ~/.cache/sway/sway.log 2>&1
  fi
  ```
- Reboot and login as the created user. It should boot into `sway` automatically.

### Customization

- Install a file explorer and archive manager.
  ```
  sudo pacman -S thunar engrampa
  ```
- Invert the scroll for natural scroll and enable tap to click for the touchpad. The command `swaymsg -t get_inputs` will print all inputs. Use the identifier string for the touchpad.
  Then, in `~/.config/sway/config`:
  ```
  input "YOUR-TOUCHPAD-IDENTIFIER" {
     tap enabled
     natural_scroll enabled
  }
  ```
- Remove window borders in `~/.config/sway/config`.
  ```
  default_border none
  ```
  ~~
- Enable unfocused window semi-transparency.
  ```
  sudo pip install i3ipc
  curl https://raw.githubusercontent.com/swaywm/sway/master/contrib/inactive-windows-transparency.py -o ~/.config/sway/transparency.py
  chmod u+x ~/.config/sway/transparency.py
  ```
  Then, in the `~/.config/sway/config` configuration file:
  ```
  exec ~/.config/sway/transparency.py --opacity OPACITY-VALUE
  ```
  Where `OPACITY-VALUE` is the opacity of an unfocused window in the range [0, 1] inclusive.
  ~~
- Change the background.
  ```
  sudo mkdir -p /usr/share/backgrounds/custom
  sudo curl https://alkusin.net/voidlinux/extras/wallpapers/aks-voidX-exodus.png -o /usr/share/backgrounds/custom/void-exodus.png
  ```
  You may want to resize the image using some image manipulation program to reduce memory lag.
  Then, in the configuration file `~/.config/sway/config`:
  ```
  output "*" bg /usr/share/backgrounds/custom/void-exodus.png fill
  ```
- Configure the terminal.
  ```
  mkdir -p ~/.config/termite
  ```
  In `~/.config/termite/config`:
  ```
  [colors]
  foreground = #dddddd
  background = rgba(15, 16, 16, 0.6)
  ```
  In order to change terminal transparency, a gtk configuration must be made.
  ```
  mkdir -p ~/.config/gtk-3.0/
  ```
  In `~/.config/gtk-3.0/gtk.css`:
  ```
  VteTerminal, vte-terminal {
     padding: 8px;
  }
  ```
- Enable screenshot taking and image viewing.
  ```
  sudo pacman -S grim slurp
  sudo pacman -S imv
  mkdir -p ~/Pictures/screenshots
  ```
  Configure bindings to take screenshots in `~/.config/sway/config`.
  ```
  bindsym Print exec grim ~/Pictures/screenshots/$(date +"%y-%m-%d-%T").png
  bindsym Shift+Print exec grim -g "$(slurp)" ~/Pictures/screenshots/$(date +"%y-%m-%d-%T").png
  ```
- Create a custom app launcher using `fzf`.
  ```
  sudo pacman -S fzf 
  ```
  In `~/.config/sway/config`:
  ```
  set $menu $term --name applauncher -e "bash -c 'compgen -c | grep -v fzf | sort -u | fzf --layout=reverse | xargs -r swaymsg -t command exec'"
  for_window [app_id="applauncher"] focus, floating enabled
  ```
- Set brightness controls.
  ```
  aur clone light-git
  makepkg -si
  ```
  In `~/.config/sway/config`:
  ```
  bindsym Xf86MonBrightnessUp exec light -A 5
  bindsym Xf86MonBrightnessDown exec light -U 5
  ```
- To play video files:
  ```
  sudo pacman -S mpv
  ```
- To create a status bar using `i3blocks`:
  ```
  sudo pacman -S i3blocks
  mkdir -p ~/.config/i3blocks
  ```
  Then create an `~/.config/i3blocks/config` configuration.
  To enable the status bar in `~/.config/sway/config`:
  ```
  set $fg #222222
  set $fglight #777777
  set $gaps 16
  bar {
    position top
    gaps 4 $gaps 0 $gaps
    separator_symbol " "

    font pango:Noto Sans:24

    colors {
      background #00000000
      statusline $fg

      focused_workspace $fg #00000000 $fg
      inactive_workspace #00000000 #00000000 $fglight
      urgent_workspace #00000000 #00000000 #dd0000
    }

    tray_output none
    status_command i3blocks
  }
  ```
  I suggest installing font awesome for unique unicode symbols.
  ```
  aur clone ttf-font-awesome-4
  makepkg -si
  
  # just to verify installation
  
  fc-list | grep awesome
  fc-match fontawesome
  ```
  To read events in `i3blocks`:
  ```
  sudo pacman -S acpid
  sudo systemctl enable acpid
  sudo systemctl restart acpid
  ```
  Then add an event. For example, in `/etc/acpi/events/headphonesin`:
  ```
  event=jack/headphone HEADPHONE plug
  action=pkill -RTMIN+1 i3blocks
  ```
  This event will fire signal 1 every time headphones are plugged in. Reboot to see changes.
- To setup sound with `ALSA` and `Pulseaudio`:
  ```
  sudo pacman -S pulseaudio-alsa
  aur clone pulseaudio-ctl
  makepkg -si
  ```
  <!--
  Make sure it always starts on boot in `/etc/pulse/client.conf`:
  ```
  autospawn = yes
  ```
  -->
  Enable pulseaudio services:
  ```
  systemctl --user enable pulseaudio
  systemctl --user enable pulseaudio.socket
  ```
  Then reboot.
  ```
  sudo reboot
  ```
- Edit grub to remove the boot menu. Open `/etc/default/grub`:
  ```
  GRUB_TIMEOUT_STYLE=hidden
  ```
  Then update grub.
  ```
  sudo grub-mkconfig -o /boot/grub/grub.cfg
  ```
- At this point I realized many programs are just incompatible without an `xorg` server. I had no other alternative but to install some form of `x`.
  ```
  aur clone xorg-server-xwayland-git
  cd /tmp/xorg-server-git
  makepkg -si
  ```
- Once an `x` server is running, it is possible to open `x` programs such as the `wpa gui`:
  ```
  aur clone wpa_supplicant_gui
  makepkg -si

  # test it
  wpa_gui
  ```
- Install a browser, such as `firefox`. I chose `firefox nightly` for partial wayland support and I skipped gpg key verification because the signatures were invalid.
  ```
  aur clone firefox-nightly
  makepkg -si --skippgpcheck
  ```
- Install the `TLP` power management package.
  ```
  sudo pacman -S tlp
  sudo systemctl enable tlp
  sudo systemctl start tlp
  ```
  To improve laptop battery life, edit `/etc/default/tlp`:
  ```
  TLP_DEFAULT_MODE=BAT
  ```
- Install a theme. I chose Nordic.
  ```
  aur clone nordic-theme-git
  makepkg -si

  gsettings set org.gnome.desktop.interface gtk-theme "Nordic"
  gsettings set org.gnome.desktop.wm.preferences theme "Nordic"
  ```
  Then reboot for changes to take effect.
- I installed a chinese character font to use mandarin characters.
  ```
  sudo pacman -S wqy-zenhei
  ```
  Then reboot to see characters.
  ```
  sudo reboot
  ```
- Now, add power management settings. First, install screenlocking packages.
  ```
  sudo pacman -S swayidle swaylock
  mkdir -p ~/.config/swaylock
  ```
  Make a configuration file at `~/.config/swaylock/config`.
  Now, setup hibernation. Enable the `resume` hook in `/etc/mkinitcpio.conf`.
  This hook must be placed after `udev` and `lvm2` (if they exist).
  ```
  HOOKS=(... udev ... lvm2 ... resume ... fsck)
  ```
  Then build.
  ```
  sudo mkinitcpio -p linux
  ```
  Edit `/etc/default/grub` to enable the resume partition created earlier.
  ```
  GRUB_CMDLINE_LINUX_DEFAULT='... resume=/dev/sda2 ...'
  ```
  Then update grub.
  ```
  sudo grub-mkconfig -o /boot/grub/grub.cfg
  ```
  Use the `free` command to see how much memory is allocated for swap. It should say zero. This is because the machine has not yet been told about a swap partition.
  Change the image size to the swap size.
  ```
  free | grep Swap | awk '{ print $2 }' | sudo tee /sys/power/image_size
  ```
  Reboot.
  ```
  sudo reboot
  ```
  Get the uuid for `/dev/sda2`.
  ```
  sudo blkid
  ```
  Then, inside `/etc/fstab`, label this partition as swap.
  ```
  UUID=YOUR-UUID-HERE none swap sw 0 0
  ```
  Reboot.
  ```
  sudo reboot
  ```
  You will now be able to hibernate by running `systemctl hibernate`.
  You can lock the screen by running `swaylock -c ~/.config/swaylock/config`.
  You can suspend by running `systemctl suspend`.

### Additional

Below are a few utilities and programs I additionally install to improve my productivity.

#### Languages

- `nodejs`

#### Program/System Monitoring

- `htop`
- `strace`
- `gotop` (AUR)
- `neofetch`
- `wshowkeys-git` (AUR)
- `xorg-xeyes`

#### Package managers

- `npm`
- `yarn`

#### Code Editor Utilities

- `neovim`
- `code`

#### Image editing

- `gimp`

