import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import MenuSection from "@/components/sections/MenuSection";
import Gallery from "@/components/sections/Gallery";
import OrderAndReviews from "@/components/sections/OrderAndReviews";
import Visit from "@/components/sections/Visit";

export default function Home() {
  return (
    <>
      <Hero />
      <Story />
      <MenuSection />
      <Gallery />
      <OrderAndReviews />
      <Visit />
    </>
  );
}
