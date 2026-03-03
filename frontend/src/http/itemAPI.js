import { $host } from './index.js';

export const fetchItems = async () => {
  try {
    const response = await $host.get(`/items`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchItemById = async (itemId) => {
  try {
    const response = await $host.get(`/item/${itemId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchItemsByCategory = async (categoryId) => {
  try {
    const response = await $host.get(`/item/category/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const decreaseItemQuantities = async (items) => {
  try {
    const response = await $host.post(`/item/decrease-quantity`, { items });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateItem = async (id, itemData) => {
  const formData = new FormData();
  formData.append('name', itemData.name);
  formData.append('description', itemData.description);
  formData.append('price', itemData.price);
  formData.append('weight', itemData.weight);
  formData.append('categoryId', itemData.categoryId);
  formData.append('consist', itemData.consist);
  formData.append('quantity', itemData.quantity);

  const existingImages = itemData.img.filter((i) => !(i.file instanceof File)).map((i) => i.file);

  formData.append('existingImages', JSON.stringify(existingImages));

  itemData.img.forEach((imgObj) => {
    if (imgObj.file instanceof File) {
      formData.append('files', imgObj.file);
    }
  });

  return await $host.post(`/item/update/${id}`, formData, {
    //headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadItem = async (item) => {
  const formData = new FormData();

  formData.append('name', item.name);
  formData.append('description', item.description);
  formData.append('consist', item.consist);
  formData.append('weight', item.weight);
  formData.append('price', item.price);
  formData.append('quantity', item.quantity);
  formData.append('categoryId', item.categoryId);

  item.img.forEach(({ file }) => {
    formData.append('files', file);
  });

  try {
    const response = await $host.post(`/item/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке:', error.response?.data || error.message);
    throw new Error('Ошибка при загрузке товара');
  }
};

export const deleteImage = async (itemId, imgPath) => {
  const response = await $host.delete(`${process.env.REACT_APP_API_URL}/items/${itemId}/image`, {
    data: { imgPath },
  });
  return response.data;
};
