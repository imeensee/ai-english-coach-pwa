
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from collections import defaultdict

app = FastAPI(title="AI Coach Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EVENTS: List[Dict[str, Any]] = []

@app.post("/api/ingest")
async def ingest(req: Request):
    data = await req.json()
    EVENTS.append(data)
    return {"ok": True, "stored": len(EVENTS)}

@app.get("/api/summary")
async def summary():
    utter = [e for e in EVENTS if e.get('type')=='utterance']
    sessions = sum(1 for e in EVENTS if e.get('type')=='start_week')
    xp = sum(e.get('bonus',0) for e in utter)
    errors = defaultdict(int)
    for u in utter:
        sc=u.get('score') or {}
        if sc.get('grammar',3)<3: errors['grammar']+=1
        if sc.get('fluency',3)<3: errors['fluency']+=1
    return {"events": EVENTS, "metrics": {"sessions": sessions, "utterances": len(utter), "xp": xp}, "errors": errors}
