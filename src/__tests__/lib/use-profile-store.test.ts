import { act } from '@testing-library/react';
import { STORAGE_KEYS } from '@/lib/local-storage';
import { DEFAULT_AVATAR_ID, PROFILE_AVATARS } from '@/lib/profile-avatars';
import { USERNAME_MAX_LENGTH, normalizeUsername, useProfileStore } from '@/lib/use-profile-store';

const readPersisted = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) ?? '{}').state;

describe('normalizeUsername', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeUsername('   Alex    the   Great  ')).toBe('Alex the Great');
  });

  it('strips control characters and bidi overrides', () => {
    expect(normalizeUsername('Al\u0000ex‮')).toBe('Alex');
  });

  it('caps the length by code point without splitting emoji', () => {
    const long = '😀'.repeat(USERNAME_MAX_LENGTH + 5);
    const result = normalizeUsername(long);
    expect(Array.from(result)).toHaveLength(USERNAME_MAX_LENGTH);
    expect(result).toBe('😀'.repeat(USERNAME_MAX_LENGTH));
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(normalizeUsername('   \t  ')).toBe('');
  });
});

describe('useProfileStore', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useProfileStore.setState({ username: '', avatarId: DEFAULT_AVATAR_ID });
    });
  });

  it('starts with no username and the default avatar', () => {
    const { username, avatarId } = useProfileStore.getState();
    expect(username).toBe('');
    expect(avatarId).toBe(DEFAULT_AVATAR_ID);
  });

  it('saves a normalised username and persists it', () => {
    let saved: boolean | undefined;
    act(() => {
      saved = useProfileStore.getState().setUsername('  Alex  ');
    });

    expect(saved).toBe(true);
    expect(useProfileStore.getState().username).toBe('Alex');
    expect(readPersisted().username).toBe('Alex');
  });

  it('rejects an empty username and keeps the previous one', () => {
    act(() => {
      useProfileStore.getState().setUsername('Alex');
    });

    let saved: boolean | undefined;
    act(() => {
      saved = useProfileStore.getState().setUsername('   ');
    });

    expect(saved).toBe(false);
    expect(useProfileStore.getState().username).toBe('Alex');
  });

  it('saves a preset avatar and persists it', () => {
    const target = PROFILE_AVATARS[2].id;
    act(() => {
      useProfileStore.getState().setAvatar(target);
    });

    expect(useProfileStore.getState().avatarId).toBe(target);
    expect(readPersisted().avatarId).toBe(target);
  });

  it('rejects an avatar id that is not a preset', () => {
    let saved: boolean | undefined;
    act(() => {
      saved = useProfileStore.getState().setAvatar('not-an-avatar');
    });

    expect(saved).toBe(false);
    expect(useProfileStore.getState().avatarId).toBe(DEFAULT_AVATAR_ID);
  });

  it('sanitises tampered values when rehydrating from storage', async () => {
    localStorage.setItem(
      STORAGE_KEYS.PROFILE,
      JSON.stringify({
        state: { username: `  ${'x'.repeat(50)}‮ `, avatarId: '<script>' },
        version: 0,
      })
    );

    await act(async () => {
      await useProfileStore.persist.rehydrate();
    });

    const { username, avatarId } = useProfileStore.getState();
    expect(username).toBe('x'.repeat(USERNAME_MAX_LENGTH));
    expect(avatarId).toBe(DEFAULT_AVATAR_ID);
  });

  it('does not write to the game or credibility storage keys', () => {
    act(() => {
      useProfileStore.getState().setUsername('Alex');
      useProfileStore.getState().setAvatar(PROFILE_AVATARS[1].id);
    });

    expect(localStorage.getItem(STORAGE_KEYS.GAME_STATE)).toBeNull();
    expect(localStorage.getItem('credibility_state')).toBeNull();
  });
});
