class Database:
    def __init__(self):
        self.tasks = []
        self.logs = []
        self.agents = []
    
    def add_task(self, agent_id: str, task: str):
        """Add a new task/agent"""
        task_data = {
            "id": len(self.tasks) + 1,
            "agent_id": agent_id,
            "task": task,
            "status": "active",
            "created_at": self._get_timestamp()
        }
        self.tasks.append(task_data)
        return task_data["id"]
    
    def get_tasks(self):
        """Get all tasks"""
        return self.tasks
    
    def _get_timestamp(self):
        from datetime import datetime
        return datetime.now().isoformat()