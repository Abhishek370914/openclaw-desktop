export default function AgentDashboard({ agents }) {
  return (
    <div className="dashboard">
      <h2>🤖 Active Agents</h2>
      
      <div className="agents-grid">
        {agents.length === 0 ? (
          <p className="no-agents">No agents created yet. Use the chat to create your first agent!</p>
        ) : (
          agents.map((agent, idx) => (
            <div key={idx} className="agent-card">
              <div className="agent-header">
                <h3>{agent.name}</h3>
                <span className={`status ${agent.status}`}>{agent.status}</span>
              </div>
              <p className="agent-description">{agent.description}</p>
              <div className="agent-footer">
                <button className="agent-button">View Logs</button>
                <button className="agent-button">Configure</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}