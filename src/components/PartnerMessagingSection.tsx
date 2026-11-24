import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
} from 'lucide-react';
import { useTranslatedTexts } from '../context/LanguageContext';
import { PinkTimePicker } from './PinkTimePicker';

interface ChannelPrefs {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
}

const PARTNER_TEMPLATES = [
  {
    id: 'daily-care',
    label: 'Daily Vitamins & Chores',
    subject: 'PregMamas Encouragement: Take Good Care of Your Partner Today',
    buildText: (partner: string) =>
      `Hello ${partner}, this is an automatic PregMamas reminder to support your partner with her daily pregnancy vitamins, bring her clean drinking water, and help with heavy chores today.`,
  },
  {
    id: 'antenatal-early',
    label: 'Antenatal Visit Early Arrival',
    subject: 'PregMamas Reminder: Arrive Early for Her Antenatal Clinic Visit',
    buildText: (partner: string) =>
      `Hello ${partner}, please help arrange transport and remind your partner so you arrive at least 30 minutes early for her antenatal checkup with her Road to Health booklet and water.`,
  },
  {
    id: 'labour-readiness',
    label: 'Hospital Bag & Readiness',
    subject: 'PregMamas Reminder: Preparing Safely Together',
    buildText: (partner: string) =>
      `Hello ${partner}, please check together that Mom & Baby hospital clothes are ready, keep your phone charged, and keep 10177 / 112 and clinic transport ready.`,
  },
  {
    id: 'kindness-check',
    label: 'Meals, Rest & Kindness',
    subject: 'PregMamas Note: Check In With Kindness & Nourishing Food',
    buildText: (partner: string) =>
      `Hello ${partner}, please check how she and baby are feeling today, prepare a nourishing meal because baby needs nutrients, and help her rest comfortably.`,
  },
];

const SECTION_TEXTS = [
  'Automated Partner Care Reminder (Specific Daily Time)',
  'PregMamas sends supportive reminders to your partner automatically every day at the exact time you choose—never sharing private mood, weight, or clinic notes.',
  'Automation Active',
  'Automation Paused',
  "Partner's Name",
  'Partner Phone / WhatsApp Number',
  'Partner Email Address',
  'Automated Channels:',
  'Choose Your Specific Daily Time',
  'Automated Message Theme:',
  'Save & Activate Automated Reminder',
  'Update Specific Time & Save',
  'Pause Automated Reminder',
  'Recent Automated Dispatches',
  ...PARTNER_TEMPLATES.map((tpl) => tpl.label),
];

function normalizePhoneDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) {
    return `27${digits.slice(1)}`;
  }
  if (digits.startsWith('270') && digits.length === 12) {
    return `27${digits.slice(3)}`;
  }
  return digits;
}

