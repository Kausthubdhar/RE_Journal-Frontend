import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import Stats from "@/components/Stats";
import Coverage from "@/components/Coverage";
import Solutions from "@/components/Solutions";
import Dashboard from "@/components/Dashboard";
import Method from "@/components/Method";
import Reports from "@/components/Reports";
import Founder from "@/components/Founder";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main id="main">
        <Hero />
        <Stats />
        <Coverage />
        <Solutions />
        <Dashboard />
        <Method />
        <Reports />
        <Founder />
        <CTA />
      </main>
      <Footer />
      <Toast />
    </>
  );
}
