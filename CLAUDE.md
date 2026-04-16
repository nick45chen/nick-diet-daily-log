# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述
GitHub Pages 一頁式飲食追蹤網站，用於與健身教練同步飲食控制狀況。

## 語言與地區
- 所有 UI 文字與 AI 建議使用**繁體中文**
- 飲食以**台灣地區**食物為主
- 時區：**Asia/Taipei (UTC+8)**

## 本地開發

No build step or package manager. Serve from repo root:

```bash
python3 -m http.server 8000
open http://localhost:8000
```

Validate changes by loading the site locally, checking the today/history/InBody/goals tabs, and confirming new JSON paths resolve to the correct images. Also verify `data/manifest.json` includes the updated date and `lastUpdated` timestamp.

## 架構

純 HTML/CSS/JS (ES Modules) 靜態網站，無 framework、bundler 或外部 JS 依賴。

**分層架構：**
- `index.html` — 極簡 shell（~24 行），只有 mount points 和 `<script src="js/app.js">`
- `js/app.js` — App Shell：初始化、tab 切換、manifest polling
- `js/data/` — Data Access Layer（Repository 模式）：所有資料存取集中於此，方便日後遷移至 server database
- `js/logic/` — 純業務邏輯（零 DOM 依賴）：dates、costs、nutrition
- `js/components/` — 可重用 UI 元件：`(props) => htmlString` 純函式
- `js/tabs/` — 各 tab 的 render 邏輯，調用 data repos 和 components
- `js/state.js` — 全域狀態物件和常數
- `js/api.js` — 底層 HTTP 工具（fetchJSON、fetchHTML）
- `js/utils.js` — Asset URL helpers 和 DOM helpers

**Partials：**
- `partials/header.html`、`tab-nav.html`、`lightbox.html`、`footer.html` — App Shell 的 HTML 片段
- `partials/daily.html`、`history.html`、`inbody.html`、`goals.html` — 各 tab 的 HTML 骨架

**State & data flow:**
- `js/state.js` 的 `state` 物件持有 `goals`、`manifest`、`dayCache`、`inbodyCache`、`currentDate`、`latestBmr`
- 所有資料存取透過 `js/data/*.js` 的 repository 函式（getDayData、getInBodyData、getGoals、getManifest）
- `refreshManifest()` 每 60 秒 polling；若 `lastUpdated` 變更則清空 cache 並重新 render

## 資料格式

- JSON 檔案：2-space indent, UTF-8
- 日期格式：`YYYY-MM-DD`
- 圖片路徑：相對路徑（相對於專案根目錄）

### 每日飲食 JSON 結構

```
data/meals/YYYY/MM/YYYY-MM-DD.json
```

Top-level fields: `date`, `weight` (nullable), `meals[]`, `dailyTotal`, `dailyCostTotal` (optional), `advice`.

`advice` is a plain string with `\n`-separated lines of nutrition feedback — not an array.

Each meal: `type` (早餐/午餐/晚餐/點心/消夜), `time`, `displayName`, `cost` (optional, `{ amount, currency, note }`), `items[]`, `subtotal`.

Each item: `name`, `calories`, `protein`, `fat`, `carbs`, `note` (data source), `image`.

Cost is recorded at the **meal level** (`meal.cost`), not per item. `dailyCostTotal` is the sum of all meal `cost.amount` values.

### 其他資料檔案

```
data/manifest.json               — { days: [...], inbody: [...], lastUpdated }
data/goals.json                  — { dailyCalories, protein, fat, carbs, note }
data/inbody/YYYY/MM/YYYY-MM-DD.json — InBody measurement fields
```

## 圖片處理

使用 macOS `sips` 處理圖片（無需額外安裝）：

```bash
# HEIC → JPEG
sips -s format jpeg -s formatOptions 75 input.HEIC --out images/meals/YYYY-MM-DD-breakfast-1.jpg

# 縮放食物照片（max 800px）
sips -Z 800 images/meals/YYYY-MM-DD-breakfast-1.jpg

# InBody 照片（max 1200px, quality 80）
sips -s format jpeg -s formatOptions 80 input.HEIC --out images/inbody/YYYY-MM-DD.jpg
sips -Z 1200 images/inbody/YYYY-MM-DD.jpg
```

圖片命名：`images/meals/YYYY-MM-DD-{breakfast|lunch|dinner|snack|latenight}-{n}.jpg`

## Skills

Skills 定義在 `skills/` 目錄：
- `skills/diet-record.md` — 飲食記錄流程（照片處理→營養估算→JSON 更新→AI 建議）
- `skills/inbody-record.md` — InBody 身體數據記錄流程
- `skills/nutrition-table.md` — 台灣常見食物營養參考表

飲食記錄觸發條件：「我吃了」、「記錄飲食」、「今天吃」、「飲食紀錄」、「記錄今天」，或上傳食物照片。
InBody 記錄觸發條件：「記錄 InBody」、「InBody」、「身體數據」，或上傳 InBody 報告照片。

## Commit 格式

Follow the existing short conventional-style subjects:

```
changed: update 2026-04-14 meal log
feat: add InBody trend chart
```

After every data update, remind the user to `git push` to deploy to GitHub Pages.

## 部署

- GitHub Pages 從 `main` branch `/` root 部署
- 網址：https://nick45chen.github.io/nick-diet-daily-log/
