(() => {
  "use strict";

  const state = {
    registration: null,
    installPrompt: null,
    session: null,
    user: null,
    subscription: null,
    initialized: false
  };

  const $ = (id) => document.getElementById(id);
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const config = () => window.FCC_CONFIG || {};

  function toast(message) {
    const box = $("toast");
    const text = $("toastText");
    if (!box || !text) return;
    text.textContent = message;
    box.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => box.classList.remove("show"), 2600);
  }

  function configuredForPush() {
    const key = String(config().VAPID_PUBLIC_KEY || "").trim();
    return key.length > 40 && !/COLE_AQUI|SUA_CHAVE/i.test(key);
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  function updateInstallButtons() {
    const installed = isStandalone();
    const available = Boolean(state.installPrompt) || isIos() || installed || "serviceWorker" in navigator;
    [$("authInstallAppBtn"), $("profileInstallAppBtn")].forEach((button) => {
      if (!button) return;
      button.classList.toggle("hidden", !available);
      button.disabled = installed;
      const strong = button.querySelector("strong");
      const small = button.querySelector("small");
      if (strong) strong.textContent = installed ? "Aplicativo instalado" : "Instalar aplicativo";
      if (small) small.textContent = installed ? "Portal FCC já está na tela inicial" : "Adicionar à tela inicial do celular";
    });
  }

  async function notificationState() {
    if (!("Notification" in window) || !("PushManager" in window)) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    if (!state.registration) return Notification.permission;
    state.subscription = await state.registration.pushManager.getSubscription();
    return state.subscription ? "enabled" : Notification.permission;
  }

  async function updateNotificationButton() {
    const button = $("profileNotificationsBtn");
    if (!button) return;
    const status = await notificationState();
    const strong = button.querySelector("strong");
    const small = button.querySelector("small");
    button.dataset.state = status;
    if (status === "enabled") {
      if (strong) strong.textContent = "Notificações ativadas";
      if (small) small.textContent = "Toque para desativar neste dispositivo";
      button.classList.add("is-enabled");
      button.disabled = false;
    } else if (status === "denied") {
      if (strong) strong.textContent = "Notificações bloqueadas";
      if (small) small.textContent = "Libere a permissão nas configurações do navegador";
      button.classList.remove("is-enabled");
      button.disabled = false;
    } else if (status === "unsupported") {
      if (strong) strong.textContent = "Notificações indisponíveis";
      if (small) small.textContent = "Este navegador não oferece suporte";
      button.classList.remove("is-enabled");
      button.disabled = true;
    } else if (!configuredForPush()) {
      if (strong) strong.textContent = "Configurar notificações";
      if (small) small.textContent = "Adicione a chave VAPID no config.js";
      button.classList.remove("is-enabled");
      button.disabled = false;
    } else {
      if (strong) strong.textContent = "Ativar notificações";
      if (small) small.textContent = "Receber atualizações de projetos, Kanban e chat";
      button.classList.remove("is-enabled");
      button.disabled = false;
    }
  }

  async function rpc(path, body) {
    const cfg = config();
    if (!state.session?.access_token) throw new Error("Faça login para configurar as notificações.");
    const response = await fetch(`${String(cfg.SUPABASE_URL).replace(/\/$/, "")}/rest/v1/rpc/${path}`, {
      method: "POST",
      headers: {
        apikey: cfg.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${state.session.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body || {})
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
    if (!response.ok) throw new Error(payload?.message || payload?.details || String(payload || `HTTP ${response.status}`));
    return payload;
  }

  function subscriptionPayload(subscription) {
    const json = subscription.toJSON();
    return {
      p_endpoint: json.endpoint,
      p_p256dh: json.keys?.p256dh || "",
      p_auth: json.keys?.auth || "",
      p_user_agent: navigator.userAgent.slice(0, 500),
      p_device_label: `${navigator.platform || "Dispositivo"} • ${isStandalone() ? "App instalado" : "Navegador"}`.slice(0, 180)
    };
  }

  async function saveSubscription(subscription) {
    await rpc("fcc_upsert_push_subscription", subscriptionPayload(subscription));
  }

  async function enableNotifications() {
    if (!state.user) {
      toast("Entre com Google antes de ativar notificações.");
      return;
    }
    if (!configuredForPush()) {
      openHelp("config");
      return;
    }
    if (!("Notification" in window) || !("PushManager" in window) || !state.registration) {
      openHelp("unsupported");
      return;
    }
    if (isIos() && !isStandalone()) {
      openHelp("ios");
      return;
    }
    if (Notification.permission === "denied") {
      openHelp("denied");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        await updateNotificationButton();
        toast("Permissão de notificação não concedida.");
        return;
      }
      let subscription = await state.registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await state.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config().VAPID_PUBLIC_KEY)
        });
      }
      state.subscription = subscription;
      await saveSubscription(subscription);
      await updateNotificationButton();
      toast("Notificações ativadas neste dispositivo.");
      state.registration.showNotification("Portal FCC", {
        body: "Notificações ativadas. Você receberá atualizações dos projetos em que participa.",
        icon: "./icons/icon-192.png",
        badge: "./icons/badge-96.png",
        tag: "fcc-notifications-enabled",
        data: { url: "./" }
      }).catch(() => {});
    } catch (error) {
      console.error("Push:", error);
      toast(error.message || "Não foi possível ativar as notificações.");
    }
  }

  async function disableNotifications() {
    try {
      const subscription = state.subscription || await state.registration?.pushManager.getSubscription();
      if (subscription && state.user) {
        await rpc("fcc_remove_push_subscription", { p_endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      state.subscription = null;
      await updateNotificationButton();
      toast("Notificações desativadas neste dispositivo.");
    } catch (error) {
      toast(error.message || "Não foi possível desativar as notificações.");
    }
  }

  async function toggleNotifications() {
    const status = await notificationState();
    if (status === "enabled") {
      const confirmed = window.confirm("Desativar as notificações do Portal FCC neste dispositivo?");
      if (confirmed) await disableNotifications();
      return;
    }
    await enableNotifications();
  }

  async function syncExistingSubscription() {
    if (!state.user || !state.registration || Notification.permission !== "granted" || !configuredForPush()) return;
    try {
      const subscription = await state.registration.pushManager.getSubscription();
      if (subscription) {
        state.subscription = subscription;
        await saveSubscription(subscription);
      }
    } catch (error) {
      console.warn("Sincronização push:", error.message);
    }
    await updateNotificationButton();
  }

  async function promptInstall() {
    if (isStandalone()) {
      toast("O Portal FCC já está instalado.");
      return;
    }
    if (state.installPrompt) {
      state.installPrompt.prompt();
      const choice = await state.installPrompt.userChoice;
      state.installPrompt = null;
      updateInstallButtons();
      if (choice.outcome === "accepted") toast("Instalação iniciada.");
      return;
    }
    openHelp(isIos() ? "ios-install" : "install");
  }

  function openHelp(mode = "install") {
    const modal = $("pwaHelpModal");
    const title = $("pwaHelpTitle");
    const text = $("pwaHelpText");
    const steps = $("pwaHelpSteps");
    if (!modal) return;
    const content = {
      "ios-install": ["Instalar no iPhone/iPad", "No Safari, toque em Compartilhar e escolha ‘Adicionar à Tela de Início’.", ["Abra o Portal FCC no Safari.", "Toque no ícone Compartilhar.", "Escolha Adicionar à Tela de Início."]],
      ios: ["Instale antes de ativar", "No iPhone/iPad, notificações web funcionam depois que o Portal FCC é adicionado à Tela de Início.", ["Instale o Portal pelo Safari.", "Abra o ícone instalado.", "Entre com Google e toque em Ativar notificações."]],
      denied: ["Permissão bloqueada", "O navegador bloqueou notificações para este site.", ["Abra as configurações do site no navegador.", "Altere Notificações para Permitir.", "Volte ao Portal e tente novamente."]],
      config: ["Configuração pendente", "A chave pública VAPID ainda não foi adicionada ao config.js.", ["Gere as chaves VAPID conforme o passo a passo.", "Adicione VAPID_PUBLIC_KEY ao config.js.", "Publique novamente e ative as notificações."]],
      unsupported: ["Recurso indisponível", "Este navegador não suporta notificações push para aplicativos web.", ["Use Chrome ou Edge atualizado no Android/desktop.", "No iPhone, instale pelo Safari na Tela de Início."]],
      install: ["Instalar Portal FCC", "Use o menu do navegador para instalar ou criar um atalho do Portal FCC.", ["Abra o menu ⋮ do navegador.", "Escolha Instalar aplicativo ou Adicionar à tela inicial.", "Confirme a instalação."]]
    }[mode] || null;
    if (!content) return;
    title.textContent = content[0];
    text.textContent = content[1];
    steps.innerHTML = content[2].map((item, index) => `<li><b>${index + 1}</b><span>${item}</span></li>`).join("");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeHelp() {
    const modal = $("pwaHelpModal");
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
  }


  function handleLaunchRoute(detail = null) {
    const route = String(location.hash || "").replace(/^#/, "").toLowerCase();
    const eventType = String(detail?.event_type || "");
    window.setTimeout(() => {
      if ((route === "calcular" || eventType === "calculator") && $("dockCalcBtn")) {
        $("dockCalcBtn").click();
        return;
      }
      if ((route === "kanban" || eventType.startsWith("kanban_") || detail?.card_id) && state.user && $("dockKanbanBtn")) {
        $("dockKanbanBtn").click();
        return;
      }
      if ((route === "chat" || eventType === "chat_message") && state.user && $("kanbanChatToggleBtn")) {
        $("kanbanChatToggleBtn").click();
        return;
      }
      if ((route === "projetos" || detail?.project_id) && state.user && $("dockHomeBtn")) {
        $("dockHomeBtn").click();
      }
    }, 450);
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      state.registration = await navigator.serviceWorker.register("./sw.js?v=18.0", { scope: "./", updateViaCache: "none" });
      state.initialized = true;
      state.registration.update().catch(() => {});
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "FCC_PUSH_RECEIVED") {
          window.dispatchEvent(new CustomEvent("fcc:push-received", { detail: event.data.payload }));
        }
        if (event.data?.type === "FCC_NOTIFICATION_CLICK") {
          window.dispatchEvent(new CustomEvent("fcc:push-open", { detail: event.data.data }));
        }
      });
      await updateNotificationButton();
      if (state.user) await syncExistingSubscription();
    } catch (error) {
      console.warn("Service Worker:", error);
    }
  }

  function bindUi() {
    $("authInstallAppBtn")?.addEventListener("click", promptInstall);
    $("profileInstallAppBtn")?.addEventListener("click", promptInstall);
    $("profileNotificationsBtn")?.addEventListener("click", toggleNotifications);
    $("pwaHelpClose")?.addEventListener("click", closeHelp);
    $("pwaHelpOk")?.addEventListener("click", closeHelp);
    $("pwaHelpModal")?.querySelector(".modal-backdrop")?.addEventListener("click", closeHelp);
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    updateInstallButtons();
  });
  window.addEventListener("appinstalled", () => {
    state.installPrompt = null;
    updateInstallButtons();
    toast("Portal FCC instalado com sucesso.");
  });
  window.addEventListener("fcc:auth-session", async (event) => {
    state.session = event.detail?.session || null;
    state.user = event.detail?.user || state.session?.user || null;
    await syncExistingSubscription();
    handleLaunchRoute();
  });
  window.addEventListener("fcc:signed-out", () => {
    state.session = null;
    state.user = null;
    updateNotificationButton();
  });
  window.addEventListener("online", () => syncExistingSubscription());
  window.addEventListener("hashchange", () => handleLaunchRoute());
  window.addEventListener("fcc:push-open", (event) => handleLaunchRoute(event.detail || null));

  document.addEventListener("DOMContentLoaded", async () => {
    bindUi();
    updateInstallButtons();
    await registerServiceWorker();
    if (!state.user && location.hash === "#calcular") {
      window.setTimeout(() => $("guestCalculatorBtn")?.click(), 700);
    }
  });

  window.FCCPWA = {
    install: promptInstall,
    enableNotifications,
    disableNotifications,
    refresh: async () => { updateInstallButtons(); await updateNotificationButton(); },
    isStandalone
  };
})();
