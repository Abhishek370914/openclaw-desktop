from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    def __init__(self):
        self.name = "Base Agent"
        self.description = "Base agent class"
        self.status = "active"
    
    @abstractmethod
    async def execute(self, task: str) -> Dict[str, Any]:
        pass
    
    def log(self, message: str):
        print(f"[{self.name}] {message}")