const api = window.api;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-user-form');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const mailInput = document.getElementById('mail');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('btn-submit');
  const submitBtnText = document.getElementById('btn-submit-text');
  const feedbackBanner = document.getElementById('feedback-banner');
  const feedbackText = document.getElementById('feedback-text');

  if (!form) return;

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const mail = mailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !phone || !mail || !password) {
      showFeedback('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    if (submitBtnText) submitBtnText.textContent = 'Gravando no Render...';

    try {
      const response = await api.createUser({ name, phone, mail, password });
      
      // Realiza a autenticação automática após a criação do cadastro
      try {
        await api.login(mail, password);
      } catch (authError) {
        console.warn('Aviso na autenticação pós-cadastro:', authError);
      }

      showFeedback('Usuário cadastrado e autenticado com sucesso! Redirecionando...', false);

      setTimeout(() => {
        window.location.href = './users-list.html';
      }, 1200);

    } catch (error) {
      showFeedback(error.message || 'Erro ao cadastrar usuário.', true);
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      if (submitBtnText) submitBtnText.textContent = 'Cadastrar Registro';
    }
  });
});
