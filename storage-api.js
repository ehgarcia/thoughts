// storage-api.js — Capa de datos (API REST)
(function () {
  const API_URL = '/api'; // La URL base de nuestra API

  const Storage = {
    async loadAll() {
      const res = await fetch(`${API_URL}/thoughts`);
      return res.json();
    },

    async create(content, parentId = null) {
      const res = await fetch(`${API_URL}/thoughts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });
      return res.json();
    },

    async search(query) {
      // La búsqueda ahora la podríamos delegar al backend, pero por simplicidad
      // la mantenemos en el cliente por ahora.
      const all = await this.loadAll();
      const q = String(query || "").trim().toLowerCase();
      if (!q) return [];
      return all
        .filter((t) => t.content.toLowerCase().includes(q))
        .sort((a, b) => b.createdAt - a.createdAt);
    },

    async getProfile() {
      const res = await fetch(`${API_URL}/profile`);
      return res.json();
    },

    async saveProfile(patch) {
       await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    },
    
    // La función init ya no es necesaria, el backend se encarga.
    async init() {} 
  };

  window.Storage = Storage;
})();
