import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BookingDetails } from '@/types/booking';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Fetch experience and slots
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/experiences/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch experience');
        return res.json();
      })
      .then((data) => {
        setExperience(data);
        setAvailableSlots(data.slots || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Extract unique dates from slots
  const dates = Array.from(new Set(availableSlots.map(s => s.date)));
  // Available times for selected date
  const times = availableSlots.filter(s => s.date === selectedDate);

  useEffect(() => {
    // Auto-select first date and time if available upon load
    if (dates.length > 0 && !selectedDate) setSelectedDate(dates[0]);
  }, [dates, selectedDate]);
  useEffect(() => {
    if (times.length > 0 && !selectedTime) setSelectedTime(times[0].time);
  }, [times, selectedTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <p className="text-[#161616]">Loading...</p>
      </div>
    );
  }
  if (error || !experience) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <p className="text-[#161616]">{error || 'Experience not found'}</p>
      </div>
    );
  }

  // Find slot object for selected date/time
  const selectedSlot = availableSlots.find(s => s.date === selectedDate && s.time === selectedTime);

  const subtotal = experience.price * quantity;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  const handleConfirm = () => {
    const bookingDetails: BookingDetails = {
      experienceId: experience.id,
      experienceTitle: experience.title,
      date: selectedDate,
      time: selectedTime,
      quantity,
      price: experience.price,
      subtotal,
      taxes,
      total,
      slotId: selectedSlot ? selectedSlot.id : undefined // include slotId for backend
    } as any;
    navigate('/checkout', { state: bookingDetails });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="max-w-[1192px] mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 text-[#161616] hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Details</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left column - Experience details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-[#161616] text-3xl font-medium mb-4">
                {experience.title}
              </h1>
              <p className="text-[#6C6C6C] text-base leading-6">
                {experience.description} Helmet and Life jackets along with an expert will accompany in kayaking.
              </p>
            </div>
            {/* Choose date */}
            <div>
              <h2 className="text-[#161616] text-lg font-medium mb-3">
                Choose date
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                    className={`px-4 py-2 rounded whitespace-nowrap text-sm font-medium transition-colors ${selectedDate === date ? 'bg-[#FFD643] text-[#161616]' : 'bg-[#EDEDED] text-[#6C6C6C] hover:bg-[#E0E0E0]'}`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
            {/* Choose time */}
            <div>
              <h2 className="text-[#161616] text-lg font-medium mb-3">
                Choose time
              </h2>
              <div className="flex flex-wrap gap-2">
                {times.map((slot) => {
                  const isSoldOut = slot.slots_left === 0;
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => !isSoldOut && setSelectedTime(slot.time)}
                      disabled={isSoldOut}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors relative ${
                        isSelected && !isSoldOut ? 'bg-[#FFD643] text-[#161616]' : isSoldOut ? 'bg-[#EDEDED] text-[#A0A0A0] cursor-not-allowed' : 'bg-[#EDEDED] text-[#161616] hover:bg-[#E0E0E0]'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span>{slot.time}</span>
                        <span className={`text-[10px] ${isSoldOut ? 'text-[#A0A0A0]' : 'text-[#FF6B6B]'}`}>{isSoldOut ? 'Sold out' : `${slot.slots_left} left`}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[#6C6C6C] text-xs mt-2">
                All times are in IST (GMT +5:30)
              </p>
            </div>
            {/* About */}
            <div>
              <h2 className="text-[#161616] text-lg font-medium mb-3">
                About
              </h2>
              <div className="bg-[#F0F0F0] rounded-lg p-4">
                <p className="text-[#6C6C6C] text-sm">
                  Scenic routes, trained guides, and safety briefing. Minimum age 16.
                </p>
              </div>
            </div>
          </div>
          {/* Right column - Booking summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg shadow-[0_2px_16px_0_rgba(0,0,0,0.10)] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#6C6C6C] text-sm">Starts at</span>
                <span className="text-[#161616] text-lg font-medium">₹{experience.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6C6C6C] text-sm">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-6 h-6 flex items-center justify-center rounded bg-[#EDEDED] text-[#161616] hover:bg-[#E0E0E0] transition-colors"
                  >−</button>
                  <span className="text-[#161616] text-sm font-medium w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-[#EDEDED] text-[#161616] hover:bg-[#E0E0E0] transition-colors">
                    +
                  </button>
                </div>
              </div>
              <div className="border-t border-[#E0E0E0] pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#6C6C6C] text-sm">Subtotal</span>
                  <span className="text-[#161616] text-sm">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C6C6C] text-sm">Taxes</span>
                  <span className="text-[#161616] text-sm">₹{taxes}</span>
                </div>
              </div>
              <div className="border-t border-[#E0E0E0] pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#161616] text-base font-medium">Total</span>
                  <span className="text-[#161616] text-xl font-medium">₹{total}</span>
                </div>
                <button 
                  onClick={handleConfirm}
                  className="w-full bg-[#FFD643] text-[#161616] py-3 rounded-lg text-sm font-medium hover:bg-[#FFD643]/90 transition-colors"
                  disabled={!selectedSlot || selectedSlot.slots_left < quantity}
                >
                  {selectedSlot && selectedSlot.slots_left >= quantity ? 'Confirm' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;
