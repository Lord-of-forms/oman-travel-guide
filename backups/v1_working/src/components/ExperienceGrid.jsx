import React from 'react';
import ExperienceCard from './ExperienceCard';
import { motion } from 'framer-motion';

const ExperienceGrid = ({ experiences, onSelect }) => {
    return (
        <motion.div
            className="experience-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {experiences.map((exp) => (
                <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    onClick={() => onSelect(exp)}
                />
            ))}
        </motion.div>
    );
};

export default ExperienceGrid;
