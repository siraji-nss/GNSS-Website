import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import WhyChooseUs from './pages/WhyChooseUs';
import ServicesHub from './pages/ServicesHub';
import CountryService from './pages/CountryService';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './admin/ProtectedRoute';
import LoginPage from './admin/pages/LoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import HeroSlidesAdmin from './admin/pages/HeroSlidesAdmin';
import AboutAdmin from './admin/pages/AboutAdmin';
import CoreValuesAdmin from './admin/pages/CoreValuesAdmin';
import WhyChoosePillarsAdmin from './admin/pages/WhyChoosePillarsAdmin';
import TargetCountriesAdmin from './admin/pages/TargetCountriesAdmin';
import CountryServicesAdmin from './admin/pages/CountryServicesAdmin';
import WorkingProcessAdmin from './admin/pages/WorkingProcessAdmin';
import TestimonialsAdmin from './admin/pages/TestimonialsAdmin';
import BlogAdmin from './admin/pages/BlogAdmin';
import InquiriesAdmin from './admin/pages/InquiriesAdmin';
import SettingsAdmin from './admin/pages/SettingsAdmin';
import ChangePasswordPage from './admin/pages/ChangePasswordPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/why-choose-us" element={<WhyChooseUs />} />
        <Route path="/services" element={<ServicesHub />} />
        <Route path="/services/:slug" element={<CountryService />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="hero-slides" element={<HeroSlidesAdmin />} />
        <Route path="about" element={<AboutAdmin />} />
        <Route path="core-values" element={<CoreValuesAdmin />} />
        <Route path="why-choose-us" element={<WhyChoosePillarsAdmin />} />
        <Route path="target-countries" element={<TargetCountriesAdmin />} />
        <Route path="services" element={<CountryServicesAdmin />} />
        <Route path="working-process" element={<WorkingProcessAdmin />} />
        <Route path="testimonials" element={<TestimonialsAdmin />} />
        <Route path="blog" element={<BlogAdmin />} />
        <Route path="inquiries" element={<InquiriesAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>
    </Routes>
  );
}
