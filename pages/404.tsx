import Layout from "@/components/layout/Layout";
import palette from "@/styles/palette";
import { useRouter } from "next/router";

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
                fill="#faf9f8"
                stroke={palette.primary.main}
                strokeWidth="2"
              />
              {/* Right page */}
              <path
                d="M195 145 L280 155 Q290 157 290 167 L290 240 Q290 245 285 244 L195 225Z"
                fill="#f5f3f0"
                stroke={palette.primary.main}
                strokeWidth="2"
              />
              {/* Spine */}
              <line
                x1="195"
                y1="145"
                x2="195"
                y2="225"
                stroke={palette.primary.main}
                strokeWidth="2.5"
              />
              {/* Text lines left page */}
              <line
                x1="118"
                y1="172"
                x2="175"
                y2="165"
                stroke={palette.primary.light}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="118"
                y1="182"
                x2="180"
                y2="175"
                stroke={palette.primary.light}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="118"
                y1="192"
                x2="165"
                y2="186"
                stroke={palette.primary.light}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
              />
              <line
                x1="118"
                y1="202"
                x2="172"
                y2="196"
                stroke={palette.primary.light}
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
                stroke={palette.primary.light}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="210"
                y1="175"
                x2="268"
                y2="181"
                stroke={palette.primary.light}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="210"
                y1="185"
                x2="260"
                y2="190"
                stroke={palette.primary.light}
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
                fill={palette.primary.main}
                opacity="0.25"
                fontFamily="system-ui, sans-serif"
              >
                404
              </text>
            </g>

            {/* Cat body */}
            <g>
              {/* Tail — curls from behind */}
              <path
                d="M130 260 Q80 240 75 280 Q72 310 100 305 Q115 302 118 290"
                stroke={palette.primary.dark}
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
                fill={palette.primary.dark}
              />

              {/* Belly highlight */}
              <ellipse
                cx="200"
                cy="280"
                rx="45"
                ry="25"
                fill={palette.primary.main}
                opacity="0.3"
              />

              {/* Front paws on book */}
              {/* Left paw */}
              <ellipse
                cx="155"
                cy="243"
                rx="16"
                ry="9"
                fill={palette.primary.dark}
              />
              <path
                d="M143 240 Q142 236 145 235"
                stroke="#faf9f8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M150 238 Q149 234 152 233"
                stroke="#faf9f8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M157 238 Q156 234 159 233"
                stroke="#faf9f8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Right paw */}
              <ellipse
                cx="235"
                cy="245"
                rx="16"
                ry="9"
                fill={palette.primary.dark}
              />
              <path
                d="M229 242 Q228 238 231 237"
                stroke="#faf9f8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M236 241 Q235 237 238 236"
                stroke="#faf9f8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M243 242 Q242 238 245 237"
                stroke="#faf9f8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Head */}
              <circle cx="195" cy="220" r="38" fill={palette.primary.dark} />

              {/* Ears */}
              <path
                d="M164 192 L155 155 L182 185Z"
                fill={palette.primary.dark}
                stroke={palette.primary.dark}
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M168 188 L162 164 L182 185Z"
                fill={palette.secondary.main}
                opacity="0.4"
              />
              <path
                d="M226 192 L235 155 L208 185Z"
                fill={palette.primary.dark}
                stroke={palette.primary.dark}
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M222 188 L228 164 L208 185Z"
                fill={palette.secondary.main}
                opacity="0.4"
              />

              {/* Eyes */}
              <g>
                <ellipse cx="180" cy="215" rx="8" ry="9" fill="#faf9f8" />
                <ellipse cx="210" cy="215" rx="8" ry="9" fill="#faf9f8" />
                {/* Pupils — looking down at the book */}
                <ellipse cx="181" cy="219" rx="4.5" ry="5.5" fill="#1a1a2e" />
                <ellipse cx="211" cy="219" rx="4.5" ry="5.5" fill="#1a1a2e" />
                {/* Eye highlights */}
                <circle cx="183" cy="216" r="2" fill="white" />
                <circle cx="213" cy="216" r="2" fill="white" />
              </g>

              {/* Nose */}
              <path
                d="M193 225 L195 228 L197 225Z"
                fill={palette.secondary.main}
              />

              {/* Mouth */}
              <path
                d="M195 228 Q189 233 185 230"
                stroke={palette.primary.light}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M195 228 Q201 233 205 230"
                stroke={palette.primary.light}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* Whiskers */}
              <g
                stroke={palette.primary.light}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.7"
              >
                <line x1="170" y1="223" x2="140" y2="218" />
                <line x1="170" y1="227" x2="138" y2="228" />
                <line x1="170" y1="231" x2="142" y2="237" />
                <line x1="220" y1="223" x2="250" y2="218" />
                <line x1="220" y1="227" x2="252" y2="228" />
                <line x1="220" y1="231" x2="248" y2="237" />
              </g>

              {/* Glasses */}
              <g
                stroke={palette.secondary.main}
                strokeWidth="2"
                fill="none"
                opacity="0.8"
              >
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
              fill={palette.primary.main}
              opacity="0.08"
            />

            {/* Floating sparkles around the cat */}
            <g>
              <circle
                cx="90"
                cy="175"
                r="2.5"
                fill={palette.secondary.main}
                opacity="0.6"
              >
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
                fill={palette.primary.light}
                opacity="0.5"
              >
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
                fill={palette.secondary.main}
                opacity="0.4"
              >
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
                fill={palette.primary.light}
                opacity="0.35"
              >
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
        <h1
          className="mb-2 text-center text-6xl font-extrabold tracking-tight sm:text-7xl"
          style={{ color: palette.primary.main }}
        >
          404
        </h1>
        <p
          className="mb-1 text-center text-lg font-semibold sm:text-xl"
          style={{ color: palette.primary.dark }}
        >
          Seite nicht gefunden
        </p>
        <p
          className="mb-8 max-w-md text-center text-sm sm:text-base"
          style={{ color: palette.text.secondary }}
        >
          Die Seite konnte leider nicht gefunden werden — vielleicht wurde sie
          ausgeliehen und noch nicht zurückgegeben?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md"
            style={{
              borderColor: `${palette.primary.main}33`,
              color: palette.primary.main,
            }}
          >
            Zurück
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: palette.primary.main,
              color: palette.primary.contrastText,
            }}
          >
            Zur Startseite
          </button>
        </div>
      </div>
    </Layout>
  );
}
