import { useState } from 'react';
import { HelpCircle, MessageCircle, Send, Stethoscope } from 'lucide-react';
import { DemoUser } from '../data/pregmamasData';
import { useSharedContent } from '../context/SharedContentContext';

interface ArticleCommentsBoxProps {
  articleId: string;
  articleTitle: string;
  user: DemoUser | null;
  defaultOpen?: boolean;
}

export function ArticleCommentsBox({
  articleId,
  articleTitle,
  user,
  defaultOpen = false,
}: ArticleCommentsBoxProps) {
  const { articleComments, addArticleComment } = useSharedContent();
  const [open, setOpen] = useState(defaultOpen);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [isQuestion, setIsQuestion] = useState(user?.role !== 'professional');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const comments = articleComments[articleId] || [];
  const isClinician = user?.role === 'professional';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addArticleComment({
        articleId,
        author:
          authorName.trim() ||
          user?.name ||
          (isClinician ? 'PregMamas Doctor / Midwife' : 'Mama on PregMamas'),
        authorRole: user?.role || 'mother',
        professionBadge: isClinician ? 'Verified Doctor / Midwife' : undefined,
        isQuestion: isClinician ? false : isQuestion,
        text: text.trim(),
      });
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-2 border-t border-[#ffd6e7] space-y-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-[#ea91b8] bg-[#fff7fa] px-3.5 py-2 text-xs font-semibold text-[#9d174d] hover:bg-[#ffe4ef] transition-colors cursor-pointer"
      >
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-[#be185d]" aria-hidden="true" />
          <span>
            {open ? 'Hide Questions & Comments' : 'Ask a Question / Comment'} ({comments.length})
          </span>
        </span>
        <span className="text-[11px] font-bold text-[#be185d]">
          {open ? 'Close ▲' : 'Open ▼'}
        </span>
      </button>

      {open && (
        <div className="rounded-xl border border-[#f4b6d0] bg-[#fff7fa] p-3.5 space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-[#7e405c] m-0">
              No comments yet on "{articleTitle}". Be the first mother or clinician to ask a question or share a comment!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {comments.map((c) => {
                const fromClinician = c.authorRole === 'professional';
                return (
                  <div
                    key={c.id}
                    className={`rounded-xl p-2.5 text-xs space-y-1 border ${
                      fromClinician
                        ? 'border-[#db2777] bg-[#ffeef5]'
                        : 'border-[#ffd6e7] bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="inline-flex flex-wrap items-center gap-1.5 font-semibold text-[#3f0d24]">
                        {fromClinician && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#be185d] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            <Stethoscope className="w-3 h-3" aria-hidden="true" />
                            {c.professionBadge || 'Doctor / Midwife'}
                          </span>
                        )}
                        {!fromClinician && c.isQuestion && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#ffd6e7] px-1.5 py-0.5 text-[10px] font-bold text-[#9d174d]">
                            <HelpCircle className="w-3 h-3" aria-hidden="true" />
                            Question
                          </span>
                        )}
                        <span>{c.author}</span>
                      </span>
                      <span className="text-[10px] text-[#7e405c]">{c.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#3f0d24] m-0 leading-relaxed whitespace-pre-line">
                      {c.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 pt-1 border-t border-[#ffd6e7]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={
                  isClinician ? 'Doctor / Midwife Name' : 'Your Name (optional)'
                }
                className="rounded-lg border border-[#ea91b8] bg-white px-2.5 py-1.5 text-xs text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
              />
              {!isClinician && (
                <div className="flex items-center gap-1.5 rounded-lg border border-[#ea91b8] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setIsQuestion(true)}
                    className={`flex-1 rounded-md py-1 text-[11px] font-semibold cursor-pointer ${
                      isQuestion ? 'bg-[#be185d] text-white' : 'text-[#5c223d]'
                    }`}
                  >
                    Ask Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsQuestion(false)}
                    className={`flex-1 rounded-md py-1 text-[11px] font-semibold cursor-pointer ${
                      !isQuestion ? 'bg-[#be185d] text-white' : 'text-[#5c223d]'
                    }`}
                  >
                    Leave Comment
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  isClinician
                    ? 'Write a verified Doctor / Midwife reply...'
                    : isQuestion
                      ? 'Ask doctors or midwives a question about this article...'
                      : 'Write your comment on this article...'
                }
                className="flex-1 rounded-lg border border-[#ea91b8] bg-white px-3 py-2 text-xs text-[#3f0d24] placeholder:text-[#a66a85] focus:border-[#be185d] focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-[#be185d] px-3 py-2 text-xs font-semibold text-white hover:bg-[#9d174d] disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                {isClinician ? 'Reply' : isQuestion ? 'Ask' : 'Comment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
