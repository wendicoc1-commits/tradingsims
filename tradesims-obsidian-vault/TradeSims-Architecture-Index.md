---
title: "TradeSims Pro Architecture Map"
tags:
  - index
  - architecture
  - tradesims
---

# TradeSims Pro Architecture Knowledge Graph

Selamat datang di **Obsidian Vault** arsitektur sistem TradeSims Pro. 
Buka **Graph View** (`Ctrl/Cmd + G`) di Obsidian untuk melihat graf interaktif dengan skinning **KayVeeG Holographic HUD Grid**!

## Komponen Utama Sistem
- [[header|TradeSimHeader.tsx]] — *Presentation & Header Layer*
- [[portfolio_desk|InstitutionalPortfolioDesk.tsx]] — *Multi-Asset Risk & NAV Desk*
- [[right_dock|FinceptRightDock.tsx]] — *Order Execution Dock*
- [[topup_modal|TopUpModal.tsx]] — *QRIS Idempotent Deposit Flow*
- [[portfolio_store|usePortfolioStore.ts]] — *Central Virtual Cash State*
- [[auth_store|useAuthStore.ts]] — *Dual-Direction Sync & Session*
- [[ai_agent_store|aiAgentStore.ts]] — *Autonomous AI Pilot Dispatcher*
- [[public_api_registry|publicApiRegistry.ts]] — *1.400+ External Data Feeds Bridge*
- [[supabase_db|Supabase PostgreSQL]] — *ACID Transaction Core*
- [[telegram_bot|botNotifier.ts]] — *Real-Time Admin Telegram Webhook*
