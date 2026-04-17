// ========================================
// SCRIPT PARA PÁGINA TURÍSTICA DE AMARGOSA
// ========================================

const root = document.documentElement;
const body = document.body;
const dateNode = document.querySelector('.data');
const hourNode = document.querySelector('.hora');
const resetButton = document.querySelector('.accessibilidade_reset');
const desktopHeader = document.querySelector('.cabecalho');
const mobileHeader = document.querySelector('.menu-mobile');
const menuToggle = document.querySelector('.menu-mobile-hamburger');
const mobileMenu = document.querySelector('.menu-mobile-links');
const mobileMenuBox = document.querySelector('.menu-mobile-links-box');
const desktopMenuButtons = document.querySelector('.menu-btns-campo');
const desktopHamburgerItem = document.querySelector('.menu-btns-campo .menu-sub-campo.hamburger');
const desktopHamburgerButton = document.querySelector('.menu-sub-campo.hamburger .menu-btn');
const desktopHamburgerSubmenu = document.querySelector('.menu-sub-campo.hamburger .submenu_horizontal');
const desktopGalleryDropdownItem = document.querySelector('.menu-sub-campo--dropdown');
const desktopGalleryDropdownButton = desktopGalleryDropdownItem?.querySelector('.menu-btn');
const desktopGalleryDropdownSubmenu = desktopGalleryDropdownItem?.querySelector('.submenu');
const sectionMenuButtons = document.querySelectorAll('.menu-sub-campo--link .menu-btn[data-target], .menu-sub-campo--link .menu-btn[data-url]');
const attractionCardsWithLinks = document.querySelectorAll('.attraction-card[data-url]');
const menuToggleLine01 = menuToggle?.querySelector('.menu-mobile-hamburger-01');
const menuToggleLine02 = menuToggle?.querySelector('.menu-mobile-hamburger-02');
const menuToggleLine03 = menuToggle?.querySelector('.menu-mobile-hamburger-03');
const galleryModal = document.querySelector('#gallery-modal');
const galleryModalTitle = document.querySelector('#gallery-modal-title');
const galleryModalSubtitle = document.querySelector('#gallery-modal-subtitle');
const galleryModalMeta = document.querySelector('#gallery-modal-meta');
const galleryModalStatus = document.querySelector('#gallery-modal-status');
const galleryModalToolbar = document.querySelector('#gallery-modal-toolbar');
const galleryModalBackButton = document.querySelector('#gallery-modal-back');
const galleryModalCollections = document.querySelector('#gallery-modal-collections');
const galleryModalGrid = document.querySelector('#gallery-modal-grid');
const galleryModalPagination = document.querySelector('#gallery-modal-pagination');
const galleryModalPagePrevButton = document.querySelector('#gallery-modal-page-prev');
const galleryModalPageLabel = document.querySelector('#gallery-modal-page-label');
const galleryModalPageNextButton = document.querySelector('#gallery-modal-page-next');
const galleryModalMobilePagination = document.querySelector('#gallery-modal-mobile-pagination');
const galleryModalMobilePagePrevButton = document.querySelector('#gallery-modal-mobile-page-prev');
const galleryModalMobilePageLabel = document.querySelector('#gallery-modal-mobile-page-label');
const galleryModalMobilePageNextButton = document.querySelector('#gallery-modal-mobile-page-next');
const galleryModalPreview = document.querySelector('#gallery-modal-preview');
const galleryModalPreviewImage = document.querySelector('#gallery-modal-preview-image');
const galleryModalPreviewCaption = document.querySelector('#gallery-modal-preview-caption');
const galleryModalPreviewCloseButton = document.querySelector('#gallery-modal-preview-close');
const galleryModalCloseButton = galleryModal?.querySelector('.gallery-modal__close');
const eventGalleryButtons = Array.from(document.querySelectorAll('.event-gallery-button[data-gallery-key]'));
const eventModalOpenButtons = Array.from(document.querySelectorAll('[data-event-modal-open]'));
const carnavalCulturalModal = document.querySelector('#carnaval-cultural-modal');
const carnavalCulturalModalCloseButton = carnavalCulturalModal?.querySelector('.event-modal__close');
const carnavalCulturalModalTriggers = Array.from(document.querySelectorAll('[data-carnaval-cultural-modal-trigger]'));
const saoJoaoModal = document.querySelector('#sao-joao-modal');
const saoJoaoModalCloseButton = saoJoaoModal?.querySelector('.event-modal__close');
const saoJoaoModalTriggers = Array.from(document.querySelectorAll('[data-sao-joao-modal-trigger]'));
const festivalForroModal = document.querySelector('#festival-forro-modal');
const festivalForroModalCloseButton = festivalForroModal?.querySelector('.event-modal__close');
const festivalForroModalTriggers = Array.from(document.querySelectorAll('[data-festival-forro-modal-trigger]'));
const guiaModal = document.querySelector('#guia-modal');
const guiaModalCloseButton = guiaModal?.querySelector('.event-modal__close');
const guiaModalDialog = guiaModal?.querySelector('.event-modal__dialog');
const carnavalCulturalModalFrame = carnavalCulturalModal?.querySelector('.event-modal__frame');
const saoJoaoModalFrame = saoJoaoModal?.querySelector('.event-modal__frame');
const festivalForroModalFrame = festivalForroModal?.querySelector('.event-modal__frame');
const guiaModalFrame = guiaModal?.querySelector('[data-guia-frame]');
const guiaModalPrimaryAction = guiaModal?.querySelector('[data-guia-open-link]');
const guiaModalMapAction = guiaModal?.querySelector('[data-guia-map-link]');
const eventModalFrames = Array.from(document.querySelectorAll('.event-modal__frame'));
const calendarEmbedShell = document.querySelector('.calendar-embed-shell');
const calendarEmbedIframe = document.querySelector('.calendar-embed-iframe');
const eventModalMobileMediaQuery = window.matchMedia('(max-width: 960px)');
const heroCarousel = document.querySelector('.hero-carousel');
const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const heroPrevButton = document.querySelector('[data-hero-control="prev"]');
const heroNextButton = document.querySelector('[data-hero-control="next"]');
const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));

const galleryRuntimeConfig = {
    supabaseUrl: 'https://yfrsruueklqbpycflgmh.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcnNydXVla2xxYnB5Y2ZsZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTM5NDcsImV4cCI6MjA5MDQ2OTk0N30.97NHAR5N8kmNMgq748fQlj-M4Vq0AATk06D6zV2XW5s',
    functionName: 'tourism-gallery',
    desktopPageSize: 36,
    mobilePageSize: 18
};

const galleryCollectionCoverMap = {
    'carnaval-cultural::2026': 'public/images/carnaval-cultural-2026-cover.png',
    'sao-joao::2026': 'public/images/sao-joao-principais-eventos-2026.jpeg',
    'festival-de-forro::2026': 'public/images/festival-forro/palco.jpg'
};

const galleryThemeCards = [
    {
        key: 'carnaval-cultural',
        title: 'Carnaval Cultural',
        subtitle: 'Confira os registros do Carnaval de Amargosa.',
        coverUrl: 'public/images/carnaval-cultural-2026-cover.png'
    },
    {
        key: 'sao-joao',
        title: 'S\u00e3o Jo\u00e3o',
        subtitle: 'Abra a galeria do S\u00e3o Jo\u00e3o de Amargosa.',
        coverUrl: 'public/images/sao-joao-principais-eventos-2026.jpeg'
    },
    {
        key: 'festival-de-forro',
        title: 'Festival de Forr\u00f3',
        subtitle: 'Veja as fotos do Festival de Forr\u00f3.',
        coverUrl: 'public/images/festival-forro/palco.jpg'
    }
];

