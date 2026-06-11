export type ImpactStat = {
  id: string;
  label: string;
  target: number;
  suffix?: string;
  prefix?: string;
};

/** Template reviews — swap copy and names when real testimonials are ready */
export type CustomerReview = {
  id: string;
  initials: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
};

export const IMPACT_STATS: ImpactStat[] = [
  {
    id: 'items',
    label: 'unique items diverted from landfill',
    target: 2000,
  },
  {
    id: 'customers',
    label: 'customers served',
    target: 360,
  },
  {
    id: 'co2',
    label: 'lbs of CO2e prevented',
    target: 15000,
    suffix: '+',
  },
  {
    id: 'savings',
    label: 'saved by our customers',
    target: 70000,
    prefix: '$',
    suffix: '+',
  },
];

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'maria',
    initials: 'MT',
    name: 'Maria T.',
    role: 'Teacher, Oakland',
    rating: 5,
    quote:
      'I furnished my whole classroom with free items from Stooping Club. My students love it, and nothing went to landfill.',
  },
  {
    id: 'james',
    initials: 'JR',
    name: 'James R.',
    role: 'Student, Berkeley',
    rating: 5,
    quote:
      'Moved into my first apartment with almost nothing. Stooping Club had everything I needed — couch, dishes, lamps — all free.',
  },
  {
    id: 'priya',
    initials: 'PS',
    name: 'Priya S.',
    role: 'Donor, Oakland',
    rating: 5,
    quote:
      "I donated a whole apartment's worth of items when I moved. Knowing they went to real people in my neighborhood instead of a landfill means everything.",
  },
];
