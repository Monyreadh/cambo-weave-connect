import type { ReactNode } from "react";

export function TextPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-10">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-5xl text-primary">{title}</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-primary">{children}</div>
    </div>
  );
}

export function EditFlag({ children }: { children: ReactNode }) {
  return <span className="border border-dashed border-accent bg-secondary px-1.5 text-accent">{children}</span>;
}

export function meta(title: string, description: string) {
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] };
}
