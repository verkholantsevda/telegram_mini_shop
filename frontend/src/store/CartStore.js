import { makeObservable, observable, action, computed } from 'mobx';
import { fetchCart, addToCart, removeFromCart } from '../http/cartAPI';
import { getBasketIdUser } from '../http/userAPI';
import { fetchItemById } from '../http/itemAPI';

export default class CartStore {
  constructor() {
    this._items = 0;
    this._itemCounts = observable.map({});
    this._products = observable.array([]);
    this._basketId = null;
    makeObservable(this, {
      _items: observable,
      _itemCounts: observable,
      _products: observable,
      _basketId: observable,
      increaseItemCount: action,
      decreaseItemCount: action,
      getItemCount: action,
      itemCount: computed,
      addProduct: action,
      getProductById: action,
      fetchCart: action,
      setBasketId: action,
      getBasketIdUser: action,
    });
  }

  getBasketIdUser = async (user_id) => {
    try {
      const basketId = await getBasketIdUser(user_id);
      console.log('Получен basketId:', basketId);
      this.setBasketId(basketId.basket_id);
    } catch (error) {
      console.error('Ошибка при получении basketId:', error);
    }
  };

  setBasketId = (basketId) => {
    this._basketId = basketId;
  };

  fetchCart = async () => {
    if (this._basketId) {
      try {
        const data = await fetchCart(this._basketId);
        this._itemCounts.clear();
        this._products.clear();
        const itemIds = data.map((item) => item.itemId);
        const uniqueItemIds = [...new Set(itemIds)];
        const products = await Promise.all(uniqueItemIds.map((itemId) => fetchItemById(itemId)));
        this._products.replace(products);
        data.forEach(({ itemId, quantity }) => {
          this._itemCounts.set(itemId, quantity);
        });
        this._items = data.reduce((total, { quantity }) => total + quantity, 0);
      } catch (error) {
        console.error('Ошибка при получении корзины:', error);
      }
    }
  };

  increaseItemCount = async (item) => {
    const itemId = item.id;
    if (this._basketId) {
      try {
        await addToCart(this._basketId, itemId, 1);
        console.log(this._basketId);
        console.log(itemId);
        if (!this._products.find((product) => product.id === itemId)) {
          this.addProduct(item);
        }
        if (this._itemCounts.has(itemId)) {
          this._itemCounts.set(itemId, this._itemCounts.get(itemId) + 1);
        } else {
          this._itemCounts.set(itemId, 1);
        }
        this._items += 1;
      } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error);
      }
    }
  };

  decreaseItemCount = async (itemId) => {
    if (this._basketId) {
      try {
        await removeFromCart(this._basketId, itemId, 1);
        if (this._itemCounts.has(itemId) && this._itemCounts.get(itemId) > 0) {
          this._itemCounts.set(itemId, this._itemCounts.get(itemId) - 1);
          this._items -= 1;
          if (this._itemCounts.get(itemId) === 0) {
            this._itemCounts.delete(itemId);
          }
        }
      } catch (error) {
        console.error('Ошибка при удалении товара из корзины:', error);
      }
    }
  };

  getItemCount(itemId) {
    return this._itemCounts.get(itemId) || 0;
  }

  get itemCount() {
    return this._items;
  }

  addProduct(product) {
    this._products.push(product);
  }

  getProductById(itemId) {
    return this._products.find((product) => product.id === itemId);
  }

  clearCart() {
    this._itemCounts.clear();
    this._items = 0;
  }
}
