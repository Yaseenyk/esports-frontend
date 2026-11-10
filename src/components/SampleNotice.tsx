/** Shown above pages that carry made-up demo data, so nobody mistakes a sample for a real event or community. */
export default function SampleNotice() {
  return (
    <p role="note" className="no-print mb-6 rounded-xl border border-amber-500/30 bg-[#0a0b0d] px-4 py-2.5 text-sm text-amber-200">
      Demo page. Every name, event and community here is made-up sample data, shown to demonstrate how the tools will look. It is not listed in search results.
    </p>
  );
}
