import mixpanel from 'mixpanel-browser';

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    console.warn('Mixpanel token not found');
    return;
  }

  try {
    mixpanel.init(token, {
      track_pageview: false,
      persistence: 'localStorage',
      ignore_dnt: false,
      loaded: () => {
        initialized = true;
      },
    });
    initialized = true;
  } catch (e) {
    console.error('Mixpanel init failed:', e);
  }
}

export function track(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !initialized) return;
  try {
    mixpanel.track(event, properties);
  } catch {
    // silently fail — analytics should never break the app
  }
}
