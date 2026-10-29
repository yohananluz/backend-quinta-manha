function initLogin() {
  const api = window.api;
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const feedbackBanner = document.getElementById('feedback-banner');
  const feedbackText = document.getElementById('feedback-text');
  const submitBtn = document.getElementById('btn-submit');
  const submitBtnText = document.getElementById('btn-submit-text');

  if (!form) return;

  function showFeedback(message, isError = true) {
    if (!feedbackBanner || !feedbackText) return;
    feedbackBanner.classList.remove('hidden');
    feedbackText.textContent = message;

    if (isError) {
      feedbackBanner.className = 'mb-5 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center space-x-2';
    } else {
      feedbackBanner.className = 'mb-5 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs flex items-center space-x-2';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
      showFeedback('Por favor, preencha todos os campos.');
      return;
    }

    // Estado de carregamento
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    if (submitBtnText) submitBtnText.textContent = 'Autenticando...';

    try {
      const result = await api.login(email, senha);

      if (result.success) {
        showFeedback(result.message || 'Logado com sucesso! Redirecionando...', false);
        setTimeout(() => {
          window.location.href = './users-list.html';
        }, 1000);
      } else {
        showFeedback(result.message || 'Usuário ou senha incorreta.', true);
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        if (submitBtnText) submitBtnText.textContent = 'Entrar';
      }
    } catch (error) {
      showFeedback('Não foi possível conectar ao servidor. Tente novamente mais tarde.', true);
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      if (submitBtnText) submitBtnText.textContent = 'Entrar';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}
