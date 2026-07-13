"use client";

import {
  Archive,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  Megaphone,
  Pencil,
  Pin,
  PinOff,
  Plus,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./ClanAnnouncementBoard.module.css";

type Category = "important" | "event" | "general";
type Status = "draft" | "published" | "archived";

type Announcement = {
  id: string;
  title: string;
  content: string;
  category: Category;
  status: Status;
  is_pinned: boolean;
  author_name: string;
  image_pathname: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type ApiResponse = {
  ok?: boolean;
  authenticated?: boolean;
  canManage?: boolean;
  message?: string;
  pathname?: string;
  announcements?: Announcement[];
};

type FormState = {
  title: string;
  content: string;
  category: Category;
  status: Status;
  isPinned: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  category: "general",
  status: "published",
  isPinned: false,
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const categoryLabel: Record<Category, string> = {
  important: "重要",
  event: "活動",
  general: "一般",
};

const statusLabel: Record<Status, string> = {
  draft: "草稿",
  published: "已發布",
  archived: "已下架",
};

function formatDate(value: string | null) {
  if (!value) return "尚未發布";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function protectedImageUrl(pathname: string) {
  return `/api/clan/announcement-image?pathname=${encodeURIComponent(pathname)}`;
}

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<ApiResponse>;
}

export default function ClanAnnouncementBoard() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [existingImagePathname, setExistingImagePathname] = useState<
    string | null
  >(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const localPreviewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const baseResponse = await fetch("/api/clan/announcements", {
        credentials: "include",
        cache: "no-store",
      });
      const base = await readJson(baseResponse);

      if (baseResponse.status === 401) {
        setNeedsLogin(true);
        setCanManage(false);
        setItems([]);
        return;
      }

      if (!baseResponse.ok || !base.ok) {
        throw new Error(base.message || "讀取氏族公告失敗。");
      }

      const manager = base.canManage === true;
      let rows = base.announcements || [];

      if (manager) {
        const response = await fetch("/api/clan/announcements?manage=1", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await readJson(response);

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "讀取公告管理資料失敗。");
        }

        rows = data.announcements || [];
      }

      setNeedsLogin(false);
      setCanManage(manager);
      setItems(rows);
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "氏族公告讀取失敗。",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetImageState() {
    setSelectedImage(null);
    setExistingImagePathname(null);
    setRemoveExistingImage(false);
  }

  function closeEditor() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    resetImageState();
    setEditorOpen(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    resetImageState();
    setEditorOpen(true);
    setNotice(null);
  }

  function startEdit(item: Announcement) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      status: item.status,
      isPinned: item.is_pinned,
    });
    setSelectedImage(null);
    setExistingImagePathname(item.image_pathname);
    setRemoveExistingImage(false);
    setEditorOpen(true);
    setNotice(null);
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setNotice({
        kind: "error",
        text: "圖片僅支援 JPG、PNG、WebP 或 GIF。",
      });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setNotice({ kind: "error", text: "圖片大小必須小於 4 MB。" });
      return;
    }

    setSelectedImage(file);
    setRemoveExistingImage(false);
    setNotice(null);
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/clan/announcement-image", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await readJson(response);

    if (!response.ok || !data.ok || !data.pathname) {
      throw new Error(data.message || "公告圖片上傳失敗。");
    }

    return data.pathname;
  }

  async function clearUnusedImage(pathname: string) {
    await fetch(
      `/api/clan/announcement-image?pathname=${encodeURIComponent(pathname)}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    ).catch(() => undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkingId(editingId || "create");
    setNotice(null);

    let newlyUploadedPathname: string | null = null;

    try {
      let imagePathname = removeExistingImage
        ? null
        : existingImagePathname;

      if (selectedImage) {
        newlyUploadedPathname = await uploadImage(selectedImage);
        imagePathname = newlyUploadedPathname;
      }

      const response = await fetch(
        editingId
          ? `/api/clan/announcements/${editingId}`
          : "/api/clan/announcements",
        {
          method: editingId ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            imagePathname,
          }),
        },
      );
      const data = await readJson(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "儲存氏族公告失敗。");
      }

      setNotice({ kind: "success", text: data.message || "公告已儲存。" });
      closeEditor();
      await load();
    } catch (error) {
      if (newlyUploadedPathname) {
        await clearUnusedImage(newlyUploadedPathname);
      }

      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "儲存氏族公告失敗。",
      });
    } finally {
      setWorkingId(null);
    }
  }

  async function patch(item: Announcement, payload: Record<string, unknown>) {
    setWorkingId(item.id);

    try {
      const response = await fetch(`/api/clan/announcements/${item.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJson(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "更新氏族公告失敗。");
      }

      setNotice({ kind: "success", text: data.message || "公告已更新。" });
      await load();
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "更新氏族公告失敗。",
      });
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(item: Announcement) {
    if (!window.confirm(`確定刪除「${item.title}」嗎？`)) return;
    setWorkingId(item.id);

    try {
      const response = await fetch(`/api/clan/announcements/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await readJson(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "刪除氏族公告失敗。");
      }

      setNotice({ kind: "success", text: data.message || "公告已刪除。" });
      await load();
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "刪除氏族公告失敗。",
      });
    } finally {
      setWorkingId(null);
    }
  }

  const currentImageUrl = localPreviewUrl
    ? localPreviewUrl
    : existingImagePathname && !removeExistingImage
      ? protectedImageUrl(existingImagePathname)
      : null;

  return (
    <details className="home-new-fold-card kether-clan-fold">
      <summary className="home-new-fold-head">
        <span>
          <em>KETHER CLAN ANNOUNCEMENTS</em>
          <strong>氏族公告</strong>
        </span>
        <b aria-hidden="true">⌄</b>
      </summary>

      <section className={`${styles.body} kether-clan-fold-body`}>
        <div className={styles.bar}>
          <div className={styles.badges}>
            {canManage ? <ShieldCheck size={21} /> : <Megaphone size={21} />}
            <strong>{canManage ? "公告管理模式" : "氏族公告板"}</strong>
          </div>

          <div className={styles.bar}>
            <button
              className={styles.soft}
              type="button"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? styles.spin : undefined}
              />
              重新整理
            </button>

            {canManage && (
              <button className={styles.button} type="button" onClick={startCreate}>
                <Plus size={16} />新增公告
              </button>
            )}
          </div>
        </div>

        {notice && (
          <div className={styles.notice} data-kind={notice.kind}>
            {notice.text}
          </div>
        )}

        {needsLogin && (
          <div className={styles.login}>
            <LockKeyhole size={26} />
            <p>請先使用 Discord 登入，通過 KETHER 群組認證後即可閱讀公告。</p>
          </div>
        )}

        {canManage && editorOpen && (
          <form className={styles.editor} onSubmit={submit}>
            <div className={styles.bar}>
              <div>
                <span className={styles.editorEyebrow}>KETHER EDITOR</span>
                <h3>{editingId ? "編輯公告" : "撰寫新公告"}</h3>
              </div>
              <button className={styles.soft} type="button" onClick={closeEditor}>
                <X size={15} />關閉
              </button>
            </div>

            <div className={styles.grid}>
              <div className={`${styles.field} ${styles.wide}`}>
                <label htmlFor="clan-title">公告標題</label>
                <input
                  id="clan-title"
                  maxLength={120}
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="clan-category">分類</label>
                <select
                  id="clan-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as Category,
                    }))
                  }
                >
                  <option value="important">重要</option>
                  <option value="event">活動</option>
                  <option value="general">一般</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="clan-status">發布狀態</label>
                <select
                  id="clan-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as Status,
                    }))
                  }
                >
                  <option value="published">直接發布</option>
                  <option value="draft">儲存草稿</option>
                  {editingId && <option value="archived">下架</option>}
                </select>
              </div>

              <div className={`${styles.field} ${styles.wide}`}>
                <label htmlFor="clan-content">公告內容</label>
                <textarea
                  id="clan-content"
                  maxLength={10000}
                  required
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                />
              </div>

              <div className={`${styles.field} ${styles.wide}`}>
                <label>公告圖片，可選一張</label>
                <div className={styles.imagePicker}>
                  <label className={styles.imageButton}>
                    <ImagePlus size={17} />
                    從裝置選擇圖片
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={chooseImage}
                    />
                  </label>
                  <span>支援 JPG、PNG、WebP、GIF，最大 4 MB</span>
                </div>

                {currentImageUrl && (
                  <div className={styles.previewBox}>
                    <img src={currentImageUrl} alt="公告圖片預覽" />
                    <button
                      className={styles.danger}
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setRemoveExistingImage(true);
                      }}
                    >
                      <Trash2 size={14} />移除圖片
                    </button>
                  </div>
                )}
              </div>
            </div>

            <label className={styles.check}>
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isPinned: event.target.checked,
                  }))
                }
              />
              置頂這則公告
            </label>

            <div className={styles.memberOnlyNote}>
              此頁僅限通過 KETHER Discord 認證的氏族成員閱讀。
            </div>

            <div className={styles.actions}>
              <button className={styles.soft} type="button" onClick={closeEditor}>
                取消
              </button>
              <button
                className={styles.button}
                type="submit"
                disabled={workingId !== null}
              >
                {workingId ? (
                  <LoaderCircle size={16} className={styles.spin} />
                ) : editingId ? (
                  <Save size={16} />
                ) : (
                  <Send size={16} />
                )}
                {editingId ? "儲存修改" : "建立公告"}
              </button>
            </div>
          </form>
        )}

        {!needsLogin && loading && (
          <div className={styles.empty}>
            <LoaderCircle size={26} className={styles.spin} />
            <p>正在讀取氏族公告……</p>
          </div>
        )}

        {!needsLogin && !loading && items.length === 0 && (
          <div className={styles.empty}>
            <Megaphone size={26} />
            <p>目前沒有氏族公告。</p>
          </div>
        )}

        {!needsLogin && items.length > 0 && (
          <div className={styles.list}>
            {items.map((item) => {
              const working = workingId === item.id;

              return (
                <article
                  key={item.id}
                  className={`${styles.card} ${
                    item.is_pinned ? styles.pinned : ""
                  }`}
                >
                  <div className={styles.badges}>
                    {item.is_pinned && (
                      <span className={styles.badge}>
                        <Pin size={12} />置頂
                      </span>
                    )}
                    <span className={styles.badge}>
                      {categoryLabel[item.category]}
                    </span>
                    {canManage && (
                      <span className={styles.badge}>
                        {statusLabel[item.status]}
                      </span>
                    )}
                  </div>

                  <h3>{item.title}</h3>

                  {item.image_pathname && (
                    <img
                      className={styles.announcementImage}
                      src={protectedImageUrl(item.image_pathname)}
                      alt={`${item.title} 公告圖片`}
                      loading="lazy"
                    />
                  )}

                  <div className={styles.content}>{item.content}</div>

                  <div className={styles.meta}>
                    <span>發布者：{item.author_name}</span>
                    <span>
                      時間：{formatDate(item.published_at || item.created_at)}
                    </span>
                  </div>

                  {canManage && (
                    <div className={styles.actions}>
                      <button
                        className={styles.soft}
                        type="button"
                        disabled={working}
                        onClick={() => startEdit(item)}
                      >
                        <Pencil size={14} />編輯
                      </button>
                      <button
                        className={styles.soft}
                        type="button"
                        disabled={working}
                        onClick={() =>
                          void patch(item, { isPinned: !item.is_pinned })
                        }
                      >
                        {item.is_pinned ? (
                          <PinOff size={14} />
                        ) : (
                          <Pin size={14} />
                        )}
                        {item.is_pinned ? "取消置頂" : "置頂"}
                      </button>
                      <button
                        className={styles.soft}
                        type="button"
                        disabled={working}
                        onClick={() =>
                          void patch(item, {
                            status:
                              item.status === "published"
                                ? "archived"
                                : "published",
                          })
                        }
                      >
                        {item.status === "published" ? (
                          <Archive size={14} />
                        ) : (
                          <Send size={14} />
                        )}
                        {item.status === "published" ? "下架" : "發布"}
                      </button>
                      <button
                        className={styles.danger}
                        type="button"
                        disabled={working}
                        onClick={() => void remove(item)}
                      >
                        <Trash2 size={14} />刪除
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </details>
  );
}
