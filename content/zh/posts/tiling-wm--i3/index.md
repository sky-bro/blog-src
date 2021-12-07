+++
title = "Tiling WM (i3)"
date = 2021-12-04T22:36:00+08:00
tags = ["wm"]
categories = ["notes"]
draft = false
image = "/images/icons/i3wm-logo.png"
libraries = ["mathjax"]
description = "notes on i3 tiling wm."
+++

## 什么是窗口管理器 {#什么是窗口管理器}

窗口管理器 (Window Manager) 就是用来管理窗口的. 主要分为两大类:


### Stacking WM: {#stacking-wm}

每个窗口都可以拖拽, 改变大小, 窗口之间可以有重叠, 主要靠鼠标控制.

比如下图, Stacking WM的屏幕利用率比较低, 而且操作严重依赖鼠标, 比较慢.

{{< figure src="/images/posts/Tiling WM/stacking-wm-example.jpeg" >}}


### Tiling WM: {#tiling-wm}

窗口不能拖拽, 窗口之间没有重叠, 像瓷砖一样铺满屏幕, 配合很多快捷键使用, 基本不或
者少依赖鼠标进行控制.

{{< figure src="/images/posts/Tiling WM/tiling-wm-example.jpeg" >}}


### Tiling WM的优势 {#tiling-wm的优势}

-   自动放置窗口, 不重叠, 空间利用率高
-   多种布局方式切换, 适应各种需求 (基本所有tiling wm都不止Tiling一种布局, 比如i3wm还有Tabbed, Stacked, 还可以选择让某窗口全屏或是悬浮)
-   基本全靠键盘控制, 快速方便


## container与tree {#container与tree}

{{< alert theme="warning" >}}
我这里并没有严格去看源码这个树到底是怎么构建的(尤其是很多特殊情况), 不过就简单理解下树和窗口之间的关系是可以的.
{{< /alert >}}

大多窗口管理器采用树结构来保存窗口, i3也是如此.

每个workspace的所有窗口保存在一个tree数据结构里面, 这个tree的每个节点都是一个 container (window算特殊的container, 是没有孩子的叶子节点), 一个container里面又可以包含多个container.


### container属性 {#container属性}

每个container有两个比较重要的属性:

1.  布局方式: split (分splith, splitv), tabbed 或者 stacked

<a id="org9fcec13"></a>

{{< figure src="/images/posts/Tiling WM/tiling-wm-ambiguous-layout.svg" caption="Figure 1: tree of ambiguous layout" >}}

