import BeanToCup from "@/components/bean-to-cup/BeanToCup";
import Cta from "@/components/cta/Cta";
import Experience from "@/components/experience/Experience";
import Footer from "@/components/footer/Footer";
import Gallery from "@/components/gallery/Gallery";
import Hero from "@/components/hero/Hero";
import Menu from "@/components/menu/Menu";
import Signature from "@/components/signature/Signature";

/**
 * Section composition.
 *
 * Every section declares its own `data-theme`, which is what drives the navbar
 * inversion — the nav reads the theme rather than any section knowing the nav
 * exists.
 *
 * ---------------------------------------------------------------------------
 * WHY `<main>` IS HERE AND NOT IN `layout.tsx`
 *
 * The footer has to sit OUTSIDE `<main>` to be a `contentinfo` landmark — a
 * `<footer>` nested inside `<main>` does not get that role. So the wrapper
 * lives here, around the sections, and `<Footer />` is its sibling. The skip
 * link's `href="#main"` still resolves, and composition stays in one file.
 */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Signature />
        <Menu />
        <Experience />
        <BeanToCup />
        <Gallery />
        <Cta />
      </main>

      <Footer />
    </>
  );
}
