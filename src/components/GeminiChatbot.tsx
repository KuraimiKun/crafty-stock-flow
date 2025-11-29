import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Bot, X, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { chatbotService, type ChatMessage } from '@/services/chatbot';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  content:
    'Hi! I am AIMS Copilot, powered by Gemini. Ask me about our inventory workflows, onboarding, or how to get the most from the platform.',
};

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const statusLabel = useMemo(() => {
    if (isLoading) return 'Thinking...';
    if (error) return 'Something went wrong';
    return 'Ask anything about AIMS';
  }, [error, isLoading]);

  const handleToggle = () => {
    setIsOpen((open) => !open);
    setError(null);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const reply = await chatbotService.generate(nextMessages);
      setMessages([...nextMessages, { role: 'model', content: reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reach Gemini.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {!isOpen && (
        <Button onClick={handleToggle} className="shadow-lg" size="lg">
          <MessageCircle className="mr-2 h-4 w-4" />
          Chat with AIMS Copilot
        </Button>
      )}

      {isOpen && (
        <Card className="w-[320px] sm:w-[380px] shadow-2xl">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" />
                AIMS Copilot
              </CardTitle>
              <CardDescription>{statusLabel}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Close chatbot">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto rounded-md border bg-muted/30 p-3 space-y-3 text-sm"
            >
              {messages.map((message, idx) => (
                <div
                  key={`${message.role}-${idx}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground border'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {error && (
                <div className="text-xs text-destructive">{error}</div>
              )}
            </div>

            <form onSubmit={handleSend} className="space-y-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask how to track stock, onboard managers, etc."
                rows={3}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Powered by Gemini · Custom instructions applied for AIMS.
                </p>
                <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                  {isLoading ? 'Sending...' : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeminiChatbot;
