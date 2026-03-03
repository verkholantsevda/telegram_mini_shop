import React from 'react';
import Button from '../Button/Button';
import { useTelegram } from '../../hooks/useTelegram';

const Header = () => {
  const { user, onClose } = useTelegram();

  return (
    <sidebar-header className={'header'}>
      <Button onClick={onClose}>Close</Button>
      <span className={'username'}>{user?.username}</span>
    </sidebar-header>
  );
};

export default Header;
