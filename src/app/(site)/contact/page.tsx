import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import TextPage from "@/components/seo/Page";

export const metadata: Metadata = {
  title: "Contact Esports Hub",
  description: "Send a message to Esports Hub: report a mistake in a guide, ask a question about the tools, or ask us to delete your data.",
  alternates: { canonical: "/contact/" },
};

export default function Page() {
  return (
    <TextPage title="Contact" path="/contact/" updated="2026-11-11" intro="Found a mistake in a guide, have a question about a tool, or want something about your data removed? Send a message. If you want an answer, include your email address.">
      <ContactForm />
    </TextPage>
  );
}
