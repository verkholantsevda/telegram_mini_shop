import React, { useContext, useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Context } from '../index';
import { useTelegram } from '../hooks/useTelegram';
import './ProductCard.css';

const ProductCard = ({ item }) => {
  const { cartStore } = useContext(Context);
  const [quantity, setQuantity] = useState(() => cartStore.getItemCount(item.id));
  const { user } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    setQuantity(cartStore.getItemCount(item.id));
  }, [cartStore, item.id]);

  const handleIncrease = () => {
    if (quantity < item.quantity) {
      setQuantity((prev) => prev + 1);
      if (user) cartStore.increaseItemCount(item);
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
      if (user) cartStore.decreaseItemCount(item.id);
    }
  };

  const openProductDetail = () => {
    navigate(`/product/${item.id}`);
    window.scrollTo(0, 0);
  };

  const isOutOfStock = item.quantity === 0;

  return (
    <li>
      <Card className={isOutOfStock ? 'out-of-stock-card' : 'carditem'}>
        <div className="catalog-list_link">
          <div className="catalog-list_img">
            <img
              alt="catalog"
              src={
                item.img.length > 0
                  ? process.env.REACT_APP_API_IMG_URL + item.img[0].file
                  : '/default-image.jpg'
              }
              onClick={openProductDetail}
              className="small-img"
            />
          </div>
          <Card.Body className="catalog-card-body">
            <Card.Title>{item.name}</Card.Title>
            <Card.Text>{item.description}</Card.Text>

            <div className="card-footer">
              {isOutOfStock ? (
                <span className="out-of-stock-label">Нет в наличии</span>
              ) : (
                <>
                  {quantity === 0 ? (
                    <button className="add-to-cart-button" onClick={handleIncrease}>
                      <FontAwesomeIcon icon={faShoppingCart} /> {item.price} ₽
                    </button>
                  ) : (
                    <div className="quantity-counter">
                      <button className="counter-button" onClick={handleDecrease}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="counter-value">{quantity}</span>
                      <button
                        className="counter-button"
                        onClick={handleIncrease}
                        disabled={quantity >= item.quantity}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card.Body>
        </div>
      </Card>
    </li>
  );
};

export default ProductCard;
