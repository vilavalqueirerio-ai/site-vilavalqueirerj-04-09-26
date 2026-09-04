/* ========================================
   GET /api/settings - Leitura pública (site + admin)
   Retorna as configurações salvas no KV,
   ou os padrões caso nada esteja configurado.
   ======================================== */
import { DEFAULT_SETTINGS, json, mergeSettings } from '../_defaults.js';

export async function onRequestGet(context) {
    const { env } = context;
    let settings = { ...DEFAULT_SETTINGS };

    try {
        const raw = await env.SETTINGS.get('site_settings');
        if (raw) {
            settings = mergeSettings(DEFAULT_SETTINGS, JSON.parse(raw));
        }
    } catch (err) {
        // Sem binding KV configurado: usa os padrões
    }

    return json(settings, 200, { 'Cache-Control': 'public, max-age=30, s-maxage=30' });
}