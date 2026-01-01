import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import PaymentStatusPage from './pages/PaymentStatusPage';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductList from './pages/admin/AdminProductList';
import AdminCategoryList from './pages/admin/AdminCategoryList';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminBannerList from './pages/admin/AdminBannerList';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminDelivery from './pages/admin/AdminDelivery';

import ProfilePage from './pages/ProfilePage';
import AdminReturnRequests from './pages/admin/AdminReturnRequests';

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/payment/status" element={<PaymentStatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route path="/admin-panel" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="categories" element={<AdminCategoryList />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="returns" element={<AdminReturnRequests />} />
          <Route path="banners" element={<AdminBannerList />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="delivery" element={<AdminDelivery />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
