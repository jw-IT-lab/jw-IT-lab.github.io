# Site Tutorial

This document is the practical maintenance manual for the current Jia Wang website.

It is written for a very simple goal:

- when you want to change text, know exactly which file to open
- when you want to add a paper, know exactly which object to edit
- when you want to adjust layout, know whether to edit `content.js`, `styles.css`, `script.js`, or the HTML files

If you only remember one sentence, remember this:

- most content changes happen in `content.js`
- most visual changes happen in `styles.css`
- most behavior changes happen in `script.js`
- the HTML files are mostly page skeletons

## 1. Which Files Are Actually in Use

The live site currently uses these files:

- `index.html`
- `publications.html`
- `people.html`
- `news.html`
- `teaching.html`
- `teaching-information-theory.html`
- `teaching-optimal-transport.html`
- `styles.css`
- `script.js`
- `content.js`
- `SITE_TUTORIAL.md`

These are the files you should edit.

Reference files may still exist:

- `Philippe Rigollet.html`
- `Philippe Rigollet_files/`

These are only references. The live site does not load them.

Important:

- old snapshot files like `content.v2.js`, `content.new.js`, `content.refined.js`, `script.new.js`, `script.refined.js` are not part of the current site structure anymore
- if your editor still shows old tabs, treat them as stale tabs and do not edit them

## 2. How the Site Is Organized

The site has three layers.

### Layer A: HTML files

The HTML files define page shells:

- header
- navigation
- main content containers
- footer

Examples:

- `index.html` is the homepage
- `publications.html` is the publications page
- `people.html` is the people page
- `news.html` is the news page
- `teaching.html` is the teaching index
- `teaching-information-theory.html` and `teaching-optimal-transport.html` are the two standalone course pages

In general, do not edit HTML unless:

- you want to add or remove an entire page section
- you want to change the page structure itself
- you want to add a new page

### Layer B: `content.js`

`content.js` is the main content database.

It stores:

- bilingual text
- publications
- people
- teaching data
- news
- homepage research blocks
- formula box data

If you are changing words, names, links, dates, paper metadata, student status, or course information, start with `content.js`.

### Layer C: `styles.css` and `script.js`

`styles.css` controls:

- spacing
- font sizes
- colors
- layout widths
- dark/light appearance
- responsive behavior

`script.js` controls:

- language switching
- theme switching
- motion on/off
- formula box animation
- particle background
- publication filtering and search
- dynamic page rendering

## 3. The Most Common Rule: Edit Content First

When you want to change something, ask this question first:

- "Am I changing what the page says?"

If yes, edit `content.js`.

Ask this second:

- "Am I changing how the page looks?"

If yes, edit `styles.css`.

Ask this third:

- "Am I changing how the page behaves?"

If yes, edit `script.js`.

## 4. Bilingual Content Format

Many fields in `content.js` use this bilingual format:

```js
title: {
  en: "Publications",
  zh: "论文"
}
```

The site automatically chooses English or Chinese depending on the language toggle.

Rules:

- if a field appears in both English and Chinese on the site, use `{ en, zh }`
- if a field is the same in both languages, it may still be stored as `{ en, zh }`
- if a field is purely technical and language-independent, it can be a plain string

Examples of bilingual fields:

- `title`
- `note`
- `outcome`
- `venue`
- `venueNote`
- `label`

Examples of plain-string fields:

- `slug`
- `year`
- `keywords`
- `page`
- `photo`

## 5. Homepage: What to Edit and Where

Open `content.js`.

The homepage is mainly controlled by these blocks:

- `translations.home.hero`
- `homeOverview`
- `recruitmentCopy`
- `researchShowcase`
- `homeFeatured`
- `decoderSources`

### 5.1 Big title and hero text

Search for:

- `translations.home.hero`

Important keys:

- `titleLineOne`
- `titleLineTwo`
- `titleLineThree`
- `lede`
- `primaryCta`
- `secondaryCta`

The current big title is split into three lines on purpose.

Example:

```js
titleLineOne: {
  en: "Information Theory",
  zh: "信息论"
},
titleLineTwo: {
  en: "Optimal Transport",
  zh: "最优传输"
},
titleLineThree: {
  en: "and Learning",
  zh: "与学习理论"
}
```

If you want to change the homepage big title, edit these three lines.

### 5.2 Overview paragraph

