import { useState, useRef, useEffect } from 'react';
import { Message, PersonaType, getDefaultSystemPrompt, generateMasterPrompt, getLLMResponse, parseZiweiToPrompt } from '@/lib/ai';

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
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('companion');
  
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

    console.log('开始发送消息:', inputMessage);
    const userMessage: Message = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      console.log('生成系统提示词, persona:', selectedPersona);
      const systemPrompt = ziweiData 
        ? generateMasterPrompt(inputMessage, ziweiData, horoscopeYear, selectedPersona)
        : getDefaultSystemPrompt();

      const dynamicMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...newMessages.filter(m => m.role !== 'system')
      ];

      console.log('调用LLM API:', model);
      const stream = await getLLMResponse(dynamicMessages, model);
      if (!stream) throw new Error('Failed to get response stream');
      
      console.log('获取流读取器');
      reader = stream.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';
      
      const tempMessageIndex = newMessages.length;
      setMessages([...newMessages, { role: 'assistant', content: '' }]);
      console.log('添加空的AI响应消息');

      console.log('开始处理流数据');
      let readAttempts = 0;
      const maxReadAttempts = 1000; // 防止无限循环

      while (readAttempts < maxReadAttempts) {
        console.log(`读取流数据... (尝试 ${readAttempts + 1})`);
        readAttempts++;
        
        try {
          const { done, value } = await reader.read();
          console.log('流读取结果:', { done, value: value ? value.length : 0 });
          
          if (done) {
            console.log('流处理完成');
            break;
          }

          if (value) {
            const chunk = decoder.decode(value);
            console.log('解码后的流数据:', chunk);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  console.log('解析后的流数据:', data);
                  if (data.choices && data.choices[0]?.delta?.content) {
                    aiResponseContent += data.choices[0].delta.content;
                    console.log('更新AI响应内容:', aiResponseContent);
                    setMessages(prev => {
                      const newMsgs = [...prev];
                      newMsgs[tempMessageIndex] = { role: 'assistant', content: aiResponseContent };
                      return newMsgs;
                    });
                  }
                } catch (e) {
                  console.error('解析流数据失败:', e);
                  console.error('失败的行:', line);
                }
              }
            }
          }
        } catch (readError) {
          console.error('流读取失败:', readError);
          break; // 出错时跳出循环
        }
      }

      if (readAttempts >= maxReadAttempts) {
        console.error('流读取尝试次数超过限制，可能存在无限循环');
        throw new Error('流读取超时: 超过最大尝试次数');
      }

    } catch (error) {
      console.error('AI 响应失败:', error);
      setMessages(prev => {
        // 确保不会尝试删除不存在的消息
        const updatedMessages = [...prev];
        if (updatedMessages.length > newMessages.length) {
          updatedMessages[newMessages.length] = {
            role: 'assistant',
            content: `抱歉，AI 服务调用失败。请确保环境变量配置正确或稍后重试。\n\n错误详情: ${error instanceof Error ? error.message : '未知错误'}`
          };
        } else {
          updatedMessages.push({
            role: 'assistant',
            content: `抱歉，AI 服务调用失败。请确保环境变量配置正确或稍后重试。\n\n错误详情: ${error instanceof Error ? error.message : '未知错误'}`
          });
        }
        return updatedMessages;
      });
    } finally {
      console.log('释放流读取器');
      if (reader) {
        try {
          reader.releaseLock();
        } catch (e) {
          console.error('释放流读取器失败:', e);
        }
      }
      console.log('重置isLoading状态');
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
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    debugPrompt,
    setDebugPrompt,
    selectedPersona,
    setSelectedPersona,
    messagesEndRef,
    messagesContainerRef,
    initializeChat,
    updateChatForHoroscope,
    sendMessage,
    saveChatHistory,
    loadChatHistory
  };
}
