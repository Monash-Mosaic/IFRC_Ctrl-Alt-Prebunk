import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import enMessages from '@/messages/en.json';

// Use the default en.json translations
const mockMessages = enMessages;

interface AllTheProvidersProps {
  children: React.ReactNode;
  locale?: string;
}

function AllTheProviders({ children, locale = 'en' }: AllTheProvidersProps) {
  // The mocks in jest.setup.js handle the translations
  // We just need to render children directly
  return <>{children}</>;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
}

const customRender = (ui: ReactElement, { locale, ...options }: CustomRenderOptions = {}) => {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} locale={locale} />,
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render, mockMessages };
