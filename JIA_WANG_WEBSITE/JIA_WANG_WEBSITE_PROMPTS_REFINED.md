# Jia Wang Website Prompt Library (Refined)

This file organizes the core prompts that were implicitly used throughout the making of the Jia Wang website, then refines them into stronger reusable versions.

Goal:

- let the next person get better output with less back-and-forth
- preserve the current site's visual and academic standards
- avoid the repeated mistakes that showed up during the iteration process

This is not a raw transcript. It is a refined prompt library.

## How To Use This File

Recommended workflow:

1. First copy `Prompt 00` as the global guardrail.
2. Then copy one specialized prompt from the relevant section.
3. If the task is small, use `Prompt 11` for a safe micro-edit.
4. If the task involves publications, people, links, dates, or academic claims, always keep the verification requirements.

## Prompt 00: Global Guardrail Prompt

Use this before almost every task.

```text
You are refining Jia Wang's academic homepage. Work only on the current live site files:

- index.html
- publications.html
- people.html
- news.html
- teaching.html
- teaching-information-theory.html
- teaching-optimal-transport.html
- styles.css
- script.js
- content.js
- SITE_TUTORIAL.md

Do not edit historical or snapshot files such as content.v2.js, content.refined.js, content.new.js, script.refined.js, or script.new.js, even if an editor still shows them in old tabs.

Design goals:

- elegant, restrained, research-first
- no "AI slop"
- no excessive rounded cards
- no text stacking for its own sake
- no redundant explanatory filler
- no ugly default or pseudo-typewriter-looking fonts
- no awkward line breaks that make one word occupy one whole line unless explicitly intended

Content goals:

- every research statement must be grounded in Jia Wang's actual papers or verified academic record
- every publication link must be high-confidence and official where possible
- every people link must be added only if identity is highly reliable
- Chinese must read like academic Chinese, not literal translation

Interaction goals:

- desktop and mobile must both work
- WeChat browser compatibility should be considered
- motion should be optional and off by default unless explicitly requested otherwise

Current site-specific rules:

- Oral / Highlight should appear as red text next to the venue through `venueNote`
- the old red badge box is disabled and should not be relied on
- formula rendering should be clean and mathematically correct
- changes should be localized; do not "improve" unrelated parts unless explicitly asked

When the task involves facts that may be wrong or outdated, verify carefully rather than guessing.
```

## Prompt 01: Master Website Redesign Prompt

Use this when building or heavily redesigning the whole site.

```text
Redesign Jia Wang's academic homepage into a high-end research website that feels closer to a top mathematics / information theory / ML faculty homepage than to a generic lab template.

Use the strengths of Philippe Rigollet's homepage and the Information Lab website as inspiration, but do not imitate them mechanically. The final site should feel original, coherent, and academically serious.

Hard constraints:

- do not overuse rounded cards
- do not stack large blocks of text without visual rhythm
- do not use ugly pseudo-typewriter or printer-like fonts
- do not use the original black-yellow Philippe Rigollet dark palette
- the site must feel refined, modern, and mathematically literate
- every page must have clear navigation
- mobile must be robust

Desired outcomes:

- a clean homepage with a strong but not bloated hero section
- a Research section that is image-led and not just text cards
- a Publications page with search/filter structure
- a People page that is academically clean and not over-described
- a Teaching page with standalone course pages
- optional motion, off by default

If you add animation, it must be tasteful, optional, and light on computation.

Deliver:

- revised structure
- revised visual system
- live code changes in the current site files
- concise explanation of what changed and why
```

## Prompt 02: Homepage Hero And Overview Prompt

Use this when refining the homepage top section.

```text
Refine the homepage hero and overview for Jia Wang's academic website.

Requirements:

- the large title should be visually strong but not oversized
- the title should break cleanly and intentionally, not awkwardly
- Jia Wang's photo should anchor the left side cleanly
- the right-side text should be concise, orderly, and free of repetition
- remove trivial decorative formulas or any formula that lowers the page's intellectual tone
- do not over-box the profile area
- reduce filler text and merge redundant profile information

The resulting overview should feel like a top-tier faculty homepage:

- short, confident, mathematically serious
- not verbose
- not marketing-heavy
- not generic

Keep the content research-centered, not resume-centered.
```

