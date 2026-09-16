import CategoryProductsPage from "../components/CategoryProductsPage";

export default function PerfumesPage() {
  return (
    <CategoryProductsPage
      config={{
        title: "Perfumes",
        tagline: "Toda nuestra colección de fragancias.",
        subtitle: "Explora todos nuestros perfumes, de cualquier marca y presentación, en un solo lugar.",
        // Perfumes es la puerta de entrada a todo el catálogo, sin
        // importar la categoría específica (eau de parfum, toilette...).
        baseFilter: () => true,
        filterTypes: ["nivel", "marca"],
      }}
    />
  );
}
