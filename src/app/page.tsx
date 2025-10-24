import Experts from "@/components/sections/Experts";
import Hero from "../components/sections/Hero";
import Services from "@/components/sections/Services";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";

export default function Home() {
  const categories = [
    { id: 1, name: "Insurance" },
    { id: 2, name: "Construction finance" },
    { id: 3, name: "Business insurance" },
    { id: 4, name: "Old-age provision" },
  ];

  return (
    <main>
      <Header />
      <Hero categories={categories} />
      <Experts />
      <Services />
      <Footer />
    </main>
  );
}
