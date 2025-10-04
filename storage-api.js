// storage-api.js — Capa de datos (API REST)
(function () {
  const API_URL = '/api'; // La URL base de nuestra API

  const Storage = {
    async loadAll(wallId = 'main') {
      let url = `${API_URL}/thoughts?wallId=${wallId}`;
      if (arguments.length > 1) {
        const limit = arguments[1] ?? 50;
        const skip = arguments[2] ?? 0;
        url += `&limit=${limit}&skip=${skip}`;
      }
      const res = await fetch(url);
      return res.json();
    },

    async create(content, parentId = null, isTrash = false, wallId = 'main') {
      const res = await fetch(`${API_URL}/thoughts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId, isTrash, wallId }),
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

    async getWalls() {
      let url = `${API_URL}/walls`;
      if (arguments.length > 0) {
        const limit = arguments[0] ?? 50;
        const skip = arguments[1] ?? 0;
        url += `?limit=${limit}&skip=${skip}`;
      }
      const res = await fetch(url);
      return res.json();
    },

    async createWall(name) {
      const res = await fetch(`${API_URL}/walls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return res.json();
    },

    // La función init ya no es necesaria, el backend se encarga.
    async init() {}
  };

  window.Storage = Storage;
})();