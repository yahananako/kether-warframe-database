"use client";

import {
  ExternalLink,
  ImagePlus,
  Monitor,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./VisualEditorShell.module.css";

type DeviceMode = "desktop" | "tablet" | "mobile";

type VisualValues = {
  text?: string;
  src?: string;
  styles?: Record<string, string>;
};

type SelectedElement = {
  selector: string;
  tag: string;
  editable: {
    text?: string;
    src?: string;
  };
  computedStyles: Record<string, string>;
};

const PAGE_OPTIONS = [
  { label: "首頁", path: "/" },
  { label: "新版首頁", path: "/home-new" },
  { label: "資料庫總覽", path: "/database/overview" },
  { label: "戰甲", path: "/database/warframes" },
  { label: "Prime 戰甲", path: "/database/warframes/prime" },
  { label: "故事書", path: "/story" },
  { label: "支線故事", path: "/story/side" },
  { label: "氏族", path: "/clan" },
  { label: "BOT", path: "/bot" },
  { label: "個人頁", path: "/profile" },
  { label: "搜尋", path: "/search" },
  { label: "通知", path: "/notifications" },
] as const;

const DEVICE_WIDTH: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

function cleanPath(value: string) {
  const raw = value.trim();

  if (!raw) return "/";

  try {
    const parsed = new URL(raw, window.location.origin);
    const path = parsed.pathname || "/";
    return path.startsWith("/admin") ? "/" : path;
  } catch {
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return path.startsWith("/admin") ? "/" : path;
  }
}

export default function VisualEditorShell() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pagePath, setPagePath] = useState("/");
  const [pathInput, setPathInput] = useState("/");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [draftValues, setDraftValues] = useState<VisualValues>({});
  const [refreshToken, setRefreshToken] = useState(0);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [status, setStatus] = useState("正在確認管理權限…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data as {
        type?: string;
        payload?: SelectedElement;
      };

      if (data.type === "KETHER_ELEMENT_SELECTED" && data.payload) {
        setSelected(data.payload);
        setDraftValues({
          text: data.payload.editable.text,
          src: data.payload.editable.src,
          styles: {},
        });
        setStatus(`已選取 ${data.payload.tag} 元素。`);
      }

      if (data.type === "KETHER_EDITOR_READY") {
        setStatus("編輯畫布已就緒，直接點畫面上的元素開始修改。");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const response = await fetch(
          `/api/visual-overrides?path=${encodeURIComponent(pagePath)}&stage=draft`,
          { cache: "no-store" },
        );

        if (cancelled) return;

        if (response.ok) {
          setAuthorized(true);
          setStatus("管理權限驗證完成。");
          return;
        }

        setAuthorized(false);

        if (response.status === 401) {
          setStatus("請先使用 Discord 登入，再進入 KETHER 管理後台。");
        } else if (response.status === 403) {
          setStatus("目前 Discord 帳號沒有 KETHER 管理權限。");
        } else {
          const payload = await response.json().catch(() => null);
          setStatus(payload?.message || "管理後台目前無法連線。");
        }
      } catch {
        if (!cancelled) {
          setAuthorized(false);
          setStatus("管理後台目前無法連線。");
        }
      }
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [pagePath]);

  function postPreview(values: VisualValues) {
    if (!selected || !iframeRef.current?.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      {
        type: "KETHER_PREVIEW_PATCH",
        selector: selected.selector,
        values,
      },
      window.location.origin,
    );
  }

  function updateText(value: string) {
    setDraftValues((current) => {
      const next = { ...current, text: value };
      postPreview(next);
      return next;
    });
  }

  function updateSrc(value: string) {
    setDraftValues((current) => {
      const next = { ...current, src: value };
      postPreview(next);
      return next;
    });
  }

  function updateStyle(key: string, value: string) {
    setDraftValues((current) => {
      const next = {
        ...current,
        styles: {
          ...(current.styles || {}),
          [key]: value,
        },
      };
      postPreview(next);
      return next;
    });
  }

  function styleValue(key: string) {
    return (
      draftValues.styles?.[key] ??
      selected?.computedStyles?.[key] ??
      ""
    );
  }

  async function saveDraft() {
    if (!selected) {
      setStatus("先在畫面上點選要修改的元素喵。");
      return;
    }

    setBusy(true);
    setStatus("正在儲存草稿…");

    try {
      const response = await fetch("/api/visual-overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pagePath,
          selector: selected.selector,
          values: draftValues,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "草稿儲存失敗。");
      }

      setStatus("草稿已儲存，不會影響正式網站。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "草稿儲存失敗。");
    } finally {
      setBusy(false);
    }
  }

  async function publishPage() {
    setBusy(true);
    setStatus("正在發布此頁修改…");

    try {
      const response = await fetch("/api/visual-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pagePath,
          action: "publish",
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "發布失敗。");
      }

      setStatus(
        `發布完成，共套用 ${payload.publishedCount ?? 0} 個元素修改。`,
      );
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "發布失敗。");
    } finally {
      setBusy(false);
    }
  }

  async function resetSelectedDraft() {
    if (!selected) return;

    setBusy(true);
    setStatus("正在還原此元素草稿…");

    try {
      const response = await fetch(
        `/api/visual-overrides?path=${encodeURIComponent(pagePath)}&selector=${encodeURIComponent(selected.selector)}`,
        { method: "DELETE" },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "還原失敗。");
      }

      setSelected(null);
      setDraftValues({});
      setRefreshToken((value) => value + 1);
      setStatus("已還原到目前正式版本。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "還原失敗。");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>,
    target: "src" | "background",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setBusy(true);
    setStatus("正在上傳素材…");

    try {
      const body = new FormData();
      body.set("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body,
      });
      const payload = await response.json();

      if (!response.ok || !payload.url) {
        throw new Error(payload?.message || "素材上傳失敗。");
      }

      if (target === "src") {
        updateSrc(payload.url);
      } else {
        updateStyle("backgroundImage", `url("${payload.url}")`);
      }

      setStatus("素材已上傳並套用到預覽，記得儲存草稿。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "素材上傳失敗。");
    } finally {
      setBusy(false);
    }
  }

  function navigateToPath(value: string) {
    const nextPath = cleanPath(value);
    setPagePath(nextPath);
    setPathInput(nextPath);
    setSelected(null);
    setDraftValues({});
    setRefreshToken((token) => token + 1);
  }

  const iframeSrc = `${pagePath}?ketherEdit=1&ketherEditorRefresh=${refreshToken}`;

  if (authorized === false) {
    return (
      <main className={styles.denied}>
        <div className={styles.deniedCard}>
          <div className={styles.brand}>KETHER CONTROL</div>
          <h1>管理權限尚未通過</h1>
          <p>{status}</p>
          <a href="/login?next=/admin/editor" className={styles.primaryButton}>
            Discord 登入
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div>
          <div className={styles.brand}>KETHER CONTROL</div>
          <div className={styles.subtitle}>Visual Site Editor</div>
        </div>

        <div className={styles.deviceSwitch}>
          <button
            type="button"
            className={device === "desktop" ? styles.activeDevice : ""}
            onClick={() => setDevice("desktop")}
            title="桌機"
          >
            <Monitor size={17} />
          </button>
          <button
            type="button"
            className={device === "tablet" ? styles.activeDevice : ""}
            onClick={() => setDevice("tablet")}
            title="平板"
          >
            <Tablet size={17} />
          </button>
          <button
            type="button"
            className={device === "mobile" ? styles.activeDevice : ""}
            onClick={() => setDevice("mobile")}
            title="手機"
          >
            <Smartphone size={17} />
          </button>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setRefreshToken((value) => value + 1)}
            disabled={busy}
          >
            <RefreshCw size={16} />
            重新整理
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={saveDraft}
            disabled={busy || !selected}
          >
            <Save size={16} />
            儲存草稿
          </button>
          <button
            type="button"
            className={styles.publishButton}
            onClick={publishPage}
            disabled={busy}
          >
            <Rocket size={16} />
            發布此頁
          </button>
        </div>
      </header>

      <section className={styles.workspace}>
        <aside className={styles.pageRail}>
          <div className={styles.panelTitle}>頁面</div>

          <div className={styles.pathBox}>
            <input
              value={pathInput}
              onChange={(event) => setPathInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") navigateToPath(pathInput);
              }}
              aria-label="頁面路徑"
            />
            <button type="button" onClick={() => navigateToPath(pathInput)}>
              前往
            </button>
          </div>

          <nav className={styles.pageList}>
            {PAGE_OPTIONS.map((item) => (
              <button
                type="button"
                key={item.path}
                className={pagePath === item.path ? styles.activePage : ""}
                onClick={() => navigateToPath(item.path)}
              >
                <span>{item.label}</span>
                <small>{item.path}</small>
              </button>
            ))}
          </nav>

          <div className={styles.adminLinks}>
            <div className={styles.panelTitle}>進階管理</div>
            <a href="/db-status" target="_blank" rel="noreferrer">
              資料庫狀態 <ExternalLink size={13} />
            </a>
            <a href="/bot" target="_blank" rel="noreferrer">
              BOT 管理 <ExternalLink size={13} />
            </a>
            <a href="/clan" target="_blank" rel="noreferrer">
              氏族管理 <ExternalLink size={13} />
            </a>
          </div>
        </aside>

        <section className={styles.canvasArea}>
          <div className={styles.statusBar}>
            <span
              className={
                authorized === true ? styles.statusDotReady : styles.statusDot
              }
            />
            {status}
          </div>

          <div className={styles.canvasScroll}>
            <div
              className={styles.deviceFrame}
              style={{ width: DEVICE_WIDTH[device] }}
            >
              <iframe
                key={iframeSrc}
                ref={iframeRef}
                src={iframeSrc}
                title={`KETHER 編輯預覽 ${pagePath}`}
              />
            </div>
          </div>
        </section>

        <aside className={styles.inspector}>
          <div className={styles.panelTitle}>元素設定</div>

          {!selected ? (
            <div className={styles.emptyInspector}>
              <div className={styles.crosshair}>＋</div>
              <strong>點一下網站畫面</strong>
              <p>
                選取文字、圖片或區塊後，這裡會出現可修改的內容與外觀設定。
              </p>
            </div>
          ) : (
            <>
              <div className={styles.selectedMeta}>
                <strong>&lt;{selected.tag}&gt;</strong>
                <code>{selected.selector}</code>
              </div>

              {selected.editable.text !== undefined && (
                <label className={styles.field}>
                  <span>文字</span>
                  <textarea
                    value={draftValues.text ?? ""}
                    onChange={(event) => updateText(event.target.value)}
                    rows={4}
                  />
                </label>
              )}

              {selected.editable.src !== undefined && (
                <>
                  <label className={styles.field}>
                    <span>圖片 / 媒體網址</span>
                    <input
                      value={draftValues.src ?? ""}
                      onChange={(event) => updateSrc(event.target.value)}
                    />
                  </label>
                  <label className={styles.uploadButton}>
                    <ImagePlus size={16} />
                    上傳替換圖片
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => void uploadImage(event, "src")}
                    />
                  </label>
                </>
              )}

              <div className={styles.sectionDivider}>外觀</div>

              <label className={styles.field}>
                <span>背景色</span>
                <input
                  value={styleValue("backgroundColor")}
                  onChange={(event) =>
                    updateStyle("backgroundColor", event.target.value)
                  }
                  placeholder="rgba(0, 0, 0, 0.6)"
                />
              </label>

              <label className={styles.field}>
                <span>背景圖片 CSS</span>
                <input
                  value={styleValue("backgroundImage")}
                  onChange={(event) =>
                    updateStyle("backgroundImage", event.target.value)
                  }
                  placeholder='url("https://...")'
                />
              </label>

              <label className={styles.uploadButton}>
                <ImagePlus size={16} />
                上傳背景圖片
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => void uploadImage(event, "background")}
                />
              </label>

              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>文字顏色</span>
                  <input
                    value={styleValue("color")}
                    onChange={(event) => updateStyle("color", event.target.value)}
                  />
                </label>
                <label className={styles.field}>
                  <span>字體大小</span>
                  <input
                    value={styleValue("fontSize")}
                    onChange={(event) =>
                      updateStyle("fontSize", event.target.value)
                    }
                    placeholder="24px"
                  />
                </label>
              </div>

              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>字重</span>
                  <input
                    value={styleValue("fontWeight")}
                    onChange={(event) =>
                      updateStyle("fontWeight", event.target.value)
                    }
                    placeholder="700"
                  />
                </label>
                <label className={styles.field}>
                  <span>對齊</span>
                  <select
                    value={styleValue("textAlign")}
                    onChange={(event) =>
                      updateStyle("textAlign", event.target.value)
                    }
                  >
                    <option value="">沿用</option>
                    <option value="left">靠左</option>
                    <option value="center">置中</option>
                    <option value="right">靠右</option>
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>內距 Padding</span>
                <input
                  value={styleValue("padding")}
                  onChange={(event) => updateStyle("padding", event.target.value)}
                  placeholder="16px 24px"
                />
              </label>

              <label className={styles.field}>
                <span>外距 Margin</span>
                <input
                  value={styleValue("margin")}
                  onChange={(event) => updateStyle("margin", event.target.value)}
                  placeholder="0 auto"
                />
              </label>

              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>寬度</span>
                  <input
                    value={styleValue("width")}
                    onChange={(event) => updateStyle("width", event.target.value)}
                    placeholder="100%"
                  />
                </label>
                <label className={styles.field}>
                  <span>高度</span>
                  <input
                    value={styleValue("height")}
                    onChange={(event) => updateStyle("height", event.target.value)}
                    placeholder="auto"
                  />
                </label>
              </div>

              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>圓角</span>
                  <input
                    value={styleValue("borderRadius")}
                    onChange={(event) =>
                      updateStyle("borderRadius", event.target.value)
                    }
                    placeholder="16px"
                  />
                </label>
                <label className={styles.field}>
                  <span>透明度</span>
                  <input
                    value={styleValue("opacity")}
                    onChange={(event) =>
                      updateStyle("opacity", event.target.value)
                    }
                    placeholder="1"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>顯示方式</span>
                <select
                  value={styleValue("display")}
                  onChange={(event) => updateStyle("display", event.target.value)}
                >
                  <option value="">沿用</option>
                  <option value="block">block</option>
                  <option value="flex">flex</option>
                  <option value="grid">grid</option>
                  <option value="inline">inline</option>
                  <option value="inline-flex">inline-flex</option>
                  <option value="none">隱藏</option>
                </select>
              </label>

              <div className={styles.inspectorActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetSelectedDraft}
                  disabled={busy}
                >
                  <RotateCcw size={15} />
                  還原
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={saveDraft}
                  disabled={busy}
                >
                  <Save size={15} />
                  儲存草稿
                </button>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
