(() => {
  "use strict";

  const HISTORY_KEY = "fcc_exam_time_history_single_v1";
  const CONTEXT_KEY = "fcc_portal_context_v2";
  const MAX_HISTORY = 5;
  const INTRO_DURATION = 4000;
  const OCR_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
  const OCR_MAX_UPLOAD_BYTES = 900 * 1024;
  const OCR_DIMENSION_STEPS = [1800, 1600, 1400, 1200, 1000];
  const OCR_QUALITY_STEPS = [0.88, 0.80, 0.72, 0.64, 0.56];

  const el = {
    form: document.getElementById("examForm"),
    startTime: document.getElementById("startTime"),
    durationHours: document.getElementById("durationHours"),
    durationMinutes: document.getElementById("durationMinutes"),
    minimumHours: document.getElementById("minimumHours"),
    minimumMinutes: document.getElementById("minimumMinutes"),
    validation: document.getElementById("validationMessage"),
    quickButtons: [...document.querySelectorAll(".quick-times button")],
    reset: document.getElementById("resetBtn"),
    resultCard: document.getElementById("resultCard"),
    endTime: document.getElementById("endTime"),
    resultStart: document.getElementById("resultStart"),
    resultEnd: document.getElementById("resultEnd"),
    durationValue: document.getElementById("durationValue"),
    resultMinimumStay: document.getElementById("resultMinimumStay"),
    resultMinimumExit: document.getElementById("resultMinimumExit"),
    dayIndicator: document.getElementById("dayIndicator"),
    statusPill: document.getElementById("statusPill"),
    timelineCaption: document.getElementById("timelineCaption"),
    timelineProgress: document.getElementById("timelineProgress"),
    timelineStart: document.getElementById("timelineStart"),
    timelineEnd: document.getElementById("timelineEnd"),
    summary: document.getElementById("summaryText"),
    copy: document.getElementById("copyBtn"),
    toast: document.getElementById("toast"),
    toastText: document.getElementById("toastText"),
    history: document.getElementById("historyList"),
    clearHistory: document.getElementById("clearHistoryBtn"),

    contextModal: document.getElementById("contextModal"),
    projectSelect: document.getElementById("projectSelect"),
    newProjectWrap: document.getElementById("newProjectWrap"),
    newProjectName: document.getElementById("newProjectName"),
    periodOptions: [...document.querySelectorAll(".period-option")],
    contextAlert: document.getElementById("contextAlert"),
    enterPortal: document.getElementById("enterPortalBtn"),
    continueProject: document.getElementById("continueProjectBtn"),
    backProject: document.getElementById("backProjectBtn"),
    projectStepPanel: document.getElementById("projectStepPanel"),
    periodStepPanel: document.getElementById("periodStepPanel"),
    projectProgress: document.getElementById("projectProgress"),
    periodProgress: document.getElementById("periodProgress"),
    ocrProgress: document.getElementById("ocrProgress"),
    wizardProjectName: document.getElementById("wizardProjectName"),
    contextModalTitle: document.getElementById("contextModalTitle"),
    contextModalSubtitle: document.getElementById("contextModalSubtitle"),
    changeContext: document.getElementById("changeContextBtn"),
    topContext: document.getElementById("topContextBtn"),
    sideProjectName: document.getElementById("sideProjectName"),
    sidePeriodName: document.getElementById("sidePeriodName"),
    topProjectName: document.getElementById("topProjectName"),
    topPeriodName: document.getElementById("topPeriodName"),
    footerContext: document.getElementById("footerContext"),

    mainMenu: document.getElementById("mainMenu"),
    mainMenuBtn: document.getElementById("mainMenuBtn"),
    mainMenuClose: document.getElementById("mainMenuClose"),
    mainMenuBackdrop: document.getElementById("mainMenuBackdrop"),
    menuProjects: document.getElementById("menuProjectsBtn"),
    menuCalculator: document.getElementById("menuCalculatorBtn"),
    menuPortal: document.getElementById("menuPortalBtn"),
    menuProjectName: document.getElementById("menuProjectName"),
    menuPeriodName: document.getElementById("menuPeriodName"),

    calculatorTab: document.getElementById("calculatorTabBtn"),
    portalTab: document.getElementById("portalTabBtn"),
    calculatorView: document.getElementById("calculatorView"),
    portalView: document.getElementById("portalView"),
    refreshPortal: document.getElementById("refreshPortalBtn"),
    portalCamera: document.getElementById("portalCameraBtn"),
    emptyCamera: document.getElementById("emptyCameraBtn"),
    portalSubtitle: document.getElementById("portalSubtitle"),
    portalRoomCount: document.getElementById("portalRoomCount"),
    portalCardCount: document.getElementById("portalCardCount"),
    portalModuleCount: document.getElementById("portalModuleCount"),
    portalStatus: document.getElementById("portalStatus"),
    roomsGrid: document.getElementById("roomsGrid"),
    portalEmpty: document.getElementById("portalEmpty"),
    directoryRoot: document.getElementById("directoryRoot"),
    roomDirectoryView: document.getElementById("roomDirectoryView"),
    directoryBack: document.getElementById("directoryBackBtn"),
    breadcrumbRoot: document.getElementById("breadcrumbRootBtn"),
    directoryBreadcrumb: document.getElementById("directoryBreadcrumb"),
    roomDirectoryCode: document.getElementById("roomDirectoryCode"),
    roomDirectoryMeta: document.getElementById("roomDirectoryMeta"),
    roomDirectoryRecords: document.getElementById("roomDirectoryRecords"),
    previousRoom: document.getElementById("previousRoomBtn"),
    nextRoom: document.getElementById("nextRoomBtn"),

    introScreen: document.getElementById("introScreen"),
    logos: [...document.querySelectorAll(".fcc-logo")],

    photoInput: document.getElementById("examPhotoInput"),
    takePhoto: document.getElementById("takePhotoBtn"),
    aiModal: document.getElementById("aiModal"),
    aiModalBackdrop: document.getElementById("aiModalBackdrop"),
    aiModalClose: document.getElementById("aiModalClose"),
    aiLoadingState: document.getElementById("aiLoadingState"),
    aiConfirmState: document.getElementById("aiConfirmState"),
    aiErrorState: document.getElementById("aiErrorState"),
    aiPhotoPreview: document.getElementById("aiPhotoPreview"),
    aiRoom: document.getElementById("aiRoom"),
    aiModules: document.getElementById("aiModules"),
    aiStartTime: document.getElementById("aiStartTime"),
    aiDuration: document.getElementById("aiDuration"),
    aiMinimumStay: document.getElementById("aiMinimumStay"),
    aiConfidence: document.getElementById("aiConfidence"),
    aiObservation: document.getElementById("aiObservation"),
    aiValidation: document.getElementById("aiValidation"),
    aiRetry: document.getElementById("aiRetryBtn"),
    aiConfirm: document.getElementById("aiConfirmBtn"),
    aiErrorRetry: document.getElementById("aiErrorRetryBtn"),
    aiErrorMessage: document.getElementById("aiErrorMessage"),
    ocrRawText: document.getElementById("ocrRawText"),
    ocrRawDetails: document.getElementById("ocrRawDetails"),

    resultModal: document.getElementById("resultModal"),
    resultModalBackdrop: document.getElementById("resultModalBackdrop"),
    resultModalClose: document.getElementById("resultModalClose"),
    resultModalOk: document.getElementById("resultModalOk"),
    resultModalCopy: document.getElementById("resultModalCopy"),
    modalEndTime: document.getElementById("modalEndTime"),
    modalDayIndicator: document.getElementById("modalDayIndicator"),
    modalStartTime: document.getElementById("modalStartTime"),
    modalDuration: document.getElementById("modalDuration"),
    modalMinimumStay: document.getElementById("modalMinimumStay"),
    modalMinimumExit: document.getElementById("modalMinimumExit"),
    resultPortalMeta: document.getElementById("resultPortalMeta"),
    resultPortalSaved: document.getElementById("resultPortalSaved"),
    modalRoom: document.getElementById("modalRoom"),
    modalModules: document.getElementById("modalModules"),
    modalPortalContext: document.getElementById("modalPortalContext")
  };

  let lastResult = null;
  let toastTimer = null;
  let autoTimer = null;
  let lastAiImageDataUrl = "";
  let lastOcrRawText = "";
  let currentContext = null;
  let pendingProject = null;
  let selectedPeriod = "";
  let lastPortalMeta = null;
  let portalRefreshTimer = null;
  let portalRoomFolders = [];
  let openRoomId = null;

  function enableLogoFallback(img) {
    if (!img) return;
    img.style.display = "none";
    const fallback = img.nextElementSibling;
    if (fallback) fallback.hidden = false;
  }

  function setupLogos() {
    el.logos.forEach((img) => {
      img.addEventListener("error", () => enableLogoFallback(img), { once: true });
      if (img.complete && (!img.naturalWidth || img.naturalWidth === 0)) {
        enableLogoFallback(img);
      }
    });
  }

  function initIntro() {
    window.setTimeout(() => {
      document.body.classList.remove("intro-playing");
      document.body.classList.add("intro-finished");

      if (el.introScreen) {
        el.introScreen.setAttribute("aria-hidden", "true");
        window.setTimeout(() => {
          el.introScreen.style.display = "none";
          window.setTimeout(() => openContextModal(), 120);
        }, 550);
      } else {
        openContextModal();
      }
    }, INTRO_DURATION);
  }

  function parseTime(value) {
    if (!/^\d{2}:\d{2}$/.test(value || "")) return null;
    const [hours, minutes] = value.split(":").map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return (hours * 60) + minutes;
  }

  function formatClock(totalMinutes) {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function formatDurationClock(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function formatDurationText(totalMinutes) {
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (minutes === 0) return hours === 1 ? "1 hora" : `${hours} horas`;
    return `${hours}h${String(minutes).padStart(2, "0")}`;
  }

  function sanitizeDurationPart(input) {
    input.value = input.value.replace(/\D/g, "").slice(0, 2);
  }

  function normalizeDurationFields() {
    const hoursRaw = el.durationHours.value.trim();
    const minutesRaw = el.durationMinutes.value.trim();

    el.durationHours.value = String(Math.min(Number(hoursRaw) || 0, 12)).padStart(2, "0");
    el.durationMinutes.value = String(Math.min(Number(minutesRaw) || 0, 59)).padStart(2, "0");
  }

  function getDurationMinutes() {
    const hoursText = el.durationHours.value.trim();
    const minutesText = el.durationMinutes.value.trim();

    if (!/^\d{1,2}$/.test(hoursText) || !/^\d{1,2}$/.test(minutesText)) return null;

    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || minutes > 59) return null;

    const total = (hours * 60) + minutes;
    if (total < 1 || total > 720) return null;
    return total;
  }

  function setDurationFields(totalMinutes) {
    const total = Number(totalMinutes);
    el.durationHours.value = String(Math.floor(total / 60)).padStart(2, "0");
    el.durationMinutes.value = String(total % 60).padStart(2, "0");
  }

  function normalizeMinimumFields() {
    const hoursRaw = el.minimumHours.value.trim();
    const minutesRaw = el.minimumMinutes.value.trim();

    el.minimumHours.value = String(Math.min(Number(hoursRaw) || 0, 12)).padStart(2, "0");
    el.minimumMinutes.value = String(Math.min(Number(minutesRaw) || 0, 59)).padStart(2, "0");
  }

  function getMinimumStayMinutes() {
    const hoursText = el.minimumHours.value.trim();
    const minutesText = el.minimumMinutes.value.trim();

    if (!/^\d{1,2}$/.test(hoursText) || !/^\d{1,2}$/.test(minutesText)) return null;

    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || minutes > 59) return null;

    const total = (hours * 60) + minutes;
    if (total < 1 || total > 720) return null;
    return total;
  }

  function setMinimumStayFields(totalMinutes) {
    const total = Number(totalMinutes);
    el.minimumHours.value = String(Math.floor(total / 60)).padStart(2, "0");
    el.minimumMinutes.value = String(total % 60).padStart(2, "0");
  }

  function validate() {
    const start = parseTime(el.startTime.value);
    const duration = getDurationMinutes();
    const minimumStay = getMinimumStayMinutes();

    if (start === null) {
      return { ok: false, message: "Informe um horário de início válido." };
    }

    if (duration === null) {
      return { ok: false, message: "Informe uma duração válida entre 00:01 e 12:00." };
    }

    if (minimumStay === null) {
      return { ok: false, message: "Informe uma permanência mínima válida entre 00:01 e 12:00." };
    }

    return { ok: true, start, duration, minimumStay };
  }

  function buildResult({ start, duration, minimumStay }) {
    const endAbsolute = start + duration;
    const minimumExitAbsolute = start + minimumStay;
    const startClock = formatClock(start);
    const endClock = formatClock(endAbsolute);
    const minimumExitClock = formatClock(minimumExitAbsolute);
    const durationClock = formatDurationClock(duration);
    const minimumStayClock = formatDurationClock(minimumStay);
    const crossesDay = endAbsolute >= 1440;
    const minimumCrossesDay = minimumExitAbsolute >= 1440;

    return {
      start: startClock,
      end: endClock,
      duration,
      durationClock,
      durationText: formatDurationText(duration),
      minimumStay,
      minimumStayClock,
      minimumExit: minimumExitClock,
      minimumCrossesDay,
      crossesDay,
      summary: `A prova começa às ${startClock}, possui duração de ${durationClock} e termina às ${endClock}${crossesDay ? " do dia seguinte" : ""}. A permanência mínima é de ${minimumStayClock}, permitindo liberação a partir de ${minimumExitClock}${minimumCrossesDay ? " do dia seguinte" : ""}.`
    };
  }

  function render(result, animate = true) {
    lastResult = result;
    el.validation.textContent = "";

    el.endTime.textContent = result.end;
    el.resultStart.textContent = result.start;
    el.resultEnd.textContent = result.end;
    el.durationValue.textContent = result.durationClock;
    el.resultMinimumStay.textContent = result.minimumStayClock;
    el.resultMinimumExit.textContent = result.minimumExit;
    el.statusPill.textContent = result.durationClock;
    el.timelineStart.textContent = result.start;
    el.timelineEnd.textContent = result.end;
    el.timelineCaption.textContent = `${result.durationClock} de duração`;
    el.summary.textContent = result.summary;
    el.dayIndicator.classList.toggle("hidden", !result.crossesDay);

    el.timelineProgress.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.timelineProgress.style.width = "100%";
      });
    });

    if (animate) {
      el.resultCard.classList.remove("recalculated");
      void el.resultCard.offsetWidth;
      el.resultCard.classList.add("recalculated");
    }
  }

  function calculate({ animate = true, save = false } = {}) {
    const input = validate();

    if (!input.ok) {
      el.validation.textContent = input.message;
      return null;
    }

    const result = buildResult(input);
    render(result, animate);
    updateQuickButtons();

    if (save) saveHistory(result);
    return result;
  }

  function updateQuickButtons() {
    const current = getDurationMinutes();
    el.quickButtons.forEach((button) => {
      button.classList.toggle("active", current !== null && Number(button.dataset.minutes) === current);
    });
  }

  function scheduleAutoCalculate() {
    window.clearTimeout(autoTimer);
    autoTimer = window.setTimeout(() => {
      calculate({ animate: false, save: false });
    }, 120);
  }

  function showToast(message) {
    el.toastText.textContent = message;
    el.toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.toast.classList.remove("show"), 2400);
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeHistory(items) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      // O armazenamento local pode estar bloqueado pelo navegador.
    }
  }

  function saveHistory(result) {
    const entry = {
      start: result.start,
      duration: result.duration,
      minimumStay: result.minimumStay,
      end: result.end,
      savedAt: Date.now()
    };

    const history = loadHistory();
    const duplicate = history.findIndex((item) =>
      item.start === entry.start &&
      Number(item.duration) === entry.duration &&
      Number(item.minimumStay || 30) === entry.minimumStay &&
      item.end === entry.end
    );

    if (duplicate >= 0) history.splice(duplicate, 1);
    history.unshift(entry);
    writeHistory(history.slice(0, MAX_HISTORY));
    renderHistory();
  }

  function renderHistory() {
    const history = loadHistory();
    el.history.innerHTML = "";

    if (!history.length) {
      el.history.innerHTML = '<p class="history-empty">Os últimos cálculos aparecerão aqui.</p>';
      return;
    }

    history.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-item";
      const durationClock = formatDurationClock(Number(item.duration));

      button.innerHTML = `
        <span>${item.start} → ${item.end}</span>
        <strong>${item.end}</strong>
        <small>${durationClock} • mín. ${formatDurationClock(Number(item.minimumStay || 30))}</small>
      `;

      button.addEventListener("click", () => {
        el.startTime.value = item.start;
        setDurationFields(Number(item.duration));
        setMinimumStayFields(Number(item.minimumStay || 30));
        calculate({ animate: true, save: false });

        if (window.innerWidth < 781) {
          el.resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      el.history.appendChild(button);
    });
  }

  async function copySummary() {
    if (!lastResult) return;

    const portalHeader = lastPortalMeta
      ? `Projeto: ${lastPortalMeta.projectName || "—"}
Período: ${periodLabel(lastPortalMeta.period)}
Sala: ${lastPortalMeta.room || "—"}
Módulo(s): ${lastPortalMeta.modules || "—"}
`
      : "";

    const text = `Cálculo de duração da prova
${portalHeader}Horário de início: ${lastResult.start}
Duração: ${lastResult.durationClock} (${lastResult.durationText})
Horário de encerramento: ${lastResult.end}${lastResult.crossesDay ? " — dia seguinte" : ""}
Permanência mínima: ${lastResult.minimumStayClock}
Liberação mínima a partir de: ${lastResult.minimumExit}${lastResult.minimumCrossesDay ? " — dia seguinte" : ""}

${lastResult.summary}`;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Resumo copiado!");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      showToast(ok ? "Resumo copiado!" : "Não foi possível copiar.");
    }
  }

  // =========================================================
  // SUPABASE / CONTEXTO / PORTAL
  // =========================================================

  function getSupabaseConfig() {
    const cfg = window.FCC_CONFIG || {};
    const url = String(cfg.SUPABASE_URL || "").trim().replace(/\/$/, "");
    const key = String(cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_ANON_KEY || "").trim();
    return {
      url,
      key,
      configured: Boolean(url && key && !url.includes("COLE_AQUI") && !key.includes("COLE_AQUI"))
    };
  }

  async function supabaseRequest(resource, { method = "GET", body = null, prefer = "" } = {}) {
    const cfg = getSupabaseConfig();
    if (!cfg.configured) {
      throw new Error("Supabase ainda não foi configurado. Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no config.js.");
    }

    const headers = {
      apikey: cfg.key,
      Accept: "application/json"
    };

    // As chaves publishable (sb_publishable_...) devem ir somente em apikey.
    // A antiga anon key é JWT e pode ser enviada também como Bearer.
    if (cfg.key.startsWith("eyJ")) {
      headers.Authorization = `Bearer ${cfg.key}`;
    }

    if (body !== null) headers["Content-Type"] = "application/json";
    if (prefer) headers.Prefer = prefer;

    const response = await fetch(`${cfg.url}/rest/v1/${resource}`, {
      method,
      headers,
      body: body === null ? undefined : JSON.stringify(body)
    });

    const text = await response.text();
    let payload = null;
    if (text) {
      try { payload = JSON.parse(text); }
      catch { payload = text; }
    }

    if (!response.ok) {
      const message = payload?.message || payload?.hint || payload?.details || payload || `HTTP ${response.status}`;
      throw new Error(`Supabase: ${message}`);
    }

    return payload;
  }

  function slugify(value) {
    return stripDiacritics(String(value || ""))
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeRoomCode(value) {
    return String(value || "")
      .replace(/^sala\s*[:\-]?\s*/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
  }

  function normalizeModulesText(value) {
    return String(value || "")
      .replace(/^m[oó]dulo\(s\)\s*[:\-]?\s*/i, "")
      .replace(/^m[oó]dulos?\s*[:\-]?\s*/i, "")
      .replace(/\s*[|;]+\s*/g, ", ")
      .replace(/\s*\/\s*/g, ", ")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }

  function splitModules(value) {
    return String(value || "")
      .split(/[,;/\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function periodLabel(period) {
    return period === "manha" ? "Manhã" : period === "tarde" ? "Tarde" : "—";
  }

  function dbTimeToClock(value) {
    const match = String(value || "").match(/^(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : "—";
  }

  function loadStoredContext() {
    try {
      const value = JSON.parse(localStorage.getItem(CONTEXT_KEY) || "null");
      return value && value.projectId && ["manha", "tarde"].includes(value.period) ? value : null;
    } catch {
      return null;
    }
  }

  function storeContext(context) {
    try { localStorage.setItem(CONTEXT_KEY, JSON.stringify(context)); }
    catch { /* sem armazenamento local */ }
  }

  function setContextAlert(message = "") {
    el.contextAlert.textContent = message;
    el.contextAlert.classList.toggle("hidden", !message);
  }

  function showContextStep(step = "project") {
    const isProject = step === "project";
    el.projectStepPanel.classList.toggle("active", isProject);
    el.projectStepPanel.setAttribute("aria-hidden", String(!isProject));
    el.periodStepPanel.classList.toggle("active", !isProject);
    el.periodStepPanel.setAttribute("aria-hidden", String(isProject));

    el.projectProgress.classList.toggle("active", true);
    el.projectProgress.classList.toggle("done", !isProject);
    el.periodProgress.classList.toggle("active", !isProject);
    el.periodProgress.classList.remove("done");
    el.ocrProgress.classList.remove("active", "done");

    if (isProject) {
      el.contextModalTitle.textContent = "Escolha ou crie um projeto";
      el.contextModalSubtitle.textContent = "Primeiro definimos o projeto. Depois você escolhe Manhã ou Tarde.";
    } else {
      el.contextModalTitle.textContent = "Agora escolha o período";
      el.contextModalSubtitle.textContent = "Todo projeto possui Manhã e Tarde. Após esta escolha, a leitura OCR e o portal de salas ficam disponíveis.";
    }
    setContextAlert("");
  }

  async function loadProjects() {
    el.projectSelect.innerHTML = '<option value="">Carregando projetos...</option>';
    try {
      const params = new URLSearchParams({ select: "id,name,slug,created_at", order: "name.asc" });
      const projects = await supabaseRequest(`fcc_projects?${params.toString()}`);
      const stored = loadStoredContext();

      el.projectSelect.innerHTML = '<option value="">Selecione um projeto</option>';
      (Array.isArray(projects) ? projects : []).forEach((project) => {
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.name;
        option.dataset.name = project.name;
        el.projectSelect.appendChild(option);
      });

      const newOption = document.createElement("option");
      newOption.value = "__new__";
      newOption.textContent = "+ Criar novo projeto";
      el.projectSelect.appendChild(newOption);

      if (stored?.projectId && [...el.projectSelect.options].some((option) => option.value === stored.projectId)) {
        el.projectSelect.value = stored.projectId;
      }

      el.newProjectWrap.classList.toggle("hidden", el.projectSelect.value !== "__new__");
      setContextAlert("");
    } catch (error) {
      el.projectSelect.innerHTML = '<option value="">Supabase indisponível</option>';
      setContextAlert(error instanceof Error ? error.message : "Não foi possível carregar os projetos.");
    }
  }

  function openContextModal() {
    pendingProject = null;
    selectedPeriod = "";
    el.periodOptions.forEach((button) => button.classList.remove("active"));
    showContextStep("project");
    el.contextModal.classList.add("open");
    el.contextModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    loadProjects();
  }

  function closeContextModal() {
    el.contextModal.classList.remove("open");
    el.contextModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  async function upsertProject(name) {
    const cleanName = String(name || "").replace(/\s+/g, " ").trim();
    if (cleanName.length < 2) throw new Error("Informe um nome válido para o projeto.");
    const slug = slugify(cleanName);
    if (!slug) throw new Error("Não foi possível gerar o identificador do projeto.");

    const params = new URLSearchParams({ on_conflict: "slug" });
    const data = await supabaseRequest(`fcc_projects?${params.toString()}`, {
      method: "POST",
      body: { name: cleanName, slug },
      prefer: "resolution=merge-duplicates,return=representation"
    });
    const project = Array.isArray(data) ? data[0] : data;
    if (!project?.id) throw new Error("O Supabase não retornou o projeto criado.");
    return project;
  }

  function updateContextUi() {
    const project = currentContext?.projectName || "Selecione um projeto";
    const period = periodLabel(currentContext?.period);
    el.sideProjectName.textContent = project;
    el.sidePeriodName.textContent = period;
    el.topProjectName.textContent = project;
    el.topPeriodName.textContent = period;
    el.footerContext.textContent = currentContext ? `${project} • ${period}` : "Selecione um projeto para começar";
    if (el.menuProjectName) el.menuProjectName.textContent = currentContext ? project : "Nenhum projeto";
    if (el.menuPeriodName) el.menuPeriodName.textContent = currentContext ? period : "Selecione Manhã ou Tarde";
    el.portalSubtitle.textContent = currentContext
      ? `${project} • ${period} — registros agrupados automaticamente por sala.`
      : "Selecione um projeto e depois Manhã ou Tarde para visualizar as salas.";
  }

  async function continueProjectSelection() {
    setContextAlert("");
    const selectedValue = el.projectSelect.value;
    if (!selectedValue) {
      setContextAlert("Escolha um projeto existente ou selecione + Criar novo projeto.");
      return;
    }

    el.continueProject.disabled = true;
    el.continueProject.textContent = selectedValue === "__new__" ? "Criando projeto..." : "Carregando projeto...";

    try {
      if (selectedValue === "__new__") {
        pendingProject = await upsertProject(el.newProjectName.value);
        await loadProjects();
        el.projectSelect.value = pendingProject.id;
      } else {
        const option = el.projectSelect.selectedOptions[0];
        pendingProject = {
          id: selectedValue,
          name: option?.dataset?.name || option?.textContent || "Projeto"
        };
      }

      el.wizardProjectName.textContent = pendingProject.name;
      selectedPeriod = "";
      el.periodOptions.forEach((button) => button.classList.remove("active"));
      showContextStep("period");
    } catch (error) {
      setContextAlert(error instanceof Error ? error.message : "Não foi possível preparar o projeto.");
    } finally {
      el.continueProject.disabled = false;
      el.continueProject.textContent = "Continuar para o período →";
    }
  }

  async function enterSelectedContext() {
    setContextAlert("");
    if (!pendingProject?.id) {
      showContextStep("project");
      setContextAlert("Escolha o projeto primeiro.");
      return;
    }
    if (!selectedPeriod) {
      setContextAlert("Escolha Manhã ou Tarde.");
      return;
    }

    el.enterPortal.disabled = true;
    el.enterPortal.textContent = "Abrindo portal...";

    try {
      currentContext = {
        projectId: pendingProject.id,
        projectName: pendingProject.name,
        period: selectedPeriod
      };
      storeContext(currentContext);
      updateContextUi();
      closeContextModal();
      openRoomId = null;
      setActiveView("calculator");
      await loadPortalData();
      startPortalAutoRefresh();
      showToast(`${pendingProject.name} • ${periodLabel(selectedPeriod)}`);
    } catch (error) {
      setContextAlert(error instanceof Error ? error.message : "Não foi possível abrir o portal.");
    } finally {
      el.enterPortal.disabled = false;
      el.enterPortal.textContent = "Abrir período e entrar no portal →";
    }
  }

  function setupPortalContext() {
    el.projectSelect.addEventListener("change", () => {
      const isNew = el.projectSelect.value === "__new__";
      el.newProjectWrap.classList.toggle("hidden", !isNew);
      if (isNew) window.setTimeout(() => el.newProjectName.focus(), 80);
    });

    el.continueProject.addEventListener("click", continueProjectSelection);
    el.backProject.addEventListener("click", () => {
      pendingProject = null;
      selectedPeriod = "";
      el.periodOptions.forEach((item) => item.classList.remove("active"));
      showContextStep("project");
    });

    el.periodOptions.forEach((button) => {
      button.addEventListener("click", () => {
        selectedPeriod = button.dataset.period;
        el.periodOptions.forEach((item) => item.classList.toggle("active", item === button));
      });
    });

    el.enterPortal.addEventListener("click", enterSelectedContext);
    el.changeContext.addEventListener("click", openContextModal);
    el.topContext.addEventListener("click", openContextModal);

    const stored = loadStoredContext();
    if (stored && ["manha", "tarde"].includes(stored.period)) {
      currentContext = stored;
      updateContextUi();
    } else {
      updateContextUi();
    }
  }

  function setActiveView(view) {
    const portal = view === "portal";
    el.calculatorView.classList.toggle("hidden", portal);
    el.portalView.classList.toggle("hidden", !portal);
    el.calculatorTab.classList.toggle("active", !portal);
    el.portalTab.classList.toggle("active", portal);
    if (portal) {
      if (!openRoomId) showDirectoryRoot();
      loadPortalData();
    }
  }

  function openMainMenu() {
    if (!el.mainMenu) return;
    el.mainMenu.classList.add("open");
    el.mainMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  }

  function closeMainMenu() {
    if (!el.mainMenu) return;
    el.mainMenu.classList.remove("open");
    el.mainMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  function setupMainMenu() {
    el.mainMenuBtn?.addEventListener("click", openMainMenu);
    el.mainMenuClose?.addEventListener("click", closeMainMenu);
    el.mainMenuBackdrop?.addEventListener("click", closeMainMenu);

    el.menuProjects?.addEventListener("click", () => {
      closeMainMenu();
      openRoomId = null;
      openContextModal();
    });

    el.menuCalculator?.addEventListener("click", () => {
      closeMainMenu();
      setActiveView("calculator");
    });

    el.menuPortal?.addEventListener("click", () => {
      closeMainMenu();
      openRoomId = null;
      showDirectoryRoot();
      setActiveView("portal");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && el.mainMenu?.classList.contains("open")) closeMainMenu();
    });
  }

  function setPortalStatus(message, type = "ok") {
    el.portalStatus.classList.toggle("loading", type === "loading");
    el.portalStatus.classList.toggle("error", type === "error");
    el.portalStatus.innerHTML = `<span class="portal-status-dot"></span> ${escapeHtml(message)}`;
  }

  function formatCapturedAt(value) {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
      }).format(new Date(value));
    } catch {
      return "";
    }
  }

  function buildExamRecord(card) {
    const start = dbTimeToClock(card.start_time);
    const end = dbTimeToClock(card.end_time);
    const minimumExit = dbTimeToClock(card.minimum_exit_time);
    const durationClock = formatDurationClock(Number(card.duration_minutes || 0));
    const minimumClock = formatDurationClock(Number(card.minimum_stay_minutes || 0));
    const record = document.createElement("article");
    record.className = "exam-record exam-record--file";
    record.innerHTML = `
      <div class="exam-record-filebar">
        <span class="exam-file-icon">▤</span>
        <span>Registro de prova</span>
      </div>
      <div class="exam-record-top">
        <div class="exam-record-module"><span>Módulo(s)</span><strong>${escapeHtml(card.modules)}</strong></div>
        <div class="exam-record-time"><strong>${escapeHtml(end)}</strong><small>encerramento${card.end_next_day ? " • dia seguinte" : ""}</small></div>
      </div>
      <div class="exam-record-meta">
        <div><span>Início</span><strong>${escapeHtml(start)}</strong></div>
        <div><span>Duração</span><strong>${escapeHtml(durationClock)}</strong></div>
        <div><span>Liberação mín.</span><strong>${escapeHtml(minimumExit)}</strong></div>
      </div>
      <div class="exam-record-minimum">⏱ Permanência mínima: <strong>${escapeHtml(minimumClock)}</strong></div>
      <div class="exam-record-date">${escapeHtml(formatCapturedAt(card.captured_at))}</div>
    `;
    return record;
  }

  function showDirectoryRoot() {
    openRoomId = null;
    el.directoryRoot?.classList.remove("hidden");
    el.roomDirectoryView?.classList.add("hidden");
    el.directoryBack?.classList.add("hidden");
    if (el.directoryBreadcrumb) {
      el.directoryBreadcrumb.innerHTML = '<button type="button" id="breadcrumbRootBtnDynamic">Salas</button>';
      el.directoryBreadcrumb.querySelector("button")?.addEventListener("click", showDirectoryRoot);
    }
  }

  function openRoomDirectory(roomId) {
    const room = portalRoomFolders.find((item) => String(item.id) === String(roomId));
    if (!room) return;

    openRoomId = room.id;
    el.directoryRoot?.classList.add("hidden");
    el.portalEmpty?.classList.add("hidden");
    el.roomDirectoryView?.classList.remove("hidden");
    el.directoryBack?.classList.remove("hidden");
    el.roomDirectoryCode.textContent = room.room_code;
    el.roomDirectoryMeta.textContent = `${room.cards.length} ${room.cards.length === 1 ? "cartão" : "cartões"} • ${currentContext?.projectName || "Projeto"} • ${periodLabel(currentContext?.period)}`;
    el.roomDirectoryRecords.innerHTML = "";

    room.cards
      .slice()
      .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)))
      .forEach((card) => el.roomDirectoryRecords.appendChild(buildExamRecord(card)));

    if (!room.cards.length) {
      el.roomDirectoryRecords.innerHTML = '<div class="directory-room-empty">Esta sala ainda não possui cartões registrados.</div>';
    }

    if (el.directoryBreadcrumb) {
      el.directoryBreadcrumb.innerHTML = `
        <button type="button" id="breadcrumbRootBtnDynamic">Salas</button>
        <span>›</span>
        <strong>Sala ${escapeHtml(room.room_code)}</strong>
      `;
      el.directoryBreadcrumb.querySelector("button")?.addEventListener("click", showDirectoryRoot);
    }

    const index = portalRoomFolders.findIndex((item) => String(item.id) === String(room.id));
    el.previousRoom.disabled = index <= 0;
    el.nextRoom.disabled = index < 0 || index >= portalRoomFolders.length - 1;
    el.previousRoom.dataset.roomId = index > 0 ? portalRoomFolders[index - 1].id : "";
    el.nextRoom.dataset.roomId = index >= 0 && index < portalRoomFolders.length - 1 ? portalRoomFolders[index + 1].id : "";
  }

  function renderPortalRooms(rooms, cards) {
    const roomMap = new Map(rooms.map((room) => [room.id, { ...room, cards: [] }]));
    cards.forEach((card) => roomMap.get(card.room_id)?.cards.push(card));
    const folders = [...roomMap.values()].sort((a, b) => String(a.room_code).localeCompare(String(b.room_code), "pt-BR", { numeric: true }));
    portalRoomFolders = folders;

    const moduleSet = new Set();
    cards.forEach((card) => splitModules(card.modules).forEach((module) => moduleSet.add(module)));
    el.portalRoomCount.textContent = String(folders.length);
    el.portalCardCount.textContent = String(cards.length);
    el.portalModuleCount.textContent = String(moduleSet.size);
    el.roomsGrid.innerHTML = "";

    if (!folders.length) {
      showDirectoryRoot();
      el.portalEmpty.classList.remove("hidden");
      return;
    }
    el.portalEmpty.classList.add("hidden");

    folders.forEach((room) => {
      const moduleCount = new Set(room.cards.flatMap((card) => splitModules(card.modules))).size;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "room-directory-folder";
      button.dataset.roomId = room.id;
      button.innerHTML = `
        <span class="folder-visual" aria-hidden="true"><span class="folder-tab"></span><span class="folder-body">▰</span></span>
        <span class="folder-copy">
          <small>SALA</small>
          <strong>${escapeHtml(room.room_code)}</strong>
          <span>${room.cards.length} ${room.cards.length === 1 ? "cartão" : "cartões"} • ${moduleCount} ${moduleCount === 1 ? "módulo" : "módulos"}</span>
        </span>
        <span class="folder-open">Abrir ›</span>
      `;
      button.addEventListener("click", () => openRoomDirectory(room.id));
      el.roomsGrid.appendChild(button);
    });

    if (openRoomId && folders.some((room) => String(room.id) === String(openRoomId))) {
      openRoomDirectory(openRoomId);
    } else {
      showDirectoryRoot();
    }
  }

  async function loadPortalData() {
    if (!currentContext?.projectId) {
      setPortalStatus("Selecione um projeto e um período.", "error");
      return;
    }

    setPortalStatus("Sincronizando salas com o Supabase...", "loading");
    try {
      const roomParams = new URLSearchParams({
        select: "id,room_code,created_at",
        project_id: `eq.${currentContext.projectId}`,
        period: `eq.${currentContext.period}`,
        order: "room_code.asc"
      });
      const rooms = await supabaseRequest(`fcc_rooms?${roomParams.toString()}`);
      const roomList = Array.isArray(rooms) ? rooms : [];

      let cards = [];
      if (roomList.length) {
        const roomIds = roomList.map((room) => room.id).join(",");
        const cardParams = new URLSearchParams({
          select: "id,room_id,modules,start_time,duration_minutes,end_time,end_next_day,minimum_stay_minutes,minimum_exit_time,minimum_exit_next_day,captured_at,source",
          room_id: `in.(${roomIds})`,
          order: "start_time.asc"
        });
        const result = await supabaseRequest(`fcc_exam_cards?${cardParams.toString()}`);
        cards = Array.isArray(result) ? result : [];
      }

      renderPortalRooms(roomList, cards);
      setPortalStatus(`Atualizado agora • ${currentContext.projectName} • ${periodLabel(currentContext.period)}`);
    } catch (error) {
      setPortalStatus(error instanceof Error ? error.message : "Não foi possível carregar o portal.", "error");
    }
  }

  function startPortalAutoRefresh() {
    if (portalRefreshTimer) window.clearInterval(portalRefreshTimer);
    portalRefreshTimer = window.setInterval(() => {
      if (currentContext?.projectId && document.visibilityState === "visible") loadPortalData();
    }, 60000);
  }

  async function ensureRoom(roomCode) {
    const normalized = normalizeRoomCode(roomCode);
    if (!normalized) throw new Error("Informe a sala antes de salvar.");
    const params = new URLSearchParams({ on_conflict: "project_id,period,room_code" });
    const result = await supabaseRequest(`fcc_rooms?${params.toString()}`, {
      method: "POST",
      body: {
        project_id: currentContext.projectId,
        period: currentContext.period,
        room_code: normalized
      },
      prefer: "resolution=merge-duplicates,return=representation"
    });
    const room = Array.isArray(result) ? result[0] : result;
    if (!room?.id) throw new Error("O Supabase não retornou a sala criada.");
    return room;
  }

  async function saveExamCardToPortal({ room, modules, result, ocrText }) {
    if (!currentContext?.projectId) throw new Error("Selecione o projeto e o período antes de salvar.");
    const cleanRoom = normalizeRoomCode(room);
    const cleanModules = normalizeModulesText(modules);
    if (!cleanRoom) throw new Error("A sala é obrigatória.");
    if (!cleanModules) throw new Error("O campo módulo(s) é obrigatório.");

    const roomRow = await ensureRoom(cleanRoom);
    const params = new URLSearchParams({ on_conflict: "room_id,modules,start_time" });
    const data = await supabaseRequest(`fcc_exam_cards?${params.toString()}`, {
      method: "POST",
      body: {
        room_id: roomRow.id,
        modules: cleanModules,
        start_time: result.start,
        duration_minutes: result.duration,
        end_time: result.end,
        end_next_day: Boolean(result.crossesDay),
        minimum_stay_minutes: result.minimumStay,
        minimum_exit_time: result.minimumExit,
        minimum_exit_next_day: Boolean(result.minimumCrossesDay),
        source: "ocr_space",
        captured_at: new Date().toISOString()
      },
      prefer: "resolution=merge-duplicates,return=representation"
    });

    const card = Array.isArray(data) ? data[0] : data;
    return { room: cleanRoom, modules: cleanModules, card };
  }

  function setupPortalView() {
    el.calculatorTab.addEventListener("click", () => setActiveView("calculator"));
    el.portalTab.addEventListener("click", () => {
      openRoomId = null;
      showDirectoryRoot();
      setActiveView("portal");
    });
    el.refreshPortal.addEventListener("click", loadPortalData);
    [el.portalCamera, el.emptyCamera].forEach((button) => button.addEventListener("click", requestPhoto));
    el.directoryBack?.addEventListener("click", showDirectoryRoot);
    el.breadcrumbRoot?.addEventListener("click", showDirectoryRoot);
    el.previousRoom?.addEventListener("click", () => {
      if (el.previousRoom.dataset.roomId) openRoomDirectory(el.previousRoom.dataset.roomId);
    });
    el.nextRoom?.addEventListener("click", () => {
      if (el.nextRoom.dataset.roomId) openRoomDirectory(el.nextRoom.dataset.roomId);
    });
  }

  // =========================================================
  // IA / CÂMERA
  // =========================================================

  function getOcrConfig() {
    const cfg = window.FCC_CONFIG || {};
    const key = String(cfg.OCRSPACE_API_KEY || "").trim();
    const endpoint = String(cfg.OCRSPACE_ENDPOINT || "https://api.ocr.space/parse/image").trim();
    const engine = String(cfg.OCRSPACE_ENGINE || "3").trim();

    return {
      key,
      endpoint,
      engine,
      configured: Boolean(key && !key.includes("COLE_AQUI"))
    };
  }

  function openAiModal(state = "loading") {
    el.aiModal.classList.add("open");
    el.aiModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setAiState(state);
  }

  function closeAiModal() {
    el.aiModal.classList.remove("open");
    el.aiModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    el.aiValidation.textContent = "";
  }

  function setAiState(state) {
    el.aiLoadingState.classList.toggle("hidden", state !== "loading");
    el.aiConfirmState.classList.toggle("hidden", state !== "confirm");
    el.aiErrorState.classList.toggle("hidden", state !== "error");
  }

  function requestPhoto() {
    if (!currentContext?.projectId) {
      showToast("Escolha o projeto e o período antes de fotografar.");
      openContextModal();
      return;
    }
    el.photoInput.value = "";
    el.photoInput.setAttribute("capture", "environment");
    el.photoInput.click();
  }

  async function loadImageSource(file) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Selecione uma imagem válida.");
    }

    if (file.size > OCR_MAX_SOURCE_BYTES) {
      throw new Error("A foto original é muito grande. Tire uma nova foto com resolução menor.");
    }

    if ("createImageBitmap" in window) {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: () => bitmap.close?.()
        };
      } catch {
        const bitmap = await createImageBitmap(file);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup: () => bitmap.close?.()
        };
      }
    }

    const objectUrl = URL.createObjectURL(file);
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Não foi possível abrir esta imagem."));
      img.src = objectUrl;
    });

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl)
    };
  }

  function canvasToJpegBlob(canvas, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Não foi possível preparar a prévia da foto."));
      reader.readAsDataURL(blob);
    });
  }

  async function imageFileToOcrJpeg(file) {
    const loaded = await loadImageSource(file);
    const { source, width, height, cleanup } = loaded;

    try {
      if (!width || !height) {
        throw new Error("A imagem não possui dimensões válidas.");
      }

      let bestBlob = null;

      for (let step = 0; step < OCR_DIMENSION_STEPS.length; step += 1) {
        const maxDimension = OCR_DIMENSION_STEPS[step];
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Seu navegador não conseguiu preparar a foto.");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

        const quality = OCR_QUALITY_STEPS[Math.min(step, OCR_QUALITY_STEPS.length - 1)];
        const blob = await canvasToJpegBlob(canvas, quality);
        if (!blob) continue;

        bestBlob = blob;
        if (blob.size <= OCR_MAX_UPLOAD_BYTES) break;
      }

      if (!bestBlob) {
        throw new Error("Não foi possível compactar a foto.");
      }

      if (bestBlob.size > OCR_MAX_UPLOAD_BYTES) {
        throw new Error("A foto ainda ficou acima do limite do OCR.Space. Aproxime o cartão e tente novamente.");
      }

      return {
        blob: bestBlob,
        previewDataUrl: await blobToDataUrl(bestBlob),
        sizeBytes: bestBlob.size
      };
    } finally {
      cleanup();
    }
  }

  function normalizeAiClock(value) {
    if (value === null || value === undefined) return "";
    let text = String(value).trim().toLowerCase();
    if (!text) return "";

    text = text.replace(/\s/g, "").replace(/[h\.]/g, ":");
    const match = text.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return "";

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return "";
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function durationStringToMinutes(value) {
    if (value === null || value === undefined) return null;
    let text = String(value).trim().toLowerCase();
    if (!text) return null;

    text = text.replace(/\s/g, "");

    if (/^\d{1,3}min$/.test(text)) {
      const total = Number(text.replace("min", ""));
      return total >= 1 && total <= 720 ? total : null;
    }

    text = text.replace("horas", "h").replace("hora", "h");
    const hPattern = text.match(/^(\d{1,2})h(?:(\d{1,2}))?$/);
    if (hPattern) {
      const hours = Number(hPattern[1]);
      const minutes = Number(hPattern[2] || 0);
      const total = (hours * 60) + minutes;
      return minutes <= 59 && total >= 1 && total <= 720 ? total : null;
    }

    const colonPattern = text.match(/^(\d{1,2}):(\d{2})$/);
    if (colonPattern) {
      const hours = Number(colonPattern[1]);
      const minutes = Number(colonPattern[2]);
      const total = (hours * 60) + minutes;
      return minutes <= 59 && total >= 1 && total <= 720 ? total : null;
    }

    return null;
  }

  function confidenceLabel(value) {
    const key = String(value || "").toLowerCase();
    if (key === "alta") return "Alta";
    if (key === "media" || key === "média") return "Média";
    if (key === "baixa") return "Baixa — confira com atenção";
    return "Não informada";
  }

  function flattenOcrError(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join(" • ");
    if (value === null || value === undefined) return "";
    return String(value);
  }

  async function callOcrSpace(imageBlob) {
    const cfg = getOcrConfig();

    if (!cfg.configured) {
      throw new Error("OCR.Space ainda não foi configurado. Abra config.js e cole sua OCRSPACE_API_KEY.");
    }

    const formData = new FormData();
    formData.append("file", imageBlob, "cartao-fcc.jpg");
    formData.append("apikey", cfg.key);
    formData.append("OCREngine", cfg.engine || "3");
    formData.append("language", "auto");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("isTable", "true");

    const response = await fetch(cfg.endpoint, {
      method: "POST",
      body: formData
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(`OCR.Space respondeu com erro HTTP ${response.status}.`);
    }

    if (!payload) {
      throw new Error("OCR.Space não retornou uma resposta JSON válida.");
    }

    if (payload.IsErroredOnProcessing) {
      const message = flattenOcrError(payload.ErrorMessage) || flattenOcrError(payload.ErrorDetails);
      throw new Error(message || "OCR.Space não conseguiu processar a imagem.");
    }

    const parsedResults = Array.isArray(payload.ParsedResults) ? payload.ParsedResults : [];
    const parsedText = parsedResults
      .map((result) => String(result?.ParsedText || "").trim())
      .filter(Boolean)
      .join("\n");

    if (!parsedText) {
      const details = parsedResults
        .map((result) => flattenOcrError(result?.ErrorMessage) || flattenOcrError(result?.ErrorDetails))
        .filter(Boolean)
        .join(" • ");
      throw new Error(details || "O OCR não encontrou texto legível na foto.");
    }

    console.debug("[FCC OCR] Texto reconhecido:", parsedText);
    return parsedText;
  }

  function stripDiacritics(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function cleanOcrLine(value) {
    return String(value || "")
      .replace(/[|_*#`]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeOcrDigits(value) {
    return String(value || "")
      .replace(/[Oo]/g, "0")
      .replace(/[Il|]/g, "1");
  }

  function findTimeToken(text, { duration = false } = {}) {
    const source = String(text || "");

    // IMPORTANTE: não converte a linha inteira (ex.: "Início" -> "1níci0").
    // Só aceitamos O/I/l como possíveis dígitos DENTRO do token do horário.
    // Isso evita o erro que transformava "Início: 09 : 12" em "00:09".
    const pattern = /(?:^|[^A-Za-zÀ-ÿ0-9])([0-9OoIl|]{1,2})\s*(?:h|H|:|\.|;)\s*([0-9OoIl|]{1,2})(?![A-Za-zÀ-ÿ0-9])/g;
    let match;

    while ((match = pattern.exec(source)) !== null) {
      const hourToken = normalizeOcrDigits(match[1]);
      const minuteToken = normalizeOcrDigits(match[2]);
      if (!/^\d{1,2}$/.test(hourToken) || !/^\d{1,2}$/.test(minuteToken)) continue;

      const hours = Number(hourToken);
      const minutes = Number(minuteToken);
      if (minutes > 59) continue;

      if (duration) {
        const total = (hours * 60) + minutes;
        if (total >= 1 && total <= 720) return formatDurationClock(total);
      } else if (hours <= 23) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      }
    }

    if (duration) {
      const hourOnlyPattern = /(?:^|[^A-Za-zÀ-ÿ0-9])([0-9OoIl|]{1,2})\s*h(?:[^A-Za-zÀ-ÿ0-9]|$)/i;
      const hourOnly = source.match(hourOnlyPattern);
      if (hourOnly) {
        const hours = Number(normalizeOcrDigits(hourOnly[1]));
        const total = hours * 60;
        if (Number.isFinite(total) && total >= 1 && total <= 720) {
          return formatDurationClock(total);
        }
      }
    }

    return "";
  }

  function isDifferentFieldLabel(line, expectedLabelRegex) {
    const searchable = stripDiacritics(line).toLowerCase();
    const hasKnownLabel = /duracao|inicio|termino|fim|encerramento|permanencia|minima/.test(searchable);
    return hasKnownLabel && !expectedLabelRegex.test(searchable);
  }

  function findValueNearLabel(lines, labelRegex, { duration = false, lookAhead = 2 } = {}) {
    for (let i = 0; i < lines.length; i += 1) {
      const searchable = stripDiacritics(lines[i]).toLowerCase();
      if (!labelRegex.test(searchable)) continue;

      const direct = findTimeToken(lines[i], { duration });
      if (direct) return { value: direct, anchored: true, lineIndex: i };

      for (let offset = 1; offset <= lookAhead && i + offset < lines.length; offset += 1) {
        const candidate = lines[i + offset];
        if (isDifferentFieldLabel(candidate, labelRegex)) break;
        const value = findTimeToken(candidate, { duration });
        if (value) return { value, anchored: true, lineIndex: i };
      }
    }

    return { value: "", anchored: false, lineIndex: -1 };
  }

  function findTextAfterLabel(lines, labelRegex, { kind = "generic", lookAhead = 1 } = {}) {
    for (let i = 0; i < lines.length; i += 1) {
      const searchable = stripDiacritics(lines[i]).toLowerCase();
      if (!labelRegex.test(searchable)) continue;

      const candidates = [lines[i]];
      for (let offset = 1; offset <= lookAhead && i + offset < lines.length; offset += 1) {
        candidates.push(lines[i + offset]);
      }

      for (let index = 0; index < candidates.length; index += 1) {
        let candidate = cleanOcrLine(candidates[index]);
        if (!candidate) continue;

        if (index === 0) {
          const colonIndex = candidate.indexOf(":");
          if (colonIndex >= 0) candidate = candidate.slice(colonIndex + 1).trim();
          else {
            candidate = candidate
              .replace(/m[oó]dulo(?:\(s\))?s?/i, "")
              .replace(/sala/i, "")
              .replace(/^\s*[-–—:]\s*/, "")
              .trim();
          }
        }

        if (!candidate) continue;

        // Alguns OCRs juntam duas linhas. Recorta o valor quando outro rótulo começa.
        if (kind === "modules") {
          candidate = candidate.replace(/\b(?:sala|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i, "").trim();
        } else if (kind === "room") {
          candidate = candidate.replace(/\b(?:m[oó]dulo|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i, "").trim();
        }

        if (!candidate) continue;
        const searchableCandidate = stripDiacritics(candidate).toLowerCase();
        if (/duracao|inicio|termino|permanencia/.test(searchableCandidate)) continue;

        if (kind === "room") {
          const match = candidate.match(/\b([A-Za-z0-9][A-Za-z0-9._-]{0,19})\b/);
          if (match) return { value: normalizeRoomCode(match[1]), anchored: true, lineIndex: i };
        }

        if (kind === "modules") {
          const numericCodes = candidate.match(/\b\d{3,}\b/g);
          if (numericCodes?.length) {
            return { value: normalizeModulesText([...new Set(numericCodes)].join(", ")), anchored: true, lineIndex: i };
          }
          const genericCodes = candidate.match(/\b[A-Za-z0-9][A-Za-z0-9._/-]{2,}\b/g);
          if (genericCodes?.length) {
            return { value: normalizeModulesText([...new Set(genericCodes)].join(", ")), anchored: true, lineIndex: i };
          }
        }
      }
    }
    return { value: "", anchored: false, lineIndex: -1 };
  }

  function findStartFallback(lines) {
    const startIndex = lines.findIndex((line) => /\binicio\b/i.test(stripDiacritics(line)));
    if (startIndex < 0) return "";

    for (let offset = 0; offset <= 2 && startIndex + offset < lines.length; offset += 1) {
      const line = lines[startIndex + offset];
      const searchable = stripDiacritics(line).toLowerCase();

      // Nunca usa conteúdo dos campos Término, Duração ou Permanência mínima
      // para inferir o horário de início.
      if (offset > 0 && /termino|fim|encerramento|duracao|permanencia|minima/.test(searchable)) break;

      const value = findTimeToken(line, { duration: false });
      if (value) return value;
    }

    return "";
  }

  function parseOcrFields(rawText) {
    const lines = String(rawText || "")
      .split(/\r?\n/)
      .map(cleanOcrLine)
      .filter(Boolean);

    const durationResult = findValueNearLabel(
      lines,
      /duracao(?:\s+da)?\s+prova|duracao/,
      { duration: true, lookAhead: 1 }
    );

    const startResult = findValueNearLabel(
      lines,
      /\binicio\b/,
      { duration: false, lookAhead: 1 }
    );

    const minimumResult = findValueNearLabel(
      lines,
      /permanencia(?:\s+minima)?|minima/,
      { duration: true, lookAhead: 1 }
    );

    const roomResult = findTextAfterLabel(lines, /\bsala\b/, { kind: "room", lookAhead: 1 });
    const modulesResult = findTextAfterLabel(lines, /modulo(?:\(s\))?s?/, { kind: "modules", lookAhead: 1 });

    let inicio = startResult.value || findStartFallback(lines);
    let duracao = durationResult.value;
    let permanenciaMinima = minimumResult.value;
    const sala = normalizeRoomCode(roomResult.value);
    const modulos = normalizeModulesText(modulesResult.value);

    if (!duracao) {
      for (const line of lines) {
        const searchable = stripDiacritics(line).toLowerCase();
        if (!searchable.includes("duracao") && !searchable.includes("prova")) continue;
        const value = findTimeToken(line, { duration: true });
        if (value) {
          duracao = value;
          break;
        }
      }
    }

    inicio = normalizeAiClock(inicio);
    const durationMinutes = durationStringToMinutes(duracao);
    const minimumMinutes = durationStringToMinutes(permanenciaMinima);

    if (durationMinutes !== null) duracao = formatDurationClock(durationMinutes);
    if (minimumMinutes !== null) permanenciaMinima = formatDurationClock(minimumMinutes);

    const foundMain = [inicio, duracao, sala, modulos].filter(Boolean).length;
    let confianca = "baixa";
    if (foundMain === 4 && startResult.anchored && durationResult.anchored && roomResult.anchored && modulesResult.anchored) confianca = "alta";
    else if (foundMain >= 3 && inicio && duracao) confianca = "media";

    let observacao = "Confira sala, módulo(s), início, duração e permanência mínima. O término do cartão é sempre ignorado.";
    if (inicio && duracao && sala && modulos && permanenciaMinima) {
      observacao = `Leitura concluída: sala ${sala}, módulo(s) ${modulos}, início ${inicio}, duração ${duracao} e permanência mínima ${permanenciaMinima}.`;
    } else if (inicio && duracao) {
      observacao = "Início e duração foram encontrados. Complete ou confira sala, módulo(s) e permanência mínima antes de salvar.";
    } else if (!inicio && duracao) {
      observacao = "A duração foi encontrada, mas o horário de início manuscrito não ficou legível. Preencha-o manualmente.";
    } else if (inicio && !duracao) {
      observacao = "O horário de início foi encontrado, mas a duração não ficou legível. Preencha-a manualmente.";
    } else if (!inicio && !duracao) {
      observacao = "Os campos principais não foram identificados. Aproxime a câmera e evite reflexos.";
    }

    return {
      sala,
      modulos,
      inicio,
      duracao,
      permanencia_minima: permanenciaMinima || "",
      confianca,
      observacao,
      texto_extraido: rawText
    };
  }

  function renderAiConfirmation(data) {
    const start = normalizeAiClock(data.inicio);
    const durationMinutes = durationStringToMinutes(data.duracao);

    el.aiRoom.value = normalizeRoomCode(data.sala);
    el.aiModules.value = normalizeModulesText(data.modulos);
    el.aiStartTime.value = start;
    el.aiDuration.value = durationMinutes ? formatDurationClock(durationMinutes) : "";
    const minimumMinutes = durationStringToMinutes(data.permanencia_minima);
    el.aiMinimumStay.value = minimumMinutes !== null ? formatDurationClock(minimumMinutes) : "";
    el.aiConfidence.textContent = confidenceLabel(data.confianca);
    el.aiObservation.textContent = data.observacao || "Confira os dados reconhecidos antes de calcular.";
    lastOcrRawText = data.texto_extraido || "";
    if (el.ocrRawText) el.ocrRawText.textContent = lastOcrRawText;
    if (el.ocrRawDetails) el.ocrRawDetails.open = false;
    el.aiValidation.textContent = "";
    setAiState("confirm");
  }

  function showAiError(error) {
    const message = error instanceof Error ? error.message : "Não foi possível analisar a foto.";
    el.aiErrorMessage.textContent = message;
    setAiState("error");
  }

  async function analyzeSelectedPhoto(file) {
    openAiModal("loading");

    try {
      const prepared = await imageFileToOcrJpeg(file);
      lastAiImageDataUrl = prepared.previewDataUrl;
      el.aiPhotoPreview.src = lastAiImageDataUrl;

      const rawText = await callOcrSpace(prepared.blob);
      const data = parseOcrFields(rawText);

      const hasAnyUsefulData = Boolean(normalizeAiClock(data.inicio)) || durationStringToMinutes(data.duracao) !== null;
      if (!hasAnyUsefulData) {
        throw new Error(data.observacao || "O OCR não conseguiu identificar o horário de início nem a duração.");
      }

      renderAiConfirmation(data);
    } catch (error) {
      showAiError(error);
    }
  }

  async function confirmAiData() {
    const room = normalizeRoomCode(el.aiRoom.value);
    const modules = normalizeModulesText(el.aiModules.value);
    const start = normalizeAiClock(el.aiStartTime.value);
    const durationMinutes = durationStringToMinutes(el.aiDuration.value);
    const minimumStayMinutes = durationStringToMinutes(el.aiMinimumStay.value);

    if (!room) {
      el.aiValidation.textContent = "Confira e informe a sala.";
      el.aiRoom.focus();
      return;
    }

    if (!modules) {
      el.aiValidation.textContent = "Confira e informe o(s) módulo(s).";
      el.aiModules.focus();
      return;
    }

    if (!start) {
      el.aiValidation.textContent = "Confira e informe um horário de início válido.";
      el.aiStartTime.focus();
      return;
    }

    if (durationMinutes === null) {
      el.aiValidation.textContent = "Confira e informe uma duração válida, por exemplo 01:00.";
      el.aiDuration.focus();
      return;
    }

    if (minimumStayMinutes === null) {
      el.aiValidation.textContent = "Confira e informe a permanência mínima, por exemplo 00:30.";
      el.aiMinimumStay.focus();
      return;
    }

    if (!currentContext?.projectId) {
      el.aiValidation.textContent = "Selecione o projeto e o período antes de salvar o cartão.";
      return;
    }

    el.aiValidation.textContent = "";
    el.aiConfirm.disabled = true;
    el.aiConfirm.textContent = "Salvando no portal...";

    el.startTime.value = start;
    setDurationFields(durationMinutes);
    setMinimumStayFields(minimumStayMinutes);
    const result = calculate({ animate: true, save: true });
    if (!result) {
      el.aiConfirm.disabled = false;
      el.aiConfirm.textContent = "✓ Confirmar, calcular e salvar";
      return;
    }

    try {
      const saved = await saveExamCardToPortal({ room, modules, result, ocrText: lastOcrRawText });
      lastPortalMeta = {
        saved: true,
        room: saved.room,
        modules: saved.modules,
        projectName: currentContext.projectName,
        period: currentContext.period
      };
      closeAiModal();
      showToast(`Sala ${saved.room} salva no portal.`);
      await loadPortalData();
      window.setTimeout(() => openResultModal(result), 160);
    } catch (error) {
      lastPortalMeta = {
        saved: false,
        room,
        modules,
        projectName: currentContext.projectName,
        period: currentContext.period,
        error: error instanceof Error ? error.message : "Falha ao salvar no Supabase."
      };
      closeAiModal();
      showToast("Cálculo feito, mas o registro não foi salvo.");
      window.setTimeout(() => openResultModal(result), 160);
    } finally {
      el.aiConfirm.disabled = false;
      el.aiConfirm.textContent = "✓ Confirmar, calcular e salvar";
    }
  }

  function setupAiPhotoReader() {
    el.takePhoto.addEventListener("click", requestPhoto);

    el.photoInput.addEventListener("change", () => {
      const file = el.photoInput.files?.[0];
      if (file) analyzeSelectedPhoto(file);
    });

    el.aiModalClose.addEventListener("click", closeAiModal);
    el.aiModalBackdrop.addEventListener("click", closeAiModal);
    el.aiConfirm.addEventListener("click", confirmAiData);

    el.aiRetry.addEventListener("click", () => {
      closeAiModal();
      window.setTimeout(requestPhoto, 120);
    });

    el.aiErrorRetry.addEventListener("click", () => {
      closeAiModal();
      window.setTimeout(requestPhoto, 120);
    });

    el.aiDuration.addEventListener("input", () => {
      let value = el.aiDuration.value.replace(/[^0-9:]/g, "").slice(0, 5);
      if (/^\d{2}$/.test(value) && !value.includes(":")) value += ":";
      el.aiDuration.value = value;
    });

    el.aiMinimumStay.addEventListener("input", () => {
      let value = el.aiMinimumStay.value.replace(/[^0-9:]/g, "").slice(0, 5);
      if (/^\d{2}$/.test(value) && !value.includes(":")) value += ":";
      el.aiMinimumStay.value = value;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && el.aiModal.classList.contains("open")) {
        closeAiModal();
      } else if (event.key === "Escape" && el.resultModal.classList.contains("open")) {
        closeResultModal();
      }
    });
  }

  // =========================================================
  // MODAL DE RESULTADO
  // =========================================================

  function fillResultModal(result) {
    if (!result) return;
    el.modalEndTime.textContent = result.end;
    el.modalStartTime.textContent = result.start;
    el.modalDuration.textContent = result.durationClock;
    el.modalMinimumStay.textContent = result.minimumStayClock;
    el.modalMinimumExit.textContent = result.minimumExit;
    el.modalDayIndicator.classList.toggle("hidden", !result.crossesDay);

    if (lastPortalMeta) {
      el.resultPortalMeta.classList.remove("hidden");
      el.modalRoom.textContent = lastPortalMeta.room || "—";
      el.modalModules.textContent = lastPortalMeta.modules || "—";
      el.modalPortalContext.textContent = `${lastPortalMeta.projectName || "Projeto"} • ${periodLabel(lastPortalMeta.period)}`;
      el.resultPortalSaved.classList.toggle("error", !lastPortalMeta.saved);
      el.resultPortalSaved.textContent = lastPortalMeta.saved
        ? "✓ Registro salvo no portal"
        : `⚠ Não foi possível salvar no portal${lastPortalMeta.error ? `: ${lastPortalMeta.error}` : ""}`;
    } else {
      el.resultPortalMeta.classList.add("hidden");
      el.resultPortalSaved.classList.remove("error");
    }
  }

  function openResultModal(result = lastResult) {
    if (!result) return;
    fillResultModal(result);
    el.resultModal.classList.add("open");
    el.resultModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeResultModal() {
    el.resultModal.classList.remove("open");
    el.resultModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function setupResultModal() {
    el.resultModalClose.addEventListener("click", closeResultModal);
    el.resultModalOk.addEventListener("click", closeResultModal);
    el.resultModalBackdrop.addEventListener("click", closeResultModal);
    el.resultModalCopy.addEventListener("click", copySummary);
  }

  // =========================================================
  // EVENTOS PRINCIPAIS
  // =========================================================

  el.form.addEventListener("submit", (event) => {
    event.preventDefault();
    normalizeDurationFields();
    normalizeMinimumFields();
    const result = calculate({ animate: true, save: true });

    if (result) {
      lastPortalMeta = null;
      openResultModal(result);
    }
  });

  el.startTime.addEventListener("input", scheduleAutoCalculate);
  el.startTime.addEventListener("change", scheduleAutoCalculate);

  [el.durationHours, el.durationMinutes].forEach((input) => {
    input.addEventListener("input", () => {
      sanitizeDurationPart(input);
      scheduleAutoCalculate();
    });

    input.addEventListener("blur", () => {
      if (input.value.trim() === "") input.value = "00";
      else input.value = String(Number(input.value) || 0).padStart(2, "0");
      scheduleAutoCalculate();
    });
  });

  [el.minimumHours, el.minimumMinutes].forEach((input) => {
    input.addEventListener("input", () => {
      sanitizeDurationPart(input);
      scheduleAutoCalculate();
    });

    input.addEventListener("blur", () => {
      if (input.value.trim() === "") input.value = "00";
      else input.value = String(Number(input.value) || 0).padStart(2, "0");
      scheduleAutoCalculate();
    });
  });

  el.durationHours.addEventListener("input", () => {
    if (el.durationHours.value.length === 2) el.durationMinutes.focus();
  });

  el.minimumHours.addEventListener("input", () => {
    if (el.minimumHours.value.length === 2) el.minimumMinutes.focus();
  });

  el.quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDurationFields(Number(button.dataset.minutes));
      calculate({ animate: true, save: false });
    });
  });

  el.reset.addEventListener("click", () => {
    el.startTime.value = "10:08";
    setDurationFields(50);
    setMinimumStayFields(30);
    calculate({ animate: true, save: false });
    el.startTime.focus();
  });

  el.copy.addEventListener("click", copySummary);

  el.clearHistory.addEventListener("click", () => {
    writeHistory([]);
    renderHistory();
    showToast("Histórico limpo.");
  });

  setupLogos();
  setupPortalContext();
  setupPortalView();
  setupMainMenu();
  initIntro();
  setupAiPhotoReader();
  setupResultModal();
  setDurationFields(50);
  setMinimumStayFields(30);
  renderHistory();
  calculate({ animate: false, save: false });
})();
