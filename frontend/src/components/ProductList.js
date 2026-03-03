import React from 'react';
import { observer } from 'mobx-react-lite';
import ProductCard from './ProductCard';
import './ProductList.css';
import { Context } from '../index';
import { useContext, useEffect, useState } from 'react';

const ProductList = observer(({ items }) => {
  const { productDetailStore } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const addProducts = async () => {
      items.forEach((item) => {
        productDetailStore.addProduct(item); 
        console.log(`Product added to ProductDetailStore in ProductList: ${item.name} ${item.id}`);
        console.log(`Product details:`, JSON.stringify(item, null, 2)); 
      });
      setLoading(false);
    };
    addProducts();
  }, [items, productDetailStore]);

  console.log('Items in ProductList:', items); 
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <main role="main" className="main-content cf category-page">
      <ul className="catalog-list">
        <div className="card-list">
          {items.map((item) => (
            <li key={item.id}>
              <ProductCard item={item} />
            </li>
          ))}
        </div>
      </ul>
    </main>
  );
});

export default React.memo(ProductList);
