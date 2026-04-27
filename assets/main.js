async function render() {
  const res = await fetch("/content.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load content.json: ${res.status}`);
  const c = await res.json();

  document.title = c.name;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", `Personal homepage of ${c.name}.`);

  for (const [key, value] of Object.entries(c)) {
    if (typeof value === "string" || typeof value === "number") {
      setText(key, String(value));
      setHref(key, String(value));
      setSrc(key, String(value));
    }
  }
  setText("year", String(new Date().getFullYear()));

  renderAbout(c.about);
  renderNav(c.nav || []);
  renderLinks(c.links || []);
  renderPublications(c.publications || [], c.highlightAuthor);
  renderExperience(c.experience || []);
}

function renderAbout(about) {
  const container = document.querySelector('[data-bind="about"]');
  if (!container || about == null) return;
  const paragraphs = Array.isArray(about) ? about : [about];
  container.replaceChildren(
    ...paragraphs.map((html) => {
      const p = document.createElement("p");
      p.innerHTML = html;
      p.querySelectorAll("a").forEach((a) => {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
      return p;
    }),
  );
}

function setText(key, value) {
  document
    .querySelectorAll(`[data-bind="${key}"]`)
    .forEach((el) => (el.textContent = value));
}

function setHref(key, value) {
  document
    .querySelectorAll(`[data-bind-href="${key}"]`)
    .forEach((el) => el.setAttribute("href", value));
}

function setSrc(key, value) {
  document.querySelectorAll(`[data-bind-src="${key}"]`).forEach((el) => {
    el.setAttribute("src", value);
    el.addEventListener("error", () => el.remove(), { once: true });
  });
}

const ICONS = {
  github: "fa-brands fa-github",
  linkedin: "fa-brands fa-linkedin",
  email: "fa-solid fa-envelope",
  scholar: "fa-brands fa-google-scholar",
  twitter: "fa-brands fa-x-twitter",
  x: "fa-brands fa-x-twitter",
  orcid: "fa-brands fa-orcid",
  cv: "fa-solid fa-file-pdf",
  link: "fa-solid fa-link",
};

function renderNav(items) {
  const nav = document.querySelector('[data-bind="nav"]');
  if (!nav) return;
  nav.replaceChildren(
    ...items.map(({ label, href }) => {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      return a;
    }),
  );
}

function renderLinks(links) {
  const nav = document.querySelector('[data-bind="links"]');
  if (!nav) return;
  nav.replaceChildren(
    ...links.map(({ icon, label, url }) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", label || icon || url);
      a.title = label || icon || url;

      const i = document.createElement("i");
      i.className = ICONS[icon] || ICONS.link;
      i.setAttribute("aria-hidden", "true");
      a.appendChild(i);
      return a;
    }),
  );
}

function renderPublications(pubs, highlightAuthor) {
  const ul = document.querySelector('[data-bind="publications"]');
  if (!ul) return;
  ul.replaceChildren(
    ...pubs.map((p) => {
      const li = document.createElement("li");
      li.className = "pub";

      const title = document.createElement("div");
      title.className = "pub-title";
      title.textContent = p.title;
      li.appendChild(title);

      if (p.authors) {
        const authors = document.createElement("div");
        authors.className = "pub-authors";
        authors.append(...renderAuthors(p.authors, highlightAuthor));
        li.appendChild(authors);
      }

      const venueParts = [p.venue, p.year].filter(Boolean);
      if (venueParts.length) {
        const venue = document.createElement("div");
        venue.className = "pub-venue";
        venue.textContent = venueParts.join(" · ");
        li.appendChild(venue);
      }

      if (p.links && p.links.length) {
        const linksDiv = document.createElement("div");
        linksDiv.className = "pub-links";
        p.links.forEach(({ label, url }, i) => {
          if (i > 0) linksDiv.append(" · ");
          const a = document.createElement("a");
          a.href = url;
          a.textContent = label;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          linksDiv.appendChild(a);
        });
        li.appendChild(linksDiv);
      }

      return li;
    }),
  );
}

function renderAuthors(authorsString, highlightName) {
  if (!highlightName || !authorsString.includes(highlightName)) {
    return [document.createTextNode(authorsString)];
  }
  const parts = authorsString.split(highlightName);
  const nodes = [];
  parts.forEach((part, i) => {
    if (part) nodes.push(document.createTextNode(part));
    if (i < parts.length - 1) {
      const strong = document.createElement("strong");
      strong.textContent = highlightName;
      nodes.push(strong);
    }
  });
  return nodes;
}

function renderExperience(items) {
  const ul = document.querySelector('[data-bind="experience"]');
  if (!ul) return;
  ul.replaceChildren(
    ...items.map((e) => {
      const li = document.createElement("li");
      li.className = "exp";

      const head = document.createElement("div");
      head.className = "exp-head";
      const role = e.role ? `${e.role}` : "";
      const org = e.org ? `${e.org}` : "";
      head.textContent = [role, org].filter(Boolean).join(" · ");
      li.appendChild(head);

      const metaParts = [e.team, e.location, e.duration].filter(Boolean);
      if (metaParts.length) {
        const meta = document.createElement("div");
        meta.className = "exp-meta";
        meta.textContent = metaParts.join(" · ");
        li.appendChild(meta);
      }

      if (e.description) {
        const desc = document.createElement("div");
        desc.className = "exp-desc";
        desc.innerHTML = e.description;
        li.appendChild(desc);
      }

      if (e.links && e.links.length) {
        const linksDiv = document.createElement("div");
        linksDiv.className = "pub-links";
        e.links.forEach(({ label, url }, i) => {
          if (i > 0) linksDiv.append(" · ");
          const a = document.createElement("a");
          a.href = url;
          a.textContent = label;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          linksDiv.appendChild(a);
        });
        li.appendChild(linksDiv);
      }

      return li;
    }),
  );
}

render().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<pre style="color:#c00;padding:1rem">Failed to load content.json — ${err.message}</pre>`,
  );
});
