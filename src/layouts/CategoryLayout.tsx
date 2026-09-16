import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppFloatButton from "../components/WhatsAppFloatButton";

export default function CategoryLayout() {
  const location = useLocation();

  return (
    <>
      <Header />
      <main>
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <WhatsAppFloatButton />
    </>
  );
}
