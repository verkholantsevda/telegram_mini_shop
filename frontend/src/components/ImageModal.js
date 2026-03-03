import React from 'react';
import Modal from 'react-modal';
import './ImageModal.css';

const ImageModal = ({ isOpen, onRequestClose, imageSrc }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Image Modal"
      className="image-modal"
      overlayClassName="image-modal-overlay"
    >
      <img src={imageSrc} alt="Full size" className="full-size-img" />
      <button onClick={onRequestClose} className="close-button">
        Закрыть
      </button>
    </Modal>
  );
};

export default ImageModal;
