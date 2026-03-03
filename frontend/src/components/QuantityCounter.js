import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import './QuantityCounter.css';

const QuantityCounter = ({ quantity, onIncrease, onDecrease, maxQuantity = Infinity }) => {
  return (
    <div className="quantity-control">
      <Button variant="light" onClick={onDecrease} disabled={quantity <= 0}>
        <FontAwesomeIcon icon={faMinus} />
      </Button>

      <span>{quantity}</span>

      <Button variant="light" onClick={onIncrease} disabled={quantity >= maxQuantity}>
        <FontAwesomeIcon icon={faPlus} />
      </Button>
    </div>
  );
};

export default QuantityCounter;
