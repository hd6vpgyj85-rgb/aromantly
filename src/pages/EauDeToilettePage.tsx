import CategoryProductsPage from "../components/CategoryProductsPage";

export default function EauDeToilettePage() {
  return (
    <CategoryProductsPage
      config={{
        title: "Eau de Toilette",
        tagline: "Frescura ligera para el día a día.",
        subtitle: "Ideales para uso diario, con una proyección suave y agradable.",
        baseFilter: (p) => p.category === "eau de toilette",
        filterTypes: ["marca"],
      }}
    />
  );
}
