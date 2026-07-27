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
    views: qa(".view"), projectsView: $("projectsView"), quickCalculatorView: $("quickCalculatorView"), projectView: $("projectView"), directoryView: $("directoryView"),
    projectGrid: $("projectGrid"), projectsStatus: $("projectsStatus"), projectsEmpty: $("projectsEmpty"),
    projectTitle: $("projectTitle"), projectCrumb: $("projectCrumb"), directoryGrid: $("directoryGrid"), directoriesEmpty: $("directoriesEmpty"),
    projectParticipantsGrid: $("projectParticipantsGrid"), manageParticipantsBtn: $("manageParticipantsBtn"),
    projectStatusBadge: $("projectStatusBadge"), closeProjectBtn: $("closeProjectBtn"), deleteProjectBtn: $("deleteProjectBtn"), addDirectoryBtn: $("addDirectoryBtn"),
    projectActionModal: $("projectActionModal"), projectActionChip: $("projectActionChip"), projectActionTitle: $("projectActionTitle"), projectActionText: $("projectActionText"), projectActionValidation: $("projectActionValidation"), projectActionConfirm: $("projectActionConfirm"), deleteProjectConfirmField: $("deleteProjectConfirmField"), deleteProjectConfirmInput: $("deleteProjectConfirmInput"),
    directoryTitle: $("directoryTitle"), directoryCrumb: $("directoryCrumb"), directoryProjectLabel: $("directoryProjectLabel"), directoryPeriodBadge: $("directoryPeriodBadge"),
    menuDrawer: $("menuDrawer"), menuProjectLabel: $("menuProjectLabel"), menuDirectoryLabel: $("menuDirectoryLabel"),
    menuProjectBtn: $("menuProjectBtn"), menuCalculatorBtn: $("menuCalculatorBtn"), menuRoomsBtn: $("menuRoomsBtn"), menuChecklistBtn: $("menuChecklistBtn"),
    projectModal: $("projectModal"), projectModalValidation: $("projectModalValidation"), newProjectName: $("newProjectName"), directoryRowList: $("directoryRowList"),
    participantsModal: $("participantsModal"), participantsValidation: $("participantsValidation"), participantInputs: qa(".participant-search-input"),
    directoryModal: $("directoryModal"), singleDirectoryName: $("singleDirectoryName"), singleDirectoryPeriod: $("singleDirectoryPeriod"), directoryModalValidation: $("directoryModalValidation"),
    sections: qa(".directory-section"), sectionTabs: qa(".section-tab"),
    photoInput: $("examPhotoInput"), quickPhotoInput: $("quickPhotoInput"),
    manualForm: $("manualForm"), manualStart: $("manualStart"), manualDurationHours: $("manualDurationHours"), manualDurationMinutes: $("manualDurationMinutes"), manualMinimumHours: $("manualMinimumHours"), manualMinimumMinutes: $("manualMinimumMinutes"), manualValidation: $("manualValidation"),
    quickManualForm: $("quickManualForm"), quickStart: $("quickStart"), quickDurationHours: $("quickDurationHours"), quickDurationMinutes: $("quickDurationMinutes"), quickMinimumHours: $("quickMinimumHours"), quickMinimumMinutes: $("quickMinimumMinutes"), quickValidation: $("quickValidation"),
    roomsStatus: $("roomsStatus"), roomsGrid: $("roomsGrid"), roomsEmpty: $("roomsEmpty"), roomsRoot: $("roomsRoot"), roomDetail: $("roomDetail"), roomCrumb: $("roomCrumb"), roomTitle: $("roomTitle"), roomMeta: $("roomMeta"), roomRecords: $("roomRecords"),
    check1: $("check1"), check2: $("check2"), check3: $("check3"), check4: $("check4"), checkComments: $("checkComments"), checklistStatus: $("checklistStatus"),
    ocrModal: $("ocrModal"), ocrLoading: $("ocrLoading"), ocrConfirm: $("ocrConfirm"), ocrError: $("ocrError"), ocrPreview: $("ocrPreview"), ocrRoom: $("ocrRoom"), ocrModules: $("ocrModules"), ocrStart: $("ocrStart"), ocrDuration: $("ocrDuration"), ocrMinimum: $("ocrMinimum"), ocrQuality: $("ocrQuality"), ocrRawText: $("ocrRawText"), ocrValidation: $("ocrValidation"), ocrErrorText: $("ocrErrorText"),
    resultModal: $("resultModal"), resultEnd: $("resultEnd"), resultStart: $("resultStart"), resultDuration: $("resultDuration"), resultMinimum: $("resultMinimum"), resultMinimumExit: $("resultMinimumExit"), savedMeta: $("savedMeta"), savedRoom: $("savedRoom"), savedModules: $("savedModules"),
    toast: $("toast"), toastText: $("toastText")
  };

  let authClient = null;
  let session = null;
  let currentUser = null;
  let currentProject = null;
  let currentDirectory = null;
  let currentSection = "calculator";
  let roomsCache = [];
  let projectMembersCache = [];
  let selectedParticipants = Object.fromEntries(ROLE_ORDER.map(role => [role, null]));
  let originalRoleUsers = {};
  let searchTimers = {};
  let ocrMode = "directory";
  let toastTimer = null;
  let projectActionMode = null;

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
  function initials(name, email = "") { const source = String(name || email || "U").trim(); const parts = source.split(/\s+/).filter(Boolean); return ((parts[0]?.[0] || "U") + (parts.length > 1 ? parts.at(-1)[0] : "")).toUpperCase().slice(0, 2); }
  function displayNameFromUser(user) { return String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário"); }
  function avatarFromUser(user) { return safeAvatarUrl(user?.user_metadata?.avatar_url || user?.user_metadata?.picture); }

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
    if (!qa(".modal.open").length && !el.menuDrawer.classList.contains("open")) document.body.classList.remove("modal-open");
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
    session = null; currentUser = null; currentProject = null; currentDirectory = null;
    document.body.classList.remove("guest-mode");
    el.appShell.classList.add("hidden"); el.authGate.classList.remove("hidden"); document.body.classList.remove("auth-pending");
    el.authError.textContent = errorMessage;
    const guestReturn = $("guestLoginReturnBtn"); if (guestReturn) guestReturn.classList.add("hidden");
  }

  function showPublicCalculator() {
    currentProject = null; currentDirectory = null;
    document.body.classList.add("guest-mode");
    el.authGate.classList.add("hidden"); el.appShell.classList.remove("hidden"); document.body.classList.remove("auth-pending");
    const guestReturn = $("guestLoginReturnBtn"); if (guestReturn) guestReturn.classList.remove("hidden");
    resetQuickManual(); showView("quickCalculatorView");
  }

  function goQuickHome() {
    if (currentUser) { showView("projectsView"); loadProjects(); }
    else showLogin();
  }

  async function activateSession(nextSession) {
    session = nextSession; currentUser = nextSession?.user || null;
    if (!currentUser) return showLogin();
    document.body.classList.remove("guest-mode");
    renderSignedUser();
    try { await syncMyProfile(); } catch (error) { console.warn("Perfil não sincronizado:", error); }
    el.authGate.classList.add("hidden"); el.appShell.classList.remove("hidden"); document.body.classList.remove("auth-pending");
    const guestReturn = $("guestLoginReturnBtn"); if (guestReturn) guestReturn.classList.add("hidden");
    updateMenuContext();
    showView("projectsView");
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
    closeMenu();
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
  async function loadProjects() {
    if (!currentUser) return;
    el.projectsStatus.innerHTML = "<span></span> Sincronizando com o Supabase...";
    try {
      const params = new URLSearchParams({ select: "id,name,slug,created_by,status,closed_at,closed_by,created_at", order: "created_at.desc" });
      const projects = await supabaseRequest(`fcc_projects?${params}`);
      renderProjects(Array.isArray(projects) ? projects : []);
      el.projectsStatus.innerHTML = "<span></span> Projetos disponíveis para sua conta";
    } catch (error) {
      el.projectGrid.innerHTML = ""; el.projectsEmpty.classList.add("hidden"); el.projectsStatus.textContent = `Supabase: ${error.message}`;
    }
  }

  function renderProjects(projects) {
    el.projectGrid.innerHTML = ""; el.projectsEmpty.classList.toggle("hidden", projects.length > 0);
    projects.forEach(project => {
      const btn = document.createElement("button"); btn.className = "project-card"; btn.type = "button";
      const legacy = !project.created_by; const closed = project.status === "encerrado";
      btn.classList.toggle("closed-project", closed);
      btn.innerHTML = `<span class="project-card-status ${closed ? "closed" : "active"}">${closed ? "Encerrado" : "Ativo"}</span><span class="folder">▰</span><h3>${escapeHtml(project.name)}</h3><p>${closed ? "Projeto encerrado • disponível para consulta" : legacy ? "Projeto legado • será vinculado ao abrir" : "Abrir diretórios do projeto"}</p>`;
      btn.addEventListener("click", () => openProject(project)); el.projectGrid.appendChild(btn);
    });
  }

  function resetProjectModal() {
    el.newProjectName.value = ""; el.projectModalValidation.textContent = ""; el.directoryRowList.innerHTML = "";
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
    const rows = [...el.directoryRowList.querySelectorAll(".directory-create-row")].map(row => ({ name: row.querySelector(".dir-row-name").value.trim(), period: row.querySelector(".dir-row-period").value }));
    if (name.length < 2) return void (el.projectModalValidation.textContent = "Informe o nome do projeto.");
    if (!rows.length || rows.some(row => !row.name)) return void (el.projectModalValidation.textContent = "Preencha o nome de todos os diretórios.");
    const normalizedNames = rows.map(row => row.name.toLocaleLowerCase("pt-BR"));
    if (new Set(normalizedNames).size !== normalizedNames.length) return void (el.projectModalValidation.textContent = "Use nomes diferentes nos diretórios.");
    el.projectModalValidation.textContent = "Criando projeto...";
    try {
      // A criação é feita por uma RPC autenticada no Supabase. Além de evitar
      // o problema de INSERT/RETURNING com RLS, projeto + diretórios são criados
      // na mesma transação e o proprietário é sempre auth.uid() no servidor.
      const created = await supabaseRequest("rpc/fcc_create_project_with_directories", {
        method: "POST",
        body: {
          p_name: name,
          p_slug: slugify(name),
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
    el.projectTitle.textContent = currentProject.name; el.projectCrumb.textContent = currentProject.name; showView("projectView");
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

  async function openDirectory(dir, section = "calculator") {
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

  function canManageParticipants() {
    return Boolean(currentProject && currentUser && (currentProject.created_by === currentUser.id || projectMembersCache.some(m => m.user_id === currentUser.id && m.role === "po")));
  }

  function isProjectOwner() { return Boolean(currentProject && currentUser && currentProject.created_by === currentUser.id); }
  function isCurrentProjectClosed() { return currentProject?.status === "encerrado"; }
  function renderProjectState() {
    if (!currentProject) return;
    const closed = isCurrentProjectClosed(); const canManage = canManageParticipants(); const owner = isProjectOwner();
    el.projectStatusBadge.textContent = closed ? "Encerrado" : "Ativo";
    el.projectStatusBadge.className = `project-status-badge ${closed ? "closed" : "active"}`;
    el.addDirectoryBtn.disabled = closed;
    el.addDirectoryBtn.classList.toggle("hidden", closed);
    el.closeProjectBtn.classList.toggle("hidden", closed || !canManage);
    el.deleteProjectBtn.classList.toggle("hidden", !owner);
    el.manageParticipantsBtn.classList.toggle("hidden", closed || !canManage);
    [$("takePhotoBtn"), $("roomsCaptureBtn"), $("saveChecklistBtn")].forEach(btn => { if (btn) btn.disabled = closed; });
    [el.check1, el.check2, el.check3, el.check4, el.checkComments].forEach(field => { if (field) field.disabled = closed; });
    el.projectView.classList.toggle("project-is-closed", closed);
    el.directoryView.classList.toggle("project-is-closed", closed);
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
        closeModal(el.projectActionModal); showToast("Projeto excluído."); currentProject = null; currentDirectory = null; projectMembersCache = []; updateMenuContext(); showView("projectsView"); await loadProjects();
      } else {
        if (!canManageParticipants()) throw new Error("Somente o criador ou o PO pode encerrar o projeto.");
        el.projectActionValidation.textContent = "Encerrando projeto...";
        const data = await supabaseRequest("rpc/fcc_close_project", { method: "POST", body: { p_project_id: currentProject.id } });
        const updated = Array.isArray(data) ? data[0] : data; currentProject = { ...currentProject, ...(updated || {}), status: "encerrado" };
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
      for (const role of ROLE_ORDER) {
        const person = selectedParticipants[role]; const userId = person?.user_id || person?.id || null;
        if (userId) await supabaseRequest("rpc/fcc_set_project_member", { method: "POST", body: { p_project_id: currentProject.id, p_user_id: userId, p_role: role } });
        else if (originalRoleUsers[role]) await supabaseRequest("rpc/fcc_clear_project_role", { method: "POST", body: { p_project_id: currentProject.id, p_role: role } });
      }
      closeModal(el.participantsModal); showToast("Participantes atualizados."); await loadProjectMembers(); await loadProjects();
    } catch (error) { el.participantsValidation.textContent = `Erro: ${error.message}`; }
  }

  // -------------------- MENU --------------------
  function updateMenuContext() {
    el.menuProjectLabel.textContent = currentProject?.name || "Nenhum selecionado";
    el.menuDirectoryLabel.textContent = currentDirectory ? `${currentDirectory.name} • ${periodLabel(currentDirectory.period)}` : "Nenhum selecionado";
    el.menuProjectBtn.disabled = !currentProject; [el.menuCalculatorBtn, el.menuRoomsBtn, el.menuChecklistBtn].forEach(btn => btn.disabled = !currentDirectory);
  }
  function openMenu() { el.menuDrawer.classList.add("open"); el.menuDrawer.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); }
  function closeMenu() { el.menuDrawer.classList.remove("open"); el.menuDrawer.setAttribute("aria-hidden", "true"); if (!qa(".modal.open").length) document.body.classList.remove("modal-open"); }

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
  function showResult(result, saved = null) {
    el.resultEnd.textContent = result.end; el.resultStart.textContent = result.start; el.resultDuration.textContent = formatDurationClock(result.duration); el.resultMinimum.textContent = formatDurationClock(result.minimum); el.resultMinimumExit.textContent = result.minimumExit;
    el.savedMeta.classList.toggle("hidden", !saved); if (saved) { el.savedRoom.textContent = `Sala ${saved.room}`; el.savedModules.textContent = `Módulo(s): ${saved.modules}`; }
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
    const payload = { room_id: room.id, modules: data.modules, start_time: data.start, duration_minutes: data.duration, end_time: result.end, end_next_day: result.endNextDay, minimum_stay_minutes: data.minimum, minimum_exit_time: result.minimumExit, minimum_exit_next_day: result.minimumNextDay, source: "ocr_space" };
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
      const div = document.createElement("article"); div.className = "record-card";
      div.innerHTML = `<div class="record-top"><span>MÓDULO(S)</span><span>${new Date(card.captured_at).toLocaleString("pt-BR")}</span></div><h4>${escapeHtml(card.modules)}</h4><div class="record-times"><div><span>Início</span><strong>${String(card.start_time).slice(0,5)}</strong></div><div><span>Duração</span><strong>${formatDurationClock(card.duration_minutes)}</strong></div><div><span>Encerramento</span><strong>${String(card.end_time).slice(0,5)}</strong></div><div><span>Liberação mínima</span><strong>${String(card.minimum_exit_time).slice(0,5)}</strong></div></div><div class="record-min">⏱ Permanência mínima: <strong>${formatDurationClock(card.minimum_stay_minutes)}</strong></div>`;
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
  async function callOcr(blob) {
    const cfg = getOcrConfig(); if (!cfg.configured) throw new Error("Configure OCRSPACE_API_KEY no config.js.");
    const form = new FormData(); form.append("file", blob, "cartao.jpg"); form.append("OCREngine", cfg.engine); form.append("language", "auto"); form.append("detectOrientation", "true"); form.append("scale", "true"); form.append("isTable", "true");
    const res = await fetch(cfg.endpoint, { method:"POST", headers:{apikey:cfg.key}, body:form }); const payload = await res.json().catch(() => null); if (!res.ok) throw new Error(`OCR.Space HTTP ${res.status}`);
    if (payload?.IsErroredOnProcessing) throw new Error((payload.ErrorMessage || payload.ErrorDetails || ["OCR.Space retornou erro"]).flat?.().join?.(" ") || "OCR.Space retornou erro."); const text = payload?.ParsedResults?.[0]?.ParsedText; if (!text) throw new Error("Nenhum texto foi reconhecido."); return text;
  }
  function cleanOcrLine(v){return String(v||"").replace(/[|_*#`]/g," ").replace(/\s+/g," ").trim()}
  function normalizeOcrDigits(v){return String(v||"").replace(/[Oo]/g,"0").replace(/[Il|]/g,"1")}
  function normalizeAiClock(v){let t=String(v||"").trim().toLowerCase().replace(/\s/g,"").replace(/[h\.]/g,":");const m=t.match(/^(\d{1,2}):(\d{2})$/);if(!m)return"";const h=+m[1],mi=+m[2];return h<=23&&mi<=59?`${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`:""}
  function durationStringToMinutes(v){let t=String(v||"").trim().toLowerCase().replace(/\s/g,"");if(!t)return null;const colon=t.match(/^(\d{1,2}):(\d{2})$/);if(colon){const total=+colon[1]*60 + +colon[2];return +colon[2]<=59&&total>=0&&total<=720?total:null}const hp=t.match(/^(\d{1,2})h(?:(\d{1,2}))?$/);if(hp){const total=+hp[1]*60+(+hp[2]||0);return (+hp[2]||0)<=59&&total>=0&&total<=720?total:null}return null}
  function findTimeToken(text,{duration=false}={}){const src=String(text||"");const pattern=/(?:^|[^A-Za-zÀ-ÿ0-9])([0-9OoIl|]{1,2})\s*(?:h|H|:|\.|;)\s*([0-9OoIl|]{1,2})(?![A-Za-zÀ-ÿ0-9])/g;let m;while((m=pattern.exec(src))){const h=+normalizeOcrDigits(m[1]),mi=+normalizeOcrDigits(m[2]);if(mi>59)continue;if(duration){const total=h*60+mi;if(total>=0&&total<=720)return formatDurationClock(total)}else if(h<=23)return`${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`}return""}
  function isDifferentFieldLabel(line,expected){const s=stripDiacritics(line).toLowerCase();const known=/duracao|inicio|termino|fim|encerramento|permanencia|minima|sala|modulo/.test(s);return known&&!expected.test(s)}
  function findValueNearLabel(lines,label,{duration=false,lookAhead=2}={}){for(let i=0;i<lines.length;i++){const s=stripDiacritics(lines[i]).toLowerCase();if(!label.test(s))continue;const d=findTimeToken(lines[i],{duration});if(d)return{value:d,anchored:true};for(let o=1;o<=lookAhead&&i+o<lines.length;o++){if(isDifferentFieldLabel(lines[i+o],label))break;const v=findTimeToken(lines[i+o],{duration});if(v)return{value:v,anchored:true}}}return{value:"",anchored:false}}
  function findTextAfterLabel(lines,label,kind){for(let i=0;i<lines.length;i++){if(!label.test(stripDiacritics(lines[i]).toLowerCase()))continue;for(let o=0;o<=1&&i+o<lines.length;o++){let c=cleanOcrLine(lines[i+o]);if(o===0){const pos=c.indexOf(":");c=pos>=0?c.slice(pos+1).trim():c.replace(/m[oó]dulo(?:\(s\))?s?/i,"").replace(/sala/i,"").replace(/^\s*[-–—:]\s*/,"").trim()}if(!c)continue;if(kind==="room"){c=c.replace(/\b(?:m[oó]dulo|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i,"").trim();const m=c.match(/\b([A-Za-z0-9][A-Za-z0-9._-]{0,19})\b/);if(m)return{value:normalizeRoomCode(m[1]),anchored:true}}else{c=c.replace(/\b(?:sala|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i,"").trim();const nums=c.match(/\b\d{3,}\b/g);if(nums?.length)return{value:normalizeModulesText([...new Set(nums)].join(", ")),anchored:true}}}}return{value:"",anchored:false}}
  function parseOcr(raw){const lines=String(raw||"").split(/\r?\n/).map(cleanOcrLine).filter(Boolean);const dur=findValueNearLabel(lines,/duracao(?:\s+da)?\s+prova|duracao/,{duration:true,lookAhead:1});const start=findValueNearLabel(lines,/\binicio\b/,{duration:false,lookAhead:1});const min=findValueNearLabel(lines,/permanencia(?:\s+minima)?|minima/,{duration:true,lookAhead:1});const room=findTextAfterLabel(lines,/\bsala\b/,"room");const modules=findTextAfterLabel(lines,/modulo(?:\(s\))?s?/,"modules");let inicio=normalizeAiClock(start.value),duration=durationStringToMinutes(dur.value),minimum=durationStringToMinutes(min.value);const requiredFound=[inicio,duration!==null].filter(Boolean).length;const projectFound=[room.value,modules.value].filter(Boolean).length;return{room:normalizeRoomCode(room.value),modules:normalizeModulesText(modules.value),start:inicio,duration:duration===null?"":formatDurationClock(duration),minimum:minimum===null?"":formatDurationClock(minimum),quality:requiredFound===2&&start.anchored&&dur.anchored&&(ocrMode==="quick"||projectFound===2)?"Alta":requiredFound===2?"Média":"Baixa",raw};}
  async function analyzePhoto(file, mode){ocrMode=mode; el.ocrModal.classList.toggle("quick-mode",mode==="quick"); $("ocrConfirmBtn").textContent=mode==="quick"?"✓ Calcular":"✓ Calcular e salvar"; openModal(el.ocrModal);setOcrState("loading");try{const img=await prepareImage(file);el.ocrPreview.src=img.preview;const raw=await callOcr(img.blob);const data=parseOcr(raw);el.ocrRoom.value=data.room;el.ocrModules.value=data.modules;el.ocrStart.value=data.start;el.ocrDuration.value=data.duration;el.ocrMinimum.value=data.minimum;el.ocrQuality.textContent=data.quality;el.ocrRawText.textContent=raw;el.ocrValidation.textContent="";setOcrState("confirm")}catch(error){el.ocrErrorText.textContent=error.message;setOcrState("error")}}
  async function confirmOcr(){if(ocrMode==="directory"&&isCurrentProjectClosed())return void(el.ocrValidation.textContent="Projeto encerrado: novos cartões estão bloqueados.");const room=normalizeRoomCode(el.ocrRoom.value),modules=normalizeModulesText(el.ocrModules.value),start=normalizeAiClock(el.ocrStart.value),duration=durationStringToMinutes(el.ocrDuration.value),minimum=durationStringToMinutes(el.ocrMinimum.value);if(ocrMode==="directory"&&!room)return void(el.ocrValidation.textContent="Informe a sala.");if(ocrMode==="directory"&&!modules)return void(el.ocrValidation.textContent="Informe o(s) módulo(s).");if(!start)return void(el.ocrValidation.textContent="Informe um horário de início válido.");if(duration===null||duration<1)return void(el.ocrValidation.textContent="Informe uma duração válida maior que 00:00.");if(minimum===null)return void(el.ocrValidation.textContent="Informe uma permanência mínima válida.");const result=calculateResult(start,duration,minimum);if(ocrMode==="quick"){closeModal(el.ocrModal);showResult(result,null);return}el.ocrValidation.textContent="Salvando no Supabase...";try{const roomRow=await ensureRoom(room);await saveExamCard(roomRow,{room,modules,start,duration,minimum},result);closeModal(el.ocrModal);showResult(result,{room,modules});await loadRooms();}catch(error){el.ocrValidation.textContent=`Erro ao salvar: ${error.message}`}}

  // -------------------- EVENTOS --------------------
  function bindEvents() {
    $("googleLoginBtn").addEventListener("click", signInWithGoogle); $("guestCalculatorBtn").addEventListener("click", showPublicCalculator); $("guestLoginReturnBtn").addEventListener("click", showLogin); $("signOutBtn").addEventListener("click", signOut);
    $("menuOpenBtn").addEventListener("click", openMenu); $("menuCloseBtn").addEventListener("click", closeMenu); $("menuBackdrop").addEventListener("click", closeMenu);
    $("menuHomeBtn").addEventListener("click",()=>{closeMenu();showView("projectsView");loadProjects()}); $("menuQuickCalcBtn").addEventListener("click",()=>{closeMenu();showView("quickCalculatorView")});
    el.menuProjectBtn.addEventListener("click",()=>{if(!currentProject)return;closeMenu();showView("projectView");Promise.all([loadDirectories(),loadProjectMembers()])});
    el.menuCalculatorBtn.addEventListener("click",()=>{if(!currentDirectory)return;closeMenu();openDirectory(currentDirectory,"calculator")}); el.menuRoomsBtn.addEventListener("click",()=>{if(!currentDirectory)return;closeMenu();openDirectory(currentDirectory,"rooms")}); el.menuChecklistBtn.addEventListener("click",()=>{if(!currentDirectory)return;closeMenu();openDirectory(currentDirectory,"checklist")});

    $("quickCalcBtn").addEventListener("click",()=>showView("quickCalculatorView")); $("emptyQuickCalcBtn").addEventListener("click",()=>showView("quickCalculatorView")); $("quickHomeBtn").addEventListener("click",goQuickHome);

    $("newProjectBtn").addEventListener("click",()=>{resetProjectModal();openModal(el.projectModal)}); $("emptyNewProjectBtn").addEventListener("click",()=>{resetProjectModal();openModal(el.projectModal)}); $("projectModalClose").addEventListener("click",()=>closeModal(el.projectModal)); $("addDirectoryRowBtn").addEventListener("click",()=>addDirectoryRow()); $("createProjectConfirmBtn").addEventListener("click",createProjectWithDirectories);
    $("backProjectsBtn").addEventListener("click",()=>{showView("projectsView");loadProjects()});
    el.closeProjectBtn.addEventListener("click",()=>openProjectAction("close")); el.deleteProjectBtn.addEventListener("click",()=>openProjectAction("delete")); $("projectActionClose").addEventListener("click",()=>closeModal(el.projectActionModal)); $("projectActionCancel").addEventListener("click",()=>closeModal(el.projectActionModal)); el.projectActionConfirm.addEventListener("click",confirmProjectAction);
    $("manageParticipantsBtn").addEventListener("click",()=>openParticipantsModal(false)); $("participantsModalClose").addEventListener("click",()=>closeModal(el.participantsModal)); $("participantsLaterBtn").addEventListener("click",()=>closeModal(el.participantsModal)); $("saveParticipantsBtn").addEventListener("click",saveParticipants);
    el.participantInputs.forEach(input=>input.addEventListener("input",()=>handleParticipantSearch(input)));

    el.addDirectoryBtn.addEventListener("click",()=>{if(isCurrentProjectClosed())return showToast("Projeto encerrado.");el.singleDirectoryName.value="";el.singleDirectoryPeriod.value="manha";el.directoryModalValidation.textContent="";openModal(el.directoryModal)}); $("directoryModalClose").addEventListener("click",()=>closeModal(el.directoryModal)); $("createDirectoryConfirmBtn").addEventListener("click",createSingleDirectory);
    $("dirHomeBtn").addEventListener("click",()=>{showView("projectsView");loadProjects()}); $("dirProjectBtn").addEventListener("click",()=>{showView("projectView");Promise.all([loadDirectories(),loadProjectMembers()])}); el.sectionTabs.forEach(tab=>tab.addEventListener("click",()=>switchSection(tab.dataset.section)));

    $("takePhotoBtn").addEventListener("click",()=>requestPhoto("directory")); $("roomsCaptureBtn").addEventListener("click",()=>requestPhoto("directory")); el.photoInput.addEventListener("change",()=>{const file=el.photoInput.files?.[0];if(file)analyzePhoto(file,"directory")});
    $("quickTakePhotoBtn").addEventListener("click",()=>requestPhoto("quick")); el.quickPhotoInput.addEventListener("change",()=>{const file=el.quickPhotoInput.files?.[0];if(file)analyzePhoto(file,"quick")});
    $("ocrModalClose").addEventListener("click",()=>closeModal(el.ocrModal)); $("ocrRetryBtn").addEventListener("click",()=>{closeModal(el.ocrModal);requestPhoto(ocrMode)}); $("ocrErrorRetryBtn").addEventListener("click",()=>{closeModal(el.ocrModal);requestPhoto(ocrMode)}); $("ocrConfirmBtn").addEventListener("click",confirmOcr);

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
  init();
})();
