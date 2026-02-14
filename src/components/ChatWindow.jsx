import { useState, useRef, useEffect } from 'react';
import { startScheduler, stopAllAgents, getSchedulerStatus, triggerAgent } from '../services/scheduler';
// import { postToLinkedIn, searchTrendingTopics } from '../services/linkedinBot';
import { createLinkedInPostAgent, createLinkedInCommentAgent, listAllAgents } from '../services/agentService';

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hi! I\'m your OpenClaw Desktop Assistant. What would you like to do?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { role: 'user', content: input };
  setMessages(prev => [...prev, userMessage]);
  const userInput = input;
  setInput('');
  setIsLoading(true);

  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const lowerInput = userInput.toLowerCase();

    // Start scheduler
if (lowerInput.includes('start') && lowerInput.includes('scheduler')) {
  startScheduler();
  const aiMessage = { 
    role: 'assistant', 
    content: '⏰ **Scheduler Started!**\n\nAll active agents are now running on their schedules.\n\nYour agents will execute automatically:\n• Trending Agent: Daily at 9:00 AM\n• Comment Bot: Every hour\n\nType "scheduler status" to see running jobs.' 
  };
  setMessages(prev => [...prev, aiMessage]);
  setIsLoading(false);
  return;
}

// Scheduler status
if (lowerInput.includes('scheduler') && lowerInput.includes('status')) {
  const status = getSchedulerStatus();
  
  let responseText = `⏰ **Scheduler Status**\n\n`;
  responseText += `Running Jobs: ${status.running}\n\n`;
  
  if (status.jobs.length === 0) {
    responseText += 'No jobs scheduled.\n\nType "start scheduler" to begin.';
  } else {
    responseText += '**Active Jobs:**\n\n';
    status.jobs.forEach((job, idx) => {
      responseText += `${idx + 1}. ${job.name}\n   Schedule: ${job.schedule}\n   Type: ${job.type}\n\n`;
    });
  }
  
  const aiMessage = { role: 'assistant', content: responseText };
  setMessages(prev => [...prev, aiMessage]);
  setIsLoading(false);
  return;
}

// Stop scheduler
if (lowerInput.includes('stop') && lowerInput.includes('scheduler')) {
  stopAllAgents();
  const aiMessage = { 
    role: 'assistant', 
    content: '⏹️ **Scheduler Stopped**\n\nAll scheduled jobs have been stopped.\n\nType "start scheduler" to resume.' 
  };
  setMessages(prev => [...prev, aiMessage]);
  setIsLoading(false);
  return;
}

