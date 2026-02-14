import { getAllAgents, logAgentAction, createPost } from './database.js';
import { postToLinkedIn, searchAndComment, searchTrendingTopics } from './linkedinBot.js';

// Store active scheduled jobs
const scheduledJobs = new Map();

/**
 * Start the scheduler (simulated version)
 */
export function startScheduler() {
    console.log('🕐 Starting scheduler...');

    const agents = getAllAgents();

    agents.forEach(agent => {
        if (agent.status === 'active' && agent.schedule) {
            scheduleAgent(agent);
        }
    });

    console.log(`✅ Scheduler started with ${scheduledJobs.size} active jobs`);
}

/**
 * Schedule a single agent (simulated)
 */
export function scheduleAgent(agent) {
    console.log(`📅 Agent scheduled: ${agent.name}`);

    // Store job info (simulated - not actually scheduling)
    scheduledJobs.set(agent.id, {
        agentId: agent.id,
        name: agent.name,
        schedule: agent.schedule,
        lastRun: null,
        status: 'active'
    });

    logAgentAction(agent.id, `Agent scheduled: ${agent.schedule}`, 'info');
}

/**
 * Stop a scheduled agent
 */
export function stopAgent(agentId) {
    if (scheduledJobs.has(agentId)) {
        scheduledJobs.delete(agentId);
        console.log(`⏹️ Stopped agent: ${agentId}`);
    }
}

/**
 * Stop all scheduled agents
 */
export function stopAllAgents() {
    scheduledJobs.clear();
    console.log('🛑 All agents stopped');
}

/**
 * Execute an agent's task
 */
async function runAgent(agent) {
    logAgentAction(agent.id, 'Agent execution started', 'info');

    try {
        const config = typeof agent.config === 'string' ?
            JSON.parse(agent.config) :
            agent.config;

        if (config.type === 'linkedin_post') {
            await runPostAgent(agent, config);
        } else if (config.type === 'linkedin_comment') {
            await runCommentAgent(agent, config);
        }

        // Update last run time
        const job = scheduledJobs.get(agent.id);
        if (job) {
            job.lastRun = new Date().toISOString();
        }

        logAgentAction(agent.id, 'Agent execution completed', 'success');

    } catch (error) {
        console.error(`Error running agent ${agent.name}:`, error);
        logAgentAction(agent.id, `Error: ${error.message}`, 'error');
    }
}

/**
 * Run a LinkedIn posting agent
 */
async function runPostAgent(agent, config) {
    console.log(`📝 Running post agent: ${agent.name}`);

    // Search for trending topics
    const searchResult = await searchTrendingTopics(config.searchQuery || 'OpenClaw automation');

    if (!searchResult.success || searchResult.topics.length === 0) {
        logAgentAction(agent.id, 'No trending topics found', 'warning');
        return;
    }

    const topic = searchResult.topics[0];

    // Generate post content
    const postContent = `🚀 ${topic.title}\n\n${topic.snippet}\n\n#OpenClaw #Automation #LinkedInBot`;

    // Save post for approval
    const postId = createPost(agent.id, postContent);
    logAgentAction(agent.id, `Post created (ID: ${postId}), awaiting approval`, 'info');

    console.log(`✅ Post created for approval`);

    // If auto-approval is enabled, post immediately
    if (!config.requiresApproval) {
        const result = await postToLinkedIn(postContent);
        if (result.success) {
            logAgentAction(agent.id, 'Post published to LinkedIn', 'success');
        } else {
            logAgentAction(agent.id, `Post failed: ${result.error}`, 'error');
        }
    }
}

/**
 * Run a LinkedIn comment agent
 */
async function runCommentAgent(agent, config) {
    console.log(`💬 Running comment agent: ${agent.name}`);

    const result = await searchAndComment(
        config.hashtag || 'openclaw',
        config.comment || 'Great post!'
    );

    if (result.success) {
        logAgentAction(agent.id, `Commented on #${config.hashtag} post`, 'success');
    } else {
        logAgentAction(agent.id, `Comment failed: ${result.error}`, 'error');
    }
}

/**
 * Get status of all scheduled jobs
 */
export function getSchedulerStatus() {
    const status = {
        running: scheduledJobs.size,
        jobs: []
    };

    scheduledJobs.forEach((job, agentId) => {
        status.jobs.push({
            id: agentId,
            name: job.name,
            schedule: job.schedule,
            lastRun: job.lastRun,
            status: job.status
        });
    });

    return status;
}

/**
 * Manually trigger an agent (for testing)
 */
export async function triggerAgent(agentId) {
    const agents = getAllAgents();
    const agent = agents.find(a => a.id === agentId);

    if (!agent) {
        throw new Error('Agent not found');
    }

    console.log(`🎯 Manually triggering agent: ${agent.name}`);
    await runAgent(agent);

    return { success: true, message: `Agent ${agent.name} executed` };
}