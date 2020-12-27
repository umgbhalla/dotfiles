## FreeBSD Installation <a name="freebsd-installation">

## Table of Contents

- [Setup](#setup)
- [Boot Start](#boot-start)
- [Hostname](#hostname)
- [Distribution Select](#distribution-select)
- [Disk Partitioning](#disk-partitioning)
- [Password](#password)
- [Network Prompt](#network-prompt)
- [Clock and Localization](#clock-and-localization)
- [System Configuration](#system-configuration)
- [System Hardening](#system-hardening)
- [Adding a User](#adding-a-user)
- [Basic Networking](#basic-networking)
- [Core Setup](#core-setup)
- [Cloning](#cloning)

#### Setup <a name="setup"></a>

- For this guide you will need the following:
  - The computer that will be wiped to install the new operating system
  - An internet connection
  - A disposable usb drive that can be wiped
- Download the latest [FreeBSD installation image](https://www.freebsd.org/where.html) from their website. I downloaded the `amd64` architecture release 12.2 `memstick.img` instead of the standard iso image since it does not require an internet connection for the base installation.
- Burn the downloaded disk image onto the usb.

  ```
  sudo dd bs=4M if=/path/to/img of=/dev/sdx status=progress
  ```

  where `/dev/sdx` is the root partition of the usb (do not include specific partition numbers). You may want to run `sudo fdisk -l` or `geom disk list` (depending on your operating system) first to double check the partition name.

- Boot the computer from the live usb. This may require manual BIOS tweaking depending on your machine. Be sure to boot with UEFI if you plan on dual booting with Windows in the future.

#### Boot Start <a name="boot-start"></a>

When prompted between `Install`, `Shell`, and `Live CD`, select `Install`. Then select the keymap best suited for you. Generally you can continue with the default selection, but I always explicitly choose the `United States of America` keyboard (`us.kbd`) just to be safe.

#### Hostname <a name="hostname"></a>

Name your system. I will name mine `aesir`.

#### Distribution Select <a name="distribution-select"></a>

When choosing which components to install, select `kernel-dbg`, `lib32`, and `ports`.
`lib32` enables support for 32-bit libraries (such as the Steam client) and the ports
tree is FreeBSD's external software management system (the only time you should _not_
install this is if your machine is intended for use as a server - in which case you
might try [OpenBSD](https://www.openbsd.org)).

#### Disk Partitioning <a name="disk-partitioning"></a>

We will be partitioning our disk with ZFS. Select `Auto (ZFS)` to partition with ZFS.

- Change the swap size to be twice the size of ram. For example, if I have 16 GB, this will be 32GB.
  ```
  32g
  ```
- Verify that the partition scheme is `GPT`, and either `(BIOS + UEFI)` or `(UEFI)`.
- Change the pool type to stripe, and select your disk you want FreeBSD to be installed on
  (usually this is named `ada0`).
- Proceed with installation to begin the base system installation process, as well as
  the ports tree.

#### Password <a name="password"></a>

When prompted, create a root password.

#### Network Prompt <a name="network-prompt"></a>

Eventually the installation process will prompt you to select a network configuration.
As I mentioned earlier, it is much easier to set up a proper network configuration after
the installation process has finished. Select `cancel` and the installation process
will continue without a network connection.

#### Clock and Localization <a name="clock-and-localization"></a>

- The installation will prompt if your CMOS clock is set to UTC. If you are switching
  from Windows to FreeBSD, it is highly likely that Windows reset your CMOS clock to
  the local timezone. If that is the case, select `No`.

  In most other cases you can select `Yes`. If you are unsure, you can verify the CMOS time
  in the system BIOS.

- Next, choose your country and region. This is used for timezone/localization settings.
- Set the system time. Generally this is very accurate and you can set the default time
  and date it provides.

#### System Configuration <a name="system-configuration"></a>

You are now able to choose the types of services you would like to have run at boot time.
I have never had a need to enable any additional services other than `moused`, `sshd`, and
`dumpdev`.

#### System Hardening <a name="system-hardening"></a>

FreeBSD has a wide variety of security features it offers (as opposed to Linux systems) out
of the box. I select `random_pid`, `clear_tmp`, `disable_syslogd`, and `disable_sendmail`.

#### Adding a User <a name="adding-a-user"></a>

When prompted, select `Yes` to add a new user to the system. This will be the main user.

- Set the username and full name. I usually keep both the username and full name the same.
- Press `ENTER` to keep Uid and Login group as default.
- When prompted, be sure to add your user to the additional group `wheel`
  for sudo privileges (You can also save yourself some time by adding yourself to the
  `video` and `operator` groups).
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

#### Basic Networking <a name="basic-networking"></a>

- Use `sysctl net.wlan.devices` to determine your wifi device name. Mine is `iwm0`.
  Then enable the device in your `/etc/rc.conf`. In this example I will use `iwm0`.
  You will additionally need to use either `ee` or `vi` text editors since they are
  the only editors installed by default.
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

#### Core Setup <a name="core-setup"></a>

- Update the main package repositories and install core utilities.
  Install `pkg` when prompted.
  ```
  pkg update
  pkg install sudo git neovim
  ```
- Enable root permissions for the `wheel` group via the `visudo` command:
  ```
  %wheel ALL=(ALL) ALL
  ```
- Logout and log back in as the main user created earlier.
  You will now be able to install packages.
- Set up graphics for X. I use an intel-based vga so I installed
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
- Setup the default shell. I currenly use `mksh`. set it as the default shell for the main user.
  ```
  sudo pkg install mksh
  sudo chsh -s /usr/local/bin/mksh
  ```
- Log out and log back in.
  ```
  exit
  ```
  In order to properly clone my dotfiles you will need to empty the user home directory. Because
  `mksh` does not support globbing (or, a limited version), we will need to remove all dotfiles
  to clone directly into the directory.
  ```
  rm -r .*
  ```
- Finally, install my dotfiles. See [cloning](#cloning) for more details.

#### Cloning <a name="cloning"></a>

- Clone this repository to your home folder using the steps outlined below.

  ```sh
  git clone --recursive https://github.com/bossley9/dotfiles.git .
  ```

- Log out and log back in.
  ```
  exit
  ```
- Run the install script I have created.
  ```
  $XDG_CONFIG_HOME/install/freebsd.sh
  ```
- Reboot to allow changes to take effect.
  ```
  reboot
  ```
