+++
title = "LLM Attention Kernels and GPU Primitives"
date = 2026-06-05T11:10:00+08:00
tags = ["llm", "attention", "triton", "cuda", "gpu", "kernel"]
categories = ["AI"]
series = ["LLM Attention Kernels and GPU Primitives"]
draft = false
image = "/images/posts/llm-attention-kernels-gpu-primitives/gpu-attention-kernel-icon.svg"
description = "A series index for LLM attention kernels and GPU primitives: fused softmax, online softmax, FlashAttention, PagedAttention kernels, Triton/CUDA, and memory-access optimization."
+++

This series is for kernels and GPU primitives. The mechanism series explains why a serving system needs an optimization; this series explains how the optimization works at the kernel and memory-access level.

## Existing Posts {#existing-posts}

1. [Fused Softmax in Triton]({{< relref "/posts/fused-softmax" >}})
2. [Online Softmax: Tiling for Arbitrarily Large Rows]({{< relref "/posts/online-softmax" >}})

## Planned Posts {#planned-posts}

- FlashAttention: how online softmax becomes IO-aware attention
- From FlashAttention to PagedAttention: how attention kernels and cache layout constrain each other
- PagedAttention kernels: how block tables enter the attention memory path
- Triton profiling: using roofline thinking for bandwidth-bound and compute-bound kernels
- Why decode kernels are often limited by HBM bandwidth

## Questions Each Post Should Answer {#questions}

- Which memory access does this kernel remove or reduce?
- How does data move through HBM, L2, shared memory, and registers?
- Does it improve prefill, decode, or both?
- How is it coupled to vLLM / SGLang serving parameters or cache layout?
