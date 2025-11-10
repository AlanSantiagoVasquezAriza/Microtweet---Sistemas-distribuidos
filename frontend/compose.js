const state = {
  apiBase: localStorage.getItem('mt_api_base') || 'http://localhost:3000',
  token: localStorage.getItem('mt_token'),
  user: null,
};

const elements = {};

function initElements() {
  elements.statusBar = document.getElementById('status-bar');
  elements.form = document.getElementById('compose-form');
  elements.content = document.getElementById('compose-content');
  elements.cancelButton = document.getElementById('cancel-button');
  elements.backButton = document.getElementById('back-button');
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

function persistActiveTab(tab) {
  localStorage.setItem('mt_active_tab', tab);
}

function loadUserFromStorage() {
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

function ensureAuthenticated() {
  if (!state.token || !state.user) {
    persistActiveTab('public');
    window.location.replace('index.html');
    return false;
  }
  return true;
}

function buildUrl(path) {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${state.apiBase.replace(/\/$/, '')}${trimmed}`;
}

async function apiFetch(path, options = {}) {
  const url = buildUrl(path);
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (state.token) {
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

async function handleSubmit(event) {
  event.preventDefault();
  clearStatus();

  const content = elements.content.value.trim();

  if (!content) {
    showStatus('El contenido no puede estar vacío.', 'error');
    return;
  }

  if (content.length > 280) {
    showStatus('El contenido no puede exceder 280 caracteres.', 'error');
    return;
  }

  try {
    showStatus('Publicando nuevo estado...', 'info');
    await apiFetch('/api/tweets', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    showStatus('¡Estado publicado correctamente!', 'success');
    elements.form.reset();
    persistActiveTab('personal');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 750);
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      showStatus('Tu sesión expiró. Redirigiendo al panel...', 'error');
      localStorage.removeItem('mt_token');
      localStorage.removeItem('mt_user');
      persistActiveTab('public');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 650);
      return;
    }

    const message =
      error.data?.error ||
      error.data?.message ||
      `No se pudo publicar el estado (código ${error.status || 'desconocido'})`;
    showStatus(message, 'error');
  }
}

function handleBackNavigation() {
  window.location.href = 'index.html';
}

function attachEventListeners() {
  elements.form?.addEventListener('submit', handleSubmit);
  elements.cancelButton?.addEventListener('click', handleBackNavigation);
  elements.backButton?.addEventListener('click', handleBackNavigation);
}

function initialize() {
  initElements();
  loadUserFromStorage();
  if (!ensureAuthenticated()) {
    return;
  }
  attachEventListeners();
  elements.content?.focus();
}

document.addEventListener('DOMContentLoaded', initialize);

