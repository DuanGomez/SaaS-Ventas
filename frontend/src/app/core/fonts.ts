export interface FontOption {
  key: string;
  label: string;
  heading: string;
  body: string;
  googleFontsUrl: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'sora-jakarta',
    label: 'Sora + Plus Jakarta Sans (moderno)',
    heading: "'Sora', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  },
  {
    key: 'playfair-inter',
    label: 'Playfair Display + Inter (elegante)',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    key: 'poppins',
    label: 'Poppins (cercano y redondeado)',
    heading: "'Poppins', system-ui, sans-serif",
    body: "'Poppins', system-ui, sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  },
  {
    key: 'spacegrotesk-work',
    label: 'Space Grotesk + Work Sans (técnico)',
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'Work Sans', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Work+Sans:wght@400;500;600;700&display=swap',
  },
  {
    key: 'dmserif-dmsans',
    label: 'DM Serif Display + DM Sans (editorial)',
    heading: "'DM Serif Display', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap',
  },
];

export const DEFAULT_FONT_KEY = FONT_OPTIONS[0].key;

export function getFontOption(key: string | null | undefined): FontOption {
  return FONT_OPTIONS.find((f) => f.key === key) ?? FONT_OPTIONS[0];
}
