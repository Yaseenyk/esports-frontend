import Link from "next/link";
import { box, btnSecondary, h3 } from "@/features/shared/ui/styles";

/** The sign-up box for /tournaments/ and /calendar/ (seo-PLAN F4: no landing page of its own). Server-rendered text and a link into the app. */
export default function AlertsBox() {
  return (
    <aside className={box} aria-labelledby="alerts-box-h">
      <h2 id="alerts-box-h" className={h3}>Get an email when a tournament opens</h2>
      <p className="mt-2 text-zinc-300">Get an email when a free Free Fire, BGMI or Valorant tournament opens registration. Pick the game and the city or online; at most one email a day, unsubscribe in one tap. Esports Hub has no entry fees or wallets.</p>
      <p className="mt-3"><Link href="/app/alerts/" className={btnSecondary}>Set up tournament alerts</Link></p>
    </aside>
  );
}
