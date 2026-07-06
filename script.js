(function () {
  const data = window.SITE_CONTENT;
  if (!data) {
    return;
  }

  const langStorageKey = "jia-wang-site-lang";
  const themeStorageKey = "jia-wang-site-theme";
  const motionStorageKey = "jia-wang-site-motion";
  let lang = "en";
  let theme = "light";
  let motionEnabled = false;
  let revealObserver;
  let decoderTimer = null;
  let decoderIndex = 0;
  let canvasNestInstance = null;
  let localCanvasNest = null;
  let canvasNestTheme = null;

  const publicationState = {
    query: "",
    activeFilters: new Set(["all"]),
    surpriseSlug: null
  };

  const themeIcons = {
    light: `
      <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="4.25"></circle>
        <path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8M5.35 5.35l1.98 1.98M16.67 16.67l1.98 1.98M5.35 18.65l1.98-1.98M16.67 7.33l1.98-1.98"></path>
      </svg>
    `,
    dark: `
      <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M20.2 14.15A8.55 8.55 0 0 1 9.85 3.8a8.7 8.7 0 1 0 10.35 10.35Z"></path>
        <path d="M15.9 5.1h.01M18.45 8.15h.01"></path>
      </svg>
    `
  };

  try {
    const storedLang = window.localStorage.getItem(langStorageKey);
    if (storedLang === "zh" || storedLang === "en") {
      lang = storedLang;
    }
  } catch (error) {
    lang = "en";
  }

  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    if (storedTheme === "dark" || storedTheme === "light") {
      theme = storedTheme;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
  } catch (error) {
    theme = "light";
  }

  try {
    motionEnabled = window.localStorage.getItem(motionStorageKey) === "on";
  } catch (error) {
    motionEnabled = false;
  }

  function pick(value) {
    if (value == null) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    return value[lang] || value.en || value.zh || "";
  }

  function resolve(path) {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), data.translations);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isExternal(url) {
    return /^https?:\/\//.test(url);
  }

  function getInitials(name) {
    return String(name)
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function renderLinks(links, className) {
    if (!links || !links.length) {
      return "";
    }

    return `
      <div class="${className}">
        ${links.map((link) => {
          const attrs = isExternal(link.url) ? ' target="_blank" rel="noreferrer"' : "";
          return `<a href="${escapeHtml(link.url)}"${attrs}>${escapeHtml(pick(link.label || ""))}</a>`;
        }).join("")}
      </div>
    `;
  }

  function renderBadge(badge, tone) {
    return "";
  }

  function renderParagraphs(id, paragraphs) {
    const container = document.getElementById(id);
    if (!container) {
      return;
    }

    container.innerHTML = (paragraphs || [])
      .map((entry) => `<p>${escapeHtml(pick(entry))}</p>`)
      .join("");
  }

  function stopDecoder() {
    if (decoderTimer) {
      window.clearTimeout(decoderTimer);
      decoderTimer = null;
    }
  }

  function setDecoderTimeout(fn, delay) {
    stopDecoder();
    decoderTimer = window.setTimeout(fn, delay);
  }

  function initializeDecoder() {
    stopDecoder();

    const output = document.getElementById("decoder-output");
    const sourceName = document.getElementById("decoder-source-name");
    const sourceFormula = document.getElementById("decoder-source-formula");
    if (!output || !sourceName || !sourceFormula) {
      return;
    }

    const entries = (data.decoderSources || []).map((entry) => ({
      name: pick(entry.name),
      formula: entry.formula || "",
      tex: entry.tex || "",
      formulaHtml: entry.formulaHtml || escapeHtml(entry.formula || "")
    })).filter((entry) => entry.name && entry.formula);

    if (!entries.length) {
      output.textContent = "INFORMATION";
      return;
    }

    const target = "INFORMATION";
    const reduceMotion = !motionEnabled;

    if (reduceMotion) {
      sourceName.textContent = entries[0].name;
      if (window.katex && entries[0].tex) {
        window.katex.render(entries[0].tex, sourceFormula, { throwOnError: false });
      } else {
        sourceFormula.innerHTML = entries[0].formulaHtml;
      }
      output.textContent = target;
      return;
    }

    function randomGlyph(entry) {
      const source = `${entry.formula}${entry.name}`.replace(/\s+/g, "");
      return source[Math.floor(Math.random() * source.length)] || "*";
    }

    function scramble(entry, revealCount) {
      return target.split("").map((char, index) => (
        index < revealCount ? char : randomGlyph(entry)
      )).join("");
    }

    function runCycle() {
      const entry = entries[decoderIndex % entries.length];
      sourceName.textContent = entry.name;
      if (window.katex && entry.tex) {
        window.katex.render(entry.tex, sourceFormula, { throwOnError: false });
      } else {
        sourceFormula.innerHTML = entry.formulaHtml;
      }

      let frame = 0;
      const totalFrames = 28;
      const revealStart = 9;

      function tick() {
        if (frame < revealStart) {
          output.textContent = scramble(entry, 0);
        } else if (frame < totalFrames) {
          const progress = (frame - revealStart) / (totalFrames - revealStart);
          const revealCount = Math.floor(progress * (target.length + 1));
          output.textContent = scramble(entry, revealCount);
        } else {
          output.textContent = target;
          decoderIndex = (decoderIndex + 1) % entries.length;
          setDecoderTimeout(runCycle, 1800);
          return;
        }

        frame += 1;
        setDecoderTimeout(tick, 88);
      }

      tick();
    }

    runCycle();
  }

  function renderResearchShowcase() {
    const container = document.getElementById("research-showcase");
    if (!container) {
      return;
    }

    container.innerHTML = (data.researchShowcase || []).map((item, index) => `
      <article class="research-feature reveal ${index % 2 ? "research-feature--reverse" : ""}">
        <div class="research-feature__visual">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(pick(item.imageAlt))}">
        </div>
        <div class="research-feature__text">
          <p class="research-feature__index">${escapeHtml(item.index)}</p>
          <h3>${escapeHtml(pick(item.title))}</h3>
          <p>${escapeHtml(pick(item.body))}</p>
        </div>
      </article>
    `).join("");
  }

  function getPublicationBySlug(slug) {
    return (data.publications || []).find((publication) => publication.slug === slug);
  }

  function renderPublicationMeta(publication) {
    const authors = pick(publication.authors);
    const venue = pick(publication.venue);
    const venueNote = publication.venueNote ? `<span class="publication-entry__venue-note">${escapeHtml(pick(publication.venueNote))}</span>` : "";
    const authorsLine = authors ? `<p class="publication-entry__authors">${escapeHtml(authors)}</p>` : "";

    return `
      ${authorsLine}
      <p class="publication-entry__venue">
        <span>${escapeHtml(venue)}</span>
        ${venueNote}
      </p>
    `;
  }

  function renderPublicationTags(publication) {
    if (!publication.categories || !publication.categories.length) {
      return "";
    }

    return `
      <div class="publication-entry__categories">
        ${publication.categories.map((category) => {
          const label = data.publicationCategoryLabels[category];
          return `<span class="category-tag">${escapeHtml(pick(label))}</span>`;
        }).join("")}
      </div>
    `;
  }

  function renderHomePublications() {
    const container = document.getElementById("home-publication-list");
    if (!container) {
      return;
    }

    const items = (data.homeFeatured || [])
      .map(getPublicationBySlug)
      .filter(Boolean);

    container.innerHTML = items.map((publication) => `
      <article class="home-publication reveal">
        <div class="home-publication__year">${escapeHtml(publication.year)}</div>
        <div>
          <div class="home-publication__titleline">
            <h3>${escapeHtml(publication.title)}</h3>
            ${renderBadge(publication.badge, publication.badgeTone)}
          </div>
          <p class="home-publication__venue">
            ${escapeHtml(pick(publication.venue))}
            ${publication.venueNote ? `<span>${escapeHtml(pick(publication.venueNote))}</span>` : ""}
          </p>
        </div>
        ${renderLinks(publication.links, "home-publication__links")}
      </article>
    `).join("");
  }

  function renderAvatar(member) {
    if (member.photo) {
      return `
        <div class="directory-item__avatar">
          <img src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)}">
        </div>
      `;
    }

    return `<div class="directory-item__avatar">${escapeHtml(getInitials(member.name))}</div>`;
  }

  function renderPeoplePage() {
    const container = document.getElementById("people-directory");
    if (!container) {
      return;
    }

    container.innerHTML = (data.peopleGroups || []).map((group) => `
      <section class="directory-group reveal">
        <header class="directory-group__header">
          <h2>${escapeHtml(pick(group.title))}</h2>
        </header>
        <div class="directory-group__list">
          ${(group.members || []).map((member) => {
            const note = pick(member.note);
            const outcome = pick(member.outcome);
            const nameEn = `<span class="directory-item__name-en">${escapeHtml(member.name)}</span>`;
            const nameZh = member.nameZh ? `<span class="directory-item__name-zh">${escapeHtml(member.nameZh)}</span>` : "";
            return `
              <article class="directory-item">
                ${renderAvatar(member)}
                <div class="directory-item__body">
                  <h3 class="directory-item__name">${nameEn}${nameZh}</h3>
                  <p class="directory-item__role">${escapeHtml(pick(member.role))}</p>
                  ${note ? `<p class="directory-item__note">${escapeHtml(note)}</p>` : ""}
                  ${outcome ? `<p class="directory-item__outcome">${escapeHtml(outcome)}</p>` : ""}
                  ${renderLinks(member.links, "directory-item__links")}
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");
  }

  function getCourseBySlug(slug) {
    return (data.teachingCourses || []).find((course) => course.slug === slug);
  }

  function renderTeachingIndex() {
    const container = document.getElementById("teaching-course-list");
    if (!container) {
      return;
    }

    const openLabel = pick(resolve("teaching.openCourse"));

    container.innerHTML = (data.teachingCourses || []).map((course) => `
      <article class="teaching-card reveal">
        <div class="teaching-card__body">
          <p class="eyebrow">${escapeHtml(pick(resolve("teaching.kicker")))}</p>
          <h2>${escapeHtml(pick(course.title))}</h2>
          <div class="teaching-card__facts">
            <span>${escapeHtml(course.code || "")}</span>
            <span>${escapeHtml(pick(course.semester))}</span>
            <span>${escapeHtml(pick(course.offered))}</span>
          </div>
          <p class="teaching-card__summary">${escapeHtml(pick(course.summary))}</p>
        </div>
        <a class="button" href="${escapeHtml(course.page)}">${escapeHtml(openLabel)}</a>
      </article>
    `).join("");
  }

  function renderCoursePage() {
    const slug = document.body.dataset.courseSlug;
    if (!slug) {
      return;
    }

    const course = getCourseBySlug(slug);
    if (!course) {
      return;
    }

    const kicker = document.getElementById("course-kicker");
    const title = document.getElementById("course-title");
    const summary = document.getElementById("course-summary");
    const meta = document.getElementById("course-meta");
    const overview = document.getElementById("course-overview");
    const topics = document.getElementById("course-topics");
    const reading = document.getElementById("course-reading");
    const backLink = document.getElementById("course-back-link");
    const courseCodeLabel = pick(resolve("teaching.courseCode"));
    const semesterLabel = pick(resolve("teaching.semester"));
    const offeredLabel = pick(resolve("teaching.offered"));

    if (kicker) {
      kicker.textContent = pick(resolve("teaching.kicker"));
    }
    if (title) {
      title.textContent = pick(course.title);
    }
    if (summary) {
      summary.textContent = pick(course.summary);
    }
    if (backLink) {
      backLink.textContent = pick(resolve("teaching.back"));
    }
    if (meta) {
      meta.innerHTML = `
        <div class="course-meta__item">
          <h2>${escapeHtml(courseCodeLabel)}</h2>
          <p>${escapeHtml(course.code || "")}</p>
        </div>
        <div class="course-meta__item">
          <h2>${escapeHtml(semesterLabel)}</h2>
          <p>${escapeHtml(pick(course.semester))}</p>
        </div>
        <div class="course-meta__item">
          <h2>${escapeHtml(offeredLabel)}</h2>
          <p>${escapeHtml(pick(course.offered))}</p>
        </div>
      `;
    }
    if (overview) {
      overview.innerHTML = (course.overview || []).map((item) => `<p>${escapeHtml(pick(item))}</p>`).join("");
    }
    if (topics) {
      topics.innerHTML = (course.topics || []).map((item) => `<li>${escapeHtml(pick(item))}</li>`).join("");
    }
    if (reading) {
      reading.innerHTML = (course.reading || []).map((item) => `<li>${escapeHtml(pick(item))}</li>`).join("");
    }
  }

  function getAllPublicationCategories() {
    return Object.keys(data.publicationCategoryLabels || {});
  }

  function getPublicationSearchText(publication) {
    const categoryText = (publication.categories || [])
      .map((category) => {
        const label = data.publicationCategoryLabels[category];
        return `${pick(label)} ${label ? label.en || "" : ""}`;
      })
      .join(" ");

    return [
      publication.title,
      pick(publication.authors),
      pick(publication.venue),
      pick(publication.venueNote),
      publication.keywords || "",
      categoryText
    ].join(" ").toLowerCase();
  }

  function getFilteredPublications() {
    if (publicationState.surpriseSlug) {
      const match = getPublicationBySlug(publicationState.surpriseSlug);
      return match ? [match] : [];
    }

    let results = (data.publications || []).slice();

    if (!publicationState.activeFilters.has("all")) {
      const active = Array.from(publicationState.activeFilters);
      results = results.filter((publication) => active.every((filter) => (publication.categories || []).includes(filter)));
    }

    if (publicationState.query) {
      const terms = publicationState.query.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter((publication) => {
        const searchable = getPublicationSearchText(publication);
        return terms.every((term) => searchable.includes(term));
      });
    }

    return results;
  }

  function renderPublicationFilters() {
    const container = document.getElementById("publication-filters");
    if (!container) {
      return;
    }

    const categories = getAllPublicationCategories();
    const allLabel = pick(resolve("publications.all"));

    container.innerHTML = [
      `<button class="filter-chip ${publicationState.activeFilters.has("all") ? "is-active" : ""}" data-publication-filter="all" type="button">${escapeHtml(allLabel)}</button>`,
      ...categories.map((category) => {
        const label = pick(data.publicationCategoryLabels[category]);
        const active = publicationState.activeFilters.has(category) ? "is-active" : "";
        return `<button class="filter-chip ${active}" data-publication-filter="${escapeHtml(category)}" type="button">${escapeHtml(label)}</button>`;
      })
    ].join("");
  }

  function renderPublicationResults() {
    const container = document.getElementById("publication-results");
    const countNode = document.getElementById("publication-count");
    if (!container || !countNode) {
      return;
    }

    const results = getFilteredPublications();
    countNode.textContent = lang === "zh"
      ? `\u5171 ${results.length} \u7bc7`
      : `${results.length} publication${results.length === 1 ? "" : "s"}`;

    if (!results.length) {
      container.innerHTML = `<p class="empty-state">${escapeHtml(pick(resolve("publications.noResults")))}</p>`;
      return;
    }

    container.innerHTML = results.map((publication) => `
      <article class="publication-entry reveal" id="publication-${escapeHtml(publication.slug)}">
        <div class="publication-entry__year">${escapeHtml(publication.year)}</div>
        <div class="publication-entry__body">
          <div class="publication-entry__titleline">
            <h2>${escapeHtml(publication.title)}</h2>
            ${renderBadge(publication.badge, publication.badgeTone)}
          </div>
          ${renderPublicationMeta(publication)}
          ${renderPublicationTags(publication)}
          ${renderLinks(publication.links, "publication-entry__links")}
        </div>
      </article>
    `).join("");
  }

  function renderPublicationExplorer() {
    const searchInput = document.getElementById("publication-search");
    if (!searchInput) {
      return;
    }

    searchInput.value = publicationState.query;
    renderPublicationFilters();
    renderPublicationResults();
  }

  function bindPublicationControls() {
    const searchInput = document.getElementById("publication-search");
    const surpriseButton = document.getElementById("publication-surprise");
    const filterContainer = document.getElementById("publication-filters");

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      searchInput.addEventListener("input", (event) => {
        publicationState.query = event.target.value.trim();
        publicationState.surpriseSlug = null;
        renderPublicationExplorer();
        initializeReveals();
      });
    }

    if (surpriseButton && !surpriseButton.dataset.bound) {
      surpriseButton.dataset.bound = "true";
      surpriseButton.addEventListener("click", () => {
        const items = data.publications || [];
        if (!items.length) {
          return;
        }

        const randomItem = items[Math.floor(Math.random() * items.length)];
        publicationState.query = "";
        publicationState.activeFilters = new Set(["all"]);
        publicationState.surpriseSlug = randomItem.slug;
        renderPublicationExplorer();
        initializeReveals();
        const target = document.getElementById(`publication-${randomItem.slug}`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    if (filterContainer && !filterContainer.dataset.bound) {
      filterContainer.dataset.bound = "true";
      filterContainer.addEventListener("click", (event) => {
        const button = event.target.closest("[data-publication-filter]");
        if (!button) {
          return;
        }

        const filter = button.dataset.publicationFilter;
        publicationState.surpriseSlug = null;

        if (filter === "all") {
          publicationState.activeFilters = new Set(["all"]);
        } else {
          if (publicationState.activeFilters.has("all")) {
            publicationState.activeFilters.delete("all");
          }

          if (publicationState.activeFilters.has(filter)) {
            publicationState.activeFilters.delete(filter);
          } else {
            publicationState.activeFilters.add(filter);
          }

          if (!publicationState.activeFilters.size) {
            publicationState.activeFilters = new Set(["all"]);
          }
        }

        renderPublicationExplorer();
        initializeReveals();
      });
    }
  }

  function renderNewsPage() {
    const container = document.getElementById("news-timeline");
    if (!container) {
      return;
    }

    container.innerHTML = (data.newsItems || []).map((item) => `
      <article class="news-item reveal">
        <div class="news-item__date">${escapeHtml(item.date)}</div>
        <div class="news-item__body">
          <div class="news-item__titleline">
            <h2>${escapeHtml(pick(item.title))}</h2>
            ${renderBadge(item.badge, item.badgeTone)}
          </div>
          <p>${escapeHtml(pick(item.body))}</p>
          ${renderLinks(item.links, "news-item__links")}
        </div>
      </article>
    `).join("");
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = resolve(node.dataset.i18n);
      node.textContent = pick(value);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const value = resolve(node.dataset.i18nPlaceholder);
      node.setAttribute("placeholder", pick(value));
    });
  }

  function updateFooterDate() {
    const nodes = document.querySelectorAll("[data-i18n='footer.note']");
    if (!nodes.length) {
      return;
    }

    try {
      const dateText = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(new Date());

      nodes.forEach((node) => {
        node.textContent = lang === "zh"
          ? `\u6700\u540e\u66f4\u65b0\u4e8e ${dateText}\uff08\u5317\u4eac\u65f6\u95f4\uff09\u3002`
          : `Last updated ${dateText} (Beijing time).`;
      });
    } catch (error) {
      nodes.forEach((node) => {
        node.textContent = pick(resolve("footer.note"));
      });
    }
  }

  function setActiveNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === page);
    });
  }

  function updateDocumentTitle() {
    const page = document.body.dataset.page;
    const pageTitleKey = document.body.dataset.pageTitle || page;
    const pageTitle = data.pageTitles ? data.pageTitles[pageTitleKey] : null;
    if (pageTitle) {
      document.title = pick(pageTitle);
    }
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.lang = lang;
  }

  function updateLangToggle() {
    const button = document.querySelector("[data-lang-toggle]");
    if (!button) {
      return;
    }

    button.textContent = lang === "en" ? "\u4e2d\u6587" : "EN";
    button.setAttribute("aria-label", lang === "en" ? "Switch to Chinese" : "Switch to English");
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
  }

  function applyMotionState() {
    document.documentElement.dataset.motion = motionEnabled ? "on" : "off";
  }

  function updateThemeToggle() {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) {
      return;
    }

    const nextTheme = theme === "dark" ? "light" : "dark";
    button.innerHTML = themeIcons[theme];
    button.dataset.theme = theme;
    button.setAttribute(
      "aria-label",
      lang === "zh"
        ? (nextTheme === "dark" ? "\u5207\u6362\u5230\u6df1\u8272\u6a21\u5f0f" : "\u5207\u6362\u5230\u6d45\u8272\u6a21\u5f0f")
        : (nextTheme === "dark" ? "Switch to dark mode" : "Switch to light mode")
    );
  }

  function updateMotionToggle() {
    const button = document.querySelector("[data-motion-toggle]");
    if (!button) {
      return;
    }

    button.textContent = pick(resolve(motionEnabled ? "header.motionOn" : "header.motionOff"));
    button.setAttribute(
      "aria-label",
      lang === "zh"
        ? (motionEnabled ? "\u5173\u95ed\u52a8\u6548" : "\u5f00\u542f\u52a8\u6548")
        : (motionEnabled ? "Disable motion" : "Enable motion")
    );
  }

  function destroyCanvasNest(root) {
    if (canvasNestInstance && typeof canvasNestInstance.destroy === "function") {
      try {
        canvasNestInstance.destroy();
      } catch (error) {
        // Ignore cleanup failures from third-party code.
      }
    }
    canvasNestInstance = null;
    if (localCanvasNest) {
      if (localCanvasNest.frameId) {
        window.cancelAnimationFrame(localCanvasNest.frameId);
      }
      if (localCanvasNest.handleResize) {
        window.removeEventListener("resize", localCanvasNest.handleResize);
      }
      if (localCanvasNest.handleVisibility) {
        document.removeEventListener("visibilitychange", localCanvasNest.handleVisibility);
      }
      if (localCanvasNest.handlePointerMove) {
        window.removeEventListener("pointermove", localCanvasNest.handlePointerMove);
        window.removeEventListener("pointerdown", localCanvasNest.handlePointerMove);
      }
      if (localCanvasNest.handlePointerLeave) {
        window.removeEventListener("pointerleave", localCanvasNest.handlePointerLeave);
      }
      if (localCanvasNest.handleWindowLeave) {
        window.removeEventListener("blur", localCanvasNest.handleWindowLeave);
      }
      if (localCanvasNest.canvas && localCanvasNest.canvas.parentNode) {
        localCanvasNest.canvas.parentNode.removeChild(localCanvasNest.canvas);
      }
    }
    localCanvasNest = null;
    canvasNestTheme = null;

    if (root) {
      root.style.display = "none";
      root.querySelectorAll("canvas").forEach((node) => node.remove());
    }

    document.querySelectorAll("body > canvas").forEach((node) => node.remove());
  }

  function getCanvasNestConfig() {
    return theme === "dark"
      ? {
          color: "70,120,184",
          opacity: 0.44,
          count: 88,
          zIndex: 0,
          pointAlpha: 0.52,
          lineAlpha: 0.32,
          pointRadius: 1.3,
          lineWidth: 1.2,
          maxDistance: 132,
          mouseDistance: 156,
          mouseForce: 0.00062,
          speed: 0.18
        }
      : {
          color: "82,133,198",
          opacity: 0.36,
          count: 76,
          zIndex: 0,
          pointAlpha: 0.4,
          lineAlpha: 0.26,
          pointRadius: 1.18,
          lineWidth: 1.1,
          maxDistance: 124,
          mouseDistance: 148,
          mouseForce: 0.00054,
          speed: 0.16
        };
  }

  // Keep the background available even when third-party CDNs are blocked.
  function initializeLocalCanvasNest(root) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const config = getCanvasNestConfig();
    const state = {
      canvas,
      context,
      frameId: 0,
      width: 0,
      height: 0,
      points: [],
      handleResize: null,
      handleVisibility: null,
      handlePointerMove: null,
      handlePointerLeave: null,
      handleWindowLeave: null,
      mouse: {
        active: false,
        x: 0,
        y: 0
      }
    };

    function createPoints() {
      const area = state.width * state.height;
      const desiredCount = Math.round(area / 18000);
      const count = Math.min(config.count, Math.max(54, desiredCount));
      state.points = Array.from({ length: count }, () => ({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        vx: (Math.random() - 0.5) * config.speed * 2,
        vy: (Math.random() - 0.5) * config.speed * 2,
        driftX: (Math.random() - 0.5) * config.speed * 1.6,
        driftY: (Math.random() - 0.5) * config.speed * 1.6
      }));
    }

    function resizeCanvas() {
      state.width = root.clientWidth || window.innerWidth;
      state.height = root.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(state.width * dpr));
      canvas.height = Math.max(1, Math.floor(state.height * dpr));
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createPoints();
    }

    function drawFrame() {
      context.clearRect(0, 0, state.width, state.height);

      for (let index = 0; index < state.points.length; index += 1) {
        const point = state.points[index];
        point.driftX += (Math.random() - 0.5) * config.speed * 0.03;
        point.driftY += (Math.random() - 0.5) * config.speed * 0.03;
        point.driftX = Math.max(-config.speed, Math.min(config.speed, point.driftX));
        point.driftY = Math.max(-config.speed, Math.min(config.speed, point.driftY));
        point.vx += (point.driftX - point.vx) * 0.025;
        point.vy += (point.driftY - point.vy) * 0.025;
        point.x += point.vx;
        point.y += point.vy;

        if (point.x <= 0 || point.x >= state.width) {
          point.vx *= -1;
          point.driftX *= -1;
        }
        if (point.y <= 0 || point.y >= state.height) {
          point.vy *= -1;
          point.driftY *= -1;
        }

        point.x = Math.min(Math.max(point.x, 0), state.width);
        point.y = Math.min(Math.max(point.y, 0), state.height);

        if (state.mouse.active) {
          const mouseDx = state.mouse.x - point.x;
          const mouseDy = state.mouse.y - point.y;
          const mouseDistance = Math.hypot(mouseDx, mouseDy);

          if (mouseDistance > 0 && mouseDistance < config.mouseDistance) {
            const attraction = 1 - mouseDistance / config.mouseDistance;
            point.vx += mouseDx * config.mouseForce * attraction;
            point.vy += mouseDy * config.mouseForce * attraction;
          }
        }
      }

      for (let first = 0; first < state.points.length; first += 1) {
        const point = state.points[first];

        context.beginPath();
        context.fillStyle = `rgba(${config.color}, ${config.pointAlpha})`;
        context.arc(point.x, point.y, config.pointRadius, 0, Math.PI * 2);
        context.fill();

        for (let second = first + 1; second < state.points.length; second += 1) {
          const other = state.points[second];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const distance = Math.hypot(dx, dy);

          if (distance > config.maxDistance) {
            continue;
          }

          const alpha = config.lineAlpha * (1 - distance / config.maxDistance);
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(${config.color}, ${alpha})`;
          context.lineWidth = config.lineWidth;
          context.stroke();
        }

        if (state.mouse.active) {
          const mouseDx = point.x - state.mouse.x;
          const mouseDy = point.y - state.mouse.y;
          const mouseDistance = Math.hypot(mouseDx, mouseDy);

          if (mouseDistance < config.mouseDistance) {
            const alpha = Math.min(0.46, config.lineAlpha * 1.7 * (1 - mouseDistance / config.mouseDistance));
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(state.mouse.x, state.mouse.y);
            context.strokeStyle = `rgba(${config.color}, ${alpha})`;
            context.lineWidth = config.lineWidth + 0.18;
            context.stroke();
          }
        }
      }

      state.frameId = window.requestAnimationFrame(drawFrame);
    }

    state.handleResize = () => {
      resizeCanvas();
    };

    state.handleVisibility = () => {
      if (document.hidden) {
        if (state.frameId) {
          window.cancelAnimationFrame(state.frameId);
          state.frameId = 0;
        }
        return;
      }

      if (!state.frameId && motionEnabled) {
        drawFrame();
      }
    };

    state.handlePointerMove = (event) => {
      state.mouse.active = true;
      state.mouse.x = event.clientX;
      state.mouse.y = event.clientY;
    };

    state.handlePointerLeave = () => {
      state.mouse.active = false;
    };

    state.handleWindowLeave = () => {
      state.mouse.active = false;
    };

    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.display = "block";
    canvas.style.opacity = "1";
    root.appendChild(canvas);
    resizeCanvas();
    drawFrame();
    window.addEventListener("resize", state.handleResize);
    document.addEventListener("visibilitychange", state.handleVisibility);
    window.addEventListener("pointermove", state.handlePointerMove);
    window.addEventListener("pointerdown", state.handlePointerMove);
    window.addEventListener("pointerleave", state.handlePointerLeave);
    window.addEventListener("blur", state.handleWindowLeave);
    localCanvasNest = state;
    canvasNestTheme = theme;
  }

  function initializeCanvasNest() {
    const root = document.getElementById("canvas-nest-root");
    if (!root) {
      return;
    }

    if (!motionEnabled) {
      destroyCanvasNest(root);
      return;
    }

    root.style.display = "block";

    if (canvasNestTheme === theme && root.querySelector("canvas")) {
      return;
    }

    destroyCanvasNest(root);
    root.style.display = "block";
    initializeLocalCanvasNest(root);
  }

  function initializeReveals() {
    const nodes = document.querySelectorAll(".reveal");
    if (revealObserver) {
      revealObserver.disconnect();
    }

    if (!motionEnabled || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    nodes.forEach((node) => revealObserver.observe(node));
  }

  function renderPage() {
    applyTheme();
    applyMotionState();
    applyTranslations();
    updateFooterDate();
    setActiveNav();
    updateDocumentTitle();
    updateLangToggle();
    updateThemeToggle();
    updateMotionToggle();
    initializeCanvasNest();
    renderParagraphs("overview-copy", data.homeOverview);
    renderParagraphs("recruitment-copy", data.recruitmentCopy);
    renderResearchShowcase();
    renderHomePublications();
    renderPeoplePage();
    renderTeachingIndex();
    renderCoursePage();
    renderPublicationExplorer();
    renderNewsPage();
    initializeDecoder();
    initializeReveals();
  }

  const langButton = document.querySelector("[data-lang-toggle]");
  if (langButton) {
    langButton.addEventListener("click", () => {
      lang = lang === "en" ? "zh" : "en";
      try {
        window.localStorage.setItem(langStorageKey, lang);
      } catch (error) {
        // Ignore storage errors.
      }
      renderPage();
    });
  }

  const themeButton = document.querySelector("[data-theme-toggle]");
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(themeStorageKey, theme);
      } catch (error) {
        // Ignore storage errors.
      }
      renderPage();
    });
  }

  const motionButton = document.querySelector("[data-motion-toggle]");
  if (motionButton) {
    motionButton.addEventListener("click", () => {
      motionEnabled = !motionEnabled;
      try {
        window.localStorage.setItem(motionStorageKey, motionEnabled ? "on" : "off");
      } catch (error) {
        // Ignore storage errors.
      }
      applyMotionState();
      updateMotionToggle();
      initializeCanvasNest();
      initializeDecoder();
      initializeReveals();
    });
  }

  const menuButton = document.querySelector("[data-menu-toggle]");
  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const open = document.body.dataset.navOpen === "true";
      document.body.dataset.navOpen = open ? "false" : "true";
      menuButton.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.dataset.navOpen = "false";
      if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      document.body.dataset.navOpen = "false";
      if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
      }
    }
  });

  bindPublicationControls();
  renderPage();
})();
