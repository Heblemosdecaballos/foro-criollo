
// Barrel exports para componentes de publicidad
export { default as BannerAd } from './BannerAd';
export { default as BannerSlot } from './BannerSlot';
export { default as StickyMobileBanner } from './StickyMobileBanner';
export { default as InterstitialBanner } from './InterstitialBanner';

// Re-export tipos útiles
export type BannerPosition = 
  | 'header-leaderboard'
  | 'sidebar-rectangle'  
  | 'content-mobile'
  | 'footer-leaderboard'
  | 'mobile-sticky'
  | 'interstitial';
