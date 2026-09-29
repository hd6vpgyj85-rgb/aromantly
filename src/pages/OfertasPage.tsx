import CategoryProductsPage from "../components/CategoryProductsPage";

export default function OfertasPage() {
  return (
    <CategoryProductsPage
      config={{
        title: "Ofertas",
        tagline: "Precios especiales por tiempo limitado.",
        subtitle: "Aprovecha nuestras fragancias en oferta antes de que se agoten.",
        baseFilter: (p) => !!p.onSale,
        filterTypes: ["marca"],
      }}
    />
  );
}
