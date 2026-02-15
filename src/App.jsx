import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import AgentDashboard from './components/AgentDashboard';
import OnboardingChat from './components/OnboardingChat';
import './App.css';

function App() {
  const [view, setView] = useState('chat');
  const [agents, setAgents] = useState([]);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const onboarded = localStorage.getItem('openclaw_onboarded');
    
    if (onboarded === 'true') {
      setIsOnboarded(true);
      fetchAgents();
    }
    
    setIsChecking(false);
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('openclaw_onboarded', 'true');
    setIsOnboarded(true);
    fetchAgents();
  };

  if (isChecking) {
    return (
      <div className="app">
        <div className="loading-screen">
          <h1>🤖 OpenClaw</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="app">
        <OnboardingChat onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🤖 OpenClaw Assistant</h1>
        <p>Your Personal AI Operating System</p>
        
        <div className="nav-buttons">
          <button 
            className={view === 'chat' ? 'active' : ''}
            onClick={() => setView('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => setView('dashboard')}
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      <div className="content">
        {view === 'chat' ? (
          <ChatWindow />
        ) : (
          <AgentDashboard agents={agents} />
        )}
      </div>
    </div>
  );
}

export default App;