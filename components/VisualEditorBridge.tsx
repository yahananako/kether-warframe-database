"use client";

import { useEffect } from "react";

type VisualValues = {
  text?: string;
  src?: string;
  styles?: Record<string, string>;
};

type StoredOverride = {
  selector: string;
  values: VisualValues;
};

const STYLE_KEYS = [
  "backgroundColor",
  "backgroundImage",
  "color",
  "fontSize",
  "fontWeight",
  "textAlign",
  "padding",
  "margin",
  "borderRadius",
  "opacity",
  "width",
  "height",
  "display",
] as const;

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function applyValues(element: HTMLElement, values: VisualValues) {
  if (typeof values.text === "string") {
    element.textContent = values.text;
  }

  if (typeof values.src === "string" && values.src) {
    if (
      element instanceof HTMLImageElement ||
      element instanceof HTMLSourceElement ||
      element instanceof HTMLVideoElement
    ) {
      element.src = values.src;
    } else {
      element.setAttribute("src", values.src);
    }
  }

  if (values.styles) {
    for (const [key, value] of Object.entries(values.styles)) {
      if (!STYLE_KEYS.includes(key as (typeof STYLE_KEYS)[number])) continue;

      if (value) {
        element.style.setProperty(toKebabCase(key), value);
      } else {
        element.style.removeProperty(toKebabCase(key));
      }
    }
  }
}

function cssEscape(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function buildSelector(element: HTMLElement) {
  const editId = element.dataset.ketherEditId;

  if (editId) {
    return `[data-kether-edit-id="${cssEscape(editId)}"]`;
  }

  if (element.id) {
    return `#${cssEscape(element.id)}`;
  }

  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;

    if (!parent) break;

    const sameTagSiblings = Array.from(parent.children).filter(
      (child) => child.tagName === current?.tagName,
    );
    const position = sameTagSiblings.indexOf(current) + 1;

    parts.unshift(
      sameTagSiblings.length > 1 ? `${tag}:nth-of-type(${position})` : tag,
    );

    if (parent.id) {
      parts.unshift(`#${cssEscape(parent.id)}`);
      break;
    }

    current = parent;
  }

  return parts.join(" > ");
}

function canEditText(element: HTMLElement) {
  const tag = element.tagName.toLowerCase();

  return (
    element.children.length === 0 &&
    [
      "a",
      "button",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "label",
      "li",
      "p",
      "small",
      "span",
      "strong",
    ].includes(tag)
  );
}

function readMediaSource(element: HTMLElement) {
  if (element instanceof HTMLImageElement) {
    return element.currentSrc || element.src || "";
  }

  if (element instanceof HTMLVideoElement) {
    return element.currentSrc || element.src || "";
  }

  if (element instanceof HTMLSourceElement) {
    return element.src || "";
  }

  return undefined;
}

function readElement(element: HTMLElement) {
  const computed = window.getComputedStyle(element);
  const styles = Object.fromEntries(
    STYLE_KEYS.map((key) => [
      key,
      computed.getPropertyValue(toKebabCase(key)) || "",
    ]),
  );

  return {
    selector: buildSelector(element),
    tag: element.tagName.toLowerCase(),
    editable: {
      text: canEditText(element) ? element.textContent || "" : undefined,
      src: readMediaSource(element),
    },
    computedStyles: styles,
  };
}

function addEditorStyles() {
  const style = document.createElement("style");
  style.dataset.ketherEditorStyle = "true";
  style.textContent = `
    html.kether-editor-mode *:hover {
      outline: 1px dashed rgba(238, 179, 255, 0.75);
      outline-offset: 2px;
      cursor: crosshair !important;
    }

    html.kether-editor-mode [data-kether-editor-selected="true"] {
      outline: 3px solid rgb(236, 167, 255) !important;
      outline-offset: 3px !important;
    }
  `;
  document.head.appendChild(style);

  return () => style.remove();
}

export default function VisualEditorBridge() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const editMode =
      searchParams.get("ketherEdit") === "1" && window.parent !== window;
    const pagePath = window.location.pathname;
    let selectedElement: HTMLElement | null = null;

    const loadOverrides = async () => {
      try {
        const stage = editMode ? "draft" : "published";
        const response = await fetch(
          `/api/visual-overrides?path=${encodeURIComponent(pagePath)}&stage=${stage}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const payload = (await response.json()) as {
          overrides?: StoredOverride[];
        };

        for (const item of payload.overrides || []) {
          try {
            const element = document.querySelector<HTMLElement>(item.selector);

            if (element) {
              applyValues(element, item.values);
            }
          } catch {
            // A selector may become stale after a page redesign. Ignore it.
          }
        }
      } catch {
        // Published pages must keep working even if the editor service is offline.
      }
    };

    void loadOverrides();

    if (!editMode) {
      return;
    }

    document.documentElement.classList.add("kether-editor-mode");
    const removeEditorStyles = addEditorStyles();

    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();
      event.stopPropagation();

      selectedElement?.removeAttribute("data-kether-editor-selected");
      selectedElement = target;
      selectedElement.setAttribute("data-kether-editor-selected", "true");

      window.parent.postMessage(
        {
          type: "KETHER_ELEMENT_SELECTED",
          payload: readElement(target),
        },
        window.location.origin,
      );
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data as {
        type?: string;
        selector?: string;
        values?: VisualValues;
      };

      if (data.type !== "KETHER_PREVIEW_PATCH" || !data.selector || !data.values) {
        return;
      }

      try {
        const element = document.querySelector<HTMLElement>(data.selector);

        if (element) {
          applyValues(element, data.values);
        }
      } catch {
        // Ignore stale selector patches.
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);

    window.parent.postMessage(
      {
        type: "KETHER_EDITOR_READY",
        path: pagePath,
      },
      window.location.origin,
    );

    return () => {
      selectedElement?.removeAttribute("data-kether-editor-selected");
      document.documentElement.classList.remove("kether-editor-mode");
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
      removeEditorStyles();
    };
  }, []);

  return null;
}
