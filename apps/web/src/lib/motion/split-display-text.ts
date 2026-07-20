/**
 * Lightweight line / word / char splitter for display titles.
 * Produces the same DOM contract as GSAP SplitText for free-tier use,
 * with a revert() that restores original HTML.
 */

export type SplitDisplayTextResult = {
  lines: HTMLElement[];
  words: HTMLElement[];
  chars: HTMLElement[];
  /** Restore original HTML and clear temporary nodes. */
  revert: () => void;
};

export type SplitDisplayTextOptions = {
  /** Class on each line wrapper. Default "line". */
  lineClass?: string;
  /** Class on each word wrapper. Default "word". */
  wordClass?: string;
  /** Class on each char wrapper. Default "char". */
  charClass?: string;
  /**
   * Extra classes for line wrappers (e.g. overflow mask).
   * Default "overflow-hidden block".
   */
  lineExtraClass?: string;
  /** Extra classes for word wrappers. Default "inline-block". */
  wordExtraClass?: string;
  /** Extra classes for char wrappers. Default "inline-block will-change-transform". */
  charExtraClass?: string;
};

const DESCENDERS = new Set(["y", "p", "q", "g", "j"]);

/**
 * Whether a character is a descender glyph (for optional grow doubling).
 */
export function isDescenderChar(char: string): boolean {
  return DESCENDERS.has(char.toLowerCase());
}

/**
 * Split an element into line / word / char spans.
 * Preserves existing element children (e.g. emphasis <span>) by walking text nodes.
 * Visual line breaks come from <br> elements in the original markup.
 */
export function splitDisplayText(
  root: HTMLElement,
  options: SplitDisplayTextOptions = {},
): SplitDisplayTextResult {
  const {
    lineClass = "line",
    wordClass = "word",
    charClass = "char",
    lineExtraClass = "block overflow-hidden",
    wordExtraClass = "inline-block",
    charExtraClass = "inline-block will-change-transform",
  } = options;

  const originalHTML = root.innerHTML;
  const lines: HTMLElement[] = [];
  const words: HTMLElement[] = [];
  const chars: HTMLElement[] = [];

  // Collect segments separated by <br>
  type Segment = { type: "text"; text: string; parentClassName?: string } | { type: "break" };

  const segments: Segment[] = [];

  function walk(node: Node, parentClassName?: string) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text.length > 0) {
        segments.push({ type: "text", text, parentClassName });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "br") {
      segments.push({ type: "break" });
      return;
    }

    // Preserve class on emphasis wrappers so "Every layer." keeps text-primary after split
    const className = el.className || parentClassName;
    for (const child of Array.from(el.childNodes)) {
      walk(child, className);
    }
  }

  for (const child of Array.from(root.childNodes)) {
    walk(child);
  }

  // Group segments into lines (split on breaks)
  const lineGroups: Segment[][] = [[]];
  for (const seg of segments) {
    if (seg.type === "break") {
      lineGroups.push([]);
    } else {
      lineGroups[lineGroups.length - 1].push(seg);
    }
  }

  // Rebuild DOM
  root.innerHTML = "";

  for (const group of lineGroups) {
    // Skip empty trailing lines from trailing <br>
    if (group.length === 0) continue;

    const lineEl = document.createElement("span");
    lineEl.className = [lineClass, lineExtraClass].filter(Boolean).join(" ");
    lineEl.style.display = "block";
    lineEl.style.overflow = "hidden";

    for (const seg of group) {
      if (seg.type !== "text") continue;

      // Split into words on whitespace, keep spaces as separate word nodes
      const parts = seg.text.split(/(\s+)/);
      for (const part of parts) {
        if (part.length === 0) continue;

        const wordEl = document.createElement("span");
        wordEl.className = [wordClass, wordExtraClass].filter(Boolean).join(" ");
        wordEl.style.display = "inline-block";
        if (seg.parentClassName) {
          // Apply emphasis classes (e.g. text-primary) on the word level
          wordEl.className = `${wordEl.className} ${seg.parentClassName}`.trim();
        }

        for (const ch of part) {
          const charEl = document.createElement("span");
          charEl.className = [charClass, charExtraClass].filter(Boolean).join(" ");
          charEl.style.display = "inline-block";
          // Non-breaking space for pure whitespace so layout holds
          charEl.textContent = ch === " " ? "\u00A0" : ch;
          wordEl.appendChild(charEl);
          chars.push(charEl);
        }

        lineEl.appendChild(wordEl);
        words.push(wordEl);
      }
    }

    root.appendChild(lineEl);
    lines.push(lineEl);
  }

  return {
    lines,
    words,
    chars,
    revert: () => {
      root.innerHTML = originalHTML;
    },
  };
}
