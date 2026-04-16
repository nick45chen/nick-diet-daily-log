# 自動化設定概觀

本專案使用 AI Coding Agent 作為飲食記錄的主要輸入介面。使用者透過自然語言或照片上傳，AI 自動完成營養估算、JSON 更新和 Git 部署。

## 可用平台

| 平台 | 適用場景 | 圖片處理 | 成本 |
|------|---------|---------|------|
| [Claude Code Agent](claude-code-agent.md) | 本機 macOS 開發 | ✅ `sips` 原生支援 | Claude Pro/Max 訂閱 |
| [Codex Agent](codex-agent.md) | 雲端 CI/CD | ❌ 無 `sips` | OpenAI API |
| [Claude Code Channel](claude-code-channel.md) | 常駐服務 / 團隊協作 | ✅ macOS host | Claude Max 訂閱 |

## 硬體需求

### 圖片處理限制

本專案使用 macOS 內建 `sips` 指令處理食物照片（HEIC → JPEG 轉換、縮放）。非 macOS 環境無法執行此步驟。

**解決方案：**
- **macOS 環境**：直接使用 `sips`（推薦）
- **Linux / Cloud VM**：需改用 ImageMagick (`convert`) 或 sharp (Node.js)
- **純文字模式**：跳過照片處理，僅記錄營養數據

### 最低需求

- 任何可執行 Node.js / Python 的環境
- Git 存取權限（push to main branch）
- 網路連線（API 呼叫）

## 工作流程

```
使用者輸入（文字/照片）
  ↓
AI Agent 辨識食物 & 估算營養
  ↓
更新 data/YYYY-MM-DD.json
  ↓
更新 data/manifest.json
  ↓
git add + commit + push
  ↓
GitHub Pages 自動部署
  ↓
網站即時更新
```

## 選擇建議

- **個人日常使用** → Claude Code Agent（本機）
- **多人協作 / 教練也能記錄** → Claude Code Channel
- **整合到 CI/CD pipeline** → Codex Agent
- **手機隨時記錄** → Claude Code Channel + Slack/Discord 整合
