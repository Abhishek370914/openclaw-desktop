import { createAgent, getAllAgents, logAgentAction } from './database.js';

export async function createLinkedInPostAgent(name, description) {
    const config = {
        type: 'linkedin_post',
        searchQuery: 'OpenClaw trending',
        postTemplate: 'Check out this trending topic about OpenClaw: {topic}',
        requiresApproval: true
    };

    const agentId = createAgent(
        name,
        description,
        'linkedin_post',
        '0 9 * * *', // Daily at 9 AM
        config
    );

    logAgentAction(agentId, 'Agent created successfully', 'info');

    return {
        id: agentId,
        name,
        description,
        schedule: 'Daily at 9:00 AM',
        type: 'LinkedIn Post Agent'
    };
}

export async function createLinkedInCommentAgent(name, hashtag, comment) {
    const config = {
        type: 'linkedin_comment',
        hashtag: hashtag,
        comment: comment,
        maxCommentsPerRun: 5
    };

    const agentId = createAgent(
        name,
        `Comments on #${hashtag} posts`,
        'linkedin_comment',
        '0 * * * *', // Every hour
        config
    );

    logAgentAction(agentId, 'Comment agent created successfully', 'info');

    return {
        id: agentId,
        name,
        hashtag,
        schedule: 'Every hour',
        type: 'LinkedIn Comment Agent'
    };
}

export function listAllAgents() {
    return getAllAgents();
}