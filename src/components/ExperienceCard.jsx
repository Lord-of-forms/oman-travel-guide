import React from 'react';
import { MapPin, Check, Trash2, Star, Mountain, Waves, Landmark, TreePalm, Tent, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sharePlace } from '../utils/sharing';

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
        default: return <MapPin size={size} />;
    }
};

const ExperienceCard = ({
    experience,
    onClick,
    isSelected,
    onToggleSelection,
    onRemove,
    rating = 0,
    onRate,
    destination,
}) => {
    const categoryClass = experience.category ? `placeholder-${experience.category.toLowerCase()}` : '';

    const handleShare = async (e) => {
        e.stopPropagation();
        await sharePlace(experience, destination);
    };

    return (
        <motion.div
            className={`card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="card-image-wrapper">
                {experience.image ? (
                    <img src={experience.image} alt={experience.title} className="card-image" />
                ) : (
                    <div className={`card-image-placeholder ${categoryClass}`}>
                        <CategoryIcon category={experience.category} size={32} />
                        <span>{experience.category}</span>
                    </div>
                )}

                <div className="card-overlay-gradient" />

                {/* AI Badge only for custom places or placeholders */}
                {(!experience.image || experience.id.toString().startsWith('custom')) && (
                    <div className="ai-badge">Symbolbild (KI-generiert)</div>
                )}

                <div className="card-header">
                    <span className="location">
                        <MapPin size={12} style={{ marginRight: '4px' }} />
                        {experience.location}
                    </span>

                    <button
                        className="remove-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(experience.id);
                        }}
                        title="Von der Übersicht entfernen"
                    >
                        <Trash2 size={12} />
                    </button>

                    <button
                        className="remove-btn share-card-btn"
                        onClick={handleShare}
                        title="Teilen"
                        style={{ marginRight: '2px' }}
                    >
                        <Share2 size={12} />
                    </button>

                    <button
                        className={`selection-indicator ${isSelected ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelection(experience.id);
                        }}
                    >
                        {isSelected && <Check size={16} />}
                    </button>
                </div>
            </div>

            <div className="card-content">
                <span className="category-tag">{experience.category}</span>
                <h3>{experience.title}</h3>

                <div className="rating-stars" onClick={(e) => e.stopPropagation()}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            size={14}
                            className={`star ${rating >= s ? 'active' : ''}`}
                            fill={rating >= s ? "currentColor" : "none"}
                            onClick={() => onRate(experience.id, s)}
                        />
                    ))}
                </div>

                <p style={{ marginTop: '0.8rem' }}>{experience.shortDescription}</p>

                <div className="tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                    {(experience.tags || []).slice(0, 3).map((tag, idx) => (
                        <span key={tag} className="tag" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            {tag}{idx < Math.min((experience.tags || []).length, 3) - 1 ? '' : ''}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ExperienceCard;