const GUIDE_MODAL_DEFAULT_SRC = './wifi-publico.html';

const galleryCache = new Map();
const galleryState = {
    galleryKey: null,
    galleryTitle: '',
    gallerySubtitle: '',
    collections: [],
    activeCollection: null,
    albums: [],
    photos: [],
    currentPage: 1,
    selectedIndex: null
};

let lastGalleryTrigger = null;
let lastCarnavalCulturalModalTrigger = null;
let lastSaoJoaoModalTrigger = null;
let lastFestivalForroModalTrigger = null;
let lastGuiaModalTrigger = null;
let heroActiveIndex = heroSlides.findIndex((slide) => slide.classList.contains('is-active'));
let heroAutoplayId = 0;

if (desktopMenuButtons && desktopHamburgerItem) {
    desktopMenuButtons.appendChild(desktopHamburgerItem);
}

function setDesktopHamburgerOpen(isOpen) {
    if (!desktopHamburgerItem || !desktopHamburgerButton) {
        return;
    }

    desktopHamburgerItem.classList.toggle('is-open', isOpen);
    desktopHamburgerButton.setAttribute('aria-expanded', String(isOpen));
}

function copyLinkAttributes(sourceLink, targetLink) {
    ['href', 'target', 'rel', 'aria-disabled'].forEach((attribute) => {
        const value = sourceLink.getAttribute(attribute);

        if (value) {
            targetLink.setAttribute(attribute, value);
        }
    });

    Object.entries(sourceLink.dataset).forEach(([key, value]) => {
        targetLink.dataset[key] = value;
    });
}

function createMobileMenuLink(sourceLink, extraClasses = []) {
    const link = document.createElement('a');

    link.className = ['menu-mobile-links-btn', ...extraClasses].join(' ');
    copyLinkAttributes(sourceLink, link);
    link.textContent = sourceLink.textContent.trim();

    return link;
}

function createMobileThemeToggleButton() {
    const button = document.createElement('button');
    const label = document.createElement('span');
    const icon = document.createElement('span');

    button.type = 'button';
    button.className = 'menu-mobile-links-btn menu-mobile-links-btn--theme-toggle';
    button.dataset.action = 'dark-mode';

    label.className = 'menu-mobile-links-theme-label';
    icon.className = 'menu-mobile-links-theme-icon material-symbols-outlined';

    button.append(label, icon);

    return button;
}

function createMobileMenuDetails(titleText, sourceLinks = []) {
    if (!titleText || !sourceLinks.length) {
        return null;
    }

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const panel = document.createElement('div');
    const linksGrid = document.createElement('div');

    details.className = 'menu-mobile-links-pai menu-mobile-links-pai--submenu';
    panel.className = 'menu-mobile-links-panel';
    linksGrid.className = 'menu-mobile-links-grid';
    summary.textContent = titleText;

    sourceLinks.forEach((sourceLink) => {
        linksGrid.appendChild(createMobileMenuLink(sourceLink));
    });

    panel.appendChild(linksGrid);
    details.append(summary, panel);

    return details;
}

function isIntegratedGuideUrl(url) {
    if (!url) {
        return false;
    }

    try {
        const resolvedUrl = new URL(url, window.location.href);
        return resolvedUrl.origin === window.location.origin && /\/wifi-publico\.html$/i.test(resolvedUrl.pathname);
    } catch (error) {
        return /wifi-publico\.html$/i.test(url);
    }
}

function normalizeGuideModalSource(url) {
    if (!url || !isIntegratedGuideUrl(url)) {
        return GUIDE_MODAL_DEFAULT_SRC;
    }

    try {
        const resolvedUrl = new URL(url, window.location.href);
        return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
    } catch (error) {
        return GUIDE_MODAL_DEFAULT_SRC;
    }
}

function resolveGuideModalSource(trigger = null, fallbackUrl = GUIDE_MODAL_DEFAULT_SRC) {
    if (trigger instanceof Element) {
        const triggerHref = trigger.getAttribute('href') || trigger.dataset.url;

        if (triggerHref) {
            return normalizeGuideModalSource(triggerHref);
        }
    }

    return normalizeGuideModalSource(fallbackUrl);
}

function buildGuideMapActionHref(sourceUrl = GUIDE_MODAL_DEFAULT_SRC) {
    const normalizedSource = normalizeGuideModalSource(sourceUrl);

    try {
        const parsedUrl = new URL(normalizedSource, window.location.href);
        parsedUrl.hash = 'mapa';
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch (error) {
        return `${GUIDE_MODAL_DEFAULT_SRC}#mapa`;
    }
}

function ensureIframeLoaded(frame, nextSource = null) {
    if (!(frame instanceof HTMLIFrameElement)) {
        return false;
    }

    const resolvedSource = nextSource || frame.dataset.src || frame.getAttribute('src');

    if (!resolvedSource) {
        return false;
    }

    if (frame.getAttribute('src') !== resolvedSource) {
        frame.setAttribute('src', resolvedSource);
    }

    return true;
}

function shouldOpenInNewTab(url) {
    if (!url || url.startsWith('#')) {
        return false;
    }

    if (isIntegratedGuideUrl(url)) {
        return false;
    }

    try {
        const resolvedUrl = new URL(url, window.location.href);
        const currentPath = window.location.pathname.replace(/\/index\.html$/i, '/');
        const nextPath = resolvedUrl.pathname.replace(/\/index\.html$/i, '/');

        if (resolvedUrl.origin !== window.location.origin) {
            return true;
        }

        return nextPath !== currentPath;
    } catch (error) {
        return /^(https?:|mailto:|tel:)/i.test(url);
    }
}

function applyNewTabToRedirectLinks(rootElement = document) {
    rootElement.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');

        if (!shouldOpenInNewTab(href)) {
            return;
        }

        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}

function openMenuUrl(url) {
    if (!url) {
        return;
    }

    if (isIntegratedGuideUrl(url)) {
        openGuiaModal(document.activeElement instanceof Element ? document.activeElement : null, url);
        return;
    }

    if (shouldOpenInNewTab(url)) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
    }

    window.location.assign(url);
}

function createMobileMenuShortcut(button) {
    const label = button.querySelector('.menu-btn-nome')?.textContent.trim();
    const targetSelector = button.dataset.target;
    const targetUrl = button.dataset.url;

    if (!label) {
        return null;
    }

    if (targetUrl) {
        const mobileLink = document.createElement('a');

        mobileLink.className = 'menu-mobile-links-btn menu-mobile-links-btn--atalho';
        mobileLink.setAttribute('href', targetUrl);

        if (shouldOpenInNewTab(targetUrl)) {
            mobileLink.setAttribute('target', '_blank');
            mobileLink.setAttribute('rel', 'noopener noreferrer');
        }

        mobileLink.textContent = label;

        return mobileLink;
    }

    if (targetSelector) {
        const mobileLink = document.createElement('a');

        mobileLink.className = 'menu-mobile-links-btn menu-mobile-links-btn--atalho';
        mobileLink.setAttribute('href', targetSelector);
        mobileLink.textContent = label;

        return mobileLink;
    }

    return null;
}

function buildMobileMenuFromDesktop() {
    if (!mobileMenuBox) {
        return;
    }

    mobileMenuBox.replaceChildren();

    if (desktopHamburgerSubmenu) {
        const linksPanel = document.createElement('div');
        linksPanel.className = 'menu-mobile-links-panel menu-mobile-links-panel--simple';

        desktopHamburgerSubmenu.querySelectorAll('.submenu_horizontal-btn a').forEach((sourceLink) => {
            linksPanel.appendChild(createMobileMenuLink(sourceLink));
        });

        mobileMenuBox.appendChild(linksPanel);
    }
}

