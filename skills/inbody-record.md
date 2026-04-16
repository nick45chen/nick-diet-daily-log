---
name: inbody-record
description: InBody 身體數據記錄技能。當使用者輸入「記錄 InBody」、「InBody」、「身體數據」，或上傳 InBody 報告照片時自動觸發。
---

# InBody 記錄 Skill

## 觸發條件

當使用者輸入以下關鍵字或動作時觸發：
- 「記錄 InBody」、「InBody」、「身體數據」
- 提供 InBody 報告照片

## 流程

### Step 1：讀取 InBody 照片

使用 Read tool 辨識報告內容。

### Step 2：壓縮照片

```bash
sips -s format jpeg -s formatOptions 80 "<input_path>" --out "images/inbody/YYYY-MM-DD.jpg"
sips -Z 1200 "images/inbody/YYYY-MM-DD.jpg"
```

### Step 3：擷取數據

建立 `data/inbody/YYYY-MM-DD.json`：

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

### Step 4：更新 manifest.json

加入 inbody 陣列，更新 `lastUpdated`。

### Step 5：回報結果

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
- 每次更新完提醒使用者 `git push` 以更新網頁
