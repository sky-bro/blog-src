+++
title = "LLM Quantization and Low-Precision Serving：量化与低精度推理路线"
date = 2026-06-05T11:00:00+08:00
tags = ["llm", "量化", "低精度", "int4", "fp8", "serving"]
categories = ["AI"]
series = ["LLM Quantization and Low-Precision Serving"]
draft = false
image = "/images/posts/llm-quantization-low-precision-serving/quantization-4bit-buckets-icon.svg"
description = "LLM 量化与低精度推理系列索引：INT8/INT4、GPTQ、AWQ、SmoothQuant、NF4、AQLM、KV cache 量化、FP8 serving 和质量/速度/显存权衡。"
+++

这个系列专门放量化和低精度 serving。它不只是“推理优化”的一个小节，因为量化同时牵涉表示方式、误差控制、校准数据、kernel 支持、KV cache、显存带宽和质量回归。

## 已有文章 {#existing-posts}

1. [大模型量化综述：从线性量化到码本量化]({{< relref "/posts/llm-quantization" >}})

## 后续文章 {#planned-posts}

- KV Cache Quantization：权重量化之外，真正吃显存的是 cache
- FP8 Serving：E4M3 / E5M2、activation scale 和 Tensor Core 路径
- INT4 Weight-only Serving：为什么省显存不一定等于更快
- GPTQ / AWQ / SmoothQuant 的工程化边界
- NF4 / AQLM：更低 bit 下为什么需要码本
- 量化 benchmark：质量、速度、显存三角如何测

## 每篇文章要回答的问题 {#questions}

- 量化的是 weight、activation、KV cache，还是通信/存储格式？
- 收益来自显存容量、HBM 带宽、Tensor Core 吞吐，还是磁盘大小？
- 误差主要来自 outlier、scale 粒度、rounding，还是 clipping？
- 在 vLLM / SGLang 里如何加载、观测和回退？
