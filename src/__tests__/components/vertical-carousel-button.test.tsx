import React from 'react';
import { render, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  usePrevNextButtons,
  PrevButton,
  NextButton,
} from '@/components/vertical-carousel-button';
import type { EmblaCarouselType } from 'embla-carousel';

function createMockEmblaApi({
  canScrollPrev = true,
  canScrollNext = true,
}: {
  canScrollPrev?: boolean;
  canScrollNext?: boolean;
} = {}): EmblaCarouselType {
  const listeners: Record<string, Array<(api: EmblaCarouselType) => void>> = {};

  return {
    scrollPrev: jest.fn(),
    scrollNext: jest.fn(),
    canScrollPrev: jest.fn(() => canScrollPrev),
    canScrollNext: jest.fn(() => canScrollNext),
    on: jest.fn((event: string, callback: (api: EmblaCarouselType) => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(callback);
      return createMockEmblaApi({ canScrollPrev, canScrollNext });
    }),
    off: jest.fn(),
    emit: (event: string) => {
      listeners[event]?.forEach((callback) => callback(createMockEmblaApi({ canScrollPrev, canScrollNext })));
    },
  } as unknown as EmblaCarouselType;
}

describe('usePrevNextButtons', () => {
  it('returns disabled buttons when embla api is undefined', () => {
    const { result } = renderHook(() => usePrevNextButtons(undefined));

    expect(result.current.prevBtnDisabled).toBe(true);
    expect(result.current.nextBtnDisabled).toBe(true);

    act(() => {
      result.current.onPrevButtonClick();
      result.current.onNextButtonClick();
    });
  });

  it('updates disabled state and scrolls when embla api is provided', async () => {
    const emblaApi = createMockEmblaApi({ canScrollPrev: false, canScrollNext: true });
    const { result } = renderHook(() => usePrevNextButtons(emblaApi));

    await waitFor(() => {
      expect(result.current.prevBtnDisabled).toBe(true);
      expect(result.current.nextBtnDisabled).toBe(false);
    });

    act(() => {
      result.current.onPrevButtonClick();
      result.current.onNextButtonClick();
    });

    expect(emblaApi.scrollPrev).toHaveBeenCalled();
    expect(emblaApi.scrollNext).toHaveBeenCalled();
  });

  it('cleans up embla listeners on unmount', () => {
    const emblaApi = createMockEmblaApi();
    const { unmount } = renderHook(() => usePrevNextButtons(emblaApi));

    unmount();

    expect(emblaApi.off).toHaveBeenCalledWith('reInit', expect.any(Function));
    expect(emblaApi.off).toHaveBeenCalledWith('select', expect.any(Function));
  });
});

describe('PrevButton and NextButton', () => {
  it('renders previous button with aria label', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<PrevButton onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Previous item' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders next button with aria label and disabled state', () => {
    render(<NextButton disabled />);

    const button = screen.getByRole('button', { name: 'Next item' });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders optional children', () => {
    render(
      <>
        <PrevButton>Back</PrevButton>
        <NextButton>Forward</NextButton>
      </>,
    );

    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Forward')).toBeInTheDocument();
  });
});
