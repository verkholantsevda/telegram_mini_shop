import { makeObservable, observable, action } from 'mobx';

export default class ProductDetailStore {
  constructor() {
    this.products = new Map();

    makeObservable(this, {
      products: observable,
      addProduct: action,
      getProductById: action,
    });
  }

  addProduct(product) {
    this.products.set(String(product.id), product);
  }

  getProductById(productId) {
    return this.products.get(String(productId));
  }
}
