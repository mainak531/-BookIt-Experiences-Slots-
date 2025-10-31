import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';

interface ConfirmationState {
  bookingId: string;
  experienceTitle?: string;
  date?: string;
  time?: string;
}

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmationData = location.state as ConfirmationState | undefined;

  // Generate booking ID if not provided
  const bookingId = confirmationData?.bookingId || 
    `HUF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-[#22C55E] rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#161616] text-3xl font-medium mb-3">
          Booking Confirmed
        </h1>

        {/* Reference ID */}
        <p className="text-[#6C6C6C] text-sm mb-8">
          Ref ID: {bookingId}
        </p>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="bg-[#EDEDED] text-[#161616] px-6 py-3 rounded text-sm font-medium hover:bg-[#E0E0E0] transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
