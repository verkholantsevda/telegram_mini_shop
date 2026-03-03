import React, { useContext, useEffect, useState } from 'react';
import { getCompletedOrders } from '../http/userAPI';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';

const CompletedOrders = observer(() => {
  const { user } = useContext(Context);
  const [completedOrders, setCompletedOrders] = useState([]);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const data = await getCompletedOrders(user.id);
        setCompletedOrders(data);
      } catch (e) {
        console.error('Ошибка загрузки завершённых заказов:', e);
      }
    };
    if (user.id) fetchCompleted();
  }, [user]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Завершённые заказы</h2>
      {completedOrders.length === 0 ? (
        <p>Завершённых заказов нет.</p>
      ) : (
        completedOrders.map((order) => (
          <div
            key={order.Nid}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '10px',
              marginBottom: '20px',
              backgroundColor: '#f3f3f3',
            }}
          >
            <h4>Заказ {order.Nid}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      {item.price} x {item.count} = {item.price * item.count} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '10px' }}>
              <strong>Стоимость заказа: </strong>
              {order.items.reduce((sum, i) => sum + i.price * i.count, 0)} ₽
            </p>
            <p>
              <strong>Статус:</strong> {order.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
});

export default CompletedOrders;
