(() => {
  function initUserEdit() {
    const api = window.api;
    if (!api) {
      setTimeout(initUserEdit, 50);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    const form = document.getElementById('edit-user-form');
    const idBadge = document.getElementById('user-id-badge');
    const userSubtitle = document.getElementById('user-subtitle');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const mailInput = document.getElementById('mail');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('btn-submit');
    const submitBtnText = document.getElementById('btn-submit-text');
    const deleteBtn = document.getElementById('btn-delete-user');
    const feedbackBanner = document.getElementById('feedback-banner');
    const feedbackText = document.getElementById('feedback-text');
    const profileLink = document.getElementById('profile-link');

    if (!userId) {
      if (feedbackBanner && feedbackText) {
        feedbackBanner.classList.remove('hidden');
        feedbackBanner.className = 'mb-6 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center space-x-2';
        feedbackText.textContent = 'Nenhum identificador de usuário informado. Redirecionando para a lista...';
      }
      setTimeout(() => {
        window.location.href = './users-list.html';
      }, 2000);
      return;
    }

    if (profileLink) {
      profileLink.href = `./user-detail.html?id=${userId}`;
    }

    function showFeedback(message, isError = true) {
      if (!feedbackBanner || !feedbackText) return;
      feedbackBanner.classList.remove('hidden');
      feedbackText.textContent = message;

      if (isError) {
        feedbackBanner.className = 'mb-6 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center space-x-2';
      } else {
        feedbackBanner.className = 'mb-6 p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs flex items-center space-x-2';
      }
    }

    // Carregar dados atuais do usuário da API
    api.getUser(userId)
      .then(user => {
        if (!user) {
          showFeedback('Usuário não localizado na base de dados.', true);
          return;
        }

        if (idBadge) idBadge.textContent = `ID: #${String(user.id).padStart(3, '0')}`;
        if (userSubtitle) userSubtitle.textContent = `Editando dados de ${user.name || 'usuário'}`;
        if (nameInput) nameInput.value = user.name || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (mailInput) mailInput.value = user.mail || '';
      })
      .catch(error => {
        showFeedback('Falha ao carregar dados do usuário: ' + error.message, true);
      });

    // Salvar alterações
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const mail = mailInput.value.trim();
        const password = passwordInput.value;

        if (!name || !phone || !mail) {
          showFeedback('Por favor, preencha todos os campos cadastrais.', true);
          return;
        }

        if (!password) {
          showFeedback('Por favor, informe a senha atual ou uma nova senha para revalidação do hash.', true);
          return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        if (submitBtnText) submitBtnText.textContent = 'Salvando no Render...';

        try {
          const response = await api.updateUser(userId, { name, phone, mail, password });
          showFeedback(typeof response === 'string' ? response : 'Registro alterado com sucesso!', false);

          setTimeout(() => {
            window.location.href = `./user-detail.html?id=${userId}`;
          }, 1200);

        } catch (error) {
          showFeedback('Erro ao atualizar usuário: ' + error.message, true);
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
          if (submitBtnText) submitBtnText.textContent = 'Salvar Alterações';
        }
      });
    }

    // Ação de exclusão direta na tela de edição
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const confirmDelete = window.confirm(`Deseja realmente excluir permanentemente o usuário #${userId}?`);
        if (!confirmDelete) return;

        try {
          deleteBtn.disabled = true;
          await api.deleteUser(userId);
          alert('Usuário excluído com sucesso!');
          window.location.href = './users-list.html';
        } catch (error) {
          alert('Erro ao excluir: ' + error.message);
          deleteBtn.disabled = false;
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserEdit);
  } else {
    initUserEdit();
  }
})();
