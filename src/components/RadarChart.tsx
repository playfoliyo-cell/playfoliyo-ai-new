import React from "react";

interface RadarDataPoint {
  label: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
}

export default function RadarChart({ data, size = 260 }: RadarChartProps) {
  if (!data || data.length === 0) return null;

  const N = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = (size / 2) - 45; // Leave space for labels

  // Radial angles starting from top (-90 degrees) moving clockwise
  const angles = Array.from({ length: N }, (_, i) => -Math.PI / 2 + (2 * Math.PI * i) / N);

  // Generate coordinates for a given level [0, 1]
  const getCoordinates = (index: number, level: number) => {
    const angle = angles[index];
    const r = level * maxRadius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  // Generate coordinates for data point (scaled 0-100)
  const getDataCoordinates = (index: number, value: number) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    return getCoordinates(index, clampedValue / 100);
  };

  // 1. Grid Rings (at 25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // 2. Data points string for the filled polygon
  const polygonPoints = data
    .map((d, i) => {
      const { x, y } = getDataCoordinates(i, d.value);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50/40 rounded-2xl border border-slate-100">
      <svg 
        width="100%" 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-[280px]"
      >
        <defs>
          <linearGradient id="radarBlueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Concentric grid rings */}
        {gridLevels.map((level, ringIdx) => {
          const points = Array.from({ length: N }, (_, i) => {
            const { x, y } = getCoordinates(i, level);
            return `${x},${y}`;
          }).join(" ");

          return (
            <polygon
              key={`ring-${ringIdx}`}
              points={points}
              className="fill-none stroke-slate-200/80 stroke-1"
            />
          );
        })}

        {/* Diagonal axis lines */}
        {angles.map((angle, i) => {
          const outer = getCoordinates(i, 1.0);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              className="stroke-slate-200 stroke-1 stroke-dasharray-[3,3]"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Filled and bordered main data polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarBlueGradient)"
          className="stroke-blue-600 stroke-2 transition-all duration-500 ease-out"
        />

        {/* Interactive nodes & values */}
        {data.map((d, i) => {
          const { x, y } = getDataCoordinates(i, d.value);
          return (
            <g key={`node-${i}`} className="group cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r={4.5}
                className="fill-blue-600 stroke-white stroke-2 transition-all duration-300 group-hover:r-[6px] group-hover:fill-blue-700"
              />
              {/* Value popover tooltip on hover */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect
                  x={x - 14}
                  y={y - 22}
                  width="28"
                  height="16"
                  rx="4"
                  className="fill-slate-900"
                />
                <text
                  x={x}
                  y={y - 11}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold fill-white"
                >
                  {d.value}
                </text>
              </g>
            </g>
          );
        })}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const outer = getCoordinates(i, 1.15);
          
          // Custom positioning adjustments to avoid labels running off-screen
          let textAnchor = "middle";
          const angle = angles[i];
          const cos = Math.cos(angle);
          
          if (cos > 0.1) {
            textAnchor = "start";
          } else if (cos < -0.1) {
            textAnchor = "end";
          }

          // Adjust vertical offset for top/bottom labels
          let dy = "0.33em";
          if (Math.sin(angle) < -0.9) {
            dy = "-0.2em"; // label at the very top
          } else if (Math.sin(angle) > 0.9) {
            dy = "0.8em";  // label at the very bottom
          }

          // Truncate overly long labels if necessary
          const displayLabel = d.label.length > 20 ? `${d.label.slice(0, 18)}...` : d.label;

          return (
            <g key={`label-${i}`} className="select-none pointer-events-none">
              {/* Text background highlight for high contrast readability */}
              <text
                x={outer.x}
                y={outer.y}
                dy={dy}
                textAnchor={textAnchor}
                className="text-[9px] font-black fill-white stroke-white stroke-3 opacity-90 font-sans"
              >
                {displayLabel}
              </text>
              <text
                x={outer.x}
                y={outer.y}
                dy={dy}
                textAnchor={textAnchor}
                className="text-[9px] font-extrabold fill-slate-500 font-sans"
              >
                {displayLabel}
              </text>
            </g>
          );
        })}
      </svg>
      <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider">Interactive Performance Radar</span>
    </div>
  );
}