## Prompt 03: Research Directions Prompt

Use this when writing or rewriting the Overview -> Research Directions section.

```text
Rewrite the Research Directions section for Jia Wang's homepage.

Rules:

- every research direction must be grounded in Jia Wang's actual papers or verified research agenda
- do not invent broad buzzwords that the publication record does not support
- each direction should have one short, high-density description
- avoid paragraphs that feel like abstract summaries pasted into cards
- prefer one sentence per direction, written in a top-journal-homepage style
- make the English concise and semantically dense
- make the Chinese academic and natural, not literal

Visual guidance:

- each direction should be image-led
- avoid repetitive card language
- avoid the feeling of "box + title + subtitle + filler sentence"

Suggested structure for each direction:

- title
- one image
- one tight explanatory sentence

The tone should feel like: "precise research agenda", not "course catalog" and not "grant proposal".
```

## Prompt 04: Publications Curation And Verification Prompt

Use this when expanding or cleaning the Publications page.

```text
Expand and refine the Publications page for Jia Wang's academic website.

Hard requirements:

- accuracy is more important than quantity
- same-name confusion is unacceptable
- verify authorship carefully
- prefer official links only
- if a paper is IEEE, ACM, Springer, Elsevier, MDPI, AAAI, or arXiv, use the official publisher/platform link
- avoid unofficial PDFs, low-trust mirrors, or decorative link clutter

Presentation rules:

- use concise categories that reflect the actual research structure
- support filtering and search cleanly
- remove redundant explanatory copy such as "this list is selective by design" unless explicitly needed
- use `venueNote` for Oral / Highlight / similar distinctions
- do not use visual badge boxes in the current site design

For each paper, provide:

- title
- authors
- venue
- venueNote if relevant
- categories
- keywords
- official links

If a fact cannot be verified confidently, omit it rather than guessing.
```

## Prompt 05: People Page Prompt

Use this when refining the People section.

```text
Refine the People page for Jia Wang's website.

Structure requirements:

- only three groups: Principal Investigator, Current Members, Alumni
- no redundant explanatory sentences under the group titles
- no extra labels like "verified advisee" unless explicitly requested
- keep the page calm, clean, and academically formatted

For each person:

- show English name and Chinese name together
- keep English typography modern and readable
- keep Chinese typography academically elegant
- add graduation year where known
- add destination for alumni where confirmed
- add Homepage / Scholar / GitHub only when identity is high-confidence

Ordering rules:

- alumni should be ordered by graduation year
- within the same year, keep the order intentional and stable

Tone:

- no biography padding
- no extra explanatory prose
- no directory language that feels administrative
```

## Prompt 06: Teaching Page Prompt

Use this when building or refining Teaching.

```text
Refine the Teaching section of Jia Wang's website.

Requirements:

- Teaching should not be one overloaded page
- each course should have its own standalone page
- every page must keep the global navigation
- the teaching index should act as a clean overview, not a lecture note dump

For each course, include only the essentials:

- course title
- course code
- semester
- offered since
- short summary
- structured overview
- core topics
- key references

The visual tone should match the main site:

- elegant
- restrained
- readable
- academic
```

## Prompt 07: Motion, Formula Box, And Background Prompt

Use this when refining motion and background systems.

```text
Refine the optional motion system for Jia Wang's academic homepage.

Requirements:

- motion must be optional and off by default
- when motion is off, all nonessential animation should disappear cleanly
- when motion is on, only the intended animated elements should activate
- the page should never fade out or break when toggling motion

For the formula box:

- keep the formula box intellectually meaningful
- do not give it a meaningless title
- formulas must render correctly
- the right-side INFORMATION text must stay visually stable
- the box width should not jump during transitions

For the background particle system:

- it should be visible but restrained
- mouse interaction should feel subtle, not sticky or aggressive
- dark and light themes should both work
- avoid requiring heavy hardware

No gimmicks. The effect should feel mathematically atmospheric, not flashy.
```

