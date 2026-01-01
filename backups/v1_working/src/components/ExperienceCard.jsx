import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ExperienceCard = ({ experience, onClick }) => {
    return (
        <motion.div
            className="card"
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="card-header">
                <span className="location">
                    <MapPin size={14} style={{ marginRight: '4px' }} />
                    {experience.location}
                </span>
                <ArrowUpRight size={20} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.5 }} />
            </div>
            <h3>{experience.title}</h3>
            <p>{experience.shortDescription}</p>
            <div className="tags">
                {experience.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                ))}
            </div>
        </motion.div>
    );
};

export default ExperienceCard;
