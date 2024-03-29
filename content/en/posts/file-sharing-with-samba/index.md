+++
title = "File Sharing with Samba"
date = 2022-04-12T19:28:00+08:00
tags = ["samba"]
categories = ["workspace-setup"]
draft = false
image = "/images/icons/samba-logo.png"
libraries = ["mathjax"]
description = "use samba to share files across linux and windows."
+++

## Introduction {#introduction}

You should use NFS for dedicated Linux Client to Linux Server connections.

For mixed Windows/Linux environments use Samba.


## Server {#server}


### linux {#linux}

**Dependency Installation**

```shell
sudo pacman -Sy samba
```

**configuration file**

Need to create `/etc/samba/smb.conf` before starting the service `systemctl start smb`

You can get an example configuration file from [Samba Git Repository](https://git.samba.org/samba.git/?p=samba.git;a=blob_plain;f=examples/smb.conf.default;hb=HEAD).

Get help about writing the configuration file with `man smb.conf`.

Here's mine:

```toml
[global]
  workgroup = k4i.top
  map to guest = Bad Password
  server string = Samba Server
  passdb backend = tdbsam

[homes]
   comment = Home Directories
   browseable = no
   writable = yes

[tmp]
  comment = Temporary file space
  path = /tmp
  public = yes
  writable = yes
  printable = no
```

**user management**

we need to have a user to access linux files.

1.  For anonymous access, we use the guest account (by default, it's user `nobody`)
2.  If you want to access files in a home directory, you should login as that user.

We need to specifically add a user (an existing linux user, or a non-existing one -- samba will create the user for you) to samba, then set a password for that user (can be different from your linux login password)

```shell
sudo smbpasswd -a sky
```

And by default, when you access a samba server with a user, you can browser that user's home directory (if it has one).

**start**

```shell
systemctl start smb.service
# if you want to access service with host names, start this service
systemctl start nmb.service
```


## Client {#client}


### windows {#windows}

In the file manager location bar, input: `\\servername\[share]`, then you may remap any folder to a drive.

tips: to clean user credentials (or with the control panel GUI)

```bat
net use /delete *.
```


### linux {#linux}


#### With a file manager: {#with-a-file-manager}

<https://wiki.archlinux.org/title/samba#File_manager_configuration>

In the location bar, input: `smb://servername/share`


#### With a command line tool: `smbclient` {#with-a-command-line-tool-smbclient}

```shell
smbclient //xyz/public -U nobody
smbclient //xyz/sky -U sky
```


#### mount at startup {#mount-at-startup}

```shell
sudo pacman -Sy cifs-utils

# prepare mount entry
sudo vim /etc/fstab
# add smbshare like:
# //192.168.31.248/Dev /home/sky/share/Dev cifs credentials=/home/sky/.smbcredentials,user,uid=sky,gid=sky 0 0
# user: allow any user to mount the drive
# noauto: the dirve is not mounted during startup, do not add this if you want to mount at startup

systemctl daemon-reload # make /etc/fstab change effective

# create mount credentials
vim ~/.smbcredentials
# username=sky
# password=sky
chmod 0600 ~/.smbcredentials

# create the mount point
mkdir -p ~/share/Dev

# mount
mount ~/share/Dev

# umount
umount ~/share/Dev
```


## Resources {#resources}

-   [File transfer between Linux and KVM Guest Windows 10](https://jeffshee.github.io/2021-01-29-samba-fedora33-kvm-windows-10/)
-   [Arch Wiki: samba](https://wiki.archlinux.org/title/samba)
