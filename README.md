# Nick 飲食日誌

與教練同步的每日飲食追蹤系統。

## 專案簡介

GitHub Pages 靜態網站，用於記錄每日飲食、追蹤營養素攝取，並與健身教練 Charlie 同步飲食控制進度。透過 Claude Code AI 助手自動辨識食物照片、估算營養素、生成飲食建議。

**線上網址：** https://nick45chen.github.io/nick-diet-daily-log/

## 功能

- 每日飲食記錄（照片辨識 + 營養素估算）
- 四大營養素達標追蹤（熱量 / 蛋白質 / 脂肪 / 碳水）
- InBody 身體數據追蹤與趨勢圖
- 每月餐費統計與日均花費
- AI 營養師建議（基於每日目標自動生成）

## 技術架構

- **前端**：純 HTML / CSS / JavaScript（ES Modules），無框架、無打包工具
- **設計系統**：Material 3 風格，Glassmorphism 效果
- **部署**：GitHub Pages 靜態部署（`main` branch 根目錄）
- **AI 介面**：Claude Code 做為資料輸入與營養分析工具

### 目錄結構

```
├── index.html              # App Shell（mount points + script 載入）
├── css/styles.css          # 全域樣式（Material 3 設計 tokens）
├── js/
│   ├── app.js              # App 初始化、tab 切換、manifest polling
│   ├── state.js            # 全域狀態物件與常數
│   ├── api.js              # HTTP 工具（fetchJSON、fetchHTML）
│   ├── utils.js            # Asset URL helpers、DOM helpers
│   ├── data/               # Data Access Layer（Repository 模式）
│   │   ├── daily-repo.js   #   每日飲食資料存取
│   │   ├── inbody-repo.js  #   InBody 資料存取
│   │   ├── goals-repo.js   #   目標資料存取
│   │   └── manifest-repo.js#   Manifest 資料存取
│   ├── logic/              # 純業務邏輯（零 DOM 依賴）
│   │   ├── nutrition.js    #   營養素狀態判斷
│   │   ├── dates.js        #   日期與時區處理
│   │   └── costs.js        #   費用計算
│   ├── components/         # 可重用 UI 元件（props → HTML string）
│   │   ├── meal-card.js    #   餐點卡片
│   │   ├── date-badge.js   #   日期標章
│   │   ├── cost-pill.js    #   費用膠囊
│   │   ├── metric-card.js  #   指標卡片
│   │   └── empty-state.js  #   空狀態提示
│   └── tabs/               # 各 Tab 的 render 邏輯
│       ├── daily.js        #   每日飲食
│       ├── history.js      #   歷史紀錄
│       ├── inbody.js       #   InBody 數據
│       └── goals.js        #   營養目標
├── partials/               # HTML 片段（由 JS 動態載入）
├── skills/                 # Claude Code Skill 定義
├── docs/                   # 自動化設定文件
├── data/                   # JSON 資料檔案
└── images/                 # 食物照片、InBody 報告、頭像
```

## 本地開發

無需安裝任何依賴，直接啟動靜態伺服器：

```bash
python3 -m http.server 8000
open http://localhost:8000
```

驗證方式：
1. 逐一檢查四個 tab（每日 / 歷史 / InBody / 目標）
2. 確認日期切換、圖片載入、lightbox、費用顯示正常
3. 確認 console 無 JS 錯誤

## 資料格式

所有 JSON 檔案使用 2-space indent、UTF-8 編碼，日期格式為 `YYYY-MM-DD`。

| 檔案 | 說明 |
|------|------|
| `data/YYYY-MM-DD.json` | 每日飲食紀錄（meals、dailyTotal、advice） |
| `data/inbody/YYYY-MM-DD.json` | InBody 身體數據 |
| `data/goals.json` | 每日營養目標（熱量、蛋白質、脂肪、碳水） |
| `data/manifest.json` | 資料索引（已記錄日期、最後更新時間） |

## 使用方式

透過 Claude Code CLI 輸入食物描述或照片路徑：

```
# 記錄飲食
> 我吃了 7-11 三明治和豆漿，花了 75 元

# 上傳食物照片
> 記錄午餐 /path/to/photo.jpg

# 記錄 InBody
> 記錄 InBody /path/to/inbody-report.jpg
```

詳細 Skill 流程定義：
- `skills/diet-record.md` — 飲食記錄
- `skills/inbody-record.md` — InBody 記錄

## 部署

GitHub Pages 從 `main` branch 根目錄自動部署。記錄完成後執行 `git push` 即可更新線上版本。

## 自動化設定

參考 `docs/` 目錄了解如何在不同平台設定自動化流程：
- [自動化概觀](docs/automation-setup.md)
- [Claude Code Agent 設定](docs/claude-code-agent.md)
- [Codex Agent 設定](docs/codex-agent.md)
- [Claude Code Channel 設定](docs/claude-code-channel.md)