function setMobileMenuOpen(isOpen) {
    if (!mobileMenu || !menuToggle) {
        return;
    }

    mobileMenu.classList.toggle('menu-mobile-links-on', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    body.classList.toggle('menu-mobile-open', isOpen);
    menuToggleLine01?.classList.toggle('menu-mobile-hamburger-01-on', isOpen);
    menuToggleLine02?.classList.toggle('menu-mobile-hamburger-02-on', isOpen);
    menuToggleLine03?.classList.toggle('menu-mobile-hamburger-03-on', isOpen);
}

function getScrollOffset() {
    if (!mobileHeader || window.getComputedStyle(mobileHeader).display === 'none') {
        return 0;
    }

    return mobileHeader.offsetHeight + 16;
}

buildMobileMenuFromDesktop();
applyNewTabToRedirectLinks();

function setHeroSlide(nextIndex) {
    if (!heroSlides.length) {
        return;
    }

    heroActiveIndex = heroActiveIndex >= 0 ? heroActiveIndex : 0;
    heroActiveIndex = (nextIndex + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, index) => {
        const isActive = index === heroActiveIndex;

        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));

        if (slide.matches('a')) {
            slide.tabIndex = isActive ? 0 : -1;
        } else {
            slide.removeAttribute('tabindex');
        }
    });

    heroDots.forEach((dot, index) => {
        const isActive = index === heroActiveIndex;

        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-pressed', String(isActive));
    });
}

function stopHeroAutoplay() {
    if (!heroAutoplayId) {
        return;
    }

    window.clearInterval(heroAutoplayId);
    heroAutoplayId = 0;
}

function startHeroAutoplay() {
    if (!heroCarousel || heroSlides.length < 2 || heroAutoplayId) {
        return;
    }

    heroAutoplayId = window.setInterval(() => {
        setHeroSlide(heroActiveIndex + 1);
    }, 6500);
}

function resetHeroAutoplay() {
    stopHeroAutoplay();
    startHeroAutoplay();
}

if (heroCarousel && heroSlides.length) {
    setHeroSlide(heroActiveIndex >= 0 ? heroActiveIndex : 0);
}

if (heroCarousel && heroSlides.length > 1) {
    heroPrevButton?.addEventListener('click', (event) => {
        event.preventDefault();
        setHeroSlide(heroActiveIndex - 1);
        resetHeroAutoplay();
    });

    heroNextButton?.addEventListener('click', (event) => {
        event.preventDefault();
        setHeroSlide(heroActiveIndex + 1);
        resetHeroAutoplay();
    });

    heroDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const nextIndex = Number(dot.dataset.heroDot);

            if (Number.isNaN(nextIndex)) {
                return;
            }

            setHeroSlide(nextIndex);
            resetHeroAutoplay();
        });
    });

    let heroTouchStartX = 0;
    let heroTouchStartY = 0;
    let heroSwipeSuppressClick = false;

    heroCarousel.addEventListener('touchstart', (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) {
            return;
        }

        heroTouchStartX = touch.clientX;
        heroTouchStartY = touch.clientY;
        heroSwipeSuppressClick = false;
        stopHeroAutoplay();
    }, { passive: true });

    heroCarousel.addEventListener('touchend', (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        if (!touch) {
            startHeroAutoplay();
            return;
        }

        const deltaX = touch.clientX - heroTouchStartX;
        const deltaY = touch.clientY - heroTouchStartY;
        const isHorizontalSwipe = Math.abs(deltaX) > 44 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

        if (isHorizontalSwipe) {
            heroSwipeSuppressClick = true;
            setHeroSlide(heroActiveIndex + (deltaX < 0 ? 1 : -1));
            window.setTimeout(() => {
                heroSwipeSuppressClick = false;
            }, 250);
        }

        resetHeroAutoplay();
    }, { passive: true });

    heroCarousel.addEventListener('click', (event) => {
        if (!heroSwipeSuppressClick) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    }, true);

    heroCarousel.addEventListener('mouseenter', stopHeroAutoplay);
    heroCarousel.addEventListener('mouseleave', startHeroAutoplay);
    heroCarousel.addEventListener('focusin', stopHeroAutoplay);
    heroCarousel.addEventListener('focusout', (event) => {
        if (heroCarousel.contains(event.relatedTarget)) {
            return;
        }

        startHeroAutoplay();
    });

    heroCarousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setHeroSlide(heroActiveIndex - 1);
            resetHeroAutoplay();
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            setHeroSlide(heroActiveIndex + 1);
            resetHeroAutoplay();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopHeroAutoplay();
            return;
        }

        startHeroAutoplay();
    });

    startHeroAutoplay();
}

function smoothScrollTo(targetSelector) {
    if (!targetSelector || targetSelector === '#') {
        return;
    }

    const target = document.querySelector(targetSelector);

    if (!target) {
        return;
    }

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();

    window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
    });
}

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (event) {
        const targetSelector = this.getAttribute('href');

        if (this.dataset.galleryKey || this.dataset.galleryHub !== undefined) {
            return;
        }

        event.preventDefault();
        smoothScrollTo(targetSelector);
    });
});

sectionMenuButtons.forEach((button) => {
    button.addEventListener('click', () => {
        if (button.dataset.url) {
            openMenuUrl(button.dataset.url);
            return;
        }

        smoothScrollTo(button.dataset.target);
    });
});

attractionCardsWithLinks.forEach((card) => {
    const targetUrl = card.dataset.url;

    if (!targetUrl) {
        return;
    }

    card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) {
            return;
        }

        openMenuUrl(targetUrl);
    });

    card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        openMenuUrl(targetUrl);
    });
});

if (desktopHamburgerItem && desktopHamburgerButton && desktopHamburgerSubmenu) {
    desktopHamburgerButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDesktopHamburgerOpen(!desktopHamburgerItem.classList.contains('is-open'));
    });

    desktopHamburgerSubmenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            setDesktopHamburgerOpen(false);
        });
    });

    document.addEventListener('click', (event) => {
        if (!desktopHamburgerItem.contains(event.target)) {
            setDesktopHamburgerOpen(false);
        }
    });
}

// Animação de entrada para elementos
const revealTargets = document.querySelectorAll('.attraction-card, .calendar-event, .info-card, .stat-card, .gallery-item');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
            currentObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    document.querySelectorAll('.attraction-card, .calendar-event, .info-card, .stat-card').forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
} else {
    revealTargets.forEach((item) => {
        item.style.opacity = '1';
        item.style.transform = 'none';
    });
}

// Relógio do cabeçalho
function updateClock() {
    const now = new Date();

    if (dateNode) {
        dateNode.textContent = `${new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(now)} `;
    }

    if (hourNode) {
        hourNode.textContent = new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(now);
    }
}

updateClock();
window.setInterval(updateClock, 1000);

// Acessibilidade
let fontScale = Number(localStorage.getItem('amargosa-font-scale')) || 1;

function applyFontScale() {
    root.style.fontSize = `${fontScale * 100}%`;

    if (resetButton) {
        resetButton.classList.toggle('on', Math.abs(fontScale - 1) > 0.01);
    }

    localStorage.setItem('amargosa-font-scale', String(fontScale));
}

function setDarkMode(enabled) {
    body.classList.toggle('modo_escuro', enabled);
    localStorage.setItem('amargosa-dark-mode', enabled ? 'on' : 'off');
    updateMobileThemeToggleButton();
}

