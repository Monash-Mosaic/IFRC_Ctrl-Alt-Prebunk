import React, { useEffect } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'
import { usePrevNextButtons } from '@/components/vertical-carousel-button'
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
    if (!emblaApi || !lockNext) return
    
    let lastIndex = emblaApi.selectedScrollSnap()
    
    const preventNextScroll = () => {
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

  const {
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
      <div
        className="h-full w-full overflow-hidden overscroll-y-contain touch-pan-y"
        ref={emblaRef}
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="flex h-full touch-pan-y touch-pinch-zoom flex-col">
          {children?.(emblaApi)}
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel
