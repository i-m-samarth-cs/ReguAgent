import json
import time
import os
from typing import Any, Optional
from sqlmodel import Session
from app.models import PromptTrace
from app.config import settings


class BaseAgent:
    name: str = "base_agent"
    prompt_file: str = ""

    def __init__(self, session: Session):
        self.session = session
        self.mode = settings.AI_MODE

    def load_prompt(self) -> str:
        path = os.path.join(settings.PROMPTS_DIR, self.prompt_file)
        try:
            with open(path) as f:
                return f.read()
        except FileNotFoundError:
            return f"# {self.name} prompt\nProcess the following input and return structured JSON."

    def run_mock(self, input_data: dict) -> dict:
        raise NotImplementedError

    def run_real(self, prompt: str, input_data: dict) -> dict:
        raise NotImplementedError

    def run(self, input_data: dict) -> dict:
        start = time.time()
        prompt = self.load_prompt()

        if self.mode == "mock":
            output = self.run_mock(input_data)
            model_used = "mock"
            tokens_used = 0
        else:
            output = self.run_real(prompt, input_data)
            model_used = self.mode
            tokens_used = len(json.dumps(input_data)) // 4

        elapsed_ms = int((time.time() - start) * 1000)
        self._trace(prompt, input_data, output, model_used, tokens_used, elapsed_ms)
        return output

    def _trace(self, prompt: str, input_data: dict, output: dict, model: str, tokens: int, ms: int):
        trace = PromptTrace(
            agent_name=self.name,
            prompt_template=self.prompt_file,
            input_data=json.dumps(input_data),
            output_data=json.dumps(output),
            model_used=model,
            tokens_used=tokens,
            execution_time_ms=ms,
        )
        self.session.add(trace)
        self.session.commit()
