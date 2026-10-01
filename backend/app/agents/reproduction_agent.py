import logging
from typing import List, Dict, Any, Optional
from app.schemas.triage import (
    ReproductionAgentOutput,
    ReproductionEvidenceItem,
    TriageSummary
)
from app.services.selenium_runner import selenium_runner
from app.services.llm import llm_service

logger = logging.getLogger(__name__)

REPRODUCTION_SYSTEM_PROMPT = """You are the AI Reproduction Agent.
Analyze the steps to reproduce and generate a robust, headless Selenium Python script to recreate the bug.
Assess whether the scenario is automatable in headless browser environments, and provide execution reasoning."""

class ReproductionAgent:
    async def run(
        self,
        summary: TriageSummary,
        bug_id: str,
        component_name: Optional[str] = "General"
    ) -> ReproductionAgentOutput:
        """Executes the Reproduction Agent contract."""
        
        # 1. Run Selenium runner service (supports live headless execution and demo simulation)
        runner_res = selenium_runner.run_reproduction_test(
            bug_id=bug_id,
            title=summary.title,
            steps=summary.steps_to_reproduce
        )

        evidence_items = [
            ReproductionEvidenceItem(
                type=item["type"],
                path=item["path"],
                description=item["description"]
            )
            for item in runner_res["evidence"]
        ]

        # 2. Try LLM for dynamic script enhancement if keys are available
        prompt = f"""Bug: {summary.title}
Steps: {summary.steps_to_reproduce}
Environment: {summary.environment}
Component: {component_name}
Actual Result: {summary.actual_result}
Generated Base Script:
{runner_res['script']}
"""
        try:
            llm_out = await llm_service.generate_structured(
                prompt=prompt,
                response_model=ReproductionAgentOutput,
                system_prompt=REPRODUCTION_SYSTEM_PROMPT
            )
            # Ensure evidence items from runner are preserved
            if not llm_out.evidence:
                llm_out.evidence = evidence_items
            return llm_out
        except Exception:
            pass

        # 3. Deterministic reproduction reasoning
        script = runner_res["script"]
        execution_log = runner_res["log"]
        status = runner_res["status"]

        reasoning = (
            f"Synthesized Selenium WebDriver script targeting {len(summary.steps_to_reproduce)} discrete steps. "
            f"Automated execution completed against headless runtime harness. "
            f"Reproduction verdict: '{status}'. Captured {len(evidence_items)} primary evidence artifacts "
            f"(DOM screenshot, DevTools console log, HAR network trace, and standalone Python script)."
        )

        return ReproductionAgentOutput(
            reproduction_status=status,
            generated_selenium_script=script,
            evidence=evidence_items,
            execution_log=execution_log,
            reasoning=reasoning
        )

reproduction_agent = ReproductionAgent()
