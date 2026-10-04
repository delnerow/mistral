from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.agents import CaseOrchestrator
from backend.case_data import CASE_DATA

app = FastAPI(title="CaseFlow Demo API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = CaseOrchestrator()


class CaseSummary(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    demo_label: str = Field(..., description="Demo label to indicate fictional data")
    demo_fictitious: bool = True


class AnalysisRequest(BaseModel):
    actor: str | None = None
    user_role: str | None = None


class DraftActionResponse(BaseModel):
    case_id: str
    draft: str
    demo_fictitious: bool = True


@app.get("/api/cases")
async def get_cases() -> list[CaseSummary]:
    return [
        CaseSummary(
            id=CASE_DATA["id"],
            title=CASE_DATA["title"],
            status=CASE_DATA["status"],
            priority=CASE_DATA["priority"],
            demo_label=CASE_DATA["demo_label"],
            demo_fictitious=CASE_DATA["demo_fictitious"],
        )
    ]


@app.get("/api/cases/{case_id}")
async def get_case(case_id: str) -> dict[str, Any]:
    if case_id != CASE_DATA["id"]:
        return {"error": "Case not found", "demo_fictitious": True}
    return {**CASE_DATA, "api": "/api/cases/{case_id}"}


@app.get("/api/cases/{case_id}/timeline")
async def get_timeline(case_id: str) -> dict[str, Any]:
    return {"case_id": case_id, "timeline": CASE_DATA["timeline"], "demo_fictitious": True}


@app.get("/api/cases/{case_id}/documents")
async def get_documents(case_id: str) -> dict[str, Any]:
    return {"case_id": case_id, "documents": CASE_DATA["documents"], "demo_fictitious": True}


@app.get("/api/cases/{case_id}/actors")
async def get_actors(case_id: str) -> dict[str, Any]:
    return {"case_id": case_id, "actors": CASE_DATA["actors"], "demo_fictitious": True}


@app.get("/api/cases/{case_id}/deadlines")
async def get_deadlines(case_id: str) -> dict[str, Any]:
    return {"case_id": case_id, "deadlines": CASE_DATA["deadlines"], "demo_fictitious": True}


@app.get("/api/cases/{case_id}/alerts")
async def get_alerts(case_id: str) -> dict[str, Any]:
    return {"case_id": case_id, "alerts": CASE_DATA["alerts"], "demo_fictitious": True}


@app.get("/api/cases/{case_id}/intelligence")
async def get_intelligence(case_id: str) -> dict[str, Any]:
    return {"case_id": case_id, "intelligence": CASE_DATA["intelligence"], "demo_fictitious": True}


@app.get("/api/cases/{case_id}/agents")
async def get_agents(case_id: str) -> dict[str, Any]:
    return {"case_id": case_id, "agents": CASE_DATA["agents"], "demo_fictitious": True}


@app.post("/api/cases/{case_id}/agents/analyze")
async def analyze_agents(case_id: str, payload: AnalysisRequest) -> dict[str, Any]:
    analysis = await orchestrator.analyze_case(CASE_DATA)
    return {
        "case_id": case_id,
        "actor": payload.actor or "system",
        "role": payload.user_role or "Magistrat",
        "analysis": analysis,
        "demo_fictitious": True,
    }


@app.post("/api/cases/{case_id}/actions/draft")
async def draft_action(case_id: str, payload: AnalysisRequest) -> DraftActionResponse:
    draft = (
        "Objet : Relance du rapport toxicologique\n\n"
        "Bonjour,\n\n"
        "Le dossier CR-2026-004281 nécessite la transmission du rapport toxicologique avant la prochaine échéance. "
        "Merci de confirmer le statut de l'expertise et de transmettre les éléments manquants, y compris la photographie 17 référencée dans le PV d'audition.\n\n"
        "Cordialement,\n"
        f"{payload.user_role or 'Magistrat'} — démonstration CaseFlow"
    )
    return DraftActionResponse(case_id=case_id, draft=draft, demo_fictitious=True)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "CaseFlow demo backend is running.", "demo_fictitious": "true"}
