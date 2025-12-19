import { useMemo, useState } from "react";
import { createTag, deleteTag, listTags } from "../../lib/tagsStorage";
import { listArticles } from "../../lib/articlesStorage";

export default function TagsList() {
  const [name, setName] = useState("");
  const [tags, setTags] = useState(() => listTags());

  const usageById = useMemo(() => {
    const articles = listArticles();
    const map = new Map<string, number>();
    for (const a of articles) {
      for (const tagId of a.tags ?? []) {
        map.set(tagId, (map.get(tagId) ?? 0) + 1);
      }
    }
    return map;
  }, []);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-lg font-semibold">تگ‌ها</h1>
        <p className="mt-1 text-sm text-foreground/70">مدیریت تگ‌ها و میزان استفاده در مقالات</p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
        <label className="block text-sm font-semibold">ایجاد تگ جدید</label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-4"
            placeholder="مثلاً: زوج درمانی"
          />
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={() => {
              const created = createTag(name);
              if (!created) return;
              setName("");
              setTags(listTags());
            }}
          >
            افزودن
          </button>
        </div>
        <div className="mt-2 text-xs text-foreground/70">نام تکراری پذیرفته نمی‌شود.</div>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white/60 p-6 text-sm text-foreground/70">هنوز تگی ندارید.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/60">
          <div className="grid grid-cols-12 gap-3 border-b border-black/5 px-4 py-3 text-xs text-foreground/70">
            <div className="col-span-8">نام</div>
            <div className="col-span-2">استفاده</div>
            <div className="col-span-2 text-left">عملیات</div>
          </div>
          <ul className="divide-y divide-black/5">
            {tags.map((t) => {
              const count = usageById.get(t.id) ?? 0;
              return (
                <li key={t.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                  <div className="col-span-8 truncate text-sm font-medium">{t.name}</div>
                  <div className="col-span-2 text-xs text-foreground/70">{count}</div>
                  <div className="col-span-2 flex justify-start">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100"
                      onClick={() => {
                        const ok = window.confirm("این تگ حذف شود؟");
                        if (!ok) return;
                        deleteTag(t.id);
                        setTags(listTags());
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
