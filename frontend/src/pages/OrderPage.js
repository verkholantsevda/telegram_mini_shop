import React, { useState, useContext, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Context } from '../index';
import './OrderPage.css';
import { $host } from '../http/index.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { decreaseItemQuantities } from '../http/itemAPI.js';

const OrderPage = observer(() => {
  const { user, cartStore } = useContext(Context);
  const [deliveryMethod, setDeliveryMethod] = useState('Самовывоз');
  const [paymentMethod, setPaymentMethod] = useState('Оплата по СБП');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [comments, setComments] = useState('');
  const [Nid, setNid] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  
  const navigate = useNavigate();



  useEffect(() => {
    const fetchNid = async () => {
      try {
        const response = await $host.get('/order/generate-nid');
        setNid(response.data.Nid);
      } catch (error) {
        console.error('Ошибка при получении Nid:', error);
      }
    };
    fetchNid();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_id = user.id;
        const responseAddress = await $host.get(`/order/last/${user_id}`);
        if (responseAddress.data.address) {
          setAddress(responseAddress.data.address);
        }

        const responsePhone = await $host.get(`/user/phone/${user_id}`);
        if (responsePhone.data.phone) {
          setPhone(responsePhone.data.phone);
        }
      } catch (error) {
        console.error('Ошибка при загрузке последнего заказа:', error);
      }
    };

    fetchUserData();
  }, [user.id]);

  const validatePhone = (phone) => {
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setPhone(newPhone);

    if (!validatePhone(newPhone)) {
      setPhoneError('Неверный формат номера. Используйте формат +7XXXXXXXXXX.');
    } else {
      setPhoneError('');
    }
  };

  const handleDeliveryChange = (e) => {
    const method = e.target.value;
    setDeliveryMethod(method);

    if (method === 'Доставка') {
      setPaymentMethod('Оплата по СБП');
    } else {
      setPaymentMethod('Оплата по СБП');
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const getTotalItems = () => {
    let totalItems = 0;
    cartStore._itemCounts.forEach((count) => {
      totalItems += count;
    });
    return totalItems;
  };

  const getTotalPrice = () => {
    let totalPrice = 0;
    cartStore._itemCounts.forEach((count, itemId) => {
      const item = cartStore.getProductById(itemId);
      if (item) {
        totalPrice += item.price * count;
      }
    });
    return totalPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setPhoneError('Неверный формат номера. Используйте формат +7XXXXXXXXXX.');
      return;
    }

    setIsSubmitting(true);

    let link = user.username ? `t.me/${user.username}` : `t.me/${phone}`;
    try {
      const user_id = user.id;
      console.log(user_id);
      console.log(link);
      await $host.put(`/user/link/${user_id}`, { link });
      await $host.put(`/user/phone/${user_id}`, { phone });
    } catch (error) {
      console.error('Ошибка при обновлении телефона:', error);
    }
    const cartItems = Array.from(cartStore._itemCounts.entries())
      .map(([itemId, count]) => {
        const item = cartStore.getProductById(itemId);
        return item
          ? { itemId: item.id, name: item.name, quantity: count, total: item.price * count }
          : null;
      })
      .filter(Boolean);

    if (cartItems.length === 0) {
      alert('Корзина пуста!');
      setIsSubmitting(false); 
      return;
    }

    const orderData = {
      Nid,
      user_id: user.id,
      deliveryMethod,
      address: deliveryMethod === 'Доставка' ? address : null,
      paymentMethod,
      comments,
      totalPrice: getTotalPrice(),
      items: cartItems,
      link: link,
      status: 'Принят',
    };

    const orderSendData = {
      Nid,
      userName: `${user.first_name} ${user.last_name}`,
      username: `${user.username}`,
      link: link,
      phone: e.target.phone.value,
      deliveryMethod,
      address: deliveryMethod === 'Доставка' ? address : null,
      paymentMethod,
      comments: e.target.comments.value,
      totalItems: getTotalItems(),
      totalPrice: getTotalPrice(),
      cartItems: Array.isArray(cartItems) ? cartItems : [],
    };
    console.log(orderSendData);
    console.log(orderData);
    try {
      const responseOrder = await $host.post('/order/create', orderData);
      await decreaseItemQuantities(cartItems.map(({ itemId, quantity }) => ({ itemId, quantity })));

      await $host.post('/send-order', JSON.stringify(orderSendData), {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('Заказ успешно оформлен!');
      const basketId = cartStore._basketId;
      navigate('/');
      setIsSubmitting(false);

      await $host.post(`/basket/clear-basket`, { basketId });
      cartStore.clearCart();

    } catch (error) {
      alert('Ошибка при оформлении заказа.');
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://geocode-maps.yandex.ru/1.x/?geocode=${longitude},${latitude}&apikey=92ef639b-5a8d-4a4b-aa81-e3437a0cec5e&format=json&results=1`,
            );

            // Проверяем, что ответ содержит данные и есть хотя бы один объект
            const featureMember = response.data.response.GeoObjectCollection.featureMember;
            if (featureMember && featureMember.length > 0) {
              // Извлекаем полный адрес из description
              const address = featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
              setAddress(address); // Обновляем состояние с полным адресом
            } else {
              console.error('Адрес не найден');
              setAddress('Адрес не найден');
            }
          } catch (error) {
            console.error('Ошибка при получении адреса:', error);
            setAddress('Ошибка при получении адреса');
          }
        },
        (error) => {
          console.error('Ошибка при получении геолокации:', error);
          setAddress('Ошибка при получении геолокации');
        },
      );
    } else {
      console.error('Geolocation не поддерживается вашим браузером.');
      setAddress('Геолокация не поддерживается');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="order-page">
      <h2>Новый заказ</h2>
      {Nid && <h3>Номер заказа: {Nid}</h3>}
      <Form onSubmit={handleSubmit}>
        <div className="form-group">
          <Form.Label>В корзине: {getTotalItems()} товаров</Form.Label>
        </div>
        <div className="form-group">
          <Form.Label>На сумму: {getTotalPrice()} RUB</Form.Label>
        </div>
        <div className="form-group">
          <Form.Label>Ваше имя:</Form.Label>
          <Form.Control type="text" value={`${user.first_name} ${user.last_name}`} readOnly />
        </div>
        <div className="form-group">
          <Form.Label>Контактный телефон:</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            placeholder="Введите ваш телефон"
            value={phone}
            onChange={handlePhoneChange}
            required
          />
          {phoneError && <div style={{ color: 'red' }}>{phoneError}</div>}
        </div>
        <div className="form-group">
          <Form.Label>Способ доставки:</Form.Label>
          <Form.Control as="select" onChange={handleDeliveryChange}>
            <option value="Самовывоз">Самовывоз</option>
            <option value="Доставка">Доставка</option>
          </Form.Control>
        </div>
        {deliveryMethod === 'Доставка' && (
          <>
            <div className="form-group">
              <Form.Label>Адрес доставки:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите адрес доставки"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <Form.Text muted>Доставка оплачивается отдельно</Form.Text>
            <div className="form-group">
              <Button variant="primary" onClick={handleShareLocation}>
                Поделиться местоположением
              </Button>
            </div>
          </>
        )}
        <div className="form-group">
          <Form.Label>Способ оплаты:</Form.Label>
          <Form.Control as="select" value={paymentMethod} onChange={handlePaymentChange}>
            <option value="Оплата по СБП">Оплата по СБП</option>
            <option value="Оплата через ЮКасса">Оплата через ЮКасса</option>
          </Form.Control>
        </div>

        <div className="form-group">
          <Form.Label>Комментарии к заказу:</Form.Label>
          <Form.Control
            as="textarea"
            name="comments"
            rows={3}
            placeholder="Введите ваши комментарии"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'СДЕЛАТЬ ЗАКАЗ'}
        </Button>
      </Form>
    </div>
  );
});

export default OrderPage;
