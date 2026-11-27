import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AccountRole,
  ARTICLE_IMAGE_PRESETS,
  ArticleComment,
  ClinicianVerification,
  IMAGES,
  INITIAL_ARTICLE_COMMENTS,
  LEARNING_ARTICLES,
  LearningArticle,
  LearningTopic,
  SaRegistrySource,
} from '../data/pregmamasData';

const CUSTOM_ARTICLES_KEY = 'pregmamas_custom_articles_v1';
const ARTICLE_COMMENTS_KEY = 'pregmamas_article_comments_v1';
const CLINICIAN_VERIFS_KEY = 'pregmamas_clinician_verifs_v1';
const CLEAN_LAUNCH_KEY = 'pregmamas_clean_launch_v3';

function ensureCleanLaunchStorage() {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(CLEAN_LAUNCH_KEY) !== 'done') {
      localStorage.removeItem(CUSTOM_ARTICLES_KEY);
      localStorage.removeItem(ARTICLE_COMMENTS_KEY);
      localStorage.removeItem('pregmamas_community_posts_v1');
      localStorage.removeItem('pregmamas_dismissed_notifs_v1');
      localStorage.setItem(CLEAN_LAUNCH_KEY, 'done');
    }
  } catch {
    // ignore
  }
}

interface PublishArticleInput {
  topic: Exclude<LearningTopic['slug'], 'all'>;
  title: string;
  summary: string;
  body: string[];
  imageKey: keyof typeof IMAGES;
  authorName: string;
  authorProfession: string;
}

interface AddArticleCommentInput {
  articleId: string;
  author: string;
  authorRole: AccountRole;
  professionBadge?: string;
  isQuestion?: boolean;
  text: string;
}

interface SubmitClinicianVerificationInput {
  clinicianName: string;
  profession: string;
  registrationBody: 'HPCSA' | 'SANC' | 'Other Medical Council';
  registrationNumber: string;
  facilityName: string;
  proofFileName?: string;
  proofDataUrl?: string;
  notes?: string;
  registryRecognized?: boolean;
  registrySummary?: string;
  registrySources?: SaRegistrySource[];
}

interface SharedContentContextValue {
  customArticles: LearningArticle[];
  articles: LearningArticle[];
  articleComments: Record<string, ArticleComment[]>;
  clinicianVerifications: ClinicianVerification[];
  publishClinicianArticle: (input: PublishArticleInput) => Promise<LearningArticle>;
  addArticleComment: (input: AddArticleCommentInput) => Promise<void>;
  submitClinicianVerification: (
    input: SubmitClinicianVerificationInput
  ) => Promise<ClinicianVerification>;
  reviewClinicianVerification: (
    id: string,
    status: 'approved' | 'rejected',
    adminToken: string,
    adminReviewNote?: string
  ) => Promise<void>;
  refreshSharedContent: () => Promise<void>;
}

const SharedContentContext = createContext<SharedContentContextValue | null>(null);

function resolveArticleImage(art: LearningArticle): LearningArticle {
  const presetKey = art.imageKey as keyof typeof IMAGES | undefined;
  const resolvedImage = (presetKey && IMAGES[presetKey]) || art.image || IMAGES.clinicMidwife;
  const preset = ARTICLE_IMAGE_PRESETS.find((p) => p.key === presetKey);
  return {
    ...art,
    image: resolvedImage,
    imageCaption: art.imageCaption || preset?.caption || `Clinical guide by ${art.authorName}`,
  };
}

