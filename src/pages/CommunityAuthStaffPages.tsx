import { useState } from 'react';
import {
  BookOpen,
  Check,
  FilePlus2,
  Flag,
  HelpCircle,
  MessageCircle,
  Send,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  AppRoute,
  ARTICLE_IMAGE_PRESETS,
  DemoUser,
  IMAGES,
  LEARNING_TOPICS,
  LearningTopic,
  SA_PROVINCES,
} from '../data/pregmamasData';
import { PinkDatePickerButton } from '../components/PinkDatePickerButton';
import { useSharedContent } from '../context/SharedContentContext';
import { ArticleCommentsBox } from '../components/ArticleCommentsBox';

export function CommunityPage({ user = null }: { user?: DemoUser | null }) {
  const { communityPosts, createCommunityPost, addCommunityReply } = useSharedContent();
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [body, setBody] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const isClinician = user?.role === 'professional';

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
            Supportive Community · Doctors & Midwives Connected
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            PregMamas Open Thoughts & Clinician Support
          </h1>
          <p className="text-sm text-[#5c223d] m-0">
            Speak your mind openly without picking a category. Verified doctors and midwives also read community posts here and leave supportive clinical replies.
          </p>
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
          What’s on Your Mind Today? Share Your Opinion Freely
        </h2>
        <p className="text-xs text-[#5c223d] m-0">
          Write anything you want to express or ask directly below—no topic dropdown required. Doctors and midwives can also see your post and comment.
        </p>
        <div>
          <label htmlFor="comm-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
            Your Name or Nickname (optional)
          </label>
          <input
            id="comm-name"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Leave blank to post anonymously as Mama on PregMamas"
            className="pink-input"
          />
        </div>
        <div>
          <label htmlFor="comm-body" className="block text-xs font-semibold text-[#3f0d24] mb-1">
            Your Thoughts or Opinion
          </label>
          <textarea
            id="comm-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share whatever is on your mind today—your honest experience, feelings, or advice for other moms (for urgent bleeding or severe symptoms, call 10177 / 112 instead)..."
            className="pink-input"
          />
        </div>
        <button type="submit" disabled={!body.trim() || posting} className="pink-btn-primary disabled:opacity-60">
          {posting ? 'Posting...' : 'Post Your Thoughts'}
        </button>
      </form>

      <div className="space-y-4">
        {communityPosts.map((post) => (
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
                {reportedIds.includes(post.id) ? 'Reported to Admin' : 'Report'}
              </button>
            </div>
            {post.title && (
              <h3 className="font-display text-xl font-semibold text-[#3f0d24] m-0">{post.title}</h3>
            )}
            <p className="text-sm text-[#3f0d24] leading-relaxed m-0 whitespace-pre-line">{post.body}</p>

            {post.replies.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#ffd6e7]">
                {post.replies.map((r) => {
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
                      <p className="text-[#5c223d] m-0 leading-relaxed">{r.text}</p>
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
                  Reply
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setReplyTarget(post.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#be185d] hover:underline cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Reply
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export function LoginPage({
  onAuthSuccess,
  onNavigate,
}: {
  onAuthSuccess: (user: DemoUser) => void;
  onNavigate: (path: AppRoute) => void;
}) {
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
            Welcome Back
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            Sign in to PregMamas
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
              Email Address
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
              Password
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
            Sign In
          </button>
        </form>

        <p className="text-xs text-center text-[#5c223d]">
          New to PregMamas?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="font-semibold text-[#be185d] hover:underline cursor-pointer"
          >
            Register a free account
          </button>
        </p>
      </div>

      {/* Instant Role Preview (matching MamaCare SA) */}
      <div className="pink-panel p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            Instant Role Preview (For Testing All PregMamas Workflows)
          </h2>
          <p className="text-xs text-[#5c223d] mt-1 m-0">
            Explore the platform right away as a pregnant mother, a verified healthcare professional, or a platform administrator.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleDemo('mother', 'Nomsa (Mother Demo)', '/dashboard')}
            className="pink-card p-4 text-left hover:border-[#db2777] cursor-pointer"
          >
            <strong className="block text-sm font-semibold text-[#3f0d24]">Mother Demo</strong>
            <span className="block text-xs text-[#5c223d] mt-1">
              Week 24 · Supplements, Bag & Partner Consent
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleDemo('professional', 'Sr. Thandiwe (Midwife)', '/professional')}
            className="pink-card p-4 text-left hover:border-[#db2777] cursor-pointer"
          >
            <strong className="block text-sm font-semibold text-[#3f0d24]">Healthcare Pro Demo</strong>
            <span className="block text-xs text-[#5c223d] mt-1">
              Draft articles & moderate reports
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleDemo('admin', 'Admin Reviewer', '/admin')}
            className="pink-card p-4 text-left hover:border-[#db2777] cursor-pointer"
          >
            <strong className="block text-sm font-semibold text-[#3f0d24]">Administrator Demo</strong>
            <span className="block text-xs text-[#5c223d] mt-1">
              Verify pros, approve articles & safety
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({
  onAuthSuccess,
  onNavigate,
}: {
  onAuthSuccess: (user: DemoUser) => void;
  onNavigate: (path: AppRoute) => void;
}) {
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
            Account Registration
          </h1>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-xs font-semibold text-[#be185d] hover:underline cursor-pointer"
          >
            Sign in here
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-role" className="block text-xs font-semibold text-[#3f0d24] mb-1">
              I am registering as:
            </label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value as DemoUser['role'])}
              className="pink-input"
            >
              <option value="mother">Mother / Expecting</option>
              <option value="partner">Partner / Family Caregiver</option>
              <option value="professional">Healthcare Professional (Midwife / Nurse / Doctor)</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Full Name
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
                Email Address
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
                Date of Birth
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
                Province in South Africa
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
                  First Day of Last Menstrual Period (LMP) — optional
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
                  <strong>Optional Partner Education Consent:</strong> Send general weekly educational tips only. Never shares health logs, mood, weight, or HIV status.
                </span>
              </label>
            </>
          )}

          <button type="submit" className="pink-btn-primary w-full">
            Create PregMamas Account
          </button>
        </form>
      </div>
    </div>
  );
}

export function ProfessionalPage({
  user = null,
  onNavigate,
}: {
  user?: DemoUser | null;
  onNavigate?: (path: AppRoute, topic?: string) => void;
}) {
  const {
    articles,
    customArticles,
    articleComments,
    communityPosts,
    publishClinicianArticle,
    addCommunityReply,
  } = useSharedContent();

  const [activeTab, setActiveTab] = useState<'write' | 'community' | 'questions'>('write');

  // Article authoring state
  const [authorRoleTitle, setAuthorRoleTitle] = useState<'Doctor' | 'Registered Midwife' | 'Clinic Nurse'>('Registered Midwife');
  const [authorName, setAuthorName] = useState(user?.name || 'Sr. Thandiwe Mokoena');
  const [authorFacility, setAuthorFacility] = useState(user?.region || 'Gauteng Antenatal MOU');
  const [topic, setTopic] = useState<Exclude<LearningTopic['slug'], 'all'>>('general');
  const [imageKey, setImageKey] = useState<keyof typeof IMAGES>('clinicMidwife');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [bodyPoints, setBodyPoints] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedBanner, setPublishedBanner] = useState<string>('');

  // Clinician reply state for Community Posts
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replySending, setReplySending] = useState<Record<string, boolean>>({});

  const clinicianDisplay = authorName.trim() || `${authorRoleTitle} on PregMamas`;
  const clinicianBadge = `${authorRoleTitle} · ${authorFacility.trim() || 'SA Clinic'}`;

  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || publishing) return;
    setPublishing(true);
    setPublishedBanner('');
    try {
      const parsedPoints = bodyPoints
        .split('\n')
        .map((line) => line.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);

      const created = await publishClinicianArticle({
        topic,
        title: title.trim(),
        summary: summary.trim(),
        body: parsedPoints.length > 0 ? parsedPoints : [summary.trim()],
        imageKey,
        authorName: clinicianDisplay,
        authorProfession: clinicianBadge,
      });
      setTitle('');
      setSummary('');
      setBodyPoints('');
      setPublishedBanner(`Published "${created.title}" live to User Pages (Learn & Mother Dashboard)!`);
    } finally {
      setPublishing(false);
    }
  };

  const handleClinicianCommunityReply = async (postId: string) => {
    const text = (replyDrafts[postId] || '').trim();
    if (!text || replySending[postId]) return;
    setReplySending((prev) => ({ ...prev, [postId]: true }));
    try {
      await addCommunityReply({
        postId,
        author: clinicianDisplay,
        authorRole: 'professional',
        professionBadge: authorRoleTitle,
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

  const selectedImagePreset = ARTICLE_IMAGE_PRESETS.find((p) => p.key === imageKey);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9d174d]">
            <Stethoscope className="w-4 h-4" aria-hidden="true" />
            <span>Doctor & Midwife Clinical Studio</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
            Publish Articles, Answer Questions & Comment on User Posts
          </h1>
          <p className="text-sm text-[#5c223d] m-0">
            Articles you write here appear immediately on mothers’ Learn and Dashboard pages so users can read, ask questions, and comment. You can also view all user community posts and post verified clinician comments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="rounded-xl border border-[#ea91b8] bg-white px-3.5 py-2 text-xs text-[#3f0d24]">
            <strong className="block text-[#be185d] text-base tabular-nums">{customArticles.length}</strong>
            <span>New Articles Live</span>
          </div>
          <div className="rounded-xl border border-[#ea91b8] bg-white px-3.5 py-2 text-xs text-[#3f0d24]">
            <strong className="block text-[#be185d] text-base tabular-nums">{communityPosts.length}</strong>
            <span>User Posts</span>
          </div>
          <div className="rounded-xl border border-[#ea91b8] bg-white px-3.5 py-2 text-xs text-[#3f0d24]">
            <strong className="block text-[#be185d] text-base tabular-nums">{totalQuestionsCount}</strong>
            <span>Article Q&amp;As</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
          Write &amp; Publish Article ({customArticles.length})
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
          User Community Posts ({communityPosts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
            activeTab === 'questions'
              ? 'bg-[#be185d] text-white border-[#be185d]'
              : 'bg-[#fff7fa] text-[#5c223d] border-[#ea91b8] hover:bg-[#ffe4ef]'
          }`}
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          User Questions on Articles ({totalQuestionsCount})
        </button>
      </div>

      {/* TAB 1: Write & Publish Article Straight to User Pages */}
      {activeTab === 'write' && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <form onSubmit={handlePublishArticle} className="lg:col-span-7 pink-card p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
              Write Article for Mothers &amp; Expecting Teens
            </h2>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="doc-role" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Clinician Role
                </label>
                <select
                  id="doc-role"
                  value={authorRoleTitle}
                  onChange={(e) => setAuthorRoleTitle(e.target.value as 'Doctor' | 'Registered Midwife' | 'Clinic Nurse')}
                  className="pink-input"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Registered Midwife">Registered Midwife</option>
                  <option value="Clinic Nurse">Clinic Nurse</option>
                </select>
              </div>
              <div>
                <label htmlFor="doc-name" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Author Name
                </label>
                <input
                  id="doc-name"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g., Dr. Nomsa Khumalo"
                  className="pink-input"
                />
              </div>
              <div>
                <label htmlFor="doc-facility" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Clinic / Province
                </label>
                <input
                  id="doc-facility"
                  type="text"
                  value={authorFacility}
                  onChange={(e) => setAuthorFacility(e.target.value)}
                  placeholder="e.g., Gauteng MOU"
                  className="pink-input"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="art-topic" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Learning Topic Category
                </label>
                <select
                  id="art-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as Exclude<LearningTopic['slug'], 'all'>)}
                  className="pink-input"
                >
                  {LEARNING_TOPICS.filter((t) => t.slug !== 'all').map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="art-img" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                  Visual Picture for Article
                </label>
                <select
                  id="art-img"
                  value={imageKey}
                  onChange={(e) => setImageKey(e.target.value as keyof typeof IMAGES)}
                  className="pink-input"
                >
                  {ARTICLE_IMAGE_PRESETS.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="art-title" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Article Title
              </label>
              <input
                id="art-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Why Arriving Early to Antenatal Clinic Helps Mother & Baby"
                className="pink-input"
              />
            </div>

            <div>
              <label htmlFor="art-summary" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Plain-Language Summary
              </label>
              <textarea
                id="art-summary"
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Short overview expectant mothers can read quickly..."
                className="pink-input"
              />
            </div>

            <div>
              <label htmlFor="art-body" className="block text-xs font-semibold text-[#3f0d24] mb-1">
                Key Clinical Guidance Points (one point per line)
              </label>
              <textarea
                id="art-body"
                rows={4}
                value={bodyPoints}
                onChange={(e) => setBodyPoints(e.target.value)}
                placeholder={'Arrive at least 30 minutes early with your antenatal card and water.\nTake your daily folic acid & iron alarm pills consistently.\nAsk any follow-up questions in the comments below.'}
                className="pink-input"
              />
            </div>

            <button
              type="submit"
              disabled={publishing || !title.trim() || !summary.trim()}
              className="pink-btn-primary w-full disabled:opacity-60"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              {publishing ? 'Publishing to User Pages...' : 'Publish Live to User Pages'}
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
                      onClick={() => onNavigate('/learn')}
                      className="pink-btn-secondary !min-h-[34px] text-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      Open Learn Page (User View)
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('/dashboard')}
                      className="pink-btn-secondary !min-h-[34px] text-xs"
                    >
                      Open Mother Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="lg:col-span-5 space-y-4">
            <div className="pink-card p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#be185d] m-0">
                Live Article Preview
              </p>
              <img
                src={IMAGES[imageKey]}
                alt={selectedImagePreset?.label || 'Article picture preview'}
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/3] object-cover rounded-xl border border-[#f4b6d0] bg-[#fff7fa]"
              />
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#be185d]">
                  {LEARNING_TOPICS.find((t) => t.slug === topic)?.label}
                </span>
                <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                  {title.trim() || 'Your Article Title Preview'}
                </h3>
                <p className="text-xs text-[#5c223d] m-0">
                  {summary.trim() || 'Your summary will appear clearly on the Learn Page and Mother Dashboard with a Q&A box for users.'}
                </p>
                <p className="text-[11px] text-[#7e405c] pt-1 m-0">
                  Author: <strong>{clinicianDisplay}</strong> · {clinicianBadge}
                </p>
              </div>
            </div>

            {customArticles.length > 0 && (
              <div className="pink-card p-5 space-y-2.5">
                <h3 className="font-display text-base font-semibold text-[#3f0d24] m-0">
                  Recently Published by Doctors &amp; Midwives ({customArticles.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customArticles.map((art) => (
                    <div key={art.id} className="rounded-xl border border-[#ffd6e7] bg-[#fff7fa] p-3 text-xs space-y-1">
                      <strong className="block text-[#3f0d24]">{art.title}</strong>
                      <span className="block text-[11px] text-[#7e405c]">
                        {art.authorName} · {(articleComments[art.id] || []).length} comment(s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: View User Community Posts & Comment as Doctor / Midwife */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="pink-card p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
                User Community Posts — Doctor &amp; Midwife View
              </h2>
              <p className="text-xs text-[#5c223d] mt-1 m-0">
                Posting comments as <strong>{clinicianDisplay}</strong> ({authorRoleTitle}). Your comments appear immediately on the Community page with a Verified Clinician badge.
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

          {communityPosts.map((post) => (
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
                <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">{post.title}</h3>
              )}
              <p className="text-sm text-[#3f0d24] leading-relaxed m-0 whitespace-pre-line">{post.body}</p>

              {post.replies.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#ffd6e7]">
                  {post.replies.map((r) => {
                    const isDoc = r.authorRole === 'professional' || /midwife|doctor|dr\./i.test(r.author);
                    return (
                      <div
                        key={r.id}
                        className={`rounded-xl p-3 text-xs border ${
                          isDoc ? 'bg-[#ffeef5] border-[#db2777]' : 'bg-white border-[#ffd6e7]'
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
                  placeholder={`Comment on ${post.author}'s post as ${authorRoleTitle}...`}
                  className="pink-input"
                />
                <button
                  type="button"
                  disabled={!(replyDrafts[post.id] || '').trim() || replySending[post.id]}
                  onClick={() => void handleClinicianCommunityReply(post.id)}
                  className="pink-btn-primary text-xs disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  Comment as Clinician
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* TAB 3: Answer User Questions & Comments on Clinical Articles */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="pink-card p-5">
            <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
              User Questions &amp; Comments Across Maternal Articles
            </h2>
            <p className="text-xs text-[#5c223d] mt-1 m-0">
              See questions mothers asked on any guide or newly published Doctor/Midwife article, and reply directly as <strong>{clinicianDisplay}</strong>.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {articles.map((art) => (
              <div key={art.id} className="pink-card p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#be185d]">
                      {LEARNING_TOPICS.find((t) => t.slug === art.topic)?.label}
                    </span>
                    {art.isClinicianPublished && (
                      <span className="rounded-md bg-[#be185d] px-2 py-0.5 text-[10px] font-bold text-white">
                        Doctor / Midwife Article
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#3f0d24] m-0">
                    {art.title}
                  </h3>
                  <p className="text-[11px] text-[#7e405c] m-0">
                    By {art.authorName} · {art.authorProfession}
                  </p>
                </div>

                <ArticleCommentsBox
                  articleId={art.id}
                  articleTitle={art.title}
                  user={{
                    name: clinicianDisplay,
                    email: user?.email || 'clinician@pregmamas.demo',
                    role: 'professional',
                    region: authorFacility,
                    dateOfBirth: '1985-01-01',
                  }}
                  defaultOpen={(articleComments[art.id]?.length || 0) > 0 || Boolean(art.isClinicianPublished)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const [proStatus, setProStatus] = useState<'Pending' | 'Verified'>('Pending');
  const [articleStatus, setArticleStatus] = useState<'Pending' | 'Approved'>('Pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="pink-hero-panel p-6 sm:p-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9d174d] m-0">
          Administrator Area
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#3f0d24] m-0">
          Platform Governance & Safety Console
        </h1>
        <p className="text-sm text-[#5c223d] m-0">
          Credential verification, content approval, and community safety moderation for PregMamas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="pink-card p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            1. Healthcare Professional Verification
          </h2>
          <div className="pink-panel p-4 space-y-2">
            <p className="text-sm font-semibold text-[#3f0d24]">
              Sr. Thandiwe Mokoena · Registered Midwife
            </p>
            <p className="text-xs text-[#5c223d]">
              SANC Reg: 14920384 · Chris Hani Baragwanath MOU
            </p>
            <p className="text-xs font-semibold text-[#be185d]">Status: {proStatus}</p>
            <button
              type="button"
              onClick={() => setProStatus('Verified')}
              className="pink-btn-primary text-xs"
            >
              <UserCheck className="w-4 h-4" aria-hidden="true" />
              Verify Credential
            </button>
          </div>
        </div>

        <div className="pink-card p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#3f0d24] m-0">
            2. Content Approval Queue
          </h2>
          <div className="pink-panel p-4 space-y-2">
            <p className="text-sm font-semibold text-[#3f0d24]">
              Postpartum Lochia & C-Section Scar Recovery Guide
            </p>
            <p className="text-xs text-[#5c223d]">
              Topic: Postpartum Recovery · Author: Sr. Ayanda Zulu
            </p>
            <p className="text-xs font-semibold text-[#be185d]">Status: {articleStatus}</p>
            <button
              type="button"
              onClick={() => setArticleStatus('Approved')}
              className="pink-btn-primary text-xs"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Approve for Publishing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
