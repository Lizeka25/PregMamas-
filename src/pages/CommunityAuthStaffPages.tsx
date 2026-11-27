import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Check,
  Clock,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Search,
  Send,
  ShieldCheck,
  Stethoscope,
  Upload,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  AppRoute,
  DemoUser,
  LEARNING_TOPICS,
  SA_PROVINCES,
  SaRegistryMatch,
} from '../data/pregmamasData';
import { useTranslatedTexts } from '../context/LanguageContext';
import { PinkDatePickerButton } from '../components/PinkDatePickerButton';
import { useSharedContent } from '../context/SharedContentContext';
import { ArticleCommentsBox } from '../components/ArticleCommentsBox';

export interface AdminSession {
  token: string;
  mode: 'env' | 'claimed';
}

const LOGIN_TEXTS = [
  'Welcome Back',
  'Sign in to PregMamas',
  'Email Address',
  'Password',
  'Sign In',
  'New to PregMamas?',
  'Register a free account',
  'Instant Role Preview (For Testing All PregMamas Workflows)',
  'Explore the platform right away as a pregnant mother or a verified healthcare professional. Administrators must sign in with their Administrator ID.',
  'Mother Demo',
  'Week 24 · Supplements, Bag & Partner Consent',
  'Healthcare Pro Demo',
  'Draft articles & reply to mothers',
  'Administrator Sign In',
  'Requires Administrator ID',
];

