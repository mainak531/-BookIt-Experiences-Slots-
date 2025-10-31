import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ExperienceGrid } from "@/components/ExperienceGrid";
import type { Experience } from "@/types/experience";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Index = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/experiences`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch experiences');
        return res.json();
      })
      .then((data: Experience[]) => {
        if (controller.signal.aborted) return;
        setExperiences(data);
        setFilteredExperiences(data);
        setLoading(false);
      })
      .catch(err => {
        if (err && (err.name === 'AbortError' || err.code === 'ABORT_ERR')) return;
        setError(err?.message ?? 'Failed to fetch experiences');
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredExperiences(experiences);
      return;
    }
    const filtered = experiences.filter(
      (experience) =>
        experience.title.toLowerCase().includes(query.toLowerCase()) ||
        experience.location.toLowerCase().includes(query.toLowerCase()) ||
        experience.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExperiences(filtered);
  };

  const handleViewDetails = (experienceId: string) => {
    navigate(`/experience/${experienceId}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F9F9F9]">
      <Header onSearch={handleSearch} />
      <main>
        {loading && <div className="p-12 text-center">Loading experiences...</div>}
        {error && <div className="p-12 text-center text-red-600">{error}</div>}
        {!loading && !error && (
          <ExperienceGrid 
            experiences={filteredExperiences} 
            onViewDetails={handleViewDetails}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
