Absolutely, Bohan. Here's a detailed **Product Requirements Document (PRD)** tailored to your background, current vision, and future roadmap. It’s scoped specifically for your **MVP (Phase 1)** and written with clarity for a small dev team (including yourself).

---

# 🧾 Product Requirements Document (PRD)

**Product Name:** *TasteTrail*  
**Prepared by:** ChatGPT for Bohan  
**Version:** MVP / Phase 1  
**Last Updated:** April 11, 2025

---

## 🔥 Product Summary

**TasteTrail** is a consumer-first food discovery app that parses digital receipts (email or image) to extract itemized dish data, allowing users to rank the dishes they've had. Based on this data, we generate personalized taste profiles and lightweight dish recommendations. The long-term vision is to power AI-based food discovery and offer restaurants actionable, dish-level insights.

---

## 🎯 Goals (MVP / Phase 1)

- Build the foundational flow for **user-driven receipt ingestion** and **dish rating**
- Generate a **taste profile** based on user feedback
- Provide a **basic recommendation engine** for new dishes
- Lay groundwork for **B2B data products** with clean, structured dish feedback

---

## 📌 Scope (Phase 1 MVP)

### 1. **User Account & Auth**
- Email/password or Firebase Auth (Google login preferred)
- Store metadata: `userId`, `name`, `tasteTags`, `ratedDishes`

---

### 2. **Receipt Ingestion**
#### a. **Email Parsing (Manual for now)**
- User uploads `.eml` or `.txt` (or pastes in content)
- Use `mailparser` + custom extractors
- Parse:
  - Merchant name
  - Transaction date
  - List of line items (dish names + optional price)

#### b. **Image Parsing (Stretch Goal)**
- Upload receipt image (JPEG/PNG)
- Use AWS Textract to extract line-item text

---

### 3. **Dish Rating UI**
- For each parsed receipt, display dish names
- Allow:
  - 1–5 star rating (or thumbs up/down MVP)
  - Optional: tags like spicy, creamy, sweet, etc.
- Store in DB: `dishName`, `restaurant`, `tags[]`, `userRating`, `receiptId`

---

### 4. **Taste Profile Generator**
- Generate taste vectors for each user:
  - Favorite ingredients or cuisine clusters
  - Most rated dishes / tags
- Simple rule-based recommender:
  - “You liked X, you might like Y” from aggregated user data (collaborative filtering later)

---

### 5. **Minimal Feed / Dashboard**
- Taste profile summary (top cuisines, dishes, taste tags)
- Recently rated dishes
- Suggested dishes to try

---

## 🧱 Data Models (Simplified)

```ts
User {
  id: string
  email: string
  tasteTags: string[] // ["spicy", "noodle", "savory"]
  ratedDishes: DishRating[]
}

DishRating {
  id: string
  dishName: string
  restaurant: string
  rating: number // 1–5
  tags?: string[]
  dateEaten: Date
}

Receipt {
  id: string
  merchant: string
  date: Date
  dishes: string[] // item names parsed from receipt
  source: "email" | "image"
}
```

---

## 🧪 Tech Stack

| Layer           | Stack                                     |
| --------------- | ----------------------------------------- |
| Frontend        | Next.js + Tailwind + Firebase Auth        |
| Backend         | Node.js API (shared logic)                |
| Receipt Parsing | `mailparser`, AWS Textract (stretch goal) |
| DB              | DynamoDB (NoSQL structure, fast reads)    |
| Storage         | S3 (for raw email / receipt backups)      |
| Analytics       | Posthog or custom logs (optional now)     |

---

## 🔁 User Flow (End-to-End)

1. **Sign up** with email or Google
2. **Upload a receipt** (email paste or file upload)
3. System parses receipt and shows a list of dishes
4. **User rates dishes**
5. System updates **taste profile**
6. User sees **updated taste profile + suggestions**

---

## 🧭 Out of Scope (Phase 1)

- Real-time email integration (e.g. Gmail API)
- Full social features (followers, friends)
- Restaurant feedback dashboards (planned in Phase 2)
- Advanced ML recommendations (rule-based only for MVP)

---

## 🚀 Milestones & Timeline

| Feature                 | Owner | Est. Time |
| ----------------------- | ----- | --------- |
| Auth setup (Firebase)   | You   | 1–2 days  |
| Receipt parsing (email) | You   | 3–4 days  |
| Dish rating UI          | You   | 2–3 days  |
| Taste profile logic     | You   | 2–3 days  |
| Feed / Dashboard page   | You   | 2 days    |
| Deployment + testing    | You   | 2 days    |
| **Total MVP Duration**  |       | ~2 weeks  |

---

## ✅ Success Metrics (for Phase 1)

- ✅ 25 users upload at least 2 receipts
- ✅ 100+ unique dishes rated
- ✅ Users spend 3+ minutes exploring their taste profiles
- ✅ Early positive feedback / invites
