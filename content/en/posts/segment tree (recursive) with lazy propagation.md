---
title: "Segment Tree (Recursive) w/ Lazy Propagation"
date: 2020-04-20T10:25:08+08:00
description: postpone updates till when we really need(query) them later.
draft: true
hideToc: false
enableToc: true
enableTocContent: false
tocPosition:
tocLevels: ["h2", "h3", "h4"]
author: '<a href="https://sky-bro.github.io" class="theme-link">Kyle</a>'
authorEmoji: 🦂
tags:
- "segment tree"
series:
- "segment tree"
categories:
- "Data Structure & Algorithm"
image: images/icons/binarytree.png
libraries:
- mathjax
---
In [segment tree - iterative](../segment-tree-iterative/) and [segment tree - recursive](../segment-tree-recursive), we know how to use segment tree to query a range sum and update a single element in the array. But if we want to update a range of elements, we will have to call the update function for every index in the range. How can we still do our update in $O(\log{n})$?

By using **lazy propagation**. The idea is to postpone some updates till when we really need(query) them.

<!--more-->

Abandoned, please see: [segment tree (non-recursive) w/ lazy propagation](../segment-tree-non-recursive-with-lazy-propagation/)

## Ref

* [GeeksforGeeks: Lazy Propagation in Segment Tree](https://www.geeksforgeeks.org/lazy-propagation-in-segment-tree/)
