## OpenBSD Installation <a name="openbsd-installation">

## Table of Contents

- [Setup](#setup)
- [Boot Start](#boot-start)
- [Hostname](#hostname)
- [Network Prompt](#network-prompt)
- [Password](#password)
- [SSH](#ssh)
- [X](#x)
- [Adding a User](#adding-a-user)
- [Disk Partitioning](#disk-partitioning)
- [Set Installation](#set-installation)
- [Clock and Localization](#clock-and-localization)
- [Core Setup](#core-setup)
- [Cloning](#cloning)

#### Setup <a name="setup"></a>

- For this guide you will need the following:
  - The computer that will be wiped to install the new operating system
  - An internet connection
  - A disposable usb drive that can be wiped
- Download the latest [OpenBSD installation image](https://www.openbsd.org/faq/faq4.html#Download) from their website. I downloaded the `amd64` architecture release 6.8 `installXX.img` instead of the standard iso image since it does not require an internet connection for the base installation and file sets.
- Burn the downloaded disk image onto the usb. The dollar sign indicates elevated privileges (usually `sudo` or `doas` will suffice).

  ```
  $ dd bs=4M if=/path/to/img of=/dev/sdx status=progress
  ```

  where `/dev/sdx` is the root partition of the usb (do not include specific partition numbers). You may want to run `sudo fdisk -l` or `geom disk list` (depending on your operating system) first to double check the partition name.

- Boot the computer from the live usb. This may require manual BIOS tweaking depending on your machine. Be sure to boot with UEFI if you plan on dual booting with Windows in the future.

#### Boot Start <a name="boot-start"></a>

When prompted between `(I)nstall`, `(U)pgrade`, `(A)utoinstall`, and `(S)hell`, select `(I)nstall`. Then select the keymap best suited for you. Generally you can continue with the default selection, but I always explicitly choose `us` just to be safe.

#### Hostname <a name="hostname"></a>

Name your system. I will name mine `aesir`.

#### Network Prompt <a name="network-prompt"></a>

The installation process will prompt you to configure a network interface.

It is much easier to set up a proper network configuration after the installation process has finished.

- Type `done` and the installation process will continue without a network connection.
- Type a DNS name domain name. I usually just use `domain`.
- Press `ENTER` to use `none` for the default DNS nameservers.

#### Password <a name="password"></a>

When prompted, create a root password.

#### SSH <a name="ssh"></a>

Press `ENTER` to start `sshd` by default.

#### X <a name="x"></a>

Press `ENTER` to disallow xenodm to start Xorg. We will start X manually.

#### Adding a User <a name="adding-a-user"></a>

When prompted, type a username to add the new user to the system. This will be the main user. Mine will be named `sam`.

- Press `ENTER` to use the username as the full name.
- Create a password for the new user.
- Press `ENTER` to disallow root ssh login.

#### Disk Partitioning <a name="disk-partitioning"></a>

- You will be prompted to choose the root disk. **BE ABSOLUTELY SURE** the disk you choose is the correct disk - occasionally the installation process will choose a different disk than you expect. You can type `?` to view details for each disk.
- Press `ENTER` to partition the disk using GPT by default.
- Press `ENTER` to partition the disk using the default partition layout. The default partition layout is (dare I say) surprisingly good, and unless you really care deeply about the specifics of each partition, there is no need to change the automatic layout.
- Press `ENTER` to finish initializing disks.

#### Set Installation <a name="set-installation"></a>

You will now be prompted to install the file sets.

- Type `disk` to install the file sets to the newly partitioned disk.
- Type `no` to confirm that the disk to partition is not already mounted.
- Type the disk name for the installation media usb to specify which disk contains the file sets. Usually you can press `ENTER` to choose the default.
- When prompted to choose the partition the sets are installed on, select the partition. When in doubt, press `ENTER` to select the default.
- Press `ENTER` to choose the default pathname to the sets.
- Press `ENTER` to continue with the default sets to install. It is not very common to have a need to disable any of the base file sets (The only set that is truly unnedded is the game set, but it doesn't hurt anything to keep it).
- Type `yes` to continue installation without SHA256 checksum verification. People might view this as a security/package integrity risk but I don't think it's a big deal if you know what you're doing.
- Press `ENTER` to be done with the location and installation of the sets.

#### Clock and Localization <a name="clock-and-localization"></a>

- Choose the timezone (and sub-timezone) in which you are located. You may type `?` to view options.

You have now successfully finished installing OpenBSD! Press `ENTER` to reboot the system into the installed environment. Then log in using the root credentials created earlier. You may remove the installation media usb.

#### Basic Networking <a name="basic-networking"></a>

- Type `ifconfig` to find the device names of all network devices available. I will be setting up wifi using my wireless device. My device name is `iwm0`.

  If you are unsure which device interface to use, look at the `Media` category for each entry. Ethernet interfaces usually specify `Ethernet`, and wireless interfaces usually specify the wireless protocol (mine says `IEEE802.11`).

  > if your network configuration is not working, it could be that OpenBSD cannot provide firmware files by default due to "big corps being bad". In this case, refer to the [OpenBSD Networking FAQ](https://www.openbsd.org/faq/faq6.html) - there's no alternative but to connect to ethernet and run `fw_update`.

- Create a hostname.if file for the specific network interface. Since my device name is `iwm0`, I will create `/etc/hostname.iwm0` and add the following contents:

  ```
  join SSID_HERE wpakey PSK_HERE
  dhcp
  ```

  Since Vim is not installed, you will need to use Vi to edit the file.

- I will also create a hostname.if file for ethernet. My ethernet device name is `em0` so I will create `/etc/hostname.em0` with the following contents:

  ```
  dhcp
  ```

  Since Vim is not installed, you will need to use Vi to edit the file.

- Reboot, login to root, and verify that a network connection has been established
  with `ping openbsd.org`.
  ```
  reboot
  ```

#### Core Setup <a name="core-setup"></a>

- Use OpenBSD's package utilities to install essential programs such as version control and a text editor.
  ```
  pkg_add pkglocatedb
  pkg_add git neovim
  ```
- Enable root permissions for the `wheel` group in `/etc/doas.conf`:
  ```
  permit persist :wheel
  ```
  Then log out and log back in as the main user.
  ```
  exit
  ```
  In order to properly clone my dotfiles you will need to empty the user home directory. Because `(m)ksh` does not support globbing (or, a limited version), we will need to remove all dotfiles to clone directly into the directory.
  ```
  cd $HOME
  # this action is irreversible - be careful!
  rm -r .*
  ```

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
  $XDG_CONFIG_HOME/install/openbsd.sh
  ```
- Reboot to allow changes to take effect.
  ```
  reboot
  ```
