(() => {
  "use strict";

  const COLUMNS = { todo: "A Fazer", doing: "Em Progresso", done: "Concluído" };
  const PRIORITIES = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
  const ATTACHMENT_BUCKET = "fcc-kanban-attachments";
  const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;
  const ALLOWED_TAGS = new Set(["B","STRONG","I","EM","U","BR","P","DIV","UL","OL","LI","A","SPAN","H1","H2","H3","H4","BLOCKQUOTE"]);
  const $ = (id) => document.getElementById(id);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const el = {
    view: $("kanbanView"), back: $("kanbanBackBtn"), home: $("kanbanHomeBtn"), dock: $("dockKanbanBtn"),
    picker: $("kanbanProjectPicker"), projectList: $("kanbanProjectList"), projectsEmpty: $("kanbanProjectsEmpty"),
    workspace: $("kanbanWorkspace"), changeProject: $("kanbanChangeProjectBtn"), newCard: $("kanbanNewCardBtn"),
    projectTitle: $("kanbanProjectTitle"), projectMeta: $("kanbanProjectMeta"), projectStatus: $("kanbanProjectStatus"),
    progressText: $("kanbanProgressText"), progressBar: $("kanbanProgressBar"), search: $("kanbanSearchInput"),
    dashTotal: $("kanbanDashTotal"), dashDone: $("kanbanDashDone"), dashOverdue: $("kanbanDashOverdue"), dashChecklist: $("kanbanDashChecklist"),
    lists: { todo: $("kanbanTodoList"), doing: $("kanbanDoingList"), done: $("kanbanDoneList") },
    counts: { todo: $("kanbanTodoCount"), doing: $("kanbanDoingCount"), done: $("kanbanDoneCount") },

    editModal: $("kanbanCardModal"), editClose: $("kanbanCardModalClose"), editChip: $("kanbanCardModalChip"), editTitle: $("kanbanCardModalTitle"), editIntro: $("kanbanCardModalIntro"),
    title: $("kanbanCardTitleInput"), owner: $("kanbanCardOwnerInput"), dueDate: $("kanbanCardDueDateInput"), priority: $("kanbanCardPriorityInput"), column: $("kanbanCardColumnInput"), labels: $("kanbanCardLabelsInput"), description: $("kanbanCardDescriptionInput"),
    participantSearch: $("kanbanParticipantSearchInput"), participantSearchBtn: $("kanbanParticipantSearchBtn"), participantResults: $("kanbanParticipantSearchResults"), selectedParticipants: $("kanbanSelectedParticipants"),
    checklistNew: $("kanbanChecklistNewInput"), checklistAdd: $("kanbanChecklistAddBtn"), checklistList: $("kanbanChecklistList"), checklistCounter: $("kanbanChecklistCounter"),
    commentNew: $("kanbanCommentNewInput"), commentAdd: $("kanbanCommentAddBtn"), commentsList: $("kanbanCommentsList"), commentsCounter: $("kanbanCommentsCounter"),
    attachmentInput: $("kanbanAttachmentInput"), attachmentSelect: $("kanbanAttachmentSelectBtn"), attachmentsList: $("kanbanAttachmentsList"), attachmentsCounter: $("kanbanAttachmentsCounter"),
    validation: $("kanbanCardValidation"), deleteBtn: $("kanbanDeleteCardBtn"), reopenBtn: $("kanbanReopenCardBtn"), cancelBtn: $("kanbanCancelCardBtn"), saveBtn: $("kanbanSaveCardBtn"),

    viewModal: $("kanbanViewCardModal"), viewClose: $("kanbanViewCardClose"), viewCloseFooter: $("kanbanViewCloseFooterBtn"), viewChip: $("kanbanViewCardChip"), viewTitle: $("kanbanViewCardTitle"), viewStatus: $("kanbanViewCardStatus"), viewMeta: $("kanbanViewCardMeta"), viewDescription: $("kanbanViewCardDescription"),
    viewParticipants: $("kanbanViewParticipants"), viewParticipantsCounter: $("kanbanViewParticipantsCounter"), viewChecklist: $("kanbanViewChecklistList"), viewChecklistCounter: $("kanbanViewChecklistCounter"), viewChecklistProgress: $("kanbanViewChecklistProgress"),
    viewCommentInput: $("kanbanViewCommentInput"), viewCommentAdd: $("kanbanViewCommentAddBtn"), viewComments: $("kanbanViewCommentsList"), viewCommentsCounter: $("kanbanViewCommentsCounter"),
    viewAttachmentInput: $("kanbanViewAttachmentInput"), viewAttachmentSelect: $("kanbanViewAttachmentSelectBtn"), viewAttachments: $("kanbanViewAttachmentsList"), viewAttachmentsCounter: $("kanbanViewAttachmentsCounter"), viewEditBtn: $("kanbanViewEditBtn"), viewReopenBtn: $("kanbanViewReopenBtn"),

    confirmModal: $("kanbanStatusConfirmModal"), confirmClose: $("kanbanStatusConfirmClose"), confirmCancel: $("kanbanStatusConfirmCancel"), confirmAccept: $("kanbanStatusConfirmAccept"), confirmIcon: $("kanbanStatusConfirmIcon"), confirmTitle: $("kanbanStatusConfirmTitle"), confirmMessage: $("kanbanStatusConfirmMessage"), confirmWarning: $("kanbanStatusConfirmWarning"),

    notifBtn: $("kanbanGlobalNotifBtn"), notifBadge: $("kanbanGlobalNotifBadge"), notifModal: $("kanbanNotificationsModal"), notifClose: $("kanbanNotificationsClose"), notifList: $("kanbanNotificationsList"), notifMarkAll: $("kanbanMarkAllReadBtn"), notifFilters: qa("[data-notif-filter]"),

    chatWidget: $("kanbanChatWidget"), chatPanel: $("kanbanChatPanel"), chatToggle: $("kanbanChatToggleBtn"), chatBadge: $("kanbanChatBadge"), chatClose: $("kanbanChatCloseBtn"), chatSubtitle: $("kanbanChatSubtitle"), chatSearch: $("kanbanChatSearchInput"), chatSearchResults: $("kanbanChatSearchResults"), chatConversations: $("kanbanChatConversations"), chatThread: $("kanbanChatThread"), chatThreadBack: $("kanbanChatThreadBack"), chatPerson: $("kanbanChatPerson"), chatMessages: $("kanbanChatMessages"), chatMessageInput: $("kanbanChatMessageInput"), chatSend: $("kanbanChatSendBtn")
  };

  const state = {
    projects: [], project: null, projectMembers: [], cards: [], search: "", editingCard: null, viewingCard: null,
    selectedParticipants: [], checklist: [], comments: [], attachments: [], pendingFiles: [], removedPaths: [],
    realtimeCards: null, realtimeNotifications: null, realtimeMessages: null, reloadTimer: null, dragCardId: null,
    notifications: [], notifFilter: "all", confirmResolver: null,
    conversations: [], chatProfiles: new Map(), activeChatUser: null, chatPoll: null
  };

  function bridge() {
    if (!window.FCCPortalBridge) throw new Error("O Portal FCC ainda está inicializando.");
    return window.FCCPortalBridge;
  }
  function currentUser() { return bridge().getCurrentUser?.() || null; }
  function currentProfile() { return bridge().getCurrentProfile?.() || null; }
  function currentName() { const u = currentUser(); const p = currentProfile(); return String(p?.full_name || u?.user_metadata?.full_name || u?.user_metadata?.name || u?.email?.split("@")[0] || "Usuário"); }
  function currentAvatar() { const u = currentUser(); const p = currentProfile(); return safeUrl(p?.avatar_url || u?.user_metadata?.avatar_url || u?.user_metadata?.picture || ""); }
  function uid() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function escapeHtml(value) { return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
  function safeUrl(value) { const v = String(value || "").trim(); return /^https:\/\//i.test(v) ? v : ""; }
  function normalizeArray(value) { return Array.isArray(value) ? value : []; }
  function initials(name, email = "") { const parts = String(name || email || "U").trim().split(/\s+/).filter(Boolean); return ((parts[0]?.[0] || "U") + (parts.length > 1 ? parts.at(-1)?.[0] : "")).toUpperCase().slice(0, 2); }
  function formatDate(value) { if (!value) return ""; const [y,m,d] = String(value).slice(0,10).split("-"); return y && m && d ? `${d}/${m}/${y}` : ""; }
  function formatDateTime(value) { if (!value) return ""; try { return new Intl.DateTimeFormat("pt-BR", { dateStyle:"short", timeStyle:"short" }).format(new Date(value)); } catch { return ""; } }
  function timeAgo(value) { const delta = Date.now() - new Date(value).getTime(); const min = Math.max(0, Math.floor(delta / 60000)); if (min < 1) return "agora"; if (min < 60) return `${min} min`; const h = Math.floor(min / 60); if (h < 24) return `${h} h`; const d = Math.floor(h / 24); return `${d} d`; }
  function isOverdue(value, column) { return Boolean(value && column !== "done" && new Date(`${value}T23:59:59`) < new Date()); }
  function isProjectClosed() { return state.project?.status === "encerrado"; }
  function isPo() { const ownerId = state.project?.po_user_id || state.project?.created_by; return Boolean(ownerId && currentUser()?.id === ownerId); }
  function canWrite() { return Boolean(currentUser() && state.project && !isProjectClosed()); }
  function showToast(message) { bridge().showToast?.(message); }

  function sanitizeRichHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const walk = (node) => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!ALLOWED_TAGS.has(child.tagName)) {
            child.replaceWith(...child.childNodes);
            return;
          }
          [...child.attributes].forEach(attr => {
            if (child.tagName === "A" && attr.name === "href") {
              const href = String(attr.value || "");
              if (!/^https?:\/\//i.test(href)) child.removeAttribute("href");
              else { child.setAttribute("target", "_blank"); child.setAttribute("rel", "noopener noreferrer"); }
            } else child.removeAttribute(attr.name);
          });
          walk(child);
        }
      });
    };
    walk(template.content);
    return template.innerHTML.trim();
  }
  function richPlain(html) { const node = document.createElement("div"); node.innerHTML = sanitizeRichHtml(html); return (node.textContent || "").replace(/\s+/g," ").trim(); }
  function getEditorHtml(node) { return sanitizeRichHtml(node?.innerHTML || ""); }
  function setEditorHtml(node, html = "") { if (node) node.innerHTML = sanitizeRichHtml(html); }
  function clearEditor(node) { if (node) node.innerHTML = ""; }
  function setEditorDisabled(node, disabled) { if (!node) return; node.contentEditable = disabled ? "false" : "true"; node.classList.toggle("disabled", disabled); }
  function setupRichEditors() {
    qa(".kq-rich-toolbar").forEach(toolbar => {
      toolbar.addEventListener("mousedown", event => event.preventDefault());
      toolbar.addEventListener("click", event => {
        const button = event.target.closest("[data-cmd]"); if (!button) return;
        const editor = $(toolbar.dataset.editor); if (!editor || editor.contentEditable === "false") return;
        editor.focus(); const cmd = button.dataset.cmd;
        if (cmd === "createLink") { const url = prompt("Cole o endereço do link (https://...):"); if (url && /^https?:\/\//i.test(url)) document.execCommand("createLink", false, url); }
        else document.execCommand(cmd, false, null);
      });
    });
  }

  function openModal(node) { if (!node) return; node.classList.add("open"); node.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open"); }
  function closeModal(node) { if (!node) return; node.classList.remove("open"); node.setAttribute("aria-hidden","true"); if (!qa(".modal.open").length) document.body.classList.remove("modal-open"); }
  function participantAvatar(person, className = "kanban-card-person") {
    const avatar = safeUrl(person?.avatar_url || person?.participant_avatar_url);
    const label = person?.full_name || person?.participant_name || person?.email || person?.participant_email || "Usuário";
    return avatar ? `<span class="${className}" title="${escapeHtml(label)}"><img src="${escapeHtml(avatar)}" alt=""></span>` : `<span class="${className}" title="${escapeHtml(label)}">${escapeHtml(initials(label, person?.email))}</span>`;
  }

  async function loadProjectMembers() {
    if (!state.project) return [];
    try {
      const rows = await bridge().request("rpc/fcc_get_project_members", { method:"POST", body:{ p_project_id:state.project.id } });
      state.projectMembers = Array.isArray(rows) ? rows.map(row => ({ id:row.user_id || row.id, full_name:row.full_name, email:row.email, avatar_url:row.avatar_url, role:row.role })) : [];
    } catch { state.projectMembers = []; }
    return state.projectMembers;
  }

  async function openKanban() {
    if (!currentUser()) return showToast("Entre com Google para acessar o Kanban.");
    bridge().showView("kanbanView");
    await loadProjects();
    const portalProject = bridge().getCurrentProject?.();
    const available = portalProject && state.projects.find(project => project.id === portalProject.id);
    if (available) await selectProject(available); else showProjectPicker();
  }
  function goProjects() { unsubscribeCards(); $("navActiveProjectsBtn")?.click(); }
  async function loadProjects() {
    try {
      state.projects = (await bridge().refreshProjects()).sort((a,b) => new Date(b.project_date || b.created_at || 0) - new Date(a.project_date || a.created_at || 0));
      renderProjectPicker();
    } catch (error) { state.projects = []; renderProjectPicker(); showToast(`Kanban: ${error.message}`); }
  }
  function renderProjectPicker() {
    el.projectList.innerHTML = "";
    el.projectsEmpty.classList.toggle("hidden", state.projects.length > 0);
    state.projects.forEach(project => {
      const button = document.createElement("button"); button.type = "button"; button.className = "kanban-project-option";
      const background = safeUrl(project.background_image_url); if (background) button.style.setProperty("--kanban-project-bg", `url(${JSON.stringify(background)})`);
      button.innerHTML = `<span class="kpo-top"><span>${project.status === "encerrado" ? "CONCLUÍDO" : "PROJETO ATIVO"}</span><i>▥</i></span><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.organization_name || project.card_description || "Kanban do projeto")}</small>`;
      button.addEventListener("click", () => selectProject(project)); el.projectList.appendChild(button);
    });
  }
  function showProjectPicker() { state.project = null; state.cards = []; unsubscribeCards(); el.workspace.classList.add("hidden"); el.picker.classList.remove("hidden"); el.newCard.classList.add("hidden"); }
  async function selectProject(project) {
    state.project = project; el.picker.classList.add("hidden"); el.workspace.classList.remove("hidden");
    el.projectTitle.textContent = project.name; el.projectMeta.textContent = `${project.organization_name || "Portal FCC"} • ${project.project_date ? formatDate(project.project_date) : "sem data"}`;
    el.projectStatus.textContent = project.status === "encerrado" ? "CONCLUÍDO" : "ATIVO"; el.projectStatus.classList.toggle("closed", project.status === "encerrado");
    el.newCard.classList.toggle("hidden", isProjectClosed()); qa(".kanban-column-add").forEach(btn => btn.disabled = isProjectClosed());
    await Promise.all([loadCards(), loadProjectMembers()]); subscribeCards();
  }
  async function loadCards({ silent = false } = {}) {
    if (!state.project) return;
    try {
      const rows = await bridge().request(`fcc_kanban_cards?project_id=eq.${encodeURIComponent(state.project.id)}&order=column_key.asc,position.asc,created_at.asc`);
      state.cards = Array.isArray(rows) ? rows : []; renderBoard();
    } catch (error) { if (!silent) showToast(`Kanban: ${error.message}`); }
  }
  function subscribeCards() {
    unsubscribeCards(); const client = bridge().getClient?.(); if (!client || !state.project) return;
    state.realtimeCards = client.channel(`fcc-kanban-cards-${state.project.id}`)
      .on("postgres_changes", { event:"*", schema:"public", table:"fcc_kanban_cards", filter:`project_id=eq.${state.project.id}` }, () => { clearTimeout(state.reloadTimer); state.reloadTimer = setTimeout(() => loadCards({ silent:true }),180); }).subscribe();
  }
  function unsubscribeCards() { clearTimeout(state.reloadTimer); const client = bridge().getClient?.(); if (state.realtimeCards && client) client.removeChannel(state.realtimeCards); state.realtimeCards = null; }

  function cardSearchText(card) {
    return [card.title, richPlain(card.description), card.owner_name, ...normalizeArray(card.labels), ...normalizeArray(card.participants).flatMap(p => [p.full_name,p.email]), ...normalizeArray(card.comments).map(c => richPlain(c.text_html || c.text)), ...normalizeArray(card.checklist).map(i => i.text), ...normalizeArray(card.attachments).map(a => a.name)].join(" ").toLowerCase();
  }
  function cardElement(card) {
    const article = document.createElement("article"); const isDone = card.column_key === "done"; const isReopened = Boolean(card.is_reopened) && !isDone;
    article.className = `kq-original-card${isDone ? " is-completed" : ""}${isReopened ? " is-reopened" : ""}`; article.draggable = canWrite() && !isDone; article.dataset.cardId = card.id;
    const labels = normalizeArray(card.labels).filter(Boolean); const participants = normalizeArray(card.participants); const checklist = normalizeArray(card.checklist); const doneItems = checklist.filter(i=>i.done).length; const pct = checklist.length ? Math.round(doneItems/checklist.length*100) : 0; const comments = normalizeArray(card.comments).length; const attachments = normalizeArray(card.attachments).length;
    const status = `${isDone ? '<span class="kq-card-status completed">🔒 Concluído e travado</span>' : ''}${isReopened ? '<span class="kq-card-status reopened">↩ Reaberto</span>' : ''}`;
    article.innerHTML = `
      ${isReopened ? '<span class="kq-reopened-watermark">REABERTO</span>' : ''}
      ${status ? `<div class="kq-card-status-row">${status}</div>` : ''}
      <h4>${escapeHtml(card.title || "Sem título")}</h4>
      <div class="kq-card-description kq-rich-content">${sanitizeRichHtml(card.description || "<p>Sem descrição.</p>")}</div>
      ${labels.length ? `<div class="kq-card-labels">${labels.map(label=>`<span>${escapeHtml(label)}</span>`).join("")}</div>` : ""}
      <div class="kq-card-meta">
        ${card.owner_name ? `<span>👤 ${escapeHtml(card.owner_name)}</span>` : ""}
        ${card.due_date ? `<span class="${isOverdue(card.due_date,card.column_key)?"overdue":""}">Prazo: ${escapeHtml(formatDate(card.due_date))}</span>` : ""}
        <span>Incluído: ${escapeHtml(formatDateTime(card.created_at))}</span>
        ${isDone && card.completed_at ? `<span>Concluído: ${escapeHtml(formatDateTime(card.completed_at))}</span>` : ""}
        ${isReopened && card.reopened_at ? `<span>Reaberto: ${escapeHtml(formatDateTime(card.reopened_at))}</span>` : ""}
      </div>
      ${checklist.length ? `<section class="kq-card-checklist"><div><strong>Checklist</strong><span>${doneItems}/${checklist.length}</span></div>${checklist.slice(0,3).map(item=>`<p class="${item.done?"done":""}"><i></i>${escapeHtml(item.text)}</p>`).join("")}<div class="kq-card-progress"><i style="width:${pct}%"></i></div></section>` : ""}
      <footer class="kq-card-footer"><div><span>💬 ${comments} comentário(s)</span>${attachments ? `<span>📎 ${attachments} anexo(s)</span>` : ""}</div><div class="kq-card-people">${participants.slice(0,5).map(p=>participantAvatar(p)).join("")}</div><button type="button" class="kq-card-edit-btn">${isDone ? "Visualizar" : "Editar"}</button></footer>`;
    article.addEventListener("click", event => { if (event.target.closest("button,a,input")) return; openViewCard(card); });
    article.querySelector(".kq-card-edit-btn")?.addEventListener("click", event => { event.stopPropagation(); isDone ? openViewCard(card) : openEditCard(card); });
    article.addEventListener("dragstart", event => { state.dragCardId = card.id; article.classList.add("dragging"); event.dataTransfer.setData("text/plain",card.id); });
    article.addEventListener("dragend", () => { article.classList.remove("dragging"); setTimeout(()=>state.dragCardId=null,30); qa(".kanban-card-list").forEach(list=>list.classList.remove("drag-over")); });
    return article;
  }
  function renderBoard() {
    const query = state.search.trim().toLowerCase();
    Object.keys(el.lists).forEach(column => {
      const cards = state.cards.filter(card => card.column_key === column && (!query || cardSearchText(card).includes(query))).sort((a,b)=>(a.position||0)-(b.position||0));
      el.lists[column].innerHTML = "";
      if (!cards.length) el.lists[column].innerHTML = `<div class="kanban-empty-column">${query ? "Nenhum card encontrado." : isProjectClosed() ? "Nenhum card nesta coluna." : "Nenhum card nesta coluna."}</div>`;
      cards.forEach(card => el.lists[column].appendChild(cardElement(card))); el.counts[column].textContent = `${cards.length} ${cards.length===1?"card":"cards"}`;
    });
    const total = state.cards.length, completed = state.cards.filter(c=>c.column_key==="done").length, overdue = state.cards.filter(c=>isOverdue(c.due_date,c.column_key)).length;
    const allItems = state.cards.flatMap(c=>normalizeArray(c.checklist)), doneItems = allItems.filter(i=>i.done).length; const checkPct = allItems.length ? Math.round(doneItems/allItems.length*100) : 0; const pct = total ? Math.round(completed/total*100) : 0;
    el.progressText.textContent=`${pct}%`; el.progressBar.style.width=`${pct}%`; el.dashTotal.textContent=total; el.dashDone.textContent=completed; el.dashOverdue.textContent=overdue; el.dashChecklist.textContent=`${checkPct}%`;
  }

  async function confirmStatus({ type, card }) {
    const completing = type === "complete";
    el.confirmIcon.textContent = completing ? "✓" : "↺"; el.confirmTitle.textContent = completing ? "Concluir card" : "Reabrir card";
    el.confirmMessage.textContent = completing ? `Deseja concluir “${card.title}”?` : `Deseja reabrir “${card.title}”?`;
    el.confirmWarning.textContent = completing ? "Após a conclusão, o card ficará bloqueado para edição até ser reaberto pelo PO." : "O card voltará para Em Progresso e receberá destaque de reabertura.";
    openModal(el.confirmModal);
    return new Promise(resolve => { state.confirmResolver = resolve; });
  }
  function resolveConfirm(value) { closeModal(el.confirmModal); const resolver=state.confirmResolver; state.confirmResolver=null; resolver?.(value); }
  async function transitionCard(card, targetColumn) {
    if (!canWrite()) return showToast("Projeto concluído: quadro disponível somente para consulta.");
    if (card.column_key === targetColumn) return;
    if (targetColumn === "done" && !(await confirmStatus({type:"complete",card}))) return;
    if (card.column_key === "done" && targetColumn !== "done") { if (!isPo()) return showToast("Somente o PO pode reabrir cards."); if (!(await confirmStatus({type:"reopen",card}))) return; }
    try { await bridge().request("rpc/fcc_kanban_transition_card",{method:"POST",body:{p_card_id:card.id,p_target_column:targetColumn}}); await loadCards({silent:true}); showToast(targetColumn==="done"?"Card concluído.":card.column_key==="done"?"Card reaberto.":"Card movido."); await loadNotifications(); }
    catch(error){ showToast(error.message); }
  }

  function resetEditState() {
    state.editingCard=null; state.selectedParticipants=[]; state.checklist=[]; state.comments=[]; state.attachments=[]; state.pendingFiles=[]; state.removedPaths=[];
    el.title.value=""; el.owner.value=""; el.dueDate.value=""; el.priority.value="media"; el.column.value="todo"; el.labels.value=""; clearEditor(el.description); clearEditor(el.commentNew); el.participantSearch.value=""; el.participantResults.innerHTML=""; el.checklistNew.value=""; el.validation.textContent="";
  }
  function setOwnerFields() {
    const admin = isPo(); [el.owner,el.dueDate,el.priority,el.labels,el.participantSearch].forEach(node=>node.disabled=!admin); el.participantSearchBtn.disabled=!admin;
    el.selectedParticipants.classList.toggle("read-only",!admin);
  }
  function openNewCard(column="todo") {
    if (!canWrite()) return showToast("Projeto concluído: não é possível criar cards."); resetEditState(); el.column.value=column; el.owner.value=currentName(); el.editChip.textContent="NOVO CARD"; el.editTitle.textContent="Novo Card"; el.editIntro.textContent="Organize a atividade com as mesmas opções do Kanban original."; el.deleteBtn.classList.add("hidden"); el.reopenBtn.classList.add("hidden"); setEditorDisabled(el.description,false); setEditorDisabled(el.commentNew,false); setOwnerFields(); renderEditCollections(); openModal(el.editModal); setTimeout(()=>el.title.focus(),100);
  }
  function openEditCard(card) {
    if (card.column_key === "done") return openViewCard(card); resetEditState(); state.editingCard=clone(card); state.selectedParticipants=clone(normalizeArray(card.participants)); state.checklist=clone(normalizeArray(card.checklist)); state.comments=clone(normalizeArray(card.comments)); state.attachments=clone(normalizeArray(card.attachments));
    el.title.value=card.title||""; el.owner.value=card.owner_name||""; el.dueDate.value=card.due_date||""; el.priority.value=card.priority||"media"; el.column.value=card.column_key||"todo"; el.labels.value=normalizeArray(card.labels).join(", "); setEditorHtml(el.description,card.description||"");
    el.editChip.textContent=card.is_reopened?"CARD REABERTO":"EDITAR CARD"; el.editTitle.textContent=card.title||"Editar card"; el.editIntro.textContent=card.is_reopened?`Reaberto em ${formatDateTime(card.reopened_at)}. O destaque será mantido até a conclusão.`:"Edite o conteúdo, checklist, comentários, anexos e participantes.";
    el.deleteBtn.classList.toggle("hidden",!isPo()); el.reopenBtn.classList.add("hidden"); setEditorDisabled(el.description,false); setEditorDisabled(el.commentNew,false); setOwnerFields(); renderEditCollections(); openModal(el.editModal);
  }
  function renderEditCollections(){ renderParticipants(); renderChecklist(); renderComments(el.commentsList,el.commentsCounter,state.comments); renderAttachments(el.attachmentsList,el.attachmentsCounter,false); }
  function renderParticipants(){
    el.selectedParticipants.innerHTML=state.selectedParticipants.map(person=>`<span class="kanban-participant-chip">${participantAvatar(person,"kanban-mini-avatar")}<span>${escapeHtml(person.full_name||person.email)}</span>${isPo()?`<button type="button" data-remove-participant="${escapeHtml(person.id)}">×</button>`:""}</span>`).join("") || '<small class="kanban-readonly-notice">Nenhum participante adicionado.</small>';
    qa("[data-remove-participant]",el.selectedParticipants).forEach(button=>button.addEventListener("click",()=>{state.selectedParticipants=state.selectedParticipants.filter(p=>p.id!==button.dataset.removeParticipant);renderParticipants();}));
  }
  async function searchParticipants(){
    if(!isPo()) return; const term=el.participantSearch.value.trim(); if(term.length<2){el.participantResults.innerHTML='<small class="kanban-readonly-notice">Digite pelo menos 2 caracteres.</small>';return;}
    el.participantResults.innerHTML="<small>Buscando...</small>";
    try{const rows=await bridge().request("rpc/fcc_search_profiles",{method:"POST",body:{search_term:term}});const selected=new Set(state.selectedParticipants.map(p=>p.id));const results=(Array.isArray(rows)?rows:[]).filter(p=>!selected.has(p.id));el.participantResults.innerHTML=results.length?"":'<small class="kanban-readonly-notice">Nenhum profissional encontrado.</small>';results.forEach(person=>{const button=document.createElement("button");button.type="button";button.className="kanban-search-result";button.innerHTML=`${participantAvatar(person,"kanban-mini-avatar")}<span><strong>${escapeHtml(person.full_name)}</strong><small>${escapeHtml(person.email)}</small></span>`;button.addEventListener("click",()=>{state.selectedParticipants.push(person);el.participantResults.innerHTML="";el.participantSearch.value="";renderParticipants();});el.participantResults.appendChild(button);});}catch(error){el.participantResults.innerHTML=`<small class="kanban-readonly-notice">${escapeHtml(error.message)}</small>`;}
  }
  function addChecklistItem(){const text=el.checklistNew.value.trim();if(!text)return;state.checklist.push({id:uid(),text,done:false,created_at:new Date().toISOString()});el.checklistNew.value="";renderChecklist();}
  function renderChecklist(){const done=state.checklist.filter(i=>i.done).length;el.checklistCounter.textContent=`${done}/${state.checklist.length}`;el.checklistList.innerHTML=state.checklist.length?"":'<small class="kanban-readonly-notice">Nenhum item no checklist.</small>';state.checklist.forEach(item=>{const row=document.createElement("div");row.className="kanban-list-row";row.innerHTML=`<input type="checkbox" ${item.done?"checked":""}><div class="kanban-row-copy"><strong>${escapeHtml(item.text)}</strong></div><button class="kanban-row-remove" type="button">×</button>`;row.querySelector("input").addEventListener("change",e=>{item.done=e.target.checked;renderChecklist();});row.querySelector("button").addEventListener("click",()=>{state.checklist=state.checklist.filter(x=>x.id!==item.id);renderChecklist();});el.checklistList.appendChild(row);});}
  function addEditComment(){const html=getEditorHtml(el.commentNew),plain=richPlain(html);if(!plain)return;state.comments.push({id:uid(),text_html:html,text:plain,author_id:currentUser().id,author_name:currentName(),author_avatar_url:currentAvatar(),created_at:new Date().toISOString()});clearEditor(el.commentNew);renderComments(el.commentsList,el.commentsCounter,state.comments);}
  function renderComments(container,counter,comments){counter.textContent=String(comments.length);container.innerHTML=comments.length?"":'<small class="kanban-readonly-notice">Nenhum comentário.</small>';comments.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).forEach(comment=>{const row=document.createElement("div");row.className="kanban-list-row kanban-comment-row";row.innerHTML=`${participantAvatar({full_name:comment.author_name,avatar_url:comment.author_avatar_url},"kanban-mini-avatar")}<div class="kanban-row-copy"><strong>${escapeHtml(comment.author_name||"Usuário")}</strong><small>${escapeHtml(formatDateTime(comment.created_at))}</small><div class="kq-rich-content">${sanitizeRichHtml(comment.text_html||escapeHtml(comment.text||"").replace(/\n/g,"<br>"))}</div></div>`;container.appendChild(row);});}
  function selectAttachmentFiles(input){input.click();}
  function handleAttachmentSelection(input,pendingTarget=state.pendingFiles){const files=[...(input.files||[])];input.value="";for(const file of files){if(file.size>MAX_ATTACHMENT_SIZE){showToast(`${file.name}: arquivo maior que 15 MB.`);continue;}pendingTarget.push(file);}renderAttachments(el.attachmentsList,el.attachmentsCounter,false);}
  function formatFileSize(bytes){const n=Number(bytes)||0;if(n<1024)return`${n} B`;if(n<1048576)return`${(n/1024).toFixed(1)} KB`;return`${(n/1048576).toFixed(1)} MB`;}
  function sanitizeFileName(name){return String(name||"arquivo").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"_").slice(-120);}
  async function openAttachment(attachment){try{const{data,error}=await bridge().getClient().storage.from(ATTACHMENT_BUCKET).createSignedUrl(attachment.path,60);if(error)throw error;window.open(data.signedUrl,"_blank","noopener");}catch(error){showToast(error.message||"Não foi possível abrir o anexo.");}}
  function renderAttachments(container,counter,readOnly=true){const attached=readOnly?normalizeArray(state.viewingCard?.attachments):state.attachments;const pending=readOnly?[]:state.pendingFiles;counter.textContent=String(attached.length+pending.length);container.innerHTML=attached.length+pending.length?"":'<small class="kanban-readonly-notice">Nenhum anexo.</small>';attached.forEach(att=>{const row=document.createElement("div");row.className="kanban-list-row";row.innerHTML=`<span>📎</span><div class="kanban-row-copy"><a class="kanban-file-link" href="#">${escapeHtml(att.name)}</a><small>${formatFileSize(att.size)}</small></div>${readOnly||!isPo()?"":'<button class="kanban-row-remove" type="button">×</button>'}`;row.querySelector("a").addEventListener("click",e=>{e.preventDefault();openAttachment(att);});row.querySelector("button")?.addEventListener("click",()=>{state.attachments=state.attachments.filter(x=>x.path!==att.path);state.removedPaths.push(att.path);renderAttachments(container,counter,false);});container.appendChild(row);});pending.forEach((file,index)=>{const row=document.createElement("div");row.className="kanban-list-row";row.innerHTML=`<span>⏳</span><div class="kanban-row-copy"><strong>${escapeHtml(file.name)}</strong><small>${formatFileSize(file.size)} • aguardando envio</small></div><button class="kanban-row-remove" type="button">×</button>`;row.querySelector("button").addEventListener("click",()=>{state.pendingFiles.splice(index,1);renderAttachments(container,counter,false);});container.appendChild(row);});}
  async function uploadFiles(cardId,files){const uploaded=[];for(const file of files){const path=`${state.project.id}/${cardId}/${Date.now()}_${uid().slice(0,8)}_${sanitizeFileName(file.name)}`;const{error}=await bridge().getClient().storage.from(ATTACHMENT_BUCKET).upload(path,file,{upsert:false,contentType:file.type||undefined});if(error)throw error;uploaded.push({id:uid(),name:file.name,path,size:file.size,type:file.type,uploaded_by:currentUser().id,uploaded_by_name:currentName(),created_at:new Date().toISOString()});}return uploaded;}
  async function removeFiles(paths){if(!paths.length)return;const{error}=await bridge().getClient().storage.from(ATTACHMENT_BUCKET).remove(paths);if(error)console.warn(error);}
  function collectCardBody(){return{project_id:state.project.id,column_key:el.column.value,title:el.title.value.trim(),description:getEditorHtml(el.description),owner_name:el.owner.value.trim(),due_date:el.dueDate.value||null,priority:el.priority.value,labels:el.labels.value.split(",").map(v=>v.trim()).filter(Boolean).slice(0,15),participants:state.selectedParticipants,checklist:state.checklist,comments:state.comments,attachments:state.attachments};}
  async function notifyUsers(userIds,eventType,title,body,key){const ids=[...new Set(userIds.filter(id=>id&&id!==currentUser().id))];if(!ids.length)return;try{await bridge().request("rpc/fcc_kanban_create_notifications",{method:"POST",body:{p_project_id:state.project.id,p_card_id:state.editingCard?.id||state.viewingCard?.id||null,p_user_ids:ids,p_event_type:eventType,p_title:title,p_body:body,p_event_key_prefix:key}});}catch(error){console.warn("Notificação:",error.message);}}
  function mentionRecipients(html){const text=richPlain(html).toLowerCase();const pool=[...state.projectMembers,...state.selectedParticipants];return [...new Map(pool.map(p=>[p.id,p])).values()].filter(p=>{const full=String(p.full_name||"").toLowerCase();const first=full.split(/\s+/)[0];const email=String(p.email||"").toLowerCase();const local=email.split("@")[0];return (first&&text.includes(`@${first}`))||(full&&text.includes(`@${full}`))||(local&&text.includes(`@${local}`))||(email&&text.includes(`@${email}`));}).map(p=>p.id);}
  async function saveCard(){
    if(!canWrite())return;
    const body=collectCardBody();
    if(!body.title){el.validation.textContent="Informe o título do card.";return;}
    const wasEditing=Boolean(state.editingCard);
    el.validation.textContent="Salvando card...";el.saveBtn.disabled=true;
    try{
      const oldParticipants=new Set(normalizeArray(state.editingCard?.participants).map(p=>p.id));
      const desiredColumn=body.column_key;
      let card;
      let needsTransition=false;
      if(state.editingCard){
        const oldColumn=state.editingCard.column_key;
        needsTransition=desiredColumn!==oldColumn&&(desiredColumn==="done"||oldColumn==="done");
        if(needsTransition)body.column_key=oldColumn;
        const rows=await bridge().request(`fcc_kanban_cards?id=eq.${encodeURIComponent(state.editingCard.id)}`,{method:"PATCH",body,prefer:"return=representation"});
        card=Array.isArray(rows)?rows[0]:rows;
        if(needsTransition){
          closeModal(el.editModal);
          await transitionCard(card,desiredColumn);
          card=state.cards.find(c=>c.id===card.id)||card;
        }
      }else{
        const same=state.cards.filter(c=>c.column_key===desiredColumn);
        const createColumn=desiredColumn==="done"?"todo":desiredColumn;
        Object.assign(body,{column_key:createColumn,position:same.length,created_by:currentUser().id});
        const rows=await bridge().request("fcc_kanban_cards",{method:"POST",body,prefer:"return=representation"});
        card=Array.isArray(rows)?rows[0]:rows;
        if(desiredColumn==="done"){
          closeModal(el.editModal);
          await transitionCard(card,"done");
          card=state.cards.find(c=>c.id===card.id)||card;
        }
      }
      if(!card?.id)throw new Error("O Supabase não retornou o card salvo.");
      const uploaded=await uploadFiles(card.id,state.pendingFiles);
      const finalAttachments=[...state.attachments,...uploaded];
      if(uploaded.length||state.removedPaths.length){
        await bridge().request(`fcc_kanban_cards?id=eq.${card.id}`,{method:"PATCH",body:{attachments:finalAttachments},prefer:"return=minimal"});
        await removeFiles(state.removedPaths);
      }
      state.editingCard={...card,attachments:finalAttachments};
      const added=state.selectedParticipants.filter(p=>!oldParticipants.has(p.id)).map(p=>p.id);
      await notifyUsers(added,"card_assigned",`Você foi incluído no card “${body.title}”`,`Projeto: ${state.project.name}`,`assign:${card.id}:${Date.now()}`);
      const mentionIds=[...mentionRecipients(body.description),...state.comments.slice(-1).flatMap(c=>mentionRecipients(c.text_html||c.text))];
      await notifyUsers(mentionIds,"card_mentioned",`Você foi mencionado no card “${body.title}”`,`Projeto: ${state.project.name}`,`mention:${card.id}:${Date.now()}`);
      closeModal(el.editModal);await loadCards({silent:true});await loadNotifications();showToast(wasEditing?"Card atualizado.":"Card criado.");
    }catch(error){el.validation.textContent=`Erro: ${error.message}`;}
    finally{el.saveBtn.disabled=false;}
  }
  async function deleteCard(){if(!state.editingCard||!isPo()||!confirm(`Excluir definitivamente o card “${state.editingCard.title}”?`))return;try{const paths=normalizeArray(state.editingCard.attachments).map(a=>a.path).filter(Boolean);await bridge().request(`fcc_kanban_cards?id=eq.${state.editingCard.id}`,{method:"DELETE",prefer:"return=minimal"});await removeFiles(paths);closeModal(el.editModal);await loadCards({silent:true});showToast("Card excluído.");}catch(error){el.validation.textContent=`Erro: ${error.message}`;}}
  async function reopenFromEdit(){if(!state.editingCard)return;closeModal(el.editModal);await transitionCard(state.editingCard,"doing");}

  function openViewCard(card){state.viewingCard=clone(card);renderViewCard();openModal(el.viewModal);}
  function renderViewCard(){const card=state.viewingCard;if(!card)return;const done=card.column_key==="done",reopened=card.is_reopened&&!done;el.viewChip.textContent=done?"CARD CONCLUÍDO":reopened?"CARD REABERTO":"DETALHES DO CARD";el.viewTitle.textContent=card.title||"Card";el.viewStatus.innerHTML=`<span class="kq-view-status ${done?"done":reopened?"reopened":"active"}">${done?"🔒 Concluído":reopened?"↩ Reaberto":COLUMNS[card.column_key]}</span>`;el.viewMeta.innerHTML=`${card.owner_name?`<span>👤 ${escapeHtml(card.owner_name)}</span>`:""}${card.due_date?`<span class="${isOverdue(card.due_date,card.column_key)?"overdue":""}">Prazo: ${formatDate(card.due_date)}</span>`:""}<span>Incluído: ${formatDateTime(card.created_at)}</span>${card.completed_at?`<span>Concluído: ${formatDateTime(card.completed_at)}</span>`:""}`;el.viewDescription.innerHTML=sanitizeRichHtml(card.description||"<p>Sem descrição.</p>");const participants=normalizeArray(card.participants);el.viewParticipantsCounter.textContent=participants.length;el.viewParticipants.innerHTML=participants.length?participants.map(p=>`<div class="kq-view-person">${participantAvatar(p,"kanban-mini-avatar")}<div><strong>${escapeHtml(p.full_name||p.email)}</strong><small>${escapeHtml(p.email||"")}</small></div></div>`).join(""):'<small class="kanban-readonly-notice">Nenhum participante.</small>';renderViewChecklist();renderComments(el.viewComments,el.viewCommentsCounter,normalizeArray(card.comments));renderAttachments(el.viewAttachments,el.viewAttachmentsCounter,true);el.viewEditBtn.classList.toggle("hidden",done||isProjectClosed());el.viewReopenBtn.classList.toggle("hidden",!done||!isPo()||isProjectClosed());el.viewAttachmentSelect.classList.toggle("hidden",done||isProjectClosed());setEditorDisabled(el.viewCommentInput,done||isProjectClosed());el.viewCommentAdd.disabled=done||isProjectClosed();clearEditor(el.viewCommentInput);}
  function renderViewChecklist(){const card=state.viewingCard,items=normalizeArray(card?.checklist),done=items.filter(i=>i.done).length,pct=items.length?Math.round(done/items.length*100):0;el.viewChecklistCounter.textContent=`${done}/${items.length}`;el.viewChecklistProgress.style.width=`${pct}%`;el.viewChecklist.innerHTML=items.length?"":'<small class="kanban-readonly-notice">Nenhum item.</small>';items.forEach(item=>{const row=document.createElement("div");row.className="kanban-list-row";row.innerHTML=`<input type="checkbox" ${item.done?"checked":""} ${card.column_key==="done"||isProjectClosed()?"disabled":""}><div class="kanban-row-copy"><strong>${escapeHtml(item.text)}</strong></div>`;row.querySelector("input")?.addEventListener("change",async e=>{item.done=e.target.checked;await patchViewingCard({checklist:items});});el.viewChecklist.appendChild(row);});}
  async function patchViewingCard(body){if(!state.viewingCard)return;try{const rows=await bridge().request(`fcc_kanban_cards?id=eq.${state.viewingCard.id}`,{method:"PATCH",body,prefer:"return=representation"});state.viewingCard=Array.isArray(rows)?rows[0]:rows;await loadCards({silent:true});renderViewCard();}catch(error){showToast(error.message);}}
  async function addViewComment(){const html=getEditorHtml(el.viewCommentInput),plain=richPlain(html);if(!plain||!state.viewingCard)return;const comments=normalizeArray(state.viewingCard.comments);comments.push({id:uid(),text_html:html,text:plain,author_id:currentUser().id,author_name:currentName(),author_avatar_url:currentAvatar(),created_at:new Date().toISOString()});await patchViewingCard({comments});await notifyUsers(mentionRecipients(html),"card_mentioned",`Você foi mencionado no card “${state.viewingCard.title}”`,`Projeto: ${state.project.name}`,`mention:${state.viewingCard.id}:${Date.now()}`);clearEditor(el.viewCommentInput);}
  async function addViewAttachments(){const files=[...(el.viewAttachmentInput.files||[])];el.viewAttachmentInput.value="";if(!files.length||!state.viewingCard)return;for(const file of files)if(file.size>MAX_ATTACHMENT_SIZE)return showToast(`${file.name}: arquivo maior que 15 MB.`);try{const uploaded=await uploadFiles(state.viewingCard.id,files);await patchViewingCard({attachments:[...normalizeArray(state.viewingCard.attachments),...uploaded]});}catch(error){showToast(error.message);}}

  function bindDropZones(){Object.entries(el.lists).forEach(([column,list])=>{list.addEventListener("dragover",e=>{if(!canWrite())return;e.preventDefault();list.classList.add("drag-over");});list.addEventListener("dragleave",e=>{if(!list.contains(e.relatedTarget))list.classList.remove("drag-over");});list.addEventListener("drop",e=>{e.preventDefault();list.classList.remove("drag-over");const id=e.dataTransfer.getData("text/plain")||state.dragCardId;const card=state.cards.find(c=>c.id===id);if(card)transitionCard(card,column);});});}

  async function syncDueNotifications(){try{await bridge().request("rpc/fcc_kanban_sync_due_notifications",{method:"POST",body:{}});}catch(error){console.warn(error.message);}}
  async function loadNotifications(){if(!currentUser())return;try{await syncDueNotifications();const rows=await bridge().request("fcc_kanban_notifications?select=*&order=created_at.desc&limit=100");state.notifications=Array.isArray(rows)?rows:[];renderNotifications();}catch(error){console.warn("Notificações:",error.message);}}
  function notifIcon(type){return({card_due:"◷",card_assigned:"👤",card_mentioned:"@",project_assigned:"▰",card_completed:"✓",card_reopened:"↺",card_updated:"✎",comment_added:"💬"})[type]||"•";}
  function renderNotifications(){const unread=state.notifications.filter(n=>!n.read_at).length;el.notifBadge.textContent=unread>99?"99+":String(unread);el.notifBadge.classList.toggle("hidden",unread===0);el.notifBtn.classList.toggle("has-unread",unread>0);let rows=state.notifications;if(state.notifFilter==="unread")rows=rows.filter(n=>!n.read_at);if(state.notifFilter==="dates")rows=rows.filter(n=>n.event_type==="card_due");el.notifList.innerHTML=rows.length?"":'<div class="kq-notif-empty"><span>🔔</span><strong>Nenhuma notificação</strong><small>Novos prazos, menções e atribuições aparecerão aqui.</small></div>';rows.forEach(n=>{const button=document.createElement("button");button.type="button";button.className=`kq-notif-item${n.read_at?"":" unread"}`;button.innerHTML=`<span class="kq-notif-icon">${notifIcon(n.event_type)}</span><div><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p><small>${timeAgo(n.created_at)}</small></div>${n.read_at?"":"<i></i>"}`;button.addEventListener("click",()=>openNotification(n));el.notifList.appendChild(button);});}
  async function openNotification(n){if(!n.read_at){await bridge().request(`fcc_kanban_notifications?id=eq.${n.id}`,{method:"PATCH",body:{read_at:new Date().toISOString()},prefer:"return=minimal"});n.read_at=new Date().toISOString();renderNotifications();}closeModal(el.notifModal);if(n.project_id){await loadProjects();const project=state.projects.find(p=>p.id===n.project_id);if(project){bridge().showView("kanbanView");await selectProject(project);if(n.card_id){const card=state.cards.find(c=>c.id===n.card_id);if(card)openViewCard(card);}}}}
  async function markAllRead(){const unread=state.notifications.filter(n=>!n.read_at);if(!unread.length)return;await bridge().request(`fcc_kanban_notifications?user_id=eq.${currentUser().id}&read_at=is.null`,{method:"PATCH",body:{read_at:new Date().toISOString()},prefer:"return=minimal"});await loadNotifications();}
  function subscribeNotifications(){const client=bridge().getClient?.();if(!client||!currentUser())return;if(state.realtimeNotifications)client.removeChannel(state.realtimeNotifications);state.realtimeNotifications=client.channel(`fcc-kanban-notifications-${currentUser().id}`).on("postgres_changes",{event:"*",schema:"public",table:"fcc_kanban_notifications",filter:`user_id=eq.${currentUser().id}`},()=>loadNotifications()).subscribe();}

  async function loadConversations(){if(!currentUser())return;try{const rows=await bridge().request(`fcc_kanban_messages?or=(from_user_id.eq.${currentUser().id},to_user_id.eq.${currentUser().id})&order=created_at.desc&limit=300`);const map=new Map();for(const msg of Array.isArray(rows)?rows:[]){const other=msg.from_user_id===currentUser().id?msg.to_user_id:msg.from_user_id;if(!map.has(other))map.set(other,{userId:other,last:msg.text,time:msg.created_at,unread:0});if(msg.to_user_id===currentUser().id&&!msg.read_at)map.get(other).unread++;}const ids=[...map.keys()];if(ids.length){const profiles=await bridge().request("rpc/fcc_kanban_get_profiles",{method:"POST",body:{p_user_ids:ids}});for(const p of Array.isArray(profiles)?profiles:[])state.chatProfiles.set(p.id,p);}state.conversations=[...map.values()].map(c=>({...c,profile:state.chatProfiles.get(c.userId)||{id:c.userId,full_name:"Usuário"}})).sort((a,b)=>new Date(b.time)-new Date(a.time));renderConversations();}catch(error){console.warn("Chat:",error.message);}}
  function renderConversations(){const unread=state.conversations.reduce((sum,c)=>sum+c.unread,0);el.chatBadge.textContent=unread>99?"99+":String(unread);el.chatBadge.classList.toggle("hidden",unread===0);el.chatConversations.innerHTML=state.conversations.length?"":'<div class="kq-chat-empty">Nenhuma conversa. Busque um profissional acima.</div>';state.conversations.forEach(c=>{const button=document.createElement("button");button.type="button";button.className="kq-chat-conversation";button.innerHTML=`${participantAvatar(c.profile,"kanban-mini-avatar")}<div><strong>${escapeHtml(c.profile.full_name||c.profile.email)}</strong><span>${escapeHtml(c.last)}</span></div>${c.unread?`<i>${c.unread}</i>`:""}`;button.addEventListener("click",()=>openChatThread(c.profile));el.chatConversations.appendChild(button);});}
  async function searchChatUsers(){const term=el.chatSearch.value.trim();if(term.length<2){el.chatSearchResults.innerHTML="";return;}try{const rows=await bridge().request("rpc/fcc_search_profiles",{method:"POST",body:{search_term:term}});const results=(Array.isArray(rows)?rows:[]).filter(p=>p.id!==currentUser().id);el.chatSearchResults.innerHTML="";results.forEach(p=>{state.chatProfiles.set(p.id,p);const button=document.createElement("button");button.type="button";button.innerHTML=`${participantAvatar(p,"kanban-mini-avatar")}<span><strong>${escapeHtml(p.full_name)}</strong><small>${escapeHtml(p.email)}</small></span>`;button.addEventListener("click",()=>{el.chatSearch.value="";el.chatSearchResults.innerHTML="";openChatThread(p);});el.chatSearchResults.appendChild(button);});}catch(error){console.warn(error);}}
  async function openChatThread(profile){state.activeChatUser=profile;el.chatConversations.classList.add("hidden");el.chatSearch.parentElement.classList.add("hidden");el.chatThread.classList.remove("hidden");el.chatPerson.innerHTML=`${participantAvatar(profile,"kanban-mini-avatar")}<div><strong>${escapeHtml(profile.full_name||profile.email)}</strong><small>${escapeHtml(profile.email||"")}</small></div>`;await loadChatMessages();el.chatMessageInput.focus();}
  async function loadChatMessages(){if(!state.activeChatUser)return;const uidOther=state.activeChatUser.id;try{const rows=await bridge().request(`fcc_kanban_messages?or=(and(from_user_id.eq.${currentUser().id},to_user_id.eq.${uidOther}),and(from_user_id.eq.${uidOther},to_user_id.eq.${currentUser().id}))&order=created_at.asc`);el.chatMessages.innerHTML="";(Array.isArray(rows)?rows:[]).forEach(msg=>{const div=document.createElement("div");div.className=`kq-chat-message ${msg.from_user_id===currentUser().id?"mine":"theirs"}`;div.innerHTML=`<p>${escapeHtml(msg.text).replace(/\n/g,"<br>")}</p><small>${formatDateTime(msg.created_at)}</small>`;el.chatMessages.appendChild(div);});el.chatMessages.scrollTop=el.chatMessages.scrollHeight;await bridge().request(`fcc_kanban_messages?from_user_id=eq.${uidOther}&to_user_id=eq.${currentUser().id}&read_at=is.null`,{method:"PATCH",body:{read_at:new Date().toISOString()},prefer:"return=minimal"});await loadConversations();}catch(error){console.warn(error);}}
  async function sendChatMessage(){const text=el.chatMessageInput.value.trim();if(!text||!state.activeChatUser)return;el.chatMessageInput.value="";try{await bridge().request("fcc_kanban_messages",{method:"POST",body:{from_user_id:currentUser().id,to_user_id:state.activeChatUser.id,text},prefer:"return=minimal"});await loadChatMessages();}catch(error){showToast(error.message);}}
  function showChatHome(){state.activeChatUser=null;el.chatThread.classList.add("hidden");el.chatConversations.classList.remove("hidden");el.chatSearch.parentElement.classList.remove("hidden");loadConversations();}
  function toggleChat(force){const open=typeof force==="boolean"?force:!el.chatPanel.classList.contains("open");el.chatPanel.classList.toggle("open",open);el.chatPanel.setAttribute("aria-hidden",String(!open));if(open){showChatHome();clearInterval(state.chatPoll);state.chatPoll=setInterval(()=>state.activeChatUser?loadChatMessages():loadConversations(),5000);}else clearInterval(state.chatPoll);}
  function subscribeMessages(){const client=bridge().getClient?.();if(!client||!currentUser())return;if(state.realtimeMessages)client.removeChannel(state.realtimeMessages);state.realtimeMessages=client.channel(`fcc-kanban-messages-${currentUser().id}`).on("postgres_changes",{event:"*",schema:"public",table:"fcc_kanban_messages"},()=>{loadConversations();if(state.activeChatUser)loadChatMessages();}).subscribe();}

  function bindEvents(){
    el.dock?.addEventListener("click",openKanban);el.back?.addEventListener("click",goProjects);el.home?.addEventListener("click",goProjects);el.changeProject?.addEventListener("click",showProjectPicker);el.newCard?.addEventListener("click",()=>openNewCard("todo"));
    qa("[data-add-column]").forEach(button=>button.addEventListener("click",()=>openNewCard(button.dataset.addColumn)));el.search?.addEventListener("input",()=>{state.search=el.search.value;renderBoard();});
    el.editClose?.addEventListener("click",()=>closeModal(el.editModal));el.cancelBtn?.addEventListener("click",()=>closeModal(el.editModal));el.saveBtn?.addEventListener("click",saveCard);el.deleteBtn?.addEventListener("click",deleteCard);el.reopenBtn?.addEventListener("click",reopenFromEdit);
    el.participantSearchBtn?.addEventListener("click",searchParticipants);el.participantSearch?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();searchParticipants();}});el.checklistAdd?.addEventListener("click",addChecklistItem);el.checklistNew?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addChecklistItem();}});el.commentAdd?.addEventListener("click",addEditComment);el.commentNew?.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.ctrlKey){e.preventDefault();addEditComment();}});el.attachmentSelect?.addEventListener("click",()=>selectAttachmentFiles(el.attachmentInput));el.attachmentInput?.addEventListener("change",()=>handleAttachmentSelection(el.attachmentInput));
    el.viewClose?.addEventListener("click",()=>closeModal(el.viewModal));el.viewCloseFooter?.addEventListener("click",()=>closeModal(el.viewModal));el.viewEditBtn?.addEventListener("click",()=>{const card=state.viewingCard;closeModal(el.viewModal);if(card)openEditCard(card);});el.viewReopenBtn?.addEventListener("click",async()=>{const card=state.viewingCard;closeModal(el.viewModal);if(card)await transitionCard(card,"doing");});el.viewCommentAdd?.addEventListener("click",addViewComment);el.viewAttachmentSelect?.addEventListener("click",()=>el.viewAttachmentInput.click());el.viewAttachmentInput?.addEventListener("change",addViewAttachments);
    el.confirmClose?.addEventListener("click",()=>resolveConfirm(false));el.confirmCancel?.addEventListener("click",()=>resolveConfirm(false));el.confirmAccept?.addEventListener("click",()=>resolveConfirm(true));
    el.notifBtn?.addEventListener("click",async()=>{await loadNotifications();openModal(el.notifModal);});el.notifClose?.addEventListener("click",()=>closeModal(el.notifModal));el.notifMarkAll?.addEventListener("click",markAllRead);el.notifFilters.forEach(button=>button.addEventListener("click",()=>{state.notifFilter=button.dataset.notifFilter;el.notifFilters.forEach(b=>b.classList.toggle("active",b===button));renderNotifications();}));
    el.chatToggle?.addEventListener("click",()=>toggleChat());el.chatClose?.addEventListener("click",()=>toggleChat(false));el.chatThreadBack?.addEventListener("click",showChatHome);el.chatSearch?.addEventListener("input",()=>{clearTimeout(el.chatSearch._timer);el.chatSearch._timer=setTimeout(searchChatUsers,250);});el.chatSend?.addEventListener("click",sendChatMessage);el.chatMessageInput?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMessage();}});
    qa("[data-close='kanbanCardModal']").forEach(node=>node.addEventListener("click",()=>closeModal(el.editModal)));qa("[data-close='kanbanViewCardModal']").forEach(node=>node.addEventListener("click",()=>closeModal(el.viewModal)));qa("[data-close='kanbanNotificationsModal']").forEach(node=>node.addEventListener("click",()=>closeModal(el.notifModal)));
    bindDropZones();setupRichEditors();window.addEventListener("beforeunload",()=>{unsubscribeCards();clearInterval(state.chatPoll);});
  }

  async function initializeUserFeatures(){const logged=Boolean(currentUser());el.notifBtn?.classList.toggle("hidden",!logged);el.chatWidget?.classList.toggle("hidden",!logged);if(!logged)return;await Promise.all([loadNotifications(),loadConversations()]);subscribeNotifications();subscribeMessages();}
  function waitForPortal(){let tries=0;const timer=setInterval(async()=>{tries++;if(window.FCCPortalBridge){clearInterval(timer);await initializeUserFeatures();const client=bridge().getClient?.();client?.auth?.onAuthStateChange(()=>setTimeout(initializeUserFeatures,250));}else if(tries>80)clearInterval(timer);},100);}

  bindEvents();waitForPortal();
})();
