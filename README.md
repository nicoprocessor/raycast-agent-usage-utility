<p align="center">
  <img src="./assets/icon.png" alt="Raycast Agent Usage Utility Icon" width="128" />
</p>

# Raycast Agent Usage Utility

[![Build](https://img.shields.io/github/actions/workflow/status/nicoprocessor/raycast-agent-usage-utility/ci.yml?branch=main&label=build)](https://github.com/nicoprocessor/raycast-agent-usage-utility/actions/workflows/ci.yml)
[![Code Quality](https://img.shields.io/badge/quality-eslint%20%2B%20tsc-4c1.svg)](#development)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Raycast Extension](https://img.shields.io/badge/Raycast-Extension-ff6363.svg)](https://www.raycast.com)

Raycast extension to track remaining usage quota across AI providers from their cloud APIs.

## Current Providers
- Anthropic (Claude Code)
- OpenAI (GPT Codex)
- GitHub Copilot

## Commands
1. **Add Provider**: add a provider config and store credentials in macOS Keychain.
   - Manual token/key setup
   - Provider-specific guide available directly in command
   - Dynamic defaults/placeholders when switching provider
2. **Usage Status**: fetch provider quota endpoint and show:
   - remaining percentage
   - remaining/used/limit values
   - period type (daily/weekly/5h/monthly when exposed)
   - reset timestamp when exposed

## Security
- Sensitive tokens are stored only in macOS Keychain via `/usr/bin/security`.
- Provider metadata only (non-secrets) is saved in Raycast LocalStorage.
- No clear text passwords/tokens are persisted in extension storage.

## Development
```bash
npm install
npm run typecheck
npm run lint
```

## Notes
Provider quota APIs are not uniform. The extension exposes configurable JSON field mapping (`limitPath`, `usedPath`, `periodPath`, `resetAtPath`) per provider.
