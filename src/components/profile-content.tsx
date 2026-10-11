'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Pencil } from 'lucide-react';
import CONTENTS from '@/contents';
import PlayerAvatar from '@/components/player-avatar';
import { PROFILE_AVATARS } from '@/lib/profile-avatars';
import { useCredibilityStore } from '@/lib/use-credibility-store';
import { getStoredGameProgress } from '@/lib/use-game-store';
import { USERNAME_MAX_LENGTH, useProfileStore } from '@/lib/use-profile-store';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011E41] focus-visible:ring-offset-2';

/**
 * Profile destination: the player's username, preset avatar and current score.
 *
 * Only the profile store is written here. Score and credibility are read-only,
 * so editing a profile cannot change gameplay state or quiz position.
 */
export default function ProfileContent() {
  const t = useTranslations('profile');
  const locale = useLocale();
  const { username, avatarId, setUsername, setAvatar } = useProfileStore();
  const { credibility, initialCredibility } = useCredibilityStore();
  // Progress cannot change while this page is open, so a single read is enough.
  const [{ correctAnswers }] = useState(getStoredGameProgress);

  const totalQuestions = CONTENTS[locale as keyof typeof CONTENTS].contentList.length;
  const credibilityPercentage = (credibility / Math.max(initialCredibility, 1)) * 100;
  const displayName = username || t('defaultUsername');

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef(false);

  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  // Move focus into the field when editing starts and back to the trigger when it ends.
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    } else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      editButtonRef.current?.focus();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraft(username);
    setError(null);
    setStatus('');
    setIsEditing(true);
  };

  const stopEditing = () => {
    returnFocusRef.current = true;
    setError(null);
    setIsEditing(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!setUsername(draft)) {
      setError(t('usernameRequired'));
      inputRef.current?.focus();
      return;
    }
    setStatus(t('usernameSaved'));
    stopEditing();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      stopEditing();
    }
  };

  const handleAvatarChange = (id: string) => {
    if (setAvatar(id)) setStatus(t('avatarSaved'));
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6 md:max-w-lg md:py-10">
      <h1 className="text-2xl font-bold text-[#011E41]">{t('title')}</h1>

      {/* Identity and score */}
      <section
        aria-label={t('identityHeading')}
        className="flex flex-col items-center gap-4 rounded-3xl bg-[#E4EAF3] px-6 py-8 text-center shadow-sm"
      >
        <PlayerAvatar avatarId={avatarId} name={displayName} size={96} />

        {isEditing ? (
          <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-2 text-start">
            <label htmlFor={inputId} className="text-sm font-semibold text-[#011E41]">
              {t('usernameLabel')}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleInputKeyDown}
              maxLength={USERNAME_MAX_LENGTH}
              autoComplete="nickname"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${hintId} ${errorId}` : hintId}
              className={cn(
                // text-base keeps iOS Safari from zooming into the field.
                'min-h-12 w-full rounded-lg border bg-white px-4 py-3 text-base text-[#0D1B3E]',
                focusRing,
                error ? 'border-[#FF1E56]' : 'border-[#011E41]'
              )}
            />
            <p id={hintId} className="text-xs text-[#6B7280]">
              {t('usernameHint', { max: USERNAME_MAX_LENGTH })}
            </p>
            {error && (
              <p id={errorId} className="text-xs font-medium text-[#FF1E56]">
                {error}
              </p>
            )}
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={stopEditing}
                className={cn(
                  'min-h-12 flex-1 rounded-full border border-dashed border-[#011E41] bg-white/60 px-4 py-3 text-sm font-medium text-[#011E41] transition hover:bg-white',
                  focusRing
                )}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className={cn(
                  'min-h-12 flex-1 rounded-full bg-[#011E41] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#002A5A] active:bg-[#001A3F]',
                  focusRing
                )}
              >
                {t('save')}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              {t('usernameLabel')}
            </p>
            <p
              className="max-w-full text-2xl font-bold text-[#011E41] wrap-anywhere"
              data-testid="profile-username"
            >
              {displayName}
            </p>
            <button
              ref={editButtonRef}
              type="button"
              onClick={startEditing}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-[#011E41] bg-white/60 px-5 py-2 text-sm font-semibold text-[#011E41] transition hover:bg-white',
                focusRing
              )}
            >
              <Pencil size={16} strokeWidth={2} aria-hidden="true" />
              {t('editUsername')}
            </button>
          </div>
        )}

        <dl className="mt-2 grid w-full grid-cols-2 gap-3 text-start">
          <div className="rounded-2xl bg-white px-4 py-3">
            <dt className="text-xs font-medium text-[#6B7280]">{t('score')}</dt>
            <dd className="mt-1 text-2xl font-black text-[#2979FF]" data-testid="profile-score">
              {correctAnswers}/{totalQuestions}
            </dd>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <dt className="text-xs font-medium text-[#6B7280]">{t('credibility')}</dt>
            <dd className="mt-3">
              <div
                role="progressbar"
                aria-label={t('credibility')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(credibilityPercentage)}
                className="relative h-3 w-full overflow-hidden rounded-full bg-[#E8E9ED]"
              >
                <div
                  className="absolute inset-y-0 start-0 rounded-full bg-[#2FE89F] transition-all duration-500"
                  style={{ width: `${credibilityPercentage}%` }}
                />
              </div>
            </dd>
          </div>
        </dl>
      </section>

      {/* Avatar picker: native radios give arrow-key navigation and a single tab stop. */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lg font-semibold text-[#011E41]">{t('avatarLabel')}</legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PROFILE_AVATARS.map((avatar) => {
            const isSelected = avatar.id === avatarId;
            return (
              <label
                key={avatar.id}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-2 transition-colors',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#011E41] has-[:focus-visible]:ring-offset-2',
                  isSelected ? 'border-[#011E41] bg-[#E4EAF3]' : 'border-transparent hover:bg-[#E8E9ED]'
                )}
              >
                <input
                  type="radio"
                  name="profile-avatar"
                  value={avatar.id}
                  checked={isSelected}
                  onChange={() => handleAvatarChange(avatar.id)}
                  className="sr-only"
                />
                <span className="relative">
                  <PlayerAvatar avatarId={avatar.id} name={displayName} size={48} />
                  {isSelected && (
                    <span
                      className="absolute -end-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#011E41] text-white"
                      aria-hidden="true"
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium text-[#0D1B3E]">
                  {t(`avatars.${avatar.labelKey}`)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium text-[#011E41]">
        {status}
      </p>
      <p className="text-xs text-[#6B7280]">{t('progressNote')}</p>
    </div>
  );
}
