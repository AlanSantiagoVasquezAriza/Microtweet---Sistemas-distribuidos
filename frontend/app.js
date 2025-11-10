const state = {
  apiBase: localStorage.getItem('mt_api_base') || 'http://localhost:3000',
  token: localStorage.getItem('mt_token'),
  user: null,
  following: [],
  activeTab: localStorage.getItem('mt_active_tab') || 'public',
};

const elements = {};

function initElements() {
  elements.apiBaseForm = document.getElementById('api-base-form');
  elements.apiBaseInput = document.getElementById('api-base-input');
  elements.statusBar = document.getElementById('status-bar');
  elements.registerForm = document.getElementById('register-form');
  elements.loginForm = document.getElementById('login-form');
  elements.logoutButton = document.getElementById('logout-button');
  elements.authCard = document.getElementById('auth-card');
  elements.authTabButtons = Array.from(document.querySelectorAll('.auth-tabs .tab-button'));
  elements.authTabPanels = Array.from(
    document.querySelectorAll('#auth-card .tab-panel')
  );
  elements.profileSummary = document.getElementById('profile-summary');
  elements.publicFeedList = document.getElementById('public-feed');
  elements.personalFeedList = document.getElementById('personal-feed');
  elements.personalPanelMessage = document.getElementById('personal-panel-message');
  elements.tabButtons = Array.from(document.querySelectorAll('.tab-button'));
  elements.tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  elements.personalTabButton = document.querySelector('.tab-button[data-tab="personal"]');
  elements.publicTabButton = document.querySelector('.tab-button[data-tab="public"]');
  elements.refreshTab = document.getElementById('refresh-tab');
  elements.composeButtons = Array.from(
    document.querySelectorAll('[data-role="compose-button"]')
  );
}

function showStatus(message, type = 'info') {
  elements.statusBar.textContent = message;
  elements.statusBar.className = '';
  elements.statusBar.classList.add('show', type);
}

function clearStatus() {
  elements.statusBar.textContent = '';
  elements.statusBar.className = '';
}

function persistState() {
  localStorage.setItem('mt_api_base', state.apiBase);
  if (state.token) {
    localStorage.setItem('mt_token', state.token);
  } else {
    localStorage.removeItem('mt_token');
  }
  if (state.user) {
    localStorage.setItem('mt_user', JSON.stringify(state.user));
  } else {
    localStorage.removeItem('mt_user');
  }
}

function loadUserFromStorage() {
  state.following = [];
  const rawUser = localStorage.getItem('mt_user');
  if (rawUser) {
    try {
      state.user = JSON.parse(rawUser);
    } catch (error) {
      console.warn('No se pudo cargar el usuario de localStorage', error);
      state.user = null;
    }
  }
}

function toggleComposeButtons(visible) {
  if (!Array.isArray(elements.composeButtons)) {
    return;
  }
  elements.composeButtons.forEach((button) => {
    if (visible) {
      button.classList.remove('hidden');
      button.removeAttribute('disabled');
    } else {
      button.classList.add('hidden');
      button.setAttribute('disabled', 'true');
    }
  });
}

function updateAuthUI() {
  const isLogged = Boolean(state.token && state.user);

  if (elements.profileSummary) {
    elements.profileSummary.textContent = isLogged
      ? `Sesión iniciada como @${state.user.username} (${state.user.email})`
      : 'Inicia sesión para ver tu información.';
  }

  toggleComposeButtons(isLogged);

  if (Array.isArray(elements.authTabButtons)) {
    elements.authTabButtons.forEach((button) => {
      const tab = button.dataset.tab;
      if (tab === 'session') {
        button.toggleAttribute('disabled', !isLogged);
      }
    });
  }

  if (!isLogged) {
    elements.personalTabButton?.setAttribute('disabled', 'true');
    if (elements.personalFeedList) {
      elements.personalFeedList.innerHTML = '';
      elements.personalFeedList.classList.add('hidden');
    }
    if (elements.personalPanelMessage) {
      elements.personalPanelMessage.classList.remove('hidden');
      elements.personalPanelMessage.textContent = 'Inicia sesión para ver tu feed personal.';
    }
    if (state.activeTab === 'personal') {
      setActiveTab('public');
    }
  } else {
    elements.personalTabButton?.removeAttribute('disabled');
    elements.personalPanelMessage?.classList.add('hidden');
    elements.personalFeedList?.classList.remove('hidden');
  }
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString();
}

function setActiveAuthTab(tab) {
  if (!elements.authTabButtons || !elements.authTabPanels) {
    return;
  }

  let targetTab = tab;
  const allowedTabs = ['register', 'login', 'session'];
  if (!allowedTabs.includes(targetTab)) {
    targetTab = 'register';
  }
  if (targetTab === 'session' && !(state.user && state.token)) {
    targetTab = 'register';
  }

  elements.authTabButtons.forEach((button) => {
    const isActive = button.dataset.tab === targetTab;
    button.classList.toggle('active', isActive);
  });

  elements.authTabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === targetTab;
    panel.classList.toggle('active', isActive);
  });
}

function renderFeed(listElement, feed, emptyMessage, options = {}) {
  if (!listElement) {
    return;
  }
  const enableFollow = Boolean(options.enableFollow);
  listElement.innerHTML = '';
  if (!feed || !feed.tweets || feed.tweets.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = emptyMessage;
    listElement.appendChild(li);
    return;
  }

  feed.tweets.forEach((tweet) => {
    const li = document.createElement('li');
    li.className = 'feed-item';

    const headerRow = document.createElement('div');
    headerRow.className = 'feed-item-header';

    const header = document.createElement('h3');
    header.textContent = tweet.username ? `@${tweet.username}` : `Usuario ${tweet.user_id}`;
    headerRow.appendChild(header);

    if (
      enableFollow &&
      state.user &&
      typeof tweet.user_id === 'number' &&
      tweet.user_id !== state.user.id
    ) {
      const isFollowing = state.following.some((u) => u.id === tweet.user_id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `follow-toggle ${isFollowing ? 'unfollow' : 'follow'}`;
      button.dataset.userId = String(tweet.user_id);
      button.dataset.action = isFollowing ? 'unfollow' : 'follow';
      button.textContent = isFollowing ? 'Unfollow' : 'Follow';
      headerRow.appendChild(button);
    }

    const time = document.createElement('time');
    time.dateTime = tweet.created_at;
    time.textContent = formatDate(tweet.created_at);

    const content = document.createElement('p');
    content.textContent = tweet.content;

    li.appendChild(headerRow);
    li.appendChild(time);
    li.appendChild(content);
    listElement.appendChild(li);
  });
}

function buildUrl(path) {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${state.apiBase.replace(/\/$/, '')}${trimmed}`;
}

async function apiFetch(path, options = {}) {
  const url = buildUrl(path);
  const headers = Object.assign({}, options.headers || {});
  const useAuth = options.auth !== false;

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (useAuth && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let payload;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else if (contentType.includes('text/')) {
    payload = await response.text();
  }

  if (!response.ok) {
    const error = new Error('Petición fallida');
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
}

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    username: formData.get('username').trim(),
    email: formData.get('email').trim(),
    password: formData.get('password'),
    bio: formData.get('bio')?.trim() || '',
  };

  if (!payload.username || !payload.email || !payload.password) {
    showStatus('Completa todos los campos obligatorios.', 'error');
    return;
  }

  try {
    showStatus('Registrando usuario...', 'info');
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    });

    state.token = data.token;
    state.user = data.user;
    persistState();
    updateAuthUI();
    setActiveAuthTab('session');
    showStatus(`¡Bienvenido @${data.user.username}! Registro exitoso.`, 'success');
    await Promise.all([fetchPersonalFeed(), fetchFollowing()]);
    refreshActiveTab();
  } catch (error) {
    const message =
      error.data?.error ||
      error.data?.message ||
      `No se pudo completar el registro (código ${error.status || 'desconocido'})`;
    showStatus(message, 'error');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    email: formData.get('email').trim(),
    password: formData.get('password'),
  };

  if (!payload.email || !payload.password) {
    showStatus('Ingresa email y contraseña.', 'error');
    return;
  }

  try {
    showStatus('Verificando credenciales...', 'info');
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    });

    state.token = data.token;
    state.user = data.user;
    persistState();
    updateAuthUI();
    setActiveAuthTab('session');
    showStatus(`Sesión iniciada. Hola de nuevo, @${data.user.username}!`, 'success');
    await Promise.all([fetchPersonalFeed(), fetchFollowing()]);
    refreshActiveTab();
  } catch (error) {
    const message =
      error.data?.error ||
      error.data?.message ||
      `No se pudo iniciar sesión (código ${error.status || 'desconocido'})`;
    showStatus(message, 'error');
  }
}

async function fetchPublicFeed() {
  try {
    const data = await apiFetch('/api/feeds/public?limit=20&page=1', {
      method: 'GET',
      auth: false,
    });
    renderFeed(elements.publicFeedList, data, 'Aún no hay tweets públicos.', {
      enableFollow: true,
    });
  } catch (error) {
    console.error(error);
    showStatus('No se pudo cargar el feed público.', 'error');
  }
}

async function fetchPersonalFeed() {
  if (!state.user || !state.token) {
    if (elements.personalPanelMessage) {
      elements.personalPanelMessage.classList.remove('hidden');
      elements.personalPanelMessage.textContent = 'Inicia sesión para ver tu feed personal.';
    }
    elements.personalFeedList?.classList.add('hidden');
    return;
  }
  try {
    elements.personalPanelMessage?.classList.add('hidden');
    elements.personalFeedList?.classList.remove('hidden');
    const data = await apiFetch(`/api/feeds/personal/${state.user.id}?limit=20&page=1`);
    renderFeed(elements.personalFeedList, data, 'Sigue a otros usuarios para poblar tu feed.', {
      enableFollow: true,
    });
  } catch (error) {
    console.error(error);
    if (error.status === 401 || error.status === 403) {
      showStatus('Tu sesión expiró. Inicia sesión otra vez.', 'error');
      clearAuth();
    } else {
      showStatus('No se pudo cargar tu feed personal.', 'error');
      if (elements.personalPanelMessage) {
        elements.personalPanelMessage.classList.remove('hidden');
        elements.personalPanelMessage.textContent = 'No se pudo cargar tu feed personal.';
      }
      elements.personalFeedList?.classList.add('hidden');
    }
  }
}

async function fetchFollowing() {
  if (!state.user || !state.token) {
    return;
  }
  try {
    const data = await apiFetch(`/api/users/${state.user.id}/following`);
    state.following = Array.isArray(data.following)
      ? data.following.map((u) => ({
          ...u,
          id: Number(u.id),
        }))
      : [];
  } catch (error) {
    console.error(error);
    if (error.status === 401 || error.status === 403) {
      showStatus('Tu sesión expiró. Inicia sesión otra vez.', 'error');
      clearAuth();
    } else {
      showStatus('No se pudo cargar la lista de usuarios que sigues.', 'error');
    }
  }
}

function refreshActiveTab() {
  if (state.activeTab === 'personal') {
    fetchPersonalFeed();
  } else {
    fetchPublicFeed();
  }
}

function setActiveTab(tab) {
  let targetTab = tab;
  if (tab === 'personal' && !(state.user && state.token)) {
    targetTab = 'public';
  }

  state.activeTab = targetTab;
  localStorage.setItem('mt_active_tab', targetTab);

  if (Array.isArray(elements.tabButtons)) {
    elements.tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === targetTab;
      button.classList.toggle('active', isActive);
    });
  }

  if (Array.isArray(elements.tabPanels)) {
    elements.tabPanels.forEach((panel) => {
      const isActive = panel.dataset.panel === targetTab;
      panel.classList.toggle('active', isActive);
    });
  }

  refreshActiveTab();
}

function sanitizeUserId(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}

async function followAction(targetId, action) {
  if (!state.user || !state.token) {
    showStatus('Inicia sesión para gestionar tus seguimientos.', 'error');
    return;
  }

  if (targetId === state.user.id) {
    showStatus('No puedes seguirte (ni dejar de seguirte) a ti mismo.', 'error');
    return;
  }

  const verb = action === 'follow' ? 'seguir' : 'dejar de seguir';
  const method = action === 'follow' ? 'POST' : 'DELETE';

  try {
    showStatus(`Intentando ${verb} al usuario ${targetId}...`, 'info');
    await apiFetch(`/api/users/${targetId}/follow`, { method });
    showStatus(
      action === 'follow'
        ? `Ahora sigues al usuario ${targetId}.`
        : `Has dejado de seguir al usuario ${targetId}.`,
      'success'
    );
    await Promise.all([fetchFollowing(), fetchPersonalFeed(), fetchPublicFeed()]);
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      showStatus('Tu sesión expiró. Inicia sesión otra vez.', 'error');
      clearAuth();
      return;
    }
    const message =
      error.data?.error ||
      error.data?.message ||
      `No se pudo ${verb} al usuario (código ${error.status || 'desconocido'})`;
    showStatus(message, 'error');
  }
}

async function handlePublicFeedClick(event) {
  const button = event.target.closest('.follow-toggle');
  if (!button) {
    return;
  }

  const userId = sanitizeUserId(button.dataset.userId);
  if (!userId) {
    showStatus('ID de usuario inválido.', 'error');
    return;
  }

  const action = button.dataset.action === 'unfollow' ? 'unfollow' : 'follow';
  await followAction(userId, action);
}

function navigateToCompose() {
  localStorage.setItem('mt_active_tab', 'personal');
  window.location.href = 'compose.html';
}

function clearAuth() {
  state.token = null;
  state.user = null;
  state.following = [];
  state.activeTab = 'public';
  persistState();
  updateAuthUI();
  setActiveTab('public');
  setActiveAuthTab('register');
  showStatus('Sesión cerrada.', 'info');
}

async function handleApiBase(event) {
  event.preventDefault();
  const value = elements.apiBaseInput.value.trim();
  if (!value) {
    showStatus('La URL del gateway no puede estar vacía.', 'error');
    return;
  }
  state.apiBase = value;
  persistState();
  clearStatus();
  refreshActiveTab();
  if (state.user) {
    await fetchFollowing();
    refreshActiveTab();
  }
}

function attachEventListeners() {
  elements.registerForm?.addEventListener('submit', handleRegister);
  elements.loginForm?.addEventListener('submit', handleLogin);
  elements.logoutButton?.addEventListener('click', clearAuth);
  elements.apiBaseForm?.addEventListener('submit', handleApiBase);
  elements.publicFeedList?.addEventListener('click', handlePublicFeedClick);
  elements.personalFeedList?.addEventListener('click', handlePublicFeedClick);
  if (Array.isArray(elements.tabButtons)) {
    elements.tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.disabled) {
          return;
        }
        setActiveTab(button.dataset.tab);
      });
    });
  }
  elements.refreshTab?.addEventListener('click', refreshActiveTab);
  if (Array.isArray(elements.composeButtons)) {
    elements.composeButtons.forEach((button) => {
      button.addEventListener('click', navigateToCompose);
    });
  }
  if (Array.isArray(elements.authTabButtons)) {
    elements.authTabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.disabled) {
          return;
        }
        setActiveAuthTab(button.dataset.tab);
      });
    });
  }
}

function initialize() {
  initElements();
  loadUserFromStorage();
  if (state.user && !state.token) {
    state.user = null;
  }
  if (elements.apiBaseInput) {
    elements.apiBaseInput.value = state.apiBase;
  }
  updateAuthUI();
  attachEventListeners();
  setActiveAuthTab(state.user && state.token ? 'session' : 'register');
  setActiveTab(state.activeTab || 'public');
  if (state.user && state.token) {
    fetchFollowing().then(() => {
      refreshActiveTab();
    });
  }
}

document.addEventListener('DOMContentLoaded', initialize);

