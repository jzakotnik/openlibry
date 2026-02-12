export const CARD_HEIGHT = 210;

export type TopicCount = {
  topic: string;
  count: number;
};

// Shared card shell classes
export const cardBaseClasses = `
  min-w-[275px] min-h-[210px] rounded-2xl overflow-hidden bg-white
  shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]
  transition-all duration-200 ease-out
  hover:shadow-[0_4px_16px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.06)]
  hover:-translate-y-0.5
`;

// Accent bar: use from-{color} to-{color}/50
// e.g. "from-primary to-primary/50" or "from-secondary to-secondary/50"
export const cardAccentClasses = "h-1 w-full bg-gradient-to-r";

// Primary action button
export const cardActionButtonClasses = `
  text-sm font-semibold text-primary
  px-3 py-1.5 rounded-lg
  hover:bg-primary/5
  transition-colors cursor-pointer
`;

// Large metric number
export const metricClasses = "text-3xl font-bold text-primary leading-tight";

// Input fields within cards
export const cardInputClasses = `
  w-full rounded-[10px] border border-gray-200 px-3 py-2 text-sm
  hover:border-primary-light
  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
  transition-colors
`;
