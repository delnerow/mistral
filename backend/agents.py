from __future__ import annotations

from typing import Any


class BaseCaseAgent:
    name: str = "base_case_agent"

    async def analyze(self, case_context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError


class DocumentAgent(BaseCaseAgent):
    name = "document_agent"

    async def analyze(self, case_context: dict[str, Any]) -> dict[str, Any]:
        return {
            "agent": self.name,
            "observations": 18,
            "recommendations": 3,
            "status": "active",
            "summary": "Références documentaires détectées. 1 pièce manquante confirmée.",
            "demo_fictitious": True,
        }


class DeadlineAgent(BaseCaseAgent):
    name = "deadline_agent"

    async def analyze(self, case_context: dict[str, Any]) -> dict[str, Any]:
        return {
            "agent": self.name,
            "observations": 27,
            "recommendations": 5,
            "status": "active",
            "summary": "2 échéances critiques identifiées, dont 1 dans 72 heures.",
            "demo_fictitious": True,
        }


class EvidenceAgent(BaseCaseAgent):
    name = "evidence_agent"

    async def analyze(self, case_context: dict[str, Any]) -> dict[str, Any]:
        return {
            "agent": self.name,
            "observations": 12,
            "recommendations": 2,
            "status": "active",
            "summary": "Croisement des pièces et références en cours. Point de friction sur la photographie 17.",
            "demo_fictitious": True,
        }


class WorkflowAgent(BaseCaseAgent):
    name = "workflow_agent"

    async def analyze(self, case_context: dict[str, Any]) -> dict[str, Any]:
        return {
            "agent": self.name,
            "observations": 21,
            "recommendations": 4,
            "status": "active",
            "summary": "Blocage principal identifié dans la dépendance expertise médico-légale.",
            "demo_fictitious": True,
        }


class CaseOrchestrator:
    agents = [
        DocumentAgent(),
        DeadlineAgent(),
        EvidenceAgent(),
        WorkflowAgent(),
    ]

    async def analyze_case(self, case_context: dict[str, Any]) -> dict[str, Any]:
        results = []
        for agent in self.agents:
            results.append(await agent.analyze(case_context))

        return {
            "case_id": case_context.get("id"),
            "status": "analysis_complete",
            "summary": "Analyse orchestrée du dossier en mode démonstration. Aucune décision judiciaire n'est prise.",
            "agents": results,
            "demo_fictitious": True,
        }
