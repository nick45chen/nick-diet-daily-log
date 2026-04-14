---
name: diet-tracker
description: 飲食營養追蹤技能。當使用者輸入「我吃了」、「記錄飲食」、「分析營養」、「今天吃」、「飲食紀錄」、「記錄今天」，或上傳食物照片、InBody 照片時自動觸發。
---

# 飲食營養追蹤 Skill

## 觸發條件

當使用者輸入以下關鍵字或動作時觸發：
- 「我吃了」、「記錄飲食」、「今天吃」、「飲食紀錄」、「記錄今天」
- 「記錄 InBody」、「InBody」、「身體數據」
- 提供食物照片路徑（`.jpg`, `.jpeg`, `.png`, `.heic`）
- 提供 InBody 報告照片

## 飲食記錄流程

### Step 1：確認日期與餐別

- 使用 Asia/Taipei 時區取得今日日期（YYYY-MM-DD 格式）
- 如使用者未指定日期，預設為今天
- 如使用者未指定餐別，根據時間自動判斷：
  - 05:00-10:00 → 早餐
  - 10:00-14:00 → 午餐
  - 14:00-17:00 → 點心
  - 17:00-21:00 → 晚餐
  - 21:00-05:00 → 消夜

### Step 2：處理食物照片

如使用者提供照片路徑：

1. **讀取並辨識照片**：使用 Read tool 讀取圖片，辨識食物品項
2. **轉換格式（如為 HEIC）**：
   ```bash
   sips -s format jpeg -s formatOptions 75 "<input_path>" --out "images/meals/YYYY-MM-DD-<餐別>-<n>.jpg"
   sips -Z 800 "images/meals/YYYY-MM-DD-<餐別>-<n>.jpg"
   ```
3. **如為 JPG/PNG**：
   ```bash
   sips -Z 800 "<input_path>" --out "images/meals/YYYY-MM-DD-<餐別>-<n>.jpg"
   ```

圖片命名規則：`images/meals/YYYY-MM-DD-breakfast-1.jpg`
- 餐別英文：breakfast / lunch / dinner / snack / latenight

### Step 3：估算營養素

根據辨識的食物，估算每項食物的營養素：

**台灣常見食物營養參考（每份）：**

| 食物 | 熱量 | 蛋白質 | 脂肪 | 碳水 |
|------|------|--------|------|------|
| 白飯 1碗 (200g) | 280 | 5 | 0.5 | 62 |
| 雞胸肉 100g | 110 | 23 | 1.3 | 0 |
| 水煮蛋 1顆 | 75 | 7 | 5 | 0.5 |
| 7-11 御飯糰 | 220 | 6 | 3 | 42 |
| 7-11 三明治 (雞肉) | 320 | 15 | 12 | 38 |
| 超商沙拉 | 120 | 8 | 4 | 14 |
| 便當 (雞腿) | 750 | 35 | 25 | 90 |
| 便當 (排骨) | 800 | 30 | 30 | 95 |
| 滷雞腿 1支 | 250 | 28 | 14 | 2 |
| 燙青菜 1份 | 30 | 2 | 0.5 | 5 |
| 豆漿 無糖 300ml | 90 | 9 | 4 | 3 |
| 牛奶 鮮乳 240ml | 150 | 8 | 8 | 12 |
| 高蛋白牛乳 | 150 | 20 | 4 | 10 |
| 乳清蛋白 1份 | 120 | 24 | 1.5 | 3 |
| 地瓜 中型 1條 | 130 | 1.5 | 0.2 | 31 |
| 香蕉 1根 | 90 | 1 | 0.3 | 23 |
| 蘋果 1顆 | 80 | 0.4 | 0.2 | 21 |
| 火鍋 (豬肉) | 700 | 40 | 25 | 70 |
| 火鍋 (羊肉) | 750 | 43 | 27 | 70 |
| 拉麵 1碗 | 550 | 20 | 15 | 75 |
| Subway 6吋 (雞肉) | 350 | 25 | 5 | 48 |
| 冰美式 中杯 | 5 | 0 | 0 | 1 |
| 拿鐵 中杯 (全脂) | 180 | 9 | 9 | 14 |

- 優先使用包裝標示的營養資訊
- 如為自助餐或外食，根據份量合理估算
- 在 note 欄位標明資料來源（「包裝標示」/「估算」/「依照片估算」）
- 如使用者有提供價格、組合價或整餐價格，成本一律記在餐層 `cost`，不要硬拆到各個 item

### Step 4：更新每日 JSON 檔案

讀取或建立 `data/YYYY-MM-DD.json`：

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
// 如 days 陣列中沒有今日日期，加入
// 更新 lastUpdated 為當前 ISO 時間字串
```

### Step 7：回報結果

以格式化方式回報：
```
✅ 已記錄 YYYY-MM-DD 早餐

🍽️ 溏心蛋紐奧良烤雞三明治 — 320 kcal
🥛 福樂超能蛋白（草莓）— 150 kcal

📊 今日累計：1850 kcal | P: 110g | F: 42g | C: 265g
💸 今日餐費：NT$315
🎯 目標：2100 kcal | P: 120g | F: ≤50g | C: 293g

💡 蛋白質尚差 10g，建議晚餐補充雞胸肉
```

---

## InBody 記錄流程

### 觸發條件
使用者說「記錄 InBody」或提供 InBody 報告照片

### 流程

1. **讀取 InBody 照片**：使用 Read tool 辨識報告內容
2. **壓縮照片**：
   ```bash
   sips -s format jpeg -s formatOptions 80 "<input_path>" --out "images/inbody/YYYY-MM-DD.jpg"
   sips -Z 1200 "images/inbody/YYYY-MM-DD.jpg"
   ```
3. **擷取數據**，建立 `data/inbody/YYYY-MM-DD.json`：
   ```json
   {
     "date": "YYYY-MM-DD",
     "image": "images/inbody/YYYY-MM-DD.jpg",
     "weight": 74.5,
     "muscleMass": 32.1,
     "bodyFat": 16.2,
     "bodyFatPercent": 21.8,
     "bmi": 24.1,
     "basalMetabolicRate": 1580,
     "visceralFat": 8,
     "bodyWater": 38.5,
     "segmental": {
       "rightArm": { "muscle": 3.2, "fat": 1.1 },
       "leftArm": { "muscle": 3.1, "fat": 1.0 },
       "trunk": { "muscle": 22.5, "fat": 8.5 },
       "rightLeg": { "muscle": 9.2, "fat": 3.0 },
       "leftLeg": { "muscle": 9.1, "fat": 3.1 }
     },
     "note": ""
   }
   ```
4. **更新 manifest.json**：加入 inbody 陣列
5. **回報結果**：
   ```
   ✅ 已記錄 InBody 數據 (YYYY-MM-DD)
   
   ⚖️ 體重：74.5 kg
   💪 骨骼肌量：32.1 kg
   📉 體脂率：21.8%
   📊 BMI：24.1
   🔥 基礎代謝：1580 kcal
   ```

---

## 注意事項

- 所有日期使用 Asia/Taipei 時區
- JSON 檔案使用 2-space indent, UTF-8 編碼
- 圖片路徑使用相對路徑（相對於專案根目錄）
- 營養素數值四捨五入到整數
- 每次更新完提醒使用者 `git push` 以更新網頁
