import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import { useNavigate } from 'react-router-dom';
import './CartFooter.css';
import { FaShoppingCart, FaHome, FaUser } from 'react-icons/fa';

const CartFooter = observer(() => {
  const { cartStore, user } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      cartStore.getBasketIdUser(user.id).then(() => {
        cartStore.fetchCart();
      });
    }
  }, [cartStore, user]);

  return (
    <footer className="cart-footer">
      <div className="footer-button" onClick={() => navigate('/cart')}>
        <FaShoppingCart size={24} />
        <span className="footer-label">Корзина ({cartStore.itemCount})</span>
      </div>
      <div className="footer-button" onClick={() => navigate('/')}>
        <FaHome size={24} />
        <span className="footer-label">Главная</span>
      </div>
      <div className="footer-button" onClick={() => navigate('/profile')}>
        <FaUser size={24} />
        <span className="footer-label">Профиль</span>
      </div>
    </footer>
  );
});

export default CartFooter;
