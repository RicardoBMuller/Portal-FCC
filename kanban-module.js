(() => {
  "use strict";

  const COLUMN_LABELS = { todo: "A Fazer", doing: "Em Progresso", done: "Concluído" };
  const PRIORITY_LABELS = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
  const ATTACHMENT_BUCKET = "fcc-kanban-attachments";
  const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;
  const $ = (id) => document.getElementById(id);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const el = {
    view: $("kanbanView"), back: $("kanbanBackBtn"), home: $("kanbanHomeBtn"), dock: $("dockKanbanBtn"),
    picker: $("kanbanProjectPicker"), projectList: $("kanbanProjectList"), projectsEmpty: $("kanbanProjectsEmpty"),
    workspace: $("kanbanWorkspace"), changeProject: $("kanbanChangeProjectBtn"), newCard: $("kanbanNewCardBtn"),
    projectTitle: $("kanbanProjectTitle"), projectMeta: $("kanbanProjectMeta"), projectStatus: $("kanbanProjectStatus"),
    progressText: $("kanbanProgressText"), progressBar: $("kanbanProgressBar"),
    lists: { todo: $("kanbanTodoList"), doing: $("kanbanDoingList"), done: $("kanbanDoneList") },
    counts: { todo: $("kanbanTodoCount"), doing: $("kanbanDoingCount"), done: $("kanbanDoneCount") },
    modal: $("kanbanCardModal"), modalClose: $("kanbanCardModalClose"), modalChip: $("kanbanCardModalChip"), modalTitle: $("kanbanCardModalTitle"), modalIntro: $("kanbanCardModalIntro"),
    title: $("kanbanCardTitleInput"), owner: $("kanbanCardOwnerInput"), dueDate: $("kanbanCardDueDateInput"), priority: $("kanbanCardPriorityInput"), column: $("kanbanCardColumnInput"), labels: $("kanbanCardLabelsInput"), description: $("kanbanCardDescriptionInput"),
    participantSearch: $("kanbanParticipantSearchInput"), participantSearchBtn: $("kanbanParticipantSearchBtn"), participantResults: $("kanbanParticipantSearchResults"), selectedParticipants: $("kanbanSelectedParticipants"),
    checklistNew: $("kanbanChecklistNewInput"), checklistAdd: $("kanbanChecklistAddBtn"), checklistList: $("kanbanChecklistList"), checklistCounter: $("kanbanChecklistCounter"),
    commentNew: $("kanbanCommentNewInput"), commentAdd: $("kanbanCommentAddBtn"), commentsList: $("kanbanCommentsList"), commentsCounter: $("kanbanCommentsCounter"),
    attachmentInput: $("kanbanAttachmentInput"), attachmentSelect: $("kanbanAttachmentSelectBtn"), attachmentsList: $("kanbanAttachmentsList"), attachmentsCounter: $("kanbanAttachmentsCounter"),
    validation: $("kanbanCardValidation"), deleteBtn: $("kanbanDeleteCardBtn"), reopenBtn: $("kanbanReopenCardBtn"), cancelBtn: $("kanbanCancelCardBtn"), saveBtn: $("kanbanSaveCardBtn")
  };

  const state = {
    projects: [], project: null, cards: [], editingCard: null, selectedParticipants: [], checklist: [], comments: [], attachments: [], pendingFiles: [], removedPaths: [], realtime: null, reloadTimer: null, dragCardId: null, modalReadOnly: false
  };

  function bridge() {
    if (!window.FCCPortalBridge) throw new Error("O Portal FCC ainda está inicializando.");
    return window.FCCPortalBridge;
  }
  function escapeHtml(value) { return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
  function uid() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2,9)}`; }
  function currentUser() { return bridge().getCurrentUser?.() || null; }
  function currentName() { const user = currentUser(); return String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário"); }
  function currentAvatar() { const user = currentUser(); const v = String(user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""); return /^https:\/\//i.test(v) ? v : ""; }
  function initials(name, email = "") { const parts = String(name || email || "U").trim().split(/\s+/).filter(Boolean); return ((parts[0]?.[0] || "U") + (parts.length > 1 ? parts.at(-1)?.[0] : "")).toUpperCase().slice(0,2); }
  function safeUrl(value) { const v = String(value || "").trim(); return /^https:\/\//i.test(v) ? v : ""; }
  function formatDate(value) { if (!value) return ""; const [y,m,d] = String(value).slice(0,10).split("-"); return y && m && d ? `${d}/${m}/${y}` : ""; }
  function formatDateTime(value) { if (!value) return ""; try { return new Intl.DateTimeFormat("pt-BR", { dateStyle:"short", timeStyle:"short" }).format(new Date(value)); } catch { return ""; } }
  function isOverdue(value, column) { if (!value || column === "done") return false; return new Date(`${value}T23:59:59`) < new Date(); }
  function isProjectClosed() { return state.project?.status === "encerrado"; }
  function isPo() { const ownerId = state.project?.po_user_id || state.project?.created_by; return Boolean(ownerId && currentUser()?.id && ownerId === currentUser().id); }
  function canWrite() { return Boolean(state.project && !isProjectClosed()); }
  function normalizeArray(value) { return Array.isArray(value) ? value : []; }
  function showToast(message) { bridge().showToast?.(message); }

  function openModal() { el.modal.classList.add("open"); el.modal.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open"); }
  function closeModal() { el.modal.classList.remove("open"); el.modal.setAttribute("aria-hidden","true"); if (!document.querySelector(".modal.open")) document.body.classList.remove("modal-open"); }

  async function openKanban() {
    if (!currentUser()) return showToast("Entre com Google para acessar o Kanban.");
    bridge().showView("kanbanView");
    await loadProjects();
    const portalProject = bridge().getCurrentProject?.();
    const available = portalProject && state.projects.find(project => project.id === portalProject.id);
    if (available) await selectProject(available);
    else showProjectPicker();
  }

  function goProjects() {
    unsubscribeRealtime();
    $("navActiveProjectsBtn")?.click();
  }

  async function loadProjects() {
    try {
      state.projects = (await bridge().refreshProjects()).sort((a,b) => {
        const da = new Date(a.project_date || a.created_at || 0).getTime();
        const db = new Date(b.project_date || b.created_at || 0).getTime();
        return db - da;
      });
      renderProjectPicker();
    } catch (error) {
      state.projects = [];
      renderProjectPicker();
      showToast(`Kanban: ${error.message}`);
    }
  }

  function renderProjectPicker() {
    el.projectList.innerHTML = "";
    el.projectsEmpty.classList.toggle("hidden", state.projects.length > 0);
    state.projects.forEach(project => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "kanban-project-option";
      const background = safeUrl(project.background_image_url);
      if (background) button.style.setProperty("--kanban-project-bg", `url(${JSON.stringify(background)})`);
      button.innerHTML = `<span class="kpo-top"><span>${project.status === "encerrado" ? "CONCLUÍDO" : "PROJETO ATIVO"}</span><i>▥</i></span><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.organization_name || project.card_description || "Kanban do projeto")}</small>`;
      button.addEventListener("click", () => selectProject(project));
      el.projectList.appendChild(button);
    });
  }

  function showProjectPicker() {
    state.project = null;
    state.cards = [];
    unsubscribeRealtime();
    el.workspace.classList.add("hidden");
    el.picker.classList.remove("hidden");
    el.newCard.classList.add("hidden");
  }

  async function selectProject(project) {
    state.project = project;
    el.picker.classList.add("hidden");
    el.workspace.classList.remove("hidden");
    el.projectTitle.textContent = project.name;
    el.projectMeta.textContent = `${project.organization_name || "Portal FCC"} • ${project.project_date ? formatDate(project.project_date) : "sem data"}`;
    el.projectStatus.textContent = project.status === "encerrado" ? "CONCLUÍDO" : "ATIVO";
    el.projectStatus.classList.toggle("closed", project.status === "encerrado");
    el.newCard.classList.toggle("hidden", isProjectClosed());
    qa(".kanban-column-add").forEach(btn => btn.disabled = isProjectClosed());
    await loadCards();
    subscribeRealtime();
  }

  async function loadCards({ silent = false } = {}) {
    if (!state.project) return;
    try {
      const rows = await bridge().request(`fcc_kanban_cards?project_id=eq.${encodeURIComponent(state.project.id)}&order=column_key.asc,position.asc,created_at.asc`);
      state.cards = Array.isArray(rows) ? rows : [];
      renderBoard();
    } catch (error) {
      if (!silent) showToast(`Kanban: ${error.message}`);
    }
  }

  function subscribeRealtime() {
    unsubscribeRealtime();
    const client = bridge().getClient?.();
    if (!client || !state.project) return;
    state.realtime = client.channel(`fcc-kanban-${state.project.id}`)
      .on("postgres_changes", { event:"*", schema:"public", table:"fcc_kanban_cards", filter:`project_id=eq.${state.project.id}` }, () => {
        clearTimeout(state.reloadTimer);
        state.reloadTimer = setTimeout(() => loadCards({ silent:true }), 180);
      }).subscribe();
  }
  function unsubscribeRealtime() {
    clearTimeout(state.reloadTimer);
    const client = bridge().getClient?.();
    if (state.realtime && client) client.removeChannel(state.realtime);
    state.realtime = null;
  }

  function participantAvatar(person, className = "kanban-card-person") {
    const avatar = safeUrl(person?.avatar_url);
    const label = person?.full_name || person?.email || "Usuário";
    return avatar ? `<span class="${className}" title="${escapeHtml(label)}"><img src="${escapeHtml(avatar)}" alt=""></span>` : `<span class="${className}" title="${escapeHtml(label)}">${escapeHtml(initials(label, person?.email))}</span>`;
  }

  function cardElement(card) {
    const button = document.createElement("article");
    const isDone = card.column_key === "done";
    const isReopened = Boolean(card.is_reopened) && !isDone;
    button.className = `kanban-task-card${isDone ? " completed" : ""}${isReopened ? " reopened" : ""}`;
    button.draggable = canWrite();
    button.dataset.cardId = card.id;

    const labels = normalizeArray(card.labels).slice(0, 5);
    const participants = normalizeArray(card.participants).slice(0, 5);
    const checklist = normalizeArray(card.checklist);
    const done = checklist.filter(item => item.done).length;
    const progress = checklist.length ? Math.round(done / checklist.length * 100) : 0;
    const comments = normalizeArray(card.comments).length;
    const attachments = normalizeArray(card.attachments).length;
    const dueText = formatDate(card.due_date);
    const includedText = formatDate(card.created_at);
    const ownerText = String(card.owner_name || "").trim();
    const statusBadge = isDone
      ? '<span class="kanban-card-status completed">Concluído</span>'
      : isReopened
        ? '<span class="kanban-card-status reopened">Reaberto</span>'
        : '';

    const checklistPreview = checklist.length ? `
      <section class="kanban-card-checklist-preview">
        <div class="kanban-card-checklist-head"><strong>Checklist</strong><span>${done}/${checklist.length}</span></div>
        <div class="kanban-card-checklist-items">
          ${checklist.slice(0, 3).map(item => `
            <div class="kanban-card-check-item${item.done ? " done" : ""}">
              <i></i><span>${escapeHtml(item.text || "Item")}</span>
            </div>`).join("")}
        </div>
        <div class="kanban-card-progress"><div class="kanban-card-progress-track"><i style="width:${progress}%"></i></div><small>${progress}%</small></div>
      </section>` : '';

    button.innerHTML = `
      ${isReopened ? '<span class="kanban-reopened-watermark" aria-hidden="true">REABERTO</span>' : ''}
      <div class="kanban-card-topline">
        <span class="kanban-card-priority ${escapeHtml(card.priority || "media")}">${escapeHtml(PRIORITY_LABELS[card.priority] || "Média")}</span>
        ${statusBadge}
      </div>
      <h4>${escapeHtml(card.title || "Sem título")}</h4>
      <p class="kanban-task-description">${escapeHtml(card.description || "Sem descrição.")}</p>
      ${labels.length ? `<div class="kanban-card-labels">${labels.map(label => `<span>${escapeHtml(label)}</span>`).join("")}</div>` : ""}
      <div class="kanban-card-info-chips">
        ${ownerText ? `<span>👤 ${escapeHtml(ownerText)}</span>` : ""}
        ${dueText ? `<span class="${isOverdue(card.due_date, card.column_key) ? "overdue" : ""}">Prazo: ${escapeHtml(dueText)}</span>` : ""}
        ${includedText ? `<span>Incluído: ${escapeHtml(includedText)}</span>` : ""}
      </div>
      ${checklistPreview}
      <footer class="kanban-card-footer">
        <div class="kanban-card-activity">
          <span>💬 ${comments}</span>
          ${attachments ? `<span>📎 ${attachments}</span>` : ""}
        </div>
        <span class="kanban-card-people">${participants.map(person => participantAvatar(person)).join("")}</span>
      </footer>`;

    button.addEventListener("click", event => {
      if (state.dragCardId) return;
      if (event.target.closest("a,button,input")) return;
      openCardModal(card);
    });
    button.addEventListener("dragstart", event => {
      state.dragCardId = card.id;
      button.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.id);
    });
    button.addEventListener("dragend", () => {
      button.classList.remove("dragging");
      setTimeout(() => { state.dragCardId = null; }, 30);
      qa(".kanban-card-list").forEach(list => list.classList.remove("drag-over"));
    });
    return button;
  }

  function renderBoard() {
    Object.keys(el.lists).forEach(column => {
      const cards = state.cards.filter(card => card.column_key === column).sort((a,b) => (a.position || 0) - (b.position || 0));
      el.lists[column].innerHTML = "";
      if (!cards.length) el.lists[column].innerHTML = `<div class="kanban-empty-column">${isProjectClosed() ? "Nenhum card nesta coluna." : "Arraste um card ou toque em ＋ para começar."}</div>`;
      cards.forEach(card => el.lists[column].appendChild(cardElement(card)));
      el.counts[column].textContent = `${cards.length} ${cards.length === 1 ? "card" : "cards"}`;
    });
    const total = state.cards.length;
    const completed = state.cards.filter(card => card.column_key === "done").length;
    const percent = total ? Math.round(completed / total * 100) : 0;
    el.progressText.textContent = `${percent}%`;
    el.progressBar.style.width = `${percent}%`;
  }

  async function moveCard(cardId, targetColumn) {
    if (!canWrite()) return showToast("Projeto concluído: Kanban disponível somente para consulta.");
    const card = state.cards.find(item => item.id === cardId);
    if (!card || card.column_key === targetColumn) return;
    if (targetColumn === "done" && !confirm(`Concluir o card “${card.title}”? Após a conclusão ele ficará bloqueado até ser reaberto.`)) return;
    if (card.column_key === "done" && targetColumn !== "done" && !confirm(`Reabrir o card “${card.title}”?`)) return;
    const targetCards = state.cards.filter(item => item.column_key === targetColumn);
    const body = { column_key: targetColumn, position: targetCards.length };
    if (targetColumn === "done") Object.assign(body, { completed_at:new Date().toISOString(), completed_by:currentUser().id, is_reopened:false });
    else if (card.column_key === "done") Object.assign(body, { completed_at:null, completed_by:null, reopened_at:new Date().toISOString(), reopened_by:currentUser().id, reopened_count:(card.reopened_count || 0) + 1, is_reopened:true });
    try {
      await bridge().request(`fcc_kanban_cards?id=eq.${encodeURIComponent(cardId)}`, { method:"PATCH", body, prefer:"return=minimal" });
      await loadCards({ silent:true });
      showToast(targetColumn === "done" ? "Card concluído." : card.column_key === "done" ? "Card reaberto." : "Card movido.");
    } catch (error) { showToast(error.message); }
  }

  function resetModalState() {
    state.editingCard = null; state.selectedParticipants = []; state.checklist = []; state.comments = []; state.attachments = []; state.pendingFiles = []; state.removedPaths = []; state.modalReadOnly = false;
    el.title.value = ""; el.owner.value = ""; el.dueDate.value = ""; el.priority.value = "media"; el.column.value = "todo"; el.labels.value = ""; el.description.value = ""; el.participantSearch.value = ""; el.participantResults.innerHTML = ""; el.checklistNew.value = ""; el.commentNew.value = ""; el.validation.textContent = "";
  }

  function setModalReadOnly(readOnly) {
    state.modalReadOnly = readOnly;
    [el.title,el.owner,el.dueDate,el.priority,el.column,el.labels,el.description,el.participantSearch,el.checklistNew,el.commentNew].forEach(node => node.disabled = readOnly);
    [el.participantSearchBtn,el.checklistAdd,el.commentAdd,el.attachmentSelect].forEach(node => node.disabled = readOnly);
    el.saveBtn.classList.toggle("hidden", readOnly);
    el.modalIntro.textContent = readOnly ? "Card concluído. Reabra para voltar a editar, movimentar ou anexar documentos." : "Organize a atividade e vincule participantes do Portal FCC.";
  }

  function openNewCard(column = "todo") {
    if (!canWrite()) return showToast("Projeto concluído: não é possível criar cards.");
    resetModalState();
    el.column.value = column;
    el.modalChip.textContent = "NOVO CARD"; el.modalTitle.textContent = "Criar card";
    el.deleteBtn.classList.add("hidden"); el.reopenBtn.classList.add("hidden");
    setModalReadOnly(false); renderModalCollections(); openModal(); setTimeout(()=>el.title.focus(),120);
  }

  function openCardModal(card) {
    resetModalState();
    state.editingCard = structuredClone(card);
    state.selectedParticipants = structuredClone(normalizeArray(card.participants));
    state.checklist = structuredClone(normalizeArray(card.checklist));
    state.comments = structuredClone(normalizeArray(card.comments));
    state.attachments = structuredClone(normalizeArray(card.attachments));
    el.title.value = card.title || ""; el.owner.value = card.owner_name || ""; el.dueDate.value = card.due_date || ""; el.priority.value = card.priority || "media"; el.column.value = card.column_key || "todo"; el.labels.value = normalizeArray(card.labels).join(", "); el.description.value = card.description || "";
    el.modalChip.textContent = card.column_key === "done" ? "CARD CONCLUÍDO" : "EDITAR CARD"; el.modalTitle.textContent = card.title || "Detalhes do card";
    el.deleteBtn.classList.toggle("hidden", !isPo() || isProjectClosed());
    el.reopenBtn.classList.toggle("hidden", card.column_key !== "done" || isProjectClosed());
    setModalReadOnly(card.column_key === "done" || isProjectClosed());
    renderModalCollections(); openModal();
  }

  function renderModalCollections() {
    renderParticipants(); renderChecklist(); renderComments(); renderAttachments();
  }

  function renderParticipants() {
    el.selectedParticipants.innerHTML = state.selectedParticipants.map(person => `<span class="kanban-participant-chip">${participantAvatar(person,"kanban-mini-avatar")}<span>${escapeHtml(person.full_name || person.email)}</span>${state.modalReadOnly ? "" : `<button type="button" data-remove-participant="${escapeHtml(person.id)}">×</button>`}</span>`).join("");
    qa("[data-remove-participant]",el.selectedParticipants).forEach(button => button.addEventListener("click", () => { state.selectedParticipants = state.selectedParticipants.filter(person => person.id !== button.dataset.removeParticipant); renderParticipants(); }));
  }

  async function searchParticipants() {
    const term = el.participantSearch.value.trim();
    if (term.length < 2) return void (el.participantResults.innerHTML = '<small class="kanban-readonly-notice">Digite pelo menos 2 caracteres.</small>');
    el.participantResults.innerHTML = '<small>Buscando...</small>';
    try {
      const rows = await bridge().request("rpc/fcc_search_profiles", { method:"POST", body:{ search_term:term } });
      const selectedIds = new Set(state.selectedParticipants.map(person => person.id));
      const results = (Array.isArray(rows) ? rows : []).filter(person => !selectedIds.has(person.id));
      el.participantResults.innerHTML = results.length ? "" : '<small class="kanban-readonly-notice">Nenhum profissional encontrado.</small>';
      results.forEach(person => {
        const button = document.createElement("button"); button.type = "button"; button.className = "kanban-search-result";
        button.innerHTML = `${participantAvatar(person,"kanban-mini-avatar")}<span><strong>${escapeHtml(person.full_name)}</strong><small>${escapeHtml(person.email)}</small></span>`;
        button.addEventListener("click", () => { state.selectedParticipants.push(person); el.participantResults.innerHTML = ""; el.participantSearch.value = ""; renderParticipants(); });
        el.participantResults.appendChild(button);
      });
    } catch (error) { el.participantResults.innerHTML = `<small class="kanban-readonly-notice">${escapeHtml(error.message)}</small>`; }
  }

  function addChecklistItem() {
    const text = el.checklistNew.value.trim(); if (!text) return;
    state.checklist.push({ id:uid(), text, done:false, created_at:new Date().toISOString() }); el.checklistNew.value = ""; renderChecklist();
  }
  function renderChecklist() {
    const done = state.checklist.filter(item => item.done).length;
    el.checklistCounter.textContent = `${done}/${state.checklist.length}`;
    el.checklistList.innerHTML = state.checklist.length ? "" : '<small class="kanban-readonly-notice">Nenhum item no checklist.</small>';
    state.checklist.forEach(item => {
      const row = document.createElement("div"); row.className = "kanban-list-row";
      row.innerHTML = `<input type="checkbox" ${item.done ? "checked" : ""} ${state.modalReadOnly ? "disabled" : ""}><div class="kanban-row-copy"><strong>${escapeHtml(item.text)}</strong></div>${state.modalReadOnly ? "" : '<button class="kanban-row-remove" type="button">×</button>'}`;
      row.querySelector("input")?.addEventListener("change", event => { item.done = event.target.checked; renderChecklist(); });
      row.querySelector("button")?.addEventListener("click", () => { state.checklist = state.checklist.filter(candidate => candidate.id !== item.id); renderChecklist(); });
      el.checklistList.appendChild(row);
    });
  }

  function addComment() {
    const text = el.commentNew.value.trim(); if (!text) return;
    state.comments.push({ id:uid(), text, author_id:currentUser().id, author_name:currentName(), author_avatar_url:currentAvatar(), created_at:new Date().toISOString() }); el.commentNew.value = ""; renderComments();
  }
  function renderComments() {
    el.commentsCounter.textContent = String(state.comments.length);
    el.commentsList.innerHTML = state.comments.length ? "" : '<small class="kanban-readonly-notice">Nenhum comentário.</small>';
    state.comments.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).forEach(comment => {
      const row = document.createElement("div"); row.className = "kanban-list-row kanban-comment-row";
      row.innerHTML = `${participantAvatar({full_name:comment.author_name,avatar_url:comment.author_avatar_url},"kanban-mini-avatar")}<div class="kanban-row-copy"><strong>${escapeHtml(comment.author_name || "Usuário")}</strong><small>${escapeHtml(formatDateTime(comment.created_at))}</small><p>${escapeHtml(comment.text).replace(/\n/g,"<br>")}</p></div>`;
      el.commentsList.appendChild(row);
    });
  }

  function selectAttachmentFiles() { if (!state.modalReadOnly) el.attachmentInput.click(); }
  function handleAttachmentSelection() {
    const files = [...(el.attachmentInput.files || [])]; el.attachmentInput.value = "";
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_SIZE) { showToast(`${file.name}: arquivo maior que 15 MB.`); continue; }
      state.pendingFiles.push(file);
    }
    renderAttachments();
  }
  function renderAttachments() {
    const total = state.attachments.length + state.pendingFiles.length;
    el.attachmentsCounter.textContent = String(total);
    el.attachmentsList.innerHTML = total ? "" : '<small class="kanban-readonly-notice">Nenhum anexo.</small>';
    state.attachments.forEach(attachment => {
      const row = document.createElement("div"); row.className = "kanban-list-row";
      row.innerHTML = `<span>📎</span><div class="kanban-row-copy"><a class="kanban-file-link" href="#">${escapeHtml(attachment.name)}</a><small>${formatFileSize(attachment.size)}</small></div>${state.modalReadOnly ? "" : '<button class="kanban-row-remove" type="button">×</button>'}`;
      row.querySelector("a").addEventListener("click", event => { event.preventDefault(); openAttachment(attachment); });
      row.querySelector("button")?.addEventListener("click", () => { state.attachments = state.attachments.filter(item => item.path !== attachment.path); state.removedPaths.push(attachment.path); renderAttachments(); });
      el.attachmentsList.appendChild(row);
    });
    state.pendingFiles.forEach((file,index) => {
      const row = document.createElement("div"); row.className = "kanban-list-row";
      row.innerHTML = `<span>⏳</span><div class="kanban-row-copy"><strong>${escapeHtml(file.name)}</strong><small>${formatFileSize(file.size)} • aguardando envio</small></div><button class="kanban-row-remove" type="button">×</button>`;
      row.querySelector("button").addEventListener("click", () => { state.pendingFiles.splice(index,1); renderAttachments(); }); el.attachmentsList.appendChild(row);
    });
  }
  function formatFileSize(bytes) { const n = Number(bytes)||0; if (n < 1024) return `${n} B`; if (n < 1048576) return `${(n/1024).toFixed(1)} KB`; return `${(n/1048576).toFixed(1)} MB`; }
  function sanitizeFileName(name) { return String(name || "arquivo").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"_").slice(-120); }
  async function openAttachment(attachment) {
    try { const { data,error } = await bridge().getClient().storage.from(ATTACHMENT_BUCKET).createSignedUrl(attachment.path,60); if (error) throw error; window.open(data.signedUrl,"_blank","noopener"); }
    catch (error) { showToast(error.message || "Não foi possível abrir o anexo."); }
  }
  async function uploadPendingFiles(cardId) {
    const uploaded = [];
    for (const file of state.pendingFiles) {
      const path = `${state.project.id}/${cardId}/${Date.now()}_${uid().slice(0,8)}_${sanitizeFileName(file.name)}`;
      const { error } = await bridge().getClient().storage.from(ATTACHMENT_BUCKET).upload(path,file,{ upsert:false,contentType:file.type || undefined });
      if (error) throw error;
      uploaded.push({ id:uid(), name:file.name, path, size:file.size, type:file.type, uploaded_by:currentUser().id, uploaded_by_name:currentName(), created_at:new Date().toISOString() });
    }
    return uploaded;
  }
  async function removeStorageFiles(paths) { if (!paths.length) return; const { error } = await bridge().getClient().storage.from(ATTACHMENT_BUCKET).remove(paths); if (error) console.warn("Falha ao remover anexos:",error); }

  function collectCardBody() {
    const labels = el.labels.value.split(",").map(value=>value.trim()).filter(Boolean).slice(0,12);
    return { project_id:state.project.id, column_key:el.column.value, title:el.title.value.trim(), description:el.description.value.trim(), owner_name:el.owner.value.trim(), due_date:el.dueDate.value || null, priority:el.priority.value, labels, participants:state.selectedParticipants, checklist:state.checklist, comments:state.comments, attachments:state.attachments };
  }

  async function saveCard() {
    if (state.modalReadOnly || !canWrite()) return;
    const body = collectCardBody();
    if (!body.title) return void (el.validation.textContent = "Informe o título do card.");
    el.validation.textContent = "Salvando card..."; el.saveBtn.disabled = true;
    try {
      let card;
      if (state.editingCard) {
        const originalColumn = state.editingCard.column_key;
        if (body.column_key === "done" && originalColumn !== "done") {
          if (!confirm("Concluir este card? Ele ficará bloqueado até ser reaberto.")) return;
          Object.assign(body,{completed_at:new Date().toISOString(),completed_by:currentUser().id,is_reopened:false});
        }
        const rows = await bridge().request(`fcc_kanban_cards?id=eq.${encodeURIComponent(state.editingCard.id)}`, { method:"PATCH", body, prefer:"return=representation" });
        card = Array.isArray(rows) ? rows[0] : rows;
      } else {
        const sameColumn = state.cards.filter(item=>item.column_key===body.column_key);
        Object.assign(body,{position:sameColumn.length,created_by:currentUser().id});
        if (body.column_key === "done") Object.assign(body,{completed_at:new Date().toISOString(),completed_by:currentUser().id});
        const rows = await bridge().request("fcc_kanban_cards", { method:"POST", body, prefer:"return=representation" });
        card = Array.isArray(rows) ? rows[0] : rows;
      }
      if (!card?.id) throw new Error("O Supabase não retornou o card salvo.");
      const uploaded = await uploadPendingFiles(card.id);
      const finalAttachments = [...state.attachments,...uploaded];
      if (uploaded.length || state.removedPaths.length) {
        await bridge().request(`fcc_kanban_cards?id=eq.${encodeURIComponent(card.id)}`, { method:"PATCH", body:{attachments:finalAttachments}, prefer:"return=minimal" });
        await removeStorageFiles(state.removedPaths);
      }
      closeModal(); await loadCards({silent:true}); showToast(state.editingCard ? "Card atualizado." : "Card criado.");
    } catch (error) { el.validation.textContent = `Erro: ${error.message}`; }
    finally { el.saveBtn.disabled = false; }
  }

  async function deleteCard() {
    if (!state.editingCard || !isPo() || !confirm(`Excluir definitivamente o card “${state.editingCard.title}”?`)) return;
    el.validation.textContent = "Excluindo card...";
    try {
      const paths = normalizeArray(state.editingCard.attachments).map(item=>item.path).filter(Boolean);
      await bridge().request(`fcc_kanban_cards?id=eq.${encodeURIComponent(state.editingCard.id)}`, { method:"DELETE", prefer:"return=minimal" });
      await removeStorageFiles(paths); closeModal(); await loadCards({silent:true}); showToast("Card excluído.");
    } catch (error) { el.validation.textContent = `Erro: ${error.message}`; }
  }

  async function reopenCard() {
    if (!state.editingCard || state.editingCard.column_key !== "done" || !confirm(`Reabrir o card “${state.editingCard.title}”?`)) return;
    try {
      await bridge().request(`fcc_kanban_cards?id=eq.${encodeURIComponent(state.editingCard.id)}`, { method:"PATCH", body:{column_key:"doing",completed_at:null,completed_by:null,reopened_at:new Date().toISOString(),reopened_by:currentUser().id,reopened_count:(state.editingCard.reopened_count||0)+1,is_reopened:true}, prefer:"return=minimal" });
      closeModal(); await loadCards({silent:true}); showToast("Card reaberto em Em Progresso.");
    } catch (error) { el.validation.textContent = `Erro: ${error.message}`; }
  }

  function bindDropZones() {
    Object.entries(el.lists).forEach(([column,list]) => {
      list.addEventListener("dragover", event => { if (!canWrite()) return; event.preventDefault(); list.classList.add("drag-over"); });
      list.addEventListener("dragleave", event => { if (!list.contains(event.relatedTarget)) list.classList.remove("drag-over"); });
      list.addEventListener("drop", event => { event.preventDefault(); list.classList.remove("drag-over"); const id = event.dataTransfer.getData("text/plain") || state.dragCardId; if (id) moveCard(id,column); });
    });
  }

  function bindEvents() {
    el.dock?.addEventListener("click",openKanban); el.back?.addEventListener("click",goProjects); el.home?.addEventListener("click",goProjects); el.changeProject?.addEventListener("click",showProjectPicker); el.newCard?.addEventListener("click",()=>openNewCard("todo"));
    qa("[data-add-column]").forEach(button => button.addEventListener("click",()=>openNewCard(button.dataset.addColumn)));
    el.modalClose.addEventListener("click",closeModal); el.cancelBtn.addEventListener("click",closeModal); el.saveBtn.addEventListener("click",saveCard); el.deleteBtn.addEventListener("click",deleteCard); el.reopenBtn.addEventListener("click",reopenCard);
    el.participantSearchBtn.addEventListener("click",searchParticipants); el.participantSearch.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();searchParticipants();}});
    el.checklistAdd.addEventListener("click",addChecklistItem); el.checklistNew.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();addChecklistItem();}});
    el.commentAdd.addEventListener("click",addComment); el.commentNew.addEventListener("keydown",event=>{if(event.key==="Enter"&&event.ctrlKey){event.preventDefault();addComment();}});
    el.attachmentSelect.addEventListener("click",selectAttachmentFiles); el.attachmentInput.addEventListener("change",handleAttachmentSelection);
    el.modal.querySelector(".modal-backdrop")?.addEventListener("click",closeModal);
    bindDropZones();
    window.addEventListener("beforeunload",unsubscribeRealtime);
  }

  bindEvents();
})();
