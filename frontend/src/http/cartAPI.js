import { $host } from './index.js';
export const fetchCart = async (basketId) => {
  try {
    const response = await $host.get(`/basket/${basketId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const addToCart = async (basketId, itemId, quantity = 1) => {
  try {
    const response = await $host.post(`/basket/add`, {
      basketId,
      itemId,
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const removeFromCart = async (basketId, itemId) => {
  try {
    const response = await $host.post(`api/basket/remove`, {
      basketId,
      itemId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
