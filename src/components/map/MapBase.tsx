// Stylized Milan basemap — pure decorative SVG (blocks, a park, water, and a
// radial road network). No real geography, no API key.

const BLOCKS: Array<[number, number, number, number]> = [
  [40, 90, 80, 70],
  [150, 60, 90, 60],
  [270, 110, 70, 80],
  [60, 230, 70, 70],
  [250, 250, 90, 70],
  [120, 360, 90, 80],
  [280, 380, 70, 70],
]

const RADIAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export function MapBase() {
  const road = 'rgba(120,108,92,0.18)'
  const roadMain = 'rgba(211,60,0,0.16)'
  const water = 'var(--color-smurf-100)'
  const waterStroke = 'var(--color-smurf-300)'
  const park = 'rgba(163,209,84,0.30)'
  const block = 'rgba(255,255,255,0.55)'

  return (
    <svg
      viewBox="0 0 400 560"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0"
      aria-hidden="true"
    >
      {BLOCKS.map(([x, y, w, h]) => (
        <rect
          key={`${x}-${y}-${w}-${h}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx="10"
          fill={block}
        />
      ))}
      <path
        d="M44 70 q60 -20 96 6 q24 40 -6 78 q-50 30 -96 4 q-22 -50 6 -88 Z"
        fill={park}
      />
      <path
        d="M-10 470 L120 360 L150 380 L20 500 Z"
        fill={water}
        stroke={waterStroke}
        strokeWidth="2"
      />
      <path
        d="M120 360 L260 250"
        fill="none"
        stroke={waterStroke}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle
        cx="205"
        cy="285"
        r="190"
        fill="none"
        stroke={road}
        strokeWidth="9"
      />
      <circle
        cx="205"
        cy="285"
        r="120"
        fill="none"
        stroke={roadMain}
        strokeWidth="7"
      />
      <circle
        cx="205"
        cy="285"
        r="58"
        fill="none"
        stroke={road}
        strokeWidth="5"
      />
      {RADIAL_ANGLES.map((a) => {
        const r = (a * Math.PI) / 180
        return (
          <line
            key={a}
            x1={205 + Math.cos(r) * 30}
            y1={285 + Math.sin(r) * 30}
            x2={205 + Math.cos(r) * 250}
            y2={285 + Math.sin(r) * 250}
            stroke={road}
            strokeWidth={a % 90 === 0 ? 6 : 3}
            strokeLinecap="round"
          />
        )
      })}
      <line
        x1="20"
        y1="180"
        x2="380"
        y2="120"
        stroke={road}
        strokeWidth="2.5"
        opacity="0.7"
      />
      <line
        x1="30"
        y1="420"
        x2="390"
        y2="470"
        stroke={road}
        strokeWidth="2.5"
        opacity="0.7"
      />
    </svg>
  )
}
