import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import MenuPanel from "@/components/sections/MenuPanel";
import { menu, menuAllergyNote } from "@/data/menu";

export default function MenuSection() {
  return (
    <section className="menu" id="menu">
      <div className="menu__head reveal">
        <Eyebrow className="eyebrow--center">{"What's cooking"}</Eyebrow>
        <SectionTitle className="section-title--center">The menu</SectionTitle>
        <p className="menu__note">
          Full menu served all day till 4pm. Add a Mimosa to your brunch for £5.95.
          <span className="menu__legend">
            <em className="mi__diet">V</em> vegetarian ·{" "}
            <em className="mi__diet mi__diet--vg">Vg</em> vegan
          </span>
        </p>
      </div>

      <div className="menu__tabs" role="tablist" aria-label="Menu sections">
        {menu.map((category, index) => (
          <button
            key={category.id}
            className={index === 0 ? "menu__tab is-active" : "menu__tab"}
            role="tab"
            aria-selected={index === 0}
            data-tab={category.id}
          >
            {category.label}
          </button>
        ))}
      </div>

      {menu.map((category, index) => (
        <MenuPanel key={category.id} category={category} isActive={index === 0} />
      ))}

      <p className="menu__allergy">{menuAllergyNote}</p>
    </section>
  );
}
