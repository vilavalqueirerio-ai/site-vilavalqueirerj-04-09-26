/* ========================================
   POST /api/admin/settings - Salva as configurações
   Requer cabeçalho Authorization: Basic <base64(usuario:senha)>.
   Persiste no Cloudflare KV (binding: SETTINGS).
   ======================================== */
import { json, checkCredentials, sanitizeColors, sanitizeSlider, sanitizeBanner } from '../../_defaults.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!checkCredentials(request, env)) {
        return json({ ok: false, error: 'auth', message: 'Não autorizado.' }, 401);
    }

    if (!env.SETTINGS) {
        return json({
            ok: false,
            error: 'kv',
            message: 'Binding KV "SETTINGS" não configurado. Configure em Cloudflare Pages > Settings > Bindings > KV namespace.'
        }, 500);
    }

    let body;
    try {
        body = await request.json();
    } catch (err) {
        return json({ ok: false, error: 'body', message: 'JSON inválido.' }, 400);
    }

    const settings = {
        colors: sanitizeColors(body.colors),
        slider: sanitizeSlider(body.slider),
        banner: sanitizeBanner(body.banner)
    };

    try {
        await env.SETTINGS.put('site_settings', JSON.stringify(settings));
        return json({ ok: true, message: 'Configurações salvas com sucesso!' });
    } catch (err) {
        return json({ ok: false, error: 'save', message: 'Falha ao salvar. Tente novamente.' }, 500);
    }
}