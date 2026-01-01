import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Info, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const ExperienceDetail = ({ experience, onClose, apiKey }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    const suggestedQuestions = [
        "Wie komme ich dorthin?",
        "Beste Reisezeit?",
        "Was sollte ich einpacken?",
        "Gibt es Gefahren?",
        "Gute Campingplätze in der Nähe?"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (textOverride) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim() || !apiKey) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
                systemInstruction: "Du bist ein erfahrener Reiseführer für den Oman. Antworte IMMER auf Deutsch. Verwende Markdown für die Formatierung (Überschriften, Listen, Fettdruck). Sei präzise und gib Geheimtipps."
            });

            const prompt = `Kontext: ${experience.title} in ${experience.location}.
      Beschreibung: ${experience.longDescription}
      Highlights: ${experience.highlights.join(", ")}
      
      Benutzerfrage: ${textToSend}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'ai', content: text }]);
        } catch (error) {
            console.error("Gemini Error:", error);
            let errorMsg = "Fehler bei der Verbindung.";
            const msg = error.message || String(error);

            if (msg.includes("API_KEY_INVALID")) {
                errorMsg = "Ungültiger API-Key. Bitte prüfen Sie die Eingabe oben rechts.";
            } else if (msg.includes("fetch")) {
                errorMsg = "Netzwerkfehler. Prüfen Sie Ihre Internetverbindung oder Firewall.";
            } else if (msg.includes("quota")) {
                errorMsg = "API-Limit erreicht (Quota).";
            } else {
                errorMsg = `Verbindungsfehler: ${msg.substring(0, 50)}...`;
            }

            setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose} title="Schließen">
                    <X size={20} />
                </button>

                <div className="modal-body">
                    {/* Linke Seite: Informationen */}
                    <div className="content-info">
                        <div className="experience-header">
                            <span className="location">{experience.location}</span>
                            <h2>{experience.title}</h2>
                        </div>

                        <p className="long-description">{experience.longDescription}</p>

                        <div className="highlights-box">
                            <h3>Highlights</h3>
                            <ul>
                                {experience.highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="info-footer">
                            <Info size={16} />
                            <span>Dieser Ort ist Teil der "Oman Unentdeckt" Kollektion.</span>
                        </div>
                    </div>

                    {/* Rechte Seite: Chat */}
                    <div className="chat-section">
                        <div className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageSquare size={18} color="#d4af37" />
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Reise-Assistent</h3>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Fragen Sie nach Details zur Planung Ihrer Reise.
                            </p>
                        </div>

                        <div className="chat-messages" ref={scrollRef}>
                            {messages.length === 0 && (
                                <div className="empty-chat">
                                    <Sparkles size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p>Bereit für Ihre Fragen zu {experience.title}...</p>
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.role}`}>
                                    <div className="markdown-content">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message ai loading">
                                    <Loader2 className="animate-spin" size={20} color="#d4af37" />
                                </div>
                            )}
                        </div>

                        <div className="suggested-questions">
                            {messages.length === 0 && suggestedQuestions.map((q, i) => (
                                <button key={i} className="chip" onClick={() => handleSend(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>

                        {!apiKey && (
                            <div className="api-warning">
                                ⚠️ API-Key fehlt. Bitte oben rechts eingeben.
                            </div>
                        )}

                        <div className="chat-input-container">
                            <input
                                type="text"
                                placeholder="Nachricht senden..."
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                disabled={!apiKey || isLoading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!apiKey || isLoading || !inputValue.trim()}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ExperienceDetail;
