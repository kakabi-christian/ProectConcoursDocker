import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import AiService from '../services/AiService';

export default function ChatComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider pour votre concours ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. Référence essentielle pour éviter l'erreur findDOMNode
  const nodeRef = useRef(null);
  const scrollRef = useRef(null);

  const colorGreen = '#25963F';
  const colorBlue = '#1E90FF';

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const storedUser = localStorage.getItem('user'); 
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const userId = userData?.id || localStorage.getItem('userId');

    const userMsg = { role: 'user', content: message };
    setChatHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const data = await AiService.sendMessage(message, userId);
      const aiMsg = { role: 'assistant', content: data.reply };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { 
        role: 'assistant', 
        content: "Désolé, je rencontre une difficulté technique. Veuillez réessayer." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Draggable 
      nodeRef={nodeRef} 
      handle=".drag-handle" // Seules les zones avec cette classe permettent le déplacement
      bounds="body"       // Empêche de sortir de l'écran
    >
      <div 
        ref={nodeRef} 
        className="position-fixed bottom-0 end-0 m-4" 
        style={{ zIndex: 1050, width: 'fit-content' }}
      >
        {isOpen && (
          <div className="card shadow-lg border-0 mb-3" style={{ width: '320px', height: '450px', borderRadius: '15px' }}>
            {/* Header : Zone de déplacement (drag-handle) */}
            <div className="card-header drag-handle d-flex justify-content-between align-items-center text-white" 
                 style={{ backgroundColor: colorBlue, borderTopLeftRadius: '15px', borderTopRightRadius: '15px', cursor: 'move' }}>
              <h6 className="mb-0">🤖 Assistant Concours</h6>
              <button type="button" className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
            </div>

            <div className="card-body overflow-auto bg-light" ref={scrollRef} style={{ height: '300px' }}>
              {chatHistory.map((msg, index) => (
                <div key={index} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className="p-2 rounded-3 shadow-sm" 
                       style={{ 
                          maxWidth: '85%', 
                          backgroundColor: msg.role === 'user' ? colorGreen : '#ffffff',
                          color: msg.role === 'user' ? '#ffffff' : '#333',
                          fontSize: '0.9rem'
                       }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-muted small italic">
                  <span className="spinner-grow spinner-grow-sm me-1" role="status"></span>
                  Analyse en cours...
                </div>
              )}
            </div>

            <div className="card-footer bg-white border-0">
              <form onSubmit={handleSendMessage} className="input-group">
                <input
                  type="text"
                  className="form-control form-control-sm border-0 bg-light shadow-none"
                  placeholder="Posez votre question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ borderRadius: '20px 0 0 20px' }}
                />
                <button className="btn text-white px-3" type="submit" disabled={isLoading}
                        style={{ backgroundColor: colorBlue, borderRadius: '0 20px 20px 0' }}>
                  ➤
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Bouton : Également zone de déplacement si fermé */}
        <div className="d-flex justify-content-end drag-handle" style={{ cursor: 'move' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn shadow-lg rounded-circle d-flex align-items-center justify-content-center border-0"
            style={{ width: '60px', height: '60px', backgroundColor: colorGreen, color: 'white', fontSize: '24px' }}
          >
            {isOpen ? '✕' : '💬'}
          </button>
        </div>
      </div>
    </Draggable>
  );
}