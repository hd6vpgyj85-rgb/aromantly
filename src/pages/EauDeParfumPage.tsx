import CategoryProductsPage from "../components/CategoryProductsPage";

export default function EauDeParfumPage() {
  return (
    <CategoryProductsPage
      config={{
        title: "Eau de Parfum",
        tagline: "Concentración alta, presencia que dura.",
        subtitle: "Fragancias con mayor concentración de esencia y mejor duración.",
        baseFilter: (p) => p.category === "eau de parfum",
        filterTypes: ["marca"],
      }}
    />
  );
}
