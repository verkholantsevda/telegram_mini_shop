import { $host } from './index.js';

export const fetchOrders = async () => {
  try {
    const { data } = await $host.get('/order/'); // Убедись, что URL правильный
    return data;
  } catch (error) {
    return [];
  }
};

export const updateOrderStatus = async (orderId, status, comment) => {
  try {
    await $host.put(`/order/${orderId}`, { status, comment });
  } catch (error) {
  }
};

export const sendOrderMessage = async (user_id, message) => {
  try {
    const response = await $host.post('/send-order-message', {
      user_id,
      message,
    });
    return response.data;
  } catch (error) {
    throw new Error('Ошибка при отправке сообщения');
  }
};
