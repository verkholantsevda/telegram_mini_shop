import React, { createContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UserStore from './store/UserStore';
import Navbar from './components/Navbar/Navbar';
import CartFooter from './components/Footer/CartFooter';
import { BrowserRouter } from 'react-router-dom';
import CartStore from './store/CartStore';
import ProductDetailStore from './store/ProductDetailStore';
import CategoryStore from './store/CategoryStore';
import { useTelegram } from './hooks/useTelegram';
import CategoryItemStore from './store/CategoryItemStore';

export const Context = createContext(null);

const Root = () => {
  const { user } = useTelegram();
  const [globalUser, setGlobalUser] = useState(null);

  useEffect(() => {
    if (user) {
      setGlobalUser(user);
    }
  }, [user]);

  return (
    <Context.Provider
      value={{
        user: globalUser,
        userStore: new UserStore(),
        categoryStore: new CategoryStore(),
        categoryItemStore: new CategoryItemStore(),
        cartStore: new CartStore(),
        productDetailStore: new ProductDetailStore(),
      }}
    >
      <BrowserRouter>
        <React.StrictMode>
          <div id="mainbox" className="all-wrapper">
            <Navbar /> {/* Добавляем компонент Navbar */}
            <App />
            <CartFooter /> {/* Добавляем компонент Footer */}
          </div>
        </React.StrictMode>
      </BrowserRouter>
    </Context.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
