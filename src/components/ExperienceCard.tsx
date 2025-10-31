import React from 'react';
import { Experience } from '@/types/experience';

interface ExperienceCardProps {
  experience: Experience;
  onViewDetails?: (experienceId: string) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ 
  experience, 
  onViewDetails 
}) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(experience.id);
    }
  };

  return (
    <article className="flex w-[280px] flex-col items-start overflow-hidden bg-[#F0F0F0] rounded-xl max-sm:w-full">
      <img
        src={experience.image}
        alt={experience.altText || `${experience.title} experience`}
        className="h-[170px] w-full object-cover"
      />
      <div className="flex flex-col items-start gap-5 w-full box-border px-4 py-3">
        <div className="flex flex-col items-start gap-3 w-full">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-[#161616] text-base font-medium leading-5">
              {experience.title}
            </h3>
            <div className="flex justify-center items-center gap-2.5 rounded bg-[#D6D6D6] px-2 py-1">
              <span className="text-[#161616] text-[11px] font-medium leading-4">
                {experience.location}
              </span>
            </div>
          </div>
          <p className="w-full text-[#6C6C6C] text-xs font-normal leading-4">
            {experience.description}
          </p>
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5">
            <span className="text-[#161616] text-xs font-normal leading-4">
              From
            </span>
            <span className="text-[#161616] text-xl font-medium leading-6">
              ₹{experience.price}
            </span>
          </div>
          <button
            onClick={handleViewDetails}
            className="flex justify-center items-center gap-2.5 rounded cursor-pointer bg-[#FFD643] px-2 py-1.5 hover:bg-[#FFD643]/90 transition-colors"
          >
            <span className="text-[#161616] text-sm font-medium leading-[18px]">
              View Details
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
