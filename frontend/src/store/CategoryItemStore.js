import { makeObservable, observable, action } from 'mobx';
import { $host } from '../http';

export default class CategoryItemStore {
  constructor() {
    this._items = [];
    this._selectedType = {};

    makeObservable(this, {
      _items: observable,
      _selectedType: observable,
      setItems: action,
      setSelectedType: action,
    });
  }

  setItems(items) {
    this._items = items;
  }

  get items() {
    return this._items;
  }

  setSelectedType(type) {
    this._selectedType = type;
  }

  get selectedType() {
    return this._selectedType;
  }

  async fetchItemsByCategory(categoryId) {
    try {
      const response = await $host.get(`/item/category/${categoryId}`);
      this.setItems(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
    }
  }

  clearItems() {
    this._items = [];
  }
}
