import React from 'react';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  const footerSections = {
    about: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Câu chuyện thương hiệu', href: '/story' },
      { label: 'Đội ngũ', href: '/team' }
    ],
    services: [
      { label: 'Chăm sóc cây ăn quả', href: '/care' },
      { label: 'Quản lý vườn cây', href: '/management' },
      { label: 'Gợi ý chăm sóc tự động', href: '/auto-suggestions' }
    ],
    support: [
      { label: 'Hướng dẫn sử dụng', href: '/guide' },
      { label: 'Chính sách đổi trả', href: '/return-policy' },
      { label: 'Câu hỏi thường gặp', href: '/faq' }
    ],
    contact: {
      address: 'Đại học FPT Hà Nội',
      phone: '+84 123 456 789',
      email: 'info@mammoi.vn'
    }
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' }
  ];

  return (
    <footer className="w-full text-white mt-auto" style={{ backgroundColor: '#04543DFF' }}>
      <div className="container mx-auto px-6 py-10">
        {/* Top Section */}
        <div className="flex flex-wrap items-start justify-between gap-8 pb-8">
          {/* Company Info - Left Side */}
          <div className="flex-shrink-0" style={{ maxWidth: '320px' }}>
            {/* Logo - Clickable */}
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                console.log('Navigating to: Homepage');
                // Scroll to top if on homepage, or navigate to homepage
                // window.location.href = '/';
                // or window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 mb-4 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow">
                <div className="relative w-8 h-8">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#04543DFF' }}></div>
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#04543DFF' }}></div>
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#04543DFF' }}></div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#04543DFF' }}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: '#04543DFF' }}></div>
                </div>
              </div>
              <span className="text-xl font-bold group-hover:text-green-200 transition-colors">Mầm Mới</span>
            </a>

            {/* Description */}
            <p className="text-green-100 text-sm leading-relaxed mb-4">
              Mang thiên nhiên vào ngôi nhà của bạn. Chúng tôi cung cấp cây xanh chất lượng cao với dịch vụ chăm sóc tận tâm.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-green-600"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  title={social.label}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(`Opening ${social.label}`);
                  }}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links - Right Side */}
          <div className="flex flex-wrap gap-12 flex-1 justify-end">
            {/* About Section */}
            <div>
              <h3 className="text-white font-semibold text-base mb-3">Về chúng tôi</h3>
              <ul className="space-y-2">
                {footerSections.about.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(`Navigating to: ${link.label}`);
                      }}
                      className="text-green-100 hover:text-white transition-colors text-sm block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Section */}
            <div>
              <h3 className="text-white font-semibold text-base mb-3">Dịch vụ</h3>
              <ul className="space-y-2">
                {footerSections.services.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(`Navigating to: ${link.label}`);
                      }}
                      className="text-green-100 hover:text-white transition-colors text-sm block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Section */}
            <div>
              <h3 className="text-white font-semibold text-base mb-3">Hỗ trợ</h3>
              <ul className="space-y-2">
                {footerSections.support.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(`Navigating to: ${link.label}`);
                      }}
                      className="text-green-100 hover:text-white transition-colors text-sm block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-white font-semibold text-base mb-3">Liên hệ</h3>
              <ul className="space-y-2 text-sm text-green-100">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <a 
                    href="https://maps.google.com/?q=Đại+học+FPT+Hà+Nội"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leading-relaxed hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      console.log('Opening maps for: Đại học FPT Hà Nội');
                    }}
                  >
                    {footerSections.contact.address}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a 
                    href={`tel:${footerSections.contact.phone}`} 
                    className="hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      console.log(`Calling: ${footerSections.contact.phone}`);
                    }}
                  >
                    {footerSections.contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a 
                    href={`mailto:${footerSections.contact.email}`} 
                    className="hover:text-white transition-colors cursor-pointer"
                    onClick={(e) => {
                      console.log(`Opening email to: ${footerSections.contact.email}`);
                    }}
                  >
                    {footerSections.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
          <div className="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-green-100">
            <span>© 2025 MamMoi, Inc.</span>
            <span className="text-green-600">•</span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                console.log('Navigating to: Privacy');
              }}
              className="hover:text-white transition-colors"
            >
              Privacy
            </a>
            <span className="text-green-600">•</span>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                console.log('Navigating to: Terms');
              }}
              className="hover:text-white transition-colors"
            >
              Terms
            </a>
            <span className="text-green-600">•</span>
            <a
              href="/sitemap"
              onClick={(e) => {
                e.preventDefault();
                console.log('Navigating to: Sitemap');
              }}
              className="hover:text-white transition-colors"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;