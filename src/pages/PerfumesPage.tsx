import CategoryProductsPage from "../components/CategoryProductsPage";

export default function PerfumesPage() {
  return (
    <CategoryProductsPage
      config={{
        title: "Perfumes",
        tagline: "Toda nuestra colección de fragancias.",
        subtitle: "Explora perfumes árabes, de diseñador y de nicho en un solo lugar.",
        baseFilter: (p) => p.category === "perfume",
        filterType: "nivel",
      }}
    />
  );
}
