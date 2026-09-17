import { Outlet } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import WhatsAppFloatButton from "../components/WhatsAppFloatButton";
import ScrollProgress from "../components/ScrollProgress";
import BackToTop from "../components/BackToTop";

export default function HomeLayout() {
  return (
    <>
      <ScrollProgress />
      <HomeHeader />
      <main>
        <div className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer plain />
      <WhatsAppFloatButton />
      <BackToTop />
    </>
  );
}
