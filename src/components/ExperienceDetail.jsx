import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Info, MessageSquare, Map as MapIcon, Mountain, Waves, Landmark, TreePalm, Tent, Check, Plus, Star, Share2, Mail, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import { shareViaWhatsApp, shareViaEmail, copyToClipboard, generatePlaceShareText } from '../utils/sharing';

const ExperienceDetail = ({
    experience,
    onClose,
    apiKey,
    selectedModel = "gemini-3-flash-preview",
    onToggleSelection,
    isSelected,
    rating = 0,
    onRate,
    duration = 1,
    onDurationChange,
    note = "",
    onNoteChange,
    destination = { name: 'Oman', country: 'Oman' }
}) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const scrollRef = useRef(null);

    // Support both legacy string notes and new {text, updatedAt} format
    const noteText = typeof note === 'object' && note !== null ? (note.text || '') : (note || '');
    const noteUpdatedAt = typeof note === 'object' && note !== null ? note.updatedAt : null;

    const handleNoteChange = (id, value) => {
        onNoteChange(id, { text: value, updatedAt: new Date().toISOString() });
    };

    const handleCopyShareLink = async () => {
        const text = generatePlaceShareText(experience, destination);
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(experience.title + ' ' + experience.location)}`;
        await copyToClipboard(`${text}\n${url}`);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

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
                model: selectedModel,
                systemInstruction: `Du bist ein erfahrener Reiseführer für ${destination.name}. Antworte IMMER auf Deutsch. Verwende Markdown für die Formatierung (Überschriften, Listen, Fettdruck). Sei präzise und gib Geheimtipps.`
            });

            const prompt = `Kontext: ${experience.title} in ${experience.location}.
      Beschreibung: ${experience.longDescription}
      Highlights: ${(experience.highlights || []).join(", ")}
      
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const CategoryIcon = ({ category, size = 24 }) => {
        switch (category?.toLowerCase()) {
            case 'wüste':
            case 'desert':
                return <Tent size={size} />;
            case 'wasser':
            case 'water':
                return <Waves size={size} />;
            case 'gebirge':
            case 'mountain':
            case 'mountains':
                return <Mountain size={size} />;
            case 'kultur':
            case 'culture':
            case 'history':
                return <Landmark size={size} />;
            case 'küste':
            case 'coast':
            case 'beach':
                return <TreePalm size={size} />;
            default: return <Sparkles size={size} />;
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

                <div className="modal-body detail-content">
                    {/* Image Section */}
                    <div className="image-section">
                        {experience.image ? (
                            <img src={experience.image} alt={experience.title} className="detail-hero-image" />
                        ) : (
                            <div className={`card-image-placeholder placeholder-${experience.category?.toLowerCase()}`} style={{ borderRadius: 0, height: '100%' }}>
                                <CategoryIcon category={experience.category} size={48} />
                                <span style={{ marginTop: '1rem', opacity: 0.5 }}>{experience.category}</span>
                            </div>
                        )}
                        <div className="ai-badge">Symbolbild (KI-generiert)</div>
                    </div>

                    {/* Info Section */}
                    <div className="info-section">
                        <div className="experience-header">
                            <span className="location">{experience.location}</span>
                            <h2>{experience.title}</h2>
                        </div>

                        <p className="long-description">{experience.longDescription}</p>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(experience.title + ' ' + experience.location + ' ' + (experience.country || destination.country || ''))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="maps-link"
                                style={{ margin: 0, flex: 1, display: 'flex', justifyContent: 'center' }}
                            >
                                <MapIcon size={16} /> In Google Maps öffnen
                            </a>
                            <button
                                className={`plan-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => onToggleSelection(experience.id)}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    fontSize: '0.9rem',
                                    background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'var(--accent-gold)',
                                    color: isSelected ? 'var(--accent-gold)' : 'black',
                                    border: isSelected ? '1px solid var(--accent-gold)' : 'none'
                                }}
                            >
                                {isSelected ? <Check size={18} /> : <Plus size={18} />}
                                {isSelected ? 'Im Planer' : 'In den Planer'}
                            </button>
                        </div>

                        <div className="planner-controls-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '15px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ihre Bewertung:</span>
                                <div className="rating-stars" style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={20}
                                            className={`star ${rating >= s ? 'active' : ''}`}
                                            fill={rating >= s ? "var(--accent-gold)" : "none"}
                                            style={{ cursor: 'pointer', color: rating >= s ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)' }}
                                            onClick={() => onRate(experience.id, s)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Geplante Tage:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        value={duration}
                                        onChange={(e) => onDurationChange(experience.id, parseFloat(e.target.value))}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            width: '60px',
                                            padding: '4px 8px',
                                            textAlign: 'center'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Tage</span>
                                </div>
                            </div>
                        </div>

                        <div className="highlights-box">
                            <h3>Highlights</h3>
                            <ul>
                                {(experience.highlights || []).map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="notes-box" style={{ marginTop: '2rem' }}>
                            <h3>Spezifische Hinweise (für KI-Plan)</h3>
                            <textarea
                                value={noteText}
                                onChange={(e) => handleNoteChange(experience.id, e.target.value)}
                                placeholder="Fügen Sie hier spezielle Wünsche oder Erkenntnisse aus dem Chat ein..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    background: 'rgba(255,165,0,0.05)',
                                    border: '1px solid rgba(212,175,55,0.3)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                }}
                            />
                            {noteUpdatedAt && (
                                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.4rem' }}>
                                    Zuletzt bearbeitet: {new Date(noteUpdatedAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                            )}
                        </div>

                        {/* Share section */}
                        <div className="share-section" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Share2 size={14} /> Teilen
                            </h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    className="secondary-btn"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                    onClick={() => shareViaWhatsApp(generatePlaceShareText(experience, destination))}
                                >
                                    <Share2 size={13} /> WhatsApp
                                </button>
                                <button
                                    className="secondary-btn"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                    onClick={() => shareViaEmail(experience.title, generatePlaceShareText(experience, destination))}
                                >
                                    <Mail size={13} /> E-Mail
                                </button>
                                <button
                                    className="secondary-btn"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', color: shareCopied ? 'var(--accent-gold)' : undefined }}
                                    onClick={handleCopyShareLink}
                                >
                                    <Copy size={13} /> {shareCopied ? 'Kopiert!' : 'Link kopieren'}
                                </button>
                            </div>
                        </div>

                        <div className="info-footer">
                            <Info size={16} />
                            <span>Dieser Ort ist Teil der &quot;{destination.name}&quot; Kollektion.</span>
                        </div>
                    </div>

                    {/* Chat Section */}
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
                                    {msg.role === 'ai' && !isLoading && (
                                        <button
                                            className="secondary-btn mini"
                                            onClick={() => handleNoteChange(experience.id, msg.content.substring(0, 500))}
                                            style={{ marginTop: '0.5rem', fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                                        >
                                            <Check size={12} /> Als Notiz speichern
                                        </button>
                                    )}
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
                                <button key={i} className="chip" onClick={() => handleSend(q)} disabled={!apiKey || isLoading}>
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
                            <textarea
                                placeholder="Nachricht senden... (Shift+Enter für neue Zeile)"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
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
