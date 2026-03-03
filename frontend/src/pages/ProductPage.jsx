import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../index';
import ProductList from '../components/ProductList';
import { observer } from 'mobx-react-lite';

const ProductPage = observer(() => {
  const { id } = useParams();
  const categoryId = parseInt(id, 10);
  const { categoryItemStore } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        await categoryItemStore.fetchItemsByCategory(categoryId);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    return () => {
      categoryItemStore.clearItems();
    };
  }, [categoryId, categoryItemStore]);

  if (loading) return <div>Загрузка...</div>;

  return <ProductList items={categoryItemStore.items} />;
});

export default ProductPage;
