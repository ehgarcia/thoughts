// app.js — Lógica de UI (sin frameworks).
// NOTA: Esta UI usa la capa de datos Storage (storage.js).
// Si en el futuro querés migrar a una API REST, mantené el contrato de Storage
// y no tenés que tocar nada de la UI.

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const escapeHtml = (str) =>
    str.replace(
      /[&<>"']/g,
      (s) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[s])
    );

  const relativeTime = (ts) => {
    const diff = Date.now() - ts;
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (day > 0) return day + "d";
    if (hr > 0) return hr + "h";
    if (min > 0) return min + "m";
    return sec + "s";
  };

  const showToast = (msg) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    setTimeout(() => {
      el.hidden = true;
    }, 1600);
  };

  const debounce = (fn, ms = 250) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Estado compartido
  let thoughtsIndex = new Map(); // id -> thought
  let byParent = new Map(); // parentId -> Thought[]
  let profile = null;

  // Render helpers
  const buildIndex = (list) => {
    thoughtsIndex = new Map(list.map((t) => [t.id, t]));
    byParent = new Map();
    for (const t of list) {
      const arr = byParent.get(t.parentId) || [];
      arr.push(t);
      byParent.set(t.parentId, arr);
    }
    for (const arr of byParent.values())
      arr.sort((a, b) => a.createdAt - b.createdAt); // hijos en orden temporal ascendente
  };

  const ensureAvatar = (el) => {
    if (!profile || !el) return;
    const url = profile.avatar;
    el.style.background = url
      ? `center/cover no-repeat url(${url})`
      : "#d1d5db";
  };

  const thoughtNode = (t) => {
    const li = document.createElement("li");
    li.className = "thought";
    li.setAttribute("role", "treeitem");
    li.dataset.id = t.id;

    const card = document.createElement("div");
    card.className = "card";
    li.appendChild(card);

    const header = document.createElement("div");
    header.className = "thought-header";
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    ensureAvatar(avatar);
    const user = document.createElement("span");
    user.className = "user";
    user.textContent =
      profile?.displayNamePref === "username"
        ? "@" + (profile?.username || "user")
        : profile?.fullName || "Usuario";

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = relativeTime(t.createdAt);

    header.append(avatar, user, time);
    card.appendChild(header);

    const content = document.createElement("div");
    content.className = "content";
    content.innerText = t.content;
    content.id = `content-${t.id}`;
    card.appendChild(content);

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.innerHTML = `
      <button class="action" data-action="reply" aria-label="Responder">Responder</button>
    `;
    card.appendChild(actions);

    const children = byParent.get(t.id) || [];
    if (children.length) {
      li.setAttribute("aria-expanded", "false");
      const ul = document.createElement("ul");
      ul.className = "children collapsed";
      ul.setAttribute("role", "group");

      const collapseBtn = document.createElement("button");
      collapseBtn.className = "action small";
      collapseBtn.dataset.action = "collapse-toggle";
      collapseBtn.setAttribute("aria-label", "Expandir hilo");
      collapseBtn.textContent = "Expandir hilo";
      actions.appendChild(collapseBtn);

      for (const child of children) {
        ul.appendChild(thoughtNode(child));
      }
      li.appendChild(ul);
    } else {
      li.setAttribute("aria-expanded", "true");
    }

    return li;
  };

  const renderFeed = async () => {
    const list = await Storage.loadAll();
    buildIndex(list);
    const roots = (byParent.get(null) || [])
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt);
    const feed = $("#feed");
    if (!feed) return;
    feed.innerHTML = "";

    const composerCard = document.createElement("li");
    composerCard.className = "card composer-prompt";
    composerCard.dataset.openComposer = "";
    composerCard.innerHTML = `
      <span class="avatar"></span>
      <span class="placeholder">¿Qué hay de nuevo?</span>
      <button class="primary">Post</button>
    `;
    ensureAvatar(composerCard.querySelector(".avatar"));
    feed.appendChild(composerCard);

    for (const r of roots) {
      feed.appendChild(thoughtNode(r));
    }
  };

  

  let composerParentId = null;
  const openComposer = (parentId = null) => {
    composerParentId = parentId;
    const dlg = $("#composer");
    ensureAvatar(dlg.querySelector(".avatar"));
    const ctx = $("#replyContext");
    if (parentId) {
      const parts = [];
      let cur = thoughtsIndex.get(parentId);
      while (cur) {
        parts.unshift(cur);
        cur = cur.parentId ? thoughtsIndex.get(cur.parentId) : null;
      }
      ctx.innerHTML = parts
        .map(
          (p, i) =>
            `<div class="muted small">${i + 1}/${parts.length}: ${escapeHtml(
              p.content
            ).slice(0, 140)}</div>`
        )
        .join("");
      ctx.hidden = false;
    } else {
      ctx.hidden = true;
      ctx.innerHTML = "";
    }
    $("#composerInput").value = "";
    $("#charCount").textContent = "0/500";
    $("#composerSubmit").disabled = true;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  };

  const closeComposer = () => {
    const dlg = $("#composer");
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  };

  const initCommon = async () => {
    await Storage.init();
    profile = await Storage.getProfile().catch(() => null);
    ensureAvatar($("#avatarInlineImg") || document.createElement("span"));

    $$(".nav-btn[data-open-composer]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openComposer();
      });
    });

    if ($("#composerForm")) {
      $("#composerForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const raw = $("#composerInput").value.trim();
        const content = escapeHtml(raw).slice(0, 500);
        if (!content) return;
        await Storage.create(content, composerParentId);
        closeComposer();
        showToast("¡Publicado!");
        renderFeed();
      });
      $("#composerInput").addEventListener("input", (e) => {
        const v = e.target.value.slice(0, 500);
        $("#charCount").textContent = v.length + "/500";
        $("#composerSubmit").disabled = v.trim().length === 0;
      });
      $("[data-close-dialog]")?.addEventListener("click", closeComposer);
    }
  };

  const initIndex = async () => {
    await renderFeed();
    const feed = $("#feed");
    if (!feed) return;

    feed.addEventListener("click", (e) => {
      const thoughtLi = e.target.closest("li.thought");
      const actionBtn = e.target.closest("[data-action]");
      const composerPrompt = e.target.closest(".composer-prompt");

      if (composerPrompt) {
        openComposer();
        return;
      }

      if (!thoughtLi) return;
      const id = thoughtLi.dataset.id;

      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === "reply") {
          openComposer(id);
        } else if (action === "collapse-toggle") {
          const children = thoughtLi.querySelector(".children");
          if (!children) return;
          const isCollapsed = children.classList.toggle("collapsed");
          thoughtLi.setAttribute("aria-expanded", !isCollapsed);
          actionBtn.textContent = isCollapsed
            ? "Expandir hilo"
            : "Colapsar hilo";
          actionBtn.setAttribute(
            "aria-label",
            isCollapsed ? "Expandir hilo" : "Colapsar hilo"
          );
        }
      }
    });
  };

  const initSearch = async () => {
    const input = $("#searchInput");
    const results = $("#results");
    const summary = $("#searchSummary");
    const noResults = $("#noResults");

    const doSearch = debounce(async () => {
      const q = input.value.trim();
      results.innerHTML = "";
      summary.textContent = "";
      noResults.hidden = true;

      if (!q) return;

      const found = await Storage.search(q);
      summary.textContent = `${found.length} resultado${
        found.length === 1 ? "" : "s"
      } para "${q}"`;
      noResults.hidden = found.length > 0;

      const re = new RegExp(
        "(" + q.replace(/[.*+?^${}()|[\\]/g, "\\$&") + ")",
        "ig"
      );
      for (const t of found) {
        const li = document.createElement("li");
        li.className = "card result-card";
        const time = relativeTime(t.createdAt);
        const content = escapeHtml(t.content).replace(re, "<mark>$1</mark>");
        li.innerHTML = `
          <div class="thought-header">
            <span class="avatar"></span>
            <span class="user">${profile?.fullName || "Usuario"}</span>
            <span class="username">@${profile?.username || "user"}</span>
            <span class="time">${time}</span>
          </div>
          <div class="content">${content}</div>
        `;
        ensureAvatar(li.querySelector(".avatar"));
        results.appendChild(li);
      }
    }, 250);

    input.addEventListener("input", doSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doSearch();
      }
    });
    input.focus();
  };

  const initProfile = async () => {
    const data = await Storage.getProfile();
    $("#fullName").value = data.fullName || "";
    $("#username").value = data.username || "";
    ensureAvatar($("#profileAvatarPreview"));

    $$("[name=displayNamePref]").forEach(
      (el) => (el.checked = el.value === data.displayNamePref)
    );

    const markDirty = () => ($("#saveProfile").disabled = false);
    $("#fullName").addEventListener("input", markDirty);
    $("#username").addEventListener("input", markDirty);
    $$("[name=displayNamePref]").forEach((el) =>
      el.addEventListener("change", markDirty)
    );

    $("#avatarFile").addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result;
        $(
          "#profileAvatarPreview"
        ).style.background = `center/cover no-repeat url(${url})`;
        $("#saveProfile").disabled = false;
        $("#saveProfile").dataset.avatar = url;
      };
      reader.readAsDataURL(file);
    });

    $("#saveProfile").addEventListener("click", async (e) => {
      e.preventDefault();
      const patch = {
        fullName: $("#fullName").value.trim().slice(0, 60) || "Usuario",
        username:
          $("#username").value.trim().slice(0, 24).replace(/\s+/g, "_") ||
          "user",
        displayNamePref:
          $("[name=displayNamePref]:checked").value || "fullName",
      };
      const newAvatar = e.target.dataset.avatar;
      if (newAvatar) patch.avatar = newAvatar;
      await Storage.saveProfile(patch);
      profile = await Storage.getProfile();
      ensureAvatar($("#avatarInlineImg") || document.createElement("span"));
      ensureAvatar($("#profileAvatarPreview"));
      e.target.disabled = true;
      e.target.removeAttribute("data-avatar");
      showToast("Perfil guardado");
    });

    $("#resetData")?.addEventListener("click", async () => {
      if (!confirm("¿Estás seguro de que quieres borrar todos los datos?"))
        return;
      localStorage.removeItem("thoughts.v1");
      localStorage.removeItem("profile.v1");
      await Storage.init();
      location.href = "index.html";
    });
  };

  // Entrypoint
  document.addEventListener("DOMContentLoaded", async () => {
    await initCommon();
    const page = document.body.dataset.page;
    if (page === "index") await initIndex();
    if (page === "search") await initSearch();
    if (page === "profile") await initProfile();
  });
})();
