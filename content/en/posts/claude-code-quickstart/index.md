+++
title = "Claude Code QuickStart"
date = 2026-02-14T18:15:00+08:00
tags = ["claude-code"]
categories = ["workspace-setup"]
draft = true
image = "/images/icons/tortoise.png"
libraries = ["mathjax"]
description = "this is a description"
+++

## LLM Configuration {#llm-configuration}

{{< tabs "~/.claude/settings.json" "~/.config/claude-code-sugar/config.json" >}}

{{< tab >}}

```json
{
  "apiKey": "sk-xxx",
  "baseURL": "http://192.168.31.248:4000/v1/",
  "modelMapping": {
    "small_model": "qwen3-32b",
    "model": "qwen3-coder-plus",
    "opus_model": "qwen3-coder-plus"
  },
  "searchEndpoint": "http://192.168.31.248:4000/v1/",
  "searchApiKey": "sk-xxx"
}
```

{{< /tab >}}

{{< tab >}}

```json
{
  "env": {
    "DISABLE_PROMPT_CACHING": "0",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "ANTHROPIC_BASE_URL": "http://192.168.31.248:4000",
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "qwen3-coder-plus",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "qwen3-coder-plus",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen3-coder-plus"
  }
}
```

{{< /tab >}}

{{< /tabs >}}


## LLM Providers {#llm-providers}

|                       | iflow | deepseek |
|-----------------------|-------|----------|
| Openai Api baseUrl    |       |          |
| Anthropic Api baseUrl |       |          |


## Hooks {#hooks}

use hooks[^fn:1] to send notifications when task finished or notification arise. Merge code below to your `~/.claude/settings.json`

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "dunstify \"Done\" \"Claude Code Finished\" && paplay /usr/share/sounds/freedesktop/stereo/complete.oga"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "dunstify \"Help\" \"Claude Code Needs Help\" && paplay /usr/share/sounds/freedesktop/stereo/message.oga"
          }
        ]
      }
    ]
  }
}
```

[^fn:1]: use [claude code hooks](https://code.claude.com/docs/en/hooks) to trigger custom scripts
