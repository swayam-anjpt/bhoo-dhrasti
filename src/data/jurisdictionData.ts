import { JurisdictionState } from '../types';

export const JURISDICTION_STATES: JurisdictionState[] = [
  {
    code: 'GJ',
    name: 'Gujarat',
    districts: [
      {
        id: 'dist-ahmedabad',
        name: 'Ahmedabad',
        talukas: [
          'Ahmedabad City',
          'Daskroi',
          'Sanand',
          'Bavla',
          'Dholka',
          'Dhandhuka',
          'Dholera',
          'Viramgam',
          'Mandal',
          'Detroj-Rampura'
        ],
      },
    ],
  },
];

// Lookup helper for city / taluka center coordinates
export const TALUKA_CENTROIDS: Record<string, [number, number]> = {
  // Ahmedabad
  'Ahmedabad City': [23.0276, 72.5797],
  'Daskroi': [22.9650, 72.6820],
  'Sanand': [22.9868, 72.3807],
  'Bavla': [22.8366, 72.3678],
  'Dholka': [22.7214, 72.4433],
  'Dhandhuka': [22.3672, 71.9841],
  'Dholera': [22.2530, 72.1910],
  'Viramgam': [23.1191, 72.0326],
  'Mandal': [23.2882, 72.0152],
  'Detroj-Rampura': [23.3364, 72.1895],
};
