import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import ClientLayout from "@/components/shared/ClientLayout";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>
        <ClientLayout>{children}</ClientLayout>
      </main>
      <Footer />
    </>
  );
}
