import { $host } from './index.js';

export const fetchCategories = async () => {
  try {
    const response = await $host.get(`/category/categories`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategoryById = async (categoryId) => {
  try {
    const response = await $host.get(`/category/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
