from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import User, Basket, Order, OrderItem, Item
from app.schemas import UserCreate, UpdatePhone, UpdateLink

router = APIRouter()

@router.post("/")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.user_id == user_data.user_id).first()
    if existing_user:
        return existing_user
    
    now = datetime.utcnow()
    user = User(
        user_id=user_data.user_id,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        username=user_data.username,
        createdAt=now,
        updatedAt=now
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    basket = Basket(userId=user.id, createdAt=now, updatedAt=now)
    db.add(basket)
    db.commit()
    db.refresh(basket)

    return user


@router.get("/")
def find_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/{user_id}")
def find_one_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id}


@router.get("/{user_id}/basket")
def get_basket_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    basket = db.query(Basket).filter(Basket.userId == user.id).first()
    if not basket:
        now = datetime.utcnow()
        basket = Basket(userId=user.id, createdAt=now, updatedAt=now)
        db.add(basket)
        db.commit()
        db.refresh(basket)
    
    return {"basket_id": basket.id}


@router.get("/phone/{user_id}")
def get_user_phone(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"phone": user.phone}


@router.put("/phone/{user_id}")
def update_user_phone(user_id: int, data: UpdatePhone, db: Session = Depends(get_db)):
    if not data.phone.startswith("+7") or len(data.phone) != 12 or not data.phone[1:].isdigit():
        raise HTTPException(status_code=400, detail="Неверный формат телефона. Введите в формате +7XXXXXXXXXX")
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.phone = data.phone
    user.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return {"message": "Номер телефона обновлён", "phone": user.phone}


@router.put("/link/{user_id}")
def update_user_link(user_id: int, data: UpdateLink, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.link = data.link
    user.updatedAt = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return {"message": "Ссылка обновлена", "link": user.link}


@router.get("/orders/completed/{user_id}")
def get_completed_orders_count(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    count = db.query(Order).filter(Order.userId == user.id, Order.status == "Завершен").count()
    return {"completedOrders": count}

@router.get("/active-orders/{user_id}")
def get_active_orders_with_items(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    active_orders = db.query(Order).filter(Order.userId == user.id, Order.status != "Завершен").order_by(Order.createdAt.desc()).all()
    
    result = []
    for order in active_orders:
        order_items = db.query(OrderItem).filter(OrderItem.orderId == order.id).join(Item).all()
        items = [{
            "id": oi.itemId,
            "name": oi.item.name if oi.item else "Товар удален",
            "img": oi.item.img if oi.item else None,
            "count": oi.quantity,
            "price": oi.item.price if oi.item else 0
        } for oi in order_items]
        result.append({
            "Nid": order.Nid,
            "status": order.status,
            "items": items
        })
    return result


@router.get("/completed-orders/{user_id}")
def get_completed_orders_with_items(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    completed_orders = db.query(Order).filter(Order.userId == user.id, Order.status == "Завершен").order_by(Order.createdAt.desc()).all()
    
    result = []
    for order in completed_orders:
        order_items = db.query(OrderItem).filter(OrderItem.orderId == order.id).join(Item).all()
        items = [{
            "id": oi.itemId,
            "name": oi.item.name if oi.item else "Товар удален",
            "img": oi.item.img if oi.item else None,
            "count": oi.quantity,
            "price": oi.item.price if oi.item else 0
        } for oi in order_items]
        result.append({
            "Nid": order.Nid,
            "status": order.status,
            "items": items
        })
    return result