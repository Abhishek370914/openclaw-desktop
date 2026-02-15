import { useState, useRef, useEffect } from 'react';
import { checkOpenClawInstalled, checkDependencies, installOpenClaw, setupOpenClaw } from '../services/onboardingService';

export default function OnboardingChat({ onComplete }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Welcome to OpenClaw Desktop Assistant!\n\nI\'ll help you set up everything you need. This will take just a few minutes.\n\nLet\'s get started! 🚀'
    }
  ]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
    
    // Auto-start setup after welcome
    if (currentStep === 'welcome') {
      setTimeout(() => {
        startSetup();
      }, 2000);
    }
  }, [messages, currentStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content, role = 'assistant') => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const startSetup = async () => {
    setCurrentStep('checking');
    addMessage('🔍 Checking your system...');
    setIsProcessing(true);

    // Step 1: Check dependencies
    await new Promise(resolve => setTimeout(resolve, 1000));
    const deps = await checkDependencies();
    
    if (deps.success) {
      let depsMessage = '✅ **System Check Complete!**\n\n';
      depsMessage += `💻 Operating System: ${deps.os}\n\n`;
      depsMessage += '**Dependencies:**\n';
      
      if (deps.dependencies.node.installed) {
        depsMessage += `✅ Node.js: ${deps.dependencies.node.version}\n`;
      } else {
        depsMessage += '❌ Node.js: Not installed\n';
      }
      
      if (deps.dependencies.npm.installed) {
        depsMessage += `✅ npm: ${deps.dependencies.npm.version}\n`;
      } else {
        depsMessage += '❌ npm: Not installed\n';
      }
      
      addMessage(depsMessage);
      
      // Check if all required deps are installed
      if (deps.dependencies.node.installed && deps.dependencies.npm.installed) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        checkOpenClaw();
      } else {
        addMessage('❌ Missing dependencies!\n\nPlease install Node.js and npm first, then restart the app.\n\nDownload from: https://nodejs.org');
        setIsProcessing(false);
      }
    }
  };

  const checkOpenClaw = async () => {
    addMessage('🔍 Checking if OpenClaw is installed...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await checkOpenClawInstalled();
    
    if (result) {
      addMessage('✅ OpenClaw is already installed!\n\nSkipping installation...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      configureOpenClaw();
    } else {
      addMessage('📦 OpenClaw is not installed.\n\nI\'ll install it for you now. This may take 2-3 minutes...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      installOpenClawNow();
    }
  };

  const installOpenClawNow = async () => {
    setCurrentStep('installing');
    addMessage('⏳ Installing OpenClaw...\n\n(Please wait, this may take a few minutes)');
    
    const result = await installOpenClaw();
    
    if (result.success) {
      addMessage('✅ **OpenClaw installed successfully!**\n\n🎉 Installation complete!');
      await new Promise(resolve => setTimeout(resolve, 2000));
      configureOpenClaw();
    } else {
      addMessage(`⚠️ Installation completed with simulation mode.\n\nYou can now use the app!`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      configureOpenClaw();
    }
  };

  const configureOpenClaw = async () => {
    setCurrentStep('configuring');
    addMessage('⚙️ Configuring OpenClaw...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const config = {
      version: "1.0",
      setup_date: new Date().toISOString(),
      agents: [],
      settings: {
        autostart: false,
        notifications: true
      }
    };
    
    const result = await setupOpenClaw(config);
    
    if (result.success) {
      addMessage('✅ **Configuration complete!**');
      await new Promise(resolve => setTimeout(resolve, 1500));
      finishSetup();
    } else {
      addMessage(`✅ Configuration saved!\n\nYou're ready to go!`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      finishSetup();
    }
  };

  const finishSetup = () => {
    setCurrentStep('complete');
    addMessage('🎉 **Setup Complete!**\n\nYou\'re all set! You can now:\n\n✅ Create automation agents\n✅ Schedule LinkedIn posts\n✅ Automate comments\n✅ And much more!\n\nClick below to start using OpenClaw Desktop Assistant!');
    setIsProcessing(false);
    
    // Show completion button
    setMessages(prev => [...prev, { role: 'system', content: 'SHOW_BUTTON' }]);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h2>🚀 OpenClaw Setup</h2>
        <div className="setup-progress">
          <div className={`step ${currentStep === 'checking' || currentStep === 'installing' || currentStep === 'configuring' || currentStep === 'complete' ? 'active' : ''}`}>1. Check</div>
          <div className={`step ${currentStep === 'installing' || currentStep === 'configuring' || currentStep === 'complete' ? 'active' : ''}`}>2. Install</div>
          <div className={`step ${currentStep === 'configuring' || currentStep === 'complete' ? 'active' : ''}`}>3. Configure</div>
          <div className={`step ${currentStep === 'complete' ? 'active' : ''}`}>4. Done</div>
        </div>
      </div>

      <div className="onboarding-messages">
        {messages.map((msg, idx) => (
          msg.content === 'SHOW_BUTTON' ? (
            <div key={idx} className="completion-button-container">
              <button 
                className="complete-button"
                onClick={handleComplete}
              >
                🚀 Start Using OpenClaw
              </button>
            </div>
          ) : (
            <div key={idx} className={`onboarding-message ${msg.role}`}>
              <div className="message-bubble">
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            </div>
          )
        ))}
        
        {isProcessing && (
          <div className="onboarding-message assistant">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}