function updateMobileThemeToggleButton() {
    const isDarkMode = body.classList.contains('modo_escuro');

    document.querySelectorAll('.menu-mobile-links-btn--theme-toggle').forEach((button) => {
        const label = button.querySelector('.menu-mobile-links-theme-label');
        const icon = button.querySelector('.menu-mobile-links-theme-icon');

        if (label) {
            label.textContent = isDarkMode ? 'Modo claro' : 'Modo escuro';
        }

        if (icon) {
            icon.textContent = isDarkMode ? 'light_mode' : 'dark_mode';
        }

        button.setAttribute('aria-label', isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro');
        button.setAttribute('title', isDarkMode ? 'Modo claro' : 'Modo escuro');
    });
}

applyFontScale();
setDarkMode(localStorage.getItem('amargosa-dark-mode') === 'on');

document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;

        if (action === 'increase-font') {
            fontScale = Math.min(1.2, +(fontScale + 0.05).toFixed(2));
            applyFontScale();
            return;
        }

        if (action === 'decrease-font') {
            fontScale = Math.max(0.9, +(fontScale - 0.05).toFixed(2));
            applyFontScale();
            return;
        }

        if (action === 'reset-font') {
            fontScale = 1;
            applyFontScale();
            return;
        }

        if (action === 'dark-mode') {
            setDarkMode(!body.classList.contains('modo_escuro'));
        }
    });
});

// Menu mobile
if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        setMobileMenuOpen(!mobileMenu.classList.contains('menu-mobile-links-on'));
    });

    mobileMenu.addEventListener('click', (event) => {
        if (!event.target.closest('a')) {
            return;
        }

        setMobileMenuOpen(false);
    });

    document.addEventListener('click', (event) => {
        if (!mobileMenu.classList.contains('menu-mobile-links-on')) {
            return;
        }

        if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            setMobileMenuOpen(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1279) {
            setMobileMenuOpen(false);
        }
    });
}

// Sombra do cabeçalho no scroll
window.addEventListener('scroll', () => {
    const shadowValue = window.pageYOffset > 100
        ? '0 8px 16px rgba(0, 0, 0, 0.2)'
        : '';

    if (desktopHeader) {
        desktopHeader.style.boxShadow = shadowValue;
    }

    if (mobileHeader) {
        mobileHeader.style.boxShadow = shadowValue || '0 8px 24px rgba(0, 0, 0, 0.2)';
    }
});

// Efeito de hover nas imagens da galeria
document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.05)';
    });

    item.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1)';
    });
});

// Contador de visitantes (simulado)
function initVisitorCounter() {
    let visitors = localStorage.getItem('amargosaVisitors') || 0;
    visitors = parseInt(visitors, 10) + 1;
    localStorage.setItem('amargosaVisitors', visitors);
    console.log(`Visitantes desta sessão: ${visitors}`);
}

initVisitorCounter();

// Função para voltar ao topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.scrollToTop = scrollToTop;

// Função para carregar mais imagens (se necessário)
let currentImagePage = 1;

function loadMoreImages() {
    currentImagePage += 1;
    console.log(`Carregando página ${currentImagePage} de imagens`);
}

window.loadMoreImages = loadMoreImages;

function resetGalleryPreview(shouldRenderGrid = true) {
    galleryState.selectedIndex = null;

    if (galleryModalPreview) {
        galleryModalPreview.hidden = true;
    }

    if (galleryModalPreviewImage) {
        galleryModalPreviewImage.removeAttribute('src');
        galleryModalPreviewImage.alt = '';
    }

    if (galleryModalPreviewCaption) {
        galleryModalPreviewCaption.textContent = '';
        galleryModalPreviewCaption.hidden = true;
    }

    if (shouldRenderGrid && galleryModal && !galleryModal.hidden && galleryState.activeCollection) {
        renderGalleryGrid();
    }
}

function setGalleryStatus(message = '', type = 'info') {
    if (!galleryModalStatus) {
        return;
    }

    galleryModalStatus.textContent = message;
    galleryModalStatus.hidden = !message;
    galleryModalStatus.classList.toggle('is-error', type === 'error');
}

function syncGalleryHeader() {
    if (!galleryModalTitle || !galleryModalSubtitle) {
        return;
    }

    const activeCollection = galleryState.activeCollection;
    const subtitleText = activeCollection ? '' : (galleryState.gallerySubtitle || 'Escolha uma colecao.');

    if (galleryModal) {
        if (galleryState.galleryKey) {
            galleryModal.dataset.galleryTheme = galleryState.galleryKey;
        } else {
            delete galleryModal.dataset.galleryTheme;
        }
    }

    galleryModalTitle.textContent = activeCollection?.title || galleryState.galleryTitle || 'Galeria';
    galleryModalSubtitle.textContent = subtitleText;
    galleryModalSubtitle.hidden = !subtitleText;
}

function getGalleryDisplayLabel() {
    return galleryState.activeCollection?.title || galleryState.galleryTitle || 'galeria';
}

function getGalleryPageSize() {
    return window.matchMedia('(max-width: 768px)').matches
        ? galleryRuntimeConfig.mobilePageSize
        : galleryRuntimeConfig.desktopPageSize;
}

function getGalleryTriggerLabel(trigger) {
    if (!(trigger instanceof Element)) {
        return 'galeria';
    }

    return trigger.getAttribute('aria-label')?.trim()
        || trigger.querySelector('.gallery-name-card__title')?.textContent?.trim()
        || trigger.textContent?.trim()
        || 'galeria';
}

function getGalleryCollectionCover(collection) {
    if (!galleryState.galleryKey || !collection?.key) {
        return '';
    }

    return galleryCollectionCoverMap[`${galleryState.galleryKey}::${collection.key}`] || '';
}

function getGalleryThemeCard(galleryKey) {
    return galleryThemeCards.find((theme) => theme.key === galleryKey) || null;
}

function getGalleryCollectionCoverByGalleryKey(galleryKey, collection) {
    if (!galleryKey || !collection?.key) {
        return '';
    }

    return galleryCollectionCoverMap[`${galleryKey}::${collection.key}`] || '';
}

function getPreferredGalleryCollection(collections = []) {
    if (!Array.isArray(collections) || !collections.length) {
        return null;
    }

    const parseCollectionYear = (collection) => {
        const rawYear = String(collection?.yearLabel || collection?.key || '');
        const match = rawYear.match(/\d{4}/);

        return match ? Number.parseInt(match[0], 10) : Number.NEGATIVE_INFINITY;
    };

    return [...collections].sort((collectionA, collectionB) => {
        const yearA = parseCollectionYear(collectionA);
        const yearB = parseCollectionYear(collectionB);

        if (yearA === yearB) {
            return String(collectionB?.key || '').localeCompare(String(collectionA?.key || ''));
        }

        return yearB - yearA;
    })[0];
}

function formatGalleryPhotoCount(photoCount) {
    if (typeof photoCount !== 'number' || Number.isNaN(photoCount) || photoCount < 0) {
        return 'fotos';
    }

    return `${photoCount} ${photoCount === 1 ? 'foto' : 'fotos'}`;
}

function hydrateEventGalleryButton(button, payload = null) {
    if (!(button instanceof HTMLElement)) {
        return;
    }

    const yearNode = button.querySelector('.event-gallery-button__year');
    const countNode = button.querySelector('.event-gallery-button__count');
    const coverNode = button.querySelector('.event-gallery-button__cover img');
    const galleryKey = button.dataset.galleryKey;
    const fallbackYear = button.dataset.fallbackYear || '2026';
    const fallbackCover = button.dataset.galleryCover || coverNode?.getAttribute('src') || '';
    const preferredCollection = getPreferredGalleryCollection(payload?.collections || []);
    const coverFromCollection = getGalleryCollectionCoverByGalleryKey(galleryKey, preferredCollection);

    if (yearNode) {
        yearNode.textContent = preferredCollection?.yearLabel || preferredCollection?.key || fallbackYear;
    }

    if (countNode) {
        countNode.textContent = formatGalleryPhotoCount(preferredCollection?.photoCount);
    }

    if (coverNode) {
        coverNode.src = coverFromCollection || fallbackCover;
    }
}

