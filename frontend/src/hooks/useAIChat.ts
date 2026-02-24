import { useState, useRef, useEffect } from 'react';
import { Message, getDefaultSystemPrompt, generateMasterPrompt, getLLMResponse, parseZiweiToPrompt } from '@/lib/ai';

interface ZiweiData {
  astrolabe: any;
  horoscope?: any;
  originalTime?: {
    hour: number;
    minute: number;
  };
  targetYear?: number;
}

export function useAIChat(ziweiData: ZiweiData | null, horoscopeYear: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugPrompt, setDebugPrompt] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = (ziweiData: ZiweiData) => {
    const [sysPrompt, dataContext] = parseZiweiToPrompt(ziweiData);
    setMessages([
      { role: 'system', content: sysPrompt },
      { role: 'system', content: dataContext },
      { 
        role: 'assistant', 
        content: '你好！我已经完整解析了这张命盘的本命结构。\n你可以问我：\n1. **格局性格**：例如「我适合创业还是上班？」\n2. **情感婚姻**：例如「我的正缘有什么特征？」\n3. **流年运势**：例如「今年要注意什么？」' 
      }
    ]);
    setDebugPrompt(`=== 系统提示词 ===\n${sysPrompt}\n\n=== 数据上下文 ===\n${dataContext}`);
  };

  const updateChatForHoroscope = (ziweiData: ZiweiData) => {
    const [sysPrompt, dataContext] = parseZiweiToPrompt(ziweiData);
    setMessages([
      { role: 'system', content: sysPrompt },
      { role: 'system', content: dataContext },
      { 
        role: 'assistant', 
        content: '你好！我已经根据你选择的大限更新了命盘分析。\n你可以问我：\n1. **格局性格**：例如「我适合创业还是上班？」\n2. **情感婚姻**：例如「我的正缘有什么特征？」\n3. **流年运势**：例如「今年要注意什么？」' 
      }
    ]);
    setDebugPrompt(`=== 系统提示词 ===\n${sysPrompt}\n\n=== 数据上下文 ===\n${dataContext}`);
  };

  const sendMessage = async (model: string) => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const systemPrompt = ziweiData 
        ? generateMasterPrompt(inputMessage, ziweiData, horoscopeYear)
        : getDefaultSystemPrompt();

      const dynamicMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...newMessages.filter(m => m.role !== 'system')
      ];

      const stream = await getLLMResponse(dynamicMessages, model);
      if (!stream) throw new Error('Failed to get response stream');
      
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';
      
      const tempMessageIndex = newMessages.length;
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0]?.delta?.content) {
                aiResponseContent += data.choices[0].delta.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[tempMessageIndex] = { role: 'assistant', content: aiResponseContent };
                  return newMsgs;
                });
              }
            } catch (e) {
            }
          }
        }
      }
    } catch (error) {
      console.error('AI 响应失败:', error);
      setMessages(prev => [
        ...prev.slice(0, -1), 
        {
          role: 'assistant',
          content: `抱歉，AI 服务调用失败。请确保环境变量配置正确或稍后重试。\n\n错误详情: ${error instanceof Error ? error.message : '未知错误'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatHistory = (birthDate: string, gender: string) => {
    if (messages.length === 0) return;
    
    const chatData = {
      birth_date: birthDate,
      gender: gender,
      messages: messages.filter(m => m.role !== 'system'),
      timestamp: new Date().toLocaleString('zh-CN')
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ziwei_chat_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadChatHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const chatData = JSON.parse(e.target?.result as string);
        if (chatData.messages) {
          setMessages(chatData.messages);
        }
      } catch (err) {
        console.error('加载聊天历史失败:', err);
        alert('聊天历史文件格式错误');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    debugPrompt,
    setDebugPrompt,
    messagesEndRef,
    messagesContainerRef,
    initializeChat,
    updateChatForHoroscope,
    sendMessage,
    saveChatHistory,
    loadChatHistory
  };
}