Search for:

- `homeOverview`

This is the paragraph below the main homepage hero text.

Example structure:

```js
homeOverview: [
  {
    en: "English paragraph here...",
    zh: "中文段落在这里……"
  }
]
```

You can keep one paragraph or add more than one paragraph.

### 5.3 Recruitment text

Search for:

- `recruitmentCopy`

This controls the dark recruitment/contact section on the homepage.

### 5.4 Research visual blocks

Search for:

- `researchShowcase`

Each item has:

- `index`
- `image`
- `imageAlt`
- `title`
- `body`

Example:

```js
{
  index: "01",
  image: "fig/research-network.svg",
  imageAlt: {
    en: "Abstract visual for network information theory",
    zh: "网络信息论方向的抽象视觉"
  },
  title: {
    en: "Network Information Theory",
    zh: "网络信息论"
  },
  body: {
    en: "Short summary...",
    zh: "简短说明……"
  }
}
```

If you want to replace the picture:

1. put the new image into `fig/`
2. update the `image` path

### 5.5 Formula box

Search for:

- `decoderSources`

Each formula entry supports:

- `name`
- `formula`
- `tex`
- `formulaHtml`

Example:

```js
{
  name: { en: "Entropy Power Inequality", zh: "熵功率不等式" },
  formula: "N(X + Y) >= N(X) + N(Y)",
  tex: "N(X+Y) \\ge N(X)+N(Y)",
  formulaHtml: "N(X + Y) >= N(X) + N(Y)"
}
```

Important:

- `tex` is the preferred version because KaTeX can render it nicely
- `formulaHtml` is the fallback if KaTeX does not load
- the animated output text on the right is controlled by `script.js`, not by `content.js`

If you want to change the size, width, spacing, color, or placement of the formula box, edit `styles.css` and search for:

- `.equation-ribbon`
- `.decoder-panel`
- `.decoder-panel__formula`
- `.decoder-panel__output`

## 6. Publications: The Most Important Section

Open `content.js` and search for:

- `publicationCategoryLabels`
- `publications`
- `homeFeatured`

### 6.1 Publication categories

Current category keys are:

- `theory`
- `transport`
- `generative`
- `imaging`

These keys are used for:

- filter buttons on the publications page
- search indexing
- category tags shown under papers

If you add a new category, do both:

1. add the label in `publicationCategoryLabels`
2. use that category key inside specific publication objects

### 6.2 How to add a paper

Each paper is one object inside `publications`.

Template:

```js
{
  slug: "your-paper-id",
  year: "2026",
  title: "Paper Title",
  authors: "Author A, Author B, Jia Wang",
  venue: {
    en: "Conference or Journal Name",
    zh: "会议或期刊名称"
  },
  venueNote: {
    en: "Oral",
    zh: "Oral"
  },
  categories: ["generative", "imaging"],
  keywords: "search words here",
  links: [
    { label: "IEEE", url: "https://..." },
    { label: "arXiv", url: "https://..." }
  ]
}
```

Meaning of the most important fields:

- `slug`: unique id, used for page anchors such as `publications.html#publication-c2fg`
- `year`: the year shown in the left column
- `title`: paper title
- `authors`: author list as one string
- `venue`: conference or journal name
- `venueNote`: small note shown next to the venue, for example `Oral`, `Highlight`, `Best Paper`
- `categories`: used by filters and tags
- `keywords`: extra hidden search words
- `links`: official links shown below the paper

### 6.3 Very important: red Oral / Highlight text

Current behavior:

- the old badge box is disabled
- `renderBadge()` in `script.js` currently returns an empty string
- therefore the visible red emphasis now comes from `venueNote`

This means:

- if you want `Oral` or `Highlight` to appear in red next to the venue name, edit `venueNote`
- you do not need `badge` or `badgeTone` for the current visual design

Example:

```js
venue: { en: "AAAI 2026", zh: "AAAI 2026" },
venueNote: { en: "Oral", zh: "Oral" }
```

That is the correct way to get red `Oral` text now.

### 6.4 Which links should be used

The current site prefers official links.

Preferred link labels:

- `IEEE`
- `ACM`
- `Springer`
- `Elsevier`
- `MDPI`
- `AAAI`
- `arXiv`

Avoid:

- unofficial mirror sites
- random PDF mirrors
- low-confidence third-party pages

