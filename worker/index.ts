import cron from 'node-cron';
import { chromium } from 'playwright';
import { supabaseServiceClient } from '@/lib/supabase';
import { runHttpCheck } from '@/lib/monitoring';
import { sendAlertEmail } from '@/lib/email';

const supabase = supabaseServiceClient();

async function getSettings() {
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  return data;
}

async function handleIncident(site: any, check: any, settings: any) {
  const { data: openIncident } = await supabase.from('incidents').select('*').eq('site_id', site.id).eq('is_open', true).maybeSingle();

  if (check.result_status === 'HEALTHY') {
    if (openIncident) {
      const { data: healthyChecks } = await supabase.from('checks').select('id').eq('site_id', site.id).eq('result_status', 'HEALTHY').order('checked_at', { ascending: false }).limit(settings.close_threshold || 2);
      if ((healthyChecks?.length ?? 0) >= (settings.close_threshold || 2)) {
        await supabase.from('incidents').update({ is_open: false, ended_at: new Date().toISOString() }).eq('id', openIncident.id);
        if (settings.notify_on_resolve && settings.alert_email) {
          await sendAlertEmail(settings.alert_email, `✅ تم حل المشكلة: ${site.domain}`, `<p>تم حل الحادث للموقع ${site.domain}</p>`);
        }
      }
    }
    return;
  }

  const { data: badChecks } = await supabase.from('checks').select('id').eq('site_id', site.id).eq('result_status', check.result_status).order('checked_at', { ascending: false }).limit(settings.open_threshold || 2);
  if ((badChecks?.length ?? 0) < (settings.open_threshold || 2) || openIncident) return;

  const { data: incident } = await supabase.from('incidents').insert({
    site_id: site.id,
    type: check.result_status,
    started_at: new Date().toISOString(),
    is_open: true,
    evidence_json: { http_status: check.http_status, final_url: check.final_url, keyword_match: check.keyword_match }
  }).select('*').single();

  if (settings.alert_email && incident) {
    await sendAlertEmail(settings.alert_email, `🚨 Incident: ${site.domain}`, `<p>نوع المشكلة: ${check.result_status}</p><pre>${JSON.stringify(incident.evidence_json, null, 2)}</pre>`);
  }
}

async function captureScreenshot(site: any) {
  const browser = await chromium.launch({ headless: process.env.PLAYWRIGHT_HEADLESS !== 'false' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30_000 });
  const buffer = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 70 });
  await browser.close();

  const path = `${site.id}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('site-screenshots').upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('site-screenshots').getPublicUrl(path);

  await supabase.from('screenshots').insert({ site_id: site.id, captured_at: new Date().toISOString(), storage_path: path, public_url: data.publicUrl });
  await supabase.from('sites').update({ last_screenshot_at: new Date().toISOString() }).eq('id', site.id);
}

async function runChecks() {
  const settings = await getSettings();
  const { data: sites } = await supabase.from('sites').select('*').eq('is_active', true);
  for (const site of sites ?? []) {
    const result = await runHttpCheck(site.url);
    await supabase.from('checks').insert({
      site_id: site.id,
      checked_at: new Date().toISOString(),
      http_status: result.httpStatus,
      response_time_ms: result.responseTimeMs,
      final_url: result.finalUrl,
      redirect_chain_json: result.redirectChain,
      keyword_match: result.keywordMatch,
      result_status: result.resultStatus
    });
    await supabase.from('sites').update({ last_check_at: new Date().toISOString(), current_status: result.resultStatus }).eq('id', site.id);
    await handleIncident(site, { ...result, result_status: result.resultStatus }, settings);
  }
}

async function runScreenshots() {
  const settings = await getSettings();
  const cutoff = Date.now() - (settings.screenshot_interval_minutes || 30) * 60 * 1000;
  const { data: sites } = await supabase.from('sites').select('*').eq('is_active', true);
  for (const site of sites ?? []) {
    const last = site.last_screenshot_at ? new Date(site.last_screenshot_at).getTime() : 0;
    if (last < cutoff || ['DOWN', 'REDIRECT', 'CRITICAL'].includes(site.current_status)) {
      try { await captureScreenshot(site); } catch (e) { console.error('screenshot error', e); }
    }
  }
}

async function runWhmSync() {
  const settings = await getSettings();
  const cutoff = Date.now() - (settings.whm_sync_interval_hours || 6) * 3600 * 1000;
  const { data: servers } = await supabase.from('servers').select('*');
  for (const s of servers ?? []) {
    if (!s.last_sync_at || new Date(s.last_sync_at).getTime() < cutoff) {
      await fetch(`${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/servers/${s.id}/sync`, { method: 'POST' });
    }
  }
}

cron.schedule('*/5 * * * *', runChecks);
cron.schedule('*/10 * * * *', runScreenshots);
cron.schedule('0 * * * *', runWhmSync);

runChecks().catch(console.error);
console.log('worker started');
