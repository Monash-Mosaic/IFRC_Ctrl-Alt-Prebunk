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
  children?: (emblaApi: EmblaCarouselType) => React.ReactNode
}


const EmblaCarousel: React.FC<PropType> = (props) => {
  const { options, children } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  return (
    <section 
      className="max-w-3xl mx-auto px-2"
      aria-label="Content carousel"
      role="region"
    >
      <div className="overflow-hidden" ref={emblaRef} aria-live="polite" aria-atomic="false">
        <div className="flex touch-pan-y touch-pinch-zoom -mt-4 flex-col">
          {children?.(emblaApi)}
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel
