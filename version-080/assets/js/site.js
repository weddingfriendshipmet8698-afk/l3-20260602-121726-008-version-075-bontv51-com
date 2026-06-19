import { H as Hls } from './hlsjs-dru42stk.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMenu() {
    const toggle = $('[data-menu-toggle]');
    const nav = $('[data-main-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
}

function initHero() {
    const hero = $('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    let index = 0;

    const setSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
        });
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            setSlide(Number(dot.dataset.heroDot || 0));
        });
    });

    if (slides.length > 1) {
        window.setInterval(() => {
            setSlide(index + 1);
        }, 5600);
    }
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function initFilters() {
    const panel = $('[data-filter-panel]');
    const grid = $('[data-card-grid]');

    if (!panel || !grid) {
        return;
    }

    const searchInput = $('[data-card-search]', panel);
    const categorySelect = $('[data-category-select]', panel);
    const sortSelect = $('[data-sort-select]', panel);
    const countLabel = $('[data-filter-count]', panel);
    const yearButtons = $$('[data-year-filter]', panel);
    const cards = $$('.movie-card', grid);
    let activeYear = 'all';

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
    }

    const apply = () => {
        const query = normalize(searchInput ? searchInput.value : '');
        const category = categorySelect ? categorySelect.value : 'all';
        let visibleCount = 0;

        cards.forEach((card) => {
            const text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.tags,
                card.textContent
            ].join(' '));
            const matchQuery = !query || text.includes(query);
            const matchCategory = category === 'all' || card.dataset.category === category;
            const matchYear = activeYear === 'all' || card.dataset.year === activeYear;
            const isVisible = matchQuery && matchCategory && matchYear;

            card.classList.toggle('is-hidden', !isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (countLabel) {
            countLabel.textContent = `${visibleCount} 部影片`;
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', apply);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', apply);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sortedCards = [...cards].sort((a, b) => {
                const sortValue = sortSelect.value;
                if (sortValue === 'year-asc') {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }
                if (sortValue === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });

            sortedCards.forEach((card) => grid.appendChild(card));
            apply();
        });
    }

    yearButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeYear = button.dataset.yearFilter || 'all';
            yearButtons.forEach((item) => item.classList.toggle('active', item === button));
            apply();
        });
    });

    apply();
}

function initPlayers() {
    $$('[data-player]').forEach((player) => {
        const video = $('video', player);
        const button = $('[data-player-button]', player);

        if (!video || !button) {
            return;
        }

        const start = async () => {
            const source = video.dataset.videoSrc;

            if (!source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            player.classList.add('is-playing');

            try {
                await video.play();
            } catch (error) {
                player.classList.remove('is-playing');
                console.warn('Video playback requires another user gesture.', error);
            }
        };

        button.addEventListener('click', start, { once: true });
    });
}

initMenu();
initHero();
initFilters();
initPlayers();
