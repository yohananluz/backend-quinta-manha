const api = window.api;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  const avatarInitialsEl = document.getElementById('avatar-initials');
  const userNameEl = document.getElementById('user-name');
  const userIdBadgeEl = document.getElementById('user-id-badge');
  const userHeaderInfoEl = document.getElementById('user-header-info');
  const editBtnEl = document.getElementById('btn-edit-user');
  const deleteBtnEl = document.getElementById('btn-delete-user');

  const detailIdEl = document.getElementById('detail-id');
  const detailNameEl = document.getElementById('detail-name');
  const detailMailEl = document.getElementById('detail-mail');
  const detailPhoneEl = document.getElementById('detail-phone');
  const detailCreatedEl = document.getElementById('detail-created');

  if (!userId) {
    alert('Nenhum identificador de usuário informado na URL.');
    window.location.href = './users-list.html';
    return;
  }

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  if (editBtnEl) {
    editBtnEl.href = `./user-edit.html?id=${userId}`;
  }

  try {
    const user = await api.getUser(userId);

    if (!user) {
      alert('Usuário não encontrado na base de dados do Render.');
      window.location.href = './users-list.html';
      return;
    }

    const initials = getInitials(user.name);
    const formattedId = `#${String(user.id).padStart(3, '0')}`;
    const userName = user.name || 'Sem nome';
    const userMail = user.mail || 'Não informado';
    const userPhone = user.phone || 'Não informado';

    if (avatarInitialsEl) avatarInitialsEl.textContent = initials;
    if (userNameEl) userNameEl.textContent = userName;
    if (userIdBadgeEl) userIdBadgeEl.textContent = formattedId;
    if (userHeaderInfoEl) userHeaderInfoEl.textContent = `${userMail} • ${userPhone}`;

    if (detailIdEl) detailIdEl.textContent = formattedId;
    if (detailNameEl) detailNameEl.textContent = userName;
    if (detailMailEl) detailMailEl.textContent = userMail;
    if (detailPhoneEl) detailPhoneEl.textContent = userPhone;
    if (detailCreatedEl) {
      if (user.created_at) {
        const d = new Date(user.created_at);
        detailCreatedEl.textContent = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR');
      } else {
        detailCreatedEl.textContent = 'Não registrado';
      }
    }

  } catch (error) {
    alert('Erro ao carregar perfil do usuário: ' + error.message);
  }

  // Deletar da tela de perfil
  if (deleteBtnEl) {
    deleteBtnEl.addEventListener('click', async (e) => {
      e.preventDefault();
      const confirmDelete = window.confirm(`Deseja realmente remover este usuário (#${userId})?`);
      if (!confirmDelete) return;

      try {
        deleteBtnEl.disabled = true;
        await api.deleteUser(userId);
        alert('Usuário removido com sucesso!');
        window.location.href = './users-list.html';
      } catch (error) {
        alert('Erro ao remover: ' + error.message);
        deleteBtnEl.disabled = false;
      }
    });
  }
});
