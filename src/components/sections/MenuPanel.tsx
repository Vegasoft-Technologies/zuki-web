import MenuItemRow from "@/components/sections/MenuItemRow";
import type { MenuCategory, MenuGroup } from "@/types/menu";

interface MenuPanelProps {
  category: MenuCategory;
  isActive: boolean;
}

function Group({ group, first }: { group: MenuGroup; first: boolean }) {
  return (
    <>
      <h3
        className={
          first ? "menu__group-title" : "menu__group-title menu__group-title--spaced"
        }
      >
        {group.title}
        {group.hint ? (
          <>
            {" "}
            <span className="menu__group-hint">{group.hint}</span>
          </>
        ) : null}
      </h3>
      <ul className={group.compact ? "menu__list menu__list--compact" : "menu__list"}>
        {group.items.map((item) => (
          <MenuItemRow key={item.name} item={item} />
        ))}
      </ul>
      {group.fineprint ? <p className="menu__fineprint">{group.fineprint}</p> : null}
    </>
  );
}

export default function MenuPanel({ category, isActive }: MenuPanelProps) {
  const columns: MenuGroup[][] = [
    category.groups.filter((g) => g.column === 1),
    category.groups.filter((g) => g.column === 2),
  ];

  return (
    <div
      className={isActive ? "menu__panel is-active" : "menu__panel"}
      data-panel={category.id}
    >
      {category.note ? <p className="menu__panel-note">{category.note}</p> : null}

      <div className="menu__cols">
        {columns.map((groups, index) => (
          <div className="menu__group" key={index}>
            {groups.map((group, groupIndex) => (
              <Group key={group.title} group={group} first={groupIndex === 0} />
            ))}
          </div>
        ))}
      </div>

      {category.feature ? (
        <div className="menu__feature">
          <div>
            <h4>{category.feature.title}</h4>
            <p>{category.feature.description}</p>
          </div>
          <p className="menu__feature-price">
            {category.feature.price}
            {category.feature.priceAlt ? <span>{category.feature.priceAlt}</span> : null}
          </p>
        </div>
      ) : null}
    </div>
  );
}
