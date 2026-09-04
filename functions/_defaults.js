/* ========================================
   VILA VALQUEIRE RJ - Padrões e utilitários
   Compartilhado pelas Cloudflare Pages Functions.
   Arquivos que começam com "_" não viram rota pública.
   ======================================== */

export const DEFAULT_SETTINGS = {
    colors: {
        bg: '#0d0b1a',
        purple: '#833ab4',
        pink: '#e1306c',
        orange: '#f77737',
        yellow: '#fcaf45',
        magenta: '#bc1888'
    },
    slider: [
        { icon: 'fas fa-bullhorn', title: 'Sua empresa em destaque', desc: 'Milhares de moradores da Vila Valqueire visitam nosso portal todos os dias.', cta: 'Anuncie aqui' },
        { icon: 'fa-brands fa-instagram', title: 'Alcance nas redes sociais', desc: 'Divulgue no @vilavalqueirerj e movimente seu Instagram.', cta: 'Quero divulgar' },
        { icon: 'fas fa-store', title: 'Comércio local', desc: 'Pacotes especiais para lojas, clínicas, restaurantes e serviços do bairro.', cta: 'Falar com a equipe' },
        { icon: 'fas fa-cake-candles', title: 'Eventos e pessoas físicas', desc: 'Aniversários, anúncios, vendas particulares: você também pode anunciar.', cta: 'Solicitar orçamento' }
    ],
    banner: {
        tag: 'PUBLICIDADE',
        title: 'JSMuniz Publicidade',
        desc: 'Espaço reservado para o seu anúncio',
        cta: 'Anuncie aqui'
    }
};

export function json(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            ...extraHeaders
        }
    });
}

function pickString(value, fallback, max = 200) {
    if (typeof value !== 'string') return fallback;
    const t = value.trim().slice(0, max);
    return t || fallback;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function sanitizeColors(colors) {
    const d = DEFAULT_SETTINGS.colors;
    if (!colors || typeof colors !== 'object') return { ...d };
    const out = {};
    Object.keys(d).forEach(k => {
        const v = colors[k];
        out[k] = HEX_RE.test(v) ? v : d[k];
    });
    return out;
}

export function sanitizeSlider(slider) {
    if (!Array.isArray(slider)) return DEFAULT_SETTINGS.slider;
    const clean = slider.slice(0, 8).map(s => ({
        icon: pickString(s?.icon, DEFAULT_SETTINGS.slider[0].icon, 80),
        title: pickString(s?.title, 'Publicidade', 90),
        desc: pickString(s?.desc, '', 220),
        cta: pickString(s?.cta, 'Anuncie aqui', 60)
    }));
    if (clean.length === 0) return DEFAULT_SETTINGS.slider;
    return clean;
}

export function sanitizeBanner(banner) {
    const d = DEFAULT_SETTINGS.banner;
    if (!banner || typeof banner !== 'object') return { ...d };
    return {
        tag: pickString(banner.tag, d.tag, 40),
        title: pickString(banner.title, d.title, 80),
        desc: pickString(banner.desc, d.desc, 160),
        cta: pickString(banner.cta, d.cta, 40)
    };
}

export function mergeSettings(defaults, stored) {
    const now = {
        colors: { ...defaults.colors, ...(stored.colors || {}) },
        slider: Array.isArray(stored.slider) && stored.slider.length ? stored.slider : defaults.slider,
        banner: { ...defaults.banner, ...(stored.banner || {}) }
    };
    return now;
}

export function checkCredentials(request, env) {
    const allowedUser = env.ADMIN_USER || 'jsmunize';
    const allowedPass = env.ADMIN_PASS || 'jojo7811';
    const auth = request.headers.get('Authorization') || '';
    const [scheme, encoded] = auth.split(' ');
    if (scheme !== 'Basic' || !encoded) return false;
    try {
        const decoded = atob(encoded);
        const idx = decoded.indexOf(':');
        if (idx === -1) return false;
        const user = decoded.slice(0, idx);
        const pass = decoded.slice(idx + 1);
        return user === allowedUser && pass === allowedPass;
    } catch (e) {
        return false;
    }
}