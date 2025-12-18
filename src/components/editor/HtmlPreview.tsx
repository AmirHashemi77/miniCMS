type Props = {
  html: string;
  className?: string;
};

export default function HtmlPreview(props: Props) {
  return (
    <div className={["rounded-2xl border border-black/5 bg-white/60 p-4", "flex min-h-0 flex-col", props.className ?? ""].join(" ")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">پیش‌نمایش HTML</h3>
        <div className="text-xs text-foreground/60">بررسی ظاهر و کد خروجی مقاله</div>
      </div>

      <div className="mt-3 flex-1 min-h-0 overflow-auto rounded-xl border border-black/5 bg-white">
        <div className="border-b border-black/5 p-4">
          <div
            className="text-sm leading-7 text-foreground [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-2 [&_blockquote]:my-2 [&_blockquote]:border-r-4 [&_blockquote]:border-secondary/60 [&_blockquote]:pr-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:my-1 [&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-black/5 [&_pre]:bg-black/5 [&_pre]:p-3"
            dangerouslySetInnerHTML={{ __html: props.html }}
          />
        </div>
        {/* <pre className="p-4 text-xs leading-6 text-foreground/80">{props.html}</pre> */}
      </div>
    </div>
  );
}
