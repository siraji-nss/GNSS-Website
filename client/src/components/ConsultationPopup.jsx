import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import InquiryForm from './InquiryForm';

const SESSION_KEY = 'gn_consultation_popup_shown';
const SHOW_DELAY_MS = 1500;

export default function ConsultationPopup() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (location.pathname === '/contact') return;
    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="consultation-popup__overlay" onClick={() => setOpen(false)}>
      <div className="consultation-popup__card" onClick={(e) => e.stopPropagation()}>
        <button className="consultation-popup__close" aria-label="Close" onClick={() => setOpen(false)}>
          &times;
        </button>
        <div className="consultation-popup__header">
          <span className="eyebrow">Free Consultation</span>
          <h3>Let's Plan Your Study Abroad Journey</h3>
          <p className="text-muted">Tell us a bit about yourself and a counsellor will reach out shortly.</p>
        </div>
        <InquiryForm variant="popup" />
      </div>
    </div>
  );
}
