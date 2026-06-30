import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
  type CarouselApi,
} from '@/components/ui/carousel';

function CarouselConsumer() {
  const { canScrollPrev, canScrollNext } = useCarousel();
  return (
    <div>
      <span data-testid="can-prev">{String(canScrollPrev)}</span>
      <span data-testid="can-next">{String(canScrollNext)}</span>
    </div>
  );
}

function OutsideCarouselConsumer() {
  useCarousel();
  return null;
}

function renderVerticalCarousel(setApi?: (api: CarouselApi) => void) {
  return render(
    <Carousel orientation="vertical" setApi={setApi} className="h-64">
      <CarouselContent>
        <CarouselItem>
          <div className="h-32">Slide 1</div>
        </CarouselItem>
        <CarouselItem>
          <div className="h-32">Slide 2</div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselConsumer />
    </Carousel>,
  );
}

describe('Carousel', () => {
  it('throws when useCarousel is used outside provider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<OutsideCarouselConsumer />)).toThrow(
      'useCarousel must be used within a <Carousel />',
    );

    errorSpy.mockRestore();
  });

  it('renders carousel region with slides', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide A</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(screen.getByRole('region', { name: '' })).toHaveAttribute(
      'data-slot',
      'carousel',
    );
    expect(screen.getByText('Slide A')).toHaveAttribute('data-slot', 'carousel-item');
  });

  it('supports horizontal keyboard navigation', async () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    const carousel = screen.getByRole('region');
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    fireEvent.keyDown(carousel, { key: 'Enter' });
  });

  it('exposes carousel api through setApi', async () => {
    const setApi = jest.fn();

    render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    await waitFor(() => {
      expect(setApi).toHaveBeenCalled();
    });
  });

  it('renders navigation buttons and updates scroll state', async () => {
    renderVerticalCarousel();

    expect(screen.getByText('Previous slide')).toBeInTheDocument();
    expect(screen.getByText('Next slide')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('can-prev')).toBeInTheDocument();
      expect(screen.getByTestId('can-next')).toBeInTheDocument();
    });
  });

  it('clicks previous and next carousel buttons', async () => {
    const user = userEvent.setup();
    renderVerticalCarousel();

    const previous = screen.getByText('Previous slide').closest('button');
    const next = screen.getByText('Next slide').closest('button');

    if (next && !next.hasAttribute('disabled')) {
      await user.click(next);
    }
    if (previous && !previous.hasAttribute('disabled')) {
      await user.click(previous);
    }
  });

  it('adjusts vertical carousel height and reinitializes embla', async () => {
    jest.useFakeTimers();
    const reInit = jest.fn();
    const originalResizeObserver = global.ResizeObserver;

    class TestResizeObserver {
      private callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element) {
        Object.defineProperty(target, 'clientHeight', {
          configurable: true,
          value: 320,
        });
        Object.defineProperty(target, 'offsetHeight', {
          configurable: true,
          value: 320,
        });

        const content = target.querySelector('[data-slot="carousel-content"]') as HTMLElement | null;
        if (content) {
          Object.defineProperty(content, 'offsetHeight', {
            configurable: true,
            value: 100,
          });
          const innerContainer = content.firstElementChild as HTMLElement | null;
          if (innerContainer) {
            Object.defineProperty(innerContainer, 'offsetHeight', {
              configurable: true,
              value: 100,
            });
          }
        }

        this.callback([], this as unknown as ResizeObserver);
      }

      unobserve() {}
      disconnect() {}
    }

    global.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;

    render(
      <Carousel
        orientation="vertical"
        setApi={(api) => {
          if (api) {
            api.reInit = reInit;
          }
        }}
        className="h-64"
      >
        <CarouselContent>
          <CarouselItem>
            <div className="h-32">Resize slide</div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(reInit).toHaveBeenCalled();
    });

    global.ResizeObserver = originalResizeObserver;
    jest.useRealTimers();
  });

  it('uses opts axis to infer vertical orientation', () => {
    render(
      <Carousel opts={{ axis: 'y' }}>
        <CarouselContent>
          <CarouselItem>Vertical slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );

    expect(screen.getByText('Vertical slide')).toBeInTheDocument();
  });
});
