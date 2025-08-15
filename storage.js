// storage.js — Capa de datos (localStorage)
// Interfaz requerida (y extendida con perfil):
// Storage.loadAll(): Thought[]
// Storage.create(content, parentId = null): Thought
// Storage.toggleHidden(id): void
// Storage.search(query): Thought[]
// Storage.init(): void
// Extra para perfil: Storage.getProfile(), Storage.saveProfile(profile)

(function () {
  const THOUGHTS_KEY = "thoughts.v1";
  const PROFILE_KEY = "profile.v1";

  /** @typedef {{id:string,parentId:string|null,content:string,hidden:boolean,createdAt:number}} Thought */

  const readJSON = (k, fallback) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("storage parse error", e);
      return fallback;
    }
  };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  let cache = /** @type {Thought[]} */ (readJSON(THOUGHTS_KEY, []));
  let profileCache = readJSON(PROFILE_KEY, null);

  function id() {
    return (
      "t_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 7)
    );
  }

  function seedIfEmpty() {
    if (cache && cache.length) return;
    const now = Date.now();
    const roots = [
      {
        id: id(),
        parentId: null,
        content:
          "Un comienzo, no es un buen comienzo, sino hay un comienzo primero. 😄",
        hidden: false,
        createdAt: now - 24 * 60 * 60 * 1000,
      },
      {
        id: id(),
        parentId: null,
        content:
          "Sin dudas, a esta app le falta un montón, pero es un buen comienzo.",
        hidden: false,
        createdAt: now - 20 * 60 * 60 * 1000,
      },
      {
        id: id(),
        parentId: null,
        content:
          "Ideas para hoy: 1) Arreglar estilos 2) Hacer búsquedas 3) Tomar mate.",
        hidden: false,
        createdAt: now - 7 * 60 * 60 * 1000,
      },
    ];
    const replies = [
      {
        id: id(),
        parentId: roots[0].id,
        content: "Totalmente de acuerdo 👏",
        hidden: false,
        createdAt: now - 23 * 60 * 60 * 1000,
      },
      {
        id: id(),
        parentId: roots[1].id,
        content: "Le falta, pero va queriendo.",
        hidden: false,
        createdAt: now - 19 * 60 * 60 * 1000,
      },
    ];
    cache = [...roots, ...replies];
    writeJSON(THOUGHTS_KEY, cache);
  }

  function ensureProfile() {
    if (!profileCache) {
      profileCache = {}; // Start fresh
    }
    if (!profileCache.fullName) {
      profileCache.fullName = "Ezequiel Garcia";
      profileCache.username = "zequegar";
      profileCache.avatar = null;
    }
    if (profileCache.displayNamePref === undefined) {
      profileCache.displayNamePref = "fullName"; // 'fullName' or 'username'
    }
    writeJSON(PROFILE_KEY, profileCache);
  }

  const Storage = {
    /** Carga todo, orden natural (la UI decide si ordenar) */
    async loadAll() {
      return [...cache];
    },

    /** Crea un pensamiento (root o reply) */
    async create(content, parentId = null) {
      const t = {
        id: id(),
        parentId: parentId ?? null,
        content: String(content),
        hidden: false,
        createdAt: Date.now(),
      };
      cache.push(t);
      writeJSON(THOUGHTS_KEY, cache);
      return t;
    },

    /** Toggle hidden */
    async toggleHidden(id) {
      const t = cache.find((x) => x.id === id);
      if (!t) return;
      t.hidden = !t.hidden;
      writeJSON(THOUGHTS_KEY, cache);
    },

    /** Búsqueda por contenido (insensible a mayúsculas) */
    async search(query) {
      const q = String(query || "")
        .trim()
        .toLowerCase();
      if (!q) return [];
      return cache
        .filter((t) => t.content.toLowerCase().includes(q))
        .sort((a, b) => b.createdAt - a.createdAt);
    },

    /** Inicialización (si está vacío, siembra datos) */
    async init() {
      seedIfEmpty();
      ensureProfile();
    },

    /** Perfil (extensión) */
    async getProfile() {
      ensureProfile();
      return { ...profileCache };
    },
    async saveProfile(patch) {
      profileCache = { ...profileCache, ...patch };
      writeJSON(PROFILE_KEY, profileCache);
    },
  };

  // Exponer global
  window.Storage = Storage;
})();
