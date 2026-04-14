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

`index.html` is the entire app — all CSS, HTML skeleton, and JavaScript live in this single file (~1500 lines). There is no framework, bundler, or external JS dependency.

**Tab partials:** The four tab contents (today, history, inbody, goals) are loaded at startup via `fetch()` from `partials/*.html` and injected into the DOM. Edit the partial file for structural/markup changes; edit `index.html` for render logic or styling.

**State & data flow:**
- A global `state` object holds `goals`, `manifest`, `dayCache`, `inbodyCache`, and `currentDate`.
- `fetchJSON(url)` handles cache-busting with a timestamp suffix and falls back to the `data/` prefix variant.
- `refreshManifest()` polls every `MANIFEST_POLL_MS` ms; if `lastUpdated` changed it clears caches and re-renders.

**Render functions by tab:**
- `loadDay(dateStr)` → today tab
- `renderHistory()` → history tab
- `renderInBody()` → InBody tab (SVG trend chart for weight/body fat)
- `renderGoals()` → goals tab

## 資料格式

- JSON 檔案：2-space indent, UTF-8
- 日期格式：`YYYY-MM-DD`
- 圖片路徑：相對路徑（相對於專案根目錄）

### 每日飲食 JSON 結構

```
data/YYYY-MM-DD.json
```

Top-level fields: `date`, `weight`, `meals[]`, `dailyTotal`, `dailyCostTotal`, `advice`.

Each meal: `type` (早餐/午餐/晚餐/點心/消夜), `time`, `displayName`, `cost` (amount/currency/note), `items[]`, `subtotal`.

Each item: `name`, `calories`, `protein`, `fat`, `carbs`, `note` (data source), `image`.

Cost is recorded at the **meal level** (`meal.cost`), not per item. `dailyCostTotal` is the sum of all meal `cost.amount` values.

### 其他資料檔案

```
data/manifest.json         — { days: [...], inbody: [...], lastUpdated }
data/goals.json            — { dailyCalories, protein, fat, carbs, note }
data/inbody/YYYY-MM-DD.json — InBody measurement fields
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

## 飲食記錄技能

Use the `diet-tracker` skill (defined in `SKILL.md`) whenever logging meals or InBody data. The skill handles: meal-time inference, photo processing, nutrition estimation, JSON update, manifest update, and AI nutrition advice generation.

Trigger phrases: 「我吃了」、「記錄飲食」、「今天吃」、「飲食紀錄」、「記錄 InBody」, or any food photo upload.

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
