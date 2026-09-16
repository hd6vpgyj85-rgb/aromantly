import { Outlet } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import WhatsAppFloatButton from "../components/WhatsAppFloatButton";

export default function HomeLayout() {
  return (
    <>
      <HomeHeader />
      <main>
        <div className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer plain />
      <WhatsAppFloatButton />
    </>
  );
}
