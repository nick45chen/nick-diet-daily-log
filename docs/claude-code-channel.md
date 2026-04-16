# Claude Code Channel 設定指南

使用 Claude Code Channel 建立持續運行的飲食記錄服務，支援多人協作和遠端觸發。

## 什麼是 Claude Code Channel

Claude Code Channel 是 Claude Code 的持續運行模式，可透過 Slack、Discord 或其他訊息平台觸發。適合需要隨時記錄飲食的場景。

## 硬體選項

| 平台 | 優點 | 缺點 |
|------|------|------|
| **Mac Mini（推薦）** | 支援 `sips`、低功耗常駐 | 需購買硬體 |
| **Cloud macOS VM** | 支援 `sips`、無需本地硬體 | 成本較高（AWS EC2 Mac） |
| **Linux Cloud VM** | 便宜、易於部署 | 無 `sips`，需替代方案 |

## 設定步驟

### 1. 準備主機

```bash
# Mac Mini 或 macOS 環境
npm install -g @anthropic-ai/claude-code

# Clone 專案
git clone https://github.com/nick45chen/nick-diet-daily-log.git
cd nick-diet-daily-log
```

### 2. 設定 Claude Code Channel

參考 [Claude Code 官方文件](https://docs.anthropic.com/en/docs/claude-code) 設定 Channel 模式。

### 3. 連接訊息平台

設定 Slack 或 Discord 整合，讓使用者可以直接在聊天中觸發飲食記錄。

## 使用案例

### 個人隨時記錄

透過 Slack 或 Discord 傳送訊息：

```
@claude-code 我吃了雞胸肉便當，花了 90 元
```

### 教練查看進度

教練也可以透過同一 Channel 查詢學員的飲食狀況：

```
@claude-code 今天 Nick 吃了什麼？
```

### 定時提醒

搭配 Claude Code 的排程功能，設定每日提醒：

```
每天 21:00 提醒記錄當日飲食
每週一提醒記錄 InBody
```

## 注意事項

- 確保主機 24 小時運行（或在需要時啟動）
- 設定適當的 API 用量限制，避免超額
- 照片需透過訊息平台上傳（支援 JPG、PNG、HEIC）
- Git push 權限需在主機上預先設定（SSH key 或 token）
