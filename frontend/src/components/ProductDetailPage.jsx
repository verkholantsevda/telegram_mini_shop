import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../index';
import './ProductDetailPage.css';
import { useTelegram } from '../hooks/useTelegram';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const ProductDetailPage = () => {
  const { productDetailStore, cartStore } = useContext(Context);
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useTelegram();

  const product = productDetailStore.getProductById(productId);
  const [quantity, setQuantity] = useState(() => cartStore.getItemCount(productId));
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!product) navigate('/');
  }, [product, navigate]);

  useEffect(() => {
    if (product) {
      setQuantity(cartStore.getItemCount(product.id));
    }
  }, [cartStore, cartStore.items, product]);

  useEffect(() => {
    if (user) cartStore.fetchCart(user.id);
  }, [user, cartStore]);

  if (!product) return <div>Товар не найден</div>;

  const handleAddToCart = () => {
    cartStore.increaseItemCount(product);
    setQuantity((prev) => prev + 1);
  };

  const handleIncrease = () => {
    cartStore.increaseItemCount(product);
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      cartStore.decreaseItemCount(product.id);
      setQuantity((prev) => prev - 1);
    }
  };

  const images =
    product.img && product.img.length > 0
      ? product.img.map((img) => `${process.env.REACT_APP_API_IMG_URL}/${img.file}`)
      : ['/default-image.jpg'];

  return (
    <div className="product-detail-page">
      {/* Swiper Coverflow */}
      <div className="swiper-container">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 2,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="mySwiper"
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <img src={img} alt={`product-${index}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="productpage-content">
        <h3>{product.name}</h3>

        <div className="product-detail-buttons">
          <div className="product-detail-price">
            <span className="price-number">{product.price}</span>
            <span className="price-currency">₽</span>
          </div>

          {quantity === 0 ? (
            <button className="add-to-cart-button" onClick={handleAddToCart}>
              В корзину
            </button>
          ) : (
            <div className="quantity-counter-button">
              <button className="counter-btn" onClick={handleDecrease}>
                -
              </button>
              <span className="counter-value">{quantity}</span>
              <button className="counter-btn" onClick={handleIncrease}>
                +
              </button>
            </div>
          )}
        </div>

        <div className="productpage-content-description">
          <p style={{ whiteSpace: 'pre-line' }}>
            <strong>Описание:</strong>
            <br />
            {product.description}
          </p>
        </div>

        <div className="productpage-content-consist">
          <p style={{ whiteSpace: 'pre-line' }}>
            <strong>Состав:</strong>
            <br />
            {product.consist}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
