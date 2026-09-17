import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppFloatButton from "../components/WhatsAppFloatButton";
import ScrollProgress from "../components/ScrollProgress";
import BackToTop from "../components/BackToTop";

export default function CategoryLayout() {
  const location = useLocation();

  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <WhatsAppFloatButton />
      <BackToTop />
    </>
  );
}
