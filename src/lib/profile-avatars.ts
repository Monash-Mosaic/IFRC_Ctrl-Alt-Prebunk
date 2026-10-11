/**
 * Preset player avatars.
 *
 * PLACEHOLDER: these are plain colour swatches until the character artwork is
 * supplied. Swapping in the real artwork only needs this list and
 * `components/player-avatar.tsx` to change; stored ids stay valid.
 */
export interface ProfileAvatar {
  id: string;
  /** Key under `profile.avatars` in the messages files. */
  labelKey: string;
  color: string;
  textColor: string;
}

export const PROFILE_AVATARS: readonly ProfileAvatar[] = [
  { id: 'avatar-1', labelKey: 'green', color: '#2FE89F', textColor: '#011E41' },
  { id: 'avatar-2', labelKey: 'blue', color: '#2979FF', textColor: '#FFFFFF' },
  { id: 'avatar-3', labelKey: 'navy', color: '#011E41', textColor: '#FFFFFF' },
  { id: 'avatar-4', labelKey: 'red', color: '#FF1E56', textColor: '#FFFFFF' },
  { id: 'avatar-5', labelKey: 'yellow', color: '#FFC72C', textColor: '#011E41' },
  { id: 'avatar-6', labelKey: 'purple', color: '#7C3AED', textColor: '#FFFFFF' },
];

export const DEFAULT_AVATAR_ID = PROFILE_AVATARS[0].id;

export function isProfileAvatarId(id: unknown): id is string {
  return typeof id === 'string' && PROFILE_AVATARS.some((avatar) => avatar.id === id);
}

export function getProfileAvatar(id: string): ProfileAvatar {
  return PROFILE_AVATARS.find((avatar) => avatar.id === id) ?? PROFILE_AVATARS[0];
}
