import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  Sparkles,
  Moon,
  Zap,
  Tag,
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { CheckInRecord, MoodFactor, UserProfile } from '../types';
import { MOOD_CONFIGS, ALL_MOOD_FACTORS } from '../constants/moods';
import { getLocalDateKey } from '../utils/date';
import { THEMES } from '../utils/theme';

interface MyPulseViewProps {
  checkIns: CheckInRecord[];
  userProfile: UserProfile;
  onOpenCheckIn: () => void;
}

type Period = '7d' | '30d' | 'semester';

export const MyPulseView: React.FC<MyPulseViewProps> = ({
  checkIns,
  userProfile,
  onOpenCheckIn,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;
  const [period, setPeriod] = useState<Period>('7d');
  const [selectedFactorFilter, setSelectedFactorFilter] = useState<string>('all');
  const [hoveredRecord, setHoveredRecord] = useState<CheckInRecord | null>(null);

  // Filter records by period
  const now = new Date();
  const dayLimit = period === '7d' ? 7 : period === '30d' ? 30 : 90;

  // Generate date slots for period
  const dateSlots: { dateStr: string; label: string; record?: CheckInRecord }[] = [];

  for (let i = dayLimit - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateKey(d);
    const label = d.toLocaleDateString('en-US', {
      weekday: period === '7d' ? 'short' : undefined,
      month: 'numeric',
      day: 'numeric',
    });

    const match = checkIns.find(c => c.dateStr === dateStr);
    dateSlots.push({ dateStr, label, record: match });
  }

  // Filter by factor if selected
  const filteredSlots = dateSlots.filter(slot => {
    if (selectedFactorFilter === 'all') return true;
    if (!slot.record) return false;
    return slot.record.factors.includes(selectedFactorFilter as MoodFactor);
  });

  // Calculate statistics
  const recordedCount = dateSlots.filter(s => Boolean(s.record)).length;
  const validRecords = dateSlots.map(s => s.record).filter((r): r is CheckInRecord => Boolean(r));
  const avgMood = validRecords.length
    ? (validRecords.reduce((sum, r) => sum + r.mood, 0) / validRecords.length).toFixed(1)
    : '—';

  const avgSleep = validRecords.filter(r => r.sleep).length
    ? (
        validRecords.reduce((sum, r) => sum + (r.sleep || 0), 0) /
        validRecords.filter(r => r.sleep).length
      ).toFixed(1)
    : '—';

  const avgEnergy = validRecords.filter(r => r.energy).length
    ? (
        validRecords.reduce((sum, r) => sum + (r.energy || 0), 0) /
        validRecords.filter(r => r.energy).length
      ).toFixed(1)
    : '—';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">
                My Pulse
              </h1>
              <p className="text-xs text-slate-500">
                Understand your emotional rhythm without judgment or score pressure.
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector: 7-day default, 30-day, semester */}
        <div className="flex items-center p-1 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <button
            id="period-7d-btn"
            onClick={() => setPeriod('7d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === '7d' ? currentTheme.pillActive : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7-Day Trend
          </button>
          <button
            id="period-30d-btn"
            onClick={() => setPeriod('30d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === '30d' ? currentTheme.pillActive : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30-Day
          </button>
          <button
            id="period-semester-btn"
            onClick={() => setPeriod('semester')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === 'semester' ? currentTheme.pillActive : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semester
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-3xl ${currentTheme.cardBg} border border-white/70 shadow-xs space-y-1`}>
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Check-in Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-outfit">
              {recordedCount}/{dayLimit}
            </span>
            <span className="text-xs text-slate-500 font-medium">days</span>
          </div>
          <p className="text-[10px] text-slate-400">Neutral tracking — no broken streaks</p>
        </div>

        <div className={`p-4 rounded-3xl ${currentTheme.cardBg} border border-white/70 shadow-xs space-y-1`}>
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Average Mood</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-outfit">{avgMood}</span>
            <span className="text-xs text-slate-500">/ 6.0</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {Number(avgMood) >= 4.5 ? 'Steadily positive' : Number(avgMood) >= 3.5 ? 'Moderate / Balanced' : 'Mild strain period'}
          </p>
        </div>

        <div className={`p-4 rounded-3xl ${currentTheme.cardBg} border border-white/70 shadow-xs space-y-1`}>
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Avg Sleep Rest</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-outfit">{avgSleep}</span>
            <span className="text-xs text-slate-500">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Recorded sleep quality</p>
        </div>

        <div className={`p-4 rounded-3xl ${currentTheme.cardBg} border border-white/70 shadow-xs space-y-1`}>
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Avg Energy Level</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-outfit">{avgEnergy}</span>
            <span className="text-xs text-slate-500">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Daily stamina rhythm</p>
        </div>
      </div>

      {/* Main Chart Card (Styled like reference image 2) */}
      <div className={`rounded-3xl p-6 sm:p-8 ${currentTheme.cardBg} border border-white/70 shadow-lg space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg font-outfit">Emotional State Rhythm</h3>
            <p className="text-xs text-slate-500">
              Height represents mood state (1: Struggling → 6: Great). Neutral empty ticks denote rest days.
            </p>
          </div>

          {/* Factor filter tag */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setSelectedFactorFilter('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedFactorFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/80 border border-slate-200 text-slate-600'
              }`}
            >
              All Check-ins
            </button>
            {['Academics', 'Sleep', 'Stress', 'Friends'].map(f => (
              <button
                key={f}
                onClick={() => setSelectedFactorFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedFactorFilter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/80 border border-slate-200 text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Frosted Column Chart */}
        <div className="relative pt-6 pb-2">
          {/* Y-axis guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] text-slate-400 font-mono">
            <div className="border-b border-slate-400 w-full flex justify-between"><span>Great (6)</span></div>
            <div className="border-b border-slate-400 w-full flex justify-between"><span>Good (5)</span></div>
            <div className="border-b border-slate-400 w-full flex justify-between"><span>Okay (4)</span></div>
            <div className="border-b border-slate-400 w-full flex justify-between"><span>Not great (3)</span></div>
            <div className="border-b border-slate-400 w-full flex justify-between"><span>Low (2)</span></div>
            <div className="border-b border-slate-400 w-full flex justify-between"><span>Struggling (1)</span></div>
          </div>

          {/* Columns Container */}
          <div className="relative h-56 flex items-end gap-2 sm:gap-3 px-4 z-10">
            {dateSlots.map((slot, index) => {
              const rec = slot.record;
              const heightPercent = rec ? (rec.mood / 6) * 100 : 8;
              const isMatch =
                selectedFactorFilter === 'all' || (rec && rec.factors.includes(selectedFactorFilter as MoodFactor));

              return (
                <div
                  key={slot.dateStr}
                  onMouseEnter={() => rec && setHoveredRecord(rec)}
                  onMouseLeave={() => setHoveredRecord(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Bar */}
                  <div className="w-full max-w-[42px] flex flex-col justify-end items-center h-full">
                    {rec ? (
                      <div
                        className={`w-full rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between items-center py-2 shadow-xs group-hover:scale-105 ${
                          !isMatch ? 'opacity-30' : 'opacity-100'
                        }`}
                        style={{
                          height: `${heightPercent}%`,
                          background: `linear-gradient(180deg, ${currentTheme.chartBarGradient.to} 0%, ${currentTheme.chartBarGradient.from} 100%)`,
                        }}
                      >
                        {/* Emoji icon atop bar */}
                        <span className="text-xs filter drop-shadow-xs">
                          {MOOD_CONFIGS[rec.mood].emoji}
                        </span>

                        {/* Factor dot if factors exist */}
                        {rec.factors.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-2xs" />
                        )}
                      </div>
                    ) : (
                      /* Neutral empty tick for missed days */
                      <div className="w-full h-8 rounded-xl bg-slate-200/50 border border-dashed border-slate-300 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <span className="text-[10px] text-slate-400 font-bold">·</span>
                      </div>
                    )}
                  </div>

                  {/* X-axis Label */}
                  <span className="text-[10px] font-bold text-slate-500 mt-2 truncate w-full text-center">
                    {slot.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hovered / Selected Day Detail Card */}
        {hoveredRecord && (
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{MOOD_CONFIGS[hoveredRecord.mood].emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {hoveredRecord.dayLabel}: {hoveredRecord.moodLabel}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">
                    Mood {hoveredRecord.mood}/6
                  </span>
                </div>
                {hoveredRecord.factors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hoveredRecord.factors.map(f => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {hoveredRecord.journalText && (
              <div className="text-xs text-slate-600 italic max-w-sm sm:border-l border-slate-200 sm:pl-3">
                "{hoveredRecord.journalText}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Log List */}
      <div className={`rounded-3xl p-6 sm:p-8 ${currentTheme.cardBg} border border-white/70 shadow-md space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base font-outfit">Detailed Check-In Journal</h3>
          <button
            onClick={onOpenCheckIn}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            + Add new check-in
          </button>
        </div>

        <div className="divide-y divide-slate-100/80">
          {[...checkIns]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 7)
            .map(item => (
            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-3">
                <span className="text-2xl p-1.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  {MOOD_CONFIGS[item.mood].emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.moodLabel}</span>
                    <span className="text-xs text-slate-400">· {item.dayLabel}</span>
                  </div>

                  {item.factors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.factors.map(f => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.journalText && (
                    <p className="text-xs text-slate-600 mt-1 italic">"{item.journalText}"</p>
                  )}
                </div>
              </div>

              {/* Sleep & Energy Indicators */}
              <div className="flex items-center gap-3 text-xs text-slate-500 self-start sm:self-auto shrink-0">
                {item.sleep && (
                  <span className="flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep {item.sleep}/5
                  </span>
                )}
                {item.energy && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy {item.energy}/5
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
