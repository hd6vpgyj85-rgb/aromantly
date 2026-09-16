import CategoryProductsPage from "../components/CategoryProductsPage";

export default function EauFraichePage() {
  return (
    <CategoryProductsPage
      config={{
        title: "Eau Fraiche",
        tagline: "La versión más suave y fresca de tu fragancia favorita.",
        subtitle: "Muy baja concentración de esencia, ideal para un refresco ligero.",
        baseFilter: (p) => p.category === "eau fraiche",
        filterType: "marca",
      }}
    />
  );
}
