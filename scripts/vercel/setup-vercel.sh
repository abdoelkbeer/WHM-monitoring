#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ vercel CLI غير موجود. ثبّته أولًا: npm i -g vercel"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ GitHub CLI غير موجود. ثبّته أولًا: https://cli.github.com/"
  exit 1
fi

echo "==> 1) ربط الريبو مع Vercel (Framework: Next.js)"
vercel link --yes

if [ ! -f vercel.json ]; then
  cat > vercel.json <<'JSON'
{
  "framework": "nextjs"
}
JSON
  echo "✅ تم إنشاء vercel.json"
fi

echo "==> 2) تجهيز Environment Variables للـ Preview و Production"

declare -a VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "APP_ENCRYPTION_KEY"
  "SMTP_HOST"
  "SMTP_PORT"
  "SMTP_USER"
  "SMTP_PASS"
  "SMTP_FROM"
  "PLAYWRIGHT_HEADLESS"
  "ADMIN_EMAIL_ALLOWLIST"
)

for var in "${VARS[@]}"; do
  value="${!var:-}"

  if [ -z "${value}" ]; then
    read -r -s -p "أدخل قيمة ${var}: " value
    echo
  fi

  if [ -z "${value}" ]; then
    echo "⚠️  تخطّي ${var} (قيمة فارغة)"
    continue
  fi

  printf '%s' "$value" | vercel env add "$var" preview
  printf '%s' "$value" | vercel env add "$var" production
  echo "✅ تمت إضافة ${var} إلى preview+production"
done

echo "==> 3) تفعيل GitHub Integration"
echo "افتح: Vercel Dashboard > Settings > Git > Connect Git Repository"
echo "وتأكد أن Vercel GitHub App لديه صلاحية الوصول لنفس الـ repository."

echo "==> 4) إنشاء PR تجريبي للتأكد من Preview Deployment"
if gh auth status >/dev/null 2>&1; then
  branch_name="vercel-preview-smoke-$(date +%s)"
  git checkout -b "$branch_name"
  echo "# smoke" > .vercel-preview-smoke.md
  git add .vercel-preview-smoke.md
  git commit -m "chore: add smoke file for vercel preview verification"

  if git remote get-url origin >/dev/null 2>&1; then
    git push -u origin "$branch_name"
    gh pr create --title "chore: verify vercel preview deployment" --body "Smoke PR للتحقق من ظهور Preview / View deployment في GitHub PR."
    echo "✅ تم إنشاء PR تجريبي. تابع حالة deployment داخل صفحة الـPR."
  else
    echo "⚠️ لا يوجد remote origin. اربط Git remote أولًا ثم أعد خطوة push/PR."
  fi
else
  echo "⚠️ gh غير مسجّل دخول. سجّل gh auth login ثم أعد تشغيل هذا السكربت لعمل PR تلقائي."
fi
