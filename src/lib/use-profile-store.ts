import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from './local-storage';
import { DEFAULT_AVATAR_ID, isProfileAvatarId } from './profile-avatars';

export const USERNAME_MAX_LENGTH = 20;

// Control characters and bidi overrides (which can make a name render misleadingly).
const DISALLOWED_CHARACTERS = /[\p{Cc}‪-‮⁦-⁩]/gu;

/** Trims, collapses whitespace, strips unsafe characters and caps the length. */
export function normalizeUsername(raw: string): string {
  const cleaned = raw.replace(DISALLOWED_CHARACTERS, '').replace(/\s+/g, ' ').trim();
  // Array.from splits by code point so the cap never cuts an emoji in half.
  return Array.from(cleaned).slice(0, USERNAME_MAX_LENGTH).join('').trim();
}

interface ProfileState {
  /** Empty until the player picks a name; screens then show the translated default. */
  username: string;
  avatarId: string;
}

interface ProfileStore extends ProfileState {
  /** Returns false (and stores nothing) when the name is empty after normalising. */
  setUsername: (raw: string) => boolean;
  /** Returns false (and stores nothing) for an id that is not a preset avatar. */
  setAvatar: (avatarId: string) => boolean;
}

/**
 * Player identity. Kept apart from the game and credibility stores so editing a
 * profile can never touch score, credibility or quiz progress, and so the
 * restart action (which resets those stores) leaves the identity in place.
 */
export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      username: '',
      avatarId: DEFAULT_AVATAR_ID,
      setUsername: (raw) => {
        const username = normalizeUsername(raw);
        if (!username) return false;
        set({ username });
        return true;
      },
      setAvatar: (avatarId) => {
        if (!isProfileAvatarId(avatarId)) return false;
        set({ avatarId });
        return true;
      },
    }),
    {
      name: STORAGE_KEYS.PROFILE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ username: state.username, avatarId: state.avatarId }),
      // localStorage is user-editable: only accept values that pass the same rules as the setters.
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<ProfileState>;
        return {
          ...current,
          username:
            typeof stored.username === 'string'
              ? normalizeUsername(stored.username)
              : current.username,
          avatarId: isProfileAvatarId(stored.avatarId) ? stored.avatarId : current.avatarId,
        };
      },
    }
  )
);
