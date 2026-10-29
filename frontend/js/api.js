/**
 * Central API Client for UserCore
 * Backend URL: https://backend-quinta-manha-gu89.onrender.com
 */

(() => {
  // Detecta automaticamente a URL da API: se servido pelo Fastify/Render usa a mesma origem. Se aberto via Live Server (5500) ou file://, usa a URL do Render
  const isStaticDevServer = typeof window !== 'undefined' && (
    window.location.protocol === 'file:' ||
    window.location.port === '5500' ||
    window.location.port === '5501' ||
    window.location.port === '5502'
  );

  const API_BASE_URL = (!isStaticDevServer && typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http'))
    ? window.location.origin
    : 'https://backend-quinta-manha-gu89.onrender.com';

  const apiClient = {
    baseUrl: API_BASE_URL,

    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      try {
        const response = await fetch(url, {
          ...options,
          headers
        });

        // Se a resposta for JSON ou texto puro
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          throw new Error(typeof data === 'string' ? data : (data.mensagem || data.message || 'Erro na requisição'));
        }

        return data;
      } catch (error) {
        console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error);
        throw error;
      }
    },

    // POST /login
    async login(email, senha) {
      try {
        const data = await this.request('/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), senha })
        });

        // O backend pode retornar uma string ou objeto
        if (typeof data === 'string') {
          return { success: false, message: data };
        }

        if (data && data.sucesso === false) {
          return { success: false, message: data.mensagem || 'Usuário ou senha incorreta.' };
        }

        if (data && (data.id || data.email || data.mensagem)) {
          this.saveSession(data);
          return {
            success: true,
            data,
            message: data.mensagem || 'Logado com sucesso!'
          };
        }

        return {
          success: false,
          message: 'Resposta inesperada do servidor.'
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Falha ao autenticar usuário.'
        };
      }
    },

    // GET /users
    async getUsers() {
      const data = await this.request('/users', { method: 'GET' });
      return Array.isArray(data) ? data : [];
    },

    // GET /user/:id
    async getUser(id) {
      return await this.request(`/user/${id}`, { method: 'GET' });
    },

    // POST /user
    async createUser(userData) {
      return await this.request('/user', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    // PUT /user/:id
    async updateUser(id, userData) {
      return await this.request(`/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    },

    // DELETE /user/:id
    async deleteUser(id) {
      return await this.request(`/user/${id}`, {
        method: 'DELETE'
      });
    },

    // Gestão de Sessão (localStorage)
    saveSession(user) {
      try {
        localStorage.setItem('usercore_session', JSON.stringify(user));
      } catch (e) {
        console.warn('Erro ao salvar sessão:', e);
      }
    },

    getSession() {
      try {
        const session = localStorage.getItem('usercore_session');
        return session ? JSON.parse(session) : null;
      } catch (e) {
        return null;
      }
    },

    clearSession() {
      try {
        localStorage.removeItem('usercore_session');
      } catch (e) {
        console.warn('Erro ao limpar sessão:', e);
      }
    }
  };

  // Disponibiliza no escopo global para todos os scripts
  window.api = apiClient;
})();
