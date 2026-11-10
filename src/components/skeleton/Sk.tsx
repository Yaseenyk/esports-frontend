import type { CSSProperties } from "react";

/** One shimmering placeholder block. `i` staggers the shimmer so a group sweeps like a wave rather than blinking in unison. */
export function Sk({ className = "", w, h, round, i = 0, style }: { className?: string; w?: number | string; h?: number | string; round?: boolean; i?: number; style?: CSSProperties }) {
  return <div aria-hidden="true" className={`sk ${round ? "sk-round" : ""} ${className}`} style={{ width: w, height: h, ["--sk-d" as string]: `${(i * 0.09).toFixed(2)}s`, ...style }} />;
}

/** A paragraph of lines; the last one is shorter, like real text. */
export function SkLines({ n = 3, i = 0, className = "" }: { n?: number; i?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: n }, (_, k) => <Sk key={k} i={i + k} className="sk-line" w={k === n - 1 && n > 1 ? "62%" : "100%"} />)}
    </div>
  );
}

/** A shaped stand-in for an ID card: header, photo, name lines and a QR that flickers while a laser reads the card. */
export function CardSk({ ratio = "85.6 / 54", className = "", i = 0 }: { ratio?: string; className?: string; i?: number }) {
  return (
    <div aria-hidden="true" className={`sk-card w-full ${className}`} style={{ aspectRatio: ratio, ["--sk-h" as string]: "min(240px, 70vw)" }}>
      <span className="sk-laser" />
      <div className="flex h-full flex-col p-[6%]">
        <div className="flex items-center gap-[4%]"><Sk round className="!h-[14%] !w-[9%] min-h-4 min-w-4" i={i} /><Sk className="sk-line !h-[7%] min-h-2" w="38%" i={i + 1} /></div>
        <div className="mt-[6%] flex flex-1 items-end gap-[5%]">
          <Sk className="aspect-[3/4] h-[78%] !rounded-lg" i={i + 2} />
          <div className="flex-1 space-y-[6%] pb-[2%]">
            <Sk className="sk-line !h-[9%] min-h-2" w="86%" i={i + 3} />
            <Sk className="sk-line !h-[6%] min-h-1.5" w="58%" i={i + 4} />
            <Sk className="sk-line !h-[6%] min-h-1.5" w="40%" i={i + 5} />
          </div>
          <div className="sk-qr w-[24%] shrink-0">{Array.from({ length: 25 }, (_, k) => <i key={k} style={{ ["--i" as string]: k % 9 }} />)}</div>
        </div>
      </div>
      <span className="sk-hex" style={{ right: "6%", top: "8%" }} />
    </div>
  );
}
