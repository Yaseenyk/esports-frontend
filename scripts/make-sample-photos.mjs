// Makes the demo player pictures with the OpenAI image API: stylised 3D cartoon avatars of invented people, on a transparent background.
// Run: node scripts/make-sample-photos.mjs [slug ...]   (needs OPENAI_API_KEY in ../linkedin-bot/.env, ../portfolio/.env or the environment)
// Then: python scripts/shrink-sample-photos.py   (turns the PNGs into small WebP files in public/samples/people)
import fs from "node:fs";
import path from "node:path";

function key() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  for (const f of ["../linkedin-bot/.env", "../portfolio/.env"]) {
    if (!fs.existsSync(f)) continue;
    const v = fs.readFileSync(path.resolve(f), "utf8").match(/^OPENAI_API_KEY\s*=\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
    if (v) return v;
  }
  throw new Error("OPENAI_API_KEY not found");
}

export const PEOPLE = {
  "aarav-mehta": "a 22-year-old Indian man, short neat black hair, light stubble, wearing a dark navy esports team jacket, confident slight smile, arms crossed",
  "diya-kulkarni": "a 21-year-old Indian woman, shoulder-length black hair, small stud earrings, wearing a dark hoodie, friendly smile, one hand in pocket",
  "rohan-deshmukh": "a 23-year-old Indian man, wavy black hair, round glasses, wearing a grey bomber jacket, relaxed pose, looking at the camera",
  "sneha-iyer": "a 20-year-old South Indian woman, long black hair in a ponytail, wearing a maroon team t-shirt, cheerful smile, hands on hips",
  "kabir-sheikh": "a 29-year-old Indian man, short beard, short hair, wearing a black polo shirt with a lanyard, calm confident look, arms folded",
  "vihaan-patil": "a 22-year-old Indian man, spiky black hair, wearing a white and blue jacket, playful grin, thumbs hooked in pockets",
  "ananya-nair": "a 22-year-old Indian woman, long wavy hair, wearing a pastel green jacket, warm smile, one hand raised to her hair",
  "ishita-joshi": "a 21-year-old Indian woman, bob haircut, glasses, wearing a black blazer over a t-shirt, thoughtful smile",
  "arjun-reddy": "a 33-year-old Indian man, trimmed beard, short hair, wearing a charcoal blazer and open-collar shirt, professional manager look",
  "meera-pawar": "a 24-year-old Indian woman, braided hair over one shoulder, wearing a red team jersey, determined expression, arms crossed",
  "zoya-khan": "a 22-year-old Indian woman, hair covered with a light pastel scarf, wearing a denim jacket, bright smile",
  "aditya-chavan": "a 31-year-old Indian man, short hair, clean shaven, wearing a dark green coach jacket, whistle on a lanyard, confident smile",
};

const only = process.argv.slice(2);
const quality = process.env.QUALITY || "medium";
fs.mkdirSync("scripts/.tmp-photos", { recursive: true });
for (const [slug, who] of Object.entries(PEOPLE)) {
  if (only.length && !only.includes(slug)) continue;
  const out = `scripts/.tmp-photos/${slug}.png`;
  if (fs.existsSync(out)) { console.log("skip", slug); continue; }
  const prompt = `A stylised 3D cartoon avatar, semi-realistic Pixar-like character render with glossy soft skin, expressive eyes and detailed hair, of an invented person: ${who}. Waist-up, facing the camera, full head and shoulders visible with a little space above the head, soft studio lighting, vibrant colours. Isolated on a fully transparent background with no shadow, no text and no logos.`;
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key()}` },
    body: JSON.stringify({ model: "gpt-image-1.5", prompt, size: "1024x1536", quality, background: "transparent", output_format: "png", n: 1 }),
  });
  const j = await r.json();
  if (!r.ok) { console.log("FAILED", slug, r.status, (j.error?.message || "").slice(0, 200)); process.exit(1); }
  fs.writeFileSync(out, Buffer.from(j.data[0].b64_json, "base64"));
  console.log("ok", slug, j.usage ? JSON.stringify(j.usage) : "");
}
