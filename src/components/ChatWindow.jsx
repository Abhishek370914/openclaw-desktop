import { useState, useRef, useEffect } from 'react';

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

      // ===== CREATE LINKEDIN TRENDING AGENT =====
      if ((lowerInput.includes('create') || lowerInput.includes('make')) && 
          (lowerInput.includes('linkedin') || lowerInput.includes('trending') || lowerInput.includes('post'))) {
        
        try {
          const response = await fetch('http://127.0.0.1:8000/create-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: "LinkedIn Trending Agent",
              description: "Posts trending topics to LinkedIn daily",
              agent_type: "linkedin_trending",
              schedule: "daily"
            })
          });

          const data = await response.json();
          
          if (data.success && data.agent) {
            const aiMessage = {
              role: 'assistant',
              content: `✅ **LinkedIn Agent Created!**\n\n📝 **Name:** ${data.agent.name}\n📊 **Type:** Trending Post Agent\n⏰ **Schedule:** Posts daily at 9 AM\n\n**What it does:**\n• Searches for trending OpenClaw topics\n• Generates engaging LinkedIn posts\n• Waits for your approval\n• Posts automatically\n\n🎯 Your agent is ready! Type "show my agents" to see all.`
            };
            setMessages(prev => [...prev, aiMessage]);
          } else {
            const errorMessage = {
              role: 'assistant',
              content: `❌ **Error:** ${data.message || 'Could not create agent'}\n\nPlease try again.`
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        } catch (error) {
          const errorMessage = {
            role: 'assistant',
            content: `❌ **Connection Error**\n\nCould not reach backend at http://127.0.0.1:8000\n\nMake sure backend is running:\n\`cd backend\`\n\`python main.py\``
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        
        setIsLoading(false);
        return;
      }

      // ===== CREATE COMMENT BOT AGENT =====
      if ((lowerInput.includes('create') || lowerInput.includes('make')) && 
          (lowerInput.includes('comment') || lowerInput.includes('hashtag'))) {
        
        try {
          const response = await fetch('http://127.0.0.1:8000/create-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: "Hashtag Comment Bot",
              description: "Comments on posts with #openclaw hashtag",
              agent_type: "linkedin_comment",
              schedule: "hourly"
            })
          });

          const data = await response.json();
          
          if (data.success && data.agent) {
            const aiMessage = {
              role: 'assistant',
              content: `✅ **Comment Bot Created!**\n\n📝 **Name:** ${data.agent.name}\n🏷️ **Hashtag:** #openclaw\n⏰ **Schedule:** Runs every hour\n\n**What it does:**\n• Searches for posts with #openclaw\n• Adds promotional comments\n• Logs all activity\n\n🎯 Bot is active!`
            };
            setMessages(prev => [...prev, aiMessage]);
          } else {
            const errorMessage = {
              role: 'assistant',
              content: `❌ **Error:** ${data.message || 'Could not create bot'}`
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        } catch (error) {
          const errorMessage = {
            role: 'assistant',
            content: `❌ **Connection Error**\n\nBackend not reachable. Please start it first.`
          };
          setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        return;
      }

      // ===== LIST ALL AGENTS =====
      if (lowerInput.includes('show') || lowerInput.includes('list') || lowerInput.includes('my agents')) {
        try {
          const response = await fetch('http://127.0.0.1:8000/list-agents');
          const data = await response.json();

          if (data.success && data.agents) {
            let agentsList = `📋 **Your Agents** (${data.agents.length} total)\n\n`;

            if (data.agents.length === 0) {
              agentsList = `📋 **No agents yet!**\n\nCreate your first agent:\n• "Create a LinkedIn trending agent"\n• "Make a hashtag comment bot"`;
            } else {
              data.agents.forEach((agent, idx) => {
                agentsList += `${idx + 1}. **${agent.name}**\n`;
                agentsList += `   Type: ${agent.type}\n`;
                agentsList += `   Status: ${agent.status}\n\n`;
              });
            }

            const aiMessage = {
              role: 'assistant',
              content: agentsList
            };
            setMessages(prev => [...prev, aiMessage]);
          } else {
            const errorMessage = {
              role: 'assistant',
              content: `❌ Could not fetch agents`
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        } catch (error) {
          const errorMessage = {
            role: 'assistant',
            content: `❌ **Connection Error**\n\nCannot connect to backend.`
          };
          setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        return;
      }

      // ===== FILE OPERATIONS =====
      if (lowerInput.includes('organize') || lowerInput.includes('file')) {
        try {
          const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
          });

          const data = await response.json();
          
          const aiMessage = {
            role: 'assistant',
            content: data.message || '✅ File operation completed!'
          };

          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          const errorMessage = {
            role: 'assistant',
            content: `❌ Error: Backend not responding`
          };
          setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        return;
      }

      // ===== RESEARCH =====
      if (lowerInput.includes('research') || lowerInput.includes('search') || lowerInput.includes('find')) {
        try {
          const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
          });

          const data = await response.json();
          
          const aiMessage = {
            role: 'assistant',
            content: data.message || '🔍 Research completed!'
          };

          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          const errorMessage = {
            role: 'assistant',
            content: `❌ Error: Backend not responding`
          };
          setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        return;
      }

      // ===== WRITING =====
      if (lowerInput.includes('write') || lowerInput.includes('draft')) {
        try {
          const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
          });

          const data = await response.json();
          
          const aiMessage = {
            role: 'assistant',
            content: data.message || '✍️ Content created!'
          };

          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          const errorMessage = {
            role: 'assistant',
            content: `❌ Error: Backend not responding`
          };
          setMessages(prev => [...prev, errorMessage]);
        }

        setIsLoading(false);
        return;
      }

      // ===== HELP / DEFAULT =====
      const aiMessage = {
        role: 'assistant',
        content: `I can help you with:\n\n🤖 **Create Agents:**\n• "Create a LinkedIn trending agent"\n• "Make a hashtag comment bot"\n\n📁 **File Operations:**\n• "Organize my downloads"\n• "List my files"\n\n🔍 **Research:**\n• "Research AI automation"\n• "Search for trending topics"\n\n✍️ **Writing:**\n• "Write about machine learning"\n• "Create a blog post"\n\n📊 **Manage:**\n• "Show my agents"\n• "List all agents"\n\nWhat would you like to do?`
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `❌ **Unexpected Error**\n\n${error.message}\n\nPlease check that the backend is running.`
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
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
            placeholder="Ask me anything..."
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