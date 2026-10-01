import BeanToCup from "@/components/bean-to-cup/BeanToCup";
import Experience from "@/components/experience/Experience";
import Hero from "@/components/hero/Hero";
import Menu from "@/components/menu/Menu";
import Signature from "@/components/signature/Signature";

/**
 * Section composition.
 *
 * Every section declares its own `data-theme`, which is what drives the navbar
 * inversion — the nav reads the theme rather than any section knowing the nav
 * exists.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Signature />
      <Menu />
      <Experience />
      <BeanToCup />
    </>
  );
}
