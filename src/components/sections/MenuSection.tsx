import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import MenuPanel from "@/components/sections/MenuPanel";
import MenuTabs from "@/components/sections/MenuTabs";
import { menu, menuAllergyNote } from "@/data/menu";

export default function MenuSection() {
  return (
    <section className="menu" id="menu">
      <Reveal className="menu__head">
        <Eyebrow className="eyebrow--center">{"What's cooking"}</Eyebrow>
        <SectionTitle className="section-title--center">The menu</SectionTitle>
        <p className="menu__note">
          Full menu served all day till 4pm. Add a Mimosa to your brunch for £5.95.
          <span className="menu__legend">
            <em className="mi__diet">V</em> vegetarian ·{" "}
            <em className="mi__diet mi__diet--vg">Vg</em> vegan
          </span>
        </p>
      </Reveal>

      <MenuTabs
        categories={menu.map(({ id, label }) => ({ id, label }))}
        panels={menu.map((category) => (
          <MenuPanel key={category.id} category={category} />
        ))}
      />

      <p className="menu__allergy">{menuAllergyNote}</p>
    </section>
  );
}