export function PartnerMessagingSection() {
  const { translated } = useTranslatedTexts(SECTION_TEXTS);
  const tr = (idx: number, fallback: string) => translated[idx] || fallback;
  const tplOffset = 14;

  const [partnerName, setPartnerName] = useState(
    () => localStorage.getItem('pregmamas_partner_name_v1') || 'Trusted Partner'
  );
  const [whatsappPhone, setWhatsappPhone] = useState(
    () => localStorage.getItem('pregmamas_partner_whatsapp_v1') || ''
  );
  const [partnerEmail, setPartnerEmail] = useState(
    () => localStorage.getItem('pregmamas_partner_email_v1') || ''
  );
  const [channels, setChannels] = useState<ChannelPrefs>(() => {
    try {
      const saved = localStorage.getItem('pregmamas_partner_channels_v1');
      if (saved) return { email: true, whatsapp: true, sms: true, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return { email: true, whatsapp: true, sms: true };
  });

  const [specificTime, setSpecificTime] = useState<string>('08:00');
  const [rotateAutoMessages, setRotateAutoMessages] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(PARTNER_TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState(() =>
    PARTNER_TEMPLATES[0].buildText(
      localStorage.getItem('pregmamas_partner_name_v1') || 'Trusted Partner'
    )
  );
  const [formError, setFormError] = useState('');

  const [capabilities, setCapabilities] = useState<{
    emailServerConfigured: boolean;
    emailProvider: string;
    whatsappServerConfigured: boolean;
    whatsappProvider: string;
    smsServerConfigured?: boolean;
    smsProvider?: string;
  } | null>(null);

  const [dispatchLog, setDispatchLog] = useState<
    Array<{
      id: string;
      partnerName: string;
      emailStatus: string;
      whatsappStatus: string;
      smsStatus?: string;
      scheduleLabel?: string;
      sentAt: string;
    }>
  >([]);

  const [autoSchedule, setAutoSchedule] = useState<{
    enabled: boolean;
    preferredTime?: string;
    nextSendAtMs: number | null;
    lastRunSummary: string;
  }>({
    enabled: false,
    preferredTime: '08:00',
    nextSendAtMs: null,
    lastRunSummary: '',
  });

  const [autoBusy, setAutoBusy] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  const syncFromServer = (hydrateControls = false) => {
    fetch('/api/partners/capabilities')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setCapabilities(data);
        if (Array.isArray(data.dispatches)) setDispatchLog(data.dispatches);
        if (data.autoSchedule) {
          setAutoSchedule(data.autoSchedule);
          if (hydrateControls) {
            if (data.autoSchedule.preferredTime) setSpecificTime(data.autoSchedule.preferredTime);
            if (data.autoSchedule.channels) setChannels(data.autoSchedule.channels);
            setRotateAutoMessages(Boolean(data.autoSchedule.rotateMessages));
            setHydrated(true);
          }
        }
      })
      .catch(() => {
        // ignore offline errors
      });
  };

  useEffect(() => {
    syncFromServer(!hydrated);
    const pollId = window.setInterval(() => syncFromServer(false), 15000);
    return () => window.clearInterval(pollId);
  }, [hydrated]);

  useEffect(() => {
    if (!autoSchedule.enabled) return;
    const tick = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [autoSchedule.enabled]);

  const formatCountdown = (targetMs: number | null): string => {
    if (!targetMs) return '--:--:--';
    const diffSec = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
    const hrs = String(Math.floor(diffSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
    const secs = String(diffSec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const activeTemplate =
    PARTNER_TEMPLATES.find((tpl) => tpl.id === selectedTemplateId) || PARTNER_TEMPLATES[0];

  const cleanDigits = normalizePhoneDigits(whatsappPhone);
  const cleanEmail = partnerEmail.trim();
  const cleanMsg = customMessage.trim() || activeTemplate.buildText(partnerName.trim() || 'Partner');

  const toggleChannel = (key: keyof ChannelPrefs) => {
    setChannels((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('pregmamas_partner_channels_v1', JSON.stringify(next));
      return next;
    });
  };

  const applyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = PARTNER_TEMPLATES.find((item) => item.id === tplId) || PARTNER_TEMPLATES[0];
    setCustomMessage(found.buildText(partnerName.trim() || 'Trusted Partner'));
  };

  const handleSaveSchedule = async (nextEnabled: boolean) => {
    setFormError('');

    if (nextEnabled) {
      if (!channels.email && !channels.whatsapp && !channels.sms) {
        setFormError('Please select at least one automated channel (WhatsApp, SMS, or Email).');
        return;
      }
      const canEmail = channels.email && Boolean(cleanEmail);
      const canPhone = (channels.whatsapp || channels.sms) && Boolean(cleanDigits);
      if (!canEmail && !canPhone) {
        setFormError(
          'Please enter your partner’s email address or phone/WhatsApp number for your selected channels.'
        );
        return;
      }
      if (!specificTime) {
        setFormError('Please choose your specific daily time.');
        return;
      }
    }

    localStorage.setItem('pregmamas_partner_consent_v1', String(nextEnabled));
    localStorage.setItem('pregmamas_partner_name_v1', partnerName);
    localStorage.setItem('pregmamas_partner_whatsapp_v1', whatsappPhone);
    localStorage.setItem('pregmamas_partner_email_v1', partnerEmail);
    localStorage.setItem('pregmamas_partner_channels_v1', JSON.stringify(channels));

    setAutoBusy(true);
    try {
      const res = await fetch('/api/partners/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: nextEnabled,
          scheduleType: 'daily',
          preferredTime: specificTime,
          timezoneOffsetMinutes: new Date().getTimezoneOffset(),
          channels,
          partnerName: partnerName.trim() || 'Trusted Partner',
          whatsappPhone: whatsappPhone.trim(),
          partnerEmail: cleanEmail,
          subject: activeTemplate.subject,
          message: cleanMsg,
          rotateMessages: rotateAutoMessages,
          sendFirstNow: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Could not save automated partner reminder time.');
        return;
      }
      if (data.autoSchedule) setAutoSchedule(data.autoSchedule);
      if (Array.isArray(data.dispatches)) setDispatchLog(data.dispatches);
      setNowMs(Date.now());
    } catch {
      setFormError('Network error saving automated partner reminder time.');
    } finally {
      setAutoBusy(false);
    }
  };

  const missingServerKeys =
    capabilities &&
    ((channels.email && !capabilities.emailServerConfigured) ||
      (channels.whatsapp && !capabilities.whatsappServerConfigured) ||
      (channels.sms && !capabilities.smsServerConfigured));

  return (
    <div className="mt-8 rounded-2xl border-2 border-[#ea91b8] bg-[#fff7fa] p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffeef5] border border-[#ea91b8] grid place-items-center shrink-0">
            <HeartHandshake className="w-5 h-5 text-[#be185d]" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-sans text-base font-semibold text-[#3f0d24] m-0">
              {tr(0, 'Automated Partner Care Reminder (Specific Daily Time)')}
            </h4>
            <p className="text-xs text-[#5c223d] m-0">
              {tr(
                1,
                'PregMamas sends supportive reminders to your partner automatically every day at the exact time you choose—never sharing private mood, weight, or clinic notes.'
              )}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
            autoSchedule.enabled
              ? 'bg-[#f0fdf4] border-[#86efac] text-[#15803d]'
              : 'bg-white border-[#f4b6d0] text-[#7e405c]'
          }`}
        >
          {autoSchedule.enabled ? tr(2, 'Automation Active') : tr(3, 'Automation Paused')}
        </span>
      </div>

      {/* Partner Contact Fields */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="supp-partner-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
            {tr(4, "Partner's Name")}
          </label>
          <input
            id="supp-partner-name"
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="e.g., Thabo"
            className="pink-input bg-white"
          />
        </div>
        <div>
          <label htmlFor="supp-partner-wa" className="block text-xs font-semibold text-[#3f0d24] mb-1">
            {tr(5, 'Partner Phone / WhatsApp Number')}
          </label>
          <input
            id="supp-partner-wa"
            type="tel"
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            placeholder="e.g., 082 123 4567 or +27..."
            className="pink-input bg-white font-mono"
          />
        </div>
        <div>
          <label htmlFor="supp-partner-email" className="block text-xs font-semibold text-[#3f0d24] mb-1">
            {tr(6, 'Partner Email Address')}
          </label>
          <input
            id="supp-partner-email"
            type="email"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder="e.g., partner@email.com"
            className="pink-input bg-white"
          />
        </div>
      </div>

      {/* Specific Time Picker + Automated Channels */}
      <div className="rounded-xl border border-[#f4b6d0] bg-white p-4 grid gap-4 md:grid-cols-12 items-center">
        <div className="md:col-span-5 space-y-1.5">
          <label htmlFor="supp-partner-time" className="block text-xs font-bold uppercase tracking-wider text-[#9d174d]">
            {tr(8, 'Choose Your Specific Daily Time')}
          </label>
          <PinkTimePicker
            id="supp-partner-time"
            value={specificTime}
            onChange={setSpecificTime}
            ariaLabel="Choose specific daily time for automated partner message"
          />
        </div>

        <div className="md:col-span-7 space-y-2">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#9d174d]">
            {tr(7, 'Automated Channels:')}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleChannel('whatsapp')}
              aria-pressed={channels.whatsapp}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                channels.whatsapp
                  ? 'bg-[#15803d] text-white border-[#15803d]'
                  : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>WhatsApp {channels.whatsapp ? '✓' : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleChannel('sms')}
              aria-pressed={channels.sms}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                channels.sms
                  ? 'bg-[#be185d] text-white border-[#be185d]'
                  : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>SMS {channels.sms ? '✓' : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleChannel('email')}
              aria-pressed={channels.email}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                channels.email
                  ? 'bg-[#3f0d24] text-white border-[#3f0d24]'
                  : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Email {channels.email ? '✓' : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Template Picker & Automated Message */}
      <div className="space-y-2">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#9d174d]">
          {tr(9, 'Automated Message Theme:')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PARTNER_TEMPLATES.map((tpl, idx) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                selectedTemplateId === tpl.id
                  ? 'bg-[#be185d] text-white border-[#be185d]'
                  : 'bg-white text-[#5c223d] border-[#ea91b8] hover:bg-[#ffe4ef]'
              }`}
            >
              {tr(tplOffset + idx, tpl.label)}
            </button>
          ))}
        </div>
        <textarea
          rows={2}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          aria-label="Automated message for partner"
          className="pink-input bg-white text-xs"
        />
        <label className="flex items-center gap-2 text-xs text-[#3f0d24] cursor-pointer">
          <input
            type="checkbox"
            checked={rotateAutoMessages}
            onChange={(e) => setRotateAutoMessages(e.target.checked)}
            className="accent-[#be185d] w-4 h-4"
          />
          <span>Automatically rotate supportive care reminders each day at {specificTime}</span>
        </label>
      </div>

      {/* Honest Gateway Configuration Notice */}
      {missingServerKeys && (
        <div className="rounded-xl border border-[#f59e0b] bg-[#fffbeb] p-3 text-xs text-[#78350f] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#d97706]" aria-hidden="true" />
          <div className="space-y-1">
            <strong>Server Messaging Gateway Credentials Not Set Yet</strong>
            <p className="m-0 leading-relaxed">
              PregMamas schedules and logs every automated dispatch at <strong>{specificTime}</strong>, but real external delivery requires server API keys in <strong>Settings &gt; Secrets</strong>:
              {!capabilities?.emailServerConfigured && channels.email ? ' Email needs RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS.' : ''}
              {!capabilities?.whatsappServerConfigured && channels.whatsapp ? ' WhatsApp needs WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID (or Twilio WhatsApp).' : ''}
              {!capabilities?.smsServerConfigured && channels.sms ? ' SMS needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN & TWILIO_SMS_FROM.' : ''}
            </p>
          </div>
        </div>
      )}

      {formError && (
        <p className="text-xs font-semibold text-[#be123c] m-0" role="alert">
          {formError}
        </p>
      )}

      {autoSchedule.enabled && (
        <div className="rounded-xl border border-[#86efac] bg-white px-3.5 py-2.5 space-y-1 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[#3f0d24]">
              Next automated send:{' '}
              <strong className="text-[#be185d]">
                {autoSchedule.nextSendAtMs
                  ? new Date(autoSchedule.nextSendAtMs).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : specificTime}
              </strong>
            </span>
            <span className="font-mono font-bold text-[#15803d]">
              in {formatCountdown(autoSchedule.nextSendAtMs)}
            </span>
          </div>
          {autoSchedule.lastRunSummary && (
            <p className="text-[11px] text-[#5c223d] m-0 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#15803d]" aria-hidden="true" />
              <span>{autoSchedule.lastRunSummary}</span>
            </p>
          )}
        </div>
      )}

      <div className={autoSchedule.enabled ? 'grid sm:grid-cols-2 gap-2.5' : ''}>
        <button
          type="button"
          disabled={autoBusy}
          onClick={() => void handleSaveSchedule(true)}
          className="pink-btn-primary w-full text-xs disabled:opacity-60"
        >
          {autoBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Saving Automated Time...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" aria-hidden="true" />
              {autoSchedule.enabled
                ? tr(11, 'Update Specific Time & Save')
                : `${tr(10, 'Save & Activate Automated Reminder')} (${specificTime})`}
            </>
          )}
        </button>

        {autoSchedule.enabled && (
          <button
            type="button"
            disabled={autoBusy}
            onClick={() => void handleSaveSchedule(false)}
            className="rounded-xl border border-[#be123c] bg-white px-3 py-2 text-xs font-bold text-[#be123c] hover:bg-[#ffe4ef] cursor-pointer disabled:opacity-60"
          >
            {tr(12, 'Pause Automated Reminder')}
          </button>
        )}
      </div>

      {dispatchLog.length > 0 && (
        <div className="space-y-2 pt-1">
          <strong className="block text-xs font-semibold text-[#3f0d24]">
            {tr(13, 'Recent Automated Dispatches')}
          </strong>
          <div className="grid sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {dispatchLog.slice(0, 4).map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-[#ffd6e7] bg-white px-3 py-2 text-[11px] space-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-[#3f0d24]">
                    {d.partnerName}
                    {d.scheduleLabel ? ` · ${d.scheduleLabel}` : ''}
                  </strong>
                  <span className="font-mono text-[10px] text-[#7e405c]">{d.sentAt}</span>
                </div>
                <p className="text-[#be185d] m-0">
                  Email: {d.emailStatus} · WhatsApp: {d.whatsappStatus}
                  {d.smsStatus ? ` · SMS: ${d.smsStatus}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
