/* ========================================
   VILA VALQUEIRE RJ - main.js
   Relógio, clima, partículas, reveals, contadores,
   feed do Instagram, slider de anúncios e modais.
   Também aplica as configurações do painel admin
   (cores, slider e banner) vindas de /api/settings.
   ======================================== */
(function () {
    'use strict';

    const CONFIG = window.SITE_CONFIG || {};
    const DEFAULTS = window.SITE_DEFAULTS || {};
    let SETTINGS = {
        colors: DEFAULTS.colors || {},
        slider: DEFAULTS.slider || [],
        banner: DEFAULTS.banner || {}
    };

    /* ---------- DATA E HORA ---------- */
    function updateClock() {
        const now = new Date();
        const dateEl = document.getElementById('currentDate');
        const timeEl = document.getElementById('currentTime');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('pt-BR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
        }
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('pt-BR');
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    /* ---------- CLIMA (Open-Meteo - Vila Valqueire) ---------- */
    function loadWeather() {
        const lat = CONFIG.weatherLat || -22.9330;
        const lon = CONFIG.weatherLon || -43.3610;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=America/Sao_Paulo`)
            .then(r => r.json())
            .then(data => {
                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;
                const isDay = data.current_weather.is_day === 1;
                const icons = {
                    0: 'fa-sun', 1: 'fa-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
                    45: 'fa-smog', 48: 'fa-smog',
                    51: 'fa-cloud-rain', 53: 'fa-cloud-rain', 55: 'fa-cloud-rain',
                    56: 'fa-cloud-rain', 57: 'fa-cloud-rain',
                    61: 'fa-cloud-showers-heavy', 63: 'fa-cloud-showers-heavy', 65: 'fa-cloud-showers-heavy',
                    66: 'fa-cloud-showers-heavy', 67: 'fa-cloud-showers-heavy',
                    71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake', 77: 'fa-snowflake',
                    80: 'fa-cloud-showers-heavy', 81: 'fa-cloud-showers-heavy', 82: 'fa-cloud-showers-heavy',
                    85: 'fa-snowflake', 86: 'fa-snowflake',
                    95: 'fa-cloud-bolt', 96: 'fa-cloud-bolt', 99: 'fa-cloud-bolt'
                };
                const icon = isDay ? (icons[code] || 'fa-sun') : 'fa-moon';
                const labels = {
                    0: 'Céu limpo', 1: 'Predomínio de sol', 2: 'Parcialmente nublado', 3: 'Nublado',
                    45: 'Nevoeiro', 48: 'Nevoeiro', 51: 'Garoa', 53: 'Garoa', 55: 'Garoa',
                    61: 'Chuva', 63: 'Chuva', 65: 'Chuva forte', 71: 'Neve', 80: 'Pancadas de chuva',
                    95: 'Tempestade', 96: 'Tempestade', 99: 'Tempestade'
                };
                const weatherText = document.getElementById('weatherText');
                const tempDisplay = document.getElementById('tempDisplay');
                const weatherInfo = document.getElementById('weatherInfo');
                if (weatherText) weatherText.textContent = labels[code] || 'Tempo instável';
                if (tempDisplay) tempDisplay.textContent = temp + '°C';
                if (weatherInfo) {
                    weatherInfo.querySelector('i').className = 'fas ' + icon;
                }
            })
            .catch(() => {
                const weatherText = document.getElementById('weatherText');
                if (weatherText) weatherText.textContent = 'Clima indisponível';
            });
    }
    loadWeather();

    /* ---------- PARTÍCULAS ---------- */
    function initParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        const colors = ['#833ab4', '#e1306c', '#f77737', '#fcaf45'];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        function createParticles() {
            particles = [];
            const count = Math.min(70, Math.floor(width / 22));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: Math.random() * 2 + 0.6,
                    speedX: (Math.random() - 0.5) * 0.35,
                    speedY: (Math.random() - 0.5) * 0.35,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: Math.random() * 0.5 + 0.15
                });
            }
        }
        function draw() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            requestAnimationFrame(draw);
        }
        resize();
        createParticles();
        draw();
        window.addEventListener('resize', () => { resize(); createParticles(); });
    }
    initParticles();

    /* ---------- NAVBAR ---------- */
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
        document.querySelectorAll('.nav-links a').forEach(a => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                const rect = target.getBoundingClientRect();
                a.classList.toggle('active', rect.top <= 120 && rect.bottom >= 120);
            }
        });
    }, { passive: true });

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => navLinks.classList.remove('open'))
        );
    }

    /* ---------- SCROLL REVEAL ---------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ---------- CONTADORES ---------- */
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            const duration = 1600;
            const start = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = prefix + Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.4 });
    document.querySelectorAll('.counter-num').forEach(el => counterObserver.observe(el));

    /* ---------- SETTINGS DO PAINEL ADMIN ---------- */
    function applyColors(colors) {
        const root = document.documentElement;
        const c = { ...SITE_DEFAULTS.colors, ...(colors || {}) };
        const set = (name, value) => root.style.setProperty(name, value);
        set('--bg', c.bg);
        set('--bg-2', c.bg);
        set('--purple', c.purple);
        set('--pink', c.pink);
        set('--orange', c.orange);
        set('--yellow', c.yellow);
        set('--magenta', c.magenta);
        set('--gradient', `linear-gradient(90deg, ${c.yellow} 0%, ${c.orange} 25%, ${c.pink} 60%, ${c.magenta} 100%)`);
        set('--gradient-soft', `linear-gradient(135deg, ${c.magenta} 0%, ${c.pink} 100%)`);
    }

    function applyBanner(banner) {
        const b = { ...SITE_DEFAULTS.banner, ...(banner || {}) };
        const tag = document.getElementById('bannerFallbackTag');
        const title = document.getElementById('bannerFallbackTitle');
        const desc = document.getElementById('bannerFallbackDesc');
        const cta = document.getElementById('bannerFallbackCta');
        if (tag) tag.textContent = b.tag;
        if (title) title.textContent = b.title;
        if (desc) desc.textContent = b.desc;
        if (cta) cta.textContent = b.cta;
    }

    function mergeSettings(remote) {
        if (!remote || typeof remote !== 'object') return;
        if (remote.colors) SETTINGS.colors = { ...DEFAULTS.colors, ...remote.colors };
        if (Array.isArray(remote.slider) && remote.slider.length) SETTINGS.slider = remote.slider;
        if (remote.banner) SETTINGS.banner = { ...DEFAULTS.banner, ...remote.banner };
    }

    function loadSiteSettings() {
        fetch('/api/settings', { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(data => {
                mergeSettings(data);
                applyColors(SETTINGS.colors);
                applyBanner(SETTINGS.banner);
                initAdSlider(SETTINGS.slider);
            })
            .catch(() => {
                applyColors(SETTINGS.colors);
                applyBanner(SETTINGS.banner);
                initAdSlider(SETTINGS.slider);
            });
    }

    /* ---------- SLIDER DE ANÚNCIOS ---------- */
    let sliderTimer = null;
    function initAdSlider(slides) {
        const track = document.getElementById('adSliderTrack');
        if (!track) return;
        const dotsContainer = document.getElementById('adSliderDots');
        if (sliderTimer) { clearInterval(sliderTimer); sliderTimer = null; }

        // Limpa e reconstrói
        track.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';

        const list = (Array.isArray(slides) && slides.length) ? slides : DEFAULTS.slider;

        list.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = 'ad-slide';
            div.innerHTML = `
                <div class="ad-slide-icon"><i class="${s.icon || 'fas fa-bullhorn'}"></i></div>
                <div>
                    <div class="ad-slide-title">${s.title || ''}</div>
                    <div class="ad-slide-desc">${s.desc || ''}</div>
                    <a href="#anuncie" class="btn btn-gradient btn-small">${s.cta || 'Anuncie aqui'}</a>
                </div>`;
            track.appendChild(div);
        });

        list.forEach((_, i) => {
            if (!dotsContainer) return;
            const dot = document.createElement('div');
            dot.className = 'ad-slider-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => go(i));
            dotsContainer.appendChild(dot);
        });

        let index = 0;
        function go(i) {
            index = (i + list.length) % list.length;
            track.style.transform = `translateX(-${index * 100}%)`;
            if (dotsContainer) {
                dotsContainer.querySelectorAll('.ad-slider-dot').forEach((d, di) => {
                    d.classList.toggle('active', di === index);
                });
            }
        }
        function next() { go(index + 1); }
        function prev() { go(index - 1); }
        sliderTimer = setInterval(next, 6000);

        const prevBtn = document.getElementById('adSliderPrev');
        const nextBtn = document.getElementById('adSliderNext');
        if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(sliderTimer); next(); sliderTimer = setInterval(next, 6000); });
        if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(sliderTimer); prev(); sliderTimer = setInterval(prev, 6000); });
    }

    /* ---------- FEED DO INSTAGRAM ---------- */
    function renderInstagramFallback() {
        const grid = document.getElementById('igGrid');
        const status = document.getElementById('igStatus');
        if (status) status.textContent = 'Siga @vilavalqueirerj';
        if (!grid) return;
        grid.innerHTML = `
            <a class="ig-empty" href="${CONFIG.instagramUrl || '#'}" target="_blank" rel="noopener" style="text-decoration:none;">
                <i class="fa-brands fa-instagram"></i>
                <p style="font-size:1.05rem;font-weight:700;color:#fff;">Acompanhe @vilavalqueirerj</p>
                <p>O feed será sincronizado automaticamente. Por enquanto, veja tudo direto no Instagram!</p>
            </a>`;
    }

    function loadInstagram() {
        fetch('/api/instagram', { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(data => {
                if (!data.ok || !data.posts || data.posts.length === 0) {
                    renderInstagramFallback();
                    return;
                }
                const grid = document.getElementById('igGrid');
                const status = document.getElementById('igStatus');
                if (status) status.textContent = 'Feed atualizado em tempo real';
                if (!grid) return;
                grid.innerHTML = '';
                data.posts.forEach(post => {
                    const mediaUrl = post.media_type === 'VIDEO'
                        ? (post.thumbnail_url || post.media_url)
                        : (post.media_url || '');
                    if (!mediaUrl) return;
                    const a = document.createElement('a');
                    a.className = 'ig-item';
                    a.href = post.permalink;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    a.innerHTML = `
                        <img src="${mediaUrl}" alt="${(post.caption || 'Vila Valqueire RJ').slice(0, 90)}" loading="lazy">
                        ${post.media_type === 'VIDEO' ? '<span class="ig-item-reel"><i class="fas fa-play"></i> Vídeo</span>' : ''}
                        <div class="ig-item-overlay">
                            ${post.like_count !== undefined ? `<span class="ig-item-likes"><i class="fas fa-heart"></i> ${post.like_count}</span>` : ''}
                        </div>`;
                    grid.appendChild(a);
                });
            })
            .catch(() => renderInstagramFallback());
    }

    /* ---------- FOOTER STICKY / SCROLL TOP ---------- */
    const sticky = document.getElementById('stickyBottomAd');
    const closeSticky = document.getElementById('closeSticky');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (closeSticky && sticky) {
        closeSticky.addEventListener('click', () => sticky.classList.add('hidden'));
    }
    window.addEventListener('scroll', () => {
        if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 500);
        if (sticky && window.scrollY > 900) sticky.classList.add('hidden');
    }, { passive: true });
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ---------- MODAIS (Privacidade / Termos) ---------- */
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-box">
            <button class="modal-close"><i class="fas fa-times"></i></button>
            <h2 id="modalTitle"></h2>
            <div id="modalBody"></div>
        </div>`;
    const showModal = (() => {
        let added = false;
        return (title, bodyHTML) => {
            if (!added) {
                document.body.appendChild(modal);
                modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('show'));
                modal.addEventListener('click', e => {
                    if (e.target === modal) modal.classList.remove('show');
                });
                added = true;
            }
            modal.querySelector('#modalTitle').textContent = title;
            modal.querySelector('#modalBody').innerHTML = bodyHTML;
            modal.classList.add('show');
        };
    })();

    const privacyLink = document.getElementById('privacyLink');
    const termsLink = document.getElementById('termsLink');
    if (privacyLink) {
        privacyLink.addEventListener('click', e => {
            e.preventDefault();
            showModal('Política de Privacidade',
                `<p>Este site é propriedade da ${CONFIG.company || 'JSMuniz Publicidade'}.</p>
                 <p>Coletamos apenas informações necessárias ao funcionamento do site (como clima e estatísticas de acesso anônimas) e dados que você fornece voluntariamente ao entrar em contato pelo WhatsApp ou e-mail.</p>
                 <p>Os anúncios veiculados podem utilizar cookies de terceiros (Google AdSense) para exibir publicidade relevante. Você pode gerenciar suas preferências de cookies diretamente no navegador.</p>
                 <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei.</p>
                 <p>Em caso de dúvidas, fale conosco pelo WhatsApp (21) 2453-4420 ou pelo e-mail ${CONFIG.email || ''}.</p>`);
        });
    }
    if (termsLink) {
        termsLink.addEventListener('click', e => {
            e.preventDefault();
            showModal('Termos de Uso',
                `<p>Ao anunciar conosco, você concorda com a veiculação do seu material nos canais oficiais da ${CONFIG.company || 'JSMuniz Publicidade'} (portal, Instagram e redes sociais).</p>
                 <p>Os contratos de publicidade são acordados previamente, com valores, períodos e formatos definidos em cada pacote.</p>
                 <p>O conteúdo dos anúncios é de responsabilidade do anunciante.</p>
                 <p>Este site é informativo. Para orçamentos e condições, entre em contato pelo WhatsApp (21) 2453-4420.</p>`);
        });
    }

    /* ---------- INICIALIZAÇÃO ---------- */
    applyColors(SETTINGS.colors);
    applyBanner(SETTINGS.banner);
    loadSiteSettings();
    loadInstagram();
})();