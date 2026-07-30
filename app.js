(() => {
  "use strict";

  const OCR_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
  const OCR_MAX_UPLOAD_BYTES = 900 * 1024;
  const OCR_DIMENSION_STEPS = [1800, 1500, 1250, 1050, 900];
  const OCR_QUALITY_STEPS = [0.82, 0.76, 0.70, 0.64, 0.58];
  const ROLE_ORDER = ["po", "coordenador", "auxiliar_coordenacao", "fiscal_controle"];
  const ROLE_LABELS = {
    po: "PO do Projeto",
    coordenador: "Coordenador",
    auxiliar_coordenacao: "Auxiliar de Coordenação",
    fiscal_controle: "Fiscal Controle"
  };

  const $ = (id) => document.getElementById(id);
  const qa = (selector) => [...document.querySelectorAll(selector)];

  const el = {
    intro: $("introScreen"), authGate: $("authGate"), authError: $("authError"), appShell: $("appShell"),
    headerAvatarImg: $("headerAvatarImg"), headerAvatarFallback: $("headerAvatarFallback"),
    drawerAvatarImg: $("drawerAvatarImg"), drawerAvatarFallback: $("drawerAvatarFallback"), drawerUserName: $("drawerUserName"), drawerUserEmail: $("drawerUserEmail"),
    views: qa(".view"), projectsView: $("projectsView"), profileProjectsView: $("profileProjectsView"), quickCalculatorView: $("quickCalculatorView"), projectView: $("projectView"), directoryView: $("directoryView"),
    navDrawer: $("navDrawer"), navActiveProjectsBtn: $("navActiveProjectsBtn"), navClosedProjectsBtn: $("navClosedProjectsBtn"),
    projectGrid: $("projectGrid"), projectsStatus: $("projectsStatus"), projectsEmpty: $("projectsEmpty"), projectsEyebrow: $("projectsEyebrow"), projectsTitle: $("projectsTitle"), projectsDescription: $("projectsDescription"), projectsEmptyTitle: $("projectsEmptyTitle"), projectsEmptyText: $("projectsEmptyText"),
    profileProjectGrid: $("profileProjectGrid"), profileProjectsStatus: $("profileProjectsStatus"), profileProjectsEmpty: $("profileProjectsEmpty"),
    projectTitle: $("projectTitle"), projectCrumb: $("projectCrumb"), projectDescription: $("projectDescription"), projectDateLabel: $("projectDateLabel"), directoryGrid: $("directoryGrid"), directoriesEmpty: $("directoriesEmpty"),
    projectParticipantsGrid: $("projectParticipantsGrid"), manageParticipantsBtn: $("manageParticipantsBtn"),
    projectStatusBadge: $("projectStatusBadge"), editProjectBtn: $("editProjectBtn"), closeProjectBtn: $("closeProjectBtn"), deleteProjectBtn: $("deleteProjectBtn"), addDirectoryBtn: $("addDirectoryBtn"),
    editProjectModal: $("editProjectModal"), editProjectName: $("editProjectName"), editProjectDate: $("editProjectDate"), editProjectDescription: $("editProjectDescription"), editProjectOrganization: $("editProjectOrganization"), editSearchOrganizationImageBtn: $("editSearchOrganizationImageBtn"), editNextOrganizationImageBtn: $("editNextOrganizationImageBtn"), editOrganizationPreview: $("editOrganizationPreview"), editOrganizationPreviewImage: $("editOrganizationPreviewImage"), editOrganizationPreviewTitle: $("editOrganizationPreviewTitle"), editOrganizationPreviewStatus: $("editOrganizationPreviewStatus"), editProjectValidation: $("editProjectValidation"), saveProjectEditsBtn: $("saveProjectEditsBtn"),
    projectActionModal: $("projectActionModal"), projectActionChip: $("projectActionChip"), projectActionTitle: $("projectActionTitle"), projectActionText: $("projectActionText"), projectActionValidation: $("projectActionValidation"), projectActionConfirm: $("projectActionConfirm"), deleteProjectConfirmField: $("deleteProjectConfirmField"), deleteProjectConfirmInput: $("deleteProjectConfirmInput"),
    directoryTitle: $("directoryTitle"), directoryCrumb: $("directoryCrumb"), directoryProjectLabel: $("directoryProjectLabel"), directoryPeriodBadge: $("directoryPeriodBadge"),
    menuDrawer: $("menuDrawer"), bioSector: $("bioSector"), bioJobTitle: $("bioJobTitle"), bioPhone: $("bioPhone"), bioExtension: $("bioExtension"),
    profileModal: $("profileModal"), profileValidation: $("profileValidation"), profileSectorInput: $("profileSectorInput"), profileJobTitleInput: $("profileJobTitleInput"), profilePhoneInput: $("profilePhoneInput"), profileExtensionInput: $("profileExtensionInput"),
    projectModal: $("projectModal"), projectModalValidation: $("projectModalValidation"), newProjectName: $("newProjectName"), newProjectDate: $("newProjectDate"), newProjectDescription: $("newProjectDescription"), newProjectOrganization: $("newProjectOrganization"), searchOrganizationImageBtn: $("searchOrganizationImageBtn"), nextOrganizationImageBtn: $("nextOrganizationImageBtn"), organizationPreview: $("organizationPreview"), organizationPreviewImage: $("organizationPreviewImage"), organizationPreviewTitle: $("organizationPreviewTitle"), organizationPreviewStatus: $("organizationPreviewStatus"), directoryRowList: $("directoryRowList"),
    participantsModal: $("participantsModal"), participantsValidation: $("participantsValidation"), participantInputs: qa(".participant-search-input"),
    directoryModal: $("directoryModal"), singleDirectoryName: $("singleDirectoryName"), singleDirectoryPeriod: $("singleDirectoryPeriod"), directoryModalValidation: $("directoryModalValidation"),
    sections: qa(".directory-section"), sectionTabs: qa(".section-tab"),
    photoInput: $("examPhotoInput"), quickPhotoInput: $("quickPhotoInput"),
    manualForm: $("manualForm"), manualStart: $("manualStart"), manualDurationHours: $("manualDurationHours"), manualDurationMinutes: $("manualDurationMinutes"), manualMinimumHours: $("manualMinimumHours"), manualMinimumMinutes: $("manualMinimumMinutes"), manualValidation: $("manualValidation"),
    quickManualForm: $("quickManualForm"), quickStart: $("quickStart"), quickDurationHours: $("quickDurationHours"), quickDurationMinutes: $("quickDurationMinutes"), quickMinimumHours: $("quickMinimumHours"), quickMinimumMinutes: $("quickMinimumMinutes"), quickValidation: $("quickValidation"),
    roomsStatus: $("roomsStatus"), roomsGrid: $("roomsGrid"), roomsEmpty: $("roomsEmpty"), roomsRoot: $("roomsRoot"), roomDetail: $("roomDetail"), roomCrumb: $("roomCrumb"), roomTitle: $("roomTitle"), roomMeta: $("roomMeta"), roomRecords: $("roomRecords"),
    check1: $("check1"), check2: $("check2"), check3: $("check3"), check4: $("check4"), checkComments: $("checkComments"), checklistStatus: $("checklistStatus"),
    ocrModal: $("ocrModal"), ocrLoading: $("ocrLoading"), ocrConfirm: $("ocrConfirm"), ocrError: $("ocrError"), ocrPreview: $("ocrPreview"), ocrRoom: $("ocrRoom"), ocrModules: $("ocrModules"), ocrModulesField: $("ocrModulesField"), ocrStart: $("ocrStart"), ocrDuration: $("ocrDuration"), ocrMinimum: $("ocrMinimum"), ocrEnd: $("ocrEnd"), ocrEndCheck: $("ocrEndCheck"), ocrAutoReading: $("ocrAutoReading"), ocrQuality: $("ocrQuality"), ocrRawText: $("ocrRawText"), ocrValidation: $("ocrValidation"), ocrErrorText: $("ocrErrorText"),
    resultModal: $("resultModal"), resultEnd: $("resultEnd"), resultStart: $("resultStart"), resultDuration: $("resultDuration"), resultMinimum: $("resultMinimum"), resultMinimumExit: $("resultMinimumExit"), resultReportedEndBox: $("resultReportedEndBox"), resultReportedEnd: $("resultReportedEnd"), resultEndValidationText: $("resultEndValidationText"), savedMeta: $("savedMeta"), savedRoom: $("savedRoom"), savedModules: $("savedModules"),
    toast: $("toast"), toastText: $("toastText")
  };

  let authClient = null;
  let session = null;
  let currentUser = null;
  let currentProfile = null;
  let currentProject = null;
  let currentDirectory = null;
  let currentSection = "rooms";
  let roomsCache = [];
  let projectMembersCache = [];
  let selectedParticipants = Object.fromEntries(ROLE_ORDER.map(role => [role, null]));
  let originalRoleUsers = {};
  let searchTimers = {};
  let ocrMode = "directory";
  let ocrDetectedCardType = "module_card";
  let toastTimer = null;
  let projectActionMode = null;
  let currentProjectFilter = "ativo";
  let projectsCache = [];
  let organizationImageCandidates = [];
  let selectedOrganizationImageIndex = -1;
  let organizationSearchTimer = null;
  let organizationSearchQuery = "";
  let editOrganizationImageCandidates = [];
  let editSelectedOrganizationImageIndex = -1;
  let editOrganizationSearchTimer = null;
  let editOrganizationSearchQuery = "";

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function stripDiacritics(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function slugify(value) {
    const base = stripDiacritics(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "projeto";
    return `${base}-${Date.now().toString(36).slice(-6)}`;
  }
  function periodLabel(period) { return period === "manha" ? "Manhã" : period === "tarde" ? "Tarde" : "—"; }
  function normalizeRoomCode(value) { return String(value || "").replace(/^sala\s*[:\-]?\s*/i, "").replace(/\s+/g, " ").trim().slice(0, 40); }
  function normalizeModulesText(value) { return String(value || "").replace(/^m[oó]dulo\(s\)\s*[:\-]?\s*/i, "").replace(/^m[oó]dulos?\s*[:\-]?\s*/i, "").replace(/\s*[|;]+\s*/g, ", ").replace(/\s*\/\s*/g, ", ").replace(/\s*,\s*/g, ", ").replace(/\s+/g, " ").trim().slice(0, 120); }
  function safeAvatarUrl(value) { const v = String(value || "").trim(); return /^https:\/\//i.test(v) ? v : ""; }
  function safeImageUrl(value) { const v = String(value || "").trim(); return /^https:\/\//i.test(v) ? v : ""; }
  function initials(name, email = "") { const source = String(name || email || "U").trim(); const parts = source.split(/\s+/).filter(Boolean); return ((parts[0]?.[0] || "U") + (parts.length > 1 ? parts.at(-1)[0] : "")).toUpperCase().slice(0, 2); }
  function displayNameFromUser(user) { return String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário"); }
  function avatarFromUser(user) { return safeAvatarUrl(user?.user_metadata?.avatar_url || user?.user_metadata?.picture); }
  function parseLocalDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  function formatProjectDate(value, fallback = "") {
    const date = parseLocalDate(value) || (fallback ? new Date(fallback) : null);
    if (!date || Number.isNaN(date.getTime())) return "Data não informada";
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  }
  function projectDateSortValue(project) {
    return parseLocalDate(project.project_date)?.getTime() || new Date(project.created_at || 0).getTime() || 0;
  }

  function currentOrganizationImage() {
    return selectedOrganizationImageIndex >= 0
      ? organizationImageCandidates[selectedOrganizationImageIndex] || null
      : null;
  }

  function normalizeOrganizationCandidate(candidate) {
    const imageUrl = safeImageUrl(candidate?.imageUrl);
    if (!imageUrl) return null;
    return {
      imageUrl,
      sourceUrl: safeImageUrl(candidate?.sourceUrl),
      title: String(candidate?.title || "Imagem institucional").trim(),
      provider: String(candidate?.provider || "Wikimedia").trim()
    };
  }

  function renderOrganizationPreview(message = "") {
    if (!el.organizationPreview) return;
    const selected = currentOrganizationImage();
    const organization = el.newProjectOrganization?.value.trim() || "";
    el.organizationPreview.classList.toggle("is-empty", !selected);
    el.organizationPreview.classList.toggle("is-loading", message === "loading");
    el.nextOrganizationImageBtn?.classList.toggle("hidden", organizationImageCandidates.length < 2);

    if (selected) {
      el.organizationPreviewImage.style.backgroundImage = `url(${JSON.stringify(selected.imageUrl)})`;
      el.organizationPreviewTitle.textContent = organization || selected.title;
      el.organizationPreviewStatus.textContent = `${selected.provider} • imagem ${selectedOrganizationImageIndex + 1} de ${organizationImageCandidates.length}`;
      return;
    }

    el.organizationPreviewImage.style.backgroundImage = "";
    el.organizationPreviewTitle.textContent = organization || "A identidade visual aparecerá aqui";
    el.organizationPreviewStatus.textContent = message === "loading"
      ? "Buscando uma imagem pública do órgão..."
      : message || "Digite o nome do órgão para iniciar a busca.";
  }

  async function searchCommonsImages(organization) {
    const params = new URLSearchParams({
      origin: "*",
      action: "query",
      generator: "search",
      gsrsearch: `${organization} logo`,
      gsrnamespace: "6",
      gsrlimit: "8",
      prop: "imageinfo",
      iiprop: "url|mime",
      iiurlwidth: "1400",
      format: "json",
      formatversion: "2"
    });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error(`Wikimedia Commons respondeu HTTP ${response.status}.`);
    const payload = await response.json();
    return (payload?.query?.pages || []).map(page => {
      const info = page?.imageinfo?.[0] || {};
      const mime = String(info.mime || "");
      if (!/^image\/(png|jpeg|svg\+xml|webp)$/i.test(mime)) return null;
      return normalizeOrganizationCandidate({
        imageUrl: info.thumburl || info.url,
        sourceUrl: info.descriptionurl,
        title: String(page.title || "").replace(/^File:/i, ""),
        provider: "Wikimedia Commons"
      });
    }).filter(Boolean);
  }

  async function searchWikipediaImages(organization) {
    const params = new URLSearchParams({
      origin: "*",
      action: "query",
      generator: "search",
      gsrsearch: organization,
      gsrnamespace: "0",
      gsrlimit: "5",
      prop: "pageimages|info",
      piprop: "thumbnail|original",
      pithumbsize: "1400",
      inprop: "url",
      format: "json",
      formatversion: "2"
    });
    const response = await fetch(`https://pt.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error(`Wikipédia respondeu HTTP ${response.status}.`);
    const payload = await response.json();
    return (payload?.query?.pages || []).map(page => normalizeOrganizationCandidate({
      imageUrl: page?.original?.source || page?.thumbnail?.source,
      sourceUrl: page?.fullurl,
      title: page?.title,
      provider: "Wikipédia"
    })).filter(Boolean);
  }

  async function searchOrganizationVisual({ silent = false } = {}) {
    const organization = el.newProjectOrganization?.value.trim() || "";
    if (organization.length < 3) {
      organizationImageCandidates = [];
      selectedOrganizationImageIndex = -1;
      renderOrganizationPreview("Informe pelo menos 3 caracteres no campo Órgão.");
      return null;
    }

    organizationSearchQuery = organization;
    organizationImageCandidates = [];
    selectedOrganizationImageIndex = -1;
    renderOrganizationPreview("loading");
    if (el.searchOrganizationImageBtn) el.searchOrganizationImageBtn.disabled = true;

    try {
      const results = await Promise.allSettled([
        searchCommonsImages(organization),
        searchWikipediaImages(organization)
      ]);
      const combined = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
      const seen = new Set();
      organizationImageCandidates = combined.filter(candidate => {
        if (!candidate?.imageUrl || seen.has(candidate.imageUrl)) return false;
        seen.add(candidate.imageUrl);
        return true;
      }).slice(0, 10);
      selectedOrganizationImageIndex = organizationImageCandidates.length ? 0 : -1;
      renderOrganizationPreview(organizationImageCandidates.length ? "" : "Nenhuma imagem pública foi localizada. O card usará o fundo visual padrão.");
      if (!silent && organizationImageCandidates.length) showToast("Identidade visual localizada.");
      return currentOrganizationImage();
    } catch (error) {
      organizationImageCandidates = [];
      selectedOrganizationImageIndex = -1;
      renderOrganizationPreview("Não foi possível consultar imagens agora. O projeto ainda pode ser criado com o fundo padrão.");
      if (!silent) showToast(error.message || "Falha ao buscar imagem do órgão.");
      return null;
    } finally {
      if (el.searchOrganizationImageBtn) el.searchOrganizationImageBtn.disabled = false;
    }
  }

  function nextOrganizationImage() {
    if (organizationImageCandidates.length < 2) return;
    selectedOrganizationImageIndex = (selectedOrganizationImageIndex + 1) % organizationImageCandidates.length;
    renderOrganizationPreview();
  }

  function currentEditOrganizationImage() {
    return editSelectedOrganizationImageIndex >= 0
      ? editOrganizationImageCandidates[editSelectedOrganizationImageIndex] || null
      : null;
  }

  function renderEditOrganizationPreview(message = "") {
    if (!el.editOrganizationPreview) return;
    const selected = currentEditOrganizationImage();
    const organization = el.editProjectOrganization?.value.trim() || "";
    el.editOrganizationPreview.classList.toggle("is-empty", !selected);
    el.editOrganizationPreview.classList.toggle("is-loading", message === "loading");
    el.editNextOrganizationImageBtn?.classList.toggle("hidden", editOrganizationImageCandidates.length < 2);

    if (selected) {
      el.editOrganizationPreviewImage.style.backgroundImage = `url(${JSON.stringify(selected.imageUrl)})`;
      el.editOrganizationPreviewTitle.textContent = organization || selected.title;
      const currentLabel = selected.provider === "Imagem atual" ? "Imagem atual preservada" : `${selected.provider} • imagem ${editSelectedOrganizationImageIndex + 1} de ${editOrganizationImageCandidates.length}`;
      el.editOrganizationPreviewStatus.textContent = currentLabel;
      return;
    }

    el.editOrganizationPreviewImage.style.backgroundImage = "";
    el.editOrganizationPreviewTitle.textContent = organization || "Identidade visual do projeto";
    el.editOrganizationPreviewStatus.textContent = message === "loading"
      ? "Buscando uma nova imagem pública do órgão..."
      : message || "O projeto usará o fundo visual padrão.";
  }

  async function searchEditOrganizationVisual({ silent = false } = {}) {
    const organization = el.editProjectOrganization?.value.trim() || "";
    if (organization.length < 3) {
      editOrganizationImageCandidates = [];
      editSelectedOrganizationImageIndex = -1;
      renderEditOrganizationPreview("Informe pelo menos 3 caracteres no campo Órgão.");
      return null;
    }

    editOrganizationSearchQuery = organization;
    editOrganizationImageCandidates = [];
    editSelectedOrganizationImageIndex = -1;
    renderEditOrganizationPreview("loading");
    if (el.editSearchOrganizationImageBtn) el.editSearchOrganizationImageBtn.disabled = true;

    try {
      const results = await Promise.allSettled([
        searchCommonsImages(organization),
        searchWikipediaImages(organization)
      ]);
      const combined = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
      const seen = new Set();
      editOrganizationImageCandidates = combined.filter(candidate => {
        if (!candidate?.imageUrl || seen.has(candidate.imageUrl)) return false;
        seen.add(candidate.imageUrl);
        return true;
      }).slice(0, 10);
      editSelectedOrganizationImageIndex = editOrganizationImageCandidates.length ? 0 : -1;
      renderEditOrganizationPreview(editOrganizationImageCandidates.length ? "" : "Nenhuma imagem pública foi localizada. O fundo padrão será utilizado.");
      if (!silent && editOrganizationImageCandidates.length) showToast("Nova identidade visual localizada.");
      return currentEditOrganizationImage();
    } catch (error) {
      editOrganizationImageCandidates = [];
      editSelectedOrganizationImageIndex = -1;
      renderEditOrganizationPreview("Não foi possível consultar imagens agora. Você ainda pode salvar os demais dados.");
      if (!silent) showToast(error.message || "Falha ao buscar imagem do órgão.");
      return null;
    } finally {
      if (el.editSearchOrganizationImageBtn) el.editSearchOrganizationImageBtn.disabled = false;
    }
  }

  function nextEditOrganizationImage() {
    if (editOrganizationImageCandidates.length < 2) return;
    editSelectedOrganizationImageIndex = (editSelectedOrganizationImageIndex + 1) % editOrganizationImageCandidates.length;
    renderEditOrganizationPreview();
  }

  function showToast(message) {
    el.toastText.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2300);
  }
  function showView(id) {
    el.views.forEach(view => view.classList.toggle("active", view.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openModal(node) {
    if (!node) return;
    node.classList.add("open"); node.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
  }
  function closeModal(node) {
    if (!node) return;
    node.classList.remove("open"); node.setAttribute("aria-hidden", "true");
    if (!qa(".modal.open").length && !el.menuDrawer.classList.contains("open") && !el.navDrawer.classList.contains("open")) document.body.classList.remove("modal-open");
  }

  // -------------------- SUPABASE / AUTH --------------------
  function getSupabaseConfig() {
    const cfg = window.FCC_CONFIG || {};
    const url = String(cfg.SUPABASE_URL || "").trim().replace(/\/$/, "");
    const key = String(cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_ANON_KEY || "").trim();
    return { url, key, configured: Boolean(url && key && !url.includes("COLE_AQUI") && !key.includes("COLE_AQUI")) };
  }

  function buildRedirectUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  async function supabaseRequest(resource, { method = "GET", body = null, prefer = "" } = {}) {
    const cfg = getSupabaseConfig();
    if (!cfg.configured) throw new Error("Supabase não configurado no config.js.");
    if (!session?.access_token) throw new Error("Sua sessão expirou. Entre novamente.");
    const headers = { apikey: cfg.key, Authorization: `Bearer ${session.access_token}`, Accept: "application/json" };
    if (body !== null) headers["Content-Type"] = "application/json";
    if (prefer) headers.Prefer = prefer;
    const response = await fetch(`${cfg.url}/rest/v1/${resource}`, { method, headers, body: body === null ? undefined : JSON.stringify(body) });
    const text = await response.text();
    let payload = null;
    if (text) { try { payload = JSON.parse(text); } catch { payload = text; } }
    if (!response.ok) throw new Error(payload?.message || payload?.details || payload?.hint || String(payload || `HTTP ${response.status}`));
    return payload;
  }

  async function syncMyProfile() {
    if (!currentUser) return;
    const body = {
      id: currentUser.id,
      full_name: displayNameFromUser(currentUser),
      email: currentUser.email || "",
      avatar_url: avatarFromUser(currentUser),
      last_seen_at: new Date().toISOString()
    };
    const params = new URLSearchParams({ on_conflict: "id" });
    await supabaseRequest(`fcc_profiles?${params}`, { method: "POST", body, prefer: "resolution=merge-duplicates,return=minimal" });
  }

  function profileValue(value) {
    const text = String(value || "").trim();
    return text || "Não informado";
  }

  function renderProfileBio() {
    if (!el.bioSector) return;
    el.bioSector.textContent = profileValue(currentProfile?.sector);
    el.bioJobTitle.textContent = profileValue(currentProfile?.job_title);
    el.bioPhone.textContent = profileValue(currentProfile?.phone);
    el.bioExtension.textContent = profileValue(currentProfile?.extension);
  }

  async function loadMyProfile() {
    if (!currentUser) return;
    const params = new URLSearchParams({
      select: "id,full_name,email,avatar_url,sector,job_title,phone,extension,last_seen_at",
      id: `eq.${currentUser.id}`,
      limit: "1"
    });
    const data = await supabaseRequest(`fcc_profiles?${params}`);
    currentProfile = Array.isArray(data) && data[0] ? data[0] : {
      id: currentUser.id,
      full_name: displayNameFromUser(currentUser),
      email: currentUser.email || "",
      avatar_url: avatarFromUser(currentUser),
      sector: "", job_title: "", phone: "", extension: ""
    };
    renderProfileBio();
  }

  function openProfileModal() {
    closeMenu();
    el.profileSectorInput.value = currentProfile?.sector || "";
    el.profileJobTitleInput.value = currentProfile?.job_title || "";
    el.profilePhoneInput.value = currentProfile?.phone || "";
    el.profileExtensionInput.value = currentProfile?.extension || "";
    el.profileValidation.textContent = "";
    openModal(el.profileModal);
  }

  async function saveProfileBio() {
    if (!currentUser) return;
    const body = {
      sector: el.profileSectorInput.value.trim(),
      job_title: el.profileJobTitleInput.value.trim(),
      phone: el.profilePhoneInput.value.trim(),
      extension: el.profileExtensionInput.value.trim()
    };
    el.profileValidation.textContent = "Salvando BIO...";
    try {
      const params = new URLSearchParams({ id: `eq.${currentUser.id}` });
      await supabaseRequest(`fcc_profiles?${params}`, { method: "PATCH", body, prefer: "return=minimal" });
      currentProfile = { ...(currentProfile || {}), ...body };
      renderProfileBio();
      closeModal(el.profileModal);
      showToast("BIO atualizada.");
    } catch (error) {
      el.profileValidation.textContent = `Erro: ${error.message}`;
    }
  }

  function renderSignedUser() {
    const name = displayNameFromUser(currentUser); const email = currentUser?.email || ""; const avatar = avatarFromUser(currentUser); const fallback = initials(name, email);
    el.drawerUserName.textContent = name; el.drawerUserEmail.textContent = email;
    [el.headerAvatarFallback, el.drawerAvatarFallback].forEach(node => node.textContent = fallback);
    [[el.headerAvatarImg, el.headerAvatarFallback], [el.drawerAvatarImg, el.drawerAvatarFallback]].forEach(([img, fb]) => {
      if (avatar) { img.src = avatar; img.classList.remove("hidden"); fb.classList.add("hidden"); }
      else { img.classList.add("hidden"); fb.classList.remove("hidden"); }
    });
  }

  function showLogin(errorMessage = "") {
    session = null; currentUser = null; currentProfile = null; currentProject = null; currentDirectory = null;
    document.body.classList.remove("guest-mode");
    el.appShell.classList.add("hidden"); el.authGate.classList.remove("hidden"); document.body.classList.remove("auth-pending");
    el.authError.textContent = errorMessage;
    const guestReturn = $("guestLoginReturnBtn"); if (guestReturn) guestReturn.classList.add("hidden");
    window.dispatchEvent(new CustomEvent("fcc:signed-out"));
  }

  function showPublicCalculator() {
    currentProject = null; currentDirectory = null;
    document.body.classList.add("guest-mode");
    el.authGate.classList.add("hidden"); el.appShell.classList.remove("hidden"); document.body.classList.remove("auth-pending");
    const guestReturn = $("guestLoginReturnBtn"); if (guestReturn) guestReturn.classList.remove("hidden");
    resetQuickManual(); showView("quickCalculatorView");
  }

  function goQuickHome() {
    if (currentUser) goProjects("ativo");
    else showLogin();
  }

  async function activateSession(nextSession) {
    session = nextSession; currentUser = nextSession?.user || null;
    if (!currentUser) return showLogin();
    document.body.classList.remove("guest-mode");
    renderSignedUser();
    try { await syncMyProfile(); await loadMyProfile(); } catch (error) { console.warn("Perfil não sincronizado:", error); currentProfile = null; renderProfileBio(); }
    el.authGate.classList.add("hidden"); el.appShell.classList.remove("hidden"); document.body.classList.remove("auth-pending");
    const guestReturn = $("guestLoginReturnBtn"); if (guestReturn) guestReturn.classList.add("hidden");
    updateMenuContext();
    currentProjectFilter = "ativo";
    showView("projectsView");
    window.dispatchEvent(new CustomEvent("fcc:auth-session", { detail: { session, user: currentUser, profile: currentProfile } }));
    await loadProjects();
  }

  async function signInWithGoogle() {
    el.authError.textContent = "";
    if (!authClient) return void (el.authError.textContent = "Supabase Auth não foi inicializado.");
    try {
      const { error } = await authClient.auth.signInWithOAuth({ provider: "google", options: { redirectTo: buildRedirectUrl() } });
      if (error) throw error;
    } catch (error) { el.authError.textContent = error.message || "Não foi possível iniciar o login."; }
  }

  async function signOut() {
    closeMenu(); closeNav();
    try { if (authClient) await authClient.auth.signOut(); } finally { showLogin(); }
  }

  async function initAuth() {
    const cfg = getSupabaseConfig();
    if (!cfg.configured) return showLogin("Configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no config.js.");
    if (!window.supabase?.createClient) return showLogin("A biblioteca do Supabase não carregou. Verifique sua conexão.");
    authClient = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    authClient.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") showLogin();
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && nextSession && nextSession.access_token !== session?.access_token) setTimeout(() => activateSession(nextSession), 0);
    });
    const { data, error } = await authClient.auth.getSession();
    if (error) return showLogin(error.message);
    if (data?.session) await activateSession(data.session); else showLogin();
  }

  // -------------------- PROJETOS / DIRETÓRIOS --------------------
  function updateProjectsNavigation() {
    const closed = currentProjectFilter === "encerrado";
    el.projectsEyebrow.textContent = closed ? "HISTÓRICO" : "INÍCIO";
    el.projectsTitle.textContent = closed ? "Projetos Concluídos" : "Projetos Ativos";
    el.projectsDescription.textContent = closed
      ? "Projetos encerrados, disponíveis para consulta."
      : "Projetos em andamento, organizados pela data de realização.";
    el.projectsEmptyTitle.textContent = closed ? "Nenhum projeto concluído" : "Você ainda não possui projetos ativos";
    el.projectsEmptyText.textContent = closed
      ? "Os projetos aparecerão aqui após serem encerrados."
      : "Crie um projeto ou consulte os projetos concluídos pelo menu inferior.";
    el.navActiveProjectsBtn.classList.toggle("active", !closed);
    el.navClosedProjectsBtn.classList.toggle("active", closed);
    $("newProjectBtn").classList.toggle("hidden", closed);
    $("emptyNewProjectBtn").classList.toggle("hidden", closed);
  }

  async function goProjects(filter = "ativo") {
    currentProjectFilter = filter === "encerrado" ? "encerrado" : "ativo";
    updateProjectsNavigation();
    showView("projectsView");
    await loadProjects();
  }

  async function loadProjects() {
    if (!currentUser) return;
    updateProjectsNavigation();
    el.projectsStatus.innerHTML = "<span></span> Sincronizando com o Supabase...";
    try {
      const projects = await supabaseRequest("rpc/fcc_list_my_projects", { method: "POST", body: {} });
      projectsCache = Array.isArray(projects) ? projects : [];
      renderProjects(projectsCache);
      const count = projectsCache.filter(project => (project.status || "ativo") === currentProjectFilter).length;
      el.projectsStatus.innerHTML = `<span></span> ${count} ${count === 1 ? "projeto" : "projetos"} ${currentProjectFilter === "encerrado" ? "concluído" : "ativo"}${count === 1 ? "" : "s"}`;
    } catch (error) {
      projectsCache = []; el.projectGrid.innerHTML = ""; el.projectsEmpty.classList.add("hidden"); el.projectsStatus.textContent = `Supabase: ${error.message}`;
    }
  }

  function projectAvatarHtml(name, email, avatarUrl, label) {
    const avatar = safeAvatarUrl(avatarUrl);
    const title = `${label}: ${name || "Não definido"}`;
    if (avatar) return `<span class="project-team-avatar" title="${escapeHtml(title)}"><img src="${escapeHtml(avatar)}" alt="${escapeHtml(title)}"></span>`;
    return `<span class="project-team-avatar fallback" title="${escapeHtml(title)}">${escapeHtml(initials(name || label, email))}</span>`;
  }

  const LEGACY_PROJECT_DESCRIPTION = "Abrir diretórios do projeto";

  function displayProjectDescription(value) {
    const text = String(value || "").trim();
    if (!text || text.toLocaleLowerCase("pt-BR") === LEGACY_PROJECT_DESCRIPTION.toLocaleLowerCase("pt-BR")) {
      return "Projeto de aplicação";
    }
    return text;
  }

  function editableProjectDescription(value) {
    const text = String(value || "").trim();
    return text.toLocaleLowerCase("pt-BR") === LEGACY_PROJECT_DESCRIPTION.toLocaleLowerCase("pt-BR") ? "" : text;
  }

  function projectCardElement(project) {
    const btn = document.createElement("button");
    btn.className = "project-card kanban-project-card";
    btn.type = "button";
    const legacy = !project.created_by;
    const closed = project.status === "encerrado";
    const dateText = formatProjectDate(project.project_date, project.created_at);
    const poAvatar = projectAvatarHtml(project.po_name, project.po_email, project.po_avatar_url, "PO");
    const coordinatorAvatar = projectAvatarHtml(project.coordinator_name, project.coordinator_email, project.coordinator_avatar_url, "Coordenador");
    const description = displayProjectDescription(project.card_description);
    const organization = String(project.organization_name || "").trim();
    const backgroundImage = safeImageUrl(project.background_image_url);
    btn.classList.toggle("closed-project", closed);
    btn.classList.toggle("has-project-background", Boolean(backgroundImage));
    btn.innerHTML = `
      <span class="project-card-visual" aria-hidden="true"></span>
      <span class="project-card-shade" aria-hidden="true"></span>
      <div class="project-card-layer">
        <div class="project-card-topline">
          <span class="folder" aria-hidden="true">▰</span>
          <div class="project-card-badges">
            <span class="project-date-chip">📅 ${escapeHtml(dateText)}</span>
            <span class="project-card-status ${closed ? "closed" : "active"}">${closed ? "Concluído" : "Ativo"}</span>
          </div>
        </div>
        <div class="project-card-content">
          <div class="project-card-copy">
            ${organization ? `<span class="project-organization-chip">${escapeHtml(organization)}</span>` : ""}
            <h3>${escapeHtml(project.name)}</h3>
            <p>${escapeHtml(legacy ? "Projeto legado • será vinculado ao abrir" : description)}</p>
          </div>
          <div class="project-team-preview project-team-preview--side" aria-label="PO e Coordenador do projeto">${poAvatar}${coordinatorAvatar}</div>
        </div>
      </div>`;
    if (backgroundImage) btn.querySelector(".project-card-visual").style.backgroundImage = `url(${JSON.stringify(backgroundImage)})`;
    btn.addEventListener("click", () => openProject(project));
    return btn;
  }

  function renderProjects(projects) {
    const filtered = projects
      .filter(project => (project.status || "ativo") === currentProjectFilter)
      .sort((a, b) => projectDateSortValue(b) - projectDateSortValue(a));
    el.projectGrid.innerHTML = "";
    el.projectsEmpty.classList.toggle("hidden", filtered.length > 0);
    filtered.forEach(project => el.projectGrid.appendChild(projectCardElement(project)));
  }

  async function openProfileProjects() {
    closeMenu();
    showView("profileProjectsView");
    el.profileProjectsStatus.innerHTML = "<span></span> Carregando todos os seus projetos...";
    el.profileProjectGrid.innerHTML = "";
    el.profileProjectsEmpty.classList.add("hidden");
    try {
      const projects = await supabaseRequest("rpc/fcc_list_my_projects", { method: "POST", body: {} });
      const all = (Array.isArray(projects) ? projects : []).sort((a, b) => projectDateSortValue(b) - projectDateSortValue(a));
      el.profileProjectsEmpty.classList.toggle("hidden", all.length > 0);
      all.forEach(project => el.profileProjectGrid.appendChild(projectCardElement(project)));
      el.profileProjectsStatus.innerHTML = `<span></span> ${all.length} ${all.length === 1 ? "projeto encontrado" : "projetos encontrados"}`;
    } catch (error) {
      el.profileProjectsStatus.textContent = `Supabase: ${error.message}`;
    }
  }

  function resetProjectModal() {
    el.newProjectName.value = "";
    el.newProjectDate.value = "";
    el.newProjectDescription.value = "";
    el.newProjectOrganization.value = "";
    organizationImageCandidates = [];
    selectedOrganizationImageIndex = -1;
    organizationSearchQuery = "";
    renderOrganizationPreview();
    el.projectModalValidation.textContent = "";
    el.directoryRowList.innerHTML = "";
    addDirectoryRow("", "manha"); addDirectoryRow("", "tarde");
  }

  function addDirectoryRow(name = "", period = "manha") {
    const row = document.createElement("div"); row.className = "directory-create-row";
    row.innerHTML = `<label><span>Nome do diretório</span><input class="dir-row-name" maxlength="100" placeholder="Ex.: Diretório ${el.directoryRowList.children.length + 1}" value="${escapeHtml(name)}"></label><label><span>Período</span><select class="dir-row-period"><option value="manha"${period === "manha" ? " selected" : ""}>Manhã</option><option value="tarde"${period === "tarde" ? " selected" : ""}>Tarde</option></select></label><button class="row-remove-btn" type="button" title="Remover">×</button>`;
    row.querySelector(".row-remove-btn").addEventListener("click", () => { if (el.directoryRowList.children.length <= 1) return showToast("Mantenha pelo menos um diretório."); row.remove(); });
    el.directoryRowList.appendChild(row);
  }

  async function createProjectWithDirectories() {
    const name = el.newProjectName.value.trim();
    const projectDate = el.newProjectDate.value;
    const cardDescription = el.newProjectDescription.value.trim();
    const organizationName = el.newProjectOrganization.value.trim();
    const rows = [...el.directoryRowList.querySelectorAll(".directory-create-row")].map(row => ({ name: row.querySelector(".dir-row-name").value.trim(), period: row.querySelector(".dir-row-period").value }));
    if (name.length < 2) return void (el.projectModalValidation.textContent = "Informe o nome do projeto.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(projectDate)) return void (el.projectModalValidation.textContent = "Informe a data de realização do projeto.");
    if (cardDescription.length < 2 || cardDescription.length > 180) return void (el.projectModalValidation.textContent = "Informe um texto do card entre 2 e 180 caracteres.");
    if (organizationName.length < 3 || organizationName.length > 180) return void (el.projectModalValidation.textContent = "Informe o órgão do concurso.");
    if (!rows.length || rows.some(row => !row.name)) return void (el.projectModalValidation.textContent = "Preencha o nome de todos os diretórios.");
    const normalizedNames = rows.map(row => row.name.toLocaleLowerCase("pt-BR"));
    if (new Set(normalizedNames).size !== normalizedNames.length) return void (el.projectModalValidation.textContent = "Use nomes diferentes nos diretórios.");
    el.projectModalValidation.textContent = "Preparando identidade visual...";
    try {
      if (organizationSearchQuery !== organizationName || selectedOrganizationImageIndex < 0) {
        await searchOrganizationVisual({ silent: true });
      }
      const selectedVisual = currentOrganizationImage();
      el.projectModalValidation.textContent = "Criando projeto...";
      // A criação é feita por uma RPC autenticada no Supabase. Além de evitar
      // o problema de INSERT/RETURNING com RLS, projeto + diretórios são criados
      // na mesma transação e o proprietário é sempre auth.uid() no servidor.
      const created = await supabaseRequest("rpc/fcc_create_project_with_directories", {
        method: "POST",
        body: {
          p_name: name,
          p_slug: slugify(name),
          p_project_date: projectDate,
          p_card_description: cardDescription,
          p_organization_name: organizationName,
          p_background_image_url: selectedVisual?.imageUrl || null,
          p_background_source_url: selectedVisual?.sourceUrl || null,
          p_directories: rows.map((row, index) => ({
            name: row.name,
            period: row.period,
            sort_order: index + 1
          }))
        }
      });
      const project = Array.isArray(created) ? created[0] : created;
      if (!project?.id) throw new Error("O Supabase não retornou o projeto criado.");
      project.status = project.status || "ativo";
      project.project_date = project.project_date || projectDate;
      project.card_description = project.card_description || cardDescription;
      project.organization_name = project.organization_name || organizationName;
      project.background_image_url = project.background_image_url || selectedVisual?.imageUrl || null;
      project.background_source_url = project.background_source_url || selectedVisual?.sourceUrl || null;
      currentProjectFilter = "ativo";
      closeModal(el.projectModal); showToast("Projeto criado."); await loadProjects(); await openProject(project);
      await openParticipantsModal(true);
    } catch (error) { el.projectModalValidation.textContent = `Erro: ${error.message}`; }
  }

  async function claimLegacyProject(project) {
    if (project.created_by) return project;
    const result = await supabaseRequest("rpc/fcc_claim_project", { method: "POST", body: { p_project_id: project.id } });
    if (result === false) throw new Error("Este projeto legado já foi vinculado a outra conta.");
    return { ...project, created_by: currentUser.id, status: project.status || "ativo" };
  }

  async function openProject(project) {
    try { project = await claimLegacyProject(project); }
    catch (error) { showToast(error.message); await loadProjects(); return; }
    currentProject = { ...project, status: project.status || "ativo" }; currentDirectory = null; projectMembersCache = []; updateMenuContext();
    el.projectTitle.textContent = currentProject.name; el.projectCrumb.textContent = currentProject.name; el.projectDescription.textContent = displayProjectDescription(currentProject.card_description); el.projectDateLabel.textContent = `📅 ${formatProjectDate(currentProject.project_date, currentProject.created_at)}`; showView("projectView");
    renderProjectState();
    await Promise.all([loadDirectories(), loadProjectMembers()]);
  }

  async function loadDirectories() {
    if (!currentProject) return;
    try {
      const params = new URLSearchParams({ select: "id,project_id,name,period,sort_order,created_at", project_id: `eq.${currentProject.id}`, order: "sort_order.asc,created_at.asc" });
      const dirs = await supabaseRequest(`fcc_directories?${params}`); renderDirectories(Array.isArray(dirs) ? dirs : []);
    } catch (error) { el.directoryGrid.innerHTML = `<div class="status-line">Erro ao carregar diretórios: ${escapeHtml(error.message)}</div>`; }
  }

  function renderDirectories(dirs) {
    el.directoryGrid.innerHTML = ""; el.directoriesEmpty.classList.toggle("hidden", dirs.length > 0);
    dirs.forEach(dir => {
      const btn = document.createElement("button"); btn.className = "directory-card"; btn.type = "button";
      btn.innerHTML = `<span class="folder">📁</span><h3>${escapeHtml(dir.name)}</h3><p>Abrir OCR, salas e checklist</p><span class="period-badge">${periodLabel(dir.period)}</span>`;
      btn.addEventListener("click", () => openDirectory(dir)); el.directoryGrid.appendChild(btn);
    });
  }

  async function createSingleDirectory() {
    const name = el.singleDirectoryName.value.trim(); const period = el.singleDirectoryPeriod.value;
    if (!currentProject) return;
    if (isCurrentProjectClosed()) return void (el.directoryModalValidation.textContent = "Este projeto está encerrado e não aceita novos diretórios.");
    if (!name) return void (el.directoryModalValidation.textContent = "Informe o nome do diretório.");
    try {
      await supabaseRequest("fcc_directories", { method: "POST", body: { project_id: currentProject.id, name, period, sort_order: 999 }, prefer: "return=representation" });
      closeModal(el.directoryModal); showToast("Diretório criado."); await loadDirectories();
    } catch (error) { el.directoryModalValidation.textContent = `Erro: ${error.message}`; }
  }

  async function openDirectory(dir, section = "rooms") {
    currentDirectory = dir; currentSection = section;
    el.directoryTitle.textContent = dir.name; el.directoryCrumb.textContent = dir.name; el.directoryProjectLabel.textContent = currentProject?.name || "—"; el.directoryPeriodBadge.textContent = periodLabel(dir.period);
    updateMenuContext(); showView("directoryView"); switchSection(section);
  }

  function switchSection(section) {
    currentSection = section; el.sectionTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.section === section));
    el.sections.forEach(node => node.classList.toggle("active", node.id === `${section}Section`));
    if (section === "rooms") loadRooms(); if (section === "checklist") loadChecklist();
  }

  // -------------------- PARTICIPANTES --------------------
  function roleCardHtml(role, member) {
    const label = ROLE_LABELS[role];
    if (!member) return `<article class="participant-role-card"><span class="role-label">${escapeHtml(label)}</span><div class="participant-empty">Não definido</div></article>`;
    const avatar = safeAvatarUrl(member.avatar_url); const name = member.full_name || member.email || "Profissional";
    const avatarHtml = avatar ? `<img src="${escapeHtml(avatar)}" alt="">` : `<span class="person-avatar-fallback">${escapeHtml(initials(name, member.email))}</span>`;
    return `<article class="participant-role-card"><span class="role-label">${escapeHtml(label)}</span><div class="participant-mini">${avatarHtml}<div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(member.email || "")}</small></div></div></article>`;
  }

  function isCurrentUserProjectPO() {
    if (!currentProject || !currentUser) return false;
    const assignedPo = projectMembersCache.find(member => member.role === "po");
    if (assignedPo) return assignedPo.user_id === currentUser.id;
    // Compatibilidade com projetos criados antes do hotfix V16.2.
    return currentProject.created_by === currentUser.id;
  }

  function canManageParticipants() { return isCurrentUserProjectPO(); }

  function isProjectOwner() { return Boolean(currentProject && currentUser && currentProject.created_by === currentUser.id); }
  function isCurrentProjectClosed() { return currentProject?.status === "encerrado"; }
  function renderProjectState() {
    if (!currentProject) return;
    const closed = isCurrentProjectClosed(); const canManage = canManageParticipants(); const owner = isProjectOwner();
    el.projectStatusBadge.textContent = closed ? "Encerrado" : "Ativo";
    el.projectStatusBadge.className = `project-status-badge ${closed ? "closed" : "active"}`;
    el.editProjectBtn?.classList.toggle("hidden", closed || !canManage);
    el.addDirectoryBtn.disabled = closed || !canManage;
    el.addDirectoryBtn.classList.toggle("hidden", closed || !canManage);
    el.closeProjectBtn.classList.toggle("hidden", closed || !canManage);
    el.deleteProjectBtn.classList.toggle("hidden", !owner && !canManage);
    el.manageParticipantsBtn.classList.toggle("hidden", closed || !canManage);
    [$("takePhotoBtn"), $("roomsCaptureBtn"), $("saveChecklistBtn")].forEach(btn => { if (btn) btn.disabled = closed; });
    [el.check1, el.check2, el.check3, el.check4, el.checkComments].forEach(field => { if (field) field.disabled = closed; });
    el.projectView.classList.toggle("project-is-closed", closed);
    el.directoryView.classList.toggle("project-is-closed", closed);
  }

  function openEditProjectModal() {
    if (!currentProject) return;
    if (!isCurrentUserProjectPO()) return showToast("Somente o PO pode editar o projeto.");
    if (isCurrentProjectClosed()) return showToast("Projetos encerrados não podem ser editados.");

    el.editProjectName.value = currentProject.name || "";
    el.editProjectDate.value = String(currentProject.project_date || "").slice(0, 10);
    el.editProjectDescription.value = editableProjectDescription(currentProject.card_description);
    el.editProjectOrganization.value = currentProject.organization_name || "";
    el.editProjectValidation.textContent = "";
    editOrganizationSearchQuery = el.editProjectOrganization.value.trim();
    editOrganizationImageCandidates = [];
    editSelectedOrganizationImageIndex = -1;

    const currentImage = safeImageUrl(currentProject.background_image_url);
    if (currentImage) {
      editOrganizationImageCandidates = [{
        imageUrl: currentImage,
        sourceUrl: safeImageUrl(currentProject.background_source_url),
        title: currentProject.organization_name || "Imagem atual",
        provider: "Imagem atual"
      }];
      editSelectedOrganizationImageIndex = 0;
    }
    renderEditOrganizationPreview(currentImage ? "" : "O projeto ainda não possui uma imagem de fundo.");
    openModal(el.editProjectModal);
  }

  async function saveProjectEdits() {
    if (!currentProject) return;
    if (!isCurrentUserProjectPO()) return void (el.editProjectValidation.textContent = "Somente o PO pode editar o projeto.");
    if (isCurrentProjectClosed()) return void (el.editProjectValidation.textContent = "Projetos encerrados não podem ser editados.");

    const name = el.editProjectName.value.trim();
    const projectDate = el.editProjectDate.value;
    const cardDescription = el.editProjectDescription.value.trim();
    const organizationName = el.editProjectOrganization.value.trim();
    if (name.length < 2 || name.length > 120) return void (el.editProjectValidation.textContent = "Informe um nome entre 2 e 120 caracteres.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(projectDate)) return void (el.editProjectValidation.textContent = "Informe a data de realização.");
    if (cardDescription.length < 2 || cardDescription.length > 180) return void (el.editProjectValidation.textContent = "Informe um texto do card entre 2 e 180 caracteres.");
    if (organizationName.length < 3 || organizationName.length > 180) return void (el.editProjectValidation.textContent = "Informe o órgão do concurso.");

    el.editProjectValidation.textContent = "Salvando alterações...";
    try {
      // Se o órgão mudou e nenhuma imagem foi escolhida, tentamos localizar uma nova.
      if (editOrganizationSearchQuery !== organizationName && editSelectedOrganizationImageIndex < 0) {
        await searchEditOrganizationVisual({ silent: true });
      }
      const selectedVisual = currentEditOrganizationImage();
      const data = await supabaseRequest("rpc/fcc_update_project", {
        method: "POST",
        body: {
          p_project_id: currentProject.id,
          p_name: name,
          p_project_date: projectDate,
          p_card_description: cardDescription,
          p_organization_name: organizationName,
          p_background_image_url: selectedVisual?.imageUrl || null,
          p_background_source_url: selectedVisual?.sourceUrl || null
        }
      });
      const updated = Array.isArray(data) ? data[0] : data;
      if (!updated?.id) throw new Error("O Supabase não retornou o projeto atualizado.");
      currentProject = { ...currentProject, ...updated };
      el.projectTitle.textContent = currentProject.name;
      el.projectCrumb.textContent = currentProject.name;
      el.projectDescription.textContent = displayProjectDescription(currentProject.card_description);
      el.projectDateLabel.textContent = `📅 ${formatProjectDate(currentProject.project_date, currentProject.created_at)}`;
      closeModal(el.editProjectModal);
      showToast("Projeto atualizado.");
      await loadProjects();
    } catch (error) {
      el.editProjectValidation.textContent = `Erro: ${error.message}`;
    }
  }

  function openProjectAction(mode) {
    if (!currentProject) return;
    projectActionMode = mode; el.projectActionValidation.textContent = ""; el.deleteProjectConfirmInput.value = "";
    const deleting = mode === "delete";
    el.projectActionChip.textContent = deleting ? "EXCLUIR PROJETO" : "ENCERRAR PROJETO";
    el.projectActionTitle.textContent = deleting ? `Excluir ${currentProject.name}?` : `Encerrar ${currentProject.name}?`;
    el.projectActionText.textContent = deleting
      ? "Esta ação exclui definitivamente o projeto, diretórios, salas, cartões, checklist e participantes. Não poderá ser desfeita."
      : "O projeto ficará disponível para consulta, mas novos diretórios, cartões, alterações de equipe e checklist ficarão bloqueados.";
    el.deleteProjectConfirmField.classList.toggle("hidden", !deleting);
    el.projectActionConfirm.textContent = deleting ? "⌫ Excluir definitivamente" : "⏹ Encerrar projeto";
    el.projectActionConfirm.classList.toggle("btn-danger", deleting);
    el.projectActionConfirm.classList.toggle("btn-warning", !deleting);
    openModal(el.projectActionModal);
  }

  async function confirmProjectAction() {
    if (!currentProject || !projectActionMode) return;
    el.projectActionValidation.textContent = "";
    try {
      if (projectActionMode === "delete") {
        if (!isProjectOwner()) throw new Error("Somente o criador pode excluir definitivamente o projeto.");
        if (el.deleteProjectConfirmInput.value.trim() !== currentProject.name) {
          el.projectActionValidation.textContent = "Digite exatamente o nome do projeto para confirmar a exclusão."; return;
        }
        el.projectActionValidation.textContent = "Excluindo projeto...";
        await supabaseRequest("rpc/fcc_delete_project", { method: "POST", body: { p_project_id: currentProject.id } });
        closeModal(el.projectActionModal); showToast("Projeto excluído."); currentProject = null; currentDirectory = null; projectMembersCache = []; updateMenuContext(); await goProjects(currentProjectFilter);
      } else {
        if (!canManageParticipants()) throw new Error("Somente o criador ou o PO pode encerrar o projeto.");
        el.projectActionValidation.textContent = "Encerrando projeto...";
        const data = await supabaseRequest("rpc/fcc_close_project", { method: "POST", body: { p_project_id: currentProject.id } });
        const updated = Array.isArray(data) ? data[0] : data; currentProject = { ...currentProject, ...(updated || {}), status: "encerrado" };
        currentProjectFilter = "encerrado";
        closeModal(el.projectActionModal); showToast("Projeto encerrado."); renderProjectState(); await loadProjects();
      }
    } catch (error) { el.projectActionValidation.textContent = `Erro: ${error.message}`; }
  }

  async function loadProjectMembers() {
    if (!currentProject) return;
    try {
      const data = await supabaseRequest("rpc/fcc_get_project_members", { method: "POST", body: { p_project_id: currentProject.id } });
      projectMembersCache = Array.isArray(data) ? data : [];
      el.projectParticipantsGrid.innerHTML = ROLE_ORDER.map(role => roleCardHtml(role, projectMembersCache.find(m => m.role === role))).join("");
      renderProjectState();
    } catch (error) {
      projectMembersCache = []; el.projectParticipantsGrid.innerHTML = `<div class="status-line">Não foi possível carregar participantes: ${escapeHtml(error.message)}</div>`; renderProjectState();
    }
  }

  function participantFromCurrentUser() {
    return { user_id: currentUser.id, full_name: displayNameFromUser(currentUser), email: currentUser.email || "", avatar_url: avatarFromUser(currentUser) };
  }

  function resetParticipantPicker() {
    selectedParticipants = Object.fromEntries(ROLE_ORDER.map(role => [role, null])); originalRoleUsers = {};
    el.participantsValidation.textContent = "";
    el.participantInputs.forEach(input => { input.value = ""; input.dataset.userId = ""; });
    qa(".person-results").forEach(node => { node.classList.remove("open"); node.innerHTML = ""; });
    qa(".selected-person").forEach(node => { node.classList.add("hidden"); node.innerHTML = ""; });
  }

  function renderSelectedPerson(role, person) {
    selectedParticipants[role] = person;
    const box = document.querySelector(`[data-selected="${role}"]`); const input = document.querySelector(`.participant-search-input[data-role="${role}"]`);
    if (!box || !input) return;
    if (!person) { box.classList.add("hidden"); box.innerHTML = ""; input.dataset.userId = ""; return; }
    const avatar = safeAvatarUrl(person.avatar_url); const name = person.full_name || person.email || "Profissional";
    const avatarHtml = avatar ? `<img src="${escapeHtml(avatar)}" alt="">` : `<span class="person-avatar-fallback">${escapeHtml(initials(name, person.email))}</span>`;
    box.innerHTML = `<div class="participant-mini">${avatarHtml}<div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(person.email || "")}</small></div></div><button class="clear-selected-person" type="button" aria-label="Remover seleção">×</button>`;
    box.classList.remove("hidden"); input.value = name; input.dataset.userId = person.user_id || person.id || "";
    box.querySelector(".clear-selected-person").addEventListener("click", () => { input.value = ""; renderSelectedPerson(role, null); });
  }

  async function openParticipantsModal(prefillCreator = false) {
    if (!currentProject) return;
    if (isCurrentProjectClosed()) return showToast("Projeto encerrado: participantes disponíveis somente para consulta.");
    resetParticipantPicker();
    if (!prefillCreator && !projectMembersCache.length) await loadProjectMembers();
    projectMembersCache.forEach(member => { originalRoleUsers[member.role] = member.user_id; renderSelectedPerson(member.role, member); });
    if (prefillCreator && !selectedParticipants.po) renderSelectedPerson("po", participantFromCurrentUser());
    openModal(el.participantsModal);
  }

  async function searchProfiles(term) {
    return supabaseRequest("rpc/fcc_search_profiles", { method: "POST", body: { search_term: term } });
  }

  function renderSearchResults(role, people) {
    const box = document.querySelector(`[data-results="${role}"]`); if (!box) return;
    box.innerHTML = "";
    if (!people.length) { box.innerHTML = `<div class="participant-empty" style="padding:9px">Nenhum profissional encontrado.</div>`; box.classList.add("open"); return; }
    people.forEach(person => {
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "person-result-btn";
      const avatar = safeAvatarUrl(person.avatar_url); const name = person.full_name || person.email || "Profissional";
      btn.innerHTML = `${avatar ? `<img src="${escapeHtml(avatar)}" alt="">` : `<span class="person-avatar-fallback">${escapeHtml(initials(name, person.email))}</span>`}<span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(person.email || "")}</small></span>`;
      btn.addEventListener("click", () => { renderSelectedPerson(role, person); box.classList.remove("open"); box.innerHTML = ""; });
      box.appendChild(btn);
    });
    box.classList.add("open");
  }

  async function handleParticipantSearch(input) {
    const role = input.dataset.role; const term = input.value.trim(); const results = document.querySelector(`[data-results="${role}"]`);
    if (input.dataset.userId && selectedParticipants[role]) { input.dataset.userId = ""; selectedParticipants[role] = null; document.querySelector(`[data-selected="${role}"]`)?.classList.add("hidden"); }
    clearTimeout(searchTimers[role]);
    if (term.length < 2) { results?.classList.remove("open"); return; }
    searchTimers[role] = setTimeout(async () => {
      try { const people = await searchProfiles(term); renderSearchResults(role, Array.isArray(people) ? people : []); }
      catch (error) { if (results) { results.innerHTML = `<div class="participant-empty" style="padding:9px">Erro: ${escapeHtml(error.message)}</div>`; results.classList.add("open"); } }
    }, 280);
  }

  async function saveParticipants() {
    if (!currentProject) return;
    if (isCurrentProjectClosed()) return void (el.participantsValidation.textContent = "Projeto encerrado: não é possível alterar participantes.");
    const chosen = ROLE_ORDER.filter(role => selectedParticipants[role]?.user_id || selectedParticipants[role]?.id);
    if (!chosen.length) return void (el.participantsValidation.textContent = "Selecione pelo menos um participante ou use ‘Agora não’." );
    el.participantsValidation.textContent = "Salvando participantes...";
    try {
      // O PO é salvo por último. Assim, caso o cargo seja transferido para
      // outra pessoa, o PO atual ainda consegue concluir os demais cargos
      // antes de perder a permissão administrativa.
      const rolesToSave = [...ROLE_ORDER.filter(role => role !== "po"), "po"];
      for (const role of rolesToSave) {
        const person = selectedParticipants[role]; const userId = person?.user_id || person?.id || null;
        if (userId) await supabaseRequest("rpc/fcc_set_project_member", { method: "POST", body: { p_project_id: currentProject.id, p_user_id: userId, p_role: role } });
        else if (originalRoleUsers[role]) await supabaseRequest("rpc/fcc_clear_project_role", { method: "POST", body: { p_project_id: currentProject.id, p_role: role } });
      }
      closeModal(el.participantsModal); showToast("Participantes atualizados."); await loadProjectMembers(); await loadProjects();
    } catch (error) { el.participantsValidation.textContent = `Erro: ${error.message}`; }
  }

  // -------------------- MENU --------------------
  function updateMenuContext() { renderProfileBio(); }
  function openMenu() { el.menuDrawer.classList.add("open"); el.menuDrawer.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); }
  function closeMenu() { el.menuDrawer.classList.remove("open"); el.menuDrawer.setAttribute("aria-hidden", "true"); if (!qa(".modal.open").length && !el.navDrawer.classList.contains("open")) document.body.classList.remove("modal-open"); }
  function openNav() { if (!currentUser) return; el.navDrawer.classList.add("open"); el.navDrawer.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); }
  function closeNav() { el.navDrawer.classList.remove("open"); el.navDrawer.setAttribute("aria-hidden", "true"); if (!qa(".modal.open").length && !el.menuDrawer.classList.contains("open")) document.body.classList.remove("modal-open"); }

  // -------------------- TEMPO / RESULTADO --------------------
  function parseClock(value) { const m = String(value || "").match(/^(\d{2}):(\d{2})$/); if (!m) return null; const h = +m[1], min = +m[2]; return h <= 23 && min <= 59 ? h * 60 + min : null; }
  function formatClock(total) { const n = ((total % 1440) + 1440) % 1440; return `${String(Math.floor(n / 60)).padStart(2,"0")}:${String(n % 60).padStart(2,"0")}`; }
  function formatDurationClock(total) { return `${String(Math.floor(total / 60)).padStart(2,"0")}:${String(total % 60).padStart(2,"0")}`; }
  function getPairMinutes(hInput, mInput, allowZero = true) {
    const h = Number(String(hInput.value).replace(/\D/g, "")); const m = Number(String(mInput.value).replace(/\D/g, ""));
    if (!Number.isInteger(h) || !Number.isInteger(m) || m > 59) return null; const total = h * 60 + m; if (total > 720 || (!allowZero && total < 1)) return null; return total;
  }
  function calculateResult(start, duration, minimum) {
    const startMin = parseClock(start); if (startMin === null || duration < 1) return null;
    return { start, duration, minimum, end: formatClock(startMin + duration), endNextDay: startMin + duration >= 1440, minimumExit: formatClock(startMin + minimum), minimumNextDay: startMin + minimum >= 1440 };
  }
  function showResult(result, saved = null, reportedEnd = "") {
    el.resultEnd.textContent = result.end; el.resultStart.textContent = result.start; el.resultDuration.textContent = formatDurationClock(result.duration); el.resultMinimum.textContent = formatDurationClock(result.minimum); el.resultMinimumExit.textContent = result.minimumExit;
    const normalizedReportedEnd = normalizeAiClock(reportedEnd);
    const hasReportedEnd = Boolean(normalizedReportedEnd);
    const endMatches = hasReportedEnd && normalizedReportedEnd === result.end;
    el.resultReportedEndBox.classList.toggle("hidden", !hasReportedEnd);
    el.resultReportedEndBox.classList.toggle("match", endMatches);
    el.resultReportedEndBox.classList.toggle("mismatch", hasReportedEnd && !endMatches);
    if (hasReportedEnd) {
      el.resultReportedEnd.textContent = normalizedReportedEnd;
      el.resultEndValidationText.textContent = endMatches ? "O término informado confere com o cálculo." : `Divergência identificada. O horário correto calculado é ${result.end}.`;
    }
    el.savedMeta.classList.toggle("hidden", !saved);
    if (saved) {
      el.savedRoom.textContent = `Sala ${saved.room}`;
      el.savedModules.textContent = saved.cardType === "time_poster" ? "Registro: Cartaz de horário" : `Módulo(s): ${saved.modules}`;
    }
    openModal(el.resultModal);
  }
  function resetForm(start, dh, dm, mh, mm, validation) { start.value = "00:00"; dh.value = "00"; dm.value = "00"; mh.value = "00"; mm.value = "00"; validation.textContent = ""; }
  function resetManual() { resetForm(el.manualStart, el.manualDurationHours, el.manualDurationMinutes, el.manualMinimumHours, el.manualMinimumMinutes, el.manualValidation); }
  function resetQuickManual() { resetForm(el.quickStart, el.quickDurationHours, el.quickDurationMinutes, el.quickMinimumHours, el.quickMinimumMinutes, el.quickValidation); }
  function calculateFromForm({ start, dh, dm, mh, mm, validation }) {
    const duration = getPairMinutes(dh, dm, false); const minimum = getPairMinutes(mh, mm, true);
    if (duration === null) { validation.textContent = "Informe uma duração maior que 00:00."; return; }
    if (minimum === null) { validation.textContent = "Permanência mínima inválida."; return; }
    const result = calculateResult(start.value, duration, minimum); if (!result) { validation.textContent = "Confira o horário de início."; return; }
    validation.textContent = ""; showResult(result, null);
  }
  function manualSubmit(event) { event.preventDefault(); calculateFromForm({ start: el.manualStart, dh: el.manualDurationHours, dm: el.manualDurationMinutes, mh: el.manualMinimumHours, mm: el.manualMinimumMinutes, validation: el.manualValidation }); }
  function quickManualSubmit(event) { event.preventDefault(); calculateFromForm({ start: el.quickStart, dh: el.quickDurationHours, dm: el.quickDurationMinutes, mh: el.quickMinimumHours, mm: el.quickMinimumMinutes, validation: el.quickValidation }); }

  // -------------------- SALAS --------------------
  async function ensureRoom(roomCode) {
    const params = new URLSearchParams({ on_conflict: "directory_id,room_code" });
    const result = await supabaseRequest(`fcc_directory_rooms?${params}`, { method: "POST", body: { directory_id: currentDirectory.id, room_code: roomCode }, prefer: "resolution=merge-duplicates,return=representation" });
    const room = Array.isArray(result) ? result[0] : result; if (!room?.id) throw new Error("Sala não foi retornada pelo Supabase."); return room;
  }
  async function saveExamCard(room, data, result) {
    const params = new URLSearchParams({ on_conflict: "room_id,modules,start_time" });
    const reportedEnd = normalizeAiClock(data.reportedEnd);
    const moduleStorageValue = data.cardType === "time_poster"
      ? `Cartaz de horário • ${formatDurationClock(data.duration)} • ${reportedEnd || result.end}`
      : data.modules;
    const payload = {
      room_id: room.id,
      modules: moduleStorageValue,
      start_time: data.start,
      duration_minutes: data.duration,
      end_time: result.end,
      end_next_day: result.endNextDay,
      minimum_stay_minutes: data.minimum,
      minimum_exit_time: result.minimumExit,
      minimum_exit_next_day: result.minimumNextDay,
      source: "ocr_space",
      card_type: data.cardType,
      reported_end_time: reportedEnd || null,
      end_matches_calculation: reportedEnd ? reportedEnd === result.end : null
    };
    return supabaseRequest(`fcc_directory_exam_cards?${params}`, { method: "POST", body: payload, prefer: "resolution=merge-duplicates,return=representation" });
  }
  async function loadRooms() {
    if (!currentDirectory) return; el.roomsStatus.textContent = "Sincronizando salas...";
    try {
      const rp = new URLSearchParams({ select: "id,directory_id,room_code,created_at", directory_id: `eq.${currentDirectory.id}`, order: "room_code.asc" });
      const rooms = await supabaseRequest(`fcc_directory_rooms?${rp}`); const list = Array.isArray(rooms) ? rooms : [];
      for (const room of list) { const cp = new URLSearchParams({ select: "*", room_id: `eq.${room.id}`, order: "captured_at.asc" }); room.cards = await supabaseRequest(`fcc_directory_exam_cards?${cp}`) || []; }
      roomsCache = list; renderRooms(); el.roomsStatus.textContent = `Atualizado agora • ${currentDirectory.name}`;
    } catch (error) { el.roomsStatus.textContent = `Erro: ${error.message}`; }
  }
  function renderRooms() {
    el.roomsGrid.innerHTML = ""; el.roomsEmpty.classList.toggle("hidden", roomsCache.length > 0); el.roomsRoot.classList.remove("hidden"); el.roomDetail.classList.add("hidden");
    roomsCache.forEach(room => {
      const btn = document.createElement("button"); btn.className = "room-folder"; btn.type = "button"; btn.innerHTML = `<span class="folder">📁</span><h3>Sala ${escapeHtml(room.room_code)}</h3><p>${room.cards.length} ${room.cards.length === 1 ? "registro" : "registros"}</p>`;
      btn.addEventListener("click", () => openRoom(room.id)); el.roomsGrid.appendChild(btn);
    });
  }
  function openRoom(roomId) {
    const room = roomsCache.find(r => r.id === roomId); if (!room) return;
    el.roomsRoot.classList.add("hidden"); el.roomDetail.classList.remove("hidden"); el.roomCrumb.textContent = `Sala ${room.room_code}`; el.roomTitle.textContent = room.room_code; el.roomMeta.textContent = `${room.cards.length} ${room.cards.length === 1 ? "registro" : "registros"}`; el.roomRecords.innerHTML = "";
    room.cards.forEach(card => {
      const div = document.createElement("article");
      const isTimePoster = card.card_type === "time_poster";
      const reportedEnd = card.reported_end_time ? String(card.reported_end_time).slice(0,5) : "";
      const endMatches = card.end_matches_calculation !== false;
      div.className = `record-card${isTimePoster ? " time-poster-record" : ""}${reportedEnd && !endMatches ? " has-end-warning" : ""}`;
      const recordHeading = isTimePoster ? "CARTAZ DE HORÁRIO" : "MÓDULO(S)";
      const recordTitle = isTimePoster ? "Tempo e permanência da prova" : escapeHtml(card.modules);
      const reportedMarkup = reportedEnd
        ? `<div class="record-reported-end ${endMatches ? "match" : "mismatch"}"><span>Término informado</span><strong>${reportedEnd}</strong><small>${endMatches ? "Confere com o cálculo" : `Diverge — calculado ${String(card.end_time).slice(0,5)}`}</small></div>`
        : "";
      div.innerHTML = `<div class="record-top"><span>${recordHeading}</span><span>${new Date(card.captured_at).toLocaleString("pt-BR")}</span></div><h4>${recordTitle}</h4><div class="record-times"><div><span>Início</span><strong>${String(card.start_time).slice(0,5)}</strong></div><div><span>Tempo de prova</span><strong>${formatDurationClock(card.duration_minutes)}</strong></div><div><span>Término calculado</span><strong>${String(card.end_time).slice(0,5)}</strong></div><div><span>Liberação mínima</span><strong>${String(card.minimum_exit_time).slice(0,5)}</strong></div></div>${reportedMarkup}<div class="record-min">⏱ Permanência mínima: <strong>${formatDurationClock(card.minimum_stay_minutes)}</strong></div>`;
      el.roomRecords.appendChild(div);
    });
  }

  // -------------------- CHECKLIST --------------------
  async function loadChecklist() {
    if (!currentDirectory) return; el.checklistStatus.textContent = "Carregando checklist...";
    try {
      const params = new URLSearchParams({ select: "*", directory_id: `eq.${currentDirectory.id}`, limit: "1" });
      const data = await supabaseRequest(`fcc_directory_checklists?${params}`); const row = Array.isArray(data) ? data[0] : null;
      el.check1.checked = Boolean(row?.item1); el.check2.checked = Boolean(row?.item2); el.check3.checked = Boolean(row?.item3); el.check4.checked = Boolean(row?.item4); el.checkComments.value = row?.comments || "";
      el.checklistStatus.textContent = row ? "Checklist sincronizado" : "Checklist ainda não salvo";
    } catch (error) { el.checklistStatus.textContent = `Erro: ${error.message}`; }
  }
  async function saveChecklist() {
    if (isCurrentProjectClosed()) return void (el.checklistStatus.textContent = "Projeto encerrado • checklist somente para consulta");
    if (!currentDirectory) return; el.checklistStatus.textContent = "Salvando...";
    try {
      const params = new URLSearchParams({ on_conflict: "directory_id" });
      await supabaseRequest(`fcc_directory_checklists?${params}`, { method: "POST", body: { directory_id: currentDirectory.id, item1: el.check1.checked, item2: el.check2.checked, item3: el.check3.checked, item4: el.check4.checked, comments: el.checkComments.value.trim() }, prefer: "resolution=merge-duplicates,return=representation" });
      el.checklistStatus.textContent = "Salvo agora"; showToast("Checklist salvo.");
    } catch (error) { el.checklistStatus.textContent = `Erro: ${error.message}`; }
  }

  // -------------------- OCR --------------------
  function getOcrConfig() {
    const cfg = window.FCC_CONFIG || {}; const key = String(cfg.OCRSPACE_API_KEY || "").trim();
    return { key, endpoint: String(cfg.OCRSPACE_ENDPOINT || "https://api.ocr.space/parse/image").trim(), engine: String(cfg.OCRSPACE_ENGINE || "3").trim(), configured: Boolean(key && !key.includes("COLE_AQUI")) };
  }
  function requestPhoto(mode = "directory") {
    ocrMode = mode;
    if (mode === "directory" && !currentDirectory) return showToast("Abra um diretório primeiro.");
    if (mode === "directory" && isCurrentProjectClosed()) return showToast("Projeto encerrado: novos cartões estão bloqueados.");
    const input = mode === "quick" ? el.quickPhotoInput : el.photoInput; input.value = ""; input.click();
  }
  function setOcrState(state) { el.ocrLoading.classList.toggle("hidden", state !== "loading"); el.ocrConfirm.classList.toggle("hidden", state !== "confirm"); el.ocrError.classList.toggle("hidden", state !== "error"); }
  async function loadImageSource(file) {
    if (window.createImageBitmap) { try { const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); return { image: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close?.() }; } catch {} }
    return new Promise((resolve, reject) => { const img = new Image(); const url = URL.createObjectURL(file); img.onload = () => resolve({ image: img, width: img.naturalWidth, height: img.naturalHeight, cleanup: () => URL.revokeObjectURL(url) }); img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não foi possível abrir a imagem.")); }; img.src = url; });
  }
  function canvasBlob(canvas, quality) { return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality)); }
  function blobDataUrl(blob) { return new Promise((resolve,reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(new Error("Falha ao criar prévia.")); r.readAsDataURL(blob); }); }
  async function prepareImage(file) {
    if (!file || !file.type.startsWith("image/")) throw new Error("Capture uma imagem válida."); if (file.size > OCR_MAX_SOURCE_BYTES) throw new Error("Imagem muito grande.");
    const source = await loadImageSource(file);
    try {
      for (const maxDim of OCR_DIMENSION_STEPS) {
        const scale = Math.min(1, maxDim / Math.max(source.width, source.height)); const w = Math.max(1, Math.round(source.width * scale)), h = Math.max(1, Math.round(source.height * scale));
        const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h; const ctx = canvas.getContext("2d", { alpha:false }); ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h); ctx.drawImage(source.image,0,0,w,h);
        for (const q of OCR_QUALITY_STEPS) { const blob = await canvasBlob(canvas,q); if (blob && blob.size <= OCR_MAX_UPLOAD_BYTES) return { blob, preview: await blobDataUrl(blob) }; }
      }
      throw new Error("Não foi possível compactar a foto para o OCR.Space.");
    } finally { source.cleanup(); }
  }
  async function callOcr(blob, isTable = true) {
    const cfg = getOcrConfig(); if (!cfg.configured) throw new Error("Configure OCRSPACE_API_KEY no config.js.");
    const form = new FormData(); form.append("file", blob, "cartao.jpg"); form.append("OCREngine", cfg.engine); form.append("language", "auto"); form.append("detectOrientation", "true"); form.append("scale", "true"); form.append("isTable", String(Boolean(isTable)));
    const res = await fetch(cfg.endpoint, { method:"POST", headers:{apikey:cfg.key}, body:form }); const payload = await res.json().catch(() => null); if (!res.ok) throw new Error(`OCR.Space HTTP ${res.status}`);
    if (payload?.IsErroredOnProcessing) throw new Error((payload.ErrorMessage || payload.ErrorDetails || ["OCR.Space retornou erro"]).flat?.().join?.(" ") || "OCR.Space retornou erro."); const text = payload?.ParsedResults?.[0]?.ParsedText; if (!text) throw new Error("Nenhum texto foi reconhecido."); return text;
  }
  function cleanOcrLine(v){return String(v||"").replace(/[|_*#`]/g," ").replace(/[–—]/g,"-").replace(/\s+/g," ").trim()}
  function normalizeOcrDigits(v){return String(v||"").replace(/[OoQ]/g,"0").replace(/[Il|!]/g,"1").replace(/[Ss](?=\d)/g,"5")}
  function normalizeAiClock(v){
    let t=normalizeOcrDigits(String(v||"")).trim().toLowerCase().replace(/\s/g,"").replace(/[h\.;,]/g,":").replace(/_+/g,"");
    let m=t.match(/^(\d{1,2}):(\d{1,2})$/);
    if(!m){const digits=t.replace(/\D/g,"");if(digits.length===3)m=[digits,digits.slice(0,1),digits.slice(1)];else if(digits.length===4)m=[digits,digits.slice(0,2),digits.slice(2)];}
    if(!m)return"";const h=+m[1],mi=+m[2];return h<=23&&mi<=59?`${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`:"";
  }
  function durationStringToMinutes(v){
    let t=normalizeOcrDigits(String(v||"")).trim().toLowerCase().replace(/\s+/g," ");if(!t)return null;
    const clock=t.replace(/\s/g,"").match(/^(\d{1,2})[:\.](\d{1,2})$/);if(clock){const total=+clock[1]*60 + +clock[2];return +clock[2]<=59&&total>=0&&total<=720?total:null}
    const hour=t.match(/(\d{1,2})\s*(?:h|hora|horas)\s*(?:(?:e\s*)?(\d{1,2})\s*(?:m|min|minuto|minutos))?/i);if(hour){const mins=+(hour[2]||0),total=+hour[1]*60+mins;return mins<=59&&total>=0&&total<=720?total:null}
    const compact=t.replace(/\s/g,"").match(/^(\d{1,2})h(?:(\d{1,2})(?:m|min)?)?$/);if(compact){const mins=+(compact[2]||0),total=+compact[1]*60+mins;return mins<=59&&total>=0&&total<=720?total:null}
    const minutes=t.match(/^(\d{1,3})\s*(?:m|min|minuto|minutos)$/);if(minutes){const total=+minutes[1];return total>=0&&total<=720?total:null}
    return null;
  }
  function findTimeToken(text,{duration=false}={}){
    const src=normalizeOcrDigits(String(text||""));
    if(duration){
      const candidates=[
        src.match(/(\d{1,2})\s*h\s*(\d{1,2})(?!\d)/i),
        src.match(/(\d{1,2})\s*(?:horas?|h)\s*(?:(?:e\s*)?(\d{1,2})\s*(?:min(?:utos?)?|m))?/i),
        src.match(/(\d{1,3})\s*(?:min(?:utos?)?|m)\b/i),
        src.match(/(?:^|[^A-Za-zÀ-ÿ0-9])(\d{1,2})\s*(?::|\.|;)\s*(\d{1,2})(?![A-Za-zÀ-ÿ0-9])/)
      ];
      for(const m of candidates){if(!m)continue;let total;if(/min/i.test(m[0])&&!/(?:hora|h)/i.test(m[0])&&m.length<3)total=+m[1];else if(/(?:hora|h)/i.test(m[0]))total=+m[1]*60+(+m[2]||0);else total=+m[1]*60+(+m[2]||0);if(total>=0&&total<=720&&(m[2]===undefined||(+m[2]||0)<=59))return formatDurationClock(total)}
      return"";
    }
    const pattern=/(?:^|[^A-Za-zÀ-ÿ0-9])([0-9]{1,2})\s*(?::|h|H|\.|;)\s*([0-9]{1,2})(?![A-Za-zÀ-ÿ0-9])/g;let m;
    while((m=pattern.exec(src))){const h=+m[1],mi=+m[2];if(h<=23&&mi<=59)return`${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`}
    return"";
  }
  function isDifferentFieldLabel(line,expected){const s=stripDiacritics(line).toLowerCase();const known=/tempo\s+de\s+prova|duracao|inicio|termino|fim|encerramento|permanencia|minima|sala|modulo/.test(s);return known&&!expected.test(s)}
  function findValueNearLabel(lines,label,{duration=false,lookAhead=2}={}){for(let i=0;i<lines.length;i++){const s=stripDiacritics(lines[i]).toLowerCase();const labelMatch=s.match(label);if(!labelMatch)continue;const anchoredSlice=lines[i].slice(labelMatch.index||0);const d=findTimeToken(anchoredSlice,{duration});if(d)return{value:d,anchored:true};for(let o=1;o<=lookAhead&&i+o<lines.length;o++){if(isDifferentFieldLabel(lines[i+o],label))break;const v=findTimeToken(lines[i+o],{duration});if(v)return{value:v,anchored:true}}}return{value:"",anchored:false}}
  function findTextAfterLabel(lines,label,kind){for(let i=0;i<lines.length;i++){if(!label.test(stripDiacritics(lines[i]).toLowerCase()))continue;for(let o=0;o<=1&&i+o<lines.length;o++){let c=cleanOcrLine(lines[i+o]);if(o===0){const pos=c.indexOf(":");c=pos>=0?c.slice(pos+1).trim():c.replace(/m[oó]dulo(?:\(s\))?s?/i,"").replace(/sala/i,"").replace(/^\s*[-–—:]\s*/,"").trim()}if(!c)continue;if(kind==="room"){c=c.replace(/\b(?:manha|tarde|noite|m[oó]dulo|tempo\s+de\s+prova|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i,"").trim();const m=normalizeOcrDigits(c).match(/\b([A-Za-z0-9][A-Za-z0-9._-]{0,19})\b/);if(m)return{value:normalizeRoomCode(m[1]),anchored:true}}else{c=c.replace(/\b(?:sala|tempo\s+de\s+prova|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i,"").trim();const nums=normalizeOcrDigits(c).match(/\b\d{3,}\b/g);if(nums?.length)return{value:normalizeModulesText([...new Set(nums)].join(", ")),anchored:true}}}}return{value:"",anchored:false}}
  function parseOcr(raw){
    const lines=String(raw||"").split(/\r?\n/).map(cleanOcrLine).filter(Boolean);
    const normalizedText=stripDiacritics(lines.join(" ")).toLowerCase();
    const dur=findValueNearLabel(lines,/tempo\s+de\s+prova|duracao(?:\s+da)?\s+prova|duracao/,{duration:true,lookAhead:2});
    const start=findValueNearLabel(lines,/\binicio\b/,{duration:false,lookAhead:2});
    const end=findValueNearLabel(lines,/\btermino\b|\bfim\b|encerramento/,{duration:false,lookAhead:2});
    const min=findValueNearLabel(lines,/permanencia(?:\s+minima)?|minima/,{duration:true,lookAhead:2});
    const room=findTextAfterLabel(lines,/\bsala\b/,"room");
    const modules=findTextAfterLabel(lines,/modulo(?:\(s\))?s?/,"modules");
    const inicio=normalizeAiClock(start.value),reportedEnd=normalizeAiClock(end.value),duration=durationStringToMinutes(dur.value),minimum=durationStringToMinutes(min.value);
    const cardType=modules.value?"module_card":"time_poster";
    const requiredFound=[inicio,duration!==null,minimum!==null].filter(Boolean).length;
    const projectRequired=ocrMode==="quick"?true:Boolean(room.value&&(cardType==="time_poster"||modules.value));
    const anchors=[start.anchored,dur.anchored,min.anchored,room.anchored].filter(Boolean).length;
    const quality=requiredFound===3&&projectRequired&&anchors>=3?"Alta":requiredFound>=2?"Média":"Baixa";
    return{room:normalizeRoomCode(room.value),modules:normalizeModulesText(modules.value),start:inicio,duration:duration===null?"":formatDurationClock(duration),minimum:minimum===null?"":formatDurationClock(minimum),reportedEnd,cardType,quality,raw};
  }
  function ocrScore(data){return [data.start,data.duration,data.minimum,data.room,data.modules||data.cardType==="time_poster",data.reportedEnd].filter(Boolean).length+(data.quality==="Alta"?3:data.quality==="Média"?1:0)}
  function cardTypeLabel(cardType){return cardType==="time_poster"?"Cartaz vertical de horário":"Cartão por módulo"}
  function updateOcrEndValidation(){
    const start=normalizeAiClock(el.ocrStart.value),duration=durationStringToMinutes(el.ocrDuration.value),reportedEnd=normalizeAiClock(el.ocrEnd.value);
    el.ocrEndCheck.className="ocr-end-check neutral";
    if(!start||duration===null||duration<1){el.ocrEndCheck.innerHTML='<span>VALIDAÇÃO DO TÉRMINO</span><strong>Informe início e tempo de prova para validar.</strong><small>O horário correto será calculado automaticamente.</small>';return}
    const result=calculateResult(start,duration,durationStringToMinutes(el.ocrMinimum.value)||0);
    if(!reportedEnd){el.ocrEndCheck.innerHTML=`<span>TÉRMINO CALCULADO</span><strong>${result.end}</strong><small>O cartaz não trouxe um término legível. Confira e preencha manualmente se necessário.</small>`;return}
    const matches=reportedEnd===result.end;el.ocrEndCheck.className=`ocr-end-check ${matches?"match":"mismatch"}`;
    el.ocrEndCheck.innerHTML=matches?`<span>VALIDAÇÃO DO TÉRMINO</span><strong>✓ ${reportedEnd} confere com o cálculo</strong><small>Início ${start} + ${formatDurationClock(duration)} = ${result.end}</small>`:`<span>DIVERGÊNCIA NO TÉRMINO</span><strong>Informado ${reportedEnd} • Calculado ${result.end}</strong><small>O Portal salvará ${result.end} como término correto e manterá ${reportedEnd} para conferência.</small>`;
  }
  function applyOcrData(data){
    ocrDetectedCardType=data.modules?"module_card":"time_poster";
    el.ocrModal.dataset.cardType=ocrDetectedCardType;
    el.ocrModulesField.classList.remove("hidden");
    if(el.ocrAutoReading) el.ocrAutoReading.textContent=data.modules?"Campos e módulo reconhecidos":"Campos de horário reconhecidos";
    el.ocrRoom.value=data.room;el.ocrModules.value=data.modules;el.ocrStart.value=data.start;el.ocrDuration.value=data.duration;el.ocrMinimum.value=data.minimum;el.ocrEnd.value=data.reportedEnd;el.ocrQuality.textContent=data.quality;el.ocrRawText.textContent=data.raw;el.ocrValidation.textContent="";updateOcrEndValidation();
  }
  async function analyzePhoto(file, mode){
    ocrMode=mode;el.ocrModal.classList.toggle("quick-mode",mode==="quick");$("ocrConfirmBtn").textContent=mode==="quick"?"✓ Calcular":"✓ Calcular e salvar";openModal(el.ocrModal);setOcrState("loading");
    try{const img=await prepareImage(file);el.ocrPreview.src=img.preview;const rawTable=await callOcr(img.blob,true);let best=parseOcr(rawTable);
      const needsSecondPass=!best.start||!best.duration||!best.minimum||(mode==="directory"&&!best.room)||(!best.reportedEnd&&/termino|fim|encerramento/i.test(stripDiacritics(rawTable)));
      if(needsSecondPass){try{const rawFree=await callOcr(img.blob,false);const alternative=parseOcr(rawFree);if(ocrScore(alternative)>ocrScore(best))best=alternative}catch{}}
      applyOcrData(best);setOcrState("confirm")
    }catch(error){el.ocrErrorText.textContent=error.message;setOcrState("error")}
  }
  async function confirmOcr(){
    if(ocrMode==="directory"&&isCurrentProjectClosed())return void(el.ocrValidation.textContent="Projeto encerrado: novos cartões estão bloqueados.");
    const room=normalizeRoomCode(el.ocrRoom.value),modules=normalizeModulesText(el.ocrModules.value),start=normalizeAiClock(el.ocrStart.value),duration=durationStringToMinutes(el.ocrDuration.value),minimum=durationStringToMinutes(el.ocrMinimum.value),reportedEnd=normalizeAiClock(el.ocrEnd.value),cardType=modules?"module_card":"time_poster";
    if(ocrMode==="directory"&&!room)return void(el.ocrValidation.textContent="Informe a sala.");
    if(!start)return void(el.ocrValidation.textContent="Informe um horário de início válido.");
    if(duration===null||duration<1)return void(el.ocrValidation.textContent="Informe um tempo de prova válido maior que 00:00.");
    if(minimum===null)return void(el.ocrValidation.textContent="Informe uma permanência mínima válida.");
    if(el.ocrEnd.value&&!reportedEnd)return void(el.ocrValidation.textContent="Confira o horário de término informado.");
    const result=calculateResult(start,duration,minimum);
    if(ocrMode==="quick"){closeModal(el.ocrModal);showResult(result,null,reportedEnd);return}
    el.ocrValidation.textContent="Salvando no Supabase...";
    try{const roomRow=await ensureRoom(room);await saveExamCard(roomRow,{room,modules,start,duration,minimum,reportedEnd,cardType},result);closeModal(el.ocrModal);showResult(result,{room,modules,cardType},reportedEnd);await loadRooms()}catch(error){el.ocrValidation.textContent=`Erro ao salvar: ${error.message}`}
  }

  // -------------------- EVENTOS --------------------
  function bindEvents() {
    $("googleLoginBtn").addEventListener("click", signInWithGoogle); $("guestCalculatorBtn").addEventListener("click", showPublicCalculator); $("guestLoginReturnBtn")?.addEventListener("click", showLogin); $("signOutBtn").addEventListener("click", signOut);
    $("menuOpenBtn").addEventListener("click", openMenu); $("menuCloseBtn").addEventListener("click", closeMenu); $("menuBackdrop").addEventListener("click", closeMenu);
    $("navOpenBtn").addEventListener("click", openNav); $("navCloseBtn").addEventListener("click", closeNav); $("navBackdrop").addEventListener("click", closeNav);
    el.navActiveProjectsBtn.addEventListener("click",()=>{closeNav();goProjects("ativo")});
    el.navClosedProjectsBtn.addEventListener("click",()=>{closeNav();goProjects("encerrado")});
    $("navQuickCalcBtn").addEventListener("click",()=>{closeNav();showView("quickCalculatorView")});
    $("navCreateProjectBtn").addEventListener("click",()=>{closeNav();resetProjectModal();openModal(el.projectModal)});
    $("editProfileBtn").addEventListener("click", openProfileModal);
    $("profileProjectsBtn").addEventListener("click", openProfileProjects);
    $("profileProjectsBackBtn").addEventListener("click",()=>goProjects("ativo"));
    $("profileModalClose").addEventListener("click",()=>closeModal(el.profileModal));
    $("saveProfileBtn").addEventListener("click", saveProfileBio);

    $("quickCalcBtn")?.addEventListener("click",()=>showView("quickCalculatorView")); $("emptyQuickCalcBtn")?.addEventListener("click",()=>showView("quickCalculatorView")); $("quickHomeBtn").addEventListener("click",goQuickHome); $("quickBackBtn").addEventListener("click",goQuickHome);

    $("newProjectBtn").addEventListener("click",()=>{resetProjectModal();openModal(el.projectModal)}); $("emptyNewProjectBtn").addEventListener("click",()=>{resetProjectModal();openModal(el.projectModal)}); $("projectModalClose").addEventListener("click",()=>closeModal(el.projectModal)); $("addDirectoryRowBtn").addEventListener("click",()=>addDirectoryRow()); $("createProjectConfirmBtn").addEventListener("click",createProjectWithDirectories);
    el.searchOrganizationImageBtn?.addEventListener("click",()=>searchOrganizationVisual());
    el.nextOrganizationImageBtn?.addEventListener("click",nextOrganizationImage);
    el.newProjectOrganization?.addEventListener("input",()=>{
      clearTimeout(organizationSearchTimer);
      const value = el.newProjectOrganization.value.trim();
      if (value !== organizationSearchQuery) {
        organizationImageCandidates = [];
        selectedOrganizationImageIndex = -1;
        renderOrganizationPreview(value.length >= 3 ? "A busca automática começa após uma breve pausa." : "Digite o nome do órgão para iniciar a busca.");
      }
      if (value.length >= 3) organizationSearchTimer = setTimeout(()=>searchOrganizationVisual({silent:true}), 850);
    });
    $("backProjectsBtn").addEventListener("click",()=>goProjects(currentProject?.status === "encerrado" ? "encerrado" : "ativo")); $("projectBackBtn").addEventListener("click",()=>goProjects(currentProject?.status === "encerrado" ? "encerrado" : "ativo"));
    el.editProjectBtn?.addEventListener("click",openEditProjectModal); $("editProjectModalClose").addEventListener("click",()=>closeModal(el.editProjectModal)); $("editProjectCancelBtn").addEventListener("click",()=>closeModal(el.editProjectModal)); el.saveProjectEditsBtn.addEventListener("click",saveProjectEdits);
    el.editSearchOrganizationImageBtn?.addEventListener("click",()=>searchEditOrganizationVisual());
    el.editNextOrganizationImageBtn?.addEventListener("click",nextEditOrganizationImage);
    el.editProjectOrganization?.addEventListener("input",()=>{
      clearTimeout(editOrganizationSearchTimer);
      const value = el.editProjectOrganization.value.trim();
      if (value !== editOrganizationSearchQuery) {
        editOrganizationImageCandidates = [];
        editSelectedOrganizationImageIndex = -1;
        renderEditOrganizationPreview(value.length >= 3 ? "A busca automática começa após uma breve pausa." : "Digite o nome do órgão para iniciar a busca.");
      }
      if (value.length >= 3) editOrganizationSearchTimer = setTimeout(()=>searchEditOrganizationVisual({silent:true}), 850);
    });
    el.closeProjectBtn.addEventListener("click",()=>openProjectAction("close")); el.deleteProjectBtn.addEventListener("click",()=>openProjectAction("delete")); $("projectActionClose").addEventListener("click",()=>closeModal(el.projectActionModal)); $("projectActionCancel").addEventListener("click",()=>closeModal(el.projectActionModal)); el.projectActionConfirm.addEventListener("click",confirmProjectAction);
    $("manageParticipantsBtn").addEventListener("click",()=>openParticipantsModal(false)); $("participantsModalClose").addEventListener("click",()=>closeModal(el.participantsModal)); $("participantsLaterBtn").addEventListener("click",()=>closeModal(el.participantsModal)); $("saveParticipantsBtn").addEventListener("click",saveParticipants);
    el.participantInputs.forEach(input=>input.addEventListener("input",()=>handleParticipantSearch(input)));

    el.addDirectoryBtn.addEventListener("click",()=>{if(isCurrentProjectClosed())return showToast("Projeto encerrado.");el.singleDirectoryName.value="";el.singleDirectoryPeriod.value="manha";el.directoryModalValidation.textContent="";openModal(el.directoryModal)}); $("directoryModalClose").addEventListener("click",()=>closeModal(el.directoryModal)); $("createDirectoryConfirmBtn").addEventListener("click",createSingleDirectory);
    $("dirHomeBtn").addEventListener("click",()=>goProjects("ativo")); $("dirProjectBtn").addEventListener("click",()=>{showView("projectView");Promise.all([loadDirectories(),loadProjectMembers()])}); $("directoryBackBtn").addEventListener("click",()=>{showView("projectView");Promise.all([loadDirectories(),loadProjectMembers()])}); el.sectionTabs.forEach(tab=>tab.addEventListener("click",()=>switchSection(tab.dataset.section)));

    $("takePhotoBtn").addEventListener("click",()=>requestPhoto("directory")); $("roomsCaptureBtn").addEventListener("click",()=>requestPhoto("directory")); el.photoInput.addEventListener("change",()=>{const file=el.photoInput.files?.[0];if(file)analyzePhoto(file,"directory")});
    $("quickTakePhotoBtn").addEventListener("click",()=>requestPhoto("quick")); el.quickPhotoInput.addEventListener("change",()=>{const file=el.quickPhotoInput.files?.[0];if(file)analyzePhoto(file,"quick")});
    $("ocrModalClose").addEventListener("click",()=>closeModal(el.ocrModal)); $("ocrRetryBtn").addEventListener("click",()=>{closeModal(el.ocrModal);requestPhoto(ocrMode)}); $("ocrErrorRetryBtn").addEventListener("click",()=>{closeModal(el.ocrModal);requestPhoto(ocrMode)}); $("ocrConfirmBtn").addEventListener("click",confirmOcr);
    [el.ocrStart,el.ocrDuration,el.ocrMinimum,el.ocrEnd].forEach(input=>input.addEventListener("input",updateOcrEndValidation));

    el.manualForm.addEventListener("submit",manualSubmit); $("manualResetBtn").addEventListener("click",resetManual); el.quickManualForm.addEventListener("submit",quickManualSubmit); $("quickResetBtn").addEventListener("click",resetQuickManual);
    $("refreshRoomsBtn").addEventListener("click",loadRooms); $("backRoomsBtn").addEventListener("click",renderRooms); $("saveChecklistBtn").addEventListener("click",saveChecklist);
    $("resultCloseBtn").addEventListener("click",()=>closeModal(el.resultModal)); $("resultOkBtn").addEventListener("click",()=>closeModal(el.resultModal));
    qa(".modal-backdrop[data-close]").forEach(backdrop=>backdrop.addEventListener("click",()=>closeModal($(backdrop.dataset.close))));
    [el.manualDurationHours,el.manualDurationMinutes,el.manualMinimumHours,el.manualMinimumMinutes,el.quickDurationHours,el.quickDurationMinutes,el.quickMinimumHours,el.quickMinimumMinutes].forEach(input=>input.addEventListener("input",()=>{input.value=input.value.replace(/\D/g,"").slice(0,2)}));
  }

  function init() {
    bindEvents(); updateMenuContext(); resetManual(); resetQuickManual();
    initAuth().catch(error => showLogin(error.message));
    setTimeout(()=>{document.body.classList.remove("intro-playing"); if(el.intro) el.intro.style.display="none";},4100);
  }

  // Ponte segura para módulos internos do Portal FCC. Não expõe chaves nem
  // permite ignorar o RLS: toda chamada continua usando o JWT do usuário.
  window.FCCPortalBridge = Object.freeze({
    request: supabaseRequest,
    getClient: () => authClient,
    getSession: () => session,
    getCurrentUser: () => currentUser,
    getCurrentProfile: () => currentProfile,
    getCurrentProject: () => currentProject,
    getProjectsCache: () => [...projectsCache],
    refreshProjects: async () => {
      const projects = await supabaseRequest("rpc/fcc_list_my_projects", { method: "POST", body: {} });
      projectsCache = Array.isArray(projects) ? projects : [];
      return [...projectsCache];
    },
    showView,
    showToast,
    openProject,
    formatProjectDate,
    projectDateSortValue,
    escapeHtml,
    initials,
    safeAvatarUrl
  });

  init();
})();

/* =====================================================================
   V16 EXPERIMENTAL — CAMADA DE EXPERIÊNCIA VISUAL
   Não altera regras de negócio, Supabase, OCR ou autenticação da V15.6.
   ===================================================================== */
(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const dockButtons = {
    home: byId("dockHomeBtn"),
    calc: byId("dockCalcBtn"),
    kanban: byId("dockKanbanBtn"),
    closed: byId("dockClosedBtn"),
    profile: byId("dockProfileBtn")
  };

  function proxyClick(targetId) {
    const target = byId(targetId);
    if (target && !target.disabled) target.click();
  }

  dockButtons.home?.addEventListener("click", () => proxyClick("navActiveProjectsBtn"));
  dockButtons.calc?.addEventListener("click", () => proxyClick("navQuickCalcBtn"));
  dockButtons.closed?.addEventListener("click", () => proxyClick("navClosedProjectsBtn"));
  dockButtons.profile?.addEventListener("click", () => proxyClick("menuOpenBtn"));

  function setDockActive(key) {
    Object.entries(dockButtons).forEach(([name, button]) => {
      if (!button) return;
      button.classList.toggle("active", name === key);
    });
  }

  function syncDock() {
    const activeView = document.querySelector(".view.active")?.id || "";
    const projectsTitle = byId("projectsTitle")?.textContent?.toLowerCase() || "";

    if (activeView === "quickCalculatorView") setDockActive("calc");
    else if (activeView === "kanbanView") setDockActive("kanban");
    else if (activeView === "projectsView" && projectsTitle.includes("conclu")) setDockActive("closed");
    else if (activeView === "profileProjectsView") setDockActive("profile");
    else setDockActive("home");
  }

  const classObserver = new MutationObserver(syncDock);
  document.querySelectorAll(".view").forEach((view) => {
    classObserver.observe(view, { attributes: true, attributeFilter: ["class"] });
  });
  if (byId("projectsTitle")) {
    classObserver.observe(byId("projectsTitle"), { childList: true, subtree: true });
  }

  const header = document.querySelector(".app-header");
  function syncHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  }
  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  const revealSelector = [
    ".framed-heading",
    ".status-line",
    ".project-card",
    ".directory-card",
    ".room-folder",
    ".participants-panel",
    ".camera-card",
    ".manual-card",
    ".checklist-card"
  ].join(",");

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -18px" })
    : null;

  function enhanceNode(node) {
    if (!(node instanceof Element)) return;
    const candidates = node.matches?.(revealSelector)
      ? [node]
      : [...node.querySelectorAll?.(revealSelector) || []];

    candidates.forEach((element, index) => {
      if (element.dataset.v16Enhanced) return;
      element.dataset.v16Enhanced = "true";
      element.classList.add("v16-reveal");
      element.style.transitionDelay = `${Math.min(index * 45, 180)}ms`;
      if (revealObserver) revealObserver.observe(element);
      else element.classList.add("is-visible");
    });
  }

  enhanceNode(document.body);
  const domObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach(enhanceNode));
  });
  domObserver.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 0.8;
    const ripple = document.createElement("span");
    ripple.className = "v16-ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 650);
  });

  const canTilt = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (canTilt) {
    document.addEventListener("pointermove", (event) => {
      const card = event.target.closest(".project-card,.directory-card,.room-folder");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-5px)`;
    });
    document.addEventListener("pointerout", (event) => {
      const card = event.target.closest(".project-card,.directory-card,.room-folder");
      if (card && !card.contains(event.relatedTarget)) card.style.transform = "";
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.querySelector(".modal.open,.nav-drawer.open,.menu-drawer.open")) return;
    const activeView = document.querySelector(".view.active")?.id;
    if (activeView && activeView !== "projectsView") proxyClick("quickBackBtn");
  });

  syncDock();
})();
