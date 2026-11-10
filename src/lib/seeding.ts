/** Standard seeding: 1 meets the lowest seed first, and the top seeds can only meet late. Size must be a power of two. */
export function seedOrder(n: number): number[] {
  let order = [1];
  while (order.length < n) { const m = order.length * 2 + 1; order = order.flatMap((s) => [s, m - s]); }
  return order;
}
