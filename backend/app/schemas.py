from pydantic import BaseModel
from typing import Optional, List, Dict

class UserBase(BaseModel):
    user_id: str
    first_name: Optional[str]
    last_name: Optional[str]
    username: Optional[str]
    phone: Optional[str]
    link: Optional[str]
    chatId: Optional[str]

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    createdAt: Optional[str]
    updatedAt: Optional[str]

    class Config:
        orm_mode = True

class UpdatePhone(BaseModel):
    phone: str

class UpdateLink(BaseModel):
    link: str

class BasketItemBase(BaseModel):
    itemId: int
    quantity: int

class BasketItemCreate(BasketItemBase):
    basketId: int
    quantity: int = 1

class BasketItemRemove(BaseModel):
    basketId: int
    itemId: int
    quantity: int = 1

class BasketClear(BaseModel):
    basketId: int

class BasketItem(BasketItemBase):
    id: int
    basketId: int

    class Config:
        orm_mode = True

class BasketBase(BaseModel):
    userId: int

class BasketCreate(BasketBase):
    pass

class Basket(BasketBase):
    id: int
    items: List[BasketItem] = []

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    Nid: str
    userId: int
    deliveryMethod: str
    address: Optional[str]
    paymentMethod: str
    comments: Optional[str]
    totalPrice: int
    status: Optional[str] = "pending"

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int

    class Config:
        orm_mode = True
class SendMessageRequest(BaseModel):
    user_id: int
    message: str

class ItemImage(BaseModel):
    file: str

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    consist: Optional[str] = None
    weight: Optional[str] = None
    price: Optional[int] = None
    quantity: int
    img: Optional[List[ItemImage]] = None
    categoryId: int

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    class Config:
        orm_mode = True

class DecreaseQuantityItem(BaseModel):
    itemId: int
    quantity: int

class DecreaseQuantityRequest(BaseModel):
    items: List[DecreaseQuantityItem]
    
class CategoryBase(BaseModel):
    name: str
    img: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    items: List[Item] = []

    class Config:
        orm_mode = True

Category.update_forward_refs()
from app.schemas import Item