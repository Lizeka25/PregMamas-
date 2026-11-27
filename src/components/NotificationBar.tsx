import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, Check, MessageCircle, Stethoscope, X } from 'lucide-react';
import { AppRoute } from '../data/pregmamasData';
import { useSharedContent } from '../context/SharedContentContext';
import { useSupplementAlarms } from '../context/AlarmContext';

const DISMISSED_NOTIFS_KEY = 'pregmamas_dismissed_notifs_v1';

export interface AppNotificationItem {
  id: string;
  category: 'alarm' | 'movement' | 'article' | 'comment';
  title: string;
  message: string;
  route: AppRoute;
  actionLabel: string;
}

export function useAppNotifications() {
  const { customArticles, articles, articleComments } = useSharedContent();
  const { activeAlarm, activeHourlyMovementPrompt } = useSupplementAlarms();

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_NOTIFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_NOTIFS_KEY, JSON.stringify(dismissedIds.slice(-150)));
    } catch {
      // ignore
    }
  }, [dismissedIds]);

  const allNotifications = useMemo<AppNotificationItem[]>(() => {
    const items: AppNotificationItem[] = [];

    if (activeAlarm) {
      items.push({
        id: `live-alarm-${activeAlarm.id}`,
        category: 'alarm',
        title: `Supplement Alarm: ${activeAlarm.name}`,
        message: `Time to take ${activeAlarm.dosage} with water.`,
        route: '/dashboard',
        actionLabel: 'Open Dashboard',
      });
    }

    if (activeHourlyMovementPrompt) {
      items.push({
        id: 'live-hourly-movement',
        category: 'movement',
        title: 'Has your baby moved today?',
        message: 'Hourly movement check-in — log today’s count or try cold water & snacks.',
        route: '/kicks',
        actionLabel: 'Open Movement Diary',
      });
    }

    customArticles.forEach((art) => {
      items.push({
        id: `art-${art.id}`,
        category: 'article',
        title: `New Knowledge by ${art.authorName}`,
        message: art.title,
        route: '/dashboard',
        actionLabel: 'Read on Dashboard',
      });
    });

    Object.entries(articleComments).forEach(([articleId, comments]) => {
      const targetArticle = articles.find((a) => a.id === articleId);
      comments.forEach((c) => {
        const preview = c.text.length > 72 ? `${c.text.slice(0, 72)}…` : c.text;
        items.push({
          id: `comment-${c.id}`,
          category: 'comment',
          title:
            c.authorRole === 'professional'
              ? `Doctor / Midwife Reply from ${c.author}`
              : `New Mother Comment from ${c.author}`,
          message: targetArticle ? `${targetArticle.title}: "${preview}"` : preview,
          route: c.authorRole === 'professional' ? '/dashboard' : '/professional',
          actionLabel: c.authorRole === 'professional' ? 'View Reply' : 'Read & Reply',
        });
      });
    });

    return items;
  }, [activeAlarm, activeHourlyMovementPrompt, articleComments, articles, customArticles]);

  const unreadNotifications = useMemo(
    () => allNotifications.filter((n) => !dismissedIds.includes(n.id)),
    [allNotifications, dismissedIds]
  );

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setDismissedIds((prev) => {
      const combined = new Set([...prev, ...allNotifications.map((n) => n.id)]);
      return Array.from(combined);
    });
  }, [allNotifications]);

  return {
    allNotifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    dismissNotification,
    markAllRead,
  };
}

export function NotificationBar({
  unreadNotifications,
  onNavigate,
  onDismiss,
  onMarkAllRead,
  onOpenPanel,
}: {
  unreadNotifications: AppNotificationItem[];
  onNavigate: (path: AppRoute) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenPanel: () => void;
}) {
  if (unreadNotifications.length === 0) return null;

  const latest = unreadNotifications[0];

  const Icon =
    latest.category === 'article'
      ? Stethoscope
      : latest.category === 'comment'
        ? MessageCircle
        : BellRing;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-gradient-to-r from-[#ffd6e7] via-[#ffe4ef] to-[#ffd6e7] border-b border-[#ea91b8] text-[#3f0d24]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#be185d] text-white shrink-0">
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 text-xs">
            <span className="font-bold text-[#9d174d] mr-2">
              {unreadNotifications.length === 1
                ? 'New Notification:'
                : `${unreadNotifications.length} Notifications:`}
            </span>
            <strong className="font-semibold text-[#3f0d24]">{latest.title}</strong>
            <span className="hidden sm:inline text-[#5c223d]"> — {latest.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {unreadNotifications.length > 1 && (
            <button
              type="button"
              onClick={onOpenPanel}
              className="rounded-lg border border-[#ea91b8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#9d174d] hover:bg-[#fff7fa] cursor-pointer"
            >
              View All ({unreadNotifications.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onDismiss(latest.id);
              onNavigate(latest.route);
            }}
            className="rounded-lg bg-[#be185d] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#9d174d] cursor-pointer"
          >
            {latest.actionLabel}
          </button>
          {unreadNotifications.length > 1 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              title="Mark all notifications read"
              className="inline-flex items-center gap-1 rounded-lg border border-[#ea91b8] bg-white px-2 py-1 text-[11px] font-semibold text-[#5c223d] hover:bg-[#fff7fa] cursor-pointer"
            >
              <Check className="w-3 h-3" aria-hidden="true" />
              Clear
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDismiss(latest.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-[#7e405c] hover:bg-white/80 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
