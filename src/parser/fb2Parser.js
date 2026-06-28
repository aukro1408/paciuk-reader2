function extractText(node) {
  if (!node) return "";

  let text = "";

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent || "";
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child;
      text += extractText(el);
    }
  });

  return text;
}

function parseSection(section, depth = 0) {
  const chapters = [];

  const titleEl = section.querySelector(":scope > title");

  const titleText = titleEl
    ? extractText(titleEl).trim()
    : depth === 0
    ? "Chapter"
    : "";

  const paragraphs = [];

  section.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node;
    const tag = el.tagName.toLowerCase();

    if (tag === "title") {
      const text = extractText(el).trim();
      if (text) paragraphs.push({ type: "title", content: text });
    }

    else if (tag === "subtitle") {
      const text = extractText(el).trim();
      if (text) paragraphs.push({ type: "subtitle", content: text });
    }

    else if (tag === "p") {
      const text = extractText(el).trim();
      if (text) paragraphs.push({ type: "p", content: text });
    }

    else if (tag === "empty-line") {
      paragraphs.push({ type: "empty-line", content: "" });
    }

    else if (tag === "epigraph") {
      const text = extractText(el).trim();
      if (text) paragraphs.push({ type: "epigraph", content: text });
    }

    else if (tag === "poem") {
      const text = extractText(el).trim();
      if (text) paragraphs.push({ type: "poem", content: text });
    }

    else if (tag === "cite") {
      const text = extractText(el).trim();
      if (text) paragraphs.push({ type: "cite", content: text });
    }
  });

  const chapter = {
    id: `chapter-${Math.random().toString(36).substr(2, 9)}`,
    title: titleText || "Chapter",
    paragraphs,
  };

  if (paragraphs.length > 0 || titleText) {
    chapters.push(chapter);
  }

  const nestedSections = section.querySelectorAll(":scope > section");

  nestedSections.forEach((nested) => {
    const nestedChapters = parseSection(nested, depth + 1);
    chapters.push(...nestedChapters);
  });

  return chapters;
}

export async function parseFb2(input, filename) {
  let text;
  if (typeof input === "string") {
    text = input;
  } else {
    text = await input.text();
    if (!filename) filename = input.name;
  }

  const parser = new DOMParser();

  let xmlDoc = parser.parseFromString(text, "application/xml");

  const parseError = xmlDoc.querySelector("parsererror");

  if (parseError) {
    xmlDoc = parser.parseFromString(text, "text/xml");
  }

  // Title
  const titleEl = xmlDoc.querySelector("book-title");

  const title =
    titleEl?.textContent?.trim() ||
    filename.replace(/\.fb2$/i, "");

  // Authors
  const authorEls = xmlDoc.querySelectorAll("title-info > author");

  const authors = [];

  authorEls.forEach((author) => {
    const first =
      author.querySelector("first-name")?.textContent?.trim() || "";

    const middle =
      author.querySelector("middle-name")?.textContent?.trim() || "";

    const last =
      author.querySelector("last-name")?.textContent?.trim() || "";

    const nickname =
      author.querySelector("nickname")?.textContent?.trim() || "";

    const fullName =
      [first, middle, last].filter(Boolean).join(" ") || nickname;

    if (fullName) authors.push(fullName);
  });

  // Description
  const annotationEl = xmlDoc.querySelector("annotation");

  let description = "";

  if (annotationEl) {
    const pEls = annotationEl.querySelectorAll("p");

    const parts = [];

    pEls.forEach((p) => {
      const text = p.textContent?.trim();

      if (text) parts.push(text);
    });

    description = parts.join(" ");
  }

  // Genre
  const genreEls = xmlDoc.querySelectorAll("genre");

  const genre = [];

  genreEls.forEach((g) => {
    const text = g.textContent?.trim();

    if (text) genre.push(text);
  });

  // Language
  const langEl = xmlDoc.querySelector("lang");

  const language =
    langEl?.textContent?.trim() || "ru";

  // Date
  const dateEl = xmlDoc.querySelector("date");

  const date =
    dateEl?.textContent?.trim() ||
    dateEl?.getAttribute("value") ||
    "";

  // Cover image
  let coverImage = null;

  const coverPageEl = xmlDoc.querySelector("coverpage image");

  if (coverPageEl) {
    const href =
      coverPageEl.getAttribute("href") ||
      coverPageEl.getAttribute("l:href") ||
      coverPageEl.getAttribute("xlink:href");

    if (href) {
      const imgId = href.replace("#", "");

      const binaries = xmlDoc.querySelectorAll("binary");

      binaries.forEach((bin) => {
        if (bin.getAttribute("id") === imgId) {
          const contentType =
            bin.getAttribute("content-type") || "image/jpeg";

          const base64Data =
            bin.textContent?.trim().replace(/\s/g, "") || "";

          coverImage = `data:${contentType};base64,${base64Data}`;
        }
      });
    }
  }

  // Fallback cover
  if (!coverImage) {
    const firstBinary =
      xmlDoc.querySelector('binary[content-type^="image"]');

    if (firstBinary) {
      const contentType =
        firstBinary.getAttribute("content-type") || "image/jpeg";

      const base64Data =
        firstBinary.textContent?.trim().replace(/\s/g, "") || "";

      coverImage = `data:${contentType};base64,${base64Data}`;
    }
  }

  // Chapters
  const bodyEl = xmlDoc.querySelector("body");

  const chapters = [];

  if (bodyEl) {
    const sections = bodyEl.querySelectorAll(":scope > section");

    if (sections.length > 0) {
      sections.forEach((section) => {
        const parsed = parseSection(section, 0);
        chapters.push(...parsed);
      });
    } else {
      const paragraphs = [];

      bodyEl.querySelectorAll("p").forEach((p) => {
        const text = extractText(p).trim();

        if (text) {
          paragraphs.push({
            type: "p",
            content: text,
          });
        }
      });

      if (paragraphs.length > 0) {
        chapters.push({
          id: "main",
          title: title,
          paragraphs,
        });
      }
    }
  }

  return {
    title,
    authors,
    description,
    coverImage,
    chapters,
    genre,
    language,
    date,

    progress: 0,
    addedAt: Date.now(),
  };
}
