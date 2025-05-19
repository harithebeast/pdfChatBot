from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sentence_transformers import SentenceTransformer
import uuid
import os
import shutil
import fitz  # PyMuPDF
import faiss
import numpy as np
import json
import httpx

# --- Directories ---
UPLOAD_DIR = "./uploads"
INDEX_DIR = "./index_store"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(INDEX_DIR, exist_ok=True)

# --- Database setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./pdf_qa.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class DocumentDB(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String)
    file_size = Column(Integer)
    extracted_text = Column(Text)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- FastAPI app ---
app = FastAPI(title="PDF Q&A API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class DocumentResponse(BaseModel):
    id: str
    filename: str
    uploadDate: str
    size: int
    ready: bool

class QuestionRequest(BaseModel):
    question: str
    document_id: str

class AnswerResponse(BaseModel):
    answer: str

# --- Sentence Embedding Model ---
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# --- Ollama config ---
OLLAMA_URL = "http://localhost:14324"  # Ollama API URL
OLLAMA_MODEL = "llama3.1"  # Replace with your actual Ollama model name
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from typing import List

# Prompt template for answering questions with context
answer_template = (
    "You are a helpful assistant. Use the following pdf context to answer the question.\n\n"
    "Context: {context}\n\n"
    "Question: {question}\n"
    "Answer only the answer without extra commentary.also with new line character."
)

# Initialize the Ollama LLM model (adjust model name if needed)
ollama_model = OllamaLLM(model="llama3.1")

def generate_answer_with_ollama(question: str, context_chunks: List[str]) -> str:
    prompt = ChatPromptTemplate.from_template(answer_template)
    chain = prompt | ollama_model

    combined_context = " ".join(context_chunks)
    inputs = {"context": combined_context, "question": question}
    answer = chain.invoke(inputs)
    return answer

# --- Helper Functions ---
def extract_text_from_pdf(file_path: str) -> str:
    try:
        doc = fitz.open(file_path)
        return "".join(page.get_text() for page in doc)
    except Exception as e:
        print(f"Text extraction failed: {e}")
        return ""

def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

def build_faiss_index(doc_id: str, text_chunks: List[str]):
    embeddings = embedding_model.encode(text_chunks, convert_to_numpy=True)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    doc_dir = os.path.join(INDEX_DIR, doc_id)
    os.makedirs(doc_dir, exist_ok=True)

    faiss.write_index(index, os.path.join(doc_dir, "faiss.index"))

    with open(os.path.join(doc_dir, "chunks.json"), "w", encoding="utf-8") as f:
        json.dump(text_chunks, f)

def load_faiss_index(doc_id: str):
    index_path = os.path.join(INDEX_DIR, doc_id, "faiss.index")
    chunks_path = os.path.join(INDEX_DIR, doc_id, "chunks.json")

    if not os.path.exists(index_path) or not os.path.exists(chunks_path):
        return None, None

    index = faiss.read_index(index_path)
    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    return index, chunks

def query_index(doc_id: str, question: str, top_k: int = 3) -> List[str]:
    index, chunks = load_faiss_index(doc_id)
    if index is None:
        raise Exception("Index not found")

    question_embedding = embedding_model.encode([question], convert_to_numpy=True)
    distances, indices = index.search(question_embedding, top_k)
    return [chunks[i] for i in indices[0]]

def process_pdf(file_path: str, doc_id: str, db: Session):
    try:
        extracted_text = extract_text_from_pdf(file_path)
        chunks = chunk_text(extracted_text)
        build_faiss_index(doc_id, chunks)

        document = db.query(DocumentDB).filter(DocumentDB.id == doc_id).first()
        if document:
            document.extracted_text = extracted_text
            db.commit()
    except Exception as e:
        print(f"Error processing PDF ({doc_id}): {e}")

# --- Routes ---
@app.get("/")
def root():
    return {"status": "API running", "message": "Welcome to the PDF Q&A system!"}

@app.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    doc_id = str(uuid.uuid4())
    saved_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    file_size = os.path.getsize(saved_path)
    document = DocumentDB(
        id=doc_id,
        filename=file.filename,
        file_path=saved_path,
        file_size=file_size,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Process PDF synchronously; consider background tasks in production
    process_pdf(saved_path, doc_id, db)

    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        uploadDate=document.upload_date.isoformat(),
        size=document.file_size,
        ready=True
    )

@app.get("/documents", response_model=List[DocumentResponse])
async def list_documents(db: Session = Depends(get_db)):
    documents = db.query(DocumentDB).all()
    return [
        DocumentResponse(
            id=doc.id,
            filename=doc.filename,
            uploadDate=doc.upload_date.isoformat(),
            size=doc.file_size,
            ready=bool(doc.extracted_text)
        ) for doc in documents
    ]

@app.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, db: Session = Depends(get_db)):
    document = db.query(DocumentDB).filter(DocumentDB.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)

        index_folder = os.path.join(INDEX_DIR, document_id)
        if os.path.exists(index_folder):
            shutil.rmtree(index_folder)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting resources: {e}")

    db.delete(document)
    db.commit()

@app.post("/question", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest, db: Session = Depends(get_db)):
    document = db.query(DocumentDB).filter(DocumentDB.id == request.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if not document.extracted_text:
        raise HTTPException(status_code=400, detail="Document still being processed")

    try:
        top_chunks = query_index(request.document_id, request.question, top_k=3)
        answer =  generate_answer_with_ollama(request.question, top_chunks)
        return AnswerResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
