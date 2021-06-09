---
title: "HKDF"
date: 2021-05-26T14:51:22+08:00
description:
draft: false
enableToc: true
enableTocContent: false
tocLevels: ["h2", "h3", "h4"]
author: '<a href="https://k4i.top" class="theme-link">k4i</a>'
authorEmoji: 🦂
tags:
-
series:
-
categories:
-
image: # images/icons/tortoise.png
libraries:
- mathjax
---
HMAC-based KDF(key derivation function)

<!--more-->

## HMAC

message authentication code (MAC)
Hash-based MAC

$\text{HMAC}(\text{H}, key, text) = \text{HMAC-Hash}(key, text) = \text{H}((key \oplus opad) \Vert \text{H}(key \oplus ipad, text))$

## HKDF

### HKDF-Extract

$IKM$ (input keying material)
$PRK = \text{HKDF-Extract}(\text{H}, salt, IKM) = \text{HMAC}(\text{H}, salt, IKM)$

### HKDF-Expand

expand the above PRK (pseudo random key) to a given length.

```c
N = ceil(L/hashLen)
T = T(1) || T(2) || T(3) || ... || T(N)
OKM = T的前L字节

T(0) = 空
T(1) = HMAC(H, PRK, T(0) || info || 0x01) = HMAC-Hash(PRK, T(0) || info || 0x01)
T(2) = HMAC(H, PRK, T(1) || info || 0x02) = HMAC-Hash(PRK, T(1) || info || 0x02)
T(3) = HMAC(H, PRK, T(2) || info || 0x03) = HMAC-Hash(PRK, T(2) || info || 0x03)
```

## Refs

* [HKDF算法](http://suntus.github.io/2019/05/09/HKDF%E7%AE%97%E6%B3%95/)
