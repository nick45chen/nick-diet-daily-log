# Nick 飲食日誌 — 專案指引

## 專案概述
GitHub Pages 一頁式飲食追蹤網站，用於與健身教練同步飲食控制狀況。

## 語言與地區
- 所有 UI 文字與 AI 建議使用**繁體中文**
- 飲食以**台灣地區**食物為主
- 時區：**Asia/Taipei (UTC+8)**

## 資料格式
- JSON 檔案：2-space indent, UTF-8
- 日期格式：`YYYY-MM-DD`
- 圖片路徑：相對路徑（相對於專案根目錄）

## 圖片處理
- 使用 macOS `sips` 處理圖片
- 食物照片：max 800px, JPEG quality 75
- InBody 照片：max 1200px, JPEG quality 80
- HEIC 轉 JPEG：`sips -s format jpeg -s formatOptions 75 input.HEIC --out output.jpg`

## 檔案結構
```
data/YYYY-MM-DD.json      — 每日飲食記錄
data/inbody/YYYY-MM-DD.json — InBody 測量數據
data/manifest.json         — 所有記錄索引
data/goals.json            — 營養目標
images/meals/              — 餐點照片
images/inbody/             — InBody 報告照片
```

## 部署
- 每次資料更新後需 `git push` 才會更新網頁
- GitHub Pages 從 `main` branch `/` root 部署
- 網址：https://nick45chen.github.io/nick-diet-daily-log/
