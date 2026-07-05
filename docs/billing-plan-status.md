# Billing Plan Status

## 目標

讓 /profile 的付費方案區塊變成動態狀態卡。

## 新增

- app/api/billing/status/route.ts
- components/BillingPlanStatus.tsx

## 行為

- 目前不接金流。
- 預設方案為 free。
- 付費功能顯示為預留中。
- 已登入時會顯示 Discord 權限已連接。
- 未來可接 KETHER_PLAN_TIER、KETHER_PLAN_STATUS、KETHER_TRIAL_ENDS_AT、KETHER_SUBSCRIPTION_ENDS_AT。

## 版本

不修改網站版本。
