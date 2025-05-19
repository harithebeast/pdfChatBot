# PDF Q&A Application

A full-stack application for uploading PDFs and asking questions about their content using AI.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
   - [Frontend (React + TypeScript)](#frontend-react--typescript)
   - [Backend (FastAPI)](#backend-fastapi)
3. [API Routes](#api-routes)
   - [Documents](#documents)
   - [Questions](#questions)
4. [Setup Instructions](#setup-instructions)
   - [Frontend](#frontend)
   - [Backend](#backend)
5. [Development](#development)
   - [Frontend Development](#frontend-development)
   - [Backend Development](#backend-development)
6. [Future Improvements](#future-improvements)

---

## Overview

This application allows users to:
- Upload PDF documents
- Extract text from these documents
- Ask questions about the document content
- Get AI-powered answers based on the document text

---

## Architecture

### Frontend (React + TypeScript)
- Located in the `src` directory
- Modern React with functional components and hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture for UI elements

### Backend (FastAPI)
- Located in the `backend` directory
- Python-based API with FastAPI
- PDF text extraction with PyMuPDF
- SQLite database (can be replaced with PostgreSQL)
- Background processing for PDF extraction
- Question-answering capabilities (stub implementation)
- Main FastAPI app in `backend/main.py`
- Database models defined in the same file for simplicity

---

## API Routes

### Documents
- `POST /documents/upload` - Upload a new PDF document
- `GET /documents` - Get a list of all uploaded documents

### Questions
- `POST /question` - Ask a question about a specific document

---

## Setup Instructions

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend

```bash
# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux

# Install dependencies
cd backend
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload
```

---

## Development

### Frontend Development
- The frontend is located in the `src` directory
- Components are in `src/components`
- API service functions are in `src/services/api.ts`

### Backend Development
- The backend is in the `backend` directory
- Main FastAPI app is in `main.py`
- Database models are defined in the same file for simplicity

---

## Future Improvements

- Implement proper document indexing with LangChain or LlamaIndex
- Add authentication and user management
- Implement cloud storage (AWS S3) for PDFs
- Add support for more document types
- Enhance the question answering with context retrieval
- Implement conversation history persistence