export function SharedContentProvider({ children }: { children: React.ReactNode }) {
  ensureCleanLaunchStorage();

  const [customArticles, setCustomArticles] = useState<LearningArticle[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ARTICLES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LearningArticle[];
        if (Array.isArray(parsed)) return parsed.map(resolveArticleImage);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [articleComments, setArticleComments] = useState<Record<string, ArticleComment[]>>(() => {
    try {
      const saved = localStorage.getItem(ARTICLE_COMMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, ArticleComment[]>;
        if (parsed && typeof parsed === 'object') {
          const cleaned: Record<string, ArticleComment[]> = {};
          for (const [k, list] of Object.entries(parsed)) {
            if (!Array.isArray(list)) continue;
            const kept = list.filter((c) => !['ac-1', 'ac-2', 'ac-3', 'ac-4'].includes(c.id));
            if (kept.length > 0) cleaned[k] = kept;
          }
          return cleaned;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_ARTICLE_COMMENTS;
  });

  const [clinicianVerifications, setClinicianVerifications] = useState<ClinicianVerification[]>(
    () => {
      try {
        const saved = localStorage.getItem(CLINICIAN_VERIFS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ClinicianVerification[];
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
      return [];
    }
  );

  const applyServerSnapshot = useCallback(
    (data: {
      customArticles?: LearningArticle[];
      articleComments?: Record<string, ArticleComment[]>;
      clinicianVerifications?: ClinicianVerification[];
    }) => {
      if (Array.isArray(data.customArticles)) {
        const resolved = data.customArticles.map(resolveArticleImage);
        setCustomArticles(resolved);
        try {
          localStorage.setItem(CUSTOM_ARTICLES_KEY, JSON.stringify(resolved));
        } catch {
          // ignore
        }
      }
      if (data.articleComments && typeof data.articleComments === 'object') {
        setArticleComments(data.articleComments);
        try {
          localStorage.setItem(ARTICLE_COMMENTS_KEY, JSON.stringify(data.articleComments));
        } catch {
          // ignore
        }
      }
      if (Array.isArray(data.clinicianVerifications)) {
        setClinicianVerifications(data.clinicianVerifications);
        try {
          localStorage.setItem(CLINICIAN_VERIFS_KEY, JSON.stringify(data.clinicianVerifications));
        } catch {
          // ignore
        }
      }
    },
    []
  );

  const refreshSharedContent = useCallback(async () => {
    try {
      const res = await fetch('/api/shared-content');
      if (!res.ok) return;
      const data = (await res.json()) as {
        customArticles?: LearningArticle[];
        articleComments?: Record<string, ArticleComment[]>;
        clinicianVerifications?: ClinicianVerification[];
      };

      applyServerSnapshot(data);
    } catch {
      // Offline / transient network issue: keep localStorage data intact
    }
  }, [applyServerSnapshot]);

  useEffect(() => {
    void refreshSharedContent();
    const timer = window.setInterval(() => {
      void refreshSharedContent();
    }, 6000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishClinicianArticle = useCallback(
    async (input: PublishArticleInput): Promise<LearningArticle> => {
      const preset = ARTICLE_IMAGE_PRESETS.find((p) => p.key === input.imageKey);
      const localArticle: LearningArticle = resolveArticleImage({
        id: `doc-art-${Date.now()}`,
        topic: input.topic,
        title: input.title.trim(),
        summary: input.summary.trim(),
        body: input.body.length > 0 ? input.body : [input.summary.trim()],
        image: IMAGES[input.imageKey] || IMAGES.clinicMidwife,
        imageKey: input.imageKey,
        imageAlt: `${input.title.trim()} — ${preset?.label || 'Maternal Health Visual Guide'}`,
        imageCaption: `${preset?.caption || 'Verified Clinical Guide'} · Written by ${input.authorName.trim()}`,
        authorName: input.authorName.trim(),
        authorProfession: input.authorProfession.trim(),
        isClinicianPublished: true,
        publishedAt: 'Just now',
      });

      try {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...localArticle,
            image: '',
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            article: LearningArticle;
            customArticles: LearningArticle[];
          };
          applyServerSnapshot({ customArticles: data.customArticles });
          return resolveArticleImage(data.article);
        }
      } catch {
        // fallback locally
      }

      setCustomArticles((prev) => {
        const next = [localArticle, ...prev];
        try {
          localStorage.setItem(CUSTOM_ARTICLES_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      return localArticle;
    },
    [applyServerSnapshot]
  );

  const addArticleComment = useCallback(
    async (input: AddArticleCommentInput) => {
      const trimmed = input.text.trim();
      if (!trimmed) return;

      const fallbackComment: ArticleComment = {
        id: `ac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        author: input.author.trim() || (input.authorRole === 'professional' ? 'Doctor / Midwife' : 'Mama on PregMamas'),
        authorRole: input.authorRole,
        professionBadge: input.professionBadge,
        isQuestion: Boolean(input.isQuestion),
        text: trimmed,
        createdAt: 'Just now',
      };

      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(input.articleId)}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackComment),
        });
        if (res.ok) {
          const data = (await res.json()) as { comments: ArticleComment[] };
          setArticleComments((prev) => {
            const next = { ...prev, [input.articleId]: data.comments };
            try {
              localStorage.setItem(ARTICLE_COMMENTS_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
          return;
        }
      } catch {
        // fallback locally
      }

      setArticleComments((prev) => {
        const existing = prev[input.articleId] || [];
        const next = { ...prev, [input.articleId]: [...existing, fallbackComment] };
        try {
          localStorage.setItem(ARTICLE_COMMENTS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const submitClinicianVerification = useCallback(
    async (input: SubmitClinicianVerificationInput): Promise<ClinicianVerification> => {
      const fallbackRecord: ClinicianVerification = {
        id: `verif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clinicianName: input.clinicianName.trim(),
        profession: input.profession.trim(),
        registrationBody: input.registrationBody,
        registrationNumber:
          input.registrationNumber.trim() ||
          (input.proofDataUrl ? 'Licence / Certificate Uploaded' : 'Matched in SA Medical Registry'),
        facilityName: input.facilityName.trim() || 'South African Clinic / Practice',
        proofFileName: input.proofFileName,
        proofDataUrl: input.proofDataUrl,
        notes: input.notes?.trim() || undefined,
        registryRecognized: Boolean(input.registryRecognized),
        registrySummary: input.registrySummary?.trim() || undefined,
        registrySources: input.registrySources,
        status: 'pending',
        submittedAt: new Date().toLocaleString(),
      };

      const res = await fetch('/api/clinician-verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        verification?: ClinicianVerification;
        clinicianVerifications?: ClinicianVerification[];
      };
      if (!res.ok) {
        throw new Error(
          data.error || 'Could not submit verification proof. Please check your uploaded document.'
        );
      }
      if (data.verification && Array.isArray(data.clinicianVerifications)) {
        applyServerSnapshot({ clinicianVerifications: data.clinicianVerifications });
        return data.verification;
      }

      setClinicianVerifications((prev) => {
        const next = [fallbackRecord, ...prev];
        try {
          localStorage.setItem(CLINICIAN_VERIFS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      return fallbackRecord;
    },
    [applyServerSnapshot]
  );

  const reviewClinicianVerification = useCallback(
    async (
      id: string,
      status: 'approved' | 'rejected',
      adminToken: string,
      adminReviewNote?: string
    ) => {
      if (!adminToken) {
        throw new Error('Administrator sign-in is required to review clinician verifications.');
      }

      const res = await fetch(`/api/clinician-verifications/${encodeURIComponent(id)}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status, adminReviewNote }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        clinicianVerifications?: ClinicianVerification[];
      };

      if (!res.ok) {
        throw new Error(
          data.error || 'Administrator session expired or unauthorized. Please sign in again.'
        );
      }

      if (Array.isArray(data.clinicianVerifications)) {
        applyServerSnapshot({ clinicianVerifications: data.clinicianVerifications });
      }
    },
    [applyServerSnapshot]
  );

  const articles = useMemo(() => {
    return [...customArticles, ...LEARNING_ARTICLES];
  }, [customArticles]);

  const value: SharedContentContextValue = {
    customArticles,
    articles,
    articleComments,
    clinicianVerifications,
    publishClinicianArticle,
    addArticleComment,
    submitClinicianVerification,
    reviewClinicianVerification,
    refreshSharedContent,
  };

  return (
    <SharedContentContext.Provider value={value}>
      {children}
    </SharedContentContext.Provider>
  );
}

export function useSharedContent() {
  const ctx = useContext(SharedContentContext);
  if (!ctx) {
    throw new Error('useSharedContent must be used inside SharedContentProvider');
  }
  return ctx;
}
