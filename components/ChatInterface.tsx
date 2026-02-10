'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Step, MockupTheme, MockupAssets, ChannelType } from '@/lib/types';
import { Send, Image as ImageIcon, CheckCircle, MessageSquare, X, Phone, Mail, MessageCircle } from 'lucide-react';

interface ChatInterfaceProps {
  flow: Step[];
  theme: MockupTheme;
  assets: MockupAssets;
  channel: ChannelType;
  isPreview?: boolean;
  liveMode?: boolean;
  systemPrompt?: string;
  onSessionStart?: () => void;
  onStepComplete?: (stepIndex: number, data?: any) => void;
  onSessionComplete?: () => void;
  trackingParams?: Record<string, string | null>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  flow, theme, assets, channel, isPreview, liveMode, systemPrompt, onSessionStart, onStepComplete, onSessionComplete, trackingParams
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Initialize
  useEffect(() => {
    if (isPreview) {
      reset();
    }
  }, [flow, isPreview]);

  const reset = () => {
    setHistory([]);
    setCurrentStepIndex(0);
    setIsTyping(false);
    hasStarted.current = false;
    
    if (liveMode) {
      // In live mode, we start by getting an initial message from the AI
      startLiveChat();
    } else {
      processStep(0, []);
    }
  };

  const startLiveChat = async () => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate a short initial greeting based on your instructions.' }], 
          systemPrompt 
        })
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.message) {
        setHistory([{ type: 'bot', text: data.message.content }]);
      }
    } catch (err) {
      setIsTyping(false);
      console.error("Failed to start live chat:", err);
      setHistory([{ type: 'bot', text: "Hello! How can I help you today?" }]);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  // Reset loading state when background URL changes
  useEffect(() => {
    setImageLoading(true);
  }, [assets.backgroundUrl]);

  const processStep = async (index: number, currentHistory: any[]) => {
    if (index >= flow.length) {
      if (onSessionComplete) onSessionComplete();
      return;
    }

    if (!hasStarted.current && onSessionStart) {
      hasStarted.current = true;
      if (trackingParams?.adid) {
        console.log("Tracking params captured:", trackingParams);
      }
      onSessionStart();
    }

    const step = flow[index];

    if (step.type === 'BOT_MESSAGE') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const newMsg = { type: 'bot', text: step.text };
        setHistory(prev => [...prev, newMsg]);
        if (onStepComplete) onStepComplete(index);
        setCurrentStepIndex(index + 1);
        processStep(index + 1, [...currentHistory, newMsg]);
      }, step.delayMs || 600);
    } else if (step.type === 'USER_MESSAGE') {
      setTimeout(() => {
        const newMsg = { type: 'user', text: step.text };
        setHistory(prev => [...prev, newMsg]);
        if (onStepComplete) onStepComplete(index);
        setCurrentStepIndex(index + 1);
        processStep(index + 1, [...currentHistory, newMsg]);
      }, step.delayMs || 600);
    }
    // INPUT_CAPTURE and QUICK_REPLIES wait for user interaction
  };

  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim()) return;

    const step = flow[currentStepIndex];

    // Basic validation
    if (step.required && step.fieldType === 'email' && !userInput.includes('@')) {
      alert("Invalid email"); // Simple for MVP
      return;
    }
    if (step.required && step.fieldType === 'phone' && userInput.length < 8) {
      alert("Invalid phone");
      return;
    }

    const val = userInput;
    setUserInput('');

    const newMsg = { type: 'user', text: val };
    setHistory(prev => [...prev, newMsg]);

    if (liveMode) {
      setIsTyping(true);
      // Map history to OpenAI message format
      const messages = [...history, newMsg].map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt })
      })
      .then(res => res.json())
      .then(data => {
        setIsTyping(false);
        if (data.message) {
          setHistory(prev => [...prev, { type: 'bot', text: data.message.content }]);
        } else if (data.error) {
          console.error("Chat API error:", data.error);
          setHistory(prev => [...prev, { type: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
        }
      })
      .catch(err => {
        setIsTyping(false);
        console.error("Fetch error:", err);
        setHistory(prev => [...prev, { type: 'bot', text: "Connection error. Please check your internet." }]);
      });
      return;
    }

    if (onStepComplete) onStepComplete(currentStepIndex, { [step.fieldKey || 'input']: val });

    setCurrentStepIndex(prev => {
      const next = prev + 1;
      processStep(next, history);
      return next;
    });
  };

  const handleQuickReply = (option: string) => {
    setHistory(prev => [...prev, { type: 'user', text: option }]);
    if (onStepComplete) onStepComplete(currentStepIndex, { choice: option });

    setCurrentStepIndex(prev => {
      const next = prev + 1;
      processStep(next, history);
      return next;
    });
  };

  const currentStep = flow[currentStepIndex];
  const isWeb = channel === 'WEB';

  return (
    <div className="relative w-full h-full overflow-hidden bg-white flex flex-col font-sans">

      {/* Scrollable Atmosphere Backdrop - Ultra Hardened v2.6 */}
      <div 
        className="absolute inset-0 z-0 overflow-y-auto no-scrollbar bg-slate-50"
        style={{ 
          top: isPreview ? '44px' : '0',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: isPreview ? 'calc(100% - 44px)' : '100%',
          overflowX: 'hidden'
        }}
      >
        {assets.backgroundUrl ? (
          <div className="w-full relative" style={{ width: '100%', minWidth: '100%' }}>
            <img
              src={assets.backgroundUrl}
              className="w-full h-auto block"
              style={{ width: '100%', minWidth: '100%', display: 'block', imageRendering: 'auto' }}
              alt="Atmosphere Backdrop"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-500">Generating mobile screenshot...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
      </div>

      {/* Fixed Overlay - non-blocking for scroll */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none z-10" />

      {/* Decorative Bottom Bar (Matches screenshot) - Fixed */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-600 flex items-center justify-around px-10 z-40">
        <button className="flex-1 flex justify-center py-2 transition-transform hover:scale-110 active:scale-95">
          <Phone className="text-white opacity-80" size={22} />
        </button>
        <button className="flex-1 flex justify-center relative py-2 transition-transform hover:scale-110 active:scale-95">
          <div className="relative">
            <MessageCircle className="text-white opacity-90" size={24} />
            <span className="absolute -top-1 -right-2.5 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xl flex items-center justify-center leading-none min-w-[26px]">
              V2.6
            </span>
          </div>
        </button>
        <button className="flex-1 flex justify-center py-2 transition-transform hover:scale-110 active:scale-95">
          <Mail className="text-white opacity-80" size={22} />
        </button>
      </div>

      {/* Launcher Button (Visible when closed) - Matches screenshot square-ish look */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-20 right-4 w-12 h-12 rounded-lg flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 animate-in fade-in zoom-in duration-300 z-50 border border-white/20"
          style={{ backgroundColor: '#00a2ff', color: '#ffffff' }}
        >
          <MessageCircle size={22} fill="white" className="text-white" />
        </button>
      )}

      {/* Chat Container */}
      <div className={`relative z-50 flex flex-col h-full bg-white transition-all duration-500 ease-in-out origin-bottom-right 
        ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}
        ${(isWeb && !isPreview) ? 'max-w-md mx-auto mt-4 mb-20 shadow-2xl rounded-2xl overflow-hidden' : 'w-full h-full'}`}
        style={{ height: (isWeb && !isPreview) ? '75%' : '100%', width: '100% !important' }}>

        {/* Header */}
        <div 
          className="p-4 flex items-center gap-3 z-20 shadow-sm cursor-pointer" 
          style={{ backgroundColor: theme.primaryColor, color: theme.headerTextColor }}
          onClick={() => isPreview && window.location.reload()}
        >
          {assets.avatarUrl ? (
            <img src={assets.avatarUrl} className="w-8 h-8 rounded-full ring-2 ring-white/20 object-cover" alt="avatar" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold border border-white/10 uppercase tracking-widest">
              {theme.chatTitle.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm tracking-tight truncate leading-tight">{theme.chatTitle}</h3>
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
              <p className="text-[10px] font-bold uppercase tracking-wider">{channel === 'SMS' ? 'Direct SMS' : 'Active Now'}</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30 no-scrollbar">
          {history.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm
                  ${msg.type === 'user'
                    ? 'rounded-tr-sm shadow-indigo-500/10'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-slate-200/50'}`}
                style={msg.type === 'user' ? { backgroundColor: theme.primaryColor, color: theme.headerTextColor } : {}}
              >
                {msg.text}
              </div>
              <span className="text-[9px] font-bold text-slate-300 mt-1.5 uppercase tracking-widest px-1">
                {msg.type === 'user' ? 'delivered' : ''}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Interaction Area */}
        <div className="p-5 bg-white border-t border-slate-100">
          {(liveMode || currentStep?.type === 'INPUT_CAPTURE') && (
            <form onSubmit={handleInputSubmit} className="flex gap-3">
              <input
                type={liveMode ? 'text' : (currentStep?.fieldType || 'text')}
                placeholder={liveMode ? "Type your message..." : (currentStep?.prompt || 'Write your response...')}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                autoFocus
              />
              <button type="submit" style={{ backgroundColor: theme.primaryColor }} className="p-2.5 text-white rounded-xl shadow-lg ring-offset-1 hover:brightness-110 transition-all active:scale-95">
                <Send size={18} />
              </button>
            </form>
          )}

          {!liveMode && currentStep?.type === 'QUICK_REPLIES' && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">{currentStep.prompt || 'Choose an option'}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentStep.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleQuickReply(opt)}
                    className="px-5 py-2.5 bg-white border-2 text-sm font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder input when nothing is active */}
          {!liveMode && !['INPUT_CAPTURE', 'QUICK_REPLIES'].includes(currentStep?.type) && currentStepIndex < flow.length && (
            <div className="h-11 bg-slate-50 rounded-xl w-full flex items-center justify-center px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100/50">
              {isTyping ? 'Syncing...' : 'Encrypted Session active'}
            </div>
          )}

          {currentStepIndex >= flow.length && (
            <div className="text-center text-[10px] font-bold text-emerald-500 uppercase tracking-widest py-2 flex items-center justify-center gap-2">
              <CheckCircle size={10} />
              Sequence Finalized
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
