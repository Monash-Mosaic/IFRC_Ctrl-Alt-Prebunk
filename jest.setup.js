// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key) => key),
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(() => Promise.resolve((key) => key)),
  getMessages: jest.fn(() => Promise.resolve({})),
  setRequestLocale: jest.fn(),
  getLocale: jest.fn(() => Promise.resolve('en')),
}));

// Mock next/navigation
const mockUsePathname = jest.fn(() => '/');
const mockUseRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
}));

// Mock next-intl routing
jest.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  redirect: jest.fn(),
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
  getPathname: jest.fn(),
}));

// Make mocks available globally for tests
global.mockUsePathname = mockUsePathname;
global.mockUseRouter = mockUseRouter;