// Run agent now (manual trigger)
if (lowerInput.includes('run') && lowerInput.includes('agent')) {
  const agents = listAllAgents();
  
  if (agents.length === 0) {
    const aiMessage = { 
      role: 'assistant', 
      content: '❌ No agents found.\n\nCreate an agent first!' 
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
    return;
  }
  
  // Run the first agent for demo
  const agent = agents[0];
  
  const aiMessage = { 
    role: 'assistant', 
    content: `🚀 Running agent: **${agent.name}**\n\nThis may take a few seconds...` 
  };
  setMessages(prev => [...prev, aiMessage]);
  setIsLoading(false);
  
  setTimeout(async () => {
    try {
      await triggerAgent(agent.id);
      const resultMessage = {
        role: 'assistant',
        content: `✅ Agent executed successfully!\n\nCheck the logs for details.`
      };
      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `❌ Error: ${error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, 1000);
  
  return;
}

    // Create trending post agent
    if (lowerInput.includes('create') && (lowerInput.includes('post') || lowerInput.includes('trending'))) {
      const agent = await createLinkedInPostAgent(
        'Trending Topics Agent',
        'Posts trending OpenClaw topics daily to LinkedIn'
      );

      const responseText = `✅ **Agent Created Successfully!**\n\n📝 Name: ${agent.name}\n📊 Type: ${agent.type}\n⏰ Schedule: ${agent.schedule}\n\nThis agent will:\n• Search for trending OpenClaw topics\n• Generate a LinkedIn post\n• Wait for your approval\n• Post automatically\n\n🎯 Your agent is ready!`;
      
      const aiMessage = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      return;
    }

    // Create comment bot
    if (lowerInput.includes('comment') || (lowerInput.includes('create') && lowerInput.includes('hashtag'))) {
      const agent = await createLinkedInCommentAgent(
        'Hashtag Comment Bot',
        'openclaw',
        'Great to see OpenClaw being discussed! Check out our desktop assistant: [link]'
      );

      const responseText = `✅ **Comment Bot Created!**\n\n📝 Name: ${agent.name}\n🏷️ Hashtag: #${agent.hashtag}\n⏰ Schedule: ${agent.schedule}\n\nThis bot will:\n• Search for #openclaw posts\n• Add promotional comments\n• Run every hour\n\n🎯 Bot is active!`;
      
      const aiMessage = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      return;
    }
    // Test LinkedIn posting
if (lowerInput.includes('test') && lowerInput.includes('post')) {
  const aiMessage = { 
    role: 'assistant', 
    content: '🚀 Testing LinkedIn post...\n\nA browser window will open. Please:\n1. Log in to LinkedIn\n2. Wait for the post to be created\n\nThis may take 1-2 minutes...' 
  };
  setMessages(prev => [...prev, aiMessage]);
  setIsLoading(false);
  
  // Post to LinkedIn in background
  setTimeout(async () => {
    const testContent = '🚀 Testing my new OpenClaw Desktop Assistant!\n\nThis post was created automatically using browser automation. #OpenClaw #Automation';
    
    const result = await postToLinkedIn(testContent, false); // false = visible browser
    
    const resultMessage = {
      role: 'assistant',
      content: result.success 
        ? '✅ Post published successfully!\n\nCheck your LinkedIn profile!' 
        : `❌ Error: ${result.error}\n\nPlease try again.`
    };
    setMessages(prev => [...prev, resultMessage]);
  }, 1000);
  
  return;
}

    // List agents
    if (lowerInput.includes('list') || lowerInput.includes('show')) {
      const agents = listAllAgents();
      
      let responseText = `📋 **Your Agents** (${agents.length} total)\n\n`;
      
      if (agents.length === 0) {
        responseText = '📋 You don\'t have any agents yet.\n\nTry: "Create a trending post agent"';
      } else {
        agents.forEach((agent, idx) => {
          responseText += `${idx + 1}. **${agent.name}**\n   Type: ${agent.type}\n   Status: ${agent.status}\n   Created: ${new Date(agent.created_at).toLocaleDateString()}\n\n`;
        });
      }

      const aiMessage = { role: 'assistant', content: responseText };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      return;
    }

    // Default response
    const aiMessage = { 
      role: 'assistant', 
      content: `You said: "${userInput}"\n\n💡 Try:\n• "Create a trending post agent"\n• "Create a hashtag comment bot"\n• "Show my agents"` 
    };
    setMessages(prev => [...prev, aiMessage]);
    
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = { 
      role: 'assistant', 
      content: `❌ Error: ${error.message}\n\nPlease try again.`
    };
    setMessages(prev => [...prev, errorMessage]);
  }

  setIsLoading(false);
};

  return (
    <div className="chat-container">
      <div className="header">
        <h1>🤖 OpenClaw Assistant</h1>
        <p>AI-Powered LinkedIn Automation</p>
      </div>

      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              <p className="message-role">
                {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
              </p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="loading">
              <div className="loading-dot"></div>
              <div className="loading-dot" style={{animationDelay: '0.2s'}}></div>
              <div className="loading-dot" style={{animationDelay: '0.4s'}}></div>
              <span style={{ marginLeft: '0.5rem' }}>Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type something..."
            className="input-box"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}