import { tokens } from "@/lib/utils";

export default function Highlight({ text, query }: { text: string; query: string }) {
  const t = tokens(query).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!t.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${t.join("|")})`, "gi"));
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>))}
    </>
  );
}