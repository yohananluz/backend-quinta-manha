const api = window.api;

function initIndex() {
  const statusBadge = document.getElementById('api-status-badge');
  const sessionGreeting = document.getElementById('session-greeting');

  // Verificar sessão ativa
  const session = api.getSession();
  if (session && sessionGreeting) {
    sessionGreeting.textContent = `Sessão ativa: ${session.nome || session.email}`;
    sessionGreeting.classList.remove('hidden');
  }

  // Verificar status da API no Render
  if (statusBadge) {
    fetch(api.baseUrl + '/api/health')
      .then(() => {
        statusBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
          <span class="text-emerald-400 font-semibold">Render API Online</span>
        `;
      })
      .catch(() => {
        statusBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="text-amber-400 font-semibold">Aguardando API</span>
        `;
      });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIndex);
} else {
  initIndex();
}