async function initEventGalleryButtons() {
    if (!eventGalleryButtons.length) {
        return;
    }

    eventGalleryButtons.forEach((button) => hydrateEventGalleryButton(button));

    await Promise.all(eventGalleryButtons.map(async (button) => {
        try {
            const payload = await fetchGalleryData(button.dataset.galleryKey);

            hydrateEventGalleryButton(button, payload);
        } catch (error) {
            hydrateEventGalleryButton(button);
        }
    }));
}

function renderGalleryMeta() {
    if (!galleryModalMeta) {
        return;
    }

    galleryModalMeta.replaceChildren();
}

function syncGalleryToolbar() {
    if (!galleryModalToolbar || !galleryModalBackButton) {
        return;
    }

    const isHubView = !galleryState.galleryKey;

    galleryModalToolbar.hidden = isHubView;
    galleryModalBackButton.hidden = isHubView;
    galleryModalBackButton.textContent = galleryState.activeCollection
        ? 'Escolher outro ano'
        : 'Escolher outro evento';
}

function getGalleryPageCount() {
    if (!galleryState.activeCollection || !galleryState.photos.length) {
        return 0;
    }

    return Math.max(1, Math.ceil(galleryState.photos.length / getGalleryPageSize()));
}

function syncPaginationControls(container, prevButton, labelNode, nextButton, totalPages) {
    if (!container || !prevButton || !labelNode || !nextButton) {
        return;
    }

    if (!totalPages) {
        container.hidden = true;
        return;
    }

    container.hidden = false;
    labelNode.textContent = `Pagina ${galleryState.currentPage} de ${totalPages}`;
    prevButton.disabled = galleryState.currentPage === 1;
    nextButton.disabled = galleryState.currentPage === totalPages;
}

function renderGalleryPagination() {
    const totalPages = getGalleryPageCount();

    if (!totalPages) {
        syncPaginationControls(galleryModalPagination, galleryModalPagePrevButton, galleryModalPageLabel, galleryModalPageNextButton, 0);
        syncPaginationControls(galleryModalMobilePagination, galleryModalMobilePagePrevButton, galleryModalMobilePageLabel, galleryModalMobilePageNextButton, 0);
        return;
    }

    galleryState.currentPage = Math.min(Math.max(galleryState.currentPage || 1, 1), totalPages);
    syncPaginationControls(galleryModalPagination, galleryModalPagePrevButton, galleryModalPageLabel, galleryModalPageNextButton, totalPages);
    syncPaginationControls(galleryModalMobilePagination, galleryModalMobilePagePrevButton, galleryModalMobilePageLabel, galleryModalMobilePageNextButton, totalPages);
}