### 6.5 Which papers appear on the homepage

Search for:

- `homeFeatured`

This is simply an array of `slug`s.

Example:

```js
homeFeatured: [
  "c2fg",
  "bbdm",
  "fp-flow"
]
```

If you add a paper and want it to appear on the homepage, add its `slug` here.

### 6.6 Publication search and filters

The publication page search and filters are driven by `script.js`.

Relevant functions:

- `getPublicationSearchText()`
- `getFilteredPublications()`
- `renderPublicationFilters()`
- `renderPublicationResults()`

Only edit these if you want to change behavior.

Examples:

- change search logic
- change multi-filter behavior
- change how `Surprise me` works

If you only want to add a paper, do not touch these functions.

## 7. People: PI, Current Members, Alumni

Open `content.js` and search for:

- `peopleGroups`

The People page is rendered entirely from this data.

Current group structure:

- `Principal Investigator`
- `Current Members`
- `Alumni`

Each person object can contain:

- `name`
- `nameZh`
- `role`
- `note`
- `outcome`
- `photo`
- `links`

### 7.1 Meaning of each field

- `name`: English name
- `nameZh`: Chinese name shown to the right of the English name
- `role`: position such as Professor, M.S. student, Ph.D. alumnus
- `note`: short secondary line, usually graduation year or status
- `outcome`: alumni destination
- `photo`: optional image path
- `links`: personal links such as Homepage, Scholar, GitHub, CV, Email

### 7.2 Example person object

```js
{
  name: "Tianyi Zheng",
  nameZh: "郑天翊",
  role: { en: "Ph.D. alumnus", zh: "博士毕业" },
  note: { en: "Graduated in 2025", zh: "2025 年毕业" },
  outcome: {
    en: "Next: vivo BlueImage Research Institute",
    zh: "去向：vivo 蓝图影像实验室"
  },
  links: [
    { label: { en: "Homepage", zh: "Homepage" }, url: "https://rachelteamo.github.io/" },
    { label: { en: "Scholar", zh: "Scholar" }, url: "https://scholar.google.com/..." },
    { label: { en: "GitHub", zh: "GitHub" }, url: "https://github.com/..." }
  ]
}
```

### 7.3 How photos work

If `photo` exists:

- the page renders the image

If `photo` is missing:

- the page shows initials automatically

To add a photo:

1. put the image in `fig/`
2. set `photo: "fig/your-photo.png"`

### 7.4 How links work

Inside `links`, each item is:

```js
{ label: { en: "Scholar", zh: "Scholar" }, url: "https://..." }
```

Use only high-confidence links.

Recommended labels:

- `Homepage`
- `Scholar`
- `GitHub`
- `CV`
- `Email`

## 8. Teaching: Index Page and Standalone Course Pages

Open `content.js` and search for:

- `teachingCourses`
- `translations.teaching`

The teaching system has two parts:

- `teaching.html`: the overview page listing courses
- standalone course pages: one HTML file for each course

Current standalone course pages:

- `teaching-information-theory.html`
- `teaching-optimal-transport.html`

Each course object in `teachingCourses` supports:

- `slug`
- `page`
- `title`
- `code`
- `semester`
- `offered`
- `summary`
- `overview`
- `topics`
- `reading`

### 8.1 Example course object

```js
{
  slug: "information-theory",
  page: "teaching-information-theory.html",
  title: { en: "Fundamentals of Information Theory", zh: "信息论基础" },
  code: "ICE4313",
  semester: { en: "Autumn", zh: "秋季学期" },
  offered: { en: "Since 2013", zh: "自 2013 年起" },
  summary: {
    en: "Entropy, mutual information, coding theorems...",
    zh: "围绕熵、互信息、编码定理……"
  },
  overview: [
    { en: "Paragraph one...", zh: "第一段……" }
  ],
  topics: [
    { en: "Entropy and mutual information", zh: "熵与互信息" }
  ],
  reading: [
    { en: "Cover and Thomas", zh: "Cover 和 Thomas" }
  ]
}
```

### 8.2 How standalone course pages work

The HTML files use `data-course-slug`.

Current examples:

- `teaching-information-theory.html` uses `data-course-slug="information-theory"`
- `teaching-optimal-transport.html` uses `data-course-slug="optimal-transport"`

`script.js` reads that slug, finds the matching object in `teachingCourses`, and renders the page automatically.

