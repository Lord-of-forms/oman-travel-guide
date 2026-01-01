import React from 'react';
import ExperienceCard from './ExperienceCard';
import { motion, AnimatePresence } from 'framer-motion';

const ExperienceGrid = ({
    experiences,
    selectedIds,
    onToggleSelection,
    onDetailOpen,
    onRemove,
    ratings,
    onRate,
    viewMode = 'grid'
}) => {
    return (
        <div className={`experience-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            <AnimatePresence>
                {experiences.map((exp) => (
                    <ExperienceCard
                        key={exp.id}
                        experience={exp}
                        isSelected={selectedIds.includes(exp.id)}
                        onToggleSelection={onToggleSelection}
                        onClick={() => onDetailOpen(exp)}
                        onRemove={onRemove}
                        rating={ratings[exp.id] || 0}
                        onRate={onRate}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ExperienceGrid;
