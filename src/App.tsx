import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import CartToast from "./components/CartToast";
import useTabTitleTease from "./hooks/useTabTitleTease";

import HomeLayout from "./layouts/HomeLayout";
import CategoryLayout from "./layouts/CategoryLayout";
import SearchLayout from "./layouts/SearchLayout";
import AdminLayout from "./layouts/AdminLayout";

import HomePage from "./pages/HomePage";
import PerfumesPage from "./pages/PerfumesPage";
import EauDeToilettePage from "./pages/EauDeToilettePage";
import EauDeParfumPage from "./pages/EauDeParfumPage";
import EauDeColognePage from "./pages/EauDeColognePage";
import EauFraichePage from "./pages/EauFraichePage";
import OfertasPage from "./pages/OfertasPage";
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FidelidadPage from "./pages/FidelidadPage";
import TerminosPage from "./pages/TerminosPage";
import PrivacidadPage from "./pages/PrivacidadPage";
import NotFoundPage from "./pages/NotFoundPage";

import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsListPage from "./pages/admin/ProductsListPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import ProductsImportPage from "./pages/admin/ProductsImportPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OrdersArchivePage from "./pages/admin/OrdersArchivePage";
import ReviewsPage from "./pages/admin/ReviewsPage";
import CouponsPage from "./pages/admin/CouponsPage";
import CouponFormPage from "./pages/admin/CouponFormPage";
import CustomersPage from "./pages/admin/CustomersPage";
import HomeBannerPage from "./pages/admin/HomeBannerPage";

export default function App() {
  useTabTitleTease();

  return (
    <>
      <ScrollToTop />
      <CartToast />
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route element={<CategoryLayout />}>
          <Route path="/perfumes" element={<PerfumesPage />} />
          <Route path="/eau-de-toilette" element={<EauDeToilettePage />} />
          <Route path="/eau-de-parfum" element={<EauDeParfumPage />} />
          <Route path="/eau-de-cologne" element={<EauDeColognePage />} />
          <Route path="/eau-fraiche" element={<EauFraichePage />} />
          <Route path="/ofertas" element={<OfertasPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
        </Route>

        <Route element={<SearchLayout />}>
          <Route path="/buscar" element={<SearchPage />} />
        </Route>

        <Route path="/fidelidad/:token" element={<FidelidadPage />} />

        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="productos" element={<ProductsListPage />} />
          <Route path="productos/nuevo" element={<ProductFormPage />} />
          <Route path="productos/importar" element={<ProductsImportPage />} />
          <Route path="productos/:id" element={<ProductFormPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/baul" element={<OrdersArchivePage />} />
          <Route path="resenas" element={<ReviewsPage />} />
          <Route path="cupones" element={<CouponsPage />} />
          <Route path="cupones/nuevo" element={<CouponFormPage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="banner" element={<HomeBannerPage />} />
        </Route>

        <Route element={<CategoryLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
