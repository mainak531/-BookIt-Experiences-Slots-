import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { z } from 'zod';
import { BookingDetails } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const checkoutSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Full name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  promoCode: z.string().trim().max(50, { message: "Promo code must be less than 50 characters" }).optional(),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and safety policy" })
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const bookingDetails = location.state as BookingDetails | undefined;

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    promoCode: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoResult, setPromoResult] = useState<{ valid: boolean; type?: string; value?: number; message?: string } | null>(null);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#161616] mb-4">No booking details found</p>
          <button
            onClick={() => navigate('/')}
            className="text-[#161616] underline hover:opacity-70"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleApplyPromo = async () => {
    if (!formData.promoCode?.trim()) return;
    setApplyingPromo(true);
    setPromoResult(null);
    try {
      const res = await fetch(`${API_BASE}/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode: formData.promoCode })
      });
      const data = await res.json();
      if (data.valid) {
        setPromoResult({ valid: true, type: data.discount_type, value: data.discount_value });
        toast({ title: "Promo code applied", description: `Discount: ${data.discount_type === 'percent' ? `${data.discount_value}%` : `₹${data.discount_value}`}` });
      } else {
        setPromoResult({ valid: false, message: data.message || 'Invalid promo code' });
        toast({ title: "Promo code", description: data.message || 'Invalid promo code', variant: "destructive" });
      }
    } catch (e) {
      setPromoResult({ valid: false, message: 'Unable to validate promo code.' });
      toast({ title: "Promo code", description: 'Unable to validate promo code.', variant: "destructive" });
    }
    setApplyingPromo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = checkoutSchema.parse(formData);
      if (!bookingDetails.slotId) throw new Error('SlotId missing');
      const bookingPayload = {
        experienceId: bookingDetails.experienceId,
        slotId: bookingDetails.slotId,
        fullName: validatedData.fullName,
        email: validatedData.email,
        quantity: bookingDetails.quantity,
        promoCode: formData.promoCode,
        price: bookingDetails.price,
        subtotal: bookingDetails.subtotal,
        taxes: bookingDetails.taxes,
        total: bookingDetails.total,
      };
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = await res.json();
      if (res.ok && data.bookingId) {
        navigate('/confirmation', {
          state: {
            bookingId: data.bookingId,
            experienceTitle: bookingDetails.experienceTitle,
            date: bookingDetails.date,
            time: bookingDetails.time
          }
        });
      } else {
        toast({ title: "Booking Failed", description: data.error || 'Booking could not be completed', variant: "destructive" });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CheckoutFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="max-w-[1192px] mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-[#161616] hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Checkout</span>
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6C6C6C] text-xs mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your name"
                    className={`w-full bg-[#EDEDED] px-4 py-3 rounded text-sm text-[#161616] placeholder:text-[#A0A0A0] outline-none focus:ring-2 focus:ring-[#FFD643] ${errors.fullName ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#6C6C6C] text-xs mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Your email"
                    className={`w-full bg-[#EDEDED] px-4 py-3 rounded text-sm text-[#161616] placeholder:text-[#A0A0A0] outline-none focus:ring-2 focus:ring-[#FFD643] ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[#6C6C6C] text-xs mb-2">
                  Promo code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => handleInputChange('promoCode', e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 bg-[#EDEDED] px-4 py-3 rounded text-sm text-[#161616] placeholder:text-[#A0A0A0] outline-none focus:ring-2 focus:ring-[#FFD643]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={applyingPromo}
                    className="bg-[#161616] text-white px-6 py-3 rounded text-sm font-medium hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
                  >
                    {applyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {promoResult && !promoResult.valid && (
                  <p className="text-red-500 text-xs mt-1">{promoResult.message}</p>
                )}
                {promoResult && promoResult.valid && (
                  <p className="text-green-600 text-xs mt-1">Promo applied: {promoResult.type === 'percent' ? `${promoResult.value}%` : `₹${promoResult.value}`}</p>
                )}
              </div>
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[#A0A0A0] text-[#FFD643] focus:ring-[#FFD643]"
                  />
                  <span className="text-[#6C6C6C] text-sm">
                    I agree to the terms and safety policy
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
                )}
              </div>
            </form>
          </div>
          {/* Order summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg shadow-[0_2px_16px_0_rgba(0,0,0,0.10)] p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6C6C6C]">Experience</span>
                  <span className="text-[#161616] font-medium">{bookingDetails.experienceTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C6C6C]">Date</span>
                  <span className="text-[#161616]">{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C6C6C]">Time</span>
                  <span className="text-[#161616]">{bookingDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C6C6C]">Qty</span>
                  <span className="text-[#161616]">{bookingDetails.quantity}</span>
                </div>
              </div>
              <div className="border-t border-[#E0E0E0] pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6C6C6C]">Subtotal</span>
                  <span className="text-[#161616]">₹{bookingDetails.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C6C6C]">Taxes</span>
                  <span className="text-[#161616]">₹{bookingDetails.taxes}</span>
                </div>
              </div>
              <div className="border-t border-[#E0E0E0] pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#161616] text-base font-medium">Total</span>
                  <span className="text-[#161616] text-xl font-medium">₹{bookingDetails.total}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#FFD643] text-[#161616] py-3 rounded-lg text-sm font-medium hover:bg-[#FFD643]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Pay and Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
