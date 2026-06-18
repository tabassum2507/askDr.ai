import mixpanel from 'mixpanel-browser';

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;

  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: false,
  });

  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    mixpanel.track(event, properties);
  } catch (e) {
    console.error('Analytics error:', e);
  }
}
