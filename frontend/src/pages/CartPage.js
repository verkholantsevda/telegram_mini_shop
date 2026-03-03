import React, { useContext, useEffect } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import QuantityCounter from '../components/QuantityCounter';
import './CartPage.css';

const CartPage = observer(() => {
  const { cartStore } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartStore.itemCount === 0) {
      navigate('/');
    }
  }, [cartStore.itemCount, navigate]);

  const getTotalPrice = () => {
    let total = 0;
    cartStore._itemCounts.forEach((count, itemId) => {
      const item = cartStore.getProductById(itemId);
      if (item) {
        total += item.price * count;
      }
    });
    return total;
  };

  const handleIncrease = (itemId) => {
    const item = cartStore.getProductById(itemId);
    const currentCount = cartStore.getItemCount(itemId);

    if (!item) return;

    if (currentCount < item.quantity) {
      cartStore.increaseItemCount(item);
    }
  };

  const handleDecrease = (itemId) => {
    cartStore.decreaseItemCount(itemId);
    if (cartStore.getItemCount(itemId) === 0) {
      cartStore._itemCounts.delete(itemId);
    }
  };
  const handleCheckout = () => {
    navigate('/order');
  };

  return (
    <div className="cart-page">
      <h2>Корзина</h2>
      <div className="cart-items">
        {Array.from(cartStore._itemCounts.entries()).map(([itemId, count]) => {
          const item = cartStore.getProductById(itemId);
          if (item) {
            return (
              <div key={itemId} className="cart-item">
                <div className="cart-item-info">
                  <img
                    src={process.env.REACT_APP_API_IMG_URL + item.img[0].file}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div>
                    <h3>{item.name}</h3>
                    <p>Цена: {item.price} ₽</p>
                    <div className="quantity-label">
                      <QuantityCounter
                        quantity={count}
                        onIncrease={() => handleIncrease(itemId)}
                        onDecrease={() => handleDecrease(itemId)}
                        maxQuantity={item.quantity}
                      />
                      <span>Количество:</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="cart-total">
        <p>Сумма заказа: {getTotalPrice()} ₽</p>
        <button className="checkout-button" onClick={handleCheckout}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
});

export default CartPage;
