import { makeObservable, observable, action } from 'mobx';
import { fetchCategories } from '../http/categoryAPI';

export default class CategoryStore {
  constructor() {
    this.categories = observable([]);
    makeObservable(this, {
      categories: observable,
      fetchCategories: action,
    });
  }

  fetchCategories = async () => {
    try {
      const data = await fetchCategories();
      this.categories.replace(data);
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
    }
  };
}
