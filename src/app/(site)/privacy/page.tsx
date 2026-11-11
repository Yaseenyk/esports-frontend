import type { Metadata } from "next";
import Link from "next/link";
import TextPage from "@/components/seo/Page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Esports Hub stores and what it does not: tools run in your browser, Aadhaar scanning stays on your device, and online events keep only basic roster details.",
  alternates: { canonical: "/privacy/" },
};

export default function Page() {
  return (
    <TextPage title="Privacy policy" path="/privacy/" updated="2026-11-11" intro="This page says what Esports Hub does with information. We keep it short and specific, and we collect as little as we can.">
      <section><h2>Using the tools without an account</h2>
        <p>The ID card maker, bracket maker and points table calculator run in your browser. The names, photos and results you type in stay on your device and are not sent to us. To remember your card designs and team names between visits, the card maker saves those settings in your browser (local storage). People and photos are not saved there. Closing the tab or clearing site data removes what the page held.</p>
        <p>When you use text recognition on an Aadhaar card, or cut out the background of a photo, your browser downloads the recognition files it needs from public content delivery networks such as jsDelivr. The card picture itself is processed on your device and is never uploaded. Only the last four digits of an Aadhaar number are kept, and only inside the page you are using.</p>
      </section>
      <section><h2>If you create an account</h2>
        <p>We store your name, email address and a one-way hash of your password (we never store the password itself). If you save an event online, we store what you choose to save: the event name, game, organiser, date, venue and rules, teams and their logos, and for each person a name, role, access zones, whether they are a minor and whether a guardian has consented, and a photo if you add one. When guests are checked in we record the time and the name of the door (the gate key label). Invite submissions from players contain a name, a role, whether they are under 18 and an optional photo. Team registrations contain the team name, the captain&apos;s name and phone number or email, each player&apos;s name, in-game name and whether they are under 18, and any note the captain adds. Registration details are shown only to the organiser of that event.</p>
        <p><strong>We do not store birth dates, genders or Aadhaar digits on our servers.</strong> Those stay in your browser.</p>
        <p>This data is kept in a database hosted by Cloudflare. You can delete your account at any time from the Account page in the app: it removes your events, rosters, photos, check-ins and links.</p>
      </section>
      <section><h2>Gate keys, invites and pass links</h2><p>Anyone who holds a gate key can check guests in for that event until the key expires or you revoke it, and can see the guest list for that event. Anyone who holds an invite link can submit a name and photo to that team, which you approve before it is added. Anyone who holds a pass link can see that one person&apos;s pass. Share these only with the right people, and revoke them when you are done.</p></section>
      <section><h2>Contact form</h2><p>If you send a message through the <Link href="/contact/">contact page</Link>, we store the message and the name and email you choose to give, so that we can read and answer it. Nothing is shared.</p></section>
      <section><h2>Technical data and abuse prevention</h2><p>To limit abuse we count requests by a one-way hash of the network address, kept for a short time. We do not use advertising cookies. On our public information pages only (home, tools, guides, compare, about, contact, privacy and terms) we use Google Analytics, through Google Tag Manager, to see which pages are read; it is never loaded in the app, on sign-in pages, or on any page whose address holds a private link, and it is switched off if your browser sends Do Not Track or Global Privacy Control. The site stores a few items in your browser for it to work: your language choice, your sign-in if you sign in, and settings for the tools.</p></section>
      <section><h2>Children</h2><p>If you collect details of people under 18 for an event, you are responsible for getting a parent or guardian&apos;s consent and for collecting only what you need. The tools let you mark a person as a minor and record that consent.</p></section>
      <section><h2>Changes</h2><p>If we change how we handle information, we will update this page and its date. If we ever add advertising or more analytics, we will say so here first.</p></section>
      <section><h2>Questions</h2><p>Use the <Link href="/contact/">contact page</Link> for any question about your information or to ask us to delete something.</p></section>
    </TextPage>
  );
}
