# Claude Code Agent 設定指南

在本機 macOS 使用 Claude Code CLI 作為飲食記錄助手。

## 前置條件

- macOS（需要 `sips` 指令處理圖片）
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) 已安裝
- Git 已設定（可 push 到 GitHub）
- Claude Pro 或 Max 訂閱

## 安裝

```bash
# 安裝 Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Clone 專案
git clone https://github.com/nick45chen/nick-diet-daily-log.git
cd nick-diet-daily-log

# 啟動 Claude Code
claude
```

## 專案配置檔案

Claude Code 會自動讀取以下配置：

| 檔案 | 用途 |
|------|------|
| `CLAUDE.md` | 專案規則、架構說明、資料格式 |
| `skills/diet-record.md` | 飲食記錄流程定義 |
| `skills/inbody-record.md` | InBody 記錄流程定義 |
| `skills/nutrition-table.md` | 營養素參考表 |
| `.claude/settings.local.json` | 權限設定（sips、git 指令白名單） |

## 使用範例

### 記錄飲食（文字）

```
> 我吃了 7-11 溏心蛋三明治和無糖豆漿，花了 75 元
```

### 記錄飲食（照片）

```
> 記錄午餐 ~/Desktop/lunch.jpg，花了 120 元
```

### 記錄 InBody

```
> 記錄 InBody ~/Desktop/inbody-report.heic
```

### 部署

每次記錄完成後，Claude Code 會提醒你執行：

```bash
git push
```

## 權限設定

`.claude/settings.local.json` 已預設允許以下操作：
- `sips` 圖片轉換與縮放
- `git add`、`git commit`、`git push`
- 讀取/寫入 `data/` 和 `images/` 目錄

如需調整權限，編輯 `.claude/settings.local.json`。

## 自動化排程

可搭配 Claude Code 的 `/schedule` 功能設定定期提醒：

```
> /schedule 每天 21:00 提醒我記錄今天的飲食
```

## 疑難排解

### 圖片處理失敗

確認 `sips` 可用：
```bash
which sips
# 應顯示 /usr/bin/sips
```

### API 回應緩慢

確認網路連線正常，Claude Code 使用 Anthropic API。

### JSON 格式錯誤

手動檢查 `data/` 目錄下的 JSON 檔案格式是否正確（2-space indent, UTF-8）。
