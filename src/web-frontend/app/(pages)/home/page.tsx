"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Heart,
  Stethoscope,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Users,
  Award,
  Shield,
  ChevronDown,
} from "lucide-react";
import AuthForms from "./_components/AuthForms";

const announcements = [
  {
    id: 1,
    title: "Free Medical Checkup - October 15",
    description:
      "Join us for our annual community health checkup day! Walk-ins are welcome.",
    date: "Oct 15, 2024",
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800",
  },
  {
    id: 2,
    title: "Flu Vaccine Now Available",
    description:
      "Protect yourself and your family this flu season. Visit the clinic to get vaccinated.",
    date: "Oct 10, 2024",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800",
  },
  {
    id: 3,
    title: "New Laboratory Equipment",
    description:
      "We've upgraded our lab with state-of-the-art diagnostic equipment for faster, more accurate results.",
    date: "Oct 5, 2024",
    image: "https://images.unsplash.com/photo-1581093458791-9d42e1b9b5b9?w=800",
  },
];

const services = [
  {
    id: 1,
    title: "General Consultation",
    description: "Comprehensive medical evaluation by our licensed doctors.",
    image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800",
    icon: <Stethoscope size={32} />,
  },
  {
    id: 3,
    title: "Pharmacy",
    description:
      "Get your prescribed medications conveniently at our in-house pharmacy.",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800",
    icon: <Heart size={32} />,
  },
];

const stats = [
  { icon: <Users size={32} />, value: "3,000+", label: "Patients Served" },
  { icon: <Award size={32} />, value: "15+", label: "Years of Service" },
  {
    icon: <Stethoscope size={32} />,
    value: "3",
    label: "Medical Professionals",
  },
];

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600",
    title: "Welcome to J.A.U Medical Clinic",
    subtitle: "Your Trusted Healthcare Partner",
  },
  {
    image:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1600",
    title: "Modern Medical Facilities",
    subtitle: "State-of-the-Art Equipment & Care",
  },
  {
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600",
    title: "Expert Medical Team",
    subtitle: "Experienced Doctors & Staff",
  },
  {
    image:
      "https://images.unsplash.com/photo-1581093458791-9d42e1b9b5b9?w=1600",
    title: "Comprehensive Services",
    subtitle: "From Consultation to Pharmacy",
  },
];

export default function ModernLandingPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* HERO SECTION WITH AUTH FORMS */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600"
            alt="Medical clinic"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 to-teal-600/30"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/20">
                <Heart size={16} className="text-teal-200" />
                <span>Your Trusted Healthcare Partner</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Welcome to
                <br />
                <span className="text-teal-200">J.A.U Medical Clinic</span>
              </h1>

              <p className="text-xl md:text-2xl text-teal-50 mb-12">
                Providing compassionate, comprehensive healthcare services for
                you and your family
              </p>

              {/* Quick Contact */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-teal-200" />
                  <span className="text-sm">Mon-Sat: 8AM - 5PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={20} className="text-teal-200" />
                  <span className="text-sm">(049) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-teal-200" />
                  <span className="text-sm">Majayjay, Laguna</span>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Forms (only for non-authenticated users) */}
            {!isAuthenticated && (
              <div className="flex justify-center lg:justify-end">
                <AuthForms />
              </div>
            )}

            {/* Authenticated users see welcome message */}
            {isAuthenticated && (
              <div className="flex justify-center lg:justify-end">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Welcome Back!
                  </h2>
                  <p className="text-teal-50 mb-6">
                    You're already logged in. Access your dashboard to manage
                    appointments and more.
                  </p>
                  <a
                    href="/appointment"
                    className="block w-full bg-white text-teal-700 py-3 rounded-lg font-semibold hover:bg-teal-50 transition text-center"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl mb-4 group-hover:shadow-lg transition-shadow">
                  {stat.icon}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                  {stat.value}
                </h3>
                <p className="text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Latest Announcements
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Stay updated with our latest news, events, and health information
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={announcement.image}
                    alt={announcement.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-teal-600 text-white text-sm font-semibold rounded-full">
                    {announcement.date}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors">
                    {announcement.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {announcement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 px-6 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive healthcare services tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-xl mb-3">
                      {service.icon}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <button className="text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP & CONTACT SECTION */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Visit Us
            </h2>
            <p className="text-xl text-slate-600">
              We're conveniently located in Majayjay, Laguna
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-xl min-h-[520]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.123456789!2d121.133039!3d14.2388594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd6267c6199515%3A0x7e9bfe0b59f2e78e!2sJ.A.U.+Medical+Clinic!5e0!3m2!1sen!2sph!4v1692870000000!5m2!1sen!2sph"
                width="100%"
                height="100%"
                className="border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-slate-800 mb-8">
                Get In Touch
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <MapPin className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">
                      Address
                    </h4>
                    <p className="text-slate-600">
                      Brgy. Poblacion, Majayjay
                      <br />
                      Laguna, Philippines 4030
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Phone className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Phone</h4>
                    <p className="text-slate-600">
                      (049) 123-4567
                      <br />
                      +63 912 345 6789
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Mail className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Email</h4>
                    <p className="text-slate-600">
                      info@jaumedical.com
                      <br />
                      appointments@jaumedical.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Hours</h4>
                    <p className="text-slate-600">
                      Monday - Saturday: 8:00 AM - 5:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-br from-teal-800 to-teal-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="text-teal-300" size={32} />
                <h3 className="text-2xl font-bold">J.A.U Medical Clinic</h3>
              </div>
              <p className="text-teal-100 mb-4">
                Your trusted healthcare partner providing comprehensive medical
                services for the community since 2009.
              </p>
            </div>
          </div>

          <div className="border-t border-teal-700 pt-8 text-center text-teal-200">
            <p>© 2025 J.A.U Medical Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
