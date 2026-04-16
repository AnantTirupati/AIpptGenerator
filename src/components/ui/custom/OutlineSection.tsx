import { Skeleton } from '../skeleton'
import type { OutlineSlide } from '../../../lib/types'

type Props = {
  loading: boolean;
  outline: OutlineSlide[];
}

function OutlineSection({ loading, outline }: Props) {
  return (
    <div className='mt-7'>
      <h2 className='font-bold text-xl'>Slides Outline</h2>

      {loading && (
        <div className='mt-4 space-y-4'>
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton key={index} className='h-[60px] w-full rounded-2xl' />
          ))}
        </div>
      )}

      {!loading && outline.length > 0 && (
        <div className='mt-4 space-y-3'>
          {outline.map((slide, index) => (
            <div
              key={index}
              className='border rounded-2xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex items-center gap-3 mb-2'>
                <span className='flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0'>
                  {index + 1}
                </span>
                <h3 className='font-semibold text-base'>{slide.title}</h3>
              </div>
              <ul className='pl-10 space-y-1'>
                {slide.points.map((point, pIndex) => (
                  <li
                    key={pIndex}
                    className='text-sm text-muted-foreground list-disc'
                  >
                    {point}
                  </li>
                ))}
              </ul>
              {slide.outline && (
                <p className='pl-10 mt-2 text-xs text-muted-foreground italic'>
                  {slide.outline}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && outline.length === 0 && (
        <p className='mt-4 text-sm text-muted-foreground'>
          No outline generated yet.
        </p>
      )}
    </div>
  )
}

export default OutlineSection
