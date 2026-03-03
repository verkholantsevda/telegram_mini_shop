import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { authRoutes, publicRoutes } from '../routes';
import { useTelegram } from '../hooks/useTelegram';
import CartPage from '../pages/CartPage';
import ProductDetailPage from '../components/ProductDetailPage'; // Импортируем ProductDetailPage
import OrderPage from '../pages/OrderPage';
import AdminPanel from './adminpanel/ItemUploadForm';
import ManagerOrders from '../pages/managerorders';
import Profile from '../pages/Profile';
import CompletedOrders from '../pages/CompletedOrders';

function App() {
  const { user } = useTelegram();
  return (
    <Routes>
      {publicRoutes.map(({ path, component: Component }, index) => (
        <Route key={index} path={path} element={<Component />} />
      ))}
      {user &&
        authRoutes.map(({ path, Component }, index) => (
          <Route key={index} path={path} element={<Component />} />
        ))}
      <Route path="/cart" element={<CartPage />} /> {/* Добавляем маршрут для страницы корзины */}
      <Route path="/product/:productId" element={<ProductDetailPage />} />{' '}
      {/* Добавляем маршрут для страницы товара */}
      <Route path="/order" element={<OrderPage />} /> {/* Маршрут для страницы оформления заказа */}
      <Route path="/adminpanel" element={<AdminPanel />} />
      <Route path="/managerorders" element={<ManagerOrders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/completed-orders" element={<CompletedOrders />} />
    </Routes>
  );
}

export default App;
