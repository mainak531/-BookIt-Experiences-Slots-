import React from 'react';
import { ExperienceCard } from './ExperienceCard';
import { Experience } from '@/types/experience';

interface ExperienceGridProps {
  experiences: Experience[];
  onViewDetails?: (experienceId: string) => void;
}

export const ExperienceGrid: React.FC<ExperienceGridProps> = ({ 
  experiences, 
  onViewDetails 
}) => {
  return (
    <section className="grid grid-cols-[repeat(4,280px)] gap-8 justify-center px-[124px] py-12 max-md:grid-cols-[repeat(2,280px)] max-md:gap-6 max-md:p-8 max-sm:grid-cols-[1fr] max-sm:gap-4 max-sm:p-4">
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          onViewDetails={onViewDetails}
        />
      ))}
    </section>
  );
};