图 [1](#org9fcec13) 代表的窗口可能是图 [2](#orgfe411f8), 也可能是图 [3](#org9747f23)或者其他的, 因为我们不知道每个container内部的窗口布局方式. 所以窗口管理器会为每个节点保存布局方式, 表示内部的孩子节点应该按照什么方式放置.

<a id="orgfe411f8"></a>

{{< figure src="/images/posts/Tiling WM/possible-window-status-01.svg" caption="Figure 2: possible window status 01" >}}

<a id="org9747f23"></a>

{{< figure src="/images/posts/Tiling WM/possible-window-status-02.svg" caption="Figure 3: possible window status 02" >}}

所以如果想只代表图 [2](#orgfe411f8) 中的窗口, 那么应该为container增加布局方式属性, 如图 [1](#org9fcec13) 所示.

<a id="org40a4e70"></a>

{{< figure src="/images/posts/Tiling WM/tiling-wm-unambiguous-layout.svg" caption="Figure 4: tree of unambiguous layout" >}}

1.  split方向对应占多少百分比

因为我们通常还会控制每个窗口/容器的宽度/高度, 所以还应该为每个容器增加split方向的空间占比, 如图 [5](#orgcd99ed8) 所示.

<a id="orgcd99ed8"></a>

{{< figure src="/images/posts/Tiling WM/tiling-wm-percentage.svg" caption="Figure 5: tree with container percentage" >}}


### 练习与理解 {#练习与理解}

为了理解我们在操作窗口时对应tree的构造, 我们将窗口/容器都放在另一个设为tabbed或
者stacked布局的容器内 -- **因为这两种布局才会显示标题**.

1.  切换到一个没有任何窗口的workspace: 如 `$Mod+3`.
2.  用 `$Mod+e` 设置默认的布局为split(水平/垂直), (一般不会设为tabbed或stacked).
3.  `$Mod+ENTER` 打开一个terminal (我这里是st, 或者任何别的窗口也行).
4.  `$Mod+w/s` 设置所在container布局为tabbed或stacked (这里实际上会新建一个container)
5.  后续在这个stabbed或者stacked container下操作就可以看到标题了

比如通过 `$Mod+v` 新建一个垂直split布局的container包裹当前的st窗口.

可以看到标题显示为 `V[st]`.

再 `$Mod+ENTER` 之后显示为 `V[st st]`.


### 操作container (一组窗口) {#操作container--一组窗口}

理解树结构与窗口间的联系后, 有助于我们对窗口的操作, 尤其是对一组窗口的操作.

因为很多操作实际上都是针对树的container节点, 每个节点可能对应了多个窗口.

我们可以:

-   移动一组窗口
-   关闭一组窗口
-   灵活控制各个container的布局方式 (不同container可以用不同的布局)


## 快捷键设置 {#快捷键设置}

这里仅列出了比较重要的快捷键, 我详细的配置放在了github的[.dotfiles](https://github.com/sky-bro/.dotfiles)仓库.

```sh
# some configs from my ~/.config/i3/config
set $mod Mod4

set $up k
set $down j
set $left h
set $right l

# change focus
bindsym $mod+$left focus left
bindsym $mod+$down focus down
bindsym $mod+$up focus up
bindsym $mod+$right focus right

# move focused window
bindsym $mod+Shift+$left move left
bindsym $mod+Shift+$down move down
bindsym $mod+Shift+$up move up
bindsym $mod+Shift+$right move right

# split in horizontal orientation
bindsym $mod+Shift+v split h

# split in vertical orientation
bindsym $mod+v split v

# enter fullscreen mode for the focused container
bindsym $mod+f fullscreen toggle

# change container layout (stacked, tabbed, toggle split)
bindsym $mod+s layout stacking
bindsym $mod+w layout tabbed
bindsym $mod+e layout toggle split

# toggle tiling / floating
bindsym $mod+Shift+space floating toggle

# change focus between tiling / floating windows
bindsym $mod+space focus mode_toggle

# focus the parent container
bindsym $mod+p focus parent

# focus the child container
bindsym $mod+c focus child

# resize window (you can also use the mouse for that)
set $resize_step 5

bindsym $mod+y resize shrink width $resize_step px or $resize_step ppt
bindsym $mod+i resize grow height $resize_step px or $resize_step ppt
bindsym $mod+u resize shrink height $resize_step px or $resize_step ppt
bindsym $mod+o resize grow width $resize_step px or $resize_step ppt
```

_**Mod-h/j/k/l**_
: 切换到左/上/下/右边窗口

_**Mod-S-h/j/k/l**_
: 移动窗口/容器

_**Mod-y/u/i/o**_
: 调整窗口/容器大小

_**Mod-v**_
: **增加一个container** 存放当前focused window(或者container), 容器内采用垂直split布局

_**Mod-S-v**_
: 同上, 不过容器内采用水平split布局

_**Mod-e/w/s**_
: 设置 **所在container** 的布局为Split(会在splith, splitv间循环), Tabbed, Stacked

_**Mod-p**_
: Focus parent

_**Mod-c**_
: Focus child

多练习增加container与改变所在container布局的操作, 理解他们之间的区别(前者影响当前所选择的节点, 后者影响父亲节点).


## 参考 {#参考}

-   [i3wm 用户手册 >> tree](https://i3wm.org/docs/userguide.html#%5Ftree)
-   [youtube: TheAlternative.ch - LinuxDays FS16 - Linux for Experts course](https://www.youtube.com/watch?v=Api6dFMlxAA)
-   [wiki: window manager types](https://en.wikipedia.org/wiki/Window%5Fmanager#Types)