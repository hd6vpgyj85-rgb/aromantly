import "./CategoryHero.css";

interface CategoryHeroProps {
  title: string;
  subtitle: string;
}

export default function CategoryHero({ title, subtitle }: CategoryHeroProps) {
  return (
    <div className="container category-hero">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
