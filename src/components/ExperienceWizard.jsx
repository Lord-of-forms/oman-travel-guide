import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Compass, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ExperienceWizard = ({ onClose, onDiscoveryComplete, apiKey, selectedModel = "gemini-3-flash-preview", destination = { name: 'Oman', country: 'Oman' } }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: `Hallo! Ich bin dein ${destination.name}-Entdecker. Lass uns in 4 schnellen Schritten Geheimtipps finden.\n\n**Schritt 1:** Welches Terrain reizt dich am meisten?`, options: ["Wüste & Dünen", "Gebirge & Canyons", "Wadis & Oasen", "Küsten & Strände"] }
    ]);
    const [history, setHistory] = useState([]); // To track previous states for "Back"
    const [isLoading, setIsLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    const [isGeneratingPlaces, setIsGeneratingPlaces] = useState(false);
    const [statusText, setStatusText] = useState('Analysiere deine Vorlieben...');
    const scrollRef = useRef(null);

    const statusMessages = [
        "Analysiere deine Vorlieben...", "Durchsuche Satellitendaten...", "Frage lokale Guides an...",
        "Prüfe Erreichbarkeit...", "Generiere exklusive Geheimtipps...", "Erstelle Reiseprofile..."
    ];

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        let interval;
        if (isGeneratingPlaces) {
            let i = 0;
            interval = setInterval(() => {
                i = (i + 1) % statusMessages.length;
                setStatusText(statusMessages[i]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isGeneratingPlaces]);

    const handleAnswer = async (answer) => {
        if (!apiKey || isLoading) return;

        // Save current state to history
        setHistory(prev => [...prev, { messages, questionCount }]);

        const userMsg = { role: 'user', content: answer };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const newCount = questionCount + 1;
        setQuestionCount(newCount);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: selectedModel,
                systemInstruction: `Du bist ein erfahrener ${destination.name}-Reise-Guide. Antworte IMMER im JSON-Format für Fragen. ${destination.aiLanguageInstruction || 'Antworte IMMER auf Deutsch.'} Für Schritt 2-4: Gib ein JSON { "text": "Deine Frage", "options": ["Option 1", "Option 2", ...] } zurück. Kurz und präzise.`
            });

            if (newCount <= 4) {
                const prompt = `Bisheriger Verlauf: ${JSON.stringify(messages)}\nNutzer wählte: ${answer}\nStelle die ${newCount}. Frage. Gib NUR JSON zurück: { "text": "Frage", "options": ["A", "B", "C"] }`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                let rawText = response.text().trim().replace(/```json|```/g, "").trim();

                try {
                    const data = JSON.parse(rawText);
                    setMessages(prev => [...prev, { role: 'ai', content: data.text, options: data.options }]);
                } catch (e) {
                    // Fallback if AI doesn't send JSON
                    setMessages(prev => [...prev, { role: 'ai', content: "Was interessiert dich als Nächstes?", options: ["Kultur & Geschichte", "Outdoor & Action", "Entspannung"] }]);
                }
            } else {
                setIsGeneratingPlaces(true);
                const discoveryPrompt = `Präferenzen: ${JSON.stringify([...messages, userMsg])}\nFinde 4 authentische, spezifische Geheimtipps in ${destination.name} (${destination.country}). 
                ANTWORTE NUR MIT EINEM JSON-ARRAY: [{ "title": "...", "location": "...", "category": "...", "country": "${destination.country}", "shortDescription": "...", "longDescription": "...", "tags": [], "highlights": [] }]`;

                const result = await model.generateContent(discoveryPrompt);
                const response = await result.response;
                let text = response.text().trim().replace(/```json|```/g, "").trim();

                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (!jsonMatch) throw new Error("Kein gültiges Ziel-JSON gefunden.");

                const newPlaces = JSON.parse(jsonMatch[0]).map(p => ({ ...p, id: `wizard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }));
                onDiscoveryComplete(newPlaces);
                onClose();
            }
        } catch (error) {
            console.error("Wizard Error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Ein kleiner Sandsturm... Bitte versuche es erneut.", options: ["Nochmal versuchen"] }]);
            setQuestionCount(prev => prev - 1); // Allow retry
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        setMessages(lastState.messages);
        setQuestionCount(lastState.questionCount);
        setHistory(prev => prev.slice(0, -1));
    };

    return (
        <div className="wizard-overlay" onClick={() => !isLoading && onClose()}>
            <motion.div
                className="wizard-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '600px', width: '90%' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="wizard-step-indicator">
                        {questionCount <= 4 ? `SCHRITT ${questionCount} von 4` : 'ENTDECKUNGSREISE...'}
                    </div>
                    <button className="restore-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="wizard-chat" ref={scrollRef} style={{ maxHeight: '400px', marginBottom: '1.5rem' }}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.role}`}>
                            <div className="message-content" style={{ fontSize: '1rem' }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && !isGeneratingPlaces && (
                        <div className="message ai loading">
                            <Loader2 className="animate-spin" size={24} color="var(--accent-gold)" />
                        </div>
                    )}
                </div>

                {isGeneratingPlaces ? (
                    <div className="wizard-loading-overlay" style={{ padding: '2rem' }}>
                        <div className="pulsing-compass"><Compass size={60} color="var(--accent-gold)" /></div>
                        <h3 style={{ marginTop: '1.5rem' }}>{statusText}</h3>
                    </div>
                ) : (
                    <div className="wizard-options-container">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {messages[messages.length - 1]?.options?.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className="plan-btn"
                                    style={{ textAlign: 'left', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={isLoading}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', marginTop: '1.5rem', gap: '1rem' }}>
                            {history.length > 0 && (
                                <button className="secondary-btn" onClick={goBack} disabled={isLoading} style={{ flex: 1 }}>
                                    Zurück
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ExperienceWizard;
