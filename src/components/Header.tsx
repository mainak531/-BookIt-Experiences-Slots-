import React, { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="flex w-full justify-between items-center shadow-[0_2px_16px_0_rgba(0,0,0,0.10)] h-[87px] box-border bg-[#F9F9F9] px-[124px] py-4 max-md:px-8 max-md:py-4 max-sm:flex-col max-sm:gap-4 max-sm:h-auto max-sm:p-4">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/c8d53a9b0bd33d950dd56acebaf9867c72220ede?width=200"
        alt="Travel Experience Platform Logo"
        className="w-[100px] h-[55px] shrink-0"
      />
      <form onSubmit={handleSubmit} className="flex items-center gap-4 max-sm:w-full max-sm:flex-col">
        <div className="flex w-[340px] items-center gap-2.5 rounded box-border bg-[#EDEDED] px-4 py-3 max-sm:w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences"
            className="w-full bg-transparent text-[#727272] text-sm font-normal leading-[18px] outline-none placeholder:text-[#727272]"
          />
        </div>
        <button
          type="submit"
          className="flex justify-center items-center gap-2.5 cursor-pointer bg-[#FFD643] px-5 py-3 rounded-lg hover:bg-[#FFD643]/90 transition-colors"
        >
          <span className="text-[#161616] text-sm font-medium leading-[18px]">
            Search
          </span>
        </button>
      </form>
    </header>
  );
};
