import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatbotProps {
  userEmail?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'bot',
    text: '¡Hola! Soy el asistente virtual de SPID+. ¿En qué puedo ayudarte?',
    timestamp: new Date()
  }
];

const FAQ_RESPONSES: Record<string, string> = {
  'crear cartel': 'Para crear un cartel, puedes usar el botón "Cartel" en el dashboard. Necesitarás permisos de administrador.',
  'enviar cartel': 'Puedes enviar carteles a diferentes sucursales usando la función de envío en el editor de carteles.',
  'digital': 'Los carteles digitales se pueden crear y gestionar desde la sección "Cartel Digital" en el dashboard.',
  'plantilla': 'Puedes crear y gestionar plantillas usando el "Builder" en el dashboard.',
  'sucursal': 'Puedes ver el estado de las sucursales en la sección de Analytics.',
  'ayuda': 'Estoy aquí para ayudarte con cualquier duda sobre SPID+. Puedes preguntarme sobre carteles, plantillas, sucursales y más.',
  'problema': 'Si tienes algún problema técnico, por favor contacta al soporte técnico en soporte@spidplus.com',
  'error': 'Si encuentras un error, por favor toma una captura de pantalla y repórtalo al equipo de soporte.',
};

export const Chatbot: React.FC<ChatbotProps> = ({ userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (input: string): string => {
    // Buscar coincidencias en el FAQ
    for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
      if (input.includes(keyword)) {
        return response;
      }
    }

    // Respuesta por defecto
    return 'Lo siento, no entiendo tu pregunta. Puedes preguntarme  "crear cartel", "enviar cartel", "digital", "plantilla", "sucursal", "ayuda", "problema", "error"';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl mb-4 w-80 overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="text-white font-medium">Asistente SPID+</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-lg ${
                    inputValue.trim()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl mb-4 w-80 overflow-hidden border border-gray-200"
          >
            <button
              onClick={() => setIsMinimized(false)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-gray-700">Asistente SPID+</span>
              </div>
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isOpen && !isMinimized && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}; 