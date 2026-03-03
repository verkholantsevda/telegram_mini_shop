from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import BasketItem
from app.schemas import BasketItemCreate, BasketItemRemove, BasketItem as BasketItemSchema, BasketClear

router = APIRouter()

@router.get("/{basket_id}", response_model=List[BasketItemSchema])
def get_basket_items(basket_id: int, db: Session = Depends(get_db)):
    items = db.query(BasketItem).filter(BasketItem.basketId == basket_id).all()
    return items

@router.post("/add")
def add_item_to_basket(action: BasketItemCreate, db: Session = Depends(get_db)):
    item = db.query(BasketItem).filter(
        BasketItem.basketId == action.basketId,
        BasketItem.itemId == action.itemId
    ).first()

    if item:
        item.quantity += action.quantity
    else:
        item = BasketItem(
            basketId=action.basketId,
            itemId=action.itemId,
            quantity=action.quantity
        )
        db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": "Item added to basket"}

@router.post("/remove")
def remove_item_from_basket(action: BasketItemRemove, db: Session = Depends(get_db)):
    item = db.query(BasketItem).filter(
        BasketItem.basketId == action.basketId,
        BasketItem.itemId == action.itemId
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found in basket")

    if item.quantity > action.quantity:
        item.quantity -= action.quantity
        db.commit()
        db.refresh(item)
    else:
        db.delete(item)
        db.commit()

    return {"message": "Item removed from basket"}

@router.post("/clear-basket")
def clear_basket(action: BasketClear, db: Session = Depends(get_db)):
    db.query(BasketItem).filter(BasketItem.basketId == action.basketId).delete()
    db.commit()
    return {"message": "Корзина очищена"}