import { getProfileAvatar } from '@/lib/profile-avatars';
import { cn } from '@/lib/utils';

interface PlayerAvatarProps {
  avatarId: string;
  /** Used for the initial shown on the placeholder swatch. */
  name: string;
  size?: number;
  className?: string;
}

/**
 * The player's preset avatar. PLACEHOLDER rendering: a colour swatch with the
 * player's initial, until the character artwork replaces it. Decorative — the
 * name is always shown next to it, so it is hidden from assistive tech.
 */
export default function PlayerAvatar({ avatarId, name, size = 40, className }: PlayerAvatarProps) {
  const avatar = getProfileAvatar(avatarId);
  const initial = (Array.from(name.trim())[0] ?? '').toUpperCase();

  return (
    <span
      aria-hidden="true"
      data-avatar-id={avatar.id}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold leading-none',
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        backgroundColor: avatar.color,
        color: avatar.textColor,
      }}
    >
      {initial}
    </span>
  );
}
