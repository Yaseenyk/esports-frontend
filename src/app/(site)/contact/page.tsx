import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Link from "next/link";
import TextPage from "@/components/seo/Page";

export const metadata: Metadata = {
  title: "Contact Esports Hub",
  description: "Send a message to Esports Hub: report a mistake in a guide, ask a question about the tools, or ask us to delete your data.",
  alternates: { canonical: "/contact/" },
};

export default function Page() {
  return (
    <TextPage title="Contact" path="/contact/" updated="2026-11-16" intro="Found a mistake in a guide, have a question about a tool, or want something about your data removed? Send a message. If you want an answer, include your email address.">
      <section><h2>Who reads your message</h2><p>Esports Hub is run by one person, Yaseen Khatib, a developer based in Hyderabad, India. Messages from this form are stored on the site&apos;s own server and read by him, not by a support team or an outside service. Because it is a small free project there is no fixed reply time, but corrections to guides and reports of broken tools are looked at first.</p></section>
      <section><h2>What to write about</h2>
        <ul>
          <li><strong>A mistake in a guide.</strong> Give the page address, quote the sentence and say what is wrong. If a rule or number comes from a game publisher, a link to the current official page helps. Confirmed errors are corrected and the date on the page changes.</li>
          <li><strong>A tool that does not work.</strong> Say which tool, which browser and device you used, and what you expected to happen. Do not attach real ID documents.</li>
          <li><strong>A feature you need.</strong> Describe the event you run (size, game, how many people help). That is how the next feature is chosen.</li>
          <li><strong>Your information.</strong> To ask for a copy, a correction or removal, or to say that a child&apos;s details are on the site without permission, give your name and email. The <Link href="/privacy/">privacy policy</Link> explains what the site holds and for how long.</li>
          <li><strong>Partnerships and press.</strong> Say who you are and what you propose. We do not sell guide placements or reviews.</li>
        </ul>
      </section>
      <section><h2>Before you send</h2><p>The <Link href="/guides/">guides</Link> and the <Link href="/tools/">tools</Link> answer most organiser questions, and the <Link href="/about/">about page</Link> explains how the site is made. Please do not send Aadhaar numbers, passwords, bank details or photos of anyone who has not agreed. The message box is not private chat, and your email is used only to reply. If you leave the email blank we cannot answer you.</p></section>
      <ContactForm />
    </TextPage>
  );
}
