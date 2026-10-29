const api = window.api;

let allUsers = [];

function initUsersList() {
  const tableBody = document.getElementById('users-tbody');
  const totalUsersEl = document.getElementById('total-users-count');
  const displayedCountEl = document.getElementById('displayed-count');
  const totalCountEl = document.getElementById('total-count');
  const searchInput = document.getElementById('search-input');
  const userGreetingEl = document.getElementById('user-greeting');
  const logoutBtn = document.getElementById('logout-btn');

  // Verificar se há sessão ativa para saudar o usuário
  const session = api.getSession();
  if (session && userGreetingEl) {
    userGreetingEl.textContent = `Olá, ${session.nome || session.email || 'Usuário'}`;
    userGreetingEl.classList.remove('hidden');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      api.clearSession();
      window.location.href = './login.html';
    });
  }

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function renderUsers(users) {
    if (!tableBody) return;

    if (users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-xs text-gray-500">
            Nenhum usuário encontrado.
          </td>
        </tr>
      `;
      if (displayedCountEl) displayedCountEl.textContent = '0';
      return;
    }

    tableBody.innerHTML = users.map(user => {
      const initials = getInitials(user.name);
      const formattedId = `#${String(user.id).padStart(3, '0')}`;
      const userPhone = user.phone || 'Não informado';
      const userMail = user.mail || 'Não informado';
      const userName = user.name || 'Sem nome';

      return `
        <tr class="table-row-tech">
          <td class="px-6 py-4 font-mono text-xs text-cyan-400 font-semibold">
            ${formattedId}
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center justify-center">
                ${initials}
              </div>
              <div>
                <span class="font-semibold text-white block">${userName}</span>
                <span class="text-xs text-gray-500">Cadastrado</span>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-xs font-mono text-gray-300">
            ${userPhone}
          </td>
          <td class="px-6 py-4 text-xs text-gray-300">
            ${userMail}
          </td>
          <td class="px-6 py-4">
            <span class="neon-badge px-2.5 py-0.5 rounded-full text-xs font-medium">
              Ativo
            </span>
          </td>
          <td class="px-6 py-4 text-right space-x-2">
            <a href="./user-detail.html?id=${user.id}" class="p-1.5 text-gray-400 hover:text-cyan-400 rounded transition inline-block" title="Ver Detalhes">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </a>
            <a href="./user-edit.html?id=${user.id}" class="p-1.5 text-gray-400 hover:text-cyan-400 rounded transition inline-block" title="Editar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </a>
            <button 
              data-id="${user.id}" 
              data-name="${userName}"
              class="btn-delete p-1.5 text-gray-400 hover:text-red-400 rounded transition inline-block cursor-pointer" 
              title="Excluir"
            >
              <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (displayedCountEl) displayedCountEl.textContent = String(users.length);

    // Adiciona listener aos botões de exclusão
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        const confirmDelete = window.confirm(`Deseja realmente remover o usuário "${name}" (ID: #${id})?`);
        if (!confirmDelete) return;

        try {
          btn.disabled = true;
          await api.deleteUser(id);
          // Recarregar lista
          await fetchUsers();
        } catch (error) {
          alert('Erro ao excluir usuário: ' + error.message);
          btn.disabled = false;
        }
      });
    });
  }

  async function fetchUsers() {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-xs text-cyan-400">
            <span class="inline-block animate-spin mr-2">⟳</span> Carregando registros do servidor Render...
          </td>
        </tr>
      `;
    }

    try {
      allUsers = await api.getUsers();
      if (totalUsersEl) totalUsersEl.textContent = String(allUsers.length);
      if (totalCountEl) totalCountEl.textContent = String(allUsers.length);
      renderUsers(allUsers);
    } catch (error) {
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-8 text-center text-xs text-red-400">
              Falha ao carregar usuários da API (${error.message}). Verifique a conexão com o Render.
            </td>
          </tr>
        `;
      }
    }
  }

  // Filtro de busca
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      if (!term) {
        renderUsers(allUsers);
        return;
      }

      const filtered = allUsers.filter(u => 
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.mail && u.mail.toLowerCase().includes(term)) ||
        (u.id && String(u.id).includes(term)) ||
        (u.phone && String(u.phone).includes(term))
      );
      renderUsers(filtered);
    });
  }

  // Carrega ao iniciar
  fetchUsers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUsersList);
} else {
  initUsersList();
}
