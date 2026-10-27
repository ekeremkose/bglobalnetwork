type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };

/** Plain-text content from the CMS: blank lines split paragraphs, "- " lines become lists. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks: Block[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("- ")) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }

  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="list-disc space-y-2 pl-6 marker:text-white/30">
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
