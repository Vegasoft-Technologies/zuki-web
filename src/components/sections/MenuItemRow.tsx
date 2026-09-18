import { Fragment } from "react";
import DietTag from "@/components/ui/DietTag";
import type { MenuItem } from "@/types/menu";

interface MenuItemRowProps {
  item: MenuItem;
}

export default function MenuItemRow({ item }: MenuItemRowProps) {
  return (
    <li>
      <span className="mi__name">
        {item.name}
        {item.diet?.map((diet) => (
          <Fragment key={diet}>
            {" "}
            <DietTag diet={diet} />
          </Fragment>
        ))}
        {item.badge ? (
          <>
            {" "}
            <em className="mi__diet">{item.badge}</em>
          </>
        ) : null}
      </span>
      {item.price ? (
        <>
          <span className="mi__dots"></span>
          <span className="mi__price">{item.price}</span>
        </>
      ) : null}
      {item.description ? <span className="mi__desc">{item.description}</span> : null}
    </li>
  );
}
