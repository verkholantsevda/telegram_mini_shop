import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import AppRouter from './components/AppRouter';
import Spinner from 'react-bootstrap/Spinner';

const App = observer(() => {
  const { loading } = useState(true);

  if (loading) {
    return <Spinner animation={'grow'} />;
  }

  return <AppRouter />;
});

export default App;
