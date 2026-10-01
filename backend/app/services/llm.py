import os
import json
import logging
from typing import Type, TypeVar, Optional, Any
from pydantic import BaseModel
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

class LLMService:
    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: str = "You are an expert AI software bug triage assistant. Respond with strictly valid JSON matching the requested schema."
    ) -> T:
        """Generates structured output adhering to a Pydantic schema using Groq, OpenAI, Gemini, or smart fallback."""
        
        # 1. Try Groq API (llama-3.3-70b-versatile)
        if self.groq_key:
            try:
                schema_json = json.dumps(response_model.model_json_schema())
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.groq_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "llama-3.3-70b-versatile",
                            "messages": [
                                {"role": "system", "content": f"{system_prompt}\nTarget JSON Schema:\n{schema_json}"},
                                {"role": "user", "content": prompt}
                            ],
                            "response_format": {"type": "json_object"},
                            "temperature": 0.1
                        }
                    )
                    if resp.status_code == 200:
                        content = resp.json()["choices"][0]["message"]["content"]
                        data = json.loads(content)
                        return response_model.model_validate(data)
                    else:
                        logger.warning("Groq API returned %s: %s", resp.status_code, resp.text)
            except Exception as e:
                logger.warning("Groq structured completion failed: %s", str(e))

        # 2. Try OpenAI API (gpt-4o)
        if self.openai_key:
            try:
                schema_json = json.dumps(response_model.model_json_schema())
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.openai_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "gpt-4o",
                            "messages": [
                                {"role": "system", "content": f"{system_prompt}\nTarget JSON Schema:\n{schema_json}"},
                                {"role": "user", "content": prompt}
                            ],
                            "response_format": {"type": "json_object"},
                            "temperature": 0.1
                        }
                    )
                    if resp.status_code == 200:
                        content = resp.json()["choices"][0]["message"]["content"]
                        data = json.loads(content)
                        return response_model.model_validate(data)
                    else:
                        logger.warning("OpenAI API returned %s: %s", resp.status_code, resp.text)
            except Exception as e:
                logger.warning("OpenAI structured completion failed: %s", str(e))

        # 3. Try Gemini API if configured
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel(
                    "gemini-1.5-flash",
                    generation_config={"response_mime_type": "application/json"}
                )
                schema_json = json.dumps(response_model.model_json_schema())
                full_prompt = f"{system_prompt}\nTarget JSON Schema:\n{schema_json}\n\nTask:\n{prompt}"
                response = model.generate_content(full_prompt)
                data = json.loads(response.text)
                return response_model.model_validate(data)
            except Exception as e:
                logger.warning("Gemini generation failed: %s", str(e))

        # Fallback to local contextual parser
        raise RuntimeError("No external LLM available or keys provided. Use agent contextual fallback.")

llm_service = LLMService()
