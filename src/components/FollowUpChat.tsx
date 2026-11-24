import React, { useState } from 'react';
import { Send, MessageSquare, Sparkles, ExternalLink, Bot, User, RefreshCw } from 'lucide-react';
import { ScanResult, GroundedSource } from '../types/scanner';

interface FollowUpChatProps {
  scanResult: ScanResult;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: GroundedSource[];
  timestamp: string;
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({ scanResult }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I have reviewed the chemical formulation of "${scanResult.productName}". You can ask me any question about the flagged preservatives, mammalian rodent cancer bioassays, bioengineered crop lineage, or safer culinary substitutions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const suggestedQuestions = [
    'Why is BHA or BHT harmful to mammals in animal studies?',
    'Which specific ingredient in this product is bioengineered?',
    'What are clean, non-toxic alternatives to this product?',
    'Why is potassium bromate or titanium dioxide banned in the EU but not in the US?',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || inputValue.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          scanResult: scanResult,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: 'asst-' + Date.now(),
          sender: 'assistant',
          text: data.answer,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `Error analyzing question: ${err.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ask AI Toxicologist</h3>
            <p className="text-xs text-zinc-400">
              Live scientific question answering grounded on this product's formulation
            </p>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-2 pt-1">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors text-left"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto p-2 pr-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-purple-400 border border-zinc-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-950 text-zinc-200 border border-zinc-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-zinc-800 mt-2 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Grounded Web References:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-sky-400 hover:underline"
                      >
                        <span className="truncate max-w-[140px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[9px] text-zinc-500 block text-right">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-purple-400 border border-zinc-700 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 text-zinc-400 text-xs border border-zinc-800 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Investigating scientific databases &amp; bioassay literature...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2 pt-2 border-t border-zinc-800"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about this product's carcinogens or bioengineered ingredients..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
