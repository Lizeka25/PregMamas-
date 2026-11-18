import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Clock,
  Download,
  FilePlus2,
  FileText,
  Flag,
  HelpCircle,
  Lock,
  MessageCircle,
  Send,
  ShieldCheck,
  Stethoscope,
  Upload,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  AppRoute,
  DemoUser,
  IMAGES,
  LEARNING_TOPICS,
  SA_PROVINCES,
} from '../data/pregmamasData';
import { useLanguage, useTranslatedTexts } from '../context/LanguageContext';
import { PinkDatePickerButton } from '../components/PinkDatePickerButton';
import { useSharedContent } from '../context/SharedContentContext';
import { ArticleCommentsBox } from '../components/ArticleCommentsBox';

export function CommunityPage({ user = null }: { user?: DemoUser | null }) {
  const { t } = useLanguage();
  const { communityPosts, createCommunityPost, addCommunityReply } = useSharedContent();
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [body, setBody] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const isClinician = user?.role === 'professional';

  const postBatch = useMemo(() => {
    const texts: string[] = [];
    const postMap: Array<{
      titleIdx: number | null;
      bodyIdx: number;
      replyIdxs: number[];
    }> = [];

    communityPosts.forEach((p) => {
      let titleIdx: number | null = null;
      if (p.title) {
        titleIdx = texts.length;
        texts.push(p.title);
      }
      const bodyIdx = texts.length;
      texts.push(p.body);
      const replyIdxs: number[] = [];
      p.replies.forEach((r) => {
        replyIdxs.push(texts.length);
        texts.push(r.text);
      });
      postMap.push({ titleIdx, bodyIdx, replyIdxs });
    });

    return { texts, postMap };
  }, [communityPosts]);

  const { translated } = useTranslatedTexts(postBatch.texts);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || posting) return;
    setPosting(true);
    try {
      await createCommunityPost({
        author: authorName.trim() || user?.name || (isClinician ? 'PregMamas Clinician' : 'Mama on PregMamas'),
        authorRole: user?.role || 'mother',
        professionBadge: isClinician ? 'Verified Doctor / Midwife' : undefined,
        body: body.trim(),
      });
      setBody('');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return;
    await addCommunityReply({
      postId,
      author:
        authorName.trim() ||
        user?.name ||
        (isClinician ? 'PregMamas Doctor / Midwife' : 'Community Mama'),
      authorRole: user?.role || 'mother',
      professionBadge: isClinician ? 'Verified Doctor / Midwife' : undefined,
      text: replyText.trim(),
    });
    setReplyText('');
    setReplyTarget(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pink-hero-panel p-6 sm:p-8 grid gap-6 md:grid-cols-12 items-center">
        <div className="md:col-span-7 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
            {t('comm.eyebrow')}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            {t('comm.title')}
          </h1>
          <p className="text-sm text-[#5c223d] m-0">{t('comm.subtitle')}</p>
        </div>
        <div className="md:col-span-5">
          <img
            src={IMAGES.teenSupport}
            alt="Supportive mothers and counselor talking together"
            referrerPolicy="no-referrer"
            className="w-full aspect-[4/3] object-cover rounded-2xl border border-[#ea91b8]"
          />
        </div>
      </div>

      <form onSubmit={handleCreatePost} className="pink-card p-6 space-y-3">
        <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
          {t('comm.formTitle')}
        </h2>
        <p className="text-xs text-[#5c223d] m-0">{t('comm.formSub')}</p>
        <div>
          <label htmlFor="comm-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
            {t('comm.nameLabel')}
          </label>
          <input
            id="comm-name"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t('comm.namePlaceholder')}
            className="pink-input"
          />
        </div>
        <div>
          <label htmlFor="comm-body" className="block text-xs font-semibold text-[#3f0d24] mb-1">
            {t('comm.thoughtLabel')}
          </label>
          <textarea
            id="comm-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('comm.thoughtPlaceholder')}
            className="pink-input"
          />
        </div>
        <button type="submit" disabled={!body.trim() || posting} className="pink-btn-primary disabled:opacity-60">
          {posting ? t('comm.postingBtn') : t('comm.postBtn')}
        </button>
      </form>

      <div className="space-y-4">
        {communityPosts.length === 0 ? (
          <div className="pink-card p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-[#3f0d24] m-0">
              No community posts yet
            </p>
            <p className="text-xs text-[#5c223d] m-0">
              PregMamas is brand new—share the first thought, experience, or question above for mothers and clinicians to read.
            </p>
          </div>
        ) : (
          communityPosts.map((post, pIdx) => {
          const map = postBatch.postMap[pIdx];
          return (
            <article key={post.id} className="pink-card p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7e405c]">
                <span className="inline-flex flex-wrap items-center gap-2">
                  {post.authorRole === 'professional' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#be185d] px-2 py-0.5 text-[10px] font-bold text-white">
                      <Stethoscope className="w-3 h-3" aria-hidden="true" />
                      {post.professionBadge || 'Doctor / Midwife'}
                    </span>
                  )}
                  <strong className="text-[#be185d]">{post.author}</strong> · {post.createdAt}
                </span>
                <button
                  type="button"
                  onClick={() => setReportedIds((prev) => [...prev, post.id])}
                  className="inline-flex items-center gap-1 text-xs text-[#7e405c] hover:text-[#be123c] cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                  {reportedIds.includes(post.id) ? t('comm.reportedBtn') : t('comm.reportBtn')}
                </button>
              </div>
              {post.title && map.titleIdx !== null && (
                <h3 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                  {translated[map.titleIdx] || post.title}
                </h3>
              )}
              <p className="text-sm text-[#3f0d24] leading-relaxed m-0 whitespace-pre-line">
                {translated[map.bodyIdx] || post.body}
              </p>

              {post.replies.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#ffd6e7]">
                  {post.replies.map((r, rIdx) => {
                    const isDoc = r.authorRole === 'professional' || /midwife|doctor|dr\./i.test(r.author);
                    return (
                      <div
                        key={r.id}
                        className={`rounded-xl p-3 text-xs space-y-1 border ${
                          isDoc
                            ? 'bg-[#ffeef5] border-[#db2777]'
                            : 'bg-white border-[#ffd6e7]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="inline-flex flex-wrap items-center gap-1.5">
                            {isDoc && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#be185d] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                <Stethoscope className="w-3 h-3" aria-hidden="true" />
                                {r.professionBadge || 'Verified Doctor / Midwife'}
                              </span>
                            )}
                            <strong className="text-[#3f0d24]">{r.author}:</strong>
                          </span>
                          {r.createdAt && <span className="text-[10px] text-[#7e405c]">{r.createdAt}</span>}
                        </div>
                        <p className="text-[#5c223d] m-0 leading-relaxed">
                          {translated[map.replyIdxs[rIdx]] || r.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {replyTarget === post.id ? (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isClinician ? 'Write a verified Doctor / Midwife comment...' : 'Write a supportive reply...'}
                    className="pink-input"
                  />
                  <button
                    type="button"
                    onClick={() => void handleReply(post.id)}
                    className="pink-btn-primary text-xs"
                  >
                    {t('comm.replyBtn')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setReplyTarget(post.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#be185d] hover:underline cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  {t('comm.replyBtn')}
                </button>
              )}
            </article>
          );
          })
        )}
      </div>
    </div>
  );
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
  'Explore the platform right away as a pregnant mother, a verified healthcare professional, or a platform administrator.',
  'Mother Demo',
  'Week 24 · Supplements, Bag & Partner Consent',
  'Healthcare Pro Demo',
  'Draft articles & moderate reports',
  'Administrator Demo',
  'Verify pros, approve articles & safety',
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
            onClick={() => handleDemo('admin', 'Admin Reviewer', '/admin')}
            className="pink-card p-4 text-left hover:border-[#db2777] cursor-pointer"
          >
            <strong className="block text-sm font-semibold text-[#3f0d24]">{tr(13, 'Administrator Demo')}</strong>
            <span className="block text-xs text-[#5c223d] mt-1">
              {tr(14, 'Verify pros, approve articles & safety')}
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
  'Partner / Family Caregiver',
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
              <option value="partner">{tr(4, 'Partner / Family Caregiver')}</option>
              <option value="professional">{tr(5, 'Healthcare Professional (Midwife / Nurse / Doctor)')}</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                {tr(6, 'Full Name')}
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
                {tr(7, 'Email Address')}
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
                {tr(8, 'Date of Birth')}
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
                {tr(9, 'Province in South Africa')}
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
                  {tr(10, 'First Day of Last Menstrual Period (LMP) — optional')}
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
                  <strong>{tr(11, 'Optional Partner Education Consent:')}</strong>{' '}
                  {tr(12, 'Send general weekly educational tips only. Never shares health logs, mood, weight, or HIV status.')}
                </span>
              </label>
            </>
          )}

          <button type="submit" className="pink-btn-primary w-full">
            {tr(13, 'Create PregMamas Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

const MY_CLINICIAN_VERIF_ID_KEY = 'pregmamas_my_clinician_verif_id_v1';
const MAX_PROOF_FILE_BYTES = 2.5 * 1024 * 1024;

const PRO_STATIC_TEXTS = [
  'Doctor & Midwife Clinical Studio',
  'Verify Credentials, Post Knowledge & Reply to Mothers',
  'Submit your medical registration number or practicing certificate for Administrator approval. Once approved, publish clinical guidance and reply to mothers.',
  'Post Knowledge & Read Comments',
  'Community Posts & Replies',
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
    communityPosts,
    clinicianVerifications,
    publishClinicianArticle,
    addCommunityReply,
    submitClinicianVerification,
  } = useSharedContent();

  const [activeTab, setActiveTab] = useState<'write' | 'community'>('write');

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

  // Direct clinical knowledge authoring
  const [authorName, setAuthorName] = useState(
    myVerification?.clinicianName || (user?.role === 'professional' ? user.name : '')
  );
  const [title, setTitle] = useState('');
  const [knowledgeText, setKnowledgeText] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedBanner, setPublishedBanner] = useState<string>('');

  // Clinician reply state for Community Posts
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replySending, setReplySending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (myVerification?.clinicianName && !authorName.trim()) {
      setAuthorName(myVerification.clinicianName);
    }
  }, [myVerification, authorName]);

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
      setVerifError('Please choose an image or PDF smaller than 2.5 MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
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
    const cleanFacility = verifFacility.trim();

    if (!cleanName) {
      setVerifError('Please enter your full name and clinical title (e.g. Dr. or Sr.).');
      return;
    }
    if (!cleanNumber && !proofDataUrl) {
      setVerifError(
        'Please enter your SANC / HPCSA registration number or upload a certificate / practicing card.'
      );
      return;
    }
    if (!cleanFacility) {
      setVerifError('Please enter your clinic, hospital, or practice name.');
      return;
    }

    setVerifSubmitting(true);
    try {
      const created = await submitClinicianVerification({
        clinicianName: cleanName,
        profession: verifProfession,
        registrationBody: verifBody,
        registrationNumber: cleanNumber || 'Certificate Attached',
        facilityName: cleanFacility,
        proofFileName: proofFileName || undefined,
        proofDataUrl: proofDataUrl || undefined,
        notes: verifNotes.trim() || undefined,
      });
      setMyVerifId(created.id);
      try {
        localStorage.setItem(MY_CLINICIAN_VERIF_ID_KEY, created.id);
      } catch {
        // ignore
      }
      setAuthorName(created.clinicianName);
      setEditingVerif(false);
    } catch {
      setVerifError('Could not submit verification right now. Please try again.');
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
        myVerification.registrationNumber === 'Certificate Attached'
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

  const handleClinicianCommunityReply = async (postId: string) => {
    if (!isVerifiedClinician) return;
    const text = (replyDrafts[postId] || '').trim();
    if (!text || replySending[postId]) return;
    setReplySending((prev) => ({ ...prev, [postId]: true }));
    try {
      await addCommunityReply({
        postId,
        author: clinicianDisplay,
        authorRole: 'professional',
        professionBadge: clinicianBadgeLabel,
        text,
      });
      setReplyDrafts((prev) => ({ ...prev, [postId]: '' }));
    } finally {
      setReplySending((prev) => ({ ...prev, [postId]: false }));
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

  const showSubmissionForm =
    !myVerification || myVerification.status === 'rejected' || editingVerif;

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
              'Submit your medical registration number or practicing certificate for Administrator approval. Once approved, publish clinical guidance and reply to mothers.'
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
              Proof Required
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
                Submit Doctor or Midwife Qualification Proof
              </h2>
              <p className="text-xs text-[#5c223d] m-0">
                Provide your HPCSA / SANC registration number and/or upload a practicing certificate or medical licence photo. The Administrator will review and approve your profile.
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
            <div>
              <label htmlFor="verif-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Full Name &amp; Title
              </label>
              <input
                id="verif-name"
                type="text"
                required
                value={verifName}
                onChange={(e) => setVerifName(e.target.value)}
                placeholder="e.g., Dr. N. Dlamini or Sr. K. Nkosi"
                className="pink-input"
              />
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
                <option value="SANC">SANC (South African Nursing Council)</option>
                <option value="HPCSA">HPCSA (Health Professions Council of SA)</option>
                <option value="Other Medical Council">Other Accredited Medical Council</option>
              </select>
            </div>

            <div>
              <label htmlFor="verif-num" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Registration / Practice Number
              </label>
              <input
                id="verif-num"
                type="text"
                value={verifNumber}
                onChange={(e) => setVerifNumber(e.target.value)}
                placeholder="e.g., SANC-1234567 or MP 0123456"
                className="pink-input"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="verif-facility"
                className="block text-xs font-semibold text-[#3f0d24] mb-1"
              >
                Hospital, Clinic, or Practice Name
              </label>
              <input
                id="verif-facility"
                type="text"
                required
                value={verifFacility}
                onChange={(e) => setVerifFacility(e.target.value)}
                placeholder="e.g., Mowbray Maternity Unit or Private Practice"
                className="pink-input"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label
                htmlFor="verif-proof-file"
                className="block text-xs font-semibold text-[#3f0d24]"
              >
                Upload Certificate, Practicing Card, or Qualification Proof (Photo or PDF, max 2.5 MB)
              </label>
              <div className="rounded-xl border border-dashed border-[#ea91b8] bg-[#fff7fa] p-4 flex flex-wrap items-center justify-between gap-3">
                <label
                  htmlFor="verif-proof-file"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#be185d] bg-white px-3.5 py-2 text-xs font-semibold text-[#be185d] hover:bg-[#ffe4ef] cursor-pointer"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  {proofFileName ? 'Replace Proof File' : 'Choose Certificate / Photo / PDF'}
                </label>
                <input
                  id="verif-proof-file"
                  type="file"
                  accept="image/*,.pdf"
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
                    Accepted: JPG, PNG, WebP, or PDF certificate
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
                {verifSubmitting ? 'Submitting Proof...' : 'Submit Proof for Admin Review'}
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

          {myVerification.proofDataUrl && (
            <div className="rounded-xl border border-[#f4b6d0] bg-white p-3 max-w-sm space-y-1.5">
              <p className="text-[11px] font-semibold text-[#7e405c] m-0">Submitted Proof File:</p>
              {myVerification.proofDataUrl.startsWith('data:image/') ? (
                <img
                  src={myVerification.proofDataUrl}
                  alt={myVerification.proofFileName || 'Submitted credential proof'}
                  className="max-h-40 w-full object-contain rounded-lg"
                />
              ) : (
                <p className="text-xs font-semibold text-[#be185d] m-0 inline-flex items-center gap-1.5">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  {myVerification.proofFileName || 'Certificate PDF Attached'}
                </p>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="pink-card p-5 flex flex-wrap items-center justify-between gap-3 border-[#db2777] bg-[#fff5f9]">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#be185d] m-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Verified Clinician Profile Approved by Admin
            </p>
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
            For maternal safety, only doctors and midwives whose medical council number or practicing certificate has been reviewed and approved by an Administrator can post clinical advice or reply as verified staff.
          </p>
        </div>
      ) : (
        <>
          {/* Simple 2-Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'write'
                  ? 'bg-[#be185d] text-white border-[#be185d]'
                  : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8] hover:bg-[#ffe4ef]'
              }`}
            >
              <FilePlus2 className="w-4 h-4" aria-hidden="true" />
              {tr(3, 'Post Knowledge & Read Comments')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'community'
                  ? 'bg-[#be185d] text-white border-[#be185d]'
                  : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8] hover:bg-[#ffe4ef]'
              }`}
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              {tr(4, 'Community Posts & Replies')}
            </button>
          </div>

          {/* TAB 1: Direct Knowledge Post + Immediate Comments & Replies */}
          {activeTab === 'write' && (
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              <form onSubmit={handlePublishArticle} className="lg:col-span-5 pink-card p-6 space-y-4">
                <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                  {tr(5, 'Share Clinical Knowledge')}
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
                  {publishing ? 'Posting to User Dashboard...' : tr(6, 'Post to User Dashboard')}
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
                      {tr(7, 'Published Knowledge & Mother Comments')}
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

          {/* TAB 2: View User Community Posts & Comment as Doctor / Midwife */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              <div className="pink-card p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                    User Community Posts — Read &amp; Reply
                  </h2>
                  <p className="text-xs text-[#5c223d] mt-1 m-0">
                    Replying as <strong>{clinicianDisplay}</strong> ({clinicianBadgeLabel}). Your replies appear immediately with a Verified Clinician badge.
                  </p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/community')}
                    className="pink-btn-secondary text-xs"
                  >
                    Open Public Community →
                  </button>
                )}
              </div>

              {communityPosts.length === 0 ? (
                <div className="pink-card p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-[#3f0d24] m-0">
                    No community posts yet
                  </p>
                  <p className="text-xs text-[#5c223d] m-0">
                    When mothers post questions or experiences in the Community section, they will appear here for verified clinicians to read and reply.
                  </p>
                </div>
              ) : (
                communityPosts.map((post) => (
                  <article key={post.id} className="pink-card p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7e405c]">
                      <span>
                        <strong className="text-[#be185d]">{post.author}</strong> · {post.createdAt}
                      </span>
                      <span className="font-mono text-[11px] text-[#9d174d]">
                        {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                    {post.title && (
                      <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-sm text-[#3f0d24] leading-relaxed m-0 whitespace-pre-line">
                      {post.body}
                    </p>

                    {post.replies.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#ffd6e7]">
                        {post.replies.map((r) => {
                          const isDoc =
                            r.authorRole === 'professional' ||
                            /midwife|doctor|dr\./i.test(r.author);
                          return (
                            <div
                              key={r.id}
                              className={`rounded-xl p-3 text-xs border ${
                                isDoc
                                  ? 'bg-[#ffeef5] border-[#db2777]'
                                  : 'bg-white border-[#ffd6e7]'
                              }`}
                            >
                              <span className="inline-flex flex-wrap items-center gap-1.5">
                                {isDoc && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-[#be185d] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    <Stethoscope className="w-3 h-3" aria-hidden="true" />
                                    {r.professionBadge || 'Doctor / Midwife'}
                                  </span>
                                )}
                                <strong className="text-[#3f0d24]">{r.author}:</strong>
                              </span>{' '}
                              <span className="text-[#5c223d]">{r.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={replyDrafts[post.id] || ''}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder={`Reply to ${post.author}'s comment as ${clinicianDisplay}...`}
                        className="pink-input"
                      />
                      <button
                        type="button"
                        disabled={!(replyDrafts[post.id] || '').trim() || replySending[post.id]}
                        onClick={() => void handleClinicianCommunityReply(post.id)}
                        className="pink-btn-primary text-xs disabled:opacity-50 whitespace-nowrap shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        Reply
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </>
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

export function AdminPage() {
  const { translated } = useTranslatedTexts(ADMIN_TEXTS);
  const tr = (idx: number, fallback: string) => translated[idx] || fallback;
  const { clinicianVerifications, reviewClinicianVerification, customArticles } =
    useSharedContent();
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewBusy, setReviewBusy] = useState<Record<string, boolean>>({});

  const orderedVerifications = useMemo(() => {
    const rank = { pending: 0, rejected: 1, approved: 2 };
    return [...clinicianVerifications].sort((a, b) => rank[a.status] - rank[b.status]);
  }, [clinicianVerifications]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (reviewBusy[id]) return;
    setReviewBusy((prev) => ({ ...prev, [id]: true }));
    try {
      await reviewClinicianVerification(id, status, reviewNotes[id]);
    } finally {
      setReviewBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 space-y-2">
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

                    {v.notes && (
                      <p className="text-xs text-[#3f0d24] bg-[#fff7fa] border border-[#ffd6e7] rounded-xl px-3 py-2 m-0">
                        <strong>Practitioner note:</strong> {v.notes}
                      </p>
                    )}

                    {v.proofDataUrl ? (
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
                        Verification submitted via {v.registrationBody} registration number ({v.registrationNumber}).
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
