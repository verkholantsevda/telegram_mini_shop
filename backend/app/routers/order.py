from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models
from pydantic import BaseModel


router = APIRouter()

@router.get("/generate-nid")
def generate_nid(db: Session = Depends(get_db)):
    last_order = db.query(models.Order).order_by(desc(models.Order.id)).first()
    last_number = int(last_order.Nid.replace("№", "")) if last_order else 0
    Nid = f"№{last_number + 1}"
    return {"Nid": Nid}

@router.post("/create")
def create_order(order_data: dict, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == order_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    last_order = db.query(models.Order).order_by(desc(models.Order.id)).first()
    last_number = int(last_order.Nid.replace("№", "")) if last_order else 0
    Nid = f"№{last_number + 1}"

    new_order = models.Order(
        Nid=Nid,
        userId=user.id,
        deliveryMethod=order_data.get("deliveryMethod"),
        address=order_data.get("address"),
        paymentMethod=order_data.get("paymentMethod"),
        comments=order_data.get("comments"),
        totalPrice=order_data.get("totalPrice"),
        status=order_data.get("status"),
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    if not isinstance(order_data.get("items"), list):
        raise HTTPException(status_code=400, detail="Items must be provided as a list")

    for item in order_data["items"]:
        order_item = models.OrderItem(
            orderId=new_order.id,
            itemId=item["itemId"],
            quantity=item["quantity"]
        )
        db.add(order_item)

    db.commit()
    return {"message": "Заказ создан", "orderId": new_order.id}

@router.get("/last/{user_id}")
def get_last_order(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    last_order = db.query(models.Order).filter(
        models.Order.userId == user.id,
        models.Order.address != None
    ).order_by(desc(models.Order.createdAt)).first()

    if not last_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return last_order


@router.get("/")
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).filter(models.Order.status != "Завершен").all()


@router.put("/{id}")
def update_order(id: int, update_data: dict, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = update_data.get("status", order.status)
    order.comments = update_data.get("comments", order.comments)

    db.commit()
    db.refresh(order)
    return {"message": "Статус обновлен"}
