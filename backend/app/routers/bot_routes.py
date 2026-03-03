from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from telegram import Bot
from app.telegram_bot import bot
from app.schemas import SendMessageRequest
from dotenv import load_dotenv
import os
from PIL import Image
import io

load_dotenv()
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID")

router = APIRouter()
STATIC_PATH = os.path.join(os.getcwd(), "static")

@router.post("/send-order")
async def send_order(order_data: dict, db: Session = Depends(get_db)):
    chat_id_admin = ADMIN_CHAT_ID
    
    user = db.query(models.User).filter(models.User.username == order_data["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    chat_id = int(user.chatId)
    cart_items_text = "".join(
        [f"- {i['name']} (x{i['quantity']}): {i['total']} RUB\n" for i in order_data['cartItems']]
    )

    admin_msg = f"""📦 Новый заказ {order_data['Nid']}
👤 Имя: {order_data['userName']}
🔗 Написать: {order_data['link']}
📞 Телефон: {order_data['phone']}
🚚 Доставка: {order_data['deliveryMethod']}
📍 Адрес: {order_data.get('address', 'Не указан')}
💳 Оплата: {order_data['paymentMethod']}
💬 Комментарии: {order_data.get('comments', 'Нет')}

🛒 Товаров в корзине: {order_data['totalItems']}
💰 Сумма: {order_data['totalPrice']} RUB

{cart_items_text}"""

    user_msg = f"""Ваш заказ {order_data['Nid']} принят.
{cart_items_text}"""

    try:
        await bot.send_message(chat_id_admin, admin_msg, parse_mode="HTML")

        for i in order_data['cartItems']:
            item = db.query(models.Item).filter(models.Item.id == i["itemId"]).first()
            if item and item.img:
                try:
                    img_list = item.img if isinstance(item.img, list) else []
                    if img_list:
                        file_path = os.path.join("static", img_list[0]["file"])
                        
                        with Image.open(file_path) as img:
                            img.thumbnail((480, 640))
                            bio = io.BytesIO()
                            img.save(bio, format="JPEG", quality=80)
                            bio.seek(0)

                            caption = f"{i['name']} (x{i['quantity']}): {i['total']} RUB"
                            await bot.send_photo(
                                chat_id,
                                photo=bio,
                                caption=caption,
                                parse_mode="HTML"
                            )
                except Exception as e:
                    print(f"Ошибка при отправке фото пользователю: {e}")

    except Exception as e:
        print(f"Ошибка при отправке сообщения администратору: {e}")

    try:
        await bot.send_message(chat_id, f"Ваш заказ {order_data['Nid']} принят", parse_mode="HTML")

        for i in order_data['cartItems']:
            item = db.query(models.Item).filter(models.Item.id == i["itemId"]).first()
            if item and item.img:
                try:
                    img_list = item.img if isinstance(item.img, list) else []
                    if img_list:
                        file_path = os.path.join("static", img_list[0]["file"])
                        caption = f"{i['name']} (x{i['quantity']}): {i['total']} RUB"
                        await bot.send_photo(
                            chat_id,
                            photo=open(file_path, "rb"),
                            caption=caption,
                            parse_mode="HTML"
                        )
                except Exception as e:
                    print(f"Ошибка при отправке фото пользователю: {e}")

    except Exception as e:
        print(f"Ошибка при отправке сообщения пользователю: {e}")

    basket = db.query(models.Basket).filter(models.Basket.userId == user.id).first()
    if basket:
        db.query(models.BasketItem).filter(models.BasketItem.basketId == basket.id).delete()
        db.commit()

    return {"success": True, "message": "Заказ отправлен и корзина очищена"}

@router.post("/send-order-message")
async def send_order_message(data: SendMessageRequest, db: Session = Depends(get_db)):
    """Отправляет сообщение пользователю по Telegram chatId."""
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if not user.chatId:
        raise HTTPException(status_code=400, detail="У пользователя нет Telegram chatId")

    try:
        await bot.send_message(int(user.chatId), data.message, parse_mode="HTML")
        print(f"Сообщение пользователю {user.chatId}: {data.message}")
        return {"message": "Сообщение отправлено"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка отправки сообщения: {str(e)}")