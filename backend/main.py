from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import subprocess
import platform
from pathlib import Path
import json
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1420", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import agents
from agents.file_agent import FileAgent
from agents.research_agent import ResearchAgent
from agents.writer_agent import WriterAgent
from memory.conversation_memory import ConversationMemory
from database.db import Database

# Initialize
db = Database()
memory = ConversationMemory()
file_agent = FileAgent()
research_agent = ResearchAgent()
writer_agent = WriterAgent()

# Request models
class ChatRequest(BaseModel):
    message: str

class AgentCreateRequest(BaseModel):
    name: str
    description: str
    agent_type: str
    schedule: Optional[str] = "daily"

@app.get("/")
def read_root():
    return {"status": "OpenClaw Backend Running", "version": "1.0"}

@app.post("/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint"""
    message = request.message.lower()
    memory.add_message("user", request.message)
    
    try:
        if "file" in message or "organize" in message or "folder" in message:
            response = await file_agent.execute(request.message)
        elif "research" in message or "search" in message or "find" in message:
            response = await research_agent.execute(request.message)
        elif "write" in message or "create" in message or "draft" in message:
            response = await writer_agent.execute(request.message)
        else:
            response = {
                "success": True,
                "message": "I can help you with:\n• File organization\n• Research & web search\n• Writing & content creation\n\nWhat would you like to do?"
            }
        
        memory.add_message("assistant", response.get("message", ""))
        return response
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }

@app.get("/agents")
def list_agents():
    """List all available agents"""
    return {
        "agents": [
            {
                "id": "file_agent",
                "name": "File Organizer",
                "description": "Organizes files, renames, moves, deletes",
                "status": "active"
            },
            {
                "id": "research_agent",
                "name": "Research Assistant",
                "description": "Searches web, summarizes content",
                "status": "active"
            },
            {
                "id": "writer_agent",
                "name": "Writing Assistant",
                "description": "Creates content, drafts documents",
                "status": "active"
            }
        ]
    }

# ===== ONBOARDING ENDPOINTS =====

@app.get("/check-openclaw")
def check_openclaw():
    """Check if OpenClaw is installed"""
    try:
        result = subprocess.run(
            ["openclaw", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        installed = result.returncode == 0
        
        return {
            "installed": installed,
            "version": result.stdout.strip() if installed else None
        }
    except FileNotFoundError:
        return {"installed": False, "version": None}
    except Exception as e:
        return {"installed": False, "error": str(e)}

@app.get("/check-dependencies")
def check_dependencies():
    """Check system dependencies"""
    os_name = platform.system()
    
    # Check Node.js
    node_installed = False
    node_version = None
    try:
        result = subprocess.run(
            ["node", "--version"], 
            capture_output=True, 
            text=True, 
            shell=True,
            timeout=10
        )
        if result.returncode == 0:
            node_installed = True
            node_version = result.stdout.strip()
    except Exception as e:
        print(f"Node.js check error: {e}")
    
    # Check npm
    npm_installed = False
    npm_version = None
    try:
        result = subprocess.run(
            ["npm", "--version"], 
            capture_output=True, 
            text=True, 
            shell=True,
            timeout=10
        )
        if result.returncode == 0:
            npm_installed = True
            npm_version = result.stdout.strip()
    except Exception as e:
        print(f"npm check error: {e}")
    
    return {
        "success": True,
        "os": os_name,
        "dependencies": {
            "node": {
                "installed": node_installed,
                "version": node_version
            },
            "npm": {
                "installed": npm_installed,
                "version": npm_version
            }
        }
    }

@app.post("/install-openclaw")
async def install_openclaw():
    """Install OpenClaw via npm (simulated for demo)"""
    try:
        import time
        time.sleep(2)
        
        return {
            "success": True,
            "message": "OpenClaw installed successfully! (Simulated)",
            "output": "openclaw@1.0.0 installed"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }

@app.post("/setup-openclaw")
async def setup_openclaw(config: dict):
    """Setup OpenClaw with initial configuration"""
    try:
        home = Path.home()
        openclaw_dir = home / ".openclaw"
        openclaw_dir.mkdir(exist_ok=True)
        
        config_file = openclaw_dir / "config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        return {
            "success": True,
            "message": "OpenClaw configured successfully!",
            "config_path": str(config_file)
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Setup error: {str(e)}"
        }

# ===== LINKEDIN AGENT ENDPOINTS =====

@app.post("/create-agent")
async def create_agent_endpoint(request: AgentCreateRequest):
    """Create a new automation agent"""
    try:
        agent_id = db.add_task(
            agent_id=request.agent_type,
            task=request.name
        )
        
        return {
            "success": True,
            "message": f"Agent '{request.name}' created successfully!",
            "agent": {
                "id": agent_id,
                "name": request.name,
                "description": request.description,
                "type": request.agent_type,
                "schedule": request.schedule,
                "status": "active"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }

@app.get("/list-agents")
def list_all_agents():
    """List all created agents"""
    try:
        tasks = db.get_tasks()
        agents = []
        
        for idx, task in enumerate(tasks):
            agents.append({
                "id": task.get("id", idx),
                "name": task.get("task", "Unknown Agent"),
                "description": f"Automation agent for {task.get('task', 'tasks')}",
                "type": task.get("agent_id", "generic"),
                "status": task.get("status", "active"),
                "created_at": task.get("created_at", "")
            })
        
        if len(agents) == 0:
            agents = [
                {
                    "id": 1,
                    "name": "File Organizer",
                    "description": "Organizes files and folders automatically",
                    "type": "file_agent",
                    "status": "active"
                },
                {
                    "id": 2,
                    "name": "Research Assistant",
                    "description": "Searches and summarizes information",
                    "type": "research_agent",
                    "status": "active"
                },
                {
                    "id": 3,
                    "name": "Writing Assistant",
                    "description": "Creates content and documents",
                    "type": "writer_agent",
                    "status": "active"
                }
            ]
        
        return {
            "success": True,
            "agents": agents
        }
    except Exception as e:
        return {
            "success": False,
            "agents": [],
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)