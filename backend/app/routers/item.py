from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import uuid
import os
from typing import List
from datetime import datetime
from PIL import Image
import json
from app import models, schemas
from app.database import get_db
from app.schemas import DecreaseQuantityRequest

router = APIRouter()

UPLOAD_DIR = "static"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_and_resize(file: UploadFile) -> dict:
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(UPLOAD_DIR, filename)

    temp_path = filepath + "_tmp"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    img = Image.open(temp_path)
    img = img.convert("RGB")
    img_resized = img.resize((1024, 1280), Image.LANCZOS)

    img_resized.save(filepath, format="JPEG", quality=85)

    os.remove(temp_path)

    return {"file": filename}

@router.post("/upload", response_model=schemas.Item)
async def upload_item(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    weight: str = Form(...),
    categoryId: int = Form(...),
    consist: str = Form(...),
    quantity: int = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    file_objects = []
    for file in files:
        obj = await save_and_resize(file)
        file_objects.append(obj)

    db_item = models.Item(
        name=name,
        description=description,
        consist=consist,
        weight=weight,
        price=price,
        quantity=quantity if quantity is not None else 0,
        categoryId=categoryId,
        img=file_objects,
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[schemas.Item])
def get_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()

@router.get("/{item_id}", response_model=schemas.Item)
def get_one_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.get("/category/{category_id}", response_model=List[schemas.Item])
def get_items_by_category(category_id: int, db: Session = Depends(get_db)):
    items = db.query(models.Item).filter(models.Item.categoryId == category_id).all()
    return items

@router.post("/decrease-quantity")
def decrease_quantity(data: DecreaseQuantityRequest, db: Session = Depends(get_db)):
    for item_data in data.items:
        item = db.query(models.Item).filter(models.Item.id == item_data.itemId).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with id {item_data.itemId} not found")
        if item.quantity < item_data.quantity:
            raise HTTPException(status_code=400, detail=f"Недостаточно товара на складе для itemId {item_data.itemId}")
        item.quantity -= item_data.quantity
        db.add(item)
    db.commit()
    return {"success": True, "message": "Остатки обновлены"}

@router.post("/update/{item_id}", response_model=schemas.Item)
async def update_item(
    item_id: int,
    name: str = Form(...),
    description: str = Form(...),
    consist: str = Form(...),
    weight: str = Form(...),
    price: str = Form(...),
    quantity: str = Form(...),
    categoryId: str = Form(...),
    files: List[UploadFile] = File([]),
    existingImages: str = Form("[]"),
    db: Session = Depends(get_db)
):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    try:
        price_int = int(price)
    except ValueError:
        raise HTTPException(status_code=422, detail="Price must be an integer")

    try:
        quantity_int = int(quantity)
    except ValueError:
        raise HTTPException(status_code=422, detail="Quantity must be an integer")

    try:
        categoryId_int = int(categoryId)
    except ValueError:
        raise HTTPException(status_code=422, detail="CategoryId must be an integer")

    try:
        existing_images_list = [{"file": fname} for fname in json.loads(existingImages)]
    except Exception:
        existing_images_list = []

    new_images = []
    for f in files:
        saved = await save_and_resize(f)
        new_images.append(saved)

    item.img = existing_images_list + new_images

    item.name = name
    item.description = description
    item.consist = consist
    item.weight = weight
    item.price = price_int
    item.quantity = quantity_int
    item.categoryId = categoryId_int
    item.updatedAt = datetime.utcnow()

    db.add(item)
    db.commit()
    db.refresh(item)
    return item