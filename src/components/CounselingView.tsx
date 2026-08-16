import React, { useState, useEffect } from 'react';
import {
  CalendarHeart,
  Filter,
  Check,
  Clock,
  MapPin,
  Video,
  ShieldCheck,
  Star,
  Info,
  Calendar,
  X,
  AlertCircle,
  Eye,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Booking, Counselor, UserProfile } from '../types';
import { THEMES } from '../utils/theme';
import { supabase } from '../lib/supabase';

interface CounselingViewProps {
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onCancelBooking: (id: string) => void;
  userProfile: UserProfile;
}

export const CounselingView: React.FC<CounselingViewProps> = ({
  bookings,
  onAddBooking,
  onCancelBooking,
  userProfile,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;

  // Filter state
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);

  // Booking modal step state: 1: Select Time & Type, 2: Confirmation
  const [bookingStep, setBookingStep] = useState<number>(0); // 0 = closed, 1 = time, 2 = confirmed
  const [selectedDay, setSelectedDay] = useState<string>('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'In-Person Wellness Center' | 'Secure Video Call'>(
    'In-Person Wellness Center'
  );
  const [shareMoodTrend, setShareMoodTrend] = useState<boolean>(false);
  const [recentBookedSession, setRecentBookedSession] = useState<Booking | null>(null);
  const [showCounselorDataPreview, setShowCounselorDataPreview] = useState<boolean>(false);

  const specializations = [
    'all',
    'Academic Stress',
    'Exam Anxiety',
    'Identity & Transition',
    'Relationships',
    'Sleep & Insomnia',
    'Career Anxiety',
  ];

  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const { data, error } = await supabase
          .from('instructors')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedCounselors: Counselor[] = data.map(inst => ({
            id: inst.id,
            name: inst.name,
            title: inst.specialization || 'Campus Counselor',
            specializations: inst.specialization ? [inst.specialization, 'General Counseling'] : ['General Counseling'],
            photo: `https://api.dicebear.com/7.x/notionists/svg?seed=${inst.name}&backgroundColor=transparent`,
            availableDays: ['Today', 'Tomorrow', 'Next Week'],
            availableSlots: {
              'Today': ['2:00 PM', '4:30 PM'],
              'Tomorrow': ['9:00 AM', '11:30 AM', '3:00 PM'],
              'Next Week': ['10:00 AM', '1:00 PM', '4:00 PM'],
            },
            rating: 5.0,
            reviewCount: Math.floor(Math.random() * 50) + 10,
            badge: 'Instructor',
            experienceYears: 5,
            intro: inst.description || 'Dedicated to supporting your wellness journey.',
          }));
          setCounselors(mappedCounselors);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoadingCounselors(false);
      }
    };

    fetchInstructors();
  }, []);

  const filteredCounselors = counselors.filter(c => {
    if (selectedSpecialization === 'all') return true;
    return c.specializations.includes(selectedSpecialization);
  });

  const handleStartBooking = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    const firstDay = counselor.availableDays[0] || 'Tomorrow';
    setSelectedDay(firstDay);
    setSelectedSlot(counselor.availableSlots[firstDay]?.[0] || '');
    setBookingStep(1);
  };

  const handleConfirmBooking = () => {
    if (!selectedCounselor || !selectedSlot) return;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      counselorId: selectedCounselor.id,
      counselorName: selectedCounselor.name,
      counselorTitle: selectedCounselor.title,
      counselorPhoto: selectedCounselor.photo,
      date: selectedDay,
      time: selectedSlot,
      sessionType: selectedType,
      status: 'confirmed',
      shareMoodTrend,
      bookedAt: Date.now(),
    };

    onAddBooking(newBooking);
    setRecentBookedSession(newBooking);
    setBookingStep(2);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">
                Campus Counseling
              </h1>
              <p className="text-xs text-slate-500">
                Confidential, 1-on-1 student wellness appointments with campus providers.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCounselorDataPreview(true)}
          className="px-3.5 py-1.5 rounded-xl bg-white/80 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-500" />
          <span>What your counselor sees</span>
        </button>
      </div>

      {/* First-Time Booking Micro-Explainer (Blueprint Section 12) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200/70 text-slate-800 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-xs">
          <span className="font-bold text-emerald-950 block">
            What does a first campus session look like?
          </span>
          <p className="text-emerald-900 leading-relaxed">
            Your first 45-minute session is a warm, pressure-free chat. There is no diagnosis, judgment, or required homework — you set the pace, whether you want to vent about finals or learn actionable coping strategies.
          </p>
        </div>
      </div>

      {/* Active Bookings (if any) */}
      {bookings.filter(b => b.status === 'confirmed').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Your Upcoming Scheduled Sessions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings
              .filter(b => b.status === 'confirmed')
              .map(bk => (
                <div
                  key={bk.id}
                  className={`p-5 rounded-3xl ${currentTheme.cardBg} border border-emerald-200/80 shadow-md flex flex-col justify-between space-y-4`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={bk.counselorPhoto}
                      alt={bk.counselorName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{bk.counselorName}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Confirmed
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{bk.counselorTitle}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-3 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>
                        {bk.date} at {bk.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      {bk.sessionType === 'In-Person Wellness Center' ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Student Wellness Hall, Suite 304</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Secure Video Room Link sent to student email</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-400">
                      Mood trends: {bk.shareMoodTrend ? 'Shared' : 'Kept Private'}
                    </span>
                    <button
                      onClick={() => onCancelBooking(bk.id)}
                      className="px-3 py-1 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors"
                    >
                      Cancel / Reschedule
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Specialization Filter Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Filter by Provider Focus
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {specializations.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
                selectedSpecialization === spec
                  ? currentTheme.pillActive
                  : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Counselor Directory Grid */}
      {loadingCounselors ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#325343]"></div>
        </div>
      ) : filteredCounselors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCounselors.map((counselor) => (
            <div
              key={counselor.id}
              className={`rounded-3xl p-6 ${currentTheme.cardBg} border border-white/70 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition-all`}
            >
              <div className="space-y-3">
                {/* Header Profile */}
                <div className="flex items-start gap-4">
                  <img
                    src={counselor.photo}
                    alt={counselor.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold font-outfit text-slate-900 text-base">{counselor.name}</h3>
                    {counselor.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        {counselor.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{counselor.title}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {counselor.rating}
                    </span>
                    <span>· {counselor.experienceYears} yrs campus exp</span>
                  </div>
                </div>
              </div>

              {/* Specializations Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {counselor.specializations.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-700 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Intro quote */}
              <p className="text-xs text-slate-600 leading-relaxed bg-white/50 p-3 rounded-2xl border border-slate-100">
                "{counselor.intro}"
              </p>
            </div>

            {/* Availability & Book Action */}
            <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700 block">Next Available:</span>
                <span>{counselor.availableDays[0] || 'This Week'}</span>
              </div>

              <button
                id={`book-counselor-${counselor.id}`}
                onClick={() => handleStartBooking(counselor)}
                className={`py-2.5 px-5 rounded-2xl ${currentTheme.accentBg} text-xs font-bold shadow-xs hover:scale-[1.01] transition-all flex items-center gap-1.5`}
              >
                <span>Book 1-Tap Session</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="p-12 text-center text-slate-500 font-medium">
          No registered instructors available at this time.
        </div>
      )}

      {/* Booking Modal (Steps 1 & 2) */}
      {bookingStep > 0 && selectedCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div
            className={`relative w-full max-w-lg ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCounselor.photo}
                  alt={selectedCounselor.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-outfit">
                    Book with {selectedCounselor.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">Confidential campus consultation</p>
                </div>
              </div>
              <button
                onClick={() => setBookingStep(0)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {bookingStep === 1 ? (
                <>
                  {/* Select Day */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Choose Date
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedCounselor.availableDays.map(day => (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDay(day);
                            setSelectedSlot(selectedCounselor.availableSlots[day]?.[0] || '');
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            selectedDay === day
                              ? currentTheme.pillActive
                              : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Time Slot */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      2. Choose Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(selectedCounselor.availableSlots[selectedDay] || []).map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            selectedSlot === slot
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Session Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      3. Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedType('In-Person Wellness Center')}
                        className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                          selectedType === 'In-Person Wellness Center'
                            ? 'border-indigo-500 bg-indigo-50/80 font-bold text-indigo-950 ring-1 ring-indigo-500/30'
                            : 'border-slate-200 bg-white/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>In-Person</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">Wellness Hall Suite 304</p>
                      </button>

                      <button
                        onClick={() => setSelectedType('Secure Video Call')}
                        className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                          selectedType === 'Secure Video Call'
                            ? 'border-indigo-500 bg-indigo-50/80 font-bold text-indigo-950 ring-1 ring-indigo-500/30'
                            : 'border-slate-200 bg-white/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Video className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Secure Video</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">Private encrypted link</p>
                      </button>
                    </div>
                  </div>

                  {/* Privacy Toggle: Share recent mood trend */}
                  <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Share recent mood trend with provider?
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Helps counselor prepare. Default is private.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareMoodTrend}
                      onChange={e => setShareMoodTrend(e.target.checked)}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* CTA */}
                  <button
                    id="confirm-booking-btn"
                    disabled={!selectedSlot}
                    onClick={handleConfirmBooking}
                    className={`w-full py-3.5 px-6 rounded-2xl ${currentTheme.accentBg} text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50`}
                  >
                    <span>Confirm Confidential Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                /* Step 2: Confirmed Screen */
                <div className="py-6 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-outfit text-slate-900">
                      Your confidential session is booked.
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Confirmation details sent to your student portal.
                    </p>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-4 text-xs text-left space-y-2 border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Counselor:</span>
                      <span className="font-bold text-slate-800">{recentBookedSession?.counselorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time:</span>
                      <span className="font-bold text-slate-800">
                        {recentBookedSession?.date} at {recentBookedSession?.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Format:</span>
                      <span className="font-bold text-slate-800">{recentBookedSession?.sessionType}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingStep(0)}
                    className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* "What Your Counselor Sees" Transparency Modal (Blueprint Section 14) */}
      {showCounselorDataPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div
            className={`relative w-full max-w-md ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 p-6 space-y-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base font-outfit">
                  What Your Counselor Sees
                </h3>
              </div>
              <button
                onClick={() => setShowCounselorDataPreview(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              We believe concrete transparency beats a vague privacy link. Here is the exact data boundary:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Shared only upon booking:</strong> Your name, scheduled appointment slot, and session format preference.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Your Mood History & Check-Ins:</strong> Completely private. Never transmitted to counselors unless you check "Share recent mood trend".
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Your Personal Journal Entries:</strong> 100% encrypted & stored strictly on your local device. Counselors never receive raw journals.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCounselorDataPreview(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
