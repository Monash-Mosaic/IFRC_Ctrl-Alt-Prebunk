import React, { useEffect } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from '@/components/vertical-carousel-button'
import useEmblaCarousel from 'embla-carousel-react'

type PropType = {
  options?: EmblaOptionsType
  lockNext?: boolean
  onApi?: (api: EmblaCarouselType | null) => void
  children?: (emblaApi: EmblaCarouselType | undefined) => React.ReactNode
}


const EmblaCarousel: React.FC<PropType> = (props) => {
  const { options, lockNext, onApi, children } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  useEffect(() => {
    if (onApi && emblaApi) {
      onApi(emblaApi)
    }
    return () => {
      if (onApi) {
        onApi(null)
      }
    }
  }, [emblaApi, onApi])

  useEffect(() => {
    if (!emblaApi) return
    
    let lastIndex = emblaApi.selectedScrollSnap()
    
    const preventNextScroll = () => {
      if (!lockNext) {
        lastIndex = emblaApi.selectedScrollSnap()
        return
      }
      
      const currentIndex = emblaApi.selectedScrollSnap()
      // If user scrolled forward while locked, scroll back
      if (currentIndex > lastIndex) {
        emblaApi.scrollTo(lastIndex)
      } else {
        lastIndex = currentIndex
      }
    }

    emblaApi.on('select', preventNextScroll)

    return () => {
      emblaApi.off('select', preventNextScroll)
    }
  }, [emblaApi, lockNext])

  // Prevent wheel scrolling when locked (touch scrolling is handled by select event)
  useEffect(() => {
    if (!emblaApi) return
    
    const container = emblaApi.containerNode()
    let lastIndex = emblaApi.selectedScrollSnap()
    
    const updateLastIndex = () => {
      lastIndex = emblaApi.selectedScrollSnap()
    }
    
    const preventWheelScroll = (e: WheelEvent) => {
      // Don't interfere with interactions on buttons
      const target = e.target as HTMLElement
      if (target.closest('button, a, input, select, textarea')) {
        return
      }
      
      if (!lockNext) {
        updateLastIndex()
        return
      }
      
      const currentIndex = emblaApi.selectedScrollSnap()
      // If scrolling down (forward) while locked, prevent it
      if (e.deltaY > 0 && currentIndex >= lastIndex) {
        e.preventDefault()
        e.stopPropagation()
      } else if (e.deltaY < 0) {
        // Allow scrolling back - update lastIndex
        updateLastIndex()
      }
    }

    container.addEventListener('wheel', preventWheelScroll, { passive: false })

    return () => {
      container.removeEventListener('wheel', preventWheelScroll)
    }
  }, [emblaApi, lockNext])

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  return (
    <section 
      className="w-full h-full"
      aria-label="Content carousel"
      role="region"
    >
      <div className="overflow-hidden h-full w-full" ref={emblaRef} aria-live="polite" aria-atomic="false">
        <div className="flex touch-pan-y touch-pinch-zoom flex-col h-full">
          {children?.(emblaApi)}
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel
