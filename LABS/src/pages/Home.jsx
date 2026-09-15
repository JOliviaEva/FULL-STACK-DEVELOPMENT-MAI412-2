import SiteHeader from "../components/SiteHeader.jsx";
import Hero from "../components/Hero.jsx";
import LabProgress from "../components/LabProgress.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <LabProgress />
      </main>
      <Footer builtWith="A running lab journal &mdash; built with React &amp; Tailwind CSS" />
    </div>
  );
}
