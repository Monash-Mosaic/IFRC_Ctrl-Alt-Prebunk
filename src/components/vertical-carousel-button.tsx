import React, {
  ComponentPropsWithRef,
  useCallback,
  useEffect,
  useState
} from 'react'
import { EmblaCarouselType } from 'embla-carousel'

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean
  nextBtnDisabled: boolean
  onPrevButtonClick: () => void
  onNextButtonClick: () => void
}

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    // Subscribe to events first
    emblaApi.on('reInit', onSelect).on('select', onSelect)

    // Defer initial state update to avoid synchronous setState in effect
    // Use requestAnimationFrame to defer until after render
    const rafId = requestAnimationFrame(() => {
      onSelect(emblaApi)
    })

    return () => {
      cancelAnimationFrame(rafId)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  }
}

type PropType = ComponentPropsWithRef<'button'>

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, disabled, ...restProps } = props

  return (
    <button
      className="touch-manipulation inline-flex no-underline cursor-pointer border-0 p-0 m-0 shadow-[inset_0_0_0_0.2rem_rgb(209_213_219)] w-14 h-14 z-[1] rounded-full text-foreground items-center justify-center active:bg-gray-100 disabled:text-muted-foreground disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
      type="button"
      disabled={disabled}
      aria-label="Previous item"
      {...restProps}
    >
      <svg className="w-[35%] h-[35%]" viewBox="0 0 532 532" aria-hidden="true">
        <path
          fill="currentColor"
          d="M520.646 355.66c13.805 13.793 13.805 36.208 0 50.001-13.804 13.785-36.238 13.785-50.034 0L266 201.22 61.391 405.66c-13.805 13.785-36.239 13.785-50.044 0-13.796-13.793-13.796-36.208 0-50.002 22.947-22.928 206.507-206.395 229.454-229.332a35.065 35.065 0 0 1 25.126-10.326c9.2 0 18.26 3.393 25.2 10.326 45.901 45.865 206.564 206.404 229.52 229.332Z"
        />
      </svg>
      {children}
    </button>
  )
}

export const NextButton: React.FC<PropType> = (props) => {
  const { children, disabled, ...restProps } = props

  return (
    <button
      className="touch-manipulation inline-flex no-underline cursor-pointer border-0 p-0 m-0 shadow-[inset_0_0_0_0.2rem_rgb(209_213_219)] w-14 h-14 z-[1] rounded-full text-foreground items-center justify-center active:bg-gray-100 disabled:text-muted-foreground disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
      type="button"
      disabled={disabled}
      aria-label="Next item"
      {...restProps}
    >
      <svg className="w-[35%] h-[35%]" viewBox="0 0 532 532" aria-hidden="true">
        <path
          fill="currentColor"
          d="M11.354 176.34c-13.805-13.793-13.805-36.208 0-50.001 13.804-13.785 36.238-13.785 50.034 0L266 330.78l204.61-204.442c13.805-13.785 36.239-13.785 50.044 0 13.796 13.793 13.796 36.208 0 50.002a5994246.277 5994246.277 0 0 0-229.454 229.332 35.065 35.065 0 0 1-25.126 10.326c-9.2 0-18.26-3.393-25.2-10.326C194.973 359.808 34.31 199.269 11.354 176.34Z"
        />
      </svg>
      {children}
    </button>
  )
}
