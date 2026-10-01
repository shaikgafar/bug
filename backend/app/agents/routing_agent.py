import logging
from typing import List, Dict, Any, Optional
from app.schemas.triage import (
    RoutingAgentOutput,
    TriageAgentOutput,
    IntelligenceAgentOutput,
    ReproductionAgentOutput
)
from app.services.llm import llm_service

logger = logging.getLogger(__name__)

ROUTING_SYSTEM_PROMPT = """You are the AI Routing & Analysis Agent.
Synthesize all prior agent outputs (Triage normalization, Intelligence duplicates & severity, Reproduction execution evidence).
1. Analyze if this bug is a regression (e.g. mentions 'worked in previous version', 'after deployment', 'v2.4.1', recent code changes).
2. Assign the responsible team and select an owning developer from available team members.
3. Formulate concrete recommended remediation actions for engineering.
4. Produce a polished, executive Markdown summary of the entire triage lifecycle.
5. Provide detailed routing reasoning."""

class RoutingAgent:
    async def run(
        self,
        triage_data: TriageAgentOutput,
        intelligence_data: IntelligenceAgentOutput,
        reproduction_data: ReproductionAgentOutput,
        available_users: List[Dict[str, Any]],
        available_components: List[Dict[str, Any]]
    ) -> RoutingAgentOutput:
        """Executes the Routing & Analysis Agent contract."""
        
        # 1. Try LLM if configured
        prompt = f"""Triage Summary:
- Title: {triage_data.summary.title}
- Description: {triage_data.summary.clean_description}
- Steps: {triage_data.summary.steps_to_reproduce}
- Expected: {triage_data.summary.expected_result}
- Actual: {triage_data.summary.actual_result}

Intelligence Output:
- Severity: {intelligence_data.severity}
- Priority: {intelligence_data.priority}
- Suggested Components: {[c.name for c in intelligence_data.suggested_components]}
- Potential Duplicates: {len(intelligence_data.potential_duplicates)}

Reproduction Output:
- Status: {reproduction_data.reproduction_status}
- Evidence Count: {len(reproduction_data.evidence)}

Available Developers:
{[{'id': str(u.get('id')), 'name': u.get('name'), 'email': u.get('email')} for u in available_users]}
"""
        try:
            return await llm_service.generate_structured(
                prompt=prompt,
                response_model=RoutingAgentOutput,
                system_prompt=ROUTING_SYSTEM_PROMPT
            )
        except Exception as e:
            logger.info("Using intelligent rule-based routing analyzer: %s", str(e))

        # 2. Contextual Routing Engine
        combined_text = (
            f"{triage_data.summary.title} "
            f"{triage_data.summary.clean_description} "
            f"{triage_data.summary.actual_result}"
        ).lower()

        is_regression = any(w in combined_text for w in [
            "regression", "broke after", "stopped working", "worked before",
            "worked in", "v2.4", "deploy", "release", "update"
        ])
        
        regression_reason = (
            "Report identifies sudden failure in previously stable functionality following recent deploy/release."
            if is_regression else
            "Standard defect or unhandled edge case without explicit prior release baseline failure."
        )

        # Team determination from suggested component
        assigned_team = "Platform & Core Engineering"
        comp_id = None
        if intelligence_data.suggested_components:
            top_comp_name = intelligence_data.suggested_components[0].name
            for c in available_components:
                if c.get("name", "").lower() == top_comp_name.lower():
                    assigned_team = c.get("owner_team", assigned_team)
                    comp_id = c.get("id")
                    break

        # Developer assignment
        assigned_dev_id = None
        assigned_dev_name = "Lead System Triager"
        
        # Match developer associated with team or pick first available dev
        devs = [u for u in available_users if u.get("role") in ("developer", "admin")]
        if devs:
            # Look for dev associated with component or pick top dev
            chosen_dev = devs[0]
            for comp in available_components:
                if comp_id and comp.get("id") == comp_id and comp.get("owner_developer_id"):
                    match_dev = next((d for d in devs if str(d.get("id")) == str(comp.get("owner_developer_id"))), None)
                    if match_dev:
                        chosen_dev = match_dev
                        break
            assigned_dev_id = str(chosen_dev.get("id"))
            assigned_dev_name = str(chosen_dev.get("name"))

        # Recommended actions
        rec_actions = [
            f"Assign bug ticket to {assigned_team} on active sprint board.",
            f"Review automated Selenium reproduction script to write a regression unit test.",
            f"Verify root cause in relevant API controllers and patch exception handling."
        ]
        if is_regression:
            rec_actions.insert(0, "Initiate immediate rollback evaluation or deploy hotfix patch.")
        if intelligence_data.potential_duplicates:
            rec_actions.append(f"Cross-reference duplicate issue #{intelligence_data.potential_duplicates[0].bug_id[:8]} to consolidate developer efforts.")

        # Polished final markdown summary
        md_summary = f"""### AI Bug Triage Executive Report
**Title:** {triage_data.summary.title}  
**Classification:** Severity `{intelligence_data.severity.upper()}` | Priority `{intelligence_data.priority}`  
**Assigned Team:** **{assigned_team}** ({assigned_dev_name})  
**Regression Status:** `{'YES - Active Regression' if is_regression else 'NO - New Defect'}`  

---

#### 1. Problem Isolation & Steps
{triage_data.summary.clean_description}

**Steps to Reproduce:**
{chr(10).join([f"{i+1}. {s}" for i, s in enumerate(triage_data.summary.steps_to_reproduce)])}

**Expected:** {triage_data.summary.expected_result}  
**Actual:** {triage_data.summary.actual_result}  

---

#### 2. Intelligence & Duplicate Analysis
- **Detected Component:** {intelligence_data.suggested_components[0].name if intelligence_data.suggested_components else 'General'}
- **Potential Duplicates:** {f"{len(intelligence_data.potential_duplicates)} found (Top match score: {intelligence_data.potential_duplicates[0].similarity_score:.1%})" if intelligence_data.potential_duplicates else "None detected with confidence > 50%"}

---

#### 3. Automated Reproduction
- **Status:** `{reproduction_data.reproduction_status.upper()}`
- **Evidence Gathered:** {len(reproduction_data.evidence)} artifact(s) attached (Browser Screenshot, DevTools logs, Executable Python Selenium harness).

---

#### 4. Recommended Next Steps
{chr(10).join([f"- [ ] {action}" for action in rec_actions])}
"""

        reasoning = (
            f"Regression evaluation: {is_regression} ('{regression_reason}'). "
            f"Routed to '{assigned_team}' based on domain component analysis. "
            f"Designated developer '{assigned_dev_name}' (ID: {assigned_dev_id}). "
            f"Synthesized comprehensive triage summary with {len(rec_actions)} action items."
        )

        return RoutingAgentOutput(
            is_regression=is_regression,
            regression_reason=regression_reason,
            assigned_developer_id=assigned_dev_id,
            assigned_developer_name=assigned_dev_name,
            assigned_team=assigned_team,
            final_triage_summary=md_summary,
            recommended_actions=rec_actions,
            reasoning=reasoning
        )

routing_agent = RoutingAgent()
