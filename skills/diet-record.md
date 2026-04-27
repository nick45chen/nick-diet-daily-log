---
name: diet-record
description: 飲食營養記錄技能。當使用者輸入文字或上傳食物／營養成份表圖片時觸發；自動沿用歷史包裝標示資料、寫入 JSON、commit & push 並回報總結。
---

# 飲食記錄 Skill

## 觸發條件

當使用者輸入以下任一情境時觸發：
- 文字關鍵字：「我吃了」、「記錄飲食」、「今天吃」、「飲食紀錄」、「記錄今天」、「分析營養」
- 在目前對話回合（GUI）上傳食物照片或包裝營養成份表照片
- 提供本機照片路徑（`.jpg`, `.jpeg`, `.png`, `.heic`）
- 純文字描述食物品項與份量（無圖片）

## 流程

### Step 1：確認日期與餐別

- 使用 Asia/Taipei 時區取得今日日期（YYYY-MM-DD 格式）
- 如使用者未指定日期，預設為今天
- 如使用者未指定餐別，根據時間自動判斷：
  - 05:00-10:00 → 早餐
  - 10:00-14:00 → 午餐
  - 14:00-17:00 → 點心
  - 17:00-21:00 → 晚餐
  - 21:00-05:00 → 消夜

### Step 2：分類圖片（食物 vs 營養成份表）

不論是 GUI 對話附件或本機照片路徑，先把每張圖片分類：

- **食物照片**：盤子、餐盒、外觀辨識得出菜色 → 需保存到 `images/meals/`
- **營養成份表照片**：包裝背面的營養標示、超商標籤、成份表 → **只用來讀取數值，不存檔**
- **收據／價格照**：用來抓 `cost`，亦不存檔

圖片來源處理：

1. **GUI 對話附件**：直接從本回合對話中讀取圖片內容辨識，不要再要求使用者提供路徑，也不要 `view_image` 重新讀取同一張附件。
2. **本機路徑**（`.jpg`, `.jpeg`, `.png`, `.heic`）：用 Read tool 讀取以辨識內容。

**只對「食物照片」執行存檔**：

- HEIC 轉 JPEG + 縮放：
  ```bash
  sips -s format jpeg -s formatOptions 75 "<input_path>" --out "images/meals/YYYY-MM-DD-<餐別>-<n>.jpg"
  sips -Z 800 "images/meals/YYYY-MM-DD-<餐別>-<n>.jpg"
  ```
- JPG/PNG 直接縮放：
  ```bash
  sips -Z 800 "<input_path>" --out "images/meals/YYYY-MM-DD-<餐別>-<n>.jpg"
  ```
- GUI 附件而無本機路徑：可完成辨識，但**不要**假裝可以把附件寫成檔案；若使用者要求保留食物照片，請他補一份原始檔案路徑。

圖片命名規則：`images/meals/YYYY-MM-DD-breakfast-1.jpg`
- 餐別英文：breakfast / lunch / dinner / snack / latenight

**圖片寫入 JSON 規則**：

- 同時有食物照 + 營養成份表照 → item 的 `image` 指向最具代表性的那張食物照；營養成份表照不寫入 JSON、不存到 `images/meals/`。
- 只有食物照 → 寫入該檔路徑。
- 只有營養成份表照 / 純文字輸入 / 只有 GUI 附件無路徑 → `image: ""`（保留欄位但不指向檔案）。

### Step 3：估算營養素（優先使用校正過資料）

依下列順序決定每項食物的 calories / protein / fat / carbs：

1. **歷史 JSON 校正資料**：在 `data/meals/**/*.json` 搜尋同名或高度相似品項且 `note` 含「包裝標示」的最新一筆，沿用其數值。
   - 建議搜尋：`grep -rln "<品項關鍵字>" data/meals/ | sort | tail -n 5`，再讀取最新檔案核對。
   - note 寫「包裝標示（沿用 YYYY-MM-DD <餐別>）」。
2. **本回合營養成份表照片**：若使用者本回合附上包裝標示照片，且數值與歷史不同（配方更新、份量改變、規格不同）→ 改用照片數值。
   - note 寫「包裝標示（本回合附件）」。
3. **歷史與本回合都有時取較新者**：原則「本回合 > 歷史」；使用者明確說「以包裝為準」也以本回合為準。
4. **都沒有**：參考 `skills/nutrition-table.md` 估算，note 寫「估算」或「依照片估算」（自助餐／外食依份量合理估算）。

成本一律記在餐層 `cost`，不要硬拆到各個 item。

### Step 4：更新每日 JSON 檔案

讀取或建立 `data/meals/YYYY/MM/YYYY-MM-DD.json`：

