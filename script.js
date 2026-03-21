const app = document.querySelector("#quotes-app");
const title = document.querySelector("#page-title");

async function loadQuotes() {
  try {
    const response = await fetch("./README.md", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const markdown = await response.text();
    const { heading, quotes } = parseMarkdown(markdown);

    if (heading) {
      title.textContent = heading;
      document.title = heading;
    }

    renderQuotes(quotes);
  } catch (error) {
    app.innerHTML = `<p class="status">Konnte <code>README.md</code> nicht laden. Starte die Seite über einen lokalen Server, damit <code>fetch()</code> funktioniert.</p>`;
    console.error(error);
  }
}

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const quotes = [];
  let heading = "";
  let currentQuote = [];

  const flushQuote = () => {
    if (currentQuote.length === 0) {
      return;
    }

    quotes.push(currentQuote.join(" ").trim());
    currentQuote = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushQuote();
      continue;
    }

    if (!heading && line.startsWith("# ")) {
      heading = line.slice(2).trim();
      continue;
    }

    if (line.startsWith(">")) {
      currentQuote.push(line.replace(/^>\s?/, ""));
      continue;
    }

    flushQuote();
  }

  flushQuote();

  return { heading, quotes };
}

function renderQuotes(quotes) {
  if (quotes.length === 0) {
    app.innerHTML = `<p class="status">Keine Zitate gefunden. Füge in <code>README.md</code> Zeilen mit <code>&gt;</code> hinzu.</p>`;
    return;
  }

  const orderedQuotes = [...quotes].reverse();

  app.replaceChildren(
    ...orderedQuotes.map((quote, index) => {
      const card = document.createElement("article");
      card.className = "quote-card";
      card.style.animationDelay = `${index * 70}ms`;

      const paragraph = document.createElement("p");
      paragraph.className = "quote-text";
      paragraph.textContent = quote;

      card.append(paragraph);
      return card;
    }),
  );
}

loadQuotes();
