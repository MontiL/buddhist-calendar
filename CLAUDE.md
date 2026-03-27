# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 指令

```bash
pnpm dev        # 啟動開發伺服器（Next.js 16，App Router）
pnpm build      # 正式環境建置
pnpm check      # 僅做 TypeScript 型別檢查（tsc --noEmit）—— 每次提交前必跑
```

本專案無測試套件，`pnpm check` 是唯一的自動品質關卡。

## 架構

這是一個為台灣設計的**佛曆陰陽合曆**，使用 Next.js 16 App Router 建置。功能包含佛教節日、齋日、布薩日、每日日中時刻顯示，以及 iCal 訂閱連結。

### 事件生成流程

所有行事曆事件皆在**客戶端**根據 FullCalendar 回報的可見日期範圍即時計算：

1. `src/lib/lunar-utils.ts` — 核心佛曆邏輯。透過 `lunar-typescript` 將西曆轉換為農曆，再對應到節日、齋日、布薩日。所有事件名稱使用繁體中文。
2. `src/lib/solar-noon.ts` — 使用 `suncalc` 搭配中央氣象署（CWA）校正偏移值計算各城市日中時刻，支援台灣 11 個城市，預設台北。
3. `src/lib/ical-utils.ts` — 依 RFC 5545 規格序列化 iCal 訂閱內容。
4. `src/lib/taiwan-time.ts` — 所有日期計算使用 Asia/Taipei 時區。

`BuddhistCalendar`（`src/components/calendar/buddhist-calendar.tsx`）統籌所有邏輯：管理切換狀態（節日 / 齋日 / 布薩日 / 日中），以當前可見範圍呼叫各生成器，並將篩選後的事件傳入 FullCalendar。

### iCal API

`src/app/api/ical/[category]/route.ts` 提供四個行事曆訂閱端點：`festivals`、`fasting`、`posadha`、`solar-noon`。日中訂閱支援 `?city=` 查詢參數。回應帶有 24 小時 `Cache-Control` 及 `Cache-Tag` 標頭（用於 Vercel CDN 清除快取）。

### 城市 / 定位

`src/hooks/use-city.ts` 管理所選城市。掛載時非阻塞式請求 GPS，自動對應最近城市，並持久化至 `localStorage`。城市選擇同時影響日中時刻顯示與 iCal 訂閱網址。

### 樣式

Tailwind v4（PostCSS 外掛）搭配 shadcn/ui `base-nova` 樣式。色彩主題基於 CSS 變數；`ColorThemeToggle` 可在執行期切換配色。明暗模式透過 `next-themes` 持久化。

### 主要套件

| 套件 | 用途 |
|---|---|
| `@fullcalendar/*` | 行事曆 UI（daygrid、list、interaction 外掛） |
| `lunar-typescript` | 西曆 ↔ 農曆轉換 |
| `suncalc` | 天文日中時刻計算 |
| `date-fns` | 日期運算 |
| `next-themes` | 明暗模式持久化 |
