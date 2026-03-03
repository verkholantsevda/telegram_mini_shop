import React, { useEffect, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import './Navbar.css';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import iconImg from './images/image_ican.jpg';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';

const NavBar = () => {
  const shopTelegramContact = process.env.REACT_APP_SHOP_TELEGRAM_CONTACT;
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const adminId = parseInt(process.env.REACT_APP_ADMIN_USER_ID, 10);
  const manId = parseInt(process.env.REACT_APP_MANAGER_USER_ID, 10);
  const handleBackButtonClick = useCallback(() => {
    if (location.pathname === '/') {
      if (window.Telegram && window.Telegram.WebApp) {  
        window.Telegram.WebApp.close();
      } else {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.BackButton.show();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);
    } else {
      console.error('Telegram WebApp не доступен');
    }

    return () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
        window.Telegram.WebApp.BackButton.hide();
      }
    };
  }, [handleBackButtonClick]);

  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Container className="container-navbar">
        <img src={iconImg} alt="Размер" className="icon-size" />
        {user && (user.id === adminId || user.id === manId) && location.pathname === '/' && (
          <>
            <Button
              variant="light"
              className="admin-button"
              onClick={() => navigate('/adminpanel')}
            >
              Admin
            </Button>
            <Button
              variant="light"
              className="admin-button"
              onClick={() => navigate('/managerorders')}
            >
              ManagerOrder
            </Button>
          </>
        )}
        {user && user.id !== adminId && user.id !== manId && (
          <Button
            variant="light"
            className="admin-button"
            onClick={() => window.open(shopTelegramContact, '_blank')}
          >
            Связь с магазином
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default NavBar;