If you add a new course, you must do three things:

1. add the course object to `teachingCourses`
2. create a new HTML file based on an existing course page
3. set the new HTML file's `data-course-slug` to match the new course `slug`

## 9. News

Open `content.js` and search for:

- `newsItems`

Each news item supports:

- `date`
- `title`
- `body`
- `links`

You may still see old `badge` or `badgeTone` fields in some news objects.

Current note:

- badges are visually disabled because `renderBadge()` returns an empty string
- if you want a visible emphasis on the current design, prefer putting important wording directly in the title or body

Example:

```js
{
  date: "2026.02",
  title: {
    en: "C²FG accepted by CVPR 2026 as a Highlight.",
    zh: "C²FG 被 CVPR 2026 以 Highlight 形式录用"
  },
  body: {
    en: "Short summary here.",
    zh: "简短说明在这里。"
  },
  links: [
    { label: { en: "Publication", zh: "论文" }, url: "publications.html#publication-c2fg" }
  ]
}
```

## 10. Navigation, Header, Footer, and Global Labels

Most global text is in `translations`.

Open `content.js` and look for:

- `translations.nav`
- `translations.header`
- `translations.footer`
- `pageTitles`

### 10.1 Navigation labels

Search for:

- `translations.nav`

This controls labels like:

- Overview
- Publications
- Teaching
- People
- News

### 10.2 Header buttons

Search for:

- `translations.header`

This controls:

- motion toggle text
- menu text
- school name text

### 10.3 Footer text

Search for:

- `translations.footer.note`
- `translations.footer.credit`

Important:

- the footer text itself is in `content.js`
- the footer credit link URL is written directly in the HTML files

So if you want to change the footer wording only, edit `content.js`.

If you want to change the actual hyperlink target, edit each HTML file.

## 11. Styling: Fonts, Spacing, Width, Color, Contrast

Open `styles.css`.

This file controls visual design.

### 11.1 Useful CSS blocks to search

Homepage and hero:

- `.hero-editorial`
- `.editorial-copy`
- `.equation-ribbon`
- `.decoder-panel`
- `.decoder-panel__output`
- `.recruitment-band`

Research:

- `.research-showcase`
- `.research-feature`
- `.research-feature__text`

Publications:

- `.home-publication`
- `.home-publication__venue`
- `.publication-entry`
- `.publication-entry__venue`
- `.publication-entry__venue-note`
- `.publication-entry__links`

People:

- `.directory`
- `.directory-item`
- `.directory-item__name`
- `.directory-item__name-en`
- `.directory-item__name-zh`
- `.directory-item__role`
- `.directory-item__note`
- `.directory-item__outcome`

Teaching:

- `.teaching-card`
- `.course-page`
- `.course-meta`
- `.course-section`

News:

- `.news-item`
- `.news-item__titleline`

Header buttons:

- `.theme-toggle`
- `.motion-toggle`
- `.lang-toggle`

### 11.2 If something feels too crowded

Increase:

- `gap`
- `padding`
- `margin-top`
- `max-width`
- `line-height`

### 11.3 If something feels too rounded

Reduce:

- `border-radius`

### 11.4 If dark mode contrast is weak

Search for:

- `html[data-theme="dark"]`

This is where dark-mode-specific overrides live.

## 12. Motion, Theme, Language, and Background Canvas

These interactive systems are mainly in `script.js`.

### 12.1 Language switching

Search for:

- `langStorageKey`
- `updateLangToggle()`
- `applyTranslations()`

### 12.2 Theme switching

Search for:

- `themeStorageKey`
- `applyTheme()`
- `updateThemeToggle()`

The sun/moon icon is generated in `script.js`.

### 12.3 Motion toggle

Search for:

- `motionStorageKey`
- `applyMotionState()`
- `updateMotionToggle()`

Current design:

- motion is off by default
- when motion is on, animated elements can run
- when motion is off, motion-heavy behavior is suppressed

### 12.4 Formula animation

Search for:

- `initializeDecoder()`

This controls:

- the rotating formula source
- the changing `INFORMATION` animation
- static vs animated behavior depending on motion state

### 12.5 Background particle network

Search for:

- `initializeCanvasNest()`
- `initializeLocalCanvasNest()`
- `getCanvasNestConfig()`

Important parameters in `getCanvasNestConfig()`:

