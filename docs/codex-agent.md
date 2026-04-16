# Codex Agent 設定指南

使用 OpenAI Codex Agent 作為替代方案，適用於雲端 CI/CD 環境。

## 限制

Codex Agent 在雲端沙箱中執行，有以下限制：
- **無 `sips` 指令**：無法執行 macOS 原生圖片處理
- **無本地檔案存取**：無法直接讀取使用者裝置上的照片
- **無持久狀態**：每次執行都是全新環境

## 適用場景

- 編輯 JSON 資料檔案（手動輸入營養數據）
- 更新 `data/manifest.json`
- 生成 AI 營養建議（比較 dailyTotal vs goals）
- 修改前端程式碼

## 設定

### AGENTS.md

Codex Agent 使用 `AGENTS.md` 作為主要指令檔（已包含在專案中）。

### 工作流程

1. 在 Codex Agent 環境中開啟專案
2. 以文字描述飲食內容（無法上傳照片）
3. Agent 會建立/更新 `data/YYYY-MM-DD.json`
4. 手動 commit 和 push

### 範例 Prompt

```
請幫我記錄今天的午餐：
- 雞腿便當 750 kcal, P: 35g, F: 25g, C: 90g，花了 100 元
- 無糖綠茶 0 kcal

更新 data/2026-04-16.json 和 manifest.json。
```

## 與 Claude Code 的差異

| 功能 | Claude Code | Codex Agent |
|------|------------|-------------|
| 照片辨識 | ✅ | ❌ |
| 圖片處理 (sips) | ✅ | ❌ |
| 營養估算 | ✅ 自動 | ⚠️ 需手動提供數據 |
| JSON 更新 | ✅ 自動 | ✅ 自動 |
| Git 操作 | ✅ | ✅ |
| Skill 定義 | CLAUDE.md + skills/ | AGENTS.md |
