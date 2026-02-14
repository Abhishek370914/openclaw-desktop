// Simple in-memory database (no external dependencies for now)
let agents = [];
let logs = [];
let posts = [];
let nextId = 1;

export function createAgent(name, description, type, schedule, config) {
    const agent = {
        id: nextId++,
        name,
        description,
        type,
        schedule,
        config,
        status: 'active',
        created_at: new Date().toISOString()
    };
    agents.push(agent);
    return agent.id;
}

export function getAllAgents() {
    return [...agents];
}

export function getAgent(id) {
    return agents.find(a => a.id === id);
}

export function updateAgentStatus(id, status) {
    const agent = agents.find(a => a.id === id);
    if (agent) agent.status = status;
}

export function deleteAgent(id) {
    agents = agents.filter(a => a.id !== id);
}

export function logAgentAction(agentId, message, type = 'info') {
    logs.push({
        id: nextId++,
        agent_id: agentId,
        message,
        type,
        timestamp: new Date().toISOString()
    });
}

export function getAgentLogs(agentId, limit = 50) {
    return logs
        .filter(log => log.agent_id === agentId)
        .slice(-limit)
        .reverse();
}

export function createPost(agentId, content) {
    const post = {
        id: nextId++,
        agent_id: agentId,
        content,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    posts.push(post);
    return post.id;
}

export function getPendingPosts() {
    return posts.filter(p => p.status === 'pending');
}

export function updatePostStatus(id, status) {
    const post = posts.find(p => p.id === id);
    if (post) {
        post.status = status;
        post.posted_at = new Date().toISOString();
    }
}