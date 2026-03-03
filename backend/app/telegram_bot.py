from telegram import Update, Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes
from app.database import SessionLocal
from app import models
from dotenv import load_dotenv
import os

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

bot = Bot(token=TELEGRAM_TOKEN)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    user_id = update.effective_user.id

    db = SessionLocal()
    user = db.query(models.User).filter(models.User.user_id == str(user_id)).first()
    if not user:
        user = models.User(
            user_id=str(user_id),
            chatId=str(chat_id),
            username=update.effective_user.username,
            first_name=update.effective_user.first_name,
            last_name=update.effective_user.last_name
        )
        db.add(user)
    else:
        user.chatId = str(chat_id)
    db.commit()
    db.close()
    try:
        web_app_button = InlineKeyboardButton(
            text="Каталог товаров",
            web_app={"url": WEBAPP_URL}
        )
        keyboard = InlineKeyboardMarkup([[web_app_button]])
        caption_text = (
            ""
        )
    except Exception:
        keyboard = InlineKeyboardMarkup(
            [[InlineKeyboardButton(text="Каталог товаров", url=WEBAPP_URL)]]
        )
    await context.bot.send_photo(
        chat_id=chat_id,
        photo=open("example.jpg", "rb"),
        caption=caption_text,
        reply_markup=keyboard
    )

async def run_bot_async():
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    await app.initialize()
    await app.start()
    await app.updater.start_polling()