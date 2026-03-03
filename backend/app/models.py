from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON, TIMESTAMP, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    link = Column(String, nullable=True)
    chatId = Column(Integer, nullable=True)

    createdAt = Column(String, nullable=False)
    updatedAt = Column(String, nullable=False)

    basket = relationship("Basket", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")

class Basket(Base):
    __tablename__ = "baskets"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=True)

    createdAt = Column(TIMESTAMP, nullable=True)
    updatedAt = Column(TIMESTAMP, nullable=True)

    user = relationship("User", back_populates="basket")
    items = relationship("BasketItem", back_populates="basket")


class BasketItem(Base):
    __tablename__ = "basket_items"

    id = Column(Integer, primary_key=True, index=True)
    basketId = Column(Integer, ForeignKey("baskets.id"))
    itemId = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    basket = relationship("Basket", back_populates="items")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    img = Column(String, nullable=False)
    items = relationship("Item", back_populates="category")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    consist = Column(Text, nullable=True)
    weight = Column(Integer, nullable=True)
    price = Column(Integer, nullable=True)
    quantity = Column(Integer, nullable=False)
    img = Column(JSON, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    categoryId = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    Nid = Column(String, nullable=False)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)

    deliveryMethod = Column(String, nullable=False)
    address = Column(String, nullable=True)
    paymentMethod = Column(String, nullable=False)
    comments = Column(String, nullable=True)
    totalPrice = Column(Integer, nullable=False)

    createdAt = Column(DateTime, server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    status = Column(String, nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    orderId = Column(Integer, ForeignKey("orders.id"))
    itemId = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    item = relationship("Item")