## Prompt 08: Typography Hierarchy Prompt

Use this when title sizes or hierarchy become messy.

```text
Refine the site's typography hierarchy.

Problems to avoid:

- oversized titles that dominate the page
- too many layers of similar-sized headings
- duplicated titles like "Publications / Publications"
- one-word-per-line line breaks
- unreadable display fonts

What to optimize:

- clear hierarchy from hero title -> page title -> section title -> card title -> metadata
- compact but elegant sizing
- strong readability in both English and Chinese
- visual calm instead of loudness

Do not redesign the whole site. Only rebalance the hierarchy and spacing so the page feels more polished and editorial.
```

## Prompt 09: Chinese Academic Translation Prompt

Use this whenever English text is being translated or polished into Chinese.

```text
Translate and refine the Chinese text for Jia Wang's website in academic Chinese.

Rules:

- do not translate literally when the result sounds awkward
- use language that feels natural on a faculty homepage in China
- prefer concise academic phrasing
- avoid machine-translation tone
- preserve mathematical precision

When translating research descriptions:

- do not over-explain
- do not flatten technical meaning
- keep terminology standard within information theory, optimal transport, diffusion, and rate-distortion theory
```

## Prompt 10: Link Verification Prompt

Use this when adding homepage, scholar, GitHub, DOI, IEEE, or other links.

```text
Verify and add links for Jia Wang's website with a strict high-confidence policy.

Requirements:

- only add a link if identity is clearly confirmed
- if a person has a common name and identity cannot be confirmed confidently, do not add the link
- prefer official academic homepages, official Google Scholar profiles, GitHub profiles clearly associated with the person, and official publisher pages
- remove weak or redundant link labels such as generic DOI when an official publisher landing page is available

For publications:

- prefer IEEE / ACM / Springer / Elsevier / MDPI / AAAI / arXiv links

For people:

- prefer Homepage / Scholar / GitHub
- omit links that are ambiguous
```

## Prompt 11: Safe Micro-Edit Prompt

Use this for small changes when you want the model to avoid touching anything else.

```text
Make exactly the following change and do not modify anything else unless it is strictly necessary for that single change to work.

Rules:

- keep all unrelated layout, styles, links, and copy unchanged
- do not "helpfully" refactor nearby sections
- do not rename files
- do not update unrelated text
- do not change design decisions that were not explicitly mentioned

After the change, verify that the edited file remains syntactically valid.
```

## Prompt 12: Documentation / Tutorial Prompt

Use this when generating or updating the maintenance guide.

```text
Write a detailed, beginner-friendly maintenance tutorial for the Jia Wang website.

The tutorial should explain:

- which files are current live files
- which old snapshot files should not be edited
- what belongs in content.js, styles.css, script.js, and HTML
- how to edit Homepage, Research, Publications, People, Teaching, and News
- how Oral / Highlight currently work in the site
- how to safely add links, people, papers, images, and courses
- how motion, theme, and the background canvas work

The writing should be:

- very clear
- very practical
- easy for a future maintainer to search and use
- organized by task, not just by file name

Assume the next maintainer did not participate in the original website build.
```

## Prompt 13: File Cleanup Prompt

Use this when the folder becomes cluttered.

```text
Clean the Jia Wang website folder carefully.

Requirements:

- identify which files are actually live
- identify which files are historical snapshots, experiments, or unused drafts
- remove only files that are confidently redundant
- never delete a file unless you have first confirmed that the live site does not depend on it
- preserve all current production pages, assets, styles, scripts, and documentation

Before deletion, summarize:

- what is live
- what is redundant
- what will be deleted

The cleanup must reduce clutter without breaking the site.
```

