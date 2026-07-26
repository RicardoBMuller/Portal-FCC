(() => {
  "use strict";

  const OCR_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
  const OCR_MAX_UPLOAD_BYTES = 900 * 1024;
  const OCR_DIMENSION_STEPS = [1800, 1500, 1250, 1050, 900];
  const OCR_QUALITY_STEPS = [0.82, 0.76, 0.70, 0.64, 0.58];

  const $ = (id) => document.getElementById(id);
  const qa = (selector) => [...document.querySelectorAll(selector)];

  const el = {
    intro: $("introScreen"),
    views: qa(".view"),
    projectsView: $("projectsView"), projectView: $("projectView"), directoryView: $("directoryView"),
    projectGrid: $("projectGrid"), projectsStatus: $("projectsStatus"), projectsEmpty: $("projectsEmpty"),
    projectTitle: $("projectTitle"), projectCrumb: $("projectCrumb"), directoryGrid: $("directoryGrid"), directoriesEmpty: $("directoriesEmpty"),
    directoryTitle: $("directoryTitle"), directoryCrumb: $("directoryCrumb"), directoryProjectLabel: $("directoryProjectLabel"), directoryPeriodBadge: $("directoryPeriodBadge"),
    menuDrawer: $("menuDrawer"), menuProjectLabel: $("menuProjectLabel"), menuDirectoryLabel: $("menuDirectoryLabel"),
    menuProjectBtn: $("menuProjectBtn"), menuCalculatorBtn: $("menuCalculatorBtn"), menuRoomsBtn: $("menuRoomsBtn"), menuChecklistBtn: $("menuChecklistBtn"),
    projectModal: $("projectModal"), projectModalValidation: $("projectModalValidation"), newProjectName: $("newProjectName"), directoryRowList: $("directoryRowList"),
    directoryModal: $("directoryModal"), singleDirectoryName: $("singleDirectoryName"), singleDirectoryPeriod: $("singleDirectoryPeriod"), directoryModalValidation: $("directoryModalValidation"),
    sections: qa(".directory-section"), sectionTabs: qa(".section-tab"),
    photoInput: $("examPhotoInput"),
    manualForm: $("manualForm"), manualStart: $("manualStart"), manualDurationHours: $("manualDurationHours"), manualDurationMinutes: $("manualDurationMinutes"), manualMinimumHours: $("manualMinimumHours"), manualMinimumMinutes: $("manualMinimumMinutes"), manualValidation: $("manualValidation"),
    roomsStatus: $("roomsStatus"), roomsGrid: $("roomsGrid"), roomsEmpty: $("roomsEmpty"), roomsRoot: $("roomsRoot"), roomDetail: $("roomDetail"), roomCrumb: $("roomCrumb"), roomTitle: $("roomTitle"), roomMeta: $("roomMeta"), roomRecords: $("roomRecords"),
    check1: $("check1"), check2: $("check2"), check3: $("check3"), check4: $("check4"), checkComments: $("checkComments"), checklistStatus: $("checklistStatus"),
    ocrModal: $("ocrModal"), ocrLoading: $("ocrLoading"), ocrConfirm: $("ocrConfirm"), ocrError: $("ocrError"), ocrPreview: $("ocrPreview"), ocrRoom: $("ocrRoom"), ocrModules: $("ocrModules"), ocrStart: $("ocrStart"), ocrDuration: $("ocrDuration"), ocrMinimum: $("ocrMinimum"), ocrQuality: $("ocrQuality"), ocrRawText: $("ocrRawText"), ocrValidation: $("ocrValidation"), ocrErrorText: $("ocrErrorText"),
    resultModal: $("resultModal"), resultEnd: $("resultEnd"), resultStart: $("resultStart"), resultDuration: $("resultDuration"), resultMinimum: $("resultMinimum"), resultMinimumExit: $("resultMinimumExit"), savedMeta: $("savedMeta"), savedRoom: $("savedRoom"), savedModules: $("savedModules"),
    toast: $("toast"), toastText: $("toastText")
  };

  let currentProject = null;
  let currentDirectory = null;
  let currentSection = "calculator";
  let roomsCache = [];
  let toastTimer = null;

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
  function splitModules(value) { return String(value || "").split(/[,;/\n]+/).map(v => v.trim()).filter(Boolean); }

  function showToast(message) {
    el.toastText.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);
  }

  function showView(id) {
    el.views.forEach(view => view.classList.toggle("active", view.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openModal(node) {
    node.classList.add("open");
    node.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }
  function closeModal(node) {
    node.classList.remove("open");
    node.setAttribute("aria-hidden", "true");
    if (![el.projectModal, el.directoryModal, el.ocrModal, el.resultModal].some(m => m.classList.contains("open"))) document.body.classList.remove("modal-open");
  }

  function getSupabaseConfig() {
    const cfg = window.FCC_CONFIG || {};
    const url = String(cfg.SUPABASE_URL || "").trim().replace(/\/$/, "");
    const key = String(cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_ANON_KEY || "").trim();
    return { url, key, configured: Boolean(url && key && !url.includes("COLE_AQUI") && !key.includes("COLE_AQUI")) };
  }

  async function supabaseRequest(resource, { method = "GET", body = null, prefer = "" } = {}) {
    const cfg = getSupabaseConfig();
    if (!cfg.configured) throw new Error("Supabase não configurado. Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no config.js.");
    const headers = { apikey: cfg.key, Accept: "application/json" };
    if (cfg.key.startsWith("eyJ")) headers.Authorization = `Bearer ${cfg.key}`;
    if (body !== null) headers["Content-Type"] = "application/json";
    if (prefer) headers.Prefer = prefer;
    const response = await fetch(`${cfg.url}/rest/v1/${resource}`, { method, headers, body: body === null ? undefined : JSON.stringify(body) });
    const text = await response.text();
    let payload = null;
    if (text) { try { payload = JSON.parse(text); } catch { payload = text; } }
    if (!response.ok) throw new Error(payload?.message || payload?.details || payload?.hint || String(payload || `HTTP ${response.status}`));
    return payload;
  }

  // -------------------- PROJETOS / DIRETÓRIOS --------------------
  async function loadProjects() {
    el.projectsStatus.innerHTML = "<span></span> Sincronizando com o Supabase...";
    try {
      const params = new URLSearchParams({ select: "id,name,slug,created_at", order: "created_at.desc" });
      const projects = await supabaseRequest(`fcc_projects?${params}`);
      renderProjects(Array.isArray(projects) ? projects : []);
      el.projectsStatus.innerHTML = "<span></span> Projetos sincronizados";
    } catch (error) {
      el.projectGrid.innerHTML = "";
      el.projectsEmpty.classList.add("hidden");
      el.projectsStatus.textContent = `Supabase: ${error.message}`;
    }
  }

  function renderProjects(projects) {
    el.projectGrid.innerHTML = "";
    el.projectsEmpty.classList.toggle("hidden", projects.length > 0);
    projects.forEach(project => {
      const btn = document.createElement("button");
      btn.className = "project-card"; btn.type = "button";
      btn.innerHTML = `<span class="folder">▰</span><h3>${escapeHtml(project.name)}</h3><p>Abrir diretórios do projeto</p>`;
      btn.addEventListener("click", () => openProject(project));
      el.projectGrid.appendChild(btn);
    });
  }

  function resetProjectModal() {
    el.newProjectName.value = "";
    el.projectModalValidation.textContent = "";
    el.directoryRowList.innerHTML = "";
    addDirectoryRow("", "manha");
    addDirectoryRow("", "tarde");
  }

  function addDirectoryRow(name = "", period = "manha") {
    const row = document.createElement("div");
    row.className = "directory-create-row";
    row.innerHTML = `
      <label><span>Nome do diretório</span><input class="dir-row-name" maxlength="100" placeholder="Ex.: Diretório ${el.directoryRowList.children.length + 1}" value="${escapeHtml(name)}"></label>
      <label><span>Período</span><select class="dir-row-period"><option value="manha"${period === "manha" ? " selected" : ""}>Manhã</option><option value="tarde"${period === "tarde" ? " selected" : ""}>Tarde</option></select></label>
      <button class="row-remove-btn" type="button" title="Remover">×</button>`;
    row.querySelector(".row-remove-btn").addEventListener("click", () => {
      if (el.directoryRowList.children.length <= 1) return showToast("Mantenha pelo menos um diretório.");
      row.remove();
    });
    el.directoryRowList.appendChild(row);
  }

  async function createProjectWithDirectories() {
    const name = el.newProjectName.value.trim();
    const rows = [...el.directoryRowList.querySelectorAll(".directory-create-row")].map(row => ({
      name: row.querySelector(".dir-row-name").value.trim(),
      period: row.querySelector(".dir-row-period").value
    }));
    if (name.length < 2) return void (el.projectModalValidation.textContent = "Informe o nome do projeto.");
    if (!rows.length || rows.some(row => row.name.length < 1)) return void (el.projectModalValidation.textContent = "Preencha o nome de todos os diretórios.");
    const normalizedNames = rows.map(row => row.name.toLocaleLowerCase("pt-BR"));
    if (new Set(normalizedNames).size !== normalizedNames.length) return void (el.projectModalValidation.textContent = "Use nomes diferentes para os diretórios do mesmo projeto.");
    el.projectModalValidation.textContent = "Criando projeto...";
    try {
      const created = await supabaseRequest("fcc_projects", { method: "POST", body: { name, slug: slugify(name) }, prefer: "return=representation" });
      const project = Array.isArray(created) ? created[0] : created;
      if (!project?.id) throw new Error("O Supabase não retornou o projeto criado.");
      const payload = rows.map((row, index) => ({ project_id: project.id, name: row.name, period: row.period, sort_order: index + 1 }));
      await supabaseRequest("fcc_directories", { method: "POST", body: payload, prefer: "return=representation" });
      closeModal(el.projectModal);
      showToast("Projeto criado.");
      await loadProjects();
      openProject(project);
    } catch (error) { el.projectModalValidation.textContent = `Erro: ${error.message}`; }
  }

  async function openProject(project) {
    currentProject = project; currentDirectory = null;
    updateMenuContext();
    el.projectTitle.textContent = project.name; el.projectCrumb.textContent = project.name;
    showView("projectView");
    await loadDirectories();
  }

  async function loadDirectories() {
    if (!currentProject) return;
    try {
      const params = new URLSearchParams({ select: "id,project_id,name,period,sort_order,created_at", project_id: `eq.${currentProject.id}`, order: "sort_order.asc,created_at.asc" });
      const dirs = await supabaseRequest(`fcc_directories?${params}`);
      renderDirectories(Array.isArray(dirs) ? dirs : []);
    } catch (error) {
      el.directoryGrid.innerHTML = `<div class="status-line">Erro ao carregar diretórios: ${escapeHtml(error.message)}</div>`;
    }
  }

  function renderDirectories(dirs) {
    el.directoryGrid.innerHTML = "";
    el.directoriesEmpty.classList.toggle("hidden", dirs.length > 0);
    dirs.forEach(dir => {
      const btn = document.createElement("button"); btn.className = "directory-card"; btn.type = "button";
      btn.innerHTML = `<span class="folder">📁</span><h3>${escapeHtml(dir.name)}</h3><p>Abrir OCR, salas e checklist</p><span class="period-badge">${periodLabel(dir.period)}</span>`;
      btn.addEventListener("click", () => openDirectory(dir));
      el.directoryGrid.appendChild(btn);
    });
  }

  async function createSingleDirectory() {
    const name = el.singleDirectoryName.value.trim(); const period = el.singleDirectoryPeriod.value;
    if (!currentProject) return;
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
    currentSection = section;
    el.sectionTabs.forEach(tab => tab.classList.toggle("active", tab.dataset.section === section));
    el.sections.forEach(node => node.classList.toggle("active", node.id === `${section}Section`));
    if (section === "rooms") loadRooms();
    if (section === "checklist") loadChecklist();
  }

  // -------------------- MENU --------------------
  function updateMenuContext() {
    el.menuProjectLabel.textContent = currentProject?.name || "Nenhum selecionado";
    el.menuDirectoryLabel.textContent = currentDirectory ? `${currentDirectory.name} • ${periodLabel(currentDirectory.period)}` : "Nenhum selecionado";
    el.menuProjectBtn.disabled = !currentProject;
    [el.menuCalculatorBtn, el.menuRoomsBtn, el.menuChecklistBtn].forEach(btn => btn.disabled = !currentDirectory);
  }
  function openMenu() { el.menuDrawer.classList.add("open"); el.menuDrawer.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); }
  function closeMenu() { el.menuDrawer.classList.remove("open"); el.menuDrawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open"); }

  // -------------------- TEMPO / RESULTADO --------------------
  function parseClock(value) { const m = String(value || "").match(/^(\d{2}):(\d{2})$/); if (!m) return null; const h = +m[1], min = +m[2]; return h <= 23 && min <= 59 ? h * 60 + min : null; }
  function formatClock(total) { const n = ((total % 1440) + 1440) % 1440; return `${String(Math.floor(n / 60)).padStart(2,"0")}:${String(n % 60).padStart(2,"0")}`; }
  function formatDurationClock(total) { return `${String(Math.floor(total / 60)).padStart(2,"0")}:${String(total % 60).padStart(2,"0")}`; }
  function getPairMinutes(hInput, mInput, allowZero = true) {
    const h = Number(String(hInput.value).replace(/\D/g, "")); const m = Number(String(mInput.value).replace(/\D/g, ""));
    if (!Number.isInteger(h) || !Number.isInteger(m) || m > 59) return null;
    const total = h * 60 + m; if (total > 720 || (!allowZero && total < 1)) return null; return total;
  }
  function calculateResult(start, duration, minimum) {
    const startMin = parseClock(start); if (startMin === null || duration < 1) return null;
    return { start, duration, minimum, end: formatClock(startMin + duration), endNextDay: startMin + duration >= 1440, minimumExit: formatClock(startMin + minimum), minimumNextDay: startMin + minimum >= 1440 };
  }
  function showResult(result, saved = null) {
    el.resultEnd.textContent = result.end; el.resultStart.textContent = result.start; el.resultDuration.textContent = formatDurationClock(result.duration); el.resultMinimum.textContent = formatDurationClock(result.minimum); el.resultMinimumExit.textContent = result.minimumExit;
    el.savedMeta.classList.toggle("hidden", !saved);
    if (saved) { el.savedRoom.textContent = `Sala ${saved.room}`; el.savedModules.textContent = `Módulo(s): ${saved.modules}`; }
    openModal(el.resultModal);
  }
  function resetManual() { el.manualStart.value = "00:00"; el.manualDurationHours.value = "00"; el.manualDurationMinutes.value = "00"; el.manualMinimumHours.value = "00"; el.manualMinimumMinutes.value = "00"; el.manualValidation.textContent = ""; }
  function manualSubmit(event) {
    event.preventDefault(); const duration = getPairMinutes(el.manualDurationHours, el.manualDurationMinutes, false); const minimum = getPairMinutes(el.manualMinimumHours, el.manualMinimumMinutes, true);
    if (duration === null) return void (el.manualValidation.textContent = "Informe uma duração maior que 00:00.");
    if (minimum === null) return void (el.manualValidation.textContent = "Permanência mínima inválida.");
    const result = calculateResult(el.manualStart.value, duration, minimum); if (!result) return void (el.manualValidation.textContent = "Confira o horário de início.");
    el.manualValidation.textContent = ""; showResult(result, null);
  }

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
    if (!currentDirectory) return;
    el.roomsStatus.textContent = "Sincronizando salas...";
    try {
      const rp = new URLSearchParams({ select: "id,directory_id,room_code,created_at", directory_id: `eq.${currentDirectory.id}`, order: "room_code.asc" });
      const rooms = await supabaseRequest(`fcc_directory_rooms?${rp}`);
      const list = Array.isArray(rooms) ? rooms : [];
      for (const room of list) {
        const cp = new URLSearchParams({ select: "*", room_id: `eq.${room.id}`, order: "captured_at.asc" });
        room.cards = await supabaseRequest(`fcc_directory_exam_cards?${cp}`) || [];
      }
      roomsCache = list; renderRooms(); el.roomsStatus.textContent = `Atualizado agora • ${currentDirectory.name}`;
    } catch (error) { el.roomsStatus.textContent = `Erro: ${error.message}`; }
  }
  function renderRooms() {
    el.roomsGrid.innerHTML = ""; el.roomsEmpty.classList.toggle("hidden", roomsCache.length > 0); el.roomsRoot.classList.remove("hidden"); el.roomDetail.classList.add("hidden");
    roomsCache.forEach(room => {
      const btn = document.createElement("button"); btn.className = "room-folder"; btn.type = "button";
      btn.innerHTML = `<span class="folder">📁</span><h3>Sala ${escapeHtml(room.room_code)}</h3><p>${room.cards.length} ${room.cards.length === 1 ? "registro" : "registros"}</p>`;
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
    if (!currentDirectory) return;
    el.checklistStatus.textContent = "Carregando checklist...";
    try {
      const params = new URLSearchParams({ select: "*", directory_id: `eq.${currentDirectory.id}`, limit: "1" });
      const data = await supabaseRequest(`fcc_directory_checklists?${params}`); const row = Array.isArray(data) ? data[0] : null;
      el.check1.checked = Boolean(row?.item1); el.check2.checked = Boolean(row?.item2); el.check3.checked = Boolean(row?.item3); el.check4.checked = Boolean(row?.item4); el.checkComments.value = row?.comments || "";
      el.checklistStatus.textContent = row ? "Checklist sincronizado" : "Checklist ainda não salvo";
    } catch (error) { el.checklistStatus.textContent = `Erro: ${error.message}`; }
  }
  async function saveChecklist() {
    if (!currentDirectory) return;
    el.checklistStatus.textContent = "Salvando...";
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
  function requestPhoto() { if (!currentDirectory) return showToast("Abra um diretório primeiro."); el.photoInput.value = ""; el.photoInput.click(); }
  function setOcrState(state) { el.ocrLoading.classList.toggle("hidden", state !== "loading"); el.ocrConfirm.classList.toggle("hidden", state !== "confirm"); el.ocrError.classList.toggle("hidden", state !== "error"); }
  async function loadImageSource(file) {
    if (!file || !file.type.startsWith("image/")) throw new Error("Imagem inválida."); if (file.size > OCR_MAX_SOURCE_BYTES) throw new Error("A foto original é muito grande.");
    if ("createImageBitmap" in window) {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close?.() };
      } catch {
        const bitmap = await createImageBitmap(file);
        return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close?.() };
      }
    }
    const url = URL.createObjectURL(file); const image = await new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=()=>reject(new Error("Não foi possível abrir a foto.")); img.src=url; });
    return { source:image,width:image.naturalWidth,height:image.naturalHeight,cleanup:()=>URL.revokeObjectURL(url) };
  }
  function canvasBlob(canvas, quality) { return new Promise(resolve => canvas.toBlob(resolve,"image/jpeg",quality)); }
  function blobDataUrl(blob) { return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("Falha ao criar prévia."));r.readAsDataURL(blob);}); }
  async function prepareImage(file) {
    const loaded = await loadImageSource(file); let best = null;
    try {
      for (let i=0;i<OCR_DIMENSION_STEPS.length;i++) { const max=OCR_DIMENSION_STEPS[i],scale=Math.min(1,max/Math.max(loaded.width,loaded.height)); const w=Math.round(loaded.width*scale),h=Math.round(loaded.height*scale); const c=document.createElement("canvas");c.width=w;c.height=h;const ctx=c.getContext("2d",{alpha:false});ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);ctx.drawImage(loaded.source,0,0,w,h); best=await canvasBlob(c,OCR_QUALITY_STEPS[i]); if(best?.size<=OCR_MAX_UPLOAD_BYTES) break; }
      if(!best || best.size>OCR_MAX_UPLOAD_BYTES) throw new Error("A foto ficou acima do limite. Aproxime o cartão e tente novamente.");
      return { blob:best, preview:await blobDataUrl(best) };
    } finally { loaded.cleanup(); }
  }
  async function callOcr(blob) {
    const cfg=getOcrConfig(); if(!cfg.configured) throw new Error("OCR.Space não configurado no config.js.");
    const fd=new FormData(); fd.append("file",blob,"cartao-fcc.jpg");fd.append("apikey",cfg.key);fd.append("OCREngine",cfg.engine);fd.append("language","auto");fd.append("isOverlayRequired","false");fd.append("detectOrientation","true");fd.append("scale","true");fd.append("isTable","true");
    const response=await fetch(cfg.endpoint,{method:"POST",body:fd}); const payload=await response.json().catch(()=>null); if(!response.ok) throw new Error(`OCR.Space HTTP ${response.status}`); if(!payload) throw new Error("Resposta inválida do OCR.Space."); if(payload.IsErroredOnProcessing) throw new Error(Array.isArray(payload.ErrorMessage)?payload.ErrorMessage.join(" • "):payload.ErrorMessage||"Falha no OCR.");
    const text=(payload.ParsedResults||[]).map(r=>String(r?.ParsedText||"").trim()).filter(Boolean).join("\n"); if(!text) throw new Error("Nenhum texto legível encontrado."); return text;
  }
  function cleanOcrLine(v){return String(v||"").replace(/[|_*#`]/g," ").replace(/\s+/g," ").trim()}
  function normalizeOcrDigits(v){return String(v||"").replace(/[Oo]/g,"0").replace(/[Il|]/g,"1")}
  function normalizeAiClock(v){let t=String(v||"").trim().toLowerCase().replace(/\s/g,"").replace(/[h\.]/g,":");const m=t.match(/^(\d{1,2}):(\d{2})$/);if(!m)return"";const h=+m[1],mi=+m[2];return h<=23&&mi<=59?`${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`:""}
  function durationStringToMinutes(v){let t=String(v||"").trim().toLowerCase().replace(/\s/g,"");if(!t)return null;const colon=t.match(/^(\d{1,2}):(\d{2})$/);if(colon){const total=+colon[1]*60 + +colon[2];return +colon[2]<=59&&total>=0&&total<=720?total:null}const hp=t.match(/^(\d{1,2})h(?:(\d{1,2}))?$/);if(hp){const total=+hp[1]*60+(+hp[2]||0);return (+hp[2]||0)<=59&&total>=0&&total<=720?total:null}return null}
  function findTimeToken(text,{duration=false}={}){const src=String(text||"");const pattern=/(?:^|[^A-Za-zÀ-ÿ0-9])([0-9OoIl|]{1,2})\s*(?:h|H|:|\.|;)\s*([0-9OoIl|]{1,2})(?![A-Za-zÀ-ÿ0-9])/g;let m;while((m=pattern.exec(src))){const h=+normalizeOcrDigits(m[1]),mi=+normalizeOcrDigits(m[2]);if(mi>59)continue;if(duration){const total=h*60+mi;if(total>=0&&total<=720)return formatDurationClock(total)}else if(h<=23)return`${String(h).padStart(2,"0")}:${String(mi).padStart(2,"0")}`}return""}
  function isDifferentFieldLabel(line,expected){const s=stripDiacritics(line).toLowerCase();const known=/duracao|inicio|termino|fim|encerramento|permanencia|minima|sala|modulo/.test(s);return known&&!expected.test(s)}
  function findValueNearLabel(lines,label,{duration=false,lookAhead=2}={}){for(let i=0;i<lines.length;i++){const s=stripDiacritics(lines[i]).toLowerCase();if(!label.test(s))continue;const d=findTimeToken(lines[i],{duration});if(d)return{value:d,anchored:true};for(let o=1;o<=lookAhead&&i+o<lines.length;o++){if(isDifferentFieldLabel(lines[i+o],label))break;const v=findTimeToken(lines[i+o],{duration});if(v)return{value:v,anchored:true}}}return{value:"",anchored:false}}
  function findTextAfterLabel(lines,label,kind){for(let i=0;i<lines.length;i++){if(!label.test(stripDiacritics(lines[i]).toLowerCase()))continue;for(let o=0;o<=1&&i+o<lines.length;o++){let c=cleanOcrLine(lines[i+o]);if(o===0){const pos=c.indexOf(":");c=pos>=0?c.slice(pos+1).trim():c.replace(/m[oó]dulo(?:\(s\))?s?/i,"").replace(/sala/i,"").replace(/^\s*[-–—:]\s*/,"").trim()}if(!c)continue;if(kind==="room"){c=c.replace(/\b(?:m[oó]dulo|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i,"").trim();const m=c.match(/\b([A-Za-z0-9][A-Za-z0-9._-]{0,19})\b/);if(m)return{value:normalizeRoomCode(m[1]),anchored:true}}else{c=c.replace(/\b(?:sala|dura[cç][aã]o|in[ií]cio|t[eé]rmino|perman[eê]ncia)\b.*$/i,"").trim();const nums=c.match(/\b\d{3,}\b/g);if(nums?.length)return{value:normalizeModulesText([...new Set(nums)].join(", ")),anchored:true}}}}return{value:"",anchored:false}}
  function parseOcr(raw){const lines=String(raw||"").split(/\r?\n/).map(cleanOcrLine).filter(Boolean);const dur=findValueNearLabel(lines,/duracao(?:\s+da)?\s+prova|duracao/,{duration:true,lookAhead:1});const start=findValueNearLabel(lines,/\binicio\b/,{duration:false,lookAhead:1});const min=findValueNearLabel(lines,/permanencia(?:\s+minima)?|minima/,{duration:true,lookAhead:1});const room=findTextAfterLabel(lines,/\bsala\b/,"room");const modules=findTextAfterLabel(lines,/modulo(?:\(s\))?s?/,"modules");let inicio=normalizeAiClock(start.value),duration=durationStringToMinutes(dur.value),minimum=durationStringToMinutes(min.value);const found=[inicio,duration!==null,room.value,modules.value].filter(Boolean).length;return{room:normalizeRoomCode(room.value),modules:normalizeModulesText(modules.value),start:inicio,duration:duration===null?"":formatDurationClock(duration),minimum:minimum===null?"":formatDurationClock(minimum),quality:found===4&&start.anchored&&dur.anchored&&room.anchored&&modules.anchored?"Alta":found>=3?"Média":"Baixa",raw};}
  async function analyzePhoto(file){openModal(el.ocrModal);setOcrState("loading");try{const img=await prepareImage(file);el.ocrPreview.src=img.preview;const raw=await callOcr(img.blob);const data=parseOcr(raw);el.ocrRoom.value=data.room;el.ocrModules.value=data.modules;el.ocrStart.value=data.start;el.ocrDuration.value=data.duration;el.ocrMinimum.value=data.minimum;el.ocrQuality.textContent=data.quality;el.ocrRawText.textContent=raw;el.ocrValidation.textContent="";setOcrState("confirm")}catch(error){el.ocrErrorText.textContent=error.message;setOcrState("error")}}
  async function confirmOcr(){const room=normalizeRoomCode(el.ocrRoom.value),modules=normalizeModulesText(el.ocrModules.value),start=normalizeAiClock(el.ocrStart.value),duration=durationStringToMinutes(el.ocrDuration.value),minimum=durationStringToMinutes(el.ocrMinimum.value);if(!room)return void(el.ocrValidation.textContent="Informe a sala.");if(!modules)return void(el.ocrValidation.textContent="Informe o(s) módulo(s).");if(!start)return void(el.ocrValidation.textContent="Informe um horário de início válido.");if(duration===null||duration<1)return void(el.ocrValidation.textContent="Informe uma duração válida maior que 00:00.");if(minimum===null)return void(el.ocrValidation.textContent="Informe uma permanência mínima válida.");const result=calculateResult(start,duration,minimum);el.ocrValidation.textContent="Salvando no Supabase...";try{const roomRow=await ensureRoom(room);await saveExamCard(roomRow,{room,modules,start,duration,minimum},result);closeModal(el.ocrModal);showResult(result,{room,modules});await loadRooms();}catch(error){el.ocrValidation.textContent=`Erro ao salvar: ${error.message}`}}

  // -------------------- EVENTOS --------------------
  function bindEvents() {
    $("newProjectBtn").addEventListener("click",()=>{resetProjectModal();openModal(el.projectModal)}); $("emptyNewProjectBtn").addEventListener("click",()=>{resetProjectModal();openModal(el.projectModal)}); $("projectModalClose").addEventListener("click",()=>closeModal(el.projectModal)); $("addDirectoryRowBtn").addEventListener("click",()=>addDirectoryRow()); $("createProjectConfirmBtn").addEventListener("click",createProjectWithDirectories);
    $("addDirectoryBtn").addEventListener("click",()=>{el.singleDirectoryName.value="";el.singleDirectoryPeriod.value="manha";el.directoryModalValidation.textContent="";openModal(el.directoryModal)}); $("directoryModalClose").addEventListener("click",()=>closeModal(el.directoryModal)); $("createDirectoryConfirmBtn").addEventListener("click",createSingleDirectory);
    $("backProjectsBtn").addEventListener("click",()=>showView("projectsView")); $("dirHomeBtn").addEventListener("click",()=>showView("projectsView")); $("dirProjectBtn").addEventListener("click",()=>showView("projectView"));
    el.sectionTabs.forEach(tab=>tab.addEventListener("click",()=>switchSection(tab.dataset.section)));
    $("takePhotoBtn").addEventListener("click",requestPhoto); $("roomsCaptureBtn").addEventListener("click",requestPhoto); el.photoInput.addEventListener("change",()=>{const file=el.photoInput.files?.[0];if(file)analyzePhoto(file)}); $("ocrModalClose").addEventListener("click",()=>closeModal(el.ocrModal)); $("ocrRetryBtn").addEventListener("click",()=>{closeModal(el.ocrModal);requestPhoto()}); $("ocrErrorRetryBtn").addEventListener("click",()=>{closeModal(el.ocrModal);requestPhoto()}); $("ocrConfirmBtn").addEventListener("click",confirmOcr);
    el.manualForm.addEventListener("submit",manualSubmit); $("manualResetBtn").addEventListener("click",resetManual);
    $("refreshRoomsBtn").addEventListener("click",loadRooms); $("backRoomsBtn").addEventListener("click",renderRooms); $("saveChecklistBtn").addEventListener("click",saveChecklist);
    $("resultCloseBtn").addEventListener("click",()=>closeModal(el.resultModal)); $("resultOkBtn").addEventListener("click",()=>closeModal(el.resultModal));
    $("menuOpenBtn").addEventListener("click",openMenu); $("menuCloseBtn").addEventListener("click",closeMenu); $("menuBackdrop").addEventListener("click",closeMenu);
    $("menuHomeBtn").addEventListener("click",()=>{closeMenu();showView("projectsView");loadProjects()}); el.menuProjectBtn.addEventListener("click",()=>{if(!currentProject)return;closeMenu();showView("projectView");loadDirectories()}); el.menuCalculatorBtn.addEventListener("click",()=>{if(!currentDirectory)return;closeMenu();openDirectory(currentDirectory,"calculator")}); el.menuRoomsBtn.addEventListener("click",()=>{if(!currentDirectory)return;closeMenu();openDirectory(currentDirectory,"rooms")}); el.menuChecklistBtn.addEventListener("click",()=>{if(!currentDirectory)return;closeMenu();openDirectory(currentDirectory,"checklist")});
    qa(".modal-backdrop[data-close]").forEach(backdrop=>backdrop.addEventListener("click",()=>closeModal($(backdrop.dataset.close))));
    [el.manualDurationHours,el.manualDurationMinutes,el.manualMinimumHours,el.manualMinimumMinutes].forEach(input=>input.addEventListener("input",()=>{input.value=input.value.replace(/\D/g,"").slice(0,2)}));
  }

  function init() {
    bindEvents(); updateMenuContext(); resetManual(); loadProjects();
    setTimeout(()=>{document.body.classList.remove("intro-playing"); if(el.intro) el.intro.style.display="none";},4100);
  }
  init();
})();
