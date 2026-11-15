/** Repeats a honeycomb row pattern until it holds `n` entries, so extra sections never fall off the menu. Same result as before for 7 or fewer. */
export function fitPattern(pattern: number[], n: number): number[] {
  const out: number[] = [];
  for (let i = 0, sum = 0; sum < n && pattern.length > 0; i++) { const k = pattern[i % pattern.length]!; out.push(k); sum += k; }
  return out;
}
