import CategoryProductsPage from "../components/CategoryProductsPage";

export default function EauDeColognePage() {
  return (
    <CategoryProductsPage
      config={{
        title: "Eau de Cologne",
        tagline: "El toque cítrico y fresco de siempre.",
        subtitle: "Concentración ligera, perfecta para climas cálidos.",
        baseFilter: (p) => p.category === "eau de cologne",
        filterTypes: ["marca"],
      }}
    />
  );
}
