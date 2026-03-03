import { $host } from './index.js';

export const fetchUser = async () => {
  try {
    const { data } = await $host.get('/user');
    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (user_id, first_name, last_name, username) => {
  const { data } = await $host.post('/user', { user_id, first_name, last_name, username });
  return data;
};

//Получение id корзины из таблицы baskets на основании user.id из телеграмм
export const getBasketIdUser = async (user_id) => {
  try {
    const response = await $host.get(`/user/${user_id}/basket`);
    return response.data; // Возвращаем только значение basketId
  } catch (error) {
    throw error;
  }
};

export const findOne = async (user_id) => {
  try {
    const response = await $host.get(`/user/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCompletedOrdersCount = async (user_id) => {
  try {
    const response = await $host.get(`/user/orders/completed/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getActiveOrders = async (user_id) => {
  try {
    const response = await $host.get(`/user/active-orders/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCompletedOrders = async (user_id) => {
  try {
    const response = await $host.get(`/user/completed-orders/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
