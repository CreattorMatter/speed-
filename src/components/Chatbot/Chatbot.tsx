import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Building2, MapPin } from 'lucide-react';
import { getChatbotEmpresas, getChatbotSucursales, type Empresa, type Sucursal } from '../../lib/supabaseClient-chatbot';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  options?: {
    type: 'empresas' | 'sucursales';
    data: Empresa[] | Sucursal[];
  };
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
  'crear cartel': 'Para crear un cartel, puedes usar el botón "Cartel" en el dashboard para carteles físicos o "Cartel Digital" para carteles digitales.',
  'enviar cartel': 'Puedes enviar carteles a diferentes sucursales usando la función de envío en el editor de carteles, digital o físico.',
  'digital': 'Los carteles digitales se pueden crear y gestionar desde la sección "Cartel Digital" en el dashboard.',
  'plantilla': 'Puedes crear y gestionar plantillas usando el "Builder" en el dashboard.',
  'sucursal': '¿De qué empresa quieres consultar las sucursales?'
};

export const Chatbot: React.FC<ChatbotProps> = ({ userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  
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

    // Si el usuario está preguntando por sucursales
    if (inputValue.toLowerCase().includes('sucursal')) {
      try {
        const empresas = await getChatbotEmpresas();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: '¿De qué empresa quieres consultar las sucursales?',
          timestamp: new Date(),
          options: {
            type: 'empresas',
            data: empresas
          }
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error al obtener empresas:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'Lo siento, hubo un error al obtener las empresas. Por favor, intenta más tarde.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // Respuesta normal del bot
      setTimeout(() => {
        const botResponse = generateBotResponse(inputValue.toLowerCase());
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: botResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
    setIsTyping(false);
  };

  const handleEmpresaClick = async (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setIsTyping(true);

    try {
      const sucursales = await getChatbotSucursales(empresa.id);
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: `Aquí están las sucursales de ${empresa.nombre}:`,
        timestamp: new Date(),
        options: {
          type: 'sucursales',
          data: sucursales
        }
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: 'Lo siento, hubo un error al obtener las sucursales. Por favor, intenta más tarde.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsTyping(false);
  };

  const generateBotResponse = (input: string): string => {
    // Buscar coincidencias en el FAQ
    for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
      if (input.includes(keyword)) {
        return response;
      }
    }

    // Respuesta por defecto
    return 'Lo siento, no entiendo tu pregunta. Puedes preguntarme sobre "crear cartel", "enviar cartel", "digital", "plantilla", "sucursal", "ayuda"';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.options) {
      if (message.options.type === 'empresas') {
        return (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(message.options.data as Empresa[]).map((empresa) => (
              <button
                key={empresa.id}
                onClick={() => handleEmpresaClick(empresa)}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>{empresa.nombre}</span>
              </button>
            ))}
          </div>
        );
      } else if (message.options.type === 'sucursales') {
        return (
          <div className="space-y-2 mt-2">
            {(message.options.data as Sucursal[]).map((sucursal) => (
              <div
                key={sucursal.id}
                className="p-3 rounded-lg bg-white/10"
              >
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>{sucursal.nombre}</span>
                </div>
                <div className="mt-1 text-sm opacity-80">
                  <p>{sucursal.direccion}</p>
                  <p>Tel: {sucursal.telefono}</p>
                  <p>Horario: {sucursal.horario}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
    return <p className="text-sm">{message.text}</p>;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl mb-4 w-96 overflow-hidden border border-gray-200"
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
                    {renderMessageContent(message)}
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