import { useSiteSettings } from '../context/SiteSettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSiteSettings();
  if (!settings.whatsapp) return null;
  const digits = settings.whatsapp.replace(/[^\d]/g, '');
  if (!digits) return null;

  return (
    <a
      className="whatsapp-fab"
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor">
        <path d="M16.02 3C9.4 3 4 8.36 4 15c0 2.34.65 4.53 1.78 6.4L4 29l7.78-1.74A11.9 11.9 0 0 0 16.02 27C22.63 27 28 21.64 28 15S22.63 3 16.02 3zm0 21.6c-2 0-3.87-.56-5.46-1.53l-.39-.23-4.62 1.03 1-4.5-.25-.4A9.53 9.53 0 0 1 6.4 15c0-5.3 4.32-9.6 9.62-9.6 5.3 0 9.6 4.3 9.6 9.6s-4.3 9.6-9.6 9.6zm5.3-7.2c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.64.14-.19.29-.74.93-.9 1.12-.17.19-.33.21-.62.07-.29-.15-1.2-.44-2.3-1.41-.85-.76-1.42-1.7-1.59-1.98-.17-.29-.02-.45.13-.6.13-.13.29-.33.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.53-.87-2.1-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.42 0 1.42 1.02 2.8 1.17 3 .14.19 2 3.06 4.86 4.29.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.34z" />
      </svg>
    </a>
  );
}