```json
{
  "date": "YYYY-MM-DD",
  "weight": null,
  "meals": [
    {
      "type": "早餐",
      "time": "08:30",
      "displayName": "整餐顯示名稱（選填）",
      "cost": {
        "amount": 75,
        "currency": "TWD",
        "note": "組合價"
      },
      "items": [
        {
          "name": "食物名稱",
          "calories": 320,
          "protein": 15,
          "fat": 12,
          "carbs": 38,
          "note": "包裝標示",
          "image": "images/meals/YYYY-MM-DD-breakfast-1.jpg"
        }
      ],
      "subtotal": {
        "calories": 320,
        "protein": 15,
        "fat": 12,
        "carbs": 38
      }
    }
  ],
  "dailyTotal": {
    "calories": 0,
    "protein": 0,
    "fat": 0,
    "carbs": 0
  },
  "dailyCostTotal": {
    "amount": 75,
    "currency": "TWD"
  },
  "advice": ""
}
```

**規則：**
- 如同一餐別已存在，將新 items 加入該餐
- 如該餐有整餐名稱，寫入 `displayName`
- 如該餐有價格、組合價或整餐價格，寫入 `cost.amount` 與 `cost.note`
- 重新計算該餐 subtotal
- 重新計算 dailyTotal（所有餐別加總）
- 重新計算 dailyCostTotal（所有 `meal.cost.amount` 加總；允許小數，例如分攤價格）

### Step 5：生成 AI 營養師建議

讀取 `data/goals.json` 取得每日目標，比較 dailyTotal 與目標：

建議內容要求（繁體中文，2-4 條）：
1. 各營養素達標狀況（✅ 達標 / ⚠️ 不足 / ❌ 超標）
2. 具體的飲食調整建議（推薦食物名稱）
3. 明日飲食方向

範例：
```
蛋白質攝取 110g / 目標 120g ⚠️ 尚差 10g，建議補充一份雞胸肉或一杯高蛋白奶昔。
熱量 1850 / 2100 kcal（88%），略低於目標，有助於減脂但注意不要長期低於基代。
脂肪控制良好（42g / ≤50g）✅，繼續保持。
明日建議早餐增加蛋白質來源（如水煮蛋 x2），並搭配地瓜補充優質碳水。
```

將建議寫入 JSON 的 `advice` 欄位。

### Step 6：更新 manifest.json

```javascript
// 讀取 data/manifest.json
// 如 days 陣列中沒有今日日期，加入（格式 YYYY-MM-DD）
// 更新 lastUpdated 為當前 ISO 時間字串
// 注意：days 僅存日期字串，實際路徑由 daily-repo.js 的 mealPath() 推導
```

### Step 7：自動 commit & push

完成 JSON 與 manifest 後，立即執行：

```bash
git status                    # 先確認 working tree 只有本次更新檔案
git add data/meals/YYYY/MM/YYYY-MM-DD.json data/manifest.json images/meals/YYYY-MM-DD-*.jpg
git commit -m "changed: update YYYY-MM-DD <餐別> meal log"
git push
git rev-parse --short HEAD    # 取 commit short SHA 給 Step 8 回報
```

注意：

- commit subject 沿用既有格式（`changed:` / `feat:` / `fix:`）。新增當日第一餐用 `add`、後續更新用 `update`。
- 若 `git status` 顯示有與本次紀錄無關的變動（例如未追蹤的雜檔、其他編輯中的檔案）→ **停止流程**並把狀況回報給使用者，不要逕行 add。
- push 失敗（網路、權限、衝突等）→ 立即停止後續流程並把錯誤完整回報；**禁止**自行加 `--force` 或 `--no-verify`。

### Step 8：回報結果

以格式化方式回報：
```
✅ 已記錄 YYYY-MM-DD 早餐

🍽️ 溏心蛋紐奧良烤雞三明治 — 320 kcal
🥛 福樂超能蛋白（草莓）— 150 kcal

📊 今日累計：1850 kcal | P: 110g | F: 42g | C: 265g
💸 今日餐費：NT$315
🎯 目標：2100 kcal | P: 120g | F: ≤50g | C: 293g

💡 蛋白質尚差 10g，建議晚餐補充雞胸肉

✅ commit + push 完成（commit: <short SHA>）
🌐 GitHub Pages 約 1 分鐘內更新
```

---

## 注意事項

- 所有日期使用 Asia/Taipei 時區
- JSON 檔案使用 2-space indent, UTF-8 編碼
- 圖片路徑使用相對路徑（相對於專案根目錄）
- 營養素數值四捨五入到整數
- commit + push 由本 skill 自動完成，不再需要提醒使用者手動 push；僅當自動 push 失敗時才回報並請使用者處理