function changeGalleryPage(direction) {
    const totalPages = getGalleryPageCount();

    if (!totalPages) {
        return;
    }

    const nextPage = Math.min(Math.max((galleryState.currentPage || 1) + direction, 1), totalPages);

    if (nextPage === galleryState.currentPage) {
        return;
    }

    galleryState.currentPage = nextPage;
    resetGalleryPreview(false);
    renderGalleryGrid();
    galleryModalGrid?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function renderGalleryCollections() {
    if (!galleryModalCollections) {
        return;
    }

    galleryModalCollections.replaceChildren();
    syncGalleryToolbar();

    if (!galleryState.galleryKey) {
        galleryModalCollections.hidden = false;

        galleryThemeCards.forEach((theme) => {
            const button = document.createElement('button');
            const title = document.createElement('span');
            const subtitle = document.createElement('span');
            const cover = document.createElement('span');
            const image = document.createElement('img');

            button.type = 'button';
            button.className = 'gallery-modal__theme';
            button.dataset.galleryThemeKey = theme.key;
            button.setAttribute('aria-label', `Abrir galeria de ${theme.title}`);

            title.className = 'gallery-modal__theme-title';
            subtitle.className = 'gallery-modal__theme-subtitle';
            cover.className = 'gallery-modal__theme-cover';

            title.textContent = theme.title;
            subtitle.textContent = theme.subtitle;
            image.src = theme.coverUrl;
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';

            cover.appendChild(image);
            button.append(title, subtitle, cover);
            galleryModalCollections.appendChild(button);
        });
        return;
    }

    galleryModalCollections.hidden = !!galleryState.activeCollection || !galleryState.collections.length;

    if (galleryModalCollections.hidden) {
        return;
    }

    galleryState.collections.forEach((collection) => {
        const button = document.createElement('button');
        const topRow = document.createElement('div');
        const yearTag = document.createElement('span');
        const meta = document.createElement('span');
        const cover = document.createElement('div');
        const coverUrl = getGalleryCollectionCover(collection);

        button.type = 'button';
        button.className = 'gallery-modal__collection';
        button.dataset.galleryCollectionKey = collection.key;

        topRow.className = 'gallery-modal__collection-top';
        yearTag.className = 'gallery-modal__collection-year';
        meta.className = 'gallery-modal__collection-meta';
        cover.className = 'gallery-modal__collection-cover';

        yearTag.textContent = collection.yearLabel || collection.key;
        meta.textContent = typeof collection.photoCount === 'number'
            ? `${collection.photoCount} fotos`
            : 'Fotos indisponiveis';

        if (coverUrl) {
            const coverImage = document.createElement('img');

            button.classList.add('gallery-modal__collection--with-cover');
            coverImage.loading = 'lazy';
            coverImage.decoding = 'async';
            coverImage.src = coverUrl;
            coverImage.alt = `Capa de ${collection.yearLabel || collection.key}`;
            cover.appendChild(coverImage);
            cover.classList.add('has-image');
        }

        topRow.append(yearTag, meta);
        button.append(topRow, cover);
        galleryModalCollections.appendChild(button);
    });
}

function renderGalleryGrid() {
    if (!galleryModalGrid) {
        return;
    }

    galleryModalGrid.replaceChildren();
    galleryModalGrid.hidden = !galleryState.activeCollection || !galleryState.photos.length;

    if (galleryModalGrid.hidden) {
        renderGalleryPagination();
        return;
    }

    const pageSize = getGalleryPageSize();
    const startIndex = ((galleryState.currentPage || 1) - 1) * pageSize;
    const pagePhotos = galleryState.photos.slice(startIndex, startIndex + pageSize);

    pagePhotos.forEach((photo, index) => {
        const thumbButton = document.createElement('button');
        const image = document.createElement('img');
        const photoIndex = startIndex + index;

        thumbButton.type = 'button';
        thumbButton.className = 'gallery-modal__thumb';
        thumbButton.dataset.galleryPhotoIndex = String(photoIndex);
        thumbButton.setAttribute('aria-label', photo.title ? `Abrir foto: ${photo.title}` : 'Abrir foto');

        if (galleryState.selectedIndex === photoIndex) {
            thumbButton.classList.add('is-selected');
        }

        image.loading = 'lazy';
        image.decoding = 'async';
        image.src = photo.thumbUrl;
        image.alt = photo.title || `Foto de ${getGalleryDisplayLabel()}`;

        thumbButton.appendChild(image);
        galleryModalGrid.appendChild(thumbButton);
    });

    renderGalleryPagination();
}

function showGalleryPreview(index) {
    const photo = galleryState.photos[index];

    if (!photo || !galleryModalPreview || !galleryModalPreviewImage || !galleryModalPreviewCaption) {
        return;
    }

    galleryState.selectedIndex = index;
    galleryModalPreview.hidden = false;
    galleryModalPreviewImage.src = photo.imageUrl;
    galleryModalPreviewImage.alt = photo.title || `Foto ampliada de ${getGalleryDisplayLabel()}`;
    galleryModalPreviewCaption.textContent = '';
    galleryModalPreviewCaption.hidden = true;

    renderGalleryGrid();
    galleryModalPreview.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function closeGalleryModal() {
    if (!galleryModal || galleryModal.hidden) {
        return;
    }

    galleryModal.hidden = true;
    body.classList.remove('gallery-modal-open');
    resetGalleryPreview();
    lastGalleryTrigger?.focus?.();
}

function getFrameDocumentHeight(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow?.document;

    if (!frameDocument) {
        return 0;
    }

    const { body: frameBody, documentElement } = frameDocument;

    return Math.max(
        frameBody?.scrollHeight || 0,
        documentElement?.scrollHeight || 0,
        frameBody?.offsetHeight || 0,
        documentElement?.offsetHeight || 0
    );
}

function syncEventModalFrameHeights() {
    const shouldUseSingleScroll = eventModalMobileMediaQuery.matches;

    eventModalFrames.forEach((frame) => {
        if (!shouldUseSingleScroll) {
            frame.style.removeProperty('height');
            frame.removeAttribute('scrolling');
            return;
        }

        try {
            const frameHeight = getFrameDocumentHeight(frame);

            if (frameHeight > 0) {
                frame.style.height = `${frameHeight}px`;
                frame.setAttribute('scrolling', 'no');
            }
        } catch (error) {
            frame.style.removeProperty('height');
            frame.removeAttribute('scrolling');
        }
    });
}

function queueEventModalFrameSync() {
    window.requestAnimationFrame(() => {
        syncEventModalFrameHeights();
        window.setTimeout(syncEventModalFrameHeights, 200);
    });
}

function initGuiaModalFrameScrollBridge() {
    if (!(guiaModalFrame instanceof HTMLIFrameElement) || !guiaModalDialog) {
        return;
    }

    const frameDocument = guiaModalFrame.contentDocument || guiaModalFrame.contentWindow?.document;

    if (!frameDocument || frameDocument.documentElement.dataset.guiaScrollBridge === 'true') {
        return;
    }

    frameDocument.documentElement.dataset.guiaScrollBridge = 'true';

    let lastTouchY = 0;

    frameDocument.addEventListener('touchstart', (event) => {
        lastTouchY = event.touches?.[0]?.clientY || 0;
    }, { passive: true });

    frameDocument.addEventListener('touchmove', (event) => {
        // No desktop, o iframe deve rolar normalmente sem mover o container do modal.
        if (guiaModal?.hidden || !eventModalMobileMediaQuery.matches) {
            return;
        }

        const nextTouchY = event.touches?.[0]?.clientY || lastTouchY;
        const deltaY = lastTouchY - nextTouchY;

        if (Math.abs(deltaY) < 1) {
            return;
        }

        guiaModalDialog.scrollTop += deltaY;
        lastTouchY = nextTouchY;
        event.preventDefault();
    }, { passive: false });

    frameDocument.addEventListener('wheel', (event) => {
        // Mantém o modal estático no desktop; no mobile o scroll fica unificado no modal.
        if (guiaModal?.hidden || !eventModalMobileMediaQuery.matches) {
            return;
        }

        guiaModalDialog.scrollTop += event.deltaY;
        event.preventDefault();
    }, { passive: false });
}

function closeOpenEventModals() {
    closeCarnavalCulturalModal();
    closeSaoJoaoModal();
    closeFestivalForroModal();
    closeGuiaModal();
}

function openCarnavalCulturalModal(trigger = null) {
    if (!carnavalCulturalModal) {
        return;
    }

    if (trigger instanceof Element && !carnavalCulturalModal.contains(trigger)) {
        lastCarnavalCulturalModalTrigger = trigger;
    }

    ensureIframeLoaded(carnavalCulturalModalFrame);
    carnavalCulturalModal.hidden = false;
    body.classList.add('carnaval-cultural-modal-open');
    carnavalCulturalModalCloseButton?.focus();
    queueEventModalFrameSync();
}

function closeCarnavalCulturalModal() {
    if (!carnavalCulturalModal || carnavalCulturalModal.hidden) {
        return;
    }

    carnavalCulturalModal.hidden = true;
    body.classList.remove('carnaval-cultural-modal-open');
    lastCarnavalCulturalModalTrigger?.focus?.();
}

function openEventModalByKey(eventKey, trigger = null) {
    if (eventKey === 'carnaval-cultural') {
        openCarnavalCulturalModal(trigger);
        return;
    }

    if (eventKey === 'sao-joao') {
        openSaoJoaoModal(trigger);
        return;
    }

    if (eventKey === 'festival-de-forro') {
        openFestivalForroModal(trigger);
        return;
    }

    if (eventKey === 'guia-turista') {
        openGuiaModal(trigger);
    }
}

function openGuiaModal(trigger = null, sourceUrl = GUIDE_MODAL_DEFAULT_SRC) {
    if (!guiaModal) {
        return;
    }

    const nextSourceUrl = resolveGuideModalSource(trigger, sourceUrl);

    if (trigger instanceof Element && !guiaModal.contains(trigger)) {
        lastGuiaModalTrigger = trigger;
    }

    ensureIframeLoaded(guiaModalFrame, nextSourceUrl);

    if (guiaModalPrimaryAction) {
        guiaModalPrimaryAction.setAttribute('href', nextSourceUrl);
    }

    if (guiaModalMapAction) {
        guiaModalMapAction.setAttribute('href', buildGuideMapActionHref(nextSourceUrl));
    }
    guiaModal.hidden = false;
    body.classList.add('guia-modal-open');
    guiaModalCloseButton?.focus();
    queueEventModalFrameSync();
    window.setTimeout(initGuiaModalFrameScrollBridge, 250);
}

function closeGuiaModal() {
    if (!guiaModal || guiaModal.hidden) {
        return;
    }

    guiaModal.hidden = true;
    body.classList.remove('guia-modal-open');
    lastGuiaModalTrigger?.focus?.();
}

function openSaoJoaoModal(trigger = null) {
    if (!saoJoaoModal) {
        return;
    }

    if (trigger instanceof Element && !saoJoaoModal.contains(trigger)) {
        lastSaoJoaoModalTrigger = trigger;
    }

    ensureIframeLoaded(saoJoaoModalFrame);
    saoJoaoModal.hidden = false;
    body.classList.add('sao-joao-modal-open');
    saoJoaoModalCloseButton?.focus();
    queueEventModalFrameSync();
}

function closeSaoJoaoModal() {
    if (!saoJoaoModal || saoJoaoModal.hidden) {
        return;
    }

    saoJoaoModal.hidden = true;
    body.classList.remove('sao-joao-modal-open');
    lastSaoJoaoModalTrigger?.focus?.();
}

function openFestivalForroModal(trigger = null) {
    if (!festivalForroModal) {
        return;
    }

    if (trigger instanceof Element && !festivalForroModal.contains(trigger)) {
        lastFestivalForroModalTrigger = trigger;
    }

    ensureIframeLoaded(festivalForroModalFrame);
    festivalForroModal.hidden = false;
    body.classList.add('festival-forro-modal-open');
    festivalForroModalCloseButton?.focus();
    queueEventModalFrameSync();
}

function closeFestivalForroModal() {
    if (!festivalForroModal || festivalForroModal.hidden) {
        return;
    }

    festivalForroModal.hidden = true;
    body.classList.remove('festival-forro-modal-open');
    lastFestivalForroModalTrigger?.focus?.();
}

function showGalleryModalShell() {
    if (!galleryModal) {
        return;
    }

    galleryModal.hidden = false;
    body.classList.add('gallery-modal-open');
    galleryModalCloseButton?.focus();
}

async function parseErrorMessage(response) {
    const fallbackMessage = `Nao foi possivel carregar a galeria agora. Verifique se a funcao ${galleryRuntimeConfig.functionName} foi publicada no Supabase e se o secret FLICKR_API_KEY foi configurado.`;

    try {
        const payload = await response.json();
        return payload.error || fallbackMessage;
    } catch (error) {
        return fallbackMessage;
    }
}

function getGalleryCacheKey(galleryKey, collectionKey = '') {
    return collectionKey ? `${galleryKey}::${collectionKey}` : `${galleryKey}::overview`;
}

async function fetchGalleryData(galleryKey, collectionKey = '') {
    const cacheKey = getGalleryCacheKey(galleryKey, collectionKey);

    if (galleryCache.has(cacheKey)) {
        return galleryCache.get(cacheKey);
    }

    const response = await fetch(`${galleryRuntimeConfig.supabaseUrl}/functions/v1/${galleryRuntimeConfig.functionName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: galleryRuntimeConfig.supabaseAnonKey,
            Authorization: `Bearer ${galleryRuntimeConfig.supabaseAnonKey}`
        },
        body: JSON.stringify({
            galleryKey,
            collectionKey
        })
    });

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }

    const payload = await response.json();

    galleryCache.set(cacheKey, payload);

    return payload;
}

function resetGalleryCollectionState() {
    galleryState.activeCollection = null;
    galleryState.albums = [];
    galleryState.photos = [];
    galleryState.currentPage = 1;
    galleryState.selectedIndex = null;
    resetGalleryPreview();
}

function clearGalleryHashFromUrl() {
    const url = new URL(window.location.href);

    if (url.hash !== '#galeria') {
        return;
    }

    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

function openGalleryHub(trigger = null) {
    if (!galleryModal) {
        return;
    }

    if (trigger instanceof Element && !galleryModal.contains(trigger)) {
        lastGalleryTrigger = trigger;
    }

    showGalleryModalShell();
    galleryState.galleryKey = null;
    galleryState.galleryTitle = 'Galeria de Fotos';
    galleryState.gallerySubtitle = 'Escolha um evento para abrir a galeria.';
    galleryState.collections = [];
    resetGalleryCollectionState();
    galleryModalMeta?.replaceChildren();
    syncGalleryHeader();
    renderGalleryMeta();
    renderGalleryCollections();
    renderGalleryGrid();
    setGalleryStatus('');
    clearGalleryHashFromUrl();
}

function initEventModalOpenButtons() {
    eventModalOpenButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openEventModalByKey(button.dataset.eventModalOpen, button);
        });
    });
}

function initCarnavalCulturalModal() {
    if (!carnavalCulturalModal || !carnavalCulturalModalTriggers.length) {
        return;
    }

    carnavalCulturalModalTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            if (event.target.closest('a, button')) {
                return;
            }

            openCarnavalCulturalModal(trigger);
        });

        trigger.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            openCarnavalCulturalModal(trigger);
        });
    });

    carnavalCulturalModal.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        if (event.target.closest('[data-carnaval-cultural-modal-close]')) {
            closeCarnavalCulturalModal();
        }
    });
}

function initSaoJoaoModal() {
    if (!saoJoaoModal || !saoJoaoModalTriggers.length) {
        return;
    }

    saoJoaoModalTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            if (event.target.closest('a, button')) {
                return;
            }

            openSaoJoaoModal(trigger);
        });

        trigger.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            openSaoJoaoModal(trigger);
        });
    });

    saoJoaoModal.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        if (event.target.closest('[data-sao-joao-modal-close]')) {
            closeSaoJoaoModal();
        }
    });
}

function initFestivalForroModal() {
    if (!festivalForroModal || !festivalForroModalTriggers.length) {
        return;
    }

    festivalForroModalTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            if (event.target.closest('a, button')) {
                return;
            }

            openFestivalForroModal(trigger);
        });

        trigger.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            openFestivalForroModal(trigger);
        });
    });

    festivalForroModal.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        if (event.target.closest('[data-festival-forro-modal-close]')) {
            closeFestivalForroModal();
        }
    });
}

function initGuiaModal() {
    if (!guiaModal) {
        return;
    }

    guiaModal.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        if (event.target.closest('[data-guia-modal-close]')) {
            closeGuiaModal();
        }
    });
}

eventModalFrames.forEach((frame) => {
    frame.addEventListener('load', () => {
        queueEventModalFrameSync();

        if (frame === guiaModalFrame) {
            initGuiaModalFrameScrollBridge();
        }
    });
});

if (typeof eventModalMobileMediaQuery.addEventListener === 'function') {
    eventModalMobileMediaQuery.addEventListener('change', syncEventModalFrameHeights);
} else {
    eventModalMobileMediaQuery.addListener(syncEventModalFrameHeights);
}

window.addEventListener('resize', syncEventModalFrameHeights);

window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) {
        return;
    }

    const data = event.data;

    if (!data || data.type !== 'amargosa-open-gallery') {
        return;
    }

    const galleryKey = data.galleryKey;

    if (!galleryThemeCards.some((card) => card.key === galleryKey)) {
        return;
    }

    closeOpenEventModals();
    smoothScrollTo('#galeria');
    openGallery(galleryKey, document.querySelector(`[data-gallery-key="${galleryKey}"]`));
});

async function handleGalleryDeepLink() {
    const url = new URL(window.location.href);
    const galleryKey = url.searchParams.get('gallery');

    if (!galleryKey || !galleryThemeCards.some((card) => card.key === galleryKey)) {
        return;
    }

    const galleryTrigger = document.querySelector(`[data-gallery-key="${galleryKey}"]`);

    smoothScrollTo('#galeria');
    await openGallery(galleryKey, galleryTrigger);

    url.searchParams.delete('gallery');
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

function applyGalleryOverview(payload) {
    galleryState.galleryKey = payload.galleryKey;
    galleryState.galleryTitle = payload.title;
    galleryState.gallerySubtitle = payload.subtitle;
    galleryState.collections = payload.collections || [];
    resetGalleryCollectionState();
    syncGalleryHeader();
    renderGalleryMeta();
    renderGalleryCollections();
    renderGalleryGrid();
}

function applyGalleryCollection(payload) {
    galleryState.galleryKey = payload.galleryKey;
    galleryState.galleryTitle = payload.title;
    galleryState.gallerySubtitle = payload.subtitle;
    galleryState.collections = payload.collections || [];
    galleryState.activeCollection = payload.selectedCollection || null;
    galleryState.albums = payload.albums || [];
    galleryState.photos = payload.photos || [];
    galleryState.currentPage = 1;
    galleryState.selectedIndex = null;
    resetGalleryPreview();
    syncGalleryHeader();
    renderGalleryMeta();
    renderGalleryCollections();
    renderGalleryGrid();
}

function returnToGalleryOverview() {
    resetGalleryCollectionState();
    syncGalleryHeader();
    renderGalleryMeta();
    renderGalleryCollections();
    renderGalleryGrid();
    setGalleryStatus('');
}

async function openGallery(galleryKey, trigger = null) {
    if (!galleryModal) {
        return;
    }

    const fallbackTitle = getGalleryTriggerLabel(trigger);
    const themeCard = getGalleryThemeCard(galleryKey);

    if (trigger instanceof Element && !galleryModal.contains(trigger)) {
        lastGalleryTrigger = trigger;
    }
    showGalleryModalShell();
    clearGalleryHashFromUrl();
    galleryState.galleryKey = galleryKey;
    galleryState.galleryTitle = themeCard?.title || fallbackTitle;
    galleryState.gallerySubtitle = 'Escolha o ano para abrir a galeria deste evento.';
    galleryState.collections = [];
    resetGalleryCollectionState();
    galleryModalMeta?.replaceChildren();
    syncGalleryHeader();
    renderGalleryCollections();
    renderGalleryGrid();
    setGalleryStatus(`Carregando os anos de ${themeCard?.title || fallbackTitle}...`);

    try {
        const payload = await fetchGalleryData(galleryKey);

        applyGalleryOverview(payload);

        if (!galleryState.collections.length) {
            setGalleryStatus('Nenhum ano foi encontrado para esta galeria.');
            return;
        }

        setGalleryStatus('');
    } catch (error) {
        galleryState.galleryKey = galleryKey;
        galleryState.galleryTitle = themeCard?.title || fallbackTitle;
        galleryState.gallerySubtitle = 'Nao foi possivel carregar os anos desta galeria neste momento.';
        galleryState.collections = [];
        resetGalleryCollectionState();
        syncGalleryHeader();
        setGalleryStatus(error.message || 'Nao foi possivel carregar a galeria.', 'error');
    }
}

async function openGalleryCollection(collectionKey) {
    if (!galleryState.galleryKey) {
        return;
    }

    const collection = galleryState.collections.find((item) => item.key === collectionKey);

    resetGalleryPreview();
    galleryModalGrid?.replaceChildren();
    setGalleryStatus(`Carregando ${collection?.title || collectionKey}...`);

    try {
        const payload = await fetchGalleryData(galleryState.galleryKey, collectionKey);

        applyGalleryCollection(payload);

        if (!galleryState.photos.length) {
            setGalleryStatus('Nenhuma foto foi encontrada para este ano.');
            return;
        }

        setGalleryStatus(payload.warningMessage || '');
    } catch (error) {
        setGalleryStatus(error.message || 'Nao foi possivel carregar este ano da galeria.', 'error');
    }
}

function handleGalleryBack() {
    if (galleryState.activeCollection) {
        returnToGalleryOverview();
        return;
    }

    openGalleryHub();
}

galleryModalPagePrevButton?.addEventListener('click', () => changeGalleryPage(-1));
galleryModalPageNextButton?.addEventListener('click', () => changeGalleryPage(1));
galleryModalMobilePagePrevButton?.addEventListener('click', () => changeGalleryPage(-1));
galleryModalMobilePageNextButton?.addEventListener('click', () => changeGalleryPage(1));

galleryModalPreviewCloseButton?.addEventListener('click', resetGalleryPreview);
galleryModalBackButton?.addEventListener('click', handleGalleryBack);

galleryModal?.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const closeTrigger = event.target.closest('[data-gallery-close]');
    const themeButton = event.target.closest('[data-gallery-theme-key]');
    const collectionButton = event.target.closest('[data-gallery-collection-key]');
    const thumbButton = event.target.closest('[data-gallery-photo-index]');

    if (closeTrigger) {
        closeGalleryModal();
        return;
    }

    if (themeButton) {
        openGallery(themeButton.dataset.galleryThemeKey, themeButton);
        return;
    }

    if (collectionButton) {
        openGalleryCollection(collectionButton.dataset.galleryCollectionKey);
        return;
    }

    if (thumbButton) {
        showGalleryPreview(Number(thumbButton.dataset.galleryPhotoIndex));
    }
});

document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const guideModalTrigger = event.target.closest('[data-guide-modal-trigger]');

    if (guideModalTrigger) {
        event.preventDefault();
        setMobileMenuOpen(false);
        setDesktopHamburgerOpen(false);
        openGuiaModal(guideModalTrigger, resolveGuideModalSource(guideModalTrigger));
        return;
    }

    const galleryHubTrigger = event.target.closest('[data-gallery-hub]');

    if (galleryHubTrigger) {
        event.preventDefault();
        setMobileMenuOpen(false);
        openGalleryHub(galleryHubTrigger);
        return;
    }

    const galleryTrigger = event.target.closest('[data-gallery-key]');

    if (!galleryTrigger || galleryTrigger.hasAttribute('disabled') || galleryTrigger.getAttribute('aria-disabled') === 'true') {
        return;
    }

    event.preventDefault();
    setMobileMenuOpen(false);
    openGallery(galleryTrigger.dataset.galleryKey, galleryTrigger);
});

// Inicializar tooltips nativos
function initTooltips() {
    document.querySelectorAll('[title]').forEach((element) => {
        element.addEventListener('mouseenter', function () {
            return this;
        });
    });
}

function initCalendarIframeScrollBridge() {
    const scrollMultiplier = 2.4;
    const maxStep = 320;

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) {
            return;
        }

        const data = event.data;
        if (data && data.type === 'amargosa-calendar-height') {
            const nextHeight = Math.ceil(Number(data.height) || 0);
            if (calendarIframe && nextHeight > 0) {
                calendarIframe.style.height = `${nextHeight}px`;
                calendarIframe.style.minHeight = '0';
            }
            return;
        }

        if (!data || data.type !== 'amargosa-calendar-scroll') {
            return;
        }

        const deltaY = Number(data.deltaY) || 0;
        if (!deltaY) {
            return;
        }

        const scaledDeltaY = deltaY * scrollMultiplier;
        const nextStep = Math.max(-maxStep, Math.min(maxStep, scaledDeltaY));
        window.scrollBy(0, nextStep);
    });
}

function initCalendarIframeLazyLoad() {
    if (!calendarEmbedIframe) {
        return;
    }

    const loadCalendarIframe = () => {
        ensureIframeLoaded(calendarEmbedIframe);
    };

    if (window.location.hash === '#calendario') {
        loadCalendarIframe();
        return;
    }

    const observationTarget = calendarEmbedShell || calendarEmbedIframe;

    if (!('IntersectionObserver' in window) || !(observationTarget instanceof Element)) {
        loadCalendarIframe();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
            return;
        }

        loadCalendarIframe();
        observer.disconnect();
    }, {
        rootMargin: '320px 0px'
    });

    observer.observe(observationTarget);
}

document.addEventListener('DOMContentLoaded', async () => {
    initTooltips();
    initCalendarIframeLazyLoad();
    initCalendarIframeScrollBridge();
    initEventModalOpenButtons();
    initCarnavalCulturalModal();
    initSaoJoaoModal();
    initFestivalForroModal();
    initGuiaModal();
    await initEventGalleryButtons();
    await handleGalleryDeepLink();
    console.log('Página de Turismo de Amargosa carregada com sucesso!');
});

// Compartilhamento em redes sociais
function shareOnSocial(platform) {
    const url = window.location.href;
    const title = 'Conheça Amargosa - A Cidade Jardim da Bahia!';
    let shareUrl = '';

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
            break;
        default:
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

window.shareOnSocial = shareOnSocial;

// Suporte a teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (galleryModal && !galleryModal.hidden) {
            if (galleryModalPreview && !galleryModalPreview.hidden) {
                resetGalleryPreview();
            } else {
                closeGalleryModal();
            }

            return;
        }

        if (carnavalCulturalModal && !carnavalCulturalModal.hidden) {
            closeCarnavalCulturalModal();
            return;
        }

        if (saoJoaoModal && !saoJoaoModal.hidden) {
            closeSaoJoaoModal();
            return;
        }

        if (festivalForroModal && !festivalForroModal.hidden) {
            closeFestivalForroModal();
            return;
        }

        if (guiaModal && !guiaModal.hidden) {
            closeGuiaModal();
            return;
        }

        setMobileMenuOpen(false);
        setDesktopHamburgerOpen(false);
    }
});

console.log('Scripts de Amargosa inicializados com sucesso!');
