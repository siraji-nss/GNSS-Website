import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';

const SiteSettingsContext = createContext(null);

const DEFAULTS = {
  site_title: 'GlobalNest Study Solution',
  meta_description: '',
  tagline: 'Navigating Your Educational Horizon with Integrity',
  footer_tagline: 'Your Pathway to World-Class Education',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  services_disclaimer: '',
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    return api.get('/settings').then((data) => {
      setSettings({ ...DEFAULTS, ...data });
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    refresh().catch(() => setLoaded(true));
  }, [refresh]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