## Prompt 14: Research-Copy Style Prompt

Use this when a research description feels clumsy, repetitive, or too long.

```text
Rewrite the research copy in a top-journal-homepage style.

Desired style:

- concise
- semantically dense
- elegant
- not verbose
- not grant-application language
- not marketing language

Avoid:

- too many "and"
- full abstract-style summaries
- phrases like "recent work develops" unless truly needed
- filler adjectives

Prefer:

- noun-phrase style when appropriate
- semicolons when they improve rhythm
- short, high-information sentences
- phrasing that sounds like an established research agenda
```

## Prompt 15: Mobile / Robustness Prompt

Use this when checking production readiness.

```text
Audit the Jia Wang website for robustness on desktop, mobile, and WeChat browser.

Check:

- no text overflow
- no broken navigation
- no misplaced buttons
- no clipped titles
- no unstable animations
- dark/light toggle readability
- motion on/off behavior
- formula box stability
- publication search usability on smaller screens

Fix issues conservatively. Preserve the site's established visual language.
```

## Prompt 16: Asset Replacement Prompt

Use this when changing images in the Research section or elsewhere.

```text
Replace or add image assets for Jia Wang's website carefully.

Requirements:

- the new image must fit the existing visual language
- the image should support the research topic rather than distract from it
- update the correct image path in content.js
- update the alt text in both English and Chinese if appropriate
- do not break layout on mobile

If an exact image file is provided, use it.

If no image file is provided, choose an existing site asset only if it is clearly suitable; otherwise say that a new dedicated asset would be better.
```

## Prompt 17: Final Polish Prompt

Use this near the end of a redesign cycle.

```text
Perform a final polish pass on Jia Wang's website.

Focus only on high-signal polish:

- typography hierarchy
- spacing rhythm
- contrast in light and dark mode
- redundant copy
- mobile resilience
- academic tone
- research-section clarity
- link cleanliness

Do not introduce new features unless they directly resolve an existing weakness.

The result should feel:

- intentional
- quiet
- mathematically literate
- internationally polished
```

## Prompt Fragments You Can Reuse

These short fragments can be appended to any prompt.

### Fragment A: No Over-Editing

```text
Make the requested change only. Do not touch other sections unless necessary.
```

### Fragment B: Academic Chinese

```text
Rewrite the Chinese so it sounds like polished academic Chinese, not literal translation.
```

### Fragment C: Verification First

```text
Do not guess. If a fact could be wrong, verify it before adding it to the site.
```

### Fragment D: Research-Grounded Copy

```text
Every research description must be grounded in Jia Wang's actual papers or current research record.
```

### Fragment E: Official Links Only

```text
Prefer official publisher and researcher pages. Avoid low-confidence or unofficial links.
```

### Fragment F: Current Site Rule For Honors

```text
Use `venueNote` for Oral / Highlight. Do not rely on badge boxes.
```

## Best Single Prompt For A Future Maintainer

If someone only wants one prompt to start from, use this:

```text
You are refining Jia Wang's academic homepage. Work only on the current live files: index.html, publications.html, people.html, news.html, teaching.html, teaching-information-theory.html, teaching-optimal-transport.html, styles.css, script.js, content.js, and SITE_TUTORIAL.md. Do not edit historical snapshot files even if an editor still shows them.

Preserve the site's established visual language: elegant, restrained, research-first, mathematically literate, and free of generic template aesthetics. Avoid excessive rounded cards, text stacking, redundant copy, clumsy line breaks, weak contrast, and pseudo-typewriter-looking fonts.

Every research claim must be grounded in Jia Wang's actual work. Every publication or people link must be high-confidence and official where possible. Chinese must read like academic Chinese, not literal translation. Mobile and WeChat compatibility matter. Motion should remain optional and lightweight.

For the current site design, Oral / Highlight should be shown through `venueNote` as red text next to the venue, not through badge boxes.

Make the requested change carefully, keep unrelated sections untouched, and explain briefly what was changed.
```

