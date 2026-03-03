import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { getCompletedOrdersCount, getActiveOrders } from '../http/userAPI';
import { Link } from 'react-router-dom';

const Profile = observer(() => {
  const { user } = useContext(Context);
  const [orderCount, setOrderCount] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (user && user.id) {
        try {
          const data = await getCompletedOrdersCount(user.id);
          setOrderCount(data.completedOrders);
        } catch (error) {
          console.error('Ошибка при получении количества завершённых заказов:', error);
          setOrderCount(0);
        }
      }
    };
    fetchOrderCount();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeData = await getActiveOrders(user.id);
        setActiveOrders(activeData);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setActiveOrders([]);
      }
    };
    if (user.id) {
      fetchData();
    }
  }, [user]);

  if (!user || !user.id) return <div>Загрузка профиля...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '5px' }}>Профиль клиента:</h2>
      <p style={{ fontSize: '14px', marginTop: 0 }}>
        {user.first_name} {user.last_name}
      </p>
      <p>Количество завершённых заказов: {orderCount === null ? 'Загрузка...' : orderCount}</p>

      {orderCount > 0 && (
        <p>
          <Link
            to="/completed-orders"
            style={{
              display: 'inline-block',
              marginTop: '5px',
              color: '#007bff',
              textDecoration: 'none', 
            }}
          >
            Список заказов
          </Link>
        </p>
      )}

      {activeOrders.length > 0 ? (
        <div style={{ marginTop: '20px' }}>
          <h3>Активные заказы:</h3>
          {activeOrders.map((order) => {
            console.log('📦 order.items:', order.items);
            const totalSum = order.items.reduce((sum, item) => sum + item.price * item.count, 0);
            return (
              <div
                key={order.Nid}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '10px',
                  marginBottom: '20px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <h4 style={{ margin: '0 0 10px' }}>Заказ {order.Nid}</h4>
                <div>
                  <strong>Позиции:</strong>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginTop: '10px',
                    }}
                  >
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <img
                          src={
                            item.img?.[0]?.file
                              ? process.env.REACT_APP_API_IMG_URL + item.img[0].file
                              : '/fallback.png'
                          }
                          alt={item.name}
                          width={50}
                          height={50}
                          style={{ borderRadius: '5px' }}
                        />
                        <div>
                          <div>{item.name}</div>
                          <div style={{ fontSize: '13px', color: '#555' }}>
                            {item.price}₽ x {item.count} ={' '}
                            <strong>{item.price * item.count}₽</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ marginTop: '10px' }}>
                  <strong>Стоимость заказа:</strong> {totalSum}₽
                </p>
                <p style={{ marginTop: '5px' }}>
                  <strong>Статус заказа:</strong> {order.status}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
          Активных заказов нет
        </p>
      )}
    </div>
  );
});

export default Profile;
