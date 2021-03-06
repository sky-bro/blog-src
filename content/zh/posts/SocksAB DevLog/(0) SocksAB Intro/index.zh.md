---
title: "(0) SocksAB Intro"
date: 2020-12-25T13:31:30+08:00
description:
draft: false
enableToc: true
enableTocContent: false
tocLevels: ["h2", "h3", "h4"]
author: '<a href="https://sky-bro.github.io" class="theme-link">Kyle</a>'
authorEmoji: 🦂
tags:
-
series:
- SocksAB DevLog
categories:
-
image: # images/icons/tortoise.png
libraries:
- mathjax
---
准备用qt写一个简单的fq/代理软件，叫做SocksAB，分为服务端Socks-Bob和客户端Socks-Alice两个部分。
程序源代码托管在[github.com/sky-bro/SocksAB](https://github.com/sky-bro/SocksAB)

<!--more-->

## 原理介绍

首先正常情况下，我们要访问远端的某个服务，这中间我们的通信是可能会被GFW掐断的

![without proxy](/images/posts/SocksAB%20DevLog/0/without-proxy.svg)

而fq/代理软件的原理则其实非常简单，我们不直接访问服务器，而是将需要的数据/请求通过我们的一个服务器中转一下。而这个服务器通常是我们能够从国内直接访问，所以我们的fq实际就是利用了GFW并没有把所有的能访问`google.com`的电脑(ip)都封杀掉，我们只要能访问到这些电脑(ip)，就能访问到`google.com`。

具体来说，正常的fq/代理软件都一定至少会有两个部分，一个客户端，用来收集本地的代理请求；还有一个服务端，接收这些请求，并去向真正的服务器完成这些请求。

> 只有一个部分原理上也是可以的，就是比如直接在你的国外某服务器上搞一个Socks5代理或是http代理，然后你的电脑上直接为你的软件设好相应的代理。
> 问题就是我们使用的软件所支持的代理方式（主要就是socks和http）都是很容易被GFW发现的，这样直接的代理方式是用不了多久了

首先Socks-Alice需要实现Socks5代理或是http代理，这样我们的浏览器或是其它啥软件就可以配置走这个代理了。接着代理软件客户端Socks-Alice通过一系列操作将请求发给代理软件服务端Socks-Bob，这中间具体路径是怎么走的（比如有没有再经过更多人中转），或是数据内容怎么样形式发送的（加密或是伪装）都是很自由的，只要Socks-Bob能够理解，解析拿到正确的请求，发给真正的服务器即可。如下图：

![SocksAB](/images/posts/SocksAB%20DevLog/0/SocksAB.svg)

所以一个fq/代理软件的核心是要实现Socks-Alice与Socks-Bob间的数据传递。目前比较好的方式就是使用AEAD ciphers加密传输，以及伪装成tls流量。

### 加密

等着后面慢慢

### 伪装

再补充

## 参考链接

* [socks5 rfc1928](https://tools.ietf.org/html/rfc1928)
