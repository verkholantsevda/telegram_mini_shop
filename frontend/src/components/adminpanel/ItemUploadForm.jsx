import React, { useEffect, useState } from 'react';
import './AdminPage.css';
import { fetchCategories } from '../../http/categoryAPI';
import { fetchItemsByCategory, updateItem, uploadItem } from '../../http/itemAPI';

const AdminPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    weight: '',
    categoryId: '',
    consist: '',
    quantity: '',
    img: [],
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const loadItems = async () => {
        const data = await fetchItemsByCategory(selectedCategory.id);
        setItems(data);
      };
      loadItems();
    }
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      previewImages.forEach(URL.revokeObjectURL);
    };
  }, [previewImages]);

  const handleNewItemChange = (e) => {
    const { id, value } = e.target;
    if (id === 'categoryId') {
      setCategoryError(!value);
    }
    setNewItem((prevItem) => ({
      ...prevItem,
      [id]: value,
    }));
  };

  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImages((prevImages) => [...prevImages, imageUrl]);
      setNewItem((prevItem) => ({
        ...prevItem,
        img: [...prevItem.img, { file }],
      }));
    }
  };

  const handleUploadItem = async () => {
    if (!newItem.categoryId) {
      alert('Пожалуйста, выберите категорию перед созданием товара.');
      return;
    }
    try {
      console.log('Отправляемые данные:', newItem);
      await uploadItem(newItem);
      alert('Товар успешно создан!');
      setNewItem({
        name: '',
        description: '',
        price: '',
        weight: '',
        categoryId: '',
        consist: '',
        quantity: '',
        img: [],
      });
      setPreviewImages([]); 
    } catch (error) {
      alert('Ошибка при создании товара');
    }
  };

  const handleCategoryChange = (event) => {
    const selected = categories.find(
      (category) => category.id === parseInt(event.target.value, 10),
    );
    setSelectedCategory(selected);
    setSelectedItem(null); 
  };

  const handleItemChange = (event) => {
    const selected = items.find((item) => item.id === parseInt(event.target.value, 10));
    setSelectedItem(
      selected ? { ...selected, img: Array.isArray(selected.img) ? selected.img : [] } : null,
    );
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSelectedItem((prevItem) => ({
      ...prevItem,
      [id]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedItem((prevItem) => ({
        ...prevItem,
        img: [...prevItem.img, { file, preview: imageUrl, isNew: true }],
      }));
    }
  };

  const handleUpdateItem = async () => {
    if (selectedItem) {
      const updatedItem = {
        ...selectedItem,
        newImages: selectedItem.img
          .filter((img) => img.file instanceof File)
          .map((img) => ({ file: img.file.name })),
      };

      console.log('Обновляемые данные:', updatedItem);
      await updateItem(updatedItem.id, updatedItem);
      alert('Данные товара обновлены');
    }
  };

  const handleImageDelete = (index) => {
    setSelectedItem((prevItem) => {
      const newImages = [...prevItem.img];
      newImages.splice(index, 1);
      return {
        ...prevItem,
        img: newImages,
      };
    });
  };

  return (
    <div className="container mt-5">
      {/* Section 1: Создание нового товара */}
      <div className="section mb-5">
        <h3 className="section-title">Создание нового товара</h3>
        <form>
          <div className="form-group">
            <label htmlFor="name">Название товара</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Введите название"
              value={newItem.name}
              onChange={handleNewItemChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              type="text"
              className="form-control"
              id="description"
              placeholder="Введите описание"
              value={newItem.description}
              onChange={handleNewItemChange}
              rows={5}
            />
          </div>
          <div className="form-group">
            <label htmlFor="consist">Состав</label>
            <input
              type="text"
              className="form-control"
              id="consist"
              placeholder="Введите состав"
              value={newItem.consist}
              onChange={handleNewItemChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight">Объем/Вес</label>
            <input
              type="text"
              className="form-control"
              id="weight"
              placeholder="Введите объем/вес"
              value={newItem.weight}
              onChange={handleNewItemChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Цена</label>
            <input
              type="text"
              className="form-control"
              id="price"
              placeholder="Введите цену"
              value={newItem.price}
              onChange={handleNewItemChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Количество</label>
            <input
              type="text"
              className="form-control"
              id="quantity"
              placeholder="Введите количество"
              value={newItem.quantity}
              onChange={handleNewItemChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="img">Изображение</label>
            <input
              type="file"
              className="form-control-file"
              id="img"
              onChange={handleNewImageChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="categoryId">Категория</label>
            <select
              className="form-control"
              id="categoryId"
              value={newItem.categoryId}
              onChange={handleNewItemChange}
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoryError && <small className="text-danger">{categoryError}</small>}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUploadItem}
            disabled={!newItem.categoryId}
          >
            Создать товар
          </button>
        </form>
        <div className="image-preview-container">
          {previewImages.map((imageUrl, index) => (
            <div key={index} className="image-preview">
              <img
                src={imageUrl}
                alt={`Preview ${index}`}
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
              <button type="button" onClick={() => handleImageDelete(index)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Редактирование товара */}
      <div className="section">
        <h3 className="section-title">Редактирование товара</h3>
        <form>
          <div className="form-group">
            <label htmlFor="editCategory">Выберите категорию</label>
            <select className="form-control" id="editCategory" onChange={handleCategoryChange}>
              <option>Меню выбора категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="editProductSelect">Выберите товар</label>
            <select className="form-control" id="editProductSelect" onChange={handleItemChange}>
              <option>Меню выбора товара</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="editCategory">Категория</label>
            <select
              className="form-control"
              id="editCategory"
              value={selectedItem ? selectedItem.categoryId || '' : ''}
              onChange={handleCategoryChange}
            >
              <option value="">Выберите категорию</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="editName">Название</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Поле ввода текста"
              value={selectedItem ? selectedItem.name : ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editDescription">Описание товара</label>
            <textarea
              className="form-control"
              id="description"
              placeholder="Поле ввода текста"
              value={selectedItem ? selectedItem.description : ''}
              onChange={handleInputChange}
              rows={5}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editConsist">Состав</label>
            <input
              type="text"
              className="form-control"
              id="consist"
              placeholder="Поле ввода текста"
              value={selectedItem ? selectedItem.consist : ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editWeight">Объем/Вес</label>
            <input
              type="text"
              className="form-control"
              id="weight"
              placeholder="Поле ввода текста"
              value={selectedItem ? selectedItem.weight : ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editPrice">Цена</label>
            <input
              type="text"
              className="form-control"
              id="price"
              placeholder="Поле ввода текста"
              value={selectedItem ? selectedItem.price : ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editQuantity">Количество</label>
            <input
              type="text"
              className="form-control"
              id="quantity"
              placeholder="Поле ввода текста"
              value={selectedItem ? selectedItem.quantity : ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="editImg">Изображения товара</label>
            <div>
              {Array.isArray(selectedItem?.img)
                ? selectedItem.img.map((img, index) => (
                    <div key={index} className="image-preview">
                      <img
                        src={
                          img.file instanceof File
                            ? URL.createObjectURL(img.file)
                            : process.env.REACT_APP_API_IMG_URL + img.file
                        }
                        alt={`img-${index}`}
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                      <button type="button" onClick={() => handleImageDelete(index)}>
                        Удалить
                      </button>
                    </div>
                  ))
                : null}
            </div>
            <input
              type="file"
              className="form-control-file"
              id="img"
              onChange={handleImageChange}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleUpdateItem}>
            Обновить данные товара
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
