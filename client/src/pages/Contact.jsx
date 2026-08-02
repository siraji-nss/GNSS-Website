import InquiryForm from '../components/InquiryForm';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Contact() {
  const { settings } = useSiteSettings();

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">Get In Touch</span>
          <h1>Book Your Free Consultation</h1>
        </div>
      </div>

      <section className="section">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">Contact Details</span>
            <h2>We're Here to Help</h2>
            <p className="lede">
              Reach out directly or fill out the form and one of our counsellors will get back to you.
            </p>
            <ul className="contact-details">
              {settings.phone && <li><strong>Phone</strong>{settings.phone}</li>}
              {settings.whatsapp && <li><strong>WhatsApp</strong>{settings.whatsapp}</li>}
              {settings.email && <li><strong>Email</strong>{settings.email}</li>}
              {settings.address && <li><strong>Office</strong>{settings.address}</li>}
            </ul>
          </div>
          <div className="card">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
