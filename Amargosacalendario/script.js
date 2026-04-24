(() => {
    const STORAGE_KEYS = {
        legacyEvents: "amargosa-calendar-events-v1",
        theme: "amargosa-calendar-theme-v1"
    };
    const CATEGORY_FILTER_ALL = "all";
    const CATEGORY_FILTER_ALL_COLOR = "#12a594";
    const DEFAULT_EVENTS_TABLE = "calendar_events";
    const DEFAULT_EVENT_IMAGES_BUCKET = "calendar-event-images";
    const DEFAULT_REFRESH_MS = 60000;
    const MAX_TITLE_LENGTH = 80;
    const MAX_DESCRIPTION_LENGTH = 200;
    const MAX_RESPONSIBLE_LENGTH = 120;
    const ACCESS_TYPE_FREE = "free";
    const ACCESS_TYPE_PAID = "paid";
    const DISPLAY_STYLE_DOT = "dot";
    const DISPLAY_STYLE_BAR = "bar";
    const MAX_EVENT_IMAGE_BYTES = 4 * 1024 * 1024;
    const EVENT_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    const CALENDAR_CELL_WIDTH_DENSE = 132;
    const CALENDAR_CELL_WIDTH_COMPACT = 96;
    const EMBED_MODE_TRUE_VALUES = new Set(["1", "true", "yes", "embed", "compact"]);
    const EVENT_ACCESS_TYPES = {
        [ACCESS_TYPE_FREE]: {
            label: "Gratuito",
            className: "event-access-badge--free"
        },
        [ACCESS_TYPE_PAID]: {
            label: "Pago",
            className: "event-access-badge--paid"
        }
    };
    const EVENT_CATEGORIES = [
        { id: "danca", label: "Dança", color: "#8f5b2e" },
        { id: "educacao", label: "Educação", color: "#2d8cff" },
        { id: "exposicao", label: "Exposição", color: "#b34df4" },
        { id: "festas-populares", label: "Festas Populares", color: "#ff5a4f" },
        { id: "gastronomia", label: "Gastronomia", color: "#ff7a2f" },
        { id: "literatura", label: "Literatura", color: "#56b85a" },
        { id: "musica", label: "Música", color: "#28b7c7" },
        { id: "religiosidade", label: "Religiosidade", color: "#5f3dc4" },
        { id: "teatro", label: "Teatro", color: "#ff4f86" }
    ];
    const CATEGORY_LOOKUP = EVENT_CATEGORIES.reduce((lookup, category) => {
        lookup[category.id] = category;
        lookup[normalizeCategoryValue(category.label)] = category;
        return lookup;
    }, {});

    const config = getCalendarConfig();
    const client = createBackendClient(config);
    const refs = {
        topStatus: document.getElementById("top-status"),
        themeToggle: document.getElementById("theme-toggle"),
        themeToggleLabel: document.getElementById("theme-toggle-label"),
        loginTrigger: document.getElementById("login-trigger"),
        adminPill: document.getElementById("admin-pill"),
        logoutTrigger: document.getElementById("logout-trigger"),
        accessFilters: document.getElementById("access-filters"),
        categoryFilters: document.getElementById("category-filters"),
        monthLabel: document.getElementById("month-label"),
        toolbarNote: document.getElementById("toolbar-note"),
        calendarGrid: document.getElementById("calendar-grid"),
        sidebarCard: document.querySelector(".sidebar-card"),
        selectedDateLabel: document.getElementById("selected-date"),
        selectedEvents: document.getElementById("selected-events"),
        emptyState: document.getElementById("empty-state"),
        modeBanner: document.getElementById("mode-banner"),
        todayButton: document.getElementById("today-button"),
        prevMonth: document.getElementById("prev-month"),
        nextMonth: document.getElementById("next-month"),
        loginModal: document.getElementById("login-modal"),
        loginForm: document.getElementById("login-form"),
        loginEmail: document.getElementById("login-email"),
        loginPassword: document.getElementById("login-password"),
        loginError: document.getElementById("login-error"),
        loginSubmitButton: document.querySelector("#login-form button[type=\"submit\"]"),
        eventModal: document.getElementById("event-modal"),
        eventForm: document.getElementById("event-form"),
        eventModalTitle: document.getElementById("event-modal-title"),
        eventModalSubtitle: document.getElementById("event-modal-subtitle"),
        eventDateLabel: document.getElementById("event-date-label"),
        eventDateInput: document.getElementById("event-date-input"),
        eventIdInput: document.getElementById("event-id-input"),
        eventTitle: document.getElementById("event-title"),
        eventTime: document.getElementById("event-time"),
        eventDescription: document.getElementById("event-description"),
        eventResponsible: document.getElementById("event-responsible"),
        eventImageInput: document.getElementById("event-image"),
        eventImageUrlInput: document.getElementById("event-image-url-input"),
        eventImagePreview: document.getElementById("event-image-preview"),
        eventImagePreviewImage: document.getElementById("event-image-preview-img"),
        removeEventImageButton: document.getElementById("remove-event-image-button"),
        eventAccessOptions: document.getElementById("event-access-options"),
        eventDisplayOptions: document.getElementById("event-display-options"),
        eventCategoryOptions: document.getElementById("event-category-options"),
        eventError: document.getElementById("event-error"),
        deleteEventButton: document.getElementById("delete-event-button"),
        saveEventButton: document.getElementById("save-event-button"),
        dayDetailsModal: document.getElementById("day-details-modal"),
        dayDetailsDateLabel: document.getElementById("day-details-date-label"),
        dayDetailsEvents: document.getElementById("day-details-events"),
        dayDetailsEmpty: document.getElementById("day-details-empty"),
        dayDetailsCreateButton: document.getElementById("day-details-create-button"),
        imageViewerModal: document.getElementById("image-viewer-modal"),
        imageViewerImage: document.getElementById("image-viewer-image"),
        imageViewerTitle: document.getElementById("image-viewer-title"),
        imageViewerCaption: document.getElementById("image-viewer-caption"),
        toastStack: document.getElementById("toast-stack"),
        dayPreview: document.getElementById("day-preview"),
        adminTools: document.getElementById("admin-tools"),
        importLocalButton: document.getElementById("import-local-button")
    };
    const state = {
        currentMonth: startOfMonth(new Date()),
        selectedDate: formatDateKey(new Date()),
        isEmbedMode: detectEmbedMode(),
        isConfigured: Boolean(client),
        isDarkMode: loadThemeState(),
        calendarLayoutMode: resolveFallbackCalendarLayoutMode(detectEmbedMode()),
        activeCategoryFilter: CATEGORY_FILTER_ALL,
        activeAccessFilter: CATEGORY_FILTER_ALL,
        session: null,
        events: {},
        eventsError: "",
        hasLoadedEvents: false,
        isLoadingEvents: Boolean(client),
        isSavingEvent: false,
        isImportingLegacy: false,
        legacyEventsDetected: hasLegacyLocalEvents(),
        refreshTimerId: 0
    };
    let calendarLayoutObserver = null;
    let parentFrameHeightSyncId = 0;

    init();

    async function init() {
        document.body.classList.toggle("embed-mode", state.isEmbedMode);
        refs.eventCategoryOptions.innerHTML = EVENT_CATEGORIES.map((category) =>
            "<label class=\"category-picker-option\" style=\"--category-color: " + category.color + "\">" +
                "<input class=\"category-picker-input\" type=\"checkbox\" name=\"categories\" value=\"" + category.id + "\">" +
                "<span class=\"category-picker-pill\">" + category.label + "</span>" +
            "</label>"
        ).join("");
        bindEvents();
        setupCalendarLayoutObserver();
        if (config && config.adminEmailHint) {
            refs.loginEmail.placeholder = config.adminEmailHint;
        }
        if (client) {
            client.auth.onAuthStateChange((_event, session) => {
                state.session = session || null;
                if (!session) {
                    closeModal(refs.eventModal);
                }
                render();
            });
            const { data } = await client.auth.getSession();
            state.session = data.session || null;
            await refreshEvents({ showToastOnError: false });
            startAutoRefresh();
        } else {
            state.isLoadingEvents = false;
        }
        render();
        window.addEventListener("load", queueParentFrameHeightSync);
    }

    function setupCalendarLayoutObserver() {
        updateCalendarLayoutMode();
        if (!refs.calendarGrid || typeof window.ResizeObserver !== "function") {
            return;
        }
        if (calendarLayoutObserver) {
            calendarLayoutObserver.disconnect();
        }
        calendarLayoutObserver = new window.ResizeObserver(() => {
            updateCalendarLayoutMode();
        });
        calendarLayoutObserver.observe(refs.calendarGrid);
    }

    function updateCalendarLayoutMode() {
        const nextMode = resolveCalendarLayoutMode(getCalendarCellWidth());
        if (state.calendarLayoutMode !== nextMode) {
            state.calendarLayoutMode = nextMode;
            render();
        }
    }

    function getCalendarCellWidth() {
        if (!refs.calendarGrid) {
            return 0;
        }

        const styles = window.getComputedStyle(refs.calendarGrid);
        const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
        const paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
        const paddingRight = parseFloat(styles.paddingRight || "0") || 0;
        const availableWidth = refs.calendarGrid.clientWidth - paddingLeft - paddingRight;
        if (availableWidth <= 0) {
            return 0;
        }

        return (availableWidth - gap * 6) / 7;
    }

    function resolveCalendarLayoutMode(cellWidth) {
        if (!Number.isFinite(cellWidth) || cellWidth <= 0) {
            return resolveFallbackCalendarLayoutMode(state.isEmbedMode);
        }
        if (cellWidth <= CALENDAR_CELL_WIDTH_COMPACT) {
            return "compact";
        }
        if (cellWidth <= CALENDAR_CELL_WIDTH_DENSE) {
            return "dense";
        }
        return "regular";
    }

    function resolveFallbackCalendarLayoutMode(isEmbedMode = false) {
        if (window.matchMedia("(max-width: 640px)").matches || (isEmbedMode && window.matchMedia("(max-width: 760px)").matches)) {
            return "compact";
        }
        if (window.matchMedia("(max-width: 980px)").matches) {
            return "dense";
        }
        return "regular";
    }

    function bindEvents() {
        refs.themeToggle.addEventListener("click", () => {
            state.isDarkMode = !state.isDarkMode;
            saveThemeState(state.isDarkMode);
            renderThemeState();
        });
        refs.loginTrigger.addEventListener("click", () => {
            if (!state.isConfigured) {
                showToast("Preencha o config.js e execute o SQL do Supabase antes de entrar.", true);
                return;
            }
            openModal(refs.loginModal, refs.loginEmail);
        });
        refs.logoutTrigger.addEventListener("click", logout);
        refs.accessFilters.addEventListener("click", handleAccessFilterClick);
        refs.categoryFilters.addEventListener("click", handleCategoryFilterClick);
        refs.prevMonth.addEventListener("click", () => changeMonth(-1));
        refs.nextMonth.addEventListener("click", () => changeMonth(1));
        refs.todayButton.addEventListener("click", jumpToToday);
        refs.loginForm.addEventListener("submit", handleLogin);
        refs.eventForm.addEventListener("submit", handleEventSubmit);
        refs.deleteEventButton.addEventListener("click", handleDeleteEvent);
        refs.eventImageInput.addEventListener("change", handleEventImageSelection);
        refs.removeEventImageButton.addEventListener("click", handleRemoveEventImage);
        refs.dayDetailsCreateButton.addEventListener("click", handleDayDetailsCreateEvent);
        refs.importLocalButton.addEventListener("click", handleImportLegacyEvents);
        document.querySelectorAll("[data-close-modal]").forEach((button) => {
            button.addEventListener("click", () => closeModal(document.getElementById(button.getAttribute("data-close-modal"))));
        });
        [refs.loginModal, refs.eventModal, refs.dayDetailsModal, refs.imageViewerModal].forEach((modal) => {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    closeModal(modal);
                }
            });
        });
        setupModalScrollChaining();
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeModal(refs.loginModal);
                closeModal(refs.eventModal);
                closeModal(refs.dayDetailsModal);
                closeModal(refs.imageViewerModal);
            }
        });
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && state.isConfigured) {
                refreshEvents({ silent: true, showToastOnError: false });
            }
        });
        document.addEventListener("scroll", hideDayPreview, true);
        window.addEventListener("resize", handleViewportResize);
    }

    function render() {
        ensureSelectedDateVisible();
        hideDayPreview();
        renderThemeState();
        renderAuthState();
        renderAccessFilters();
        renderCategoryFilters();
        renderCalendar();
        renderAdminTools();
        renderDayDetailsModal(state.selectedDate);
        queueParentFrameHeightSync();
    }

    function renderThemeState() {
        document.body.classList.toggle("theme-dark", state.isDarkMode);
        refs.themeToggle.setAttribute("aria-pressed", String(state.isDarkMode));
        refs.themeToggleLabel.textContent = state.isDarkMode ? "Modo claro" : "Modo escuro";
    }

    function renderAuthState() {
        const loggedIn = isLoggedIn();
        refs.loginTrigger.hidden = loggedIn;
        refs.adminPill.hidden = !loggedIn;
        refs.logoutTrigger.hidden = !loggedIn;
        refs.adminPill.textContent = loggedIn ? (state.session.user.email || "Admin") : "Admin";

        if (!state.isConfigured) {
            if (refs.topStatus) {
                refs.topStatus.textContent = "Agenda online não configurada";
            }
            if (refs.modeBanner) {
                refs.modeBanner.textContent = "Configuração necessária";
                refs.modeBanner.classList.remove("admin");
            }
            refs.toolbarNote.textContent = "Configure o Supabase para publicar eventos online.";
            return;
        }

        if (refs.topStatus) {
            refs.topStatus.textContent = state.isLoadingEvents
                ? (loggedIn ? "Modo administrador ativo | sincronizando agenda" : "Agenda online carregando")
                : (state.eventsError ? "Agenda online com falha de conexão" : (loggedIn ? "Modo administrador ativo" : "Agenda online disponível"));
        }
        if (refs.modeBanner) {
            refs.modeBanner.textContent = loggedIn ? "Edição conectada ao banco online" : "Visualização pública online";
            refs.modeBanner.classList.toggle("admin", loggedIn);
        }
        refs.toolbarNote.textContent = loggedIn
            ? "Clique em um dia de hoje em diante para criar evento ou em um evento existente para editar."
            : "Clique em um dia para consultar a programação disponível.";
    }

    function renderAccessFilters() {
        refs.accessFilters.querySelectorAll("[data-access-filter]").forEach((button) => {
            const isActive = button.getAttribute("data-access-filter") === state.activeAccessFilter;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function renderCategoryFilters() {
        refs.categoryFilters.innerHTML = [
            buildCategoryFilterButton(CATEGORY_FILTER_ALL, "Todos", CATEGORY_FILTER_ALL_COLOR)
        ].concat(EVENT_CATEGORIES.map((category) => buildCategoryFilterButton(category.id, category.label, category.color))).join("");
    }

    function renderCalendar() {
        const compactView = isCompactCalendarView();
        const denseView = isDenseCalendarView();

        refs.monthLabel.textContent = formatMonthYear(state.currentMonth);
        refs.calendarGrid.classList.toggle("calendar-grid--dense", denseView && !compactView);
        refs.calendarGrid.classList.toggle("calendar-grid--compact", compactView);
        refs.calendarGrid.innerHTML = "";
        ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach((day) => {
            const label = document.createElement("div");
            label.className = "weekday";
            label.textContent = day;
            refs.calendarGrid.appendChild(label);
        });

        const year = state.currentMonth.getFullYear();
        const month = state.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const gridStart = new Date(year, month, 1 - firstDay.getDay());
        const today = startOfDay(new Date());
        const todayKey = formatDateKey(today);

        for (let index = 0; index < 42; index += 1) {
            const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
            const cellKey = formatDateKey(cellDate);
            const dayEvents = getFilteredEventsForDate(cellKey);
            const cellEvents = getCalendarDisplayEventsForDate(cellKey, dayEvents);
            const isPast = startOfDay(cellDate) < today;
            const cell = document.createElement("div");
            cell.className = "day-cell";
            cell.tabIndex = 0;
            cell.setAttribute("role", "button");
            cell.setAttribute("aria-label", buildDayAriaLabel(cellDate, cellEvents.length));
            cell.classList.toggle("outside", cellDate.getMonth() !== month);
            cell.classList.toggle("selected", state.selectedDate === cellKey);
            cell.classList.toggle("today", todayKey === cellKey);
            cell.classList.toggle("past", isPast);
            cell.classList.toggle("has-events", cellEvents.length > 0);
            cell.classList.toggle("day-cell--dense", denseView && !compactView);
            cell.classList.toggle("day-cell--compact", compactView);
            cell.addEventListener("click", () => handleDayClick(cellKey));
            cell.addEventListener("mouseenter", () => handleDayHoverStart(cellKey, cell));
            cell.addEventListener("mouseleave", hideDayPreview);
            cell.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleDayClick(cellKey);
                }
            });

            const head = document.createElement("div");
            head.className = "day-head";
            const number = document.createElement("span");
            number.className = "day-number";
            number.textContent = String(cellDate.getDate());
            const tag = document.createElement("span");
            tag.className = "day-tag";

            if (compactView) {
                tag.textContent = "";
            } else {
                tag.textContent = cellEvents.length
                    ? (cellEvents.length === 1 ? "1 evento" : cellEvents.length + " eventos")
                    : (state.isConfigured && isLoggedIn() && !isPast ? "Novo evento" : (state.isLoadingEvents ? "Sincronizando" : "Sem eventos"));
            }

            if (!tag.textContent || (!cellEvents.length && !isLoggedIn() && todayKey !== cellKey && state.selectedDate !== cellKey)) {
                tag.classList.add("hidden");
            }
            head.append(number, tag);
            cell.appendChild(head);

            const eventList = document.createElement("div");
            eventList.className = "event-list";
            cellEvents.slice(0, 3).forEach((calendarEvent) => {
                eventList.appendChild(buildCalendarEventChip(calendarEvent, cellKey));
            });
            if (cellEvents.length > 3) {
                eventList.appendChild(buildEventOverflowBadge(cellEvents.length - 3, cellEvents));
            }

            cell.appendChild(eventList);
            refs.calendarGrid.appendChild(cell);
        }
    }

    function buildEventOverflowBadge(hiddenCount, eventsForDay = []) {
        const badge = document.createElement("span");
        badge.className = "event-more";
        badge.textContent = "+" + hiddenCount;
        badge.setAttribute("aria-label", hiddenCount === 1 ? "Mais 1 evento" : "Mais " + hiddenCount + " eventos");

        if (hasMixedAccessEvents(eventsForDay)) {
            badge.classList.add("event-more--mixed-access");
        } else if (hasOnlyPaidEvents(eventsForDay)) {
            badge.classList.add("event-more--paid");
        } else {
            badge.classList.add("event-more--free");
        }

        return badge;
    }

    function buildCalendarEventChip(calendarEvent, dateKey) {
        const categoryDetails = getEventCategoryDetails(calendarEvent.categories);
        const primaryCategory = getPrimaryEventCategory(categoryDetails);
        const item = document.createElement("button");
        const fullBar = isFullBarEvent(calendarEvent);
        item.type = "button";
        item.className = "event-chip " + (fullBar ? "event-chip--bar" : "event-chip--dot");
        item.classList.toggle("event-chip--paid", isPaidEvent(calendarEvent));
        item.classList.toggle("event-chip--free", !isPaidEvent(calendarEvent));
        applyEventAccent(item, primaryCategory);

        if (fullBar) {
            const title = document.createElement("strong");
            title.className = "event-chip-title";
            title.textContent = calendarEvent.title;
            item.appendChild(title);
        } else {
            const marker = document.createElement("span");
            marker.className = "event-chip-dot";
            marker.setAttribute("aria-hidden", "true");

            const text = document.createElement("span");
            text.className = "event-chip-inline";

            if (calendarEvent.time) {
                const time = document.createElement("span");
                time.className = "event-chip-time";
                time.textContent = calendarEvent.time;
                text.appendChild(time);
            }

            const title = document.createElement("strong");
            title.className = "event-chip-title";
            title.textContent = calendarEvent.title;
            text.appendChild(title);
            item.append(marker, text);
        }

        item.addEventListener("click", (event) => {
            event.stopPropagation();
            state.selectedDate = dateKey;
            if (isLoggedIn()) {
                closeModal(refs.dayDetailsModal);
                openEventModal(dateKey, calendarEvent.id);
            } else {
                render();
                openDayDetailsModal(dateKey);
            }
        });

        return item;
    }

    function renderSidebar() {
        const selectedEvents = getFilteredEventsForDate(state.selectedDate);

        if (refs.selectedDateLabel) {
            refs.selectedDateLabel.textContent = formatFullDate(parseDateKey(state.selectedDate));
        }

        refs.selectedEvents.innerHTML = "";
        if (selectedEvents.length) {
            refs.emptyState.hidden = true;
            selectedEvents.forEach((calendarEvent) => {
                const categoryDetails = getEventCategoryDetails(calendarEvent.categories);
                const primaryCategory = getPrimaryEventCategory(categoryDetails);
                const card = document.createElement("article");
                card.className = "event-card";
                applyEventAccent(card, primaryCategory);
                const head = document.createElement("div");
                head.className = "event-card-head";
                const title = document.createElement("h3");
                title.className = "event-card-title";
                title.textContent = calendarEvent.title;
                const time = document.createElement("span");
                time.className = "event-card-time";
                time.textContent = calendarEvent.time || "Horário livre";
                head.append(title, time);
                card.appendChild(head);
                const categories = buildEventCategoryList(categoryDetails, {
                    accentColor: primaryCategory ? primaryCategory.color : ""
                });
                if (categories) {
                    card.appendChild(categories);
                }
                if (calendarEvent.description) {
                    const description = document.createElement("p");
                    description.textContent = calendarEvent.description;
                    card.appendChild(description);
                }
                if (isLoggedIn()) {
                    const actions = document.createElement("div");
                    actions.className = "event-card-actions";
                    actions.appendChild(buildEventAdminActionButton(state.selectedDate, calendarEvent));
                    card.appendChild(actions);
                }
                refs.selectedEvents.appendChild(card);
            });
        } else {
            refs.emptyState.hidden = false;
            refs.emptyState.textContent = buildEmptyStateMessage();
        }

        const showAdminTools = state.isConfigured && isLoggedIn() && state.legacyEventsDetected;
        refs.adminTools.hidden = !showAdminTools;
        if (showAdminTools) {
            refs.importLocalButton.hidden = false;
            refs.importLocalButton.disabled = state.isImportingLegacy || state.isLoadingEvents || state.isSavingEvent;
            refs.importLocalButton.textContent = state.isImportingLegacy ? "Importando eventos locais..." : "Importar eventos locais";
        }
    }

    function renderAdminTools() {
        const showAdminTools = state.isConfigured && isLoggedIn() && state.legacyEventsDetected;
        refs.adminTools.hidden = !showAdminTools;
        if (showAdminTools) {
            refs.importLocalButton.hidden = false;
            refs.importLocalButton.disabled = state.isImportingLegacy || state.isLoadingEvents || state.isSavingEvent;
            refs.importLocalButton.textContent = state.isImportingLegacy ? "Importando eventos locais..." : "Importar eventos locais";
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        if (!state.isConfigured) {
            refs.loginError.textContent = "A agenda online ainda não foi configurada.";
            return;
        }
        const email = refs.loginEmail.value.trim().toLowerCase();
        const password = refs.loginPassword.value;
        if (!email || !password) {
            refs.loginError.textContent = "Informe e-mail e senha.";
            return;
        }
        setLoginBusy(true);
        const { error } = await client.auth.signInWithPassword({ email, password });
        setLoginBusy(false);
        if (error) {
            refs.loginError.textContent = normalizeSupabaseError(error, "Não foi possível entrar com essa conta.");
            return;
        }
        refs.loginForm.reset();
        refs.loginError.textContent = "";
        closeModal(refs.loginModal);
        await refreshEvents({ silent: true, showToastOnError: false });
        showToast("Acesso administrativo liberado.");
    }

    async function logout() {
        if (!client) {
            return;
        }
        const { error } = await client.auth.signOut();
        if (error) {
            showToast(normalizeSupabaseError(error, "Não foi possível encerrar a sessão."), true);
            return;
        }
        closeModal(refs.eventModal);
        render();
        showToast("Sessão encerrada. A agenda voltou para o modo público.");
    }

    async function refreshEvents(options = {}) {
        if (!client) {
            return false;
        }
        state.isLoadingEvents = true;
        state.eventsError = "";
        if (!options.silent) {
            render();
        }
        let { data, error } = await client
            .from(getEventsTableName())
            .select("id, event_date, title, event_time, description, responsible, categories, image_url, access_type, display_style")
            .order("event_date", { ascending: true })
            .order("title", { ascending: true });
        if (error && isMissingDisplayStyleColumnError(error)) {
            const fallbackResponse = await client
                .from(getEventsTableName())
                .select("id, event_date, title, event_time, description, responsible, categories, image_url, access_type")
                .order("event_date", { ascending: true })
                .order("title", { ascending: true });
            data = fallbackResponse.data;
            error = fallbackResponse.error;
        }
        if (error && isMissingAccessTypeColumnError(error)) {
            const fallbackResponse = await client
                .from(getEventsTableName())
                .select("id, event_date, title, event_time, description, responsible, categories, image_url")
                .order("event_date", { ascending: true })
                .order("title", { ascending: true });
            data = fallbackResponse.data;
            error = fallbackResponse.error;
        }
        if (error && isMissingImageUrlColumnError(error)) {
            const fallbackResponse = await client
                .from(getEventsTableName())
                .select("id, event_date, title, event_time, description, responsible, categories")
                .order("event_date", { ascending: true })
                .order("title", { ascending: true });
            data = fallbackResponse.data;
            error = fallbackResponse.error;
        }
        if (error && isMissingResponsibleColumnError(error)) {
            const fallbackResponse = await client
                .from(getEventsTableName())
                .select("id, event_date, title, event_time, description, categories")
                .order("event_date", { ascending: true })
                .order("title", { ascending: true });
            data = fallbackResponse.data;
            error = fallbackResponse.error;
        }
        state.isLoadingEvents = false;
        state.hasLoadedEvents = true;
        if (error) {
            state.eventsError = normalizeSupabaseError(error, "Não foi possível carregar os eventos online agora.");
            render();
            if (options.showToastOnError !== false) {
                showToast(state.eventsError, true);
            }
            return false;
        }
        state.events = buildEventsMap(Array.isArray(data) ? data : []);
        render();
        return true;
    }

    function startAutoRefresh() {
        if (!client) {
            return;
        }
        if (state.refreshTimerId) {
            window.clearInterval(state.refreshTimerId);
        }
        state.refreshTimerId = window.setInterval(() => {
            if (!document.hidden) {
                refreshEvents({ silent: true, showToastOnError: false });
            }
        }, config.autoRefreshIntervalMs);
    }

    function handleCategoryFilterClick(event) {
        const button = event.target.closest("[data-category-filter]");
        if (!button) {
            return;
        }
        const nextFilter = button.getAttribute("data-category-filter");
        if (nextFilter && nextFilter !== state.activeCategoryFilter) {
            state.activeCategoryFilter = nextFilter;
            render();
        }
    }

    function handleAccessFilterClick(event) {
        const button = event.target.closest("[data-access-filter]");
        if (!button) {
            return;
        }

        const nextFilter = sanitizeAccessType(button.getAttribute("data-access-filter"));
        state.activeAccessFilter = state.activeAccessFilter === nextFilter ? CATEGORY_FILTER_ALL : nextFilter;
        render();
    }

    function handleDayClick(dateKey) {
        const clickedDate = parseDateKey(dateKey);
        const clickedMonthChanged = clickedDate.getFullYear() !== state.currentMonth.getFullYear() || clickedDate.getMonth() !== state.currentMonth.getMonth();

        if (clickedMonthChanged) {
            state.currentMonth = startOfMonth(clickedDate);
        }
        state.selectedDate = dateKey;
        hideDayPreview();
        render();
        openDayDetailsModal(dateKey);
    }

    function openDayDetailsModal(dateKey = state.selectedDate) {
        renderDayDetailsModal(dateKey);
        openModal(refs.dayDetailsModal, refs.dayDetailsCreateButton.hidden ? null : refs.dayDetailsCreateButton);
    }

    function renderDayDetailsModal(dateKey = state.selectedDate) {
        if (!refs.dayDetailsDateLabel || !refs.dayDetailsEvents || !refs.dayDetailsEmpty || !refs.dayDetailsCreateButton) {
            return;
        }

        const detailsEvents = getFilteredEventsForDate(dateKey);
        refs.dayDetailsDateLabel.textContent = formatFullDate(parseDateKey(dateKey));

        if (detailsEvents.length) {
            refs.dayDetailsEmpty.hidden = true;
            const eventsFragment = document.createDocumentFragment();
            detailsEvents.forEach((calendarEvent) => {
                eventsFragment.appendChild(buildDayDetailsEventCard(calendarEvent, dateKey));
            });
            refs.dayDetailsEvents.replaceChildren(eventsFragment);
        } else {
            refs.dayDetailsEvents.replaceChildren();
            refs.dayDetailsEmpty.hidden = false;
            refs.dayDetailsEmpty.textContent = buildEmptyStateMessage();
        }

        const showCreateButton = isLoggedIn() && !isPastDateKey(dateKey);
        refs.dayDetailsCreateButton.hidden = !showCreateButton;
        refs.dayDetailsCreateButton.dataset.dateKey = dateKey;
    }

    function buildDayDetailsEventCard(calendarEvent, dateKey) {
        const categoryDetails = getEventCategoryDetails(calendarEvent.categories);
        const primaryCategory = getPrimaryEventCategory(categoryDetails);
        const card = document.createElement("article");
        card.className = "event-card";
        applyEventAccent(card, primaryCategory);

        const head = document.createElement("div");
        head.className = "event-card-head";

        const title = document.createElement("h3");
        title.className = "event-card-title";
        title.textContent = calendarEvent.title;

        const time = document.createElement("span");
        time.className = "event-card-time";
        time.textContent = calendarEvent.time || "Horario livre";

        head.append(title, time);
        card.appendChild(head);
        card.appendChild(buildEventAccessBadge(calendarEvent.accessType));

        if (calendarEvent.imageUrl) {
            const imageButton = document.createElement("button");
            imageButton.type = "button";
            imageButton.className = "event-card-image-button";
            imageButton.setAttribute("aria-label", "Ver imagem completa do evento " + calendarEvent.title);

            const image = document.createElement("img");
            image.className = "event-card-image";
            image.src = calendarEvent.imageUrl;
            image.alt = "Imagem do evento " + calendarEvent.title;
            image.loading = "lazy";
            imageButton.appendChild(image);
            imageButton.addEventListener("click", () => {
                openImageViewer(calendarEvent.imageUrl, calendarEvent.title);
            });
            card.appendChild(imageButton);
        }

        const categories = buildEventCategoryList(categoryDetails, {
            accentColor: primaryCategory ? primaryCategory.color : ""
        });
        if (categories) {
            card.appendChild(categories);
        }

        if (calendarEvent.responsible) {
            const responsible = document.createElement("p");
            responsible.className = "event-card-responsible";
            responsible.textContent = calendarEvent.responsible;
            card.appendChild(responsible);
        }

        if (calendarEvent.description) {
            const description = document.createElement("p");
            description.textContent = calendarEvent.description;
            card.appendChild(description);
        }

        if (isLoggedIn()) {
            const actions = document.createElement("div");
            actions.className = "event-card-actions";
            actions.appendChild(buildEventAdminActionButton(dateKey, calendarEvent, {
                beforeOpen: () => closeModal(refs.dayDetailsModal)
            }));
            card.appendChild(actions);
        }

        return card;
    }

    function buildEventAdminActionButton(dateKey, calendarEvent, options = {}) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "event-card-button";
        button.textContent = isPastDateKey(dateKey) ? "Excluir evento" : "Editar evento";
        button.addEventListener("click", () => {
            if (typeof options.beforeOpen === "function") {
                options.beforeOpen();
            }
            openEventModal(dateKey, calendarEvent.id);
        });
        return button;
    }

    function openImageViewer(imageUrl, eventTitle = "") {
        const safeImageUrl = sanitizeImageUrl(imageUrl);
        if (!safeImageUrl) {
            return;
        }

        const title = sanitizeTitle(eventTitle || "Imagem do evento");
        refs.imageViewerTitle.textContent = title || "Imagem do evento";
        refs.imageViewerCaption.textContent = "Imagem completa do evento.";
        refs.imageViewerImage.src = safeImageUrl;
        refs.imageViewerImage.alt = title ? "Imagem completa do evento " + title : "Imagem completa do evento";
        openModal(refs.imageViewerModal, refs.imageViewerModal.querySelector("[data-close-modal=\"image-viewer-modal\"]"));
    }

    function handleDayDetailsCreateEvent() {
        const dateKey = refs.dayDetailsCreateButton.dataset.dateKey || state.selectedDate;
        closeModal(refs.dayDetailsModal);
        openEventModal(dateKey);
    }

    function handleDayHoverStart(dateKey, anchorElement) {
        if (!supportsDayHoverPreview() || refs.dayDetailsModal.classList.contains("open")) {
            return;
        }

        const dayEvents = getCalendarDisplayEventsForDate(dateKey, getFilteredEventsForDate(dateKey));
        if (!dayEvents.length) {
            return;
        }

        window.clearTimeout(handleDayHoverStart.timerId);
        handleDayHoverStart.timerId = window.setTimeout(() => {
            showDayPreview(dateKey, anchorElement, dayEvents);
        }, 90);
    }

    function showDayPreview(dateKey, anchorElement, dayEvents = getCalendarDisplayEventsForDate(dateKey, getFilteredEventsForDate(dateKey))) {
        if (!refs.dayPreview || !supportsDayHoverPreview() || !anchorElement || !dayEvents.length) {
            return;
        }

        refs.dayPreview.innerHTML = "";

        const heading = document.createElement("div");
        heading.className = "day-preview-head";

        const dateLabel = document.createElement("strong");
        dateLabel.className = "day-preview-date";
        dateLabel.textContent = formatFullDate(parseDateKey(dateKey));

        const countLabel = document.createElement("span");
        countLabel.className = "day-preview-count";
        countLabel.textContent = dayEvents.length === 1 ? "1 evento" : dayEvents.length + " eventos";

        heading.append(dateLabel, countLabel);
        refs.dayPreview.appendChild(heading);

        const previewList = document.createElement("div");
        previewList.className = "day-preview-list";

        dayEvents.slice(0, 6).forEach((calendarEvent) => {
            const categoryDetails = getEventCategoryDetails(calendarEvent.categories);
            const primaryCategory = getPrimaryEventCategory(categoryDetails);
            const item = document.createElement("article");
            item.className = "day-preview-item";
            item.classList.toggle("day-preview-item--paid", isPaidEvent(calendarEvent));
            item.classList.toggle("day-preview-item--free", !isPaidEvent(calendarEvent));
            applyEventAccent(item, primaryCategory);

            const time = document.createElement("span");
            time.className = "day-preview-time";
            time.textContent = calendarEvent.time || "Horario a definir";

            const title = document.createElement("strong");
            title.className = "day-preview-title";
            title.textContent = calendarEvent.title;

            item.append(time, title);
            previewList.appendChild(item);
        });

        refs.dayPreview.appendChild(previewList);

        if (dayEvents.length > 6) {
            const more = document.createElement("div");
            more.className = "day-preview-more";
            more.textContent = "+" + (dayEvents.length - 6) + " eventos";
            refs.dayPreview.appendChild(more);
        }

        refs.dayPreview.hidden = false;
        refs.dayPreview.setAttribute("aria-hidden", "false");
        positionDayPreview(anchorElement);
    }

    function positionDayPreview(anchorElement) {
        if (!refs.dayPreview || refs.dayPreview.hidden) {
            return;
        }

        const anchorRect = anchorElement.getBoundingClientRect();
        const previewRect = refs.dayPreview.getBoundingClientRect();
        const margin = 14;
        let left = anchorRect.right + margin;
        let top = anchorRect.top;

        if (left + previewRect.width > window.innerWidth - 16) {
            left = anchorRect.left - previewRect.width - margin;
        }
        if (left < 16) {
            left = Math.max(16, window.innerWidth - previewRect.width - 16);
        }
        if (top + previewRect.height > window.innerHeight - 16) {
            top = Math.max(16, window.innerHeight - previewRect.height - 16);
        }

        refs.dayPreview.style.left = Math.round(left) + "px";
        refs.dayPreview.style.top = Math.round(top) + "px";
    }

    function hideDayPreview() {
        window.clearTimeout(handleDayHoverStart.timerId);
        if (!refs.dayPreview) {
            return;
        }
        refs.dayPreview.hidden = true;
        refs.dayPreview.setAttribute("aria-hidden", "true");
        refs.dayPreview.style.left = "";
        refs.dayPreview.style.top = "";
        refs.dayPreview.innerHTML = "";
    }

    function supportsDayHoverPreview() {
        return !isCompactCalendarView() && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }

    handleDayHoverStart.timerId = 0;

    function openEventModalLegacy(dateKey, eventId = "") {
        if (isPastDateKey(dateKey)) {
            showToast("Datas anteriores a hoje estão disponíveis apenas para consulta.", true);
            return;
        }
        if (!state.isConfigured) {
            showToast("Configure o Supabase antes de cadastrar eventos online.", true);
            return;
        }
        if (!isLoggedIn()) {
            openModal(refs.loginModal, refs.loginEmail);
            return;
        }

        const currentEvent = getEventsForDate(dateKey).find((item) => item.id === eventId);
        refs.eventForm.reset();
        refs.eventError.textContent = "";
        refs.eventDateInput.value = dateKey;
        refs.eventIdInput.value = currentEvent ? currentEvent.id : "";
        refs.eventResponsible.value = currentEvent ? sanitizeResponsible(currentEvent.responsible || "") : "";
        refs.eventDateLabel.textContent = formatFullDate(parseDateKey(dateKey));
        refs.eventImageInput.value = "";
        refs.eventImageUrlInput.value = currentEvent ? sanitizeImageUrl(currentEvent.imageUrl || "") : "";
        renderEventImagePreview(refs.eventImageUrlInput.value);
        setSaveBusy(false);
        setDeleteBusy(false);

        if (currentEvent) {
            refs.eventModalTitle.textContent = "Editar evento";
            refs.eventModalSubtitle.textContent = "Atualize as informações ou exclua o evento abaixo.";
            refs.eventTitle.value = currentEvent.title;
            refs.eventTime.value = currentEvent.time || "";
            refs.eventDescription.value = currentEvent.description || "";
            setSelectedEventCategories(currentEvent.categories || []);
            refs.deleteEventButton.hidden = false;
        } else {
            refs.eventModalTitle.textContent = "Novo evento";
            refs.eventModalSubtitle.textContent = "Preencha os dados abaixo para criar um evento nesta data.";
            setSelectedEventCategories(state.activeCategoryFilter === CATEGORY_FILTER_ALL ? [] : [state.activeCategoryFilter]);
            refs.deleteEventButton.hidden = true;
        }

        openModal(refs.eventModal, refs.eventTitle);
    }

    function openEventModal(dateKey, eventId = "") {
        const currentEvent = getEventsForDate(dateKey).find((item) => item.id === eventId);
        const isPastEvent = Boolean(currentEvent) && isPastDateKey(dateKey);

        if (isPastDateKey(dateKey) && !currentEvent) {
            showToast("Datas anteriores a hoje estao disponiveis apenas para consulta.", true);
            return;
        }
        if (!state.isConfigured) {
            showToast("Configure o Supabase antes de cadastrar eventos online.", true);
            return;
        }
        if (!isLoggedIn()) {
            openModal(refs.loginModal, refs.loginEmail);
            return;
        }

        refs.eventForm.reset();
        refs.eventError.textContent = "";
        refs.eventDateInput.value = dateKey;
        refs.eventIdInput.value = currentEvent ? currentEvent.id : "";
        refs.eventImageInput.value = "";
        refs.eventImageUrlInput.value = currentEvent ? sanitizeImageUrl(currentEvent.imageUrl || "") : "";
        refs.eventDateLabel.textContent = formatFullDate(parseDateKey(dateKey));
        setSaveBusy(false);
        setDeleteBusy(false);

        if (currentEvent) {
            refs.eventTitle.value = currentEvent.title;
            refs.eventTime.value = currentEvent.time || "";
            refs.eventDescription.value = currentEvent.description || "";
            refs.eventResponsible.value = currentEvent.responsible || "";
            setSelectedEventCategories(currentEvent.categories || []);
            setSelectedAccessType(currentEvent.accessType);
            setSelectedDisplayStyle(currentEvent.displayStyle);
            setEventFormMode(isPastEvent ? "delete-only" : "edit");
            refs.eventModalTitle.textContent = isPastEvent ? "Excluir evento" : "Editar evento";
            refs.eventModalSubtitle.textContent = isPastEvent
                ? "Este evento ja aconteceu e nao pode ser editado. Voce ainda pode exclui-lo."
                : "Atualize as informacoes ou exclua o evento abaixo.";
            renderEventImagePreview(refs.eventImageUrlInput.value);
            refs.deleteEventButton.hidden = false;
        } else {
            setEventFormMode("create");
            refs.eventModalTitle.textContent = "Novo evento";
            refs.eventModalSubtitle.textContent = "Preencha os dados abaixo para criar um evento nesta data.";
            setSelectedEventCategories(state.activeCategoryFilter === CATEGORY_FILTER_ALL ? [] : [state.activeCategoryFilter]);
            setSelectedAccessType(ACCESS_TYPE_FREE);
            setSelectedDisplayStyle(DISPLAY_STYLE_BAR);
            refs.eventResponsible.value = "";
            renderEventImagePreview("");
            refs.deleteEventButton.hidden = true;
        }

        openModal(refs.eventModal, isPastEvent ? refs.deleteEventButton : refs.eventTitle);
    }

    async function handleEventSubmit(event) {
        event.preventDefault();
        if (state.isSavingEvent || !client) {
            return;
        }
        if (refs.eventForm.dataset.mode === "delete-only") {
            refs.eventError.textContent = "Eventos passados podem apenas ser excluidos.";
            return;
        }

        const dateKey = refs.eventDateInput.value;
        const eventId = refs.eventIdInput.value;
        const title = sanitizeTitle(refs.eventTitle.value);
        const time = normalizeTimeValue(refs.eventTime.value);
        const rawDescription = refs.eventDescription.value;
        const rawResponsible = refs.eventResponsible.value;
        const categories = getSelectedEventCategories();
        const accessType = getSelectedAccessType();
        const displayStyle = getSelectedDisplayStyle();
        const imageFile = refs.eventImageInput.files && refs.eventImageInput.files[0] ? refs.eventImageInput.files[0] : null;

        if (!isLoggedIn()) {
            refs.eventError.textContent = "Entre como administrador para salvar o evento.";
            return;
        }
        if (isPastDateKey(dateKey)) {
            refs.eventError.textContent = "Só é possível editar eventos de hoje em diante.";
            return;
        }
        if (!title) {
            refs.eventError.textContent = "Informe um título para o evento.";
            return;
        }
        if (rawDescription.length > MAX_DESCRIPTION_LENGTH) {
            refs.eventError.textContent = "A descrição deve ter no máximo 200 caracteres.";
            return;
        }
        if (rawResponsible.length > MAX_RESPONSIBLE_LENGTH) {
            refs.eventError.textContent = "O campo responsavel deve ter no maximo 120 caracteres.";
            return;
        }
        if (!categories.length) {
            refs.eventError.textContent = "Selecione ao menos uma categoria para o evento.";
            return;
        }
        if (imageFile) {
            const imageError = validateEventImageFile(imageFile);
            if (imageError) {
                refs.eventError.textContent = imageError;
                return;
            }
        }

        setSaveBusy(true);
        const payload = {
            id: eventId || createId(),
            event_date: dateKey,
            title,
            event_time: time || null,
            description: sanitizeDescription(rawDescription),
            responsible: sanitizeResponsible(rawResponsible),
            categories,
            access_type: accessType,
            display_style: displayStyle,
            image_url: sanitizeImageUrl(refs.eventImageUrlInput.value) || null
        };
        if (imageFile) {
            const uploadResult = await uploadEventImageFile(imageFile, dateKey, payload.id);
            if (uploadResult.errorMessage) {
                setSaveBusy(false);
                refs.eventError.textContent = uploadResult.errorMessage;
                return;
            }
            payload.image_url = uploadResult.url;
        }
        const response = await saveEventPayload(payload, eventId);
        setSaveBusy(false);

        if (response.error) {
            refs.eventError.textContent = normalizeSupabaseError(response.error, "Não foi possível salvar o evento online.");
            return;
        }

        await refreshEvents({ silent: true, showToastOnError: false });
        closeModal(refs.eventModal);
        showToast(eventId ? "Evento atualizado com sucesso." : "Evento criado com sucesso.");
    }

    async function handleDeleteEvent() {
        const eventId = refs.eventIdInput.value;
        if (!eventId || !client) {
            return;
        }
        if (!isLoggedIn()) {
            showToast("Entre como administrador para excluir eventos.", true);
            return;
        }
        if (!window.confirm("Deseja realmente excluir este evento?")) {
            return;
        }
        setDeleteBusy(true);
        const { error } = await client.from(getEventsTableName()).delete().eq("id", eventId);
        setDeleteBusy(false);
        if (error) {
            showToast(normalizeSupabaseError(error, "Não foi possível excluir o evento online."), true);
            return;
        }
        await refreshEvents({ silent: true, showToastOnError: false });
        closeModal(refs.eventModal);
        showToast("Evento excluído.");
    }

    async function saveEventPayload(payload, eventId = "") {
        let includeDisplayStyle = true;
        let includeResponsible = true;
        let response = await mutateEventPayload(payload, eventId, includeDisplayStyle, includeResponsible);

        while (response.error) {
            if (isMissingResponsibleColumnError(response.error) && includeResponsible) {
                includeResponsible = false;
                response = await mutateEventPayload(payload, eventId, includeDisplayStyle, includeResponsible);
                continue;
            }
            if (isMissingDisplayStyleColumnError(response.error) && includeDisplayStyle) {
                includeDisplayStyle = false;
                response = await mutateEventPayload(payload, eventId, includeDisplayStyle, includeResponsible);
                continue;
            }
            return response;
        }

        return response;
    }

    function mutateEventPayload(payload, eventId, includeDisplayStyle, includeResponsible) {
        const mutationPayload = buildEventMutationPayload(payload, includeDisplayStyle, includeResponsible);
        return eventId
            ? client.from(getEventsTableName()).update(mutationPayload).eq("id", eventId)
            : client.from(getEventsTableName()).insert(Object.assign({ id: payload.id }, mutationPayload));
    }

    function buildEventMutationPayload(payload, includeDisplayStyle, includeResponsible) {
        const mutationPayload = {
            event_date: payload.event_date,
            title: payload.title,
            event_time: payload.event_time,
            description: payload.description,
            categories: payload.categories,
            access_type: payload.access_type,
            image_url: payload.image_url || null
        };

        if (includeResponsible) {
            mutationPayload.responsible = payload.responsible;
        }

        if (includeDisplayStyle) {
            mutationPayload.display_style = payload.display_style;
        }

        return mutationPayload;
    }

    function handleEventImageSelection() {
        const file = refs.eventImageInput.files && refs.eventImageInput.files[0] ? refs.eventImageInput.files[0] : null;
        if (!file) {
            renderEventImagePreview(refs.eventImageUrlInput.value);
            return;
        }
        const imageError = validateEventImageFile(file);
        if (imageError) {
            refs.eventImageInput.value = "";
            refs.eventError.textContent = imageError;
            renderEventImagePreview(refs.eventImageUrlInput.value);
            return;
        }
        refs.eventError.textContent = "";
        renderEventImagePreview(URL.createObjectURL(file), true);
    }

    function handleRemoveEventImage() {
        refs.eventImageInput.value = "";
        refs.eventImageUrlInput.value = "";
        renderEventImagePreview("");
    }

    async function handleImportLegacyEvents() {
        if (!client || !isLoggedIn()) {
            showToast("Entre como administrador para importar os eventos locais.", true);
            return;
        }
        const rows = mapEventsMapToRows(loadLegacyEvents());
        if (!rows.length) {
            state.legacyEventsDetected = false;
            render();
            showToast("Nenhum evento local encontrado para importação.");
            return;
        }
        state.isImportingLegacy = true;
        render();
        const { error } = await client.from(getEventsTableName()).upsert(rows, { onConflict: "id" });
        state.isImportingLegacy = false;
        if (error) {
            render();
            showToast(normalizeSupabaseError(error, "Não foi possível importar os eventos locais."), true);
            return;
        }
        clearLegacyLocalEvents();
        state.legacyEventsDetected = false;
        await refreshEvents({ silent: true, showToastOnError: false });
        showToast("Eventos locais importados para a agenda online.");
    }

    function changeMonth(step) {
        state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + step, 1);
        ensureSelectedDateVisible();
        render();
    }

    function jumpToToday() {
        const today = new Date();
        state.currentMonth = startOfMonth(today);
        state.selectedDate = formatDateKey(today);
        render();
    }

    function buildEmptyStateMessage() {
        if (!state.isConfigured) {
            return "A agenda online ainda não foi configurada. Preencha o config.js e conecte este site ao Supabase.";
        }
        if (state.isLoadingEvents && !state.hasLoadedEvents) {
            return "Carregando eventos da agenda online...";
        }
        if (state.eventsError) {
            return state.eventsError;
        }
        if (isPastDateKey(state.selectedDate)) {
            return state.activeCategoryFilter === CATEGORY_FILTER_ALL
                ? "Esta data já passou e está disponível apenas para consulta."
                : "Esta data já passou. Não há eventos da categoria selecionada para exibir.";
        }
        if (isLoggedIn()) {
            return state.activeCategoryFilter === CATEGORY_FILTER_ALL
                ? "Nenhum evento cadastrado nesta data. Clique no dia selecionado para abrir o formulário."
                : "Nenhum evento desta categoria nesta data. Clique no dia selecionado para abrir o formulário.";
        }
        return state.activeCategoryFilter === CATEGORY_FILTER_ALL
            ? "Ainda não há eventos publicados para este dia."
            : "Ainda não há eventos publicados nesta categoria para este dia.";
    }

    function buildSyncNote() {
        if (!state.isConfigured) {
            return "O site já está pronto para usar Supabase, mas você ainda precisa preencher o config.js e executar o script SQL de configuração.";
        }
        if (state.isLoadingEvents) {
            return "A agenda está sincronizando os eventos publicados no banco online.";
        }
        if (state.eventsError) {
            return "Houve uma falha ao falar com o banco online. Confira o config.js, a tabela calendar_events e as policies do Supabase.";
        }
        if (state.legacyEventsDetected && isLoggedIn()) {
            return "Este navegador ainda possui eventos antigos salvos localmente. Use o botão abaixo para enviá-los para a agenda online compartilhada.";
        }
        return isLoggedIn()
            ? "Você está conectado ao banco online. Qualquer evento salvo aqui ficará visível para quem acessar o site de qualquer lugar."
            : "Os eventos exibidos aqui vêm da agenda online compartilhada.";
    }

    function isDenseCalendarView() {
        return state.calendarLayoutMode === "dense";
    }

    function isCompactCalendarView() {
        return state.calendarLayoutMode === "compact";
    }

    function shouldScrollToSidebar() {
        return window.matchMedia("(max-width: 1140px)").matches;
    }

    function scrollSidebarIntoView() {
        if (!refs.sidebarCard) {
            return;
        }

        window.setTimeout(() => {
            refs.sidebarCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 80);
    }

    function handleViewportResize() {
        window.clearTimeout(handleViewportResize.timerId);
        handleViewportResize.timerId = window.setTimeout(() => {
            if (!calendarLayoutObserver) {
                updateCalendarLayoutMode();
            }
            render();
            queueParentFrameHeightSync();
        }, 120);
    }

    handleViewportResize.timerId = 0;

    function queueParentFrameHeightSync() {
        if (!state.isEmbedMode || window.parent === window || parentFrameHeightSyncId) {
            return;
        }

        parentFrameHeightSyncId = window.requestAnimationFrame(() => {
            parentFrameHeightSyncId = 0;
            syncParentFrameHeight();
            window.setTimeout(syncParentFrameHeight, 180);
        });
    }

    function syncParentFrameHeight() {
        if (!state.isEmbedMode || window.parent === window) {
            return;
        }

        const height = Math.ceil(Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            refs.calendarGrid ? refs.calendarGrid.getBoundingClientRect().bottom : 0
        ));

        window.parent.postMessage({
            type: "amargosa-calendar-height",
            height
        }, window.location.origin);
    }

    function getFilteredEventsForDate(dateKey) {
        return getEventsForDate(dateKey).filter((eventItem) => {
            const matchesCategory = state.activeCategoryFilter === CATEGORY_FILTER_ALL || sanitizeEventCategories(eventItem.categories).includes(state.activeCategoryFilter);
            const matchesAccess = state.activeAccessFilter === CATEGORY_FILTER_ALL || sanitizeAccessType(eventItem.accessType) === state.activeAccessFilter;
            return matchesCategory && matchesAccess;
        });
    }

    function getCalendarDisplayEventsForDate(dateKey, events = getFilteredEventsForDate(dateKey)) {
        const orderedEvents = sortEvents((Array.isArray(events) ? events : []).slice());
        if (!shouldPrioritizeCurrentDayEvents(dateKey, orderedEvents.length)) {
            return orderedEvents;
        }

        const upcomingEvents = [];
        const expiredEvents = [];

        orderedEvents.forEach((eventItem) => {
            if (isEventExpiredForHighlight(dateKey, eventItem)) {
                expiredEvents.push(eventItem);
            } else {
                upcomingEvents.push(eventItem);
            }
        });

        return upcomingEvents.concat(expiredEvents);
    }

    function shouldPrioritizeCurrentDayEvents(dateKey, eventCount) {
        return eventCount >= 4 && dateKey === formatDateKey(new Date());
    }

    function isEventExpiredForHighlight(dateKey, eventItem) {
        const eventStart = getEventStartDate(dateKey, eventItem && eventItem.time);
        if (!eventStart) {
            return false;
        }
        return Date.now() >= (eventStart.getTime() + (60 * 60 * 1000));
    }

    function getEventStartDate(dateKey, timeValue) {
        const time = normalizeTimeValue(timeValue);
        const [hours, minutes] = String(time).split(":").map(Number);
        if (!time || !Number.isFinite(hours) || !Number.isFinite(minutes)) {
            return null;
        }

        const eventDate = parseDateKey(dateKey);
        if (!(eventDate instanceof Date) || Number.isNaN(eventDate.getTime())) {
            return null;
        }

        return new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            hours,
            minutes,
            0,
            0
        );
    }

    function getEventsForDate(dateKey) {
        return Array.isArray(state.events[dateKey]) ? state.events[dateKey] : [];
    }

    function buildEventsMap(rows) {
        return rows.reduce((map, row) => {
            const dateKey = String(row.event_date || "").trim();
            if (!dateKey) {
                return map;
            }
            if (!map[dateKey]) {
                map[dateKey] = [];
            }
            map[dateKey].push({
                id: String(row.id || createId()),
                title: sanitizeTitle(row.title || ""),
                time: normalizeTimeValue(row.event_time),
                description: sanitizeDescription(row.description || ""),
                responsible: sanitizeResponsible(row.responsible || ""),
                categories: sanitizeEventCategories(row.categories || []),
                accessType: sanitizeAccessType(row.access_type),
                displayStyle: sanitizeDisplayStyle(row.display_style),
                imageUrl: sanitizeImageUrl(row.image_url || "")
            });
            map[dateKey] = sortEvents(map[dateKey]);
            return map;
        }, {});
    }

    function mapEventsMapToRows(eventsMap) {
        const rows = [];
        Object.entries(eventsMap || {}).forEach(([dateKey, events]) => {
            if (!Array.isArray(events)) {
                return;
            }
            events.forEach((eventItem) => {
                const title = sanitizeTitle(eventItem.title || "");
                if (!title) {
                    return;
                }
                rows.push({
                    id: String(eventItem.id || createId()),
                    event_date: dateKey,
                    title,
                    event_time: normalizeTimeValue(eventItem.time) || null,
                    description: sanitizeDescription(eventItem.description || ""),
                    responsible: sanitizeResponsible(eventItem.responsible || ""),
                    categories: sanitizeEventCategories(eventItem.categories || []),
                    access_type: sanitizeAccessType(eventItem.accessType),
                    display_style: sanitizeDisplayStyle(eventItem.displayStyle),
                    image_url: sanitizeImageUrl(eventItem.imageUrl || "") || null
                });
            });
        });
        return rows;
    }

    function getSelectedEventCategories() {
        return sanitizeEventCategories(Array.from(refs.eventCategoryOptions.querySelectorAll("input[name=\"categories\"]:checked"), (input) => input.value));
    }

    function setSelectedEventCategories(categoryIds) {
        const selected = sanitizeEventCategories(categoryIds);
        refs.eventCategoryOptions.querySelectorAll("input[name=\"categories\"]").forEach((input) => {
            input.checked = selected.includes(input.value);
        });
    }

    function getSelectedAccessType() {
        const selectedInput = refs.eventAccessOptions.querySelector("input[name=\"accessType\"]:checked");
        return sanitizeAccessType(selectedInput ? selectedInput.value : "");
    }

    function setSelectedAccessType(value) {
        const selected = sanitizeAccessType(value);
        refs.eventAccessOptions.querySelectorAll("input[name=\"accessType\"]").forEach((input) => {
            input.checked = input.value === selected;
        });
    }

    function getSelectedDisplayStyle() {
        return DISPLAY_STYLE_BAR;
    }

    function setSelectedDisplayStyle(value) {
        return sanitizeDisplayStyle(value);
    }

    function sanitizeAccessType(value) {
        return String(value || "").trim() === ACCESS_TYPE_PAID ? ACCESS_TYPE_PAID : ACCESS_TYPE_FREE;
    }

    function sanitizeDisplayStyle(value) {
        return DISPLAY_STYLE_BAR;
    }

    function isPaidEvent(eventItem) {
        return sanitizeAccessType(eventItem && eventItem.accessType) === ACCESS_TYPE_PAID;
    }

    function isFullBarEvent(eventItem) {
        return sanitizeDisplayStyle(eventItem && eventItem.displayStyle) === DISPLAY_STYLE_BAR;
    }

    function hasOnlyPaidEvents(events) {
        return Array.isArray(events) && events.length > 0 && events.every((eventItem) => isPaidEvent(eventItem));
    }

    function hasOnlyFreeEvents(events) {
        return Array.isArray(events) && events.length > 0 && events.every((eventItem) => !isPaidEvent(eventItem));
    }

    function hasMixedAccessEvents(events) {
        return Array.isArray(events) && events.some((eventItem) => isPaidEvent(eventItem)) && events.some((eventItem) => !isPaidEvent(eventItem));
    }

    function sanitizeEventCategories(value) {
        const values = Array.isArray(value) ? value : (value ? [value] : []);
        return values.reduce((categories, entry) => {
            const resolved = resolveCategoryId(entry);
            if (resolved && !categories.includes(resolved)) {
                categories.push(resolved);
            }
            return categories;
        }, []);
    }

    function resolveCategoryId(value) {
        const rawValue = String(value || "").trim();
        if (!rawValue) {
            return "";
        }
        const directMatch = CATEGORY_LOOKUP[rawValue];
        if (directMatch) {
            return directMatch.id;
        }
        const normalizedMatch = CATEGORY_LOOKUP[normalizeCategoryValue(rawValue)];
        return normalizedMatch ? normalizedMatch.id : "";
    }

    function normalizeCategoryValue(value) {
        return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    function sanitizeTitle(value) {
        return String(value || "").trim().slice(0, MAX_TITLE_LENGTH);
    }

    function sanitizeDescription(value) {
        return String(value || "").trim().slice(0, MAX_DESCRIPTION_LENGTH);
    }

    function sanitizeResponsible(value) {
        return String(value || "").trim().slice(0, MAX_RESPONSIBLE_LENGTH);
    }

    function sanitizeImageUrl(value) {
        const url = String(value || "").trim();
        return /^https?:\/\//i.test(url) ? url : "";
    }

    function validateEventImageFile(file) {
        if (!file) {
            return "";
        }
        if (!EVENT_IMAGE_MIME_TYPES.has(file.type)) {
            return "Use uma imagem JPG, PNG, WEBP ou GIF.";
        }
        if (file.size > MAX_EVENT_IMAGE_BYTES) {
            return "A imagem deve ter no maximo 4 MB.";
        }
        return "";
    }

    function renderEventImagePreview(url, isTemporary = false) {
        const imageUrl = sanitizeImageUrl(url) || (isTemporary ? String(url || "") : "");
        refs.eventImagePreview.hidden = !imageUrl;
        refs.removeEventImageButton.hidden = !imageUrl;
        refs.eventImagePreviewImage.src = imageUrl;
    }

    async function uploadEventImageFile(file, dateKey, eventId) {
        if (!client || !client.storage) {
            return { errorMessage: "O upload de imagem depende do Supabase Storage." };
        }
        const filePath = buildEventImageStoragePath(file, dateKey, eventId);
        const { error } = await client.storage
            .from(getEventImagesBucketName())
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type
            });
        if (error) {
            return {
                errorMessage: normalizeSupabaseError(error, "Nao foi possivel enviar a imagem do evento.")
            };
        }
        const { data } = client.storage.from(getEventImagesBucketName()).getPublicUrl(filePath);
        return { url: sanitizeImageUrl(data && data.publicUrl) };
    }

    function buildEventImageStoragePath(file, dateKey, eventId) {
        const extension = getImageFileExtension(file);
        return [
            sanitizeStoragePathSegment(dateKey || "evento"),
            sanitizeStoragePathSegment(eventId || createId()) + "-" + Date.now() + extension
        ].join("/");
    }

    function getImageFileExtension(file) {
        const nameExtension = String((file && file.name) || "").toLowerCase().match(/\.[a-z0-9]+$/);
        if (nameExtension) {
            return nameExtension[0];
        }
        if (file && file.type === "image/png") {
            return ".png";
        }
        if (file && file.type === "image/webp") {
            return ".webp";
        }
        if (file && file.type === "image/gif") {
            return ".gif";
        }
        return ".jpg";
    }

    function sanitizeStoragePathSegment(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "") || "evento";
    }

    function normalizeTimeValue(value) {
        const match = String(value || "").trim().match(/^(\d{2}):(\d{2})/);
        return match ? match[1] + ":" + match[2] : "";
    }

    function getEventCategoryDetails(categoryIds) {
        return sanitizeEventCategories(categoryIds).map((categoryId) => CATEGORY_LOOKUP[categoryId]).filter(Boolean);
    }

    function getPrimaryEventCategory(categoryDetails) {
        return Array.isArray(categoryDetails) && categoryDetails.length ? categoryDetails[0] : null;
    }

    function applyEventAccent(element, category) {
        if (!element || !category || !category.color) {
            return;
        }
        element.style.setProperty("--event-color", category.color);
        element.style.setProperty("--event-color-rgb", hexColorToRgbChannels(category.color));
    }

    function buildEventCategoryList(categoryDetails, options = {}) {
        const categories = Array.isArray(categoryDetails) ? categoryDetails.filter(Boolean) : [];
        if (!categories.length) {
            return null;
        }

        const maxVisible = Number.isFinite(options.maxVisible)
            ? Math.max(1, Math.floor(options.maxVisible))
            : categories.length;
        const visibleCategories = categories.slice(0, maxVisible);
        const accentColor = String(options.accentColor || (categories[0] && categories[0].color) || "").trim();
        const list = document.createElement("div");
        list.className = "event-category-list" + (options.compact ? " event-category-list--compact" : "");

        if (accentColor) {
            list.style.setProperty("--event-color", accentColor);
            list.style.setProperty("--event-color-rgb", hexColorToRgbChannels(accentColor));
        }

        visibleCategories.forEach((category) => {
            const badge = document.createElement("span");
            badge.className = "event-category-badge";
            badge.textContent = category.label;
            badge.style.setProperty("--category-color", category.color);
            badge.style.setProperty("--category-color-rgb", hexColorToRgbChannels(category.color));
            list.appendChild(badge);
        });

        if (categories.length > visibleCategories.length) {
            const more = document.createElement("span");
            more.className = "event-category-more";
            more.textContent = "+" + (categories.length - visibleCategories.length);
            list.appendChild(more);
        }

        return list;
    }

    function buildEventAccessBadge(value) {
        const accessType = EVENT_ACCESS_TYPES[sanitizeAccessType(value)] || EVENT_ACCESS_TYPES[ACCESS_TYPE_FREE];
        const badge = document.createElement("span");
        badge.className = "event-access-badge " + accessType.className;
        badge.textContent = accessType.label;
        return badge;
    }

    function hexColorToRgbChannels(value) {
        const rawHex = String(value || "").trim().replace(/^#/, "");
        const normalizedHex = rawHex.length === 3
            ? rawHex.split("").map((character) => character + character).join("")
            : rawHex;

        if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) {
            return "21, 124, 98";
        }

        return [
            parseInt(normalizedHex.slice(0, 2), 16),
            parseInt(normalizedHex.slice(2, 4), 16),
            parseInt(normalizedHex.slice(4, 6), 16)
        ].join(", ");
    }

    function buildCategoryFilterButton(categoryId, label, color) {
        const isActive = state.activeCategoryFilter === categoryId;
        return "<button class=\"category-filter-chip" + (isActive ? " active" : "") + "\" type=\"button\" data-category-filter=\"" + categoryId + "\" aria-pressed=\"" + String(isActive) + "\" style=\"--category-color: " + color + "\">" + label + "</button>";
    }

    function buildDayAriaLabel(date, count) {
        return formatFullDate(date) + (count ? ". " + formatEventCount(count, "cadastrado") + "." : ". Nenhum evento.");
    }

    function formatEventCount(count, suffix = "") {
        const ending = suffix ? " " + (count === 1 ? suffix : suffix + "s") : "";
        return count + " " + (count === 1 ? "evento" : "eventos") + ending;
    }

    function sortEvents(events) {
        return events.sort((left, right) => {
            if (!left.time && !right.time) {
                return left.title.localeCompare(right.title, "pt-BR");
            }
            if (!left.time) {
                return 1;
            }
            if (!right.time) {
                return -1;
            }
            return left.time.localeCompare(right.time, "pt-BR");
        });
    }

    function openModal(modal, focusTarget) {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        updateModalOpenState();
        queueParentFrameHeightSync();
        if (focusTarget) {
            window.setTimeout(() => focusTarget.focus(), 40);
        }
    }

    function closeModal(modal) {
        if (!modal) {
            return;
        }
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        updateModalOpenState();
        queueParentFrameHeightSync();
        if (modal === refs.loginModal) {
            refs.loginForm.reset();
            refs.loginError.textContent = "";
            setLoginBusy(false);
        }
        if (modal === refs.eventModal) {
            refs.eventError.textContent = "";
            setSaveBusy(false);
            setDeleteBusy(false);
        }
        if (modal === refs.imageViewerModal) {
            refs.imageViewerImage.removeAttribute("src");
            refs.imageViewerImage.alt = "";
        }
    }

    function updateModalOpenState() {
        const hasOpenModal = [refs.loginModal, refs.eventModal, refs.dayDetailsModal, refs.imageViewerModal]
            .some((modal) => modal && modal.classList.contains("open"));
        document.body.classList.toggle("modal-open", hasOpenModal);
    }

    function setupModalScrollChaining() {
        if (!state.isEmbedMode || window.parent === window) {
            return;
        }

        [refs.loginModal, refs.eventModal, refs.dayDetailsModal, refs.imageViewerModal].forEach((modal) => {
            const modalBody = modal.querySelector(".modal-body");
            if (!modalBody) {
                return;
            }

            let previousTouchY = 0;
            modalBody.addEventListener("touchstart", (event) => {
                previousTouchY = event.touches && event.touches[0] ? event.touches[0].clientY : 0;
            }, { passive: true });

            modalBody.addEventListener("touchmove", (event) => {
                if (!modal.classList.contains("open") || !event.touches || !event.touches[0]) {
                    return;
                }

                const currentTouchY = event.touches[0].clientY;
                const deltaY = previousTouchY - currentTouchY;
                previousTouchY = currentTouchY;
                if (Math.abs(deltaY) < 1) {
                    return;
                }
                relayScrollToParentAtBoundary(modalBody, deltaY, event);
            }, { passive: false });

            modalBody.addEventListener("wheel", (event) => {
                if (modal.classList.contains("open")) {
                    relayScrollToParentAtBoundary(modalBody, event.deltaY, event);
                }
            }, { passive: false });
        });
    }

    function relayScrollToParentAtBoundary(scrollElement, deltaY, event) {
        if (!deltaY) {
            return false;
        }

        const atTop = scrollElement.scrollTop <= 0;
        const atBottom = Math.ceil(scrollElement.scrollTop + scrollElement.clientHeight) >= scrollElement.scrollHeight;
        const shouldRelay = (deltaY < 0 && atTop) || (deltaY > 0 && atBottom);
        if (shouldRelay) {
            if (event.cancelable) {
                event.preventDefault();
            }
            window.parent.postMessage({
                type: "amargosa-calendar-scroll",
                deltaY
            }, window.location.origin);
            return true;
        }

        return false;
    }

    function setLoginBusy(isBusy) {
        refs.loginSubmitButton.disabled = isBusy;
        refs.loginSubmitButton.textContent = isBusy ? "Entrando..." : "Entrar";
    }

    function setSaveBusy(isBusy) {
        state.isSavingEvent = isBusy;
        refs.saveEventButton.disabled = isBusy;
        refs.saveEventButton.textContent = isBusy ? "Salvando..." : "Salvar evento";
    }

    function setDeleteBusy(isBusy) {
        refs.deleteEventButton.disabled = isBusy;
        refs.deleteEventButton.textContent = isBusy ? "Excluindo..." : "Excluir evento";
    }

    function setEventFormMode(mode) {
        const isDeleteOnly = mode === "delete-only";
        refs.eventForm.dataset.mode = mode;
        refs.eventForm.classList.toggle("event-form--delete-only", isDeleteOnly);
        refs.eventTitle.readOnly = isDeleteOnly;
        refs.eventTime.readOnly = isDeleteOnly;
        refs.eventDescription.readOnly = isDeleteOnly;
        refs.eventResponsible.readOnly = isDeleteOnly;
        refs.eventImageInput.disabled = isDeleteOnly;
        refs.removeEventImageButton.disabled = isDeleteOnly;
        refs.eventAccessOptions.querySelectorAll("input[name=\"accessType\"]").forEach((input) => {
            input.disabled = isDeleteOnly;
        });
        if (refs.eventDisplayOptions) {
            refs.eventDisplayOptions.querySelectorAll("input[name=\"displayStyle\"]").forEach((input) => {
                input.disabled = isDeleteOnly;
            });
        }
        refs.eventCategoryOptions.querySelectorAll("input[name=\"categories\"]").forEach((input) => {
            input.disabled = isDeleteOnly;
        });
        refs.saveEventButton.hidden = isDeleteOnly;
        refs.saveEventButton.disabled = isDeleteOnly || state.isSavingEvent;
    }

    function showToast(message, isError = false) {
        const toast = document.createElement("div");
        toast.className = "toast";
        if (isError) {
            toast.style.borderColor = "rgba(217, 93, 71, 0.2)";
            toast.style.color = "#9b2f1f";
        }
        toast.textContent = message;
        refs.toastStack.appendChild(toast);
        window.setTimeout(() => toast.remove(), 3200);
    }

    function loadThemeState() {
        try {
            return localStorage.getItem(STORAGE_KEYS.theme) === "dark";
        } catch (_error) {
            return false;
        }
    }

    function saveThemeState(isDarkMode) {
        try {
            localStorage.setItem(STORAGE_KEYS.theme, isDarkMode ? "dark" : "light");
        } catch (_error) {}
    }

    function loadLegacyEvents() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.legacyEvents);
            return raw ? JSON.parse(raw) : {};
        } catch (_error) {
            return {};
        }
    }

    function clearLegacyLocalEvents() {
        try {
            localStorage.removeItem(STORAGE_KEYS.legacyEvents);
        } catch (_error) {}
    }

    function hasLegacyLocalEvents() {
        return Object.values(loadLegacyEvents()).some((events) => Array.isArray(events) && events.length > 0);
    }

    function isLoggedIn() {
        return Boolean(state.session && state.session.user);
    }

    function getEventsTableName() {
        return config ? config.eventsTable : DEFAULT_EVENTS_TABLE;
    }

    function getEventImagesBucketName() {
        return config ? config.eventImagesBucket : DEFAULT_EVENT_IMAGES_BUCKET;
    }

    function isMissingImageUrlColumnError(error) {
        const rawMessage = String((error && error.message) || "").trim().toLowerCase();
        return rawMessage.includes("image_url");
    }

    function isMissingResponsibleColumnError(error) {
        const rawMessage = String((error && error.message) || "").trim().toLowerCase();
        return rawMessage.includes("responsible");
    }

    function isMissingAccessTypeColumnError(error) {
        const rawMessage = String((error && error.message) || "").trim().toLowerCase();
        return rawMessage.includes("access_type");
    }

    function isMissingDisplayStyleColumnError(error) {
        const rawMessage = String((error && error.message) || "").trim().toLowerCase();
        return rawMessage.includes("display_style");
    }

    function normalizeSupabaseError(error, fallbackMessage) {
        const rawMessage = String((error && error.message) || "").trim().toLowerCase();
        if (!rawMessage) {
            return fallbackMessage;
        }
        if (rawMessage.includes("invalid login credentials")) {
            return "E-mail ou senha inválidos.";
        }
        if (rawMessage.includes("email not confirmed")) {
            return "Confirme o e-mail da conta administrativa antes de entrar.";
        }
        if (rawMessage.includes("row-level security")) {
            return "O Supabase bloqueou a operação. Revise as policies da tabela calendar_events.";
        }
        if (rawMessage.includes("relation") && rawMessage.includes("does not exist")) {
            return "A tabela calendar_events ainda não existe. Execute o arquivo supabase-setup.sql no Supabase.";
        }
        if (rawMessage.includes("bucket") && rawMessage.includes("not found")) {
            return "O bucket de imagens ainda nao existe. Execute novamente o arquivo supabase-setup.sql no Supabase.";
        }
        if (rawMessage.includes("image_url")) {
            return "A coluna image_url ainda nao existe. Execute novamente o arquivo supabase-setup.sql no Supabase.";
        }
        if (rawMessage.includes("responsible")) {
            return "A coluna responsible ainda nao existe. Execute o SQL de atualizacao do calendario no Supabase.";
        }
        if (rawMessage.includes("access_type")) {
            return "A coluna access_type ainda nao existe. Execute novamente o arquivo supabase-setup.sql no Supabase.";
        }
        if (rawMessage.includes("display_style")) {
            return "A coluna display_style ainda nao existe. Execute novamente o arquivo supabase-setup.sql no Supabase.";
        }
        if (rawMessage.includes("failed to fetch")) {
            return "Não foi possível conectar ao banco online agora.";
        }
        return String((error && error.message) || fallbackMessage);
    }

    function getCalendarConfig() {
        const rawConfig = window.CALENDAR_CONFIG && typeof window.CALENDAR_CONFIG === "object" ? window.CALENDAR_CONFIG : null;
        if (!rawConfig) {
            return null;
        }
        const supabaseUrl = String(rawConfig.supabaseUrl || "").trim();
        const supabaseAnonKey = String(rawConfig.supabaseAnonKey || "").trim();
        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("YOUR_PROJECT") || supabaseAnonKey.includes("YOUR_SUPABASE")) {
            return null;
        }
        return {
            supabaseUrl,
            supabaseAnonKey,
            eventsTable: String(rawConfig.eventsTable || DEFAULT_EVENTS_TABLE).trim() || DEFAULT_EVENTS_TABLE,
            eventImagesBucket: String(rawConfig.eventImagesBucket || DEFAULT_EVENT_IMAGES_BUCKET).trim() || DEFAULT_EVENT_IMAGES_BUCKET,
            adminEmailHint: String(rawConfig.adminEmailHint || "").trim(),
            autoRefreshIntervalMs: Math.max(15000, Number(rawConfig.autoRefreshIntervalMs) || DEFAULT_REFRESH_MS)
        };
    }

    function createBackendClient(currentConfig) {
        if (!currentConfig || !window.supabase || typeof window.supabase.createClient !== "function") {
            return null;
        }
        return window.supabase.createClient(currentConfig.supabaseUrl, currentConfig.supabaseAnonKey, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
    }

    function ensureSelectedDateVisible() {
        const selected = parseDateKey(state.selectedDate);
        if (selected.getFullYear() !== state.currentMonth.getFullYear() || selected.getMonth() !== state.currentMonth.getMonth()) {
            state.selectedDate = formatDateKey(new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth(), 1));
        }
    }

    function isPastDateKey(dateKey) {
        return startOfDay(parseDateKey(dateKey)) < startOfDay(new Date());
    }

    function detectEmbedMode() {
        const params = new URLSearchParams(window.location.search);
        const embedValue = params.get("embed") || params.get("mode");
        return EMBED_MODE_TRUE_VALUES.has(String(embedValue || "").trim().toLowerCase());
    }

    function formatMonthYear(date) {
        return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
    }

    function formatFullDate(date) {
        return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(date);
    }

    function formatDateKey(date) {
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    }

    function parseDateKey(dateKey) {
        const [year, month, day] = String(dateKey || "").split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    function startOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function createId() {
        return window.crypto && typeof window.crypto.randomUUID === "function"
            ? window.crypto.randomUUID()
            : "evt-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    }

})();