- `color`
- `opacity`
- `count`
- `pointAlpha`
- `lineAlpha`
- `pointRadius`
- `lineWidth`
- `maxDistance`
- `mouseDistance`
- `mouseForce`
- `speed`

If you want:

- stronger blue lines: increase `lineAlpha`
- more particles: increase `count`
- more floating motion: increase `speed`
- stronger mouse attraction: increase `mouseForce`

Current implementation is local and does not depend on an external particle library.

## 13. HTML Page Structure and `data-page`

Each HTML file uses `data-page` so `script.js` knows what to render.

Current page identifiers:

- `index.html` -> `data-page="home"`
- `publications.html` -> `data-page="publications"`
- `people.html` -> `data-page="people"`
- `news.html` -> `data-page="news"`
- `teaching.html` -> `data-page="teaching"`

Course pages also use:

- `data-course-slug="information-theory"`
- `data-course-slug="optimal-transport"`

If you ever create a new page, the `data-page` and optional `data-course-slug` must match what `script.js` expects.

## 14. Common Editing Tasks

This section is a quick "where should I edit" map.

### I want to change the homepage title

Edit:

- `content.js` -> `translations.home.hero.titleLineOne`
- `content.js` -> `translations.home.hero.titleLineTwo`
- `content.js` -> `translations.home.hero.titleLineThree`

### I want to change the homepage paragraph

Edit:

- `content.js` -> `homeOverview`

### I want to change the dark recruitment/contact text

Edit:

- `content.js` -> `recruitmentCopy`

### I want to replace a research image

Edit:

- put a new image in `fig/`
- update `content.js` -> `researchShowcase[*].image`

### I want to add a paper

Edit:

- `content.js` -> `publications`

### I want the paper to show Oral or Highlight in red

Edit:

- `content.js` -> that paper's `venueNote`

Example:

```js
venueNote: { en: "Oral", zh: "Oral" }
```

### I want the paper to appear on the homepage

Edit:

- `content.js` -> `homeFeatured`

### I want to add a student or alumni

Edit:

- `content.js` -> `peopleGroups`

### I want to add a Scholar or GitHub link for a member

Edit:

- `content.js` -> `peopleGroups[*].members[*].links`

### I want to change a graduation year

Edit:

- `content.js` -> member `note`

### I want to change a destination after graduation

Edit:

- `content.js` -> member `outcome`

### I want to change font size or spacing

Edit:

- `styles.css`

### I want to change search/filter behavior on Publications

Edit:

- `script.js`

### I want to change theme toggle or motion toggle behavior

Edit:

- `script.js`

## 15. Common Mistakes to Avoid

### Mistake 1: editing the wrong file

Do not edit:

- old snapshot file names
- template reference files

Always check that you are editing one of the current live files listed at the top of this tutorial.

### Mistake 2: using `badge` expecting a visible red box

Current truth:

- `badge` exists in some data objects
- but `renderBadge()` is disabled
- visible red emphasis now comes from `venueNote`

So for current design:

- use `venueNote`
- do not rely on `badge`

### Mistake 3: adding unofficial paper links

Prefer official sources:

- IEEE
- ACM
- Springer
- Elsevier
- MDPI
- AAAI
- arXiv

### Mistake 4: changing CSS when the real problem is content width

If a block looks ugly, first ask:

- is the text too long?
- is the title too long?
- is the wording too repetitive?

Sometimes the best fix is in `content.js`, not in CSS.

### Mistake 5: forgetting bilingual consistency

If you change an English sentence, also check whether the Chinese sentence should be updated.

## 16. Recommended Workflow When You Edit the Site

For small content changes:

1. open `content.js`
2. search for the person/paper/text you want to change
3. edit the relevant object
4. refresh the page

For design changes:

1. locate the visual block in `styles.css`
2. make one small change at a time
3. refresh and compare

For behavior changes:

1. locate the relevant function in `script.js`
2. change one function only
3. test both light and dark mode
4. test both motion off and motion on

## 17. Final Summary

If you are maintaining this site manually, the shortest mental map is:

- `content.js` = data and text
- `styles.css` = appearance
- `script.js` = behavior
- `index.html` and other HTML files = page shells

For this specific site, the single most important special rule is:

- `Oral` and `Highlight` should now be written in `venueNote`, because the old red badge box is intentionally disabled
