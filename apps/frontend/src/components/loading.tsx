'use client'

import { cn } from '@/lib/utils'

const VIEWBOX_WIDTH = 274
const VIEWBOX_HEIGHT = 538

const GRADIENT_ID = 'rockstar-gray-base-blue-shimmer-5s'

const LIGHTNING_PATH =
  'M268.18 1.30566C269.937 -0.571111 273.042 1.10676 272.435 3.60449L213.489 245.858C211.574 253.728 217.535 261.313 225.634 261.313H260.289C270.408 261.314 275.595 273.442 268.603 280.759L27.4546 533.107C19.3404 541.598 5.21629 533.898 7.9585 522.478L56.8882 318.706C58.7757 310.845 52.8178 303.287 44.7339 303.287H12.0239C1.96057 303.287 -3.2487 291.276 3.62842 283.929L268.18 1.30566Z'

interface LoadingProps {
  className?: string
  width?: number
  height?: number
}

export function Loading({ className = '', width = 48, height }: LoadingProps) {
  const heightPx = height ?? Math.round((width / VIEWBOX_WIDTH) * VIEWBOX_HEIGHT)

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg
        width={width}
        height={heightPx}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        aria-label="Carregando..."
        role="img"
      >
        <defs>
          <linearGradient
            id={GRADIENT_ID}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            spreadMethod="repeat"
          >
            <stop offset="0%" stopColor="#0c0c0d" />
            <stop offset="20%" stopColor="#0c0c0d" />
            <stop offset="38%" stopColor="#004E63" />
            <stop offset="46%" stopColor="#00A3D9" />
            <stop offset="50%" stopColor="#00C8FF" />
            <stop offset="54%" stopColor="#00A3D9" />
            <stop offset="62%" stopColor="#004E63" />
            <stop offset="80%" stopColor="#0c0c0d" />
            <stop offset="100%" stopColor="#0c0c0d" />
          </linearGradient>

          <animateTransform
            xlinkHref={`#${GRADIENT_ID}`}
            attributeName="gradientTransform"
            type="translate"
            from="0, 0"
            to="1, 1"
            dur="1.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.455 0.03 0.515 0.955"
            keyTimes="0; 1"
          />
        </defs>

        <path
          d={LIGHTNING_PATH}
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth={8}
        />
      </svg>
    </div>
  )
}