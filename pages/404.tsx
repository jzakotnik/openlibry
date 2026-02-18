import Layout from "@/components/layout/Layout";
import { useRouter } from "next/router";

// ✅ palette import removed entirely

export default function NotFound() {
  const router = useRouter();

  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
        {/* SVG Cat Reading a Book */}
        <div className="mb-8 w-64 sm:w-80">
          <svg
            viewBox="0 0 400 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full drop-shadow-lg"
          >
            {/* Book (open, lying flat-ish) */}
            <g>
              {/* Left page */}
              <path
                d="M100 240 L100 170 Q100 160 110 158 L195 145 L195 225 Q195 228 190 229 L105 245 Q100 246 100 240Z"
                fill="var(--background)"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              {/* Right page */}
              <path
                d="M195 145 L280 155 Q290 157 290 167 L290 240 Q290 245 285 244 L195 225Z"
                fill="var(--background-paper)"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              {/* Spine */}
              <line
                x1="195"
                y1="145"
                x2="195"
                y2="225"
                stroke="var(--primary)"
                strokeWidth="2.5"
              />
              {/* Text lines left page */}
              <line
                x1="118"
                y1="172"
                x2="175"
                y2="165"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="118"
                y1="182"
                x2="180"
                y2="175"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="118"
                y1="192"
                x2="165"
                y2="186"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
              />
              <line
                x1="118"
                y1="202"
                x2="172"
                y2="196"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
              />
              {/* Text lines right page */}
              <line
                x1="210"
                y1="165"
                x2="272"
                y2="172"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="210"
                y1="175"
                x2="268"
                y2="181"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="210"
                y1="185"
                x2="260"
                y2="190"
                stroke="var(--primary-light)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
              />
              {/* 404 on right page */}
              <text
                x="240"
                y="218"
                textAnchor="middle"
                fontSize="22"
                fontWeight="800"
                fill="var(--primary)"
                opacity="0.25"
                fontFamily="system-ui, sans-serif"
              >
                404
              </text>
            </g>
            {/* Cat body */}
            <g>
              {/* Tail */}
              <path
                d="M130 260 Q80 240 75 280 Q72 310 100 305 Q115 302 118 290"
                stroke="var(--primary-dark)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-2 100 280; 2 100 280; -2 100 280"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
              {/* Back body / torso */}
              <ellipse
                cx="195"
                cy="275"
                rx="72"
                ry="42"
                fill="var(--primary-dark)"
              />{" "}
              {/* ✅ */}
              {/* Belly highlight */}
              <ellipse
                cx="200"
                cy="280"
                rx="45"
                ry="25"
                fill="var(--primary)"
                opacity="0.3"
              />{" "}
              {/* ✅ */}
              {/* Left paw */}
              <ellipse
                cx="155"
                cy="243"
                rx="16"
                ry="9"
                fill="var(--primary-dark)"
              />{" "}
              {/* ✅ */}
              <path
                d="M143 240 Q142 236 145 235"
                stroke="var(--background)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M150 238 Q149 234 152 233"
                stroke="var(--background)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M157 238 Q156 234 159 233"
                stroke="var(--background)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Right paw */}
              <ellipse
                cx="235"
                cy="245"
                rx="16"
                ry="9"
                fill="var(--primary-dark)"
              />{" "}
              {/* ✅ */}
              <path
                d="M229 242 Q228 238 231 237"
                stroke="var(--background)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M236 241 Q235 237 238 236"
                stroke="var(--background)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M243 242 Q242 238 245 237"
                stroke="var(--background)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Head */}
              <circle
                cx="195"
                cy="220"
                r="38"
                fill="var(--primary-dark)"
              />{" "}
              {/* ✅ */}
              {/* Ears */}
              <path
                d="M164 192 L155 155 L182 185Z"
                fill="var(--primary-dark)"
                stroke="var(--primary-dark)"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M168 188 L162 164 L182 185Z"
                fill="var(--secondary)"
                opacity="0.4"
              />{" "}
              {/* ✅ was: palette.secondary.main */}
              <path
                d="M226 192 L235 155 L208 185Z"
                fill="var(--primary-dark)"
                stroke="var(--primary-dark)"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M222 188 L228 164 L208 185Z"
                fill="var(--secondary)"
                opacity="0.4"
              />{" "}
              {/* ✅ */}
              {/* Eyes */}
              <g>
                <ellipse
                  cx="180"
                  cy="215"
                  rx="8"
                  ry="9"
                  fill="var(--background)"
                />
                <ellipse
                  cx="210"
                  cy="215"
                  rx="8"
                  ry="9"
                  fill="var(--background)"
                />
                <ellipse
                  cx="181"
                  cy="219"
                  rx="4.5"
                  ry="5.5"
                  fill="var(--foreground)"
                />
                <ellipse
                  cx="211"
                  cy="219"
                  rx="4.5"
                  ry="5.5"
                  fill="var(--foreground)"
                />
                <circle cx="183" cy="216" r="2" fill="white" />
                <circle cx="213" cy="216" r="2" fill="white" />
              </g>
              {/* Nose */}
              <path
                d="M193 225 L195 228 L197 225Z"
                fill="var(--secondary)"
              />{" "}
              {/* ✅ */}
              {/* Mouth */}
              <path
                d="M195 228 Q189 233 185 230"
                stroke="var(--primary-light)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M195 228 Q201 233 205 230"
                stroke="var(--primary-light)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Whiskers */}
              <g
                stroke="var(--primary-light)"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.7"
              >
                {" "}
                {/* ✅ */}
                <line x1="170" y1="223" x2="140" y2="218" />
                <line x1="170" y1="227" x2="138" y2="228" />
                <line x1="170" y1="231" x2="142" y2="237" />
                <line x1="220" y1="223" x2="250" y2="218" />
                <line x1="220" y1="227" x2="252" y2="228" />
                <line x1="220" y1="231" x2="248" y2="237" />
              </g>
              {/* Glasses */}
              <g
                stroke="var(--secondary)"
                strokeWidth="2"
                fill="none"
                opacity="0.8"
              >
                {" "}
                {/* ✅ */}
                <circle cx="180" cy="215" r="13" />
                <circle cx="210" cy="215" r="13" />
                <path d="M193 215 Q195 218 197 215" />
                <line x1="167" y1="213" x2="160" y2="208" />
                <line x1="223" y1="213" x2="230" y2="208" />
              </g>
            </g>
            {/* Floor / shadow */}
            <ellipse
              cx="195"
              cy="315"
              rx="120"
              ry="10"
              fill="var(--primary)"
              opacity="0.08"
            />{" "}
            {/* ✅ */}
            {/* Floating sparkles */}
            <g>
              <circle
                cx="90"
                cy="175"
                r="2.5"
                fill="var(--secondary)"
                opacity="0.6"
              >
                {" "}
                {/* ✅ */}
                <animate
                  attributeName="opacity"
                  values="0.6;0.15;0.6"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="310"
                cy="185"
                r="2"
                fill="var(--primary-light)"
                opacity="0.5"
              >
                {" "}
                {/* ✅ */}
                <animate
                  attributeName="opacity"
                  values="0.5;0.1;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="320"
                cy="155"
                r="1.5"
                fill="var(--secondary)"
                opacity="0.4"
              >
                {" "}
                {/* ✅ */}
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="75"
                cy="150"
                r="1.8"
                fill="var(--primary-light)"
                opacity="0.35"
              >
                {" "}
                {/* ✅ */}
                <animate
                  attributeName="opacity"
                  values="0.35;0.05;0.35"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </svg>
        </div>

        {/* Text */}
        {/* ✅ was: style={{ color: palette.primary.main }} */}
        <h1 className="mb-2 text-center text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
          404
        </h1>
        {/* ✅ was: style={{ color: palette.primary.dark }} — primary-dark ≈ primary */}
        <p className="mb-1 text-center text-lg font-semibold text-primary sm:text-xl">
          Seite nicht gefunden
        </p>
        {/* ✅ was: style={{ color: palette.text.secondary }} → muted-foreground (#5A6166) */}
        <p className="mb-8 max-w-md text-center text-sm text-muted-foreground sm:text-base">
          Die Seite konnte leider nicht gefunden werden — vielleicht wurde sie
          ausgeliehen und noch nicht zurückgegeben?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {/* ✅ was: borderColor `${palette.primary.main}33`, color: palette.primary.main */}
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-primary/20 px-5 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:shadow-md"
          >
            Zurück
          </button>
          {/* ✅ was: style={{ backgroundColor: palette.primary.main, color: palette.primary.contrastText }} */}
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    </Layout>
  );
}
