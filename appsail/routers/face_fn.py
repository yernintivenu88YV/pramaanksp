import os
import uuid
import shutil
import logging
from typing import List, Optional
from fastapi import APIRouter, Request, File, UploadFile, Form, HTTPException, status
from pydantic import BaseModel

from utils.llm_client import generate_response

logger = logging.getLogger("appsail.face_fn")
router = APIRouter(prefix="/server/face_fn")

STORAGE_DIR = os.path.join(os.environ.get("TEMP", "/tmp"), "faces")
os.makedirs(STORAGE_DIR, exist_ok=True)

MODEL_NAME = "Facenet"

def get_embedding(img_path: str):
    try:
        from deepface import DeepFace
        objs = DeepFace.represent(img_path=img_path, model_name=MODEL_NAME, enforce_detection=True)
        if not objs or len(objs) == 0:
            return None
        return objs[0]["embedding"]
    except Exception as e:
        logger.error(f"Error extracting embedding: {e}")
        return None

@router.post("/dataset")
async def add_dataset_record(
    request: Request,
    person_id: str = Form(...),
    full_name: str = Form(...),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    case_number: Optional[str] = Form(None),
    station: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    # Security/RBAC validation
    repo = request.state.repo
    role_str = repo.get_user_role(dict(request.headers))
    if role_str not in ["SI", "ACP", "Analyst"]:
         raise HTTPException(status_code=403, detail="Unauthorized to modify dataset")
    
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(STORAGE_DIR, filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save error: {e}")

    embedding = get_embedding(filepath)
    if not embedding:
        os.remove(filepath)
        raise HTTPException(status_code=400, detail="No face detected or could not extract embedding")

    record = {
        "person_id": person_id,
        "full_name": full_name,
        "age": age,
        "gender": gender,
        "case_number": case_number,
        "station": station,
        "status": status,
        "notes": notes,
        "image_path": f"/server/face_fn/image/{filename}",
        "embedding": embedding
    }

    success = repo.insert_face_record(record)
    
    # Audit log
    session_id = request.headers.get("X-ZC-Session-ID", "unknown")
    repo.insert_audit_log(session_id, role_str, "biometric_dataset_update", "allow")

    if not success:
        raise HTTPException(status_code=500, detail="Database error")

    return {"status": "success", "person_id": person_id}

@router.get("/dataset")
async def get_dataset(request: Request):
    repo = request.state.repo
    role_str = repo.get_user_role(dict(request.headers))
    if role_str not in ["SI", "ACP", "Analyst"]:
         raise HTTPException(status_code=403, detail="Unauthorized")
    
    records = repo.get_face_dataset()
    return {"status": "success", "data": records}

@router.delete("/dataset/{person_id}")
async def delete_dataset_record(person_id: str, request: Request):
    repo = request.state.repo
    role_str = repo.get_user_role(dict(request.headers))
    if role_str not in ["SI", "ACP", "Analyst"]:
         raise HTTPException(status_code=403, detail="Unauthorized")
    
    success = repo.delete_face_record(person_id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
        
    session_id = request.headers.get("X-ZC-Session-ID", "unknown")
    repo.insert_audit_log(session_id, role_str, "biometric_dataset_delete", "allow")
    return {"status": "success"}

@router.post("/search")
async def search_face(request: Request, file: UploadFile = File(...)):
    repo = request.state.repo
    role_str = repo.get_user_role(dict(request.headers))
    if role_str not in ["SI", "ACP", "Analyst"]:
         raise HTTPException(status_code=403, detail="Unauthorized")

    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    temp_filename = f"temp_{uuid.uuid4()}.jpg"
    temp_filepath = os.path.join(STORAGE_DIR, temp_filename)
    
    try:
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save error: {e}")

    embedding = get_embedding(temp_filepath)
    os.remove(temp_filepath) # Cleanup temp file

    if not embedding:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    # threshold=0.4 for cosine distance is typical for Facenet. 
    matches = repo.search_faces(embedding, top_k=3, threshold=0.4)

    session_id = request.headers.get("X-ZC-Session-ID", "unknown")
    repo.insert_audit_log(session_id, role_str, "biometric_search", "allow")
    
    return {"status": "success", "matches": matches}

class ExplainCandidateRequest(BaseModel):
    person_id: str
    metadata: dict

@router.post("/explain_candidate")
async def explain_candidate(req: ExplainCandidateRequest, request: Request):
    repo = request.state.repo
    role_str = repo.get_user_role(dict(request.headers))
    if role_str not in ["SI", "ACP", "Analyst"]:
         raise HTTPException(status_code=403, detail="Unauthorized")
    
    system_prompt = (
        "You are an AI intelligence assistant analyzing a biometric facial match for a police officer.\n"
        "Given the candidate's metadata, summarize their criminal profile and any warnings in a concise paragraph.\n"
        "Be professional, highlight if they have a 'prior record' or active 'status', and explain what the officer should do next based on their profile."
    )
    user_prompt = f"Match Data: {req.metadata}"
    
    try:
        explanation = generate_response(system_prompt, user_prompt)
        
        session_id = request.headers.get("X-ZC-Session-ID", "unknown")
        repo.insert_audit_log(session_id, role_str, "biometric_explanation", "allow")
        
        return {"status": "success", "explanation": explanation}
    except Exception as e:
        logger.error(f"Explanation failed: {e}")
        if hasattr(e, "status_code"):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


from fastapi.responses import FileResponse
@router.get("/image/{filename}")
async def get_image(filename: str, request: Request):
    repo = request.state.repo
    role_str = repo.get_user_role(dict(request.headers))
    if role_str not in ["SI", "ACP", "Analyst"]:
         raise HTTPException(status_code=403, detail="Unauthorized")
    
    filepath = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)
