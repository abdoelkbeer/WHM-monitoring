# WHM Monitoring (Arabic RTL)

تطبيق خاص (single-owner) لمراقبة مواقع WordPress على عدة سيرفرات WHM/cPanel.

## Stack
- Next.js App Router + TypeScript + Tailwind (RTL Arabic UI)
- Supabase Postgres/Auth/Storage
- Worker منفصل بـ Node + Playwright + node-cron

## الإعداد
1. انسخ المتغيرات:
   ```bash
   cp .env.example .env.local
   ```
2. أدخل مفاتيح Supabase/SMTP ومفتاح `APP_ENCRYPTION_KEY` (32 bytes).
3. شغّل SQL migration الموجودة في:
   - `supabase/migrations/001_init.sql`
4. أنشئ bucket في Supabase Storage باسم: `site-screenshots` (Public).
5. Seed للإعدادات:
   ```bash
   npm run seed
   ```

## التشغيل
```bash
npm install
npm run dev
```

## تشغيل العامل Worker
```bash
npm run worker
```

## الصفحات
- `/login`
- `/servers` إدارة وربط سيرفرات WHM + test + sync
- `/sites` لوحة المواقع (grid + lazy screenshot + load more)
- `/issues` المواقع المتعثرة مصنّفة
- `/reports` تقارير الحوادث وأكثر المواقع تكرارًا
- `/settings` إعداد البريد والفواصل الزمنية

## ملاحظات
- توكن WHM يُخزّن مشفرًا AES-256-GCM عبر `APP_ENCRYPTION_KEY`.
- التنبيهات البريدية تُرسل عند فتح incident (واختياريًا عند الحل).
- منطق فتح/إغلاق incident يعتمد على open/close threshold من جدول الإعدادات.

## نشر المشروع على Vercel (Next.js)
لتنفيذ إعداد Vercel بسرعة (ربط المشروع + إضافة Environment Variables للـ Preview/Production + خطوات التحقق من Preview Deployments):

```bash
bash scripts/vercel/setup-vercel.sh
```

> ملاحظات مهمة:
> - السكربت يتطلب `vercel` CLI و `gh` CLI.
> - يضيف المتغيرات التالية على بيئتي `preview` و `production`:
>   - `NEXT_PUBLIC_SUPABASE_URL`
>   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
>   - `SUPABASE_SERVICE_ROLE_KEY`
>   - `APP_ENCRYPTION_KEY`
>   - `SMTP_HOST`
>   - `SMTP_PORT`
>   - `SMTP_USER`
>   - `SMTP_PASS`
>   - `SMTP_FROM`
>   - `PLAYWRIGHT_HEADLESS`
>   - `ADMIN_EMAIL_ALLOWLIST`
> - تم تثبيت Framework على `Next.js` عبر `vercel.json`.
