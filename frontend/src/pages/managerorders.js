import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, sendOrderMessage } from '../http/orderAPI';
import './managerorders.css';

const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchOrders();
      const filteredOrders = data.filter((order) => order.status !== 'Завершен');
      setOrders(filteredOrders);
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setNewStatus(selectedOrder.status);
      setComment(selectedOrder.comment || '');
    }
  }, [selectedOrder]);

  const handleApplyChanges = async () => {
    if (!selectedOrder) return;
    await updateOrderStatus(selectedOrder.id, newStatus, comment);
    alert('Статус заказа обновлен');

    let message = '';
    switch (newStatus) {
      case 'В работе':
        message = `Ваш заказ ${selectedOrder.Nid} находится в работе.`;
        break;
      case 'Готов к выдаче':
        message = `Ваш заказ ${selectedOrder.Nid} готов к выдаче.`;
        break;
      case 'Завершен':
        message = `Ваш заказ ${selectedOrder.Nid} завершен. Спасибо за выбор нашего магазина!`;
        break;
      default:
        break;
    }
    console.log('DEBUG:', { newStatus, message, comment, selectedOrder });
    if (comment) {
      message += `\n${comment}`;
    }
    console.log('DEBUG:', { newStatus, message, comment, selectedOrder });
    try {
      await sendOrderMessage(selectedOrder.userId, message);
      alert('Сообщение отправлено пользователю');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      alert('Не удалось отправить сообщение пользователю');
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === selectedOrder.id ? { ...order, status: newStatus, comment } : order,
      ),
    );
  };

  return (
    <div className="container mt-5">
      <h3 className="section-title">Управление заказами</h3>
      <div className="form-group">
        <label htmlFor="orderSelect">Выберите заказ</label>
        <select
          className="form-control"
          id="orderSelect"
          onChange={(e) =>
            setSelectedOrder(orders.find((order) => order.id === parseInt(e.target.value, 10)))
          }
        >
          <option value="">Выберите заказ</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              Заказ {order.Nid}
            </option>
          ))}
        </select>
      </div>
      {selectedOrder && (
        <>
          <div className="form-group">
            <label htmlFor="statusSelect">Статус заказа</label>
            <select
              className="form-control"
              id="statusSelect"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Принят">Принят</option>
              <option value="В работе">В работе</option>
              <option value="Готов к выдаче">Готов к выдаче</option>
              <option value="Завершен">Завершен</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Комментарий</label>
            <textarea
              className="form-control"
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button className="btn btn-primary d-block mx-auto" onClick={handleApplyChanges}>
            Применить
          </button>
        </>
      )}
    </div>
  );
};

export default ManagerOrders;
