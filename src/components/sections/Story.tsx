import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";

const features = [
  {
    mark: "☼",
    title: "Breakfast, all the way through",
    body: "Full English, an Italian plate, and a Turkish spread built for two or four served from open till close.",
  },
  {
    mark: "❧",
    title: "Two coffee traditions",
    body: "Proper Italian espresso and slow Turkish coffee, made with the same care, poured at the same bar.",
  },
  {
    mark: "✿",
    title: "A room full of flowers",
    body: "Quite possibly the most photographed ceiling in Exeter. Bring someone you like.",
  },
];

export default function Story() {
  return (
    <section className="story" id="story">
      <div className="story__grid">
        <Reveal className="story__text">
          <Eyebrow>The place</Eyebrow>
          <SectionTitle>Tucked just off Queen Street, since 2017.</SectionTitle>
          <p>
            {
              "Zuki's started with a simple idea: put two of the world's great breakfast tables next to each other and let people choose. One morning it's an espresso and a warm cornetto. The next it's a Turkish spread that fills the whole table sucuk, creamy feta, olives, honey and warm, fluffy flatbread."
            }
          </p>
          <p>
            {
              "The room helps. Vines and flowers run across the ceiling, the walls are deep garden-teal, and there's a basket of oranges by the coffee machine. It's the kind of corner you mean to leave after one cup and end up staying for three."
            }
          </p>
          <a className="link-arrow" href="#gallery">
            Take a look inside →
          </a>
        </Reveal>

        <Reveal as="ul" className="story__features">
          {features.map((feature) => (
            <li key={feature.title}>
              <span className="feature__mark" aria-hidden="true">
                {feature.mark}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
