import {
  replacePlaceholdersWithSampleData,
  UserLabelConfig,
} from "@/lib/utils/userLabelConfig";

// A4 dimensions in cm
const A4_W_CM = 21;
const A4_H_CM = 29.7;

// Preview scale: px per cm
const SCALE = 19; // 21cm × 19 = 399px wide

interface LabelPreviewProps {
  config: UserLabelConfig;
  /** src for the background image, e.g. "/api/report/userlabels/image?t=1234" */
  imageUrl?: string;
}

export default function LabelPreview({ config, imageUrl }: LabelPreviewProps) {
  const { grid, label, lines, barcode } = config;
  const labelsPerPage = grid.columns * grid.rows;

  const a4W = A4_W_CM * SCALE;
  const a4H = A4_H_CM * SCALE;
  const labelW = label.widthCm * SCALE;
  const labelH = label.heightCm * SCALE;

  // Build label positions using column-major order (matches PDF renderer)
  const labelPositions = Array.from({ length: labelsPerPage }, (_, pageIndex) => {
    const col = Math.floor(pageIndex / grid.rows);
    const row = pageIndex % grid.rows;
    return {
      left: (grid.marginLeftCm + col * (label.widthCm + grid.spacingHCm)) * SCALE,
      top: (grid.marginTopCm + row * (label.heightCm + grid.spacingVCm)) * SCALE,
    };
  });

  return (
    <div className="overflow-auto rounded-lg bg-muted p-4 flex justify-center">
      {/* A4 sheet */}
      <div
        style={{
          width: a4W,
          height: a4H,
          minWidth: a4W,
          position: "relative",
          background: "white",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      >
        {/* Labels */}
        {labelPositions.map(({ left, top }, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              left,
              top,
              width: labelW,
              height: labelH,
              overflow: "hidden",
              border: label.showBorder
                ? "1px dashed #999"
                : "1px dashed #e0e0e0",
              boxSizing: "border-box",
            }}
          >
            {/* Background image */}
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            )}

            {/* Text lines */}
            {lines.map((line, lineIdx) => (
              <div
                key={lineIdx}
                style={{
                  position: "absolute",
                  top: line.top,
                  left: line.left,
                  color: line.color,
                  // Scale font from pt to preview px: pt × (4/3) × (SCALE/37.795)
                  fontSize: Math.round(line.fontSize * 1.333 * (SCALE / 37.795)),
                  fontFamily: "sans-serif",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {replacePlaceholdersWithSampleData(line.text)}
              </div>
            ))}

            {/* Barcode placeholder */}
            {barcode.enabled && (
              <div
                style={{
                  position: "absolute",
                  top: barcode.top,
                  left: barcode.left,
                  width: parseFloat(barcode.width) * SCALE,
                  height: parseFloat(barcode.height) * SCALE,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {Array.from({ length: 28 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: i % 3 === 0 ? 2 : 1,
                      height: "100%",
                      background:
                        i % 2 === 0
                          ? "rgba(0,0,0,0.75)"
                          : "transparent",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Dimension hint overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 6,
            fontSize: 9,
            color: "#bbb",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          A4 · {labelsPerPage} Etiketten
        </div>
      </div>
    </div>
  );
}
