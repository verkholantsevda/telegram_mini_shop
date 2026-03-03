import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import Card from 'react-bootstrap/Card';
import './category.css';
import { login } from '../http/userAPI';
import { useTelegram } from '../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';

const CategoryList = observer(() => {
  const { categoryStore } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    categoryStore.fetchCategories();
  }, [categoryStore]);

  const { user } = useTelegram();

  useEffect(() => {
    const sendDataToAPI = async () => {
      if (user) {
        try {
          await login(user?.id, user?.first_name, user?.last_name, user?.username);
        } catch (error) {
        }
      }
    };
    sendDataToAPI();
  }, [user]);

  const handleCategoryClick = (id) => {
    navigate(`/category/${id}`);
  };

  const sortedCategories = [...categoryStore.categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <main role="main" className="main-content cf category-page">
      <ul className="category-node">
        {sortedCategories.map((categoryItem) => (
          <li key={categoryItem.id}>
            <Card>
              <div
                className="category-node_link"
                onClick={() => handleCategoryClick(categoryItem.id)}
              >
                <div className="category-node_img">
                  <img
                    alt="category-image"
                    src={process.env.REACT_APP_API_IMG_URL + categoryItem.img}
                  />
                </div>
                <Card.Body className="category-node_title">
                  <Card.Title>{categoryItem.name}</Card.Title>
                </Card.Body>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
});

export default CategoryList;