export function LoginPage({
  onAuthSuccess,
  onNavigate,
}: {
  onAuthSuccess: (user: DemoUser) => void;
  onNavigate: (path: AppRoute) => void;
}) {
  const { translated } = useTranslatedTexts(LOGIN_TEXTS);
  const tr = (idx: number, fallback: string) => translated[idx] || fallback;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemo = (role: DemoUser['role'], name: string, target: AppRoute) => {
    onAuthSuccess({
      name,
      email: `${role}@pregmamas.demo`,
      role,
      region: 'Gauteng',
      dateOfBirth: '2001-05-14',
    });
    onNavigate(target);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pink-card p-6 sm:p-8 space-y-5 max-w-xl mx-auto">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#be185d] m-0">
            {tr(0, 'Welcome Back')}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            {tr(1, 'Sign in to PregMamas')}
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDemo('mother', email.split('@')[0] || 'Mama', '/dashboard');
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#3f0d24] mb-1">
              {tr(2, 'Email Address')}
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="pink-input"
            />
          </div>
          <div>
            <label htmlFor="login-pass" className="block text-xs font-semibold text-[#3f0d24] mb-1">
              {tr(3, 'Password')}
            </label>
            <input
              id="login-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pink-input"
            />
          </div>
          <button type="submit" className="pink-btn-primary w-full">
            {tr(4, 'Sign In')}
          </button>
        </form>

        <p className="text-xs text-center text-[#5c223d]">
          {tr(5, 'New to PregMamas?')}{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="font-semibold text-[#be185d] hover:underline cursor-pointer"
          >
            {tr(6, 'Register a free account')}
          </button>
        </p>
      </div>

      {/* Instant Role Preview */}
      <div className="pink-panel p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            {tr(7, 'Instant Role Preview (For Testing All PregMamas Workflows)')}
          </h2>
          <p className="text-xs text-[#5c223d] mt-1 m-0">
            {tr(8, 'Explore the platform right away as a pregnant mother, a verified healthcare professional, or a platform administrator.')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleDemo('mother', 'Expectant Mother', '/dashboard')}
            className="pink-card p-4 text-left hover:border-[#db2777] cursor-pointer"
          >
            <strong className="block text-sm font-semibold text-[#3f0d24]">{tr(9, 'Mother Demo')}</strong>
            <span className="block text-xs text-[#5c223d] mt-1">
              {tr(10, 'Week 24 · Supplements, Bag & Partner Consent')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleDemo('professional', 'Doctor / Midwife', '/professional')}
            className="pink-card p-4 text-left hover:border-[#db2777] cursor-pointer"
          >
            <strong className="block text-sm font-semibold text-[#3f0d24]">{tr(11, 'Healthcare Pro Demo')}</strong>
            <span className="block text-xs text-[#5c223d] mt-1">
              {tr(12, 'Draft articles & moderate reports')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="pink-card p-4 text-left hover:border-[#db2777] cursor-pointer"
          >
            <strong className="flex items-center gap-1.5 text-sm font-semibold text-[#3f0d24]">
              <KeyRound className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
              {tr(13, 'Administrator Sign In')}
            </strong>
            <span className="block text-xs text-[#5c223d] mt-1">
              {tr(14, 'Requires Administrator ID')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const REGISTER_TEXTS = [
  'Account Registration',
  'Sign in here',
  'I am registering as:',
  'Mother / Expecting',
  'Healthcare Professional (Midwife / Nurse / Doctor)',
  'Full Name',
  'Email Address',
  'Date of Birth',
  'Province in South Africa',
  'First Day of Last Menstrual Period (LMP) — optional',
  'Optional Partner Education Consent:',
  'Send general weekly educational tips only. Never shares health logs, mood, weight, or HIV status.',
  'Create PregMamas Account',
];

export function RegisterPage({
  onAuthSuccess,
  onNavigate,
}: {
  onAuthSuccess: (user: DemoUser) => void;
  onNavigate: (path: AppRoute) => void;
}) {
  const { translated } = useTranslatedTexts(REGISTER_TEXTS);
  const tr = (idx: number, fallback: string) => translated[idx] || fallback;

  const [role, setRole] = useState<DemoUser['role']>('mother');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [region, setRegion] = useState('Gauteng');
  const [lmpDate, setLmpDate] = useState('');
  const [partnerConsent, setPartnerConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lmpDate) localStorage.setItem('pregmamas_lmp_date_v1', lmpDate);
    localStorage.setItem('pregmamas_partner_consent_v1', String(partnerConsent));
    onAuthSuccess({
      name: fullName.trim() || 'PregMamas Member',
      email: email.trim(),
      role,
      region,
      dateOfBirth: dob,
    });
    onNavigate(role === 'professional' ? '/professional' : '/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="pink-card p-6 sm:p-8 space-y-5">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            {tr(0, 'Account Registration')}
          </h1>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-xs font-semibold text-[#be185d] hover:underline cursor-pointer"
          >
            {tr(1, 'Sign in here')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-role" className="block text-xs font-semibold text-[#3f0d24] mb-1">
              {tr(2, 'I am registering as:')}
            </label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value as DemoUser['role'])}
              className="pink-input"
            >
              <option value="mother">{tr(3, 'Mother / Expecting')}</option>
              <option value="professional">{tr(4, 'Healthcare Professional (Midwife / Nurse / Doctor)')}</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                {tr(5, 'Full Name')}
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pink-input"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                {tr(6, 'Email Address')}
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pink-input"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-dob" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                {tr(7, 'Date of Birth')}
              </label>
              <PinkDatePickerButton
                id="reg-dob"
                value={dob}
                onChange={setDob}
                placeholder="Select birth date"
                allowFuture={false}
              />
            </div>
            <div>
              <label htmlFor="reg-prov" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                {tr(8, 'Province in South Africa')}
              </label>
              <select
                id="reg-prov"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="pink-input"
              >
                {SA_PROVINCES.map((p) => (
                  <option key={p.province} value={p.province}>
                    {p.province}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {role === 'mother' && (
            <>
              <div>
                <label htmlFor="reg-lmp" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  {tr(9, 'First Day of Last Menstrual Period (LMP) — optional')}
                </label>
                <PinkDatePickerButton
                  id="reg-lmp"
                  value={lmpDate}
                  onChange={setLmpDate}
                  placeholder="Optional: pick last period date"
                  allowFuture={false}
                />
              </div>

              <label className="flex items-start gap-2.5 rounded-xl bg-[#ffeef5] border border-[#f4b6d0] p-3.5 text-xs text-[#3f0d24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={partnerConsent}
                  onChange={(e) => setPartnerConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <strong>{tr(10, 'Optional Partner Education Consent:')}</strong>{' '}
                  {tr(11, 'Send general weekly educational tips only. Never shares health logs, mood, weight, or HIV status.')}
                </span>
              </label>
            </>
          )}

          <button type="submit" className="pink-btn-primary w-full">
            {tr(12, 'Create PregMamas Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

const MY_CLINICIAN_VERIF_ID_KEY = 'pregmamas_my_clinician_verif_id_v1';
const MAX_PROOF_FILE_BYTES = 3 * 1024 * 1024;
const SAFE_PROOF_DATA_URL_RE =
  /^data:(image\/(jpeg|jpg|png|webp)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document));base64,[A-Za-z0-9+/=]+$/i;

const PRO_STATIC_TEXTS = [
  'Doctor & Midwife Clinical Studio',
  'Verify Credentials, Post Knowledge & Reply to Mothers',
  'Upload your proof of certificate, medical licence, practicing card, or supporting document for Administrator approval. Once approved, publish clinical guidance and reply to mothers.',
  'Post Knowledge & Read Comments',
  'Share Clinical Knowledge',
  'Post to User Dashboard',
  'Published Knowledge & Mother Comments',
];

export function ProfessionalPage({
  user = null,
  onNavigate,
}: {
  user?: DemoUser | null;
  onNavigate?: (path: AppRoute, topic?: string) => void;
}) {
  const { translated } = useTranslatedTexts(PRO_STATIC_TEXTS);
  const tr = (idx: number, fallback: string) => translated[idx] || fallback;

  const {
    articles,
    articleComments,
    clinicianVerifications,
    publishClinicianArticle,
    submitClinicianVerification,
  } = useSharedContent();

  // Track this practitioner's submitted verification application ID locally
  const [myVerifId, setMyVerifId] = useState<string>(() => {
    try {
      return localStorage.getItem(MY_CLINICIAN_VERIF_ID_KEY) || '';
    } catch {
      return '';
    }
  });

  const myVerification = useMemo(() => {
    if (myVerifId) {
      const byId = clinicianVerifications.find((v) => v.id === myVerifId);
      if (byId) return byId;
    }
    if (user?.role === 'professional' && user.name.trim()) {
      const target = user.name.trim().toLowerCase();
      return clinicianVerifications.find((v) => v.clinicianName.trim().toLowerCase() === target);
    }
    return undefined;
  }, [clinicianVerifications, myVerifId, user]);

  // Verification proof form state
  const [editingVerif, setEditingVerif] = useState(false);
  const [verifName, setVerifName] = useState(() =>
    user?.role === 'professional' ? user.name : ''
  );
  const [verifProfession, setVerifProfession] = useState('Registered Midwife');
  const [verifBody, setVerifBody] = useState<'SANC' | 'HPCSA' | 'Other Medical Council'>('SANC');
  const [verifNumber, setVerifNumber] = useState('');
  const [verifFacility, setVerifFacility] = useState('');
  const [verifNotes, setVerifNotes] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [proofDataUrl, setProofDataUrl] = useState('');
  const [verifError, setVerifError] = useState('');
  const [verifSubmitting, setVerifSubmitting] = useState(false);

  // Automatic South African Doctor / Midwife Name Recognition state
  const [lookupResult, setLookupResult] = useState<SaRegistryMatch | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const lastLookedUpRef = useRef('');
  const lookupAbortRef = useRef<AbortController | null>(null);

  const showSubmissionForm =
    !myVerification || myVerification.status === 'rejected' || editingVerif;

  // Direct clinical knowledge authoring
  const [authorName, setAuthorName] = useState(
    myVerification?.clinicianName || (user?.role === 'professional' ? user.name : '')
  );
  const [title, setTitle] = useState('');
  const [knowledgeText, setKnowledgeText] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedBanner, setPublishedBanner] = useState<string>('');

  useEffect(() => {
    if (myVerification?.clinicianName && !authorName.trim()) {
      setAuthorName(myVerification.clinicianName);
    }
  }, [myVerification, authorName]);

  const runSaRegistryLookup = useCallback(async (nameToCheck: string, force = false) => {
    const trimmed = nameToCheck.trim();
    if (trimmed.length < 4) {
      if (force) {
        setLookupError('Please enter your full name and surname to check South African medical registries.');
      }
      return;
    }

    const normalizedKey = trimmed.toLowerCase().replace(/\s+/g, ' ');
    if (!force && lastLookedUpRef.current === normalizedKey) {
      return;
    }

    if (lookupAbortRef.current) {
      lookupAbortRef.current.abort();
    }
    const controller = new AbortController();
    lookupAbortRef.current = controller;

    setLookupLoading(true);
    setLookupError('');

    try {
      const res = await fetch('/api/clinician-verifications/lookup-sa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => ({}))) as Partial<SaRegistryMatch> & {
        error?: string;
      };

      if (!res.ok) {
        setLookupResult(null);
        setLookupError(
          data.error ||
            'Could not check the South African medical registry right now. You can upload your licence or certificate directly below.'
        );
        return;
      }

      const match = data as SaRegistryMatch;
      lastLookedUpRef.current = normalizedKey;
      setLookupResult(match);

      if (match.recognized) {
        if (match.profession) setVerifProfession(match.profession);
        if (match.registrationBody) setVerifBody(match.registrationBody);
        if (match.registrationNumber) {
          setVerifNumber((prev) => (prev.trim() ? prev : match.registrationNumber));
        }
        if (match.facilityName) {
          setVerifFacility((prev) => (prev.trim() ? prev : match.facilityName));
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setLookupResult(null);
      setLookupError(
        'Could not reach the South African registry check right now. You can still upload your licence or certificate proof below.'
      );
    } finally {
      if (lookupAbortRef.current === controller) {
        setLookupLoading(false);
      }
    }
  }, []);

  // Automatically recognize South African registered doctors & midwives as they type their name
  useEffect(() => {
    if (!showSubmissionForm) return;
    const trimmed = verifName.trim();
    if (!trimmed) {
      setLookupResult(null);
      setLookupError('');
      lastLookedUpRef.current = '';
      return;
    }

    const withoutTitle = trimmed.replace(/^(dr|doctor|prof|professor|sr|sister)\.?\s+/i, '').trim();
    const hasTwoWords = /\s+/.test(withoutTitle);
    if (!hasTwoWords || withoutTitle.length < 5) {
      return;
    }

    const timer = window.setTimeout(() => {
      void runSaRegistryLookup(trimmed, false);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [verifName, showSubmissionForm, runSaRegistryLookup]);

  useEffect(() => {
    return () => {
      lookupAbortRef.current?.abort();
    };
  }, []);

  const handleLoadApprovedProfile = (approvedId: string) => {
    setMyVerifId(approvedId);
    try {
      localStorage.setItem(MY_CLINICIAN_VERIF_ID_KEY, approvedId);
    } catch {
      // ignore
    }
    setEditingVerif(false);
  };

  const isVerifiedClinician = myVerification?.status === 'approved';
  const clinicianDisplay =
    myVerification?.clinicianName ||
    authorName.trim() ||
    (user?.role === 'professional' ? user.name : '') ||
    'PregMamas Clinician';
  const clinicianBadgeLabel = myVerification
    ? `${myVerification.profession} (${myVerification.registrationBody} ${myVerification.registrationNumber})`
    : 'Verified Doctor / Midwife';

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVerifError('');
    if (!file) return;
    if (file.size > MAX_PROOF_FILE_BYTES) {
      setVerifError('Please choose a certificate or document smaller than 3 MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (!SAFE_PROOF_DATA_URL_RE.test(reader.result)) {
          setVerifError(
            'Unsupported document format. Please upload a JPG, PNG, WebP, PDF, DOC, or DOCX file.'
          );
          setProofFileName('');
          setProofDataUrl('');
          e.target.value = '';
          return;
        }
        setProofFileName(file.name);
        setProofDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifError('');

    const cleanName = verifName.trim();
    const cleanNumber = verifNumber.trim();
    const cleanFacility = verifFacility.trim() || lookupResult?.facilityName?.trim() || '';
    const isRegistryMatch = Boolean(lookupResult?.recognized);

    if (!cleanName) {
      setVerifError('Please enter your full name and clinical title (e.g. Dr. or Sr.).');
      return;
    }
    if (!proofDataUrl || !proofFileName) {
      setVerifError(
        'Please upload your proof of certificate, medical licence, or supporting document before submitting for Admin approval.'
      );
      return;
    }
    if (!SAFE_PROOF_DATA_URL_RE.test(proofDataUrl)) {
      setVerifError(
        'Unsupported document format. Please upload a JPG, PNG, WebP, PDF, DOC, or DOCX file.'
      );
      return;
    }
    if (!cleanFacility && !isRegistryMatch) {
      setVerifError('Please enter your clinic, hospital, or practice name.');
      return;
    }

    setVerifSubmitting(true);
    try {
      const created = await submitClinicianVerification({
        clinicianName: cleanName,
        profession: verifProfession,
        registrationBody: verifBody,
        registrationNumber: cleanNumber || 'Certificate / Document Uploaded',
        facilityName: cleanFacility || 'South African Clinic / Practice',
        proofFileName,
        proofDataUrl,
        notes: verifNotes.trim() || undefined,
        registryRecognized: isRegistryMatch,
        registrySummary: isRegistryMatch ? lookupResult?.summary : undefined,
        registrySources: isRegistryMatch ? lookupResult?.sources : undefined,
      });
      setMyVerifId(created.id);
      try {
        localStorage.setItem(MY_CLINICIAN_VERIF_ID_KEY, created.id);
      } catch {
        // ignore
      }
      setAuthorName(created.clinicianName);
      setEditingVerif(false);
    } catch (err) {
      setVerifError(
        err instanceof Error && err.message
          ? err.message
          : 'Could not submit verification right now. Please try again.'
      );
    } finally {
      setVerifSubmitting(false);
    }
  };

  const openResubmitForm = () => {
    if (myVerification) {
      setVerifName(myVerification.clinicianName);
      setVerifProfession(myVerification.profession);
      setVerifBody(myVerification.registrationBody);
      setVerifNumber(
        myVerification.registrationNumber === 'Certificate Attached' ||
          myVerification.registrationNumber === 'Licence / Certificate Uploaded' ||
          myVerification.registrationNumber === 'Matched in SA Medical Registry'
          ? ''
          : myVerification.registrationNumber
      );
      setVerifFacility(myVerification.facilityName);
      setVerifNotes(myVerification.notes || '');
      setProofFileName(myVerification.proofFileName || '');
      setProofDataUrl(myVerification.proofDataUrl || '');
    }
    setVerifError('');
    setEditingVerif(true);
  };

  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifiedClinician) return;
    const cleanTitle = title.trim();
    const cleanKnowledge = knowledgeText.trim();
    if (!cleanTitle || !cleanKnowledge || publishing) return;
    setPublishing(true);
    setPublishedBanner('');
    try {
      const paragraphs = cleanKnowledge
        .split('\n')
        .map((line) => line.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);

      const summary = paragraphs[0] || cleanKnowledge;
      const body = paragraphs.length > 0 ? paragraphs : [cleanKnowledge];

      const created = await publishClinicianArticle({
        topic: 'general',
        title: cleanTitle,
        summary,
        body,
        imageKey: 'clinicMidwife',
        authorName: clinicianDisplay,
        authorProfession: clinicianBadgeLabel,
      });
      setTitle('');
      setKnowledgeText('');
      setPublishedBanner(`"${created.title}" is now live on the Mother Dashboard!`);
    } finally {
      setPublishing(false);
    }
  };

  const totalQuestionsCount = articles.reduce(
    (sum, a) => sum + (articleComments[a.id]?.length || 0),
    0
  );

  // Order articles so clinician-published knowledge & articles with comments appear first
  const orderedKnowledgeAndComments = useMemo(() => {
    return [...articles].sort((a, b) => {
      const aCustom = a.isClinicianPublished ? 1 : 0;
      const bCustom = b.isClinicianPublished ? 1 : 0;
      if (aCustom !== bCustom) return bCustom - aCustom;
      const aCount = articleComments[a.id]?.length || 0;
      const bCount = articleComments[b.id]?.length || 0;
      return bCount - aCount;
    });
  }, [articles, articleComments]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9d174d]">
            <Stethoscope className="w-4 h-4" aria-hidden="true" />
            <span>{tr(0, 'Doctor & Midwife Clinical Studio')}</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            {tr(1, 'Verify Credentials, Post Knowledge & Reply to Mothers')}
          </h1>
          <p className="text-sm text-[#5c223d] m-0">
            {tr(
              2,
              'Upload your proof of certificate, medical licence, practicing card, or supporting document for Administrator approval. Once approved, publish clinical guidance and reply to mothers.'
            )}
          </p>
        </div>

        <div className="shrink-0">
          {isVerifiedClinician ? (
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#db2777] bg-white px-4 py-2 text-xs font-bold text-[#9d174d]">
              <ShieldCheck className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
              Admin Verified
            </span>
          ) : myVerification?.status === 'pending' ? (
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#f59e0b] bg-[#fffbeb] px-4 py-2 text-xs font-bold text-[#92400e]">
              <Clock className="w-4 h-4" aria-hidden="true" />
              Pending Admin Approval
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#ea91b8] bg-white px-4 py-2 text-xs font-bold text-[#7e405c]">
              <Lock className="w-4 h-4" aria-hidden="true" />
              Certificate Proof Required
            </span>
          )}
        </div>
      </div>

      {/* Step 1: Doctor / Midwife Verification Card */}
      {showSubmissionForm ? (
        <section className="pink-card p-6 sm:p-7 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0 inline-flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#be185d]" aria-hidden="true" />
                Doctor &amp; Midwife Verification — Proof of Certificate &amp; Admin Approval
              </h2>
              <p className="text-xs text-[#5c223d] m-0">
                All doctors and midwives must upload a proof of certificate, medical licence, practicing card, or supporting document below. An Administrator will review your document before approving clinical access.
              </p>
            </div>
            {editingVerif && myVerification && (
              <button
                type="button"
                onClick={() => setEditingVerif(false)}
                className="pink-btn-secondary !min-h-[34px] text-xs"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {myVerification?.status === 'rejected' && (
            <div
              role="alert"
              className="rounded-xl border border-[#f43f5e] bg-[#fff1f2] p-4 space-y-1 text-xs text-[#881337]"
            >
              <p className="font-bold m-0 inline-flex items-center gap-1.5">
                <XCircle className="w-4 h-4" aria-hidden="true" />
                Verification Update Requested by Admin
              </p>
              <p className="m-0">
                {myVerification.adminReviewNote ||
                  'Please double-check your medical council registration number or attach a clearer certificate/practicing card.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmitVerification} className="grid gap-4 md:grid-cols-2">
            {/* Full Name + Automatic South African Doctor/Midwife Recognition */}
            <div className="md:col-span-2 space-y-2.5">
              <label htmlFor="verif-name" className="block text-xs font-semibold text-[#3f0d24]">
                Full Name &amp; Clinical Title (Auto-checks South African Registered Doctors &amp; Midwives)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="verif-name"
                  type="text"
                  required
                  value={verifName}
                  onChange={(e) => setVerifName(e.target.value)}
                  placeholder="e.g., Dr. Glenda Gray, Dr. N. Dlamini, or Sr. K. Nkosi"
                  className="pink-input flex-1"
                />
                <button
                  type="button"
                  disabled={lookupLoading || verifName.trim().length < 4}
                  onClick={() => void runSaRegistryLookup(verifName, true)}
                  className="pink-btn-secondary text-xs whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  {lookupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Checking SA Registry...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" aria-hidden="true" />
                      Check SA Registry
                    </>
                  )}
                </button>
              </div>

              {lookupLoading && (
                <div
                  role="status"
                  className="rounded-xl border border-[#f4b6d0] bg-[#fff7fa] px-3.5 py-2.5 text-xs text-[#7e405c] flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 text-[#be185d] animate-spin shrink-0" aria-hidden="true" />
                  <span>
                    Searching South African medical &amp; nursing directories (HPCSA, SANC, Medpages SA, SA hospitals)...
                  </span>
                </div>
              )}

              {!lookupLoading && lookupResult?.recognized && (
                <div
                  role="status"
                  className="rounded-2xl border border-[#059669] bg-[#ecfdf5] p-4 space-y-2.5 text-xs text-[#064e3b]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-sm text-[#047857] m-0 inline-flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                      Recognized Registered Practitioner in South Africa
                    </p>
                    <span className="rounded-md bg-[#047857] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {lookupResult.confidence === 'high' ? 'High SA Match' : 'SA Registry Match'}
                    </span>
                  </div>

                  <p className="m-0 leading-relaxed text-[#065f46]">
                    <strong>{lookupResult.matchedName}</strong>
                    {lookupResult.specialty ? ` · ${lookupResult.specialty}` : ` · ${lookupResult.profession}`}
                    {' · '}
                    <strong>{lookupResult.registrationBody}</strong>
                    {lookupResult.registrationNumber ? ` ${lookupResult.registrationNumber}` : ''}
                    {lookupResult.facilityName ? ` · ${lookupResult.facilityName}` : ''}
                  </p>

                  {lookupResult.summary && (
                    <p className="m-0 text-[#064e3b] leading-relaxed">{lookupResult.summary}</p>
                  )}

                  {lookupResult.sources && lookupResult.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="font-semibold text-[11px] text-[#047857]">Verified SA Listings:</span>
                      {lookupResult.sources.map((src, idx) => (
                        <a
                          key={`${src.uri}-${idx}`}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#6ee7b7] bg-white px-2 py-1 text-[11px] font-semibold text-[#047857] hover:bg-[#d1fae5]"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                          <span className="max-w-[200px] truncate">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {lookupResult.alreadyApprovedOnPregMamas && lookupResult.approvedVerificationId ? (
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#a7f3d0]">
                      <span className="font-semibold text-[#047857]">
                        Your profile is already Admin-approved on PregMamas!
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLoadApprovedProfile(lookupResult.approvedVerificationId!)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#047857] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#065f46] cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                        Load My Approved Profile &amp; Unlock Studio
                      </button>
                    </div>
                  ) : (
                    <p className="m-0 text-[11px] text-[#047857]">
                      We auto-filled your South African clinical details below. Please attach your proof of certificate or supporting document below before submitting for Admin approval.
                    </p>
                  )}
                </div>
              )}

              {!lookupLoading && lookupResult && !lookupResult.recognized && (
                <div
                  role="status"
                  className="rounded-xl border border-[#f4b6d0] bg-[#fff7fa] px-3.5 py-2.5 text-xs text-[#5c223d] space-y-1"
                >
                  <p className="font-semibold text-[#9d174d] m-0">
                    Not automatically matched in public South African online directories
                  </p>
                  <p className="m-0">
                    {lookupResult.summary ||
                      'Some clinics and SANC midwives are not listed publicly online. Upload your HPCSA/SANC licence, practicing card, or qualification certificate below to complete verification.'}
                  </p>
                </div>
              )}

              {!lookupLoading && lookupError && (
                <p
                  role="status"
                  className="rounded-xl border border-[#f59e0b] bg-[#fffbeb] px-3.5 py-2 text-xs text-[#92400e] m-0"
                >
                  {lookupError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="verif-profession"
                className="block text-xs font-semibold text-[#3f0d24] mb-1"
              >
                Clinical Role
              </label>
              <select
                id="verif-profession"
                value={verifProfession}
                onChange={(e) => setVerifProfession(e.target.value)}
                className="pink-input"
              >
                <option value="Registered Midwife">Registered Midwife</option>
                <option value="Medical Doctor">Medical Doctor</option>
                <option value="Obstetrician / Gynaecologist">Obstetrician / Gynaecologist</option>
                <option value="Antenatal / Maternal Nurse">Antenatal / Maternal Nurse</option>
              </select>
            </div>

            <div>
              <label htmlFor="verif-body" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Medical / Nursing Council
              </label>
              <select
                id="verif-body"
                value={verifBody}
                onChange={(e) =>
                  setVerifBody(e.target.value as 'SANC' | 'HPCSA' | 'Other Medical Council')
                }
                className="pink-input"
              >
                <option value="HPCSA">HPCSA (Health Professions Council of SA)</option>
                <option value="SANC">SANC (South African Nursing Council)</option>
                <option value="Other Medical Council">Other Accredited Medical Council</option>
              </select>
            </div>

            <div>
              <label htmlFor="verif-num" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Registration / Practice Number (Optional)
              </label>
              <input
                id="verif-num"
                type="text"
                value={verifNumber}
                onChange={(e) => setVerifNumber(e.target.value)}
                placeholder="e.g., MP 0123456 or SANC-1234567"
                className="pink-input"
              />
            </div>

            <div>
              <label
                htmlFor="verif-facility"
                className="block text-xs font-semibold text-[#3f0d24] mb-1"
              >
                Hospital, Clinic, or Practice Name
              </label>
              <input
                id="verif-facility"
                type="text"
                required={!lookupResult?.recognized}
                value={verifFacility}
                onChange={(e) => setVerifFacility(e.target.value)}
                placeholder="e.g., Mowbray Maternity Unit, Netcare, or Private Practice"
                className="pink-input"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label
                htmlFor="verif-proof-file"
                className="block text-xs font-semibold text-[#3f0d24]"
              >
                Upload Proof of Certificate or Document (Required · JPG, PNG, WebP, PDF, DOC, DOCX · max 3 MB)
              </label>
              <div className="rounded-xl border-2 border-dashed border-[#ea91b8] bg-[#fff7fa] p-4 flex flex-wrap items-center justify-between gap-3">
                <label
                  htmlFor="verif-proof-file"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#be185d] bg-white px-4 py-2.5 text-xs font-semibold text-[#be185d] hover:bg-[#ffe4ef] cursor-pointer"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  {proofFileName ? 'Replace Certificate / Document' : 'Upload Certificate or Document *'}
                </label>
                <input
                  id="verif-proof-file"
                  type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                  onChange={handleProofFileChange}
                  className="sr-only"
                />
                {proofFileName ? (
                  <div className="flex items-center gap-2 text-xs text-[#3f0d24]">
                    <FileText className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                    <span className="font-semibold">{proofFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProofFileName('');
                        setProofDataUrl('');
                      }}
                      className="text-[#be123c] font-semibold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-[#7e405c]">
                    Required: Medical Licence, HPCSA Card, SANC APC, Midwifery / Qualification Certificate, or Hospital Letter (JPG, PNG, WebP, PDF, DOC, DOCX)
                  </span>
                )}
              </div>

              {proofDataUrl && proofDataUrl.startsWith('data:image/') && (
                <div className="rounded-xl border border-[#f4b6d0] bg-white p-2 max-w-xs">
                  <img
                    src={proofDataUrl}
                    alt="Uploaded clinician credential preview"
                    className="max-h-36 w-full object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="verif-notes" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Additional Verification Notes (Optional)
              </label>
              <input
                id="verif-notes"
                type="text"
                value={verifNotes}
                onChange={(e) => setVerifNotes(e.target.value)}
                placeholder="Any extra context for the Admin reviewing your credential..."
                className="pink-input"
              />
            </div>

            {verifError && (
              <p
                role="alert"
                className="md:col-span-2 rounded-xl border border-[#f43f5e] bg-[#fff1f2] px-3.5 py-2.5 text-xs font-semibold text-[#881337] m-0"
              >
                {verifError}
              </p>
            )}

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={verifSubmitting}
                className="pink-btn-primary text-xs disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                {verifSubmitting ? 'Submitting Proof...' : 'Submit Credentials for Admin Approval'}
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="text-xs font-semibold text-[#9d174d] hover:underline cursor-pointer"
                >
                  Admin Review Console →
                </button>
              )}
            </div>
          </form>
        </section>
      ) : myVerification.status === 'pending' ? (
        <section className="pink-card p-6 space-y-4 border-[#f59e0b] bg-[#fffcf5]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b45309] m-0">
                <Clock className="w-4 h-4" aria-hidden="true" />
                Waiting for Administrator Review &amp; Approval
              </p>
              <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                {myVerification.clinicianName} — {myVerification.profession}
              </h2>
              <p className="text-xs text-[#5c223d] m-0">
                <strong>{myVerification.registrationBody}:</strong>{' '}
                {myVerification.registrationNumber} · Facility: {myVerification.facilityName} ·
                Submitted {myVerification.submittedAt}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openResubmitForm}
                className="pink-btn-secondary !min-h-[36px] text-xs"
              >
                Edit / Resubmit Proof
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="pink-btn-primary !min-h-[36px] text-xs"
                >
                  Open Admin Review →
                </button>
              )}
            </div>
          </div>

          {myVerification.registryRecognized && (
            <div className="rounded-xl border border-[#059669] bg-[#ecfdf5] p-3.5 space-y-1.5 text-xs text-[#064e3b]">
              <p className="font-bold text-[#047857] m-0 inline-flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                Recognized in South African Medical Registry
              </p>
              {myVerification.registrySummary && (
                <p className="m-0 leading-relaxed">{myVerification.registrySummary}</p>
              )}
            </div>
          )}

          {myVerification.proofDataUrl && SAFE_PROOF_DATA_URL_RE.test(myVerification.proofDataUrl) && (
            <div className="rounded-xl border border-[#f4b6d0] bg-white p-3 max-w-sm space-y-1.5">
              <p className="text-[11px] font-semibold text-[#7e405c] m-0">Submitted Proof Document:</p>
              {myVerification.proofDataUrl.startsWith('data:image/') ? (
                <img
                  src={myVerification.proofDataUrl}
                  alt={myVerification.proofFileName || 'Submitted credential proof'}
                  className="max-h-40 w-full object-contain rounded-lg"
                />
              ) : (
                <p className="text-xs font-semibold text-[#be185d] m-0 inline-flex items-center gap-1.5">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  {myVerification.proofFileName || 'Certificate Document Attached'}
                </p>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="pink-card p-5 flex flex-wrap items-center justify-between gap-3 border-[#db2777] bg-[#fff5f9]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#be185d] m-0">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Verified Clinician Profile Approved by Admin
              </p>
              {myVerification.registryRecognized && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#ecfdf5] border border-[#059669] px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                  <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                  SA Registry Recognized
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-[#3f0d24] m-0">
              {myVerification.clinicianName} · {myVerification.profession} ·{' '}
              {myVerification.registrationBody} {myVerification.registrationNumber}
            </p>
            <p className="text-xs text-[#5c223d] m-0">
              Facility: {myVerification.facilityName}
              {myVerification.adminReviewNote ? ` · Admin note: ${myVerification.adminReviewNote}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={openResubmitForm}
            className="pink-btn-secondary !min-h-[34px] text-xs"
          >
            Update Credentials
          </button>
        </section>
      )}

      {/* Step 2: Clinical Studio (Unlocked only after Admin approval) */}
      {!isVerifiedClinician ? (
        <div className="pink-panel p-6 sm:p-8 text-center space-y-2">
          <div className="mx-auto w-11 h-11 rounded-full bg-[#ffe4ef] text-[#be185d] grid place-items-center">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            Clinical Publishing &amp; Replies Locked Until Verified
          </h2>
          <p className="text-xs text-[#5c223d] max-w-lg mx-auto m-0 leading-relaxed">
            For maternal safety, only doctors and midwives who have uploaded their proof of certificate or supporting document and been approved by an Administrator can post clinical advice or reply as verified staff.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <form onSubmit={handlePublishArticle} className="lg:col-span-5 pink-card p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
              {tr(4, 'Share Clinical Knowledge')}
            </h2>

                <div>
                  <label htmlFor="art-title" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                    Knowledge Heading
                  </label>
                  <input
                    id="art-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., How to Manage Swollen Ankles Safely at 32 Weeks"
                    className="pink-input"
                  />
                </div>

                <div>
                  <label htmlFor="art-knowledge" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                    Your Knowledge &amp; Advice for Mothers
                  </label>
                  <textarea
                    id="art-knowledge"
                    rows={6}
                    required
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                    placeholder="Write your clinical advice in simple language. Put each key point on a new line if helpful..."
                    className="pink-input"
                  />
                </div>

                <div>
                  <label htmlFor="doc-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                    Posted By (Verified Doctor / Midwife)
                  </label>
                  <input
                    id="doc-name"
                    type="text"
                    value={clinicianDisplay}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Verified clinician name"
                    className="pink-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishing || !title.trim() || !knowledgeText.trim()}
                  className="pink-btn-primary w-full disabled:opacity-60"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {publishing ? 'Posting to User Dashboard...' : tr(5, 'Post to User Dashboard')}
                </button>

                {publishedBanner && (
                  <div
                    role="status"
                    className="rounded-xl border border-[#db2777] bg-[#ffeef5] p-4 space-y-2 text-xs text-[#3f0d24]"
                  >
                    <p className="font-semibold text-[#be185d] flex items-center gap-1.5 m-0">
                      <Check className="w-4 h-4" aria-hidden="true" />
                      {publishedBanner}
                    </p>
                    {onNavigate && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('/dashboard')}
                          className="pink-btn-secondary !min-h-[34px] text-xs"
                        >
                          Open User Dashboard
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('/learn')}
                          className="pink-btn-secondary !min-h-[34px] text-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                          Open Learn Page
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>

              {/* Direct View of Posted Knowledge + Mother Comments & Replies */}
              <div className="lg:col-span-7 space-y-4">
                <div className="pink-card p-5 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                      {tr(6, 'Published Knowledge & Mother Comments')}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#be185d]">
                      <HelpCircle className="w-4 h-4" aria-hidden="true" />
                      {totalQuestionsCount} comment(s)
                    </span>
                  </div>
                  <p className="text-xs text-[#5c223d] m-0">
                    Read what mothers commented or asked on your posts and reply directly as{' '}
                    <strong>{clinicianDisplay}</strong>.
                  </p>
                </div>

                <div className="space-y-4">
                  {orderedKnowledgeAndComments.map((art) => {
                    const count = articleComments[art.id]?.length || 0;
                    return (
                      <article
                        key={art.id}
                        className={`pink-card p-5 space-y-3 ${
                          art.isClinicianPublished ? 'border-[#db2777] bg-[#fff5f9]' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#be185d]">
                              {LEARNING_TOPICS.find((top) => top.slug === art.topic)?.label ||
                                'Clinic Knowledge'}
                            </span>
                            {art.isClinicianPublished && (
                              <span className="rounded-md bg-[#be185d] px-2 py-0.5 text-[10px] font-bold text-white">
                                Live on User Dashboard
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                            {art.title}
                          </h3>
                          <p className="text-[11px] text-[#7e405c] m-0">
                            By <strong>{art.authorName}</strong> · {art.authorProfession}
                          </p>
                        </div>

                        <p className="text-xs text-[#3f0d24] m-0 leading-relaxed">{art.summary}</p>
                        {art.body.length > 1 && (
                          <ul className="space-y-1 text-xs text-[#5c223d] m-0 pl-0 list-none">
                            {art.body.slice(1, 4).map((pt, idx) => (
                              <li key={idx}>• {pt}</li>
                            ))}
                          </ul>
                        )}

                        <ArticleCommentsBox
                          articleId={art.id}
                          articleTitle={art.title}
                          user={{
                            name: clinicianDisplay,
                            email: user?.email || 'clinician@pregmamas.com',
                            role: 'professional',
                            region: user?.region || 'South Africa',
                            dateOfBirth: '1985-01-01',
                          }}
                          defaultOpen={count > 0 || Boolean(art.isClinicianPublished)}
                        />
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
      )}
    </div>
  );
}

const ADMIN_TEXTS = [
  'Administrator Area',
  'Platform Governance & Safety Console',
  'Review doctor and midwife qualification proofs, approve verified staff, and oversee published clinical content.',
  '1. Doctor & Midwife Verification Review',
  'Approve Clinician',
  '2. Content Approval Queue',
  'Approve for Publishing',
];

export function AdminPage({
  adminSession,
  onAdminAuthSuccess,
  onAdminLogout,
}: {
  adminSession: AdminSession | null;
  onAdminAuthSuccess: (session: AdminSession) => void;
  onAdminLogout: () => Promise<void> | void;
}) {
  const { translated } = useTranslatedTexts(ADMIN_TEXTS);
  const tr = (idx: number, fallback: string) => translated[idx] || fallback;
  const { clinicianVerifications, reviewClinicianVerification, customArticles } =
    useSharedContent();

  const [authStatusLoading, setAuthStatusLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'env' | 'claimed' | 'setup_required'>('claimed');
  const [loginIdInput, setLoginIdInput] = useState('');
  const [confirmIdInput, setConfirmIdInput] = useState('');
  const [showId, setShowId] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewBusy, setReviewBusy] = useState<Record<string, boolean>>({});
  const [reviewError, setReviewError] = useState('');

  const checkAdminAuthStatus = useCallback(async () => {
    setAuthStatusLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminSession?.token) {
        headers.Authorization = `Bearer ${adminSession.token}`;
      }
      const res = await fetch('/api/admin/auth/status', { headers });
      if (!res.ok) return;
      const data = (await res.json()) as {
        mode: 'env' | 'claimed' | 'setup_required';
        authenticated: boolean;
      };
      setAuthMode(data.mode);
      if (adminSession && !data.authenticated) {
        await onAdminLogout();
      }
    } catch {
      // keep current state on transient error
    } finally {
      setAuthStatusLoading(false);
    }
  }, [adminSession, onAdminLogout]);

  useEffect(() => {
    void checkAdminAuthStatus();
  }, [checkAdminAuthStatus]);

  const handleAdminSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanId = loginIdInput.trim();
    if (cleanId.length < 6 || cleanId.length > 64) {
      setAuthError('Administrator ID must be between 6 and 64 characters.');
      return;
    }
    if (cleanId !== confirmIdInput.trim()) {
      setAuthError('Administrator IDs do not match. Please confirm your Administrator ID.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: cleanId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
        mode?: 'env' | 'claimed';
      };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Could not configure Administrator ID.');
        if (res.status === 403) {
          setAuthMode('claimed');
        }
        return;
      }
      setLoginIdInput('');
      setConfirmIdInput('');
      setAuthMode('claimed');
      onAdminAuthSuccess({ token: data.token, mode: data.mode || 'claimed' });
    } catch {
      setAuthError('Network error while setting up Administrator ID. Please try again.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanId = loginIdInput.trim();
    if (!cleanId) {
      setAuthError('Please enter your Administrator ID.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: cleanId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
        mode?: 'env' | 'claimed';
      };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Invalid Administrator ID.');
        if (res.status === 409) {
          setAuthMode('setup_required');
        }
        return;
      }
      setLoginIdInput('');
      onAdminAuthSuccess({ token: data.token, mode: data.mode || 'claimed' });
    } catch {
      setAuthError('Network error while verifying Administrator ID. Please try again.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const orderedVerifications = useMemo(() => {
    const rank = { pending: 0, rejected: 1, approved: 2 };
    return [...clinicianVerifications].sort((a, b) => rank[a.status] - rank[b.status]);
  }, [clinicianVerifications]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (reviewBusy[id] || !adminSession?.token) return;
    setReviewError('');
    setReviewBusy((prev) => ({ ...prev, [id]: true }));
    try {
      await reviewClinicianVerification(id, status, adminSession.token, reviewNotes[id]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not save review decision. Please sign in again.';
      setReviewError(msg);
      if (/unauthorized|expired|required/i.test(msg)) {
        await onAdminLogout();
      }
    } finally {
      setReviewBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (!adminSession) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="pink-hero-panel p-6 sm:p-8">
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            Administrator Dashboard
          </h1>
        </div>

        <div className="pink-card p-6 sm:p-8 space-y-5">
          {authStatusLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#5c223d]">
              <Loader2 className="w-4 h-4 animate-spin text-[#be185d]" aria-hidden="true" />
              <span>Checking Administrator access status...</span>
            </div>
          ) : authMode === 'setup_required' ? (
            <form onSubmit={handleAdminSetupSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-setup-id"
                  className="block text-xs font-semibold text-[#3f0d24] mb-1"
                >
                  Administrator ID
                </label>
                <div className="relative">
                  <input
                    id="admin-setup-id"
                    type={showId ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="off"
                    value={loginIdInput}
                    onChange={(e) => setLoginIdInput(e.target.value)}
                    placeholder="Enter your Administrator ID"
                    className="pink-input font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowId((prev) => !prev)}
                    aria-label={showId ? 'Hide Administrator ID' : 'Show Administrator ID'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7e405c] hover:text-[#be185d] cursor-pointer"
                  >
                    {showId ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-setup-confirm"
                  className="block text-xs font-semibold text-[#3f0d24] mb-1"
                >
                  Confirm Administrator ID
                </label>
                <input
                  id="admin-setup-confirm"
                  type={showId ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="off"
                  value={confirmIdInput}
                  onChange={(e) => setConfirmIdInput(e.target.value)}
                  placeholder="Re-enter your Administrator ID"
                  className="pink-input font-mono"
                />
              </div>

              {authError && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#e11d48] bg-[#fff1f2] p-3 text-xs text-[#9f1239] flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="pink-btn-primary w-full disabled:opacity-60"
              >
                {authSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{authSubmitting ? 'Saving Administrator ID...' : 'Save Administrator ID'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-login-id"
                  className="block text-xs font-semibold text-[#3f0d24] mb-1"
                >
                  Administrator ID
                </label>
                <div className="relative">
                  <input
                    id="admin-login-id"
                    type={showId ? 'text' : 'password'}
                    required
                    autoComplete="off"
                    value={loginIdInput}
                    onChange={(e) => setLoginIdInput(e.target.value)}
                    placeholder="Enter your Administrator ID"
                    className="pink-input font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowId((prev) => !prev)}
                    aria-label={showId ? 'Hide Administrator ID' : 'Show Administrator ID'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7e405c] hover:text-[#be185d] cursor-pointer"
                  >
                    {showId ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#e11d48] bg-[#fff1f2] p-3 text-xs text-[#9f1239] flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                className="pink-btn-primary w-full disabled:opacity-60"
              >
                {authSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{authSubmitting ? 'Verifying Administrator ID...' : 'Sign In as Administrator'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            {tr(0, 'Administrator Area')}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            {tr(1, 'Platform Governance & Safety Console')}
          </h1>
          <p className="text-sm text-[#5c223d] m-0">
            {tr(
              2,
              'Review doctor and midwife qualification proofs, approve verified staff, and oversee published clinical content.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="rounded-xl border border-[#db2777] bg-white px-3.5 py-2 text-xs text-[#3f0d24]">
            <span className="text-[#7e405c] block text-[10px] uppercase tracking-wider font-semibold">
              Access Status
            </span>
            <span className="font-semibold text-[#9d174d] inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Verified Administrator
            </span>
          </div>
          <button
            type="button"
            onClick={() => void onAdminLogout()}
            className="pink-btn-secondary !min-h-[40px] text-xs"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {reviewError && (
        <div
          role="alert"
          className="rounded-2xl border border-[#e11d48] bg-[#fff1f2] p-4 text-xs text-[#9f1239] flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{reviewError}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 pink-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            {tr(3, '1. Doctor & Midwife Verification Review')}
          </h2>

          {orderedVerifications.length === 0 ? (
            <div className="pink-panel p-5 space-y-1.5">
              <p className="text-sm font-semibold text-[#3f0d24] m-0 inline-flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                No practitioner verification requests yet
              </p>
              <p className="text-xs text-[#5c223d] m-0">
                When a doctor or midwife submits their SANC / HPCSA registration number or uploads their practicing certificate on the Doctor / Midwife page, it will appear here for your approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderedVerifications.map((v) => {
                const noteValue = reviewNotes[v.id] ?? v.adminReviewNote ?? '';
                const busy = Boolean(reviewBusy[v.id]);
                return (
                  <article
                    key={v.id}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      v.status === 'approved'
                        ? 'border-[#db2777] bg-[#fff5f9]'
                        : v.status === 'rejected'
                          ? 'border-[#f43f5e] bg-[#fff1f2]'
                          : 'border-[#f4b6d0] bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base font-semibold text-[#3f0d24] m-0">
                          {v.clinicianName}
                        </h3>
                        <p className="text-xs text-[#5c223d] m-0">
                          {v.profession} · <strong>{v.registrationBody}</strong>:{' '}
                          {v.registrationNumber}
                        </p>
                        <p className="text-[11px] text-[#7e405c] m-0">
                          Facility: {v.facilityName} · Submitted: {v.submittedAt}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                          v.status === 'approved'
                            ? 'bg-[#be185d] text-white'
                            : v.status === 'rejected'
                              ? 'bg-[#be123c] text-white'
                              : 'bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]'
                        }`}
                      >
                        {v.status === 'approved' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            Approved
                          </>
                        ) : v.status === 'rejected' ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            Rejected
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            Pending Review
                          </>
                        )}
                      </span>
                    </div>

                    {v.registryRecognized && (
                      <div className="rounded-xl border border-[#059669] bg-[#ecfdf5] p-3 space-y-2 text-xs text-[#064e3b]">
                        <p className="font-bold text-[#047857] m-0 inline-flex items-center gap-1.5">
                          <BadgeCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                          Recognized in South African Medical Registry ({v.registrationBody})
                        </p>
                        {v.registrySummary && (
                          <p className="m-0 leading-relaxed text-[#065f46]">{v.registrySummary}</p>
                        )}
                        {v.registrySources && v.registrySources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {v.registrySources.map((src, idx) => (
                              <a
                                key={`${src.uri}-${idx}`}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-[#6ee7b7] bg-white px-2 py-1 text-[11px] font-semibold text-[#047857] hover:bg-[#d1fae5]"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                                <span className="max-w-[190px] truncate">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {v.notes && (
                      <p className="text-xs text-[#3f0d24] bg-[#fff7fa] border border-[#ffd6e7] rounded-xl px-3 py-2 m-0">
                        <strong>Practitioner note:</strong> {v.notes}
                      </p>
                    )}

                    {v.proofDataUrl && SAFE_PROOF_DATA_URL_RE.test(v.proofDataUrl) ? (
                      <div className="rounded-xl border border-[#f4b6d0] bg-[#fff7fa] p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#3f0d24] inline-flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                            {v.proofFileName || 'Submitted Proof Document'}
                          </span>
                          <a
                            href={v.proofDataUrl}
                            download={v.proofFileName || `${v.clinicianName}-proof`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#be185d] hover:underline"
                          >
                            <Download className="w-3.5 h-3.5" aria-hidden="true" />
                            Download Proof
                          </a>
                        </div>
                        {v.proofDataUrl.startsWith('data:image/') && (
                          <img
                            src={v.proofDataUrl}
                            alt={`Qualification proof for ${v.clinicianName}`}
                            className="max-h-52 w-full object-contain rounded-xl border border-[#ffd6e7] bg-white p-1"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#7e405c] m-0">
                        {v.proofDataUrl
                          ? 'Attached file could not be previewed because its format is not supported.'
                          : v.registryRecognized
                            ? `Verified via South African medical directory lookup (${v.registrationBody} · ${v.registrationNumber}).`
                            : `Verification submitted via ${v.registrationBody} registration number (${v.registrationNumber}).`}
                      </p>
                    )}

                    {v.reviewedAt && (
                      <p className="text-[11px] text-[#7e405c] m-0">
                        Last reviewed: {v.reviewedAt}
                      </p>
                    )}

                    <div className="space-y-2 pt-1 border-t border-[#ffd6e7]">
                      <input
                        type="text"
                        value={noteValue}
                        onChange={(e) =>
                          setReviewNotes((prev) => ({ ...prev, [v.id]: e.target.value }))
                        }
                        placeholder="Optional Admin review note (e.g., HPCSA verified / please re-upload clear card)..."
                        className="pink-input text-xs"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy || v.status === 'approved'}
                          onClick={() => void handleReview(v.id, 'approved')}
                          className="pink-btn-primary !min-h-[36px] text-xs disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          {v.status === 'approved' ? 'Approved' : tr(4, 'Approve Clinician')}
                        </button>
                        <button
                          type="button"
                          disabled={busy || v.status === 'rejected'}
                          onClick={() => void handleReview(v.id, 'rejected')}
                          className="pink-btn-secondary !min-h-[36px] text-xs text-[#be123c] border-[#f43f5e] disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          {v.status === 'rejected' ? 'Rejected' : 'Reject / Request Update'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 pink-card p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            {tr(5, '2. Content Approval Queue')}
          </h2>
          {customArticles.length === 0 ? (
            <div className="pink-panel p-5 space-y-1.5">
              <p className="text-sm font-semibold text-[#3f0d24] m-0 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#be185d]" aria-hidden="true" />
                No submitted articles in queue yet
              </p>
              <p className="text-xs text-[#5c223d] m-0">
                Clinical knowledge published by verified healthcare professionals will show up here for governance review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customArticles.map((art) => {
                const isReviewed = approvedIds.includes(art.id);
                return (
                  <div key={art.id} className="pink-panel p-4 space-y-2">
                    <p className="text-sm font-semibold text-[#3f0d24] m-0">{art.title}</p>
                    <p className="text-xs text-[#5c223d] m-0">
                      Author: {art.authorName} ({art.authorProfession})
                    </p>
                    <p className="text-xs font-semibold text-[#be185d] m-0">
                      Status: {isReviewed ? 'Approved' : 'Live (Pending Audit)'}
                    </p>
                    {!isReviewed && (
                      <button
                        type="button"
                        onClick={() => setApprovedIds((prev) => [...prev, art.id])}
                        className="pink-btn-primary text-xs"
                      >
                        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                        {tr(6, 'Approve for Publishing')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
