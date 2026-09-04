/* ========================================
   VILA VALQUEIRE RJ - Admin JS
   Login e painel (cores, slider, banner).
   Autenticação é verificada no servidor (Cloudflare),
   a senha não fica exposta no código do site.
   ======================================== */
(function () {
    'use strict';

    const STORAGE_KEY = 'vv_admin_auth';

    function getAuth() { return sessionStorage.getItem(STORAGE_KEY) || ''; }
    function setAuth(b64) { sessionStorage.setItem(STORAGE_KEY, b64); }
    function clearAuth() { sessionStorage.removeItem(STORAGE_KEY); }

    const toast = {
        show(msg, isError) {
            const el = document.getElementById('toast');
            if (!el) return alert(isError ? msg : msg);
            el.textContent = msg;
            el.classList.toggle('error', !!isError);
            el.classList.add('show');
            clearTimeout(toast._t);
            toast._t = setTimeout(() => el.classList.remove('show'), 3400);
        }
    };

    function setBtnLoading(btn, loading) {
        if (!btn) return;
        const label = btn.querySelector('.btn-label');
        const loadingEl = btn.querySelector('.btn-loading');
        if (label) label.hidden = loading;
        if (loadingEl) loadingEl.hidden = !loading;
        btn.disabled = loading;
    }

    /* =========================================
       PÁGINA DE LOGIN
       ========================================= */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        clearAuth();
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('user').value.trim();
            const pass = document.getElementById('pass').value;
            const errEl = document.getElementById('loginError');
            const btn = document.getElementById('loginBtn');
            if (errEl) errEl.textContent = '';
            setBtnLoading(btn, true);
            try {
                const res = await fetch(SITE_ADMIN.apiAuth, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user, pass })
                });
                const data = await res.json();
                if (data.ok) {
                    setAuth(btoa(user + ':' + pass));
                    window.location.href = 'dashboard.html';
                } else {
                    if (errEl) errEl.textContent = 'Usuário ou senha inválidos.';
                }
            } catch (err) {
                if (errEl) errEl.textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } finally {
                setBtnLoading(btn, false);
            }
        });
        return;
    }

    /* =========================================
       PAINEL
       ========================================= */
    const DEFAULTS = window.SITE_DEFAULTS || {};

    let current = {
        colors: { ...(DEFAULTS.colors || {}) },
        slider: JSON.parse(JSON.stringify(DEFAULTS.slider || [])),
        banner: { ...(DEFAULTS.banner || {}) }
    };

    function setLoading(l) { const b = document.getElementById('saveBtn'); setBtnLoading(b, l); }

    /* ---------- ABA ---------- */
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    /* ---------- CORES ---------- */
    const COLOR_LABELS = {
        bg: 'Fundo do site',
        purple: 'Roxo',
        pink: 'Rosa (principal)',
        orange: 'Laranja',
        yellow: 'Amarelo',
        magenta: 'Magenta'
    };

    function buildColorGrid() {
        const grid = document.getElementById('colorGrid');
        grid.innerHTML = '';
        Object.keys(COLOR_LABELS).forEach(key => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.innerHTML = `
                <input type="color" id="color-${key}" data-key="${key}" value="${current.colors[key] || '#000000'}">
                <div class="color-info">
                    <span class="color-name">${COLOR_LABELS[key]}</span>
                    <span class="color-hex" id="hex-${key}">${(current.colors[key] || '').toUpperCase()}</span>
                </div>`;
            grid.appendChild(item);
            const input = item.querySelector('input');
            input.addEventListener('input', () => {
                current.colors[key] = input.value;
                document.getElementById('hex-' + key).textContent = input.value.toUpperCase();
                livePreview();
            });
        });
        livePreview();
    }

    function livePreview() {
        const c = current.colors;
        const gradient = `linear-gradient(90deg, ${c.yellow}, ${c.orange}, ${c.pink}, ${c.magenta})`;
        const bar = document.getElementById('previewBar');
        const solid = document.querySelector('.preview-btn.solid');
        const soft = document.querySelector('.preview-btn.soft');
        if (bar) bar.style.background = gradient;
        if (solid) solid.style.background = gradient;
        if (soft) soft.style.borderColor = c.pink;
    }

    /* ---------- SLIDER ---------- */
    function buildSliderRows() {
        const rows = document.getElementById('sliderRows');
        rows.innerHTML = '';
        current.slider.forEach((slide, i) => {
            const row = document.createElement('div');
            row.className = 'slide-row';
            row.innerHTML = `
                <div class="slide-row-header">
                    <strong>Slide ${i + 1}</strong>
                    <button type="button" class="remove-slide" data-slide-group="${i}" title="Remover slide"><i class="fas fa-trash"></i></button>
                </div>
                <div class="slide-grid">
                    <div class="field">
                        <label>Ícone (classe Font Awesome)</label>
                        <input type="text" data-slide-group="${i}" data-slide-field="icon" value="${slide.icon || ''}" placeholder="fas fa-bullhorn">
                    </div>
                    <div class="field">
                        <label>Título</label>
                        <input type="text" data-slide-group="${i}" data-slide-field="title" value="${(slide.title || '').replace(/"/g, '&quot;')}" placeholder="Título do slide">
                    </div>
                    <div class="field field-full">
                        <label>Descrição</label>
                        <input type="text" data-slide-group="${i}" data-slide-field="desc" value="${(slide.desc || '').replace(/"/g, '&quot;')}" placeholder="Descrição">
                    </div>
                    <div class="field field-full">
                        <label>Texto do botão</label>
                        <input type="text" data-slide-group="${i}" data-slide-field="cta" value="${(slide.cta || '').replace(/"/g, '&quot;')}" placeholder="Anuncie aqui">
                    </div>
                </div>`;
            rows.appendChild(row);
        });
        rows.querySelectorAll('.remove-slide').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.slideGroup, 10);
                current.slider.splice(idx, 1);
                buildSliderRows();
            });
        });
        rows.querySelectorAll('input[data-slide-field]').forEach(input => {
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.slideGroup, 10);
                const field = input.dataset.slideField;
                if (current.slider[idx]) current.slider[idx][field] = input.value;
            });
        });
    }

    const addSlideBtn = document.getElementById('addSlideBtn');
    if (addSlideBtn) {
        addSlideBtn.addEventListener('click', () => {
            if (current.slider.length >= 8) { toast.show('Máximo de 8 slides.', true); return; }
            current.slider.push({ icon: 'fas fa-bullhorn', title: 'Novo slide', desc: '', cta: 'Anuncie aqui' });
            buildSliderRows();
        });
    }

    /* ---------- BANNER ---------- */
    function fillBanner() {
        const map = { bannerTag: 'tag', bannerTitle: 'title', bannerDesc: 'desc', bannerCta: 'cta' };
        Object.keys(map).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = current.banner[map[id]] || '';
        });
    }
    Object.keys({ bannerTag: 'tag', bannerTitle: 'title', bannerDesc: 'desc', bannerCta: 'cta' }).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const field = { bannerTag: 'tag', bannerTitle: 'title', bannerDesc: 'desc', bannerCta: 'cta' }[id];
            el.addEventListener('input', () => { current.banner[field] = el.value; });
        }
    });

    /* ---------- SALVAR ---------- */
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const auth = getAuth();
            if (!auth) { window.location.href = 'index.html'; return; }
            // Mantém apenas slides preenchidos
            const slider = current.slider.filter(s => (s.title && s.title.trim()) || (s.desc && s.desc.trim()));
            const payload = { colors: current.colors, slider: slider.length ? slider : current.slider, banner: current.banner };
            setLoading(true);
            try {
                const res = await fetch(SITE_ADMIN.apiSave, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + auth
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.ok) {
                    toast.show(data.message || 'Configurações salvas!');
                } else if (res.status === 401) {
                    clearAuth();
                    window.location.href = 'index.html';
                } else {
                    toast.show(data.message || 'Erro ao salvar.', true);
                }
            } catch (err) {
                toast.show('Erro de conexão.', true);
            } finally {
                setLoading(false);
            }
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            current = {
                colors: { ...(DEFAULTS.colors || {}) },
                slider: JSON.parse(JSON.stringify(DEFAULTS.slider || [])),
                banner: { ...(DEFAULTS.banner || {}) }
            };
            buildColorGrid();
            buildSliderRows();
            fillBanner();
            toast.show('Valores padrão restaurados. Clique em Salvar para aplicar.');
        });
    }

    /* ---------- LOGOUT / VER SITE ---------- */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { clearAuth(); window.location.href = 'index.html'; });
    const viewSite = document.getElementById('viewSite');
    if (viewSite) viewSite.href = SITE_ADMIN.home;

    /* ---------- CARREGAR DADOS ---------- */
    function init() {
        const auth = getAuth();
        if (!auth) { window.location.href = 'index.html'; return; }
        // Valida o login no servidor
        fetch(SITE_ADMIN.apiSettings, { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(data => {
                if (data && data.colors) {
                    current.colors = { ...DEFAULTS.colors, ...data.colors };
                    current.slider = (Array.isArray(data.slider) && data.slider.length) ? data.slider : DEFAULTS.slider;
                    current.banner = { ...DEFAULTS.banner, ...data.banner };
                }
                buildColorGrid();
                buildSliderRows();
                fillBanner();
            })
            .catch(() => {
                buildColorGrid();
                buildSliderRows();
                fillBanner();
            });
    }
    init();
})();