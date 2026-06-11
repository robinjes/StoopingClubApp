export const STOP_WASTE_URL = 'https://www.stopwaste.org/';

export const BRANCH_DIRECTOR_APPLICATION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe8BX056fIh9yK3sjcrDuiXf5_ZZImyFboFY1526F2KZbXF9A/viewform';

export const BRANCH_DIRECTOR_APPLICATION_EMBED_URL = `${BRANCH_DIRECTOR_APPLICATION_URL}?embedded=true`;

export const GET_INVOLVED_SECTIONS = [
  {
    id: 'stopwaste',
    title: 'Become a StopWaste Ambassador',
    label: 'For students in Alameda County',
    paragraphs: [
      "If you're passionate about sustainability and want to make a meaningful impact on your school and community, becoming a StopWaste Ambassador is an excellent opportunity for you.",
      'Through this county-sponsored program, Alameda County students lead hands-on environmental projects that reduce waste, inspire others, and amplify youth voices in climate action. Stooping Club is an official vendor for the Stop Waste Re:Source database, and we often present at program events.',
    ],
    buttonLabel: 'Stop Waste',
    url: STOP_WASTE_URL,
  },
  {
    id: 'branch',
    title: 'Start Your Own Stooping Club Branch',
    label: 'For students anywhere in the world',
    paragraphs: [
      'Want to bring Stooping Club to your community? Become a Branch Director and start your own local chapter dedicated to giving useful items a second life, reducing landfill waste in your area and helping others. No previous web design or business experience required.',
    ],
    buttonLabel: 'Branch Director Application',
    url: BRANCH_DIRECTOR_APPLICATION_URL,
  },
] as const;
