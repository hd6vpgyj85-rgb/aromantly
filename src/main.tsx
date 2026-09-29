import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/theme.css";
import App from "./App.tsx";
import { ProductsProvider } from "./contexts/ProductsContext.tsx";
import { OrdersProvider } from "./contexts/OrdersContext.tsx";
import { ReviewsProvider } from "./contexts/ReviewsContext.tsx";
import { AnalyticsProvider } from "./contexts/AnalyticsContext.tsx";
import { CouponsProvider } from "./contexts/CouponsContext.tsx";
import { CustomersProvider } from "./contexts/CustomersContext.tsx";
import { LoyaltyProvider } from "./contexts/LoyaltyContext.tsx";
import { CartProvider } from "./contexts/CartContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { HomeBannerProvider } from "./contexts/HomeBannerContext.tsx";
import { LevelImagesProvider } from "./contexts/LevelImagesContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <AnalyticsProvider>
            <OrdersProvider>
              <ReviewsProvider>
                <CouponsProvider>
                  <CustomersProvider>
                    <LoyaltyProvider>
                      <HomeBannerProvider>
                        <LevelImagesProvider>
                          <CartProvider>
                            <App />
                          </CartProvider>
                        </LevelImagesProvider>
                      </HomeBannerProvider>
                    </LoyaltyProvider>
                  </CustomersProvider>
                </CouponsProvider>
              </ReviewsProvider>
            </OrdersProvider>
          </AnalyticsProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
