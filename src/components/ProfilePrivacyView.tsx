import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Download,
  Trash2,
  Moon,
  Bell,
  Eye,
  Check,
  Sparkles,
  Lock,
  Compass,
  Palette,
  AlertTriangle,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { CheckInRecord, ThemeId, UserProfile } from '../types';
import { getLocalDateKey } from '../utils/date';
import { THEMES } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

type NotificationFrequency = UserProfile['notificationFrequency'];

interface ProfilePrivacyViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  checkIns: CheckInRecord[];
  onResetAllData: () => void;
  onOpenBaseline: () => void;
}

export const ProfilePrivacyView: React.FC<ProfilePrivacyViewProps> = ({
  userProfile,
  onUpdateProfile,
  checkIns,
  onResetAllData,
  onOpenBaseline,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const { signOut } = useAuth();

  const handleExportData = () => {
    const exportPayload = {
      profile: userProfile,
      checkInsCount: checkIns.length,
      checkIns,
      exportedAt: new Date().toISOString(),
      app: 'ManoVeda Campus Student Wellness',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `manoveda-wellness-data-${getLocalDateKey()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">
                Profile & Privacy
              </h1>
              <p className="text-xs text-slate-500">
                Manage your theme, notification preferences, data boundaries, and export logs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Student Identity & Theme Card */}
      <div className={`rounded-3xl p-6 sm:p-8 ${currentTheme.cardBg} border border-white/70 shadow-md space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-md"
              style={{
                background: 'linear-gradient(135deg, #FF7B7B 0%, #A076F9 50%, #68B0AB 100%)',
              }}
            >
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-outfit text-slate-900">{userProfile.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  Age {userProfile.ageRange}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Campus Wellness Account · Enrolled Student
              </p>
            </div>
          </div>

          <button
            onClick={onOpenBaseline}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs self-start sm:self-auto"
          >
            View Baseline Snapshot
          </button>
        </div>

        {/* Theme Picker */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Palette className="w-4 h-4 text-indigo-500" />
            <span>Atmospheric Gradient Theme</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['blue', 'rose', 'amber'] as ThemeId[]).map(tId => {
              const thm = THEMES[tId];
              const isSel = userProfile.theme === tId;
              return (
                <button
                  key={tId}
                  onClick={() => onUpdateProfile({ theme: tId })}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSel
                      ? 'border-indigo-500 bg-white shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full shadow-inner"
                      style={{ backgroundColor: thm.previewColor }}
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{thm.name}</span>
                      <span className="text-[10px] text-slate-500">{thm.label}</span>
                    </div>
                  </div>
                  {isSel && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Privacy & Data Boundaries (Blueprint Section 14) */}
      <div className={`rounded-3xl p-6 sm:p-8 ${currentTheme.cardBg} border border-white/70 shadow-md space-y-5`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base font-outfit">
            Student Privacy Guarantees
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          ManoVeda is engineered so you never feel monitored by your university administration or faculty.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>100% Private Check-Ins</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Your daily mood ratings and factors remain strictly in your private local space.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Counselor Sharing Control</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Providers only see your schedule booking. Mood trends are only shared if you explicitly check the opt-in box.
            </p>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Share mood history by default during bookings
              </span>
              <p className="text-[11px] text-slate-500">
                Off by default. Counselors will only see what you discuss live.
              </p>
            </div>
            <input
              type="checkbox"
              checked={userProfile.privacy.shareMoodByDefault}
              onChange={e =>
                onUpdateProfile({
                  privacy: { ...userProfile.privacy, shareMoodByDefault: e.target.checked },
                })
              }
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Anonymized Campus Health Trend Aggregation
              </span>
              <p className="text-[11px] text-slate-500">
                Helps university wellness allocate support (e.g. 40% academic stress during finals). Never identifies you.
              </p>
            </div>
            <input
              type="checkbox"
              checked={userProfile.privacy.anonymousCampusAnalytics}
              onChange={e =>
                onUpdateProfile({
                  privacy: { ...userProfile.privacy, anonymousCampusAnalytics: e.target.checked },
                })
              }
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Notifications & Quiet Hours (Blueprint Section 15 & Part A) */}
      <div className={`rounded-3xl p-6 sm:p-8 ${currentTheme.cardBg} border border-white/70 shadow-md space-y-4`}>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-base font-outfit">
            Gentle Reminders & Quiet Hours
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: 'daily', label: 'Once Daily', desc: 'Gentle morning nudge' },
            { id: 'few_times_week', label: 'A Few Times a Week', desc: 'Low frequency' },
            { id: 'none', label: 'No Notifications', desc: 'Check in on your own terms' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => onUpdateProfile({ notificationFrequency: opt.id as NotificationFrequency })}
              className={`p-3 rounded-2xl border text-left transition-all ${
                userProfile.notificationFrequency === opt.id
                  ? 'border-indigo-500 bg-white font-bold ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white/60 text-slate-600'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 block">{opt.label}</span>
              <span className="text-[11px] text-slate-500">{opt.desc}</span>
            </button>
          ))}
        </div>

        {/* Quiet hours schedule */}
        <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="font-bold text-slate-800 block">Do-Not-Disturb Quiet Hours</span>
              <span className="text-slate-500 text-[11px]">
                {userProfile.quietHoursStart} to {userProfile.quietHoursEnd} (No student pings)
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Active
          </span>
        </div>
      </div>

      {/* 4. Data Ownership & Export / Reset */}
      <div className={`rounded-3xl p-6 sm:p-8 ${currentTheme.cardBg} border border-white/70 shadow-md space-y-4`}>
        <h3 className="font-bold text-slate-900 text-base font-outfit">Your Data Ownership</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          You own your check-in logs and reflections. Download your archive at any time or clear all local storage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Exported JSON
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Personal JSON Archive
              </>
            )}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All Local Data
            </button>
          ) : (
            <div className="flex items-center gap-2 p-1 bg-rose-100/80 rounded-2xl">
              <span className="text-xs text-rose-900 font-bold px-2">Are you sure?</span>
              <button
                onClick={onResetAllData}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Log Out Section */}
      <div className={`rounded-3xl ${currentTheme.cardBg} border border-white/70 shadow-xs p-6 space-y-4`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-slate-600" />
          </div>
          <h2 className="text-lg font-bold font-outfit text-slate-900">Account</h2>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Log out of your account. Your data will be saved and available when you log back in.
        </p>

        <button
          onClick={async () => {
            await signOut();
            window.location.href = '/auth';
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
};
