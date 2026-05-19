function Paragraph({ block }) {
  return <p className="text-base leading-relaxed text-neutral-800 mb-4">{block.text}</p>;
}
function BulletList({ block }) {
  return (
    <ul className="space-y-1.5 mb-4 list-disc list-inside text-neutral-800">
      {block.items?.map((item, i) => (
        typeof item === 'string'
          ? <li key={i} className="leading-relaxed">{item}</li>
          : <li key={i} className="leading-relaxed">{item?.text || JSON.stringify(item)}</li>
      ))}
    </ul>
  );
}
function Formula({ block }) {
  return (
    <pre className="my-4 p-3 bg-neutral-50 rounded-lg font-mono text-sm overflow-x-auto">
      {block.latex}
    </pre>
  );
}
function Quote({ block }) {
  return (
    <blockquote className="my-4 p-3 bg-forge-blue-soft border-l-4 border-forge-blue rounded-r-lg">
      <p className="italic text-sm text-neutral-800">“{block.text}”</p>
      {block.source && <p className="text-xs text-forge-blue mt-2">▶ {block.source}</p>}
    </blockquote>
  );
}

const RENDERERS = { paragraph: Paragraph, bullet_list: BulletList, formula: Formula, quote: Quote };

export default function SectionRenderer({ section, index }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{index + 1} · {section.heading}</h2>
      {section.blocks?.map((b, i) => {
        const C = RENDERERS[b.type];
        return C ? <C key={i} block={b} /> : null;
      })}
    </section>
  );
}