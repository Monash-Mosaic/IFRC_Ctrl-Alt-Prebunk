import { act, render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import Navigation from '@/components/navigation-bar';
import { STORAGE_KEYS, storage } from '@/lib/local-storage';

// Use the global mock from jest.setup.js
const mockUsePathname = global.mockUsePathname as unknown as jest.Mock;

describe('Navigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Sidebar', () => {
    it('renders desktop sidebar', () => {
      render(<Navigation />);
      const sidebars = screen.getAllByRole('complementary');
      const desktopSidebar = sidebars.find((sidebar) => sidebar.classList.contains('md:flex'));
      expect(desktopSidebar).toBeInTheDocument();
      expect(desktopSidebar).toHaveClass('hidden', 'md:flex');
    });

    it('renders all navigation items', () => {
      render(<Navigation />);
      expect(screen.getAllByText(/home/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/chat/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/analytics/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/share/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/profile/i).length).toBeGreaterThan(0);
    });

    it('highlights active navigation item', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navigation />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const desktopLink = homeLinks.find((link) => {
        const parent = link.closest('aside');
        return parent?.classList.contains('md:flex');
      });
      expect(desktopLink).toHaveClass('text-(--color-ifrc-red)');
    });

    it('does not highlight inactive navigation items', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navigation />);

      const chatLinks = screen.getAllByRole('link', { name: /chat/i });
      const desktopLink = chatLinks.find((link) => {
        const parent = link.closest('aside');
        return parent?.classList.contains('md:flex');
      });
      expect(desktopLink).toHaveClass('text-(--color-ifrc-blue)');
    });

    it('highlights chat when on chat route', () => {
      mockUsePathname.mockReturnValue('/chat');
      render(<Navigation />);

      const chatLinks = screen.getAllByRole('link', { name: /chat/i });
      const desktopLink = chatLinks.find((link) => {
        const parent = link.closest('aside');
        return parent?.classList.contains('md:flex');
      });
      expect(desktopLink).toHaveClass('text-(--color-ifrc-red)');
    });

    it('has correct sidebar positioning classes', () => {
      render(<Navigation />);
      const sidebars = screen.getAllByRole('complementary');
      const desktopSidebar = sidebars.find((sidebar) => sidebar.classList.contains('md:flex'));
      expect(desktopSidebar).toHaveClass('fixed', 'top-24', 'z-40', 'h-[calc(100vh-6rem)]', 'w-20');
    });

    it('renders navigation links with correct hrefs', () => {
      render(<Navigation />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      expect(homeLinks[0]).toHaveAttribute('href', '/');

      const chatLinks = screen.getAllByRole('link', { name: /chat/i });
      expect(chatLinks[0]).toHaveAttribute('href', '/chat');

      const analyticsLinks = screen.getAllByRole('link', { name: /analytics/i });
      expect(analyticsLinks[0]).toHaveAttribute('href', '/analytics');

      const shareLinks = screen.getAllByRole('link', { name: /share/i });
      expect(shareLinks[0]).toHaveAttribute('href', '/share');

      const profileLinks = screen.getAllByRole('link', { name: /profile/i });
      expect(profileLinks[0]).toHaveAttribute('href', '/profile');
    });

    it('renders icons for each navigation item', () => {
      render(<Navigation />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        const svg = link.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Bottom Navigation', () => {
    it('renders mobile navigation', () => {
      render(<Navigation />);
      const navs = screen.getAllByRole('navigation');
      const mobileNav = navs.find((nav) => nav.classList.contains('md:hidden'));
      expect(mobileNav).toBeInTheDocument();
      expect(mobileNav).toHaveClass('md:hidden');
    });

    it('renders all navigation items in mobile view', () => {
      render(<Navigation />);
      expect(screen.getAllByText(/home/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/chat/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/analytics/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/share/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/profile/i).length).toBeGreaterThan(0);
    });

    it('has correct mobile navigation positioning', () => {
      render(<Navigation />);
      const navs = screen.getAllByRole('navigation');
      const mobileNav = navs.find((nav) => nav.classList.contains('md:hidden'));
      expect(mobileNav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'z-50');
    });

    it('highlights active item in mobile view', () => {
      mockUsePathname.mockReturnValue('/chat');
      render(<Navigation />);

      const chatLinks = screen.getAllByText(/chat/i);
      const activeLink = chatLinks.find((link) =>
        link.closest('a')?.classList.contains('text-(--color-ifrc-red)')
      );
      expect(activeLink).toBeDefined();
    });
  });

  describe('Navigation behavior', () => {
    it('matches nested routes correctly', () => {
      mockUsePathname.mockReturnValue('/chat/conversation');
      render(<Navigation />);

      const chatLinks = screen.getAllByRole('link', { name: /chat/i });
      const desktopLink = chatLinks.find((link) => {
        const parent = link.closest('aside');
        return parent?.classList.contains('md:flex');
      });
      expect(desktopLink).toHaveClass('text-(--color-ifrc-red)');
    });

    it('handles root route correctly', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navigation />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const desktopLink = homeLinks.find((link) => {
        const parent = link.closest('aside');
        return parent?.classList.contains('md:flex');
      });
      expect(desktopLink).toHaveClass('text-(--color-ifrc-red)');
    });
  });

  describe('Home navigation', () => {
    afterEach(() => {
      storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    });

    it('does not show a toast when Home is clicked during the quiz', async () => {
      storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      const user = userEvent.setup();
      render(<Navigation />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      await user.click(homeLinks[0]);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Active-quiz navigation lock', () => {
    const saveGame = (answers: Record<string, string>, gameCompleted = false) =>
      storage.setItem(STORAGE_KEYS.GAME_STATE, {
        state: { answers, currentQuestionIndex: 0, gameCompleted, correctAnswers: 0 },
        version: 0,
      });

    afterEach(() => {
      storage.removeItem(STORAGE_KEYS.GAME_STATE);
    });

    it('keeps Profile closed while a quiz is in progress and explains why', async () => {
      saveGame({ '1': 'like' });
      const user = userEvent.setup();
      render(<Navigation />);

      const profileLinks = screen.getAllByRole('link', { name: /profile/i });
      expect(profileLinks).toHaveLength(2); // desktop sidebar + mobile bar
      for (const link of profileLinks) {
        expect(link).toHaveAttribute('aria-disabled', 'true');
      }

      // A cancelled click event means the router never navigates away.
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      profileLinks[0].dispatchEvent(clickEvent);
      expect(clickEvent.defaultPrevented).toBe(true);

      // Keyboard activation is blocked the same way.
      profileLinks[1].focus();
      await user.keyboard('{Enter}');
      expect(await screen.findByRole('alert')).toHaveTextContent('lockedDuringQuiz');
    });

    it('keeps Share closed during the quiz too', async () => {
      saveGame({ '1': 'like' });
      const user = userEvent.setup();
      render(<Navigation />);

      const shareLinks = screen.getAllByRole('link', { name: /share/i });
      expect(shareLinks).toHaveLength(2);
      for (const link of shareLinks) {
        expect(link).toHaveAttribute('aria-disabled', 'true');
      }

      await user.click(shareLinks[0]);
      expect(await screen.findByRole('alert')).toHaveTextContent('lockedDuringQuiz');
    });

    it('leaves the other destinations open during the quiz', () => {
      saveGame({ '1': 'like' });
      render(<Navigation />);

      for (const name of [/home/i, /chat/i, /analytics/i]) {
        for (const link of screen.getAllByRole('link', { name })) {
          expect(link).not.toHaveAttribute('aria-disabled');
        }
      }
    });

    it.each([
      ['before the first answer', {}, false],
      ['once results are shown', { '1': 'like' }, true],
    ])('opens Profile normally %s', (_, answers, gameCompleted) => {
      saveGame(answers, gameCompleted);
      render(<Navigation />);

      for (const link of screen.getAllByRole('link', { name: /profile/i })) {
        expect(link).not.toHaveAttribute('aria-disabled');
        expect(link).toHaveAttribute('href', expect.stringContaining('/profile'));
      }
    });

    it('unlocks Profile as soon as the game is completed', () => {
      saveGame({ '1': 'like' });
      render(<Navigation />);
      expect(screen.getAllByRole('link', { name: /profile/i })[0]).toHaveAttribute(
        'aria-disabled',
        'true'
      );

      act(() => {
        saveGame({ '1': 'like' }, true);
        window.dispatchEvent(new Event('prebunk:game-state-changed'));
      });

      expect(screen.getAllByRole('link', { name: /profile/i })[0]).not.toHaveAttribute(
        'aria-disabled'
      );
    });
  });
});
