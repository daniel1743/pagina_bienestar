import { supabase } from '@/lib/customSupabaseClient';

const defaultRefreshPayload = {
  source: 'admin_cms',
  event: 'article_published',
  at: new Date().toISOString(),
};

export const refreshSitemapAfterPublish = async () => {
  const functionName = import.meta.env.VITE_SITEMAP_FUNCTION_NAME;
  const webhookUrl = import.meta.env.VITE_SITEMAP_WEBHOOK_URL;

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultRefreshPayload),
    });
    if (!response.ok) throw new Error(`Webhook sitemap falló (${response.status})`);
    return { mode: 'webhook' };
  }

  if (!functionName) {
    return { mode: 'build-only' };
  }

  const { error } = await supabase.functions.invoke(functionName, {
    body: defaultRefreshPayload,
  });
  if (error) throw error;
  return { mode: 'edge-function' };
};
