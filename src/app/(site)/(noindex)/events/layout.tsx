import SampleNotice from "@/components/SampleNotice";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SampleNotice />
      {children}
    </>
  );
}
