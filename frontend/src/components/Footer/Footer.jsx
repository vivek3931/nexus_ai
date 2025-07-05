import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/terms', text: 'Terms', ariaLabel: 'Terms of Service' },
    { href: '/privacy', text: 'Privacy', ariaLabel: 'Privacy Policy' },
    { href: '/contact', text: 'Contact', ariaLabel: 'Contact Us' },
    { href: '/about', text: 'About', ariaLabel: 'About Nexus AI' } // Changed "AyeSoul" to "Nexus AI" for consistency
  ];

  return (
    <footer className="bg-[#0a0a0a] p-4 border-t border-gray-800 text-gray-400 text-sm flex-shrink-0">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto space-y-4 md:space-y-0">
        
        <nav aria-label="Footer navigation">
          
          <ul className="flex space-x-4">
            {footerLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="hover:text-white transition-colors duration-200" // footer-link: Hover effect.
                  aria-label={link.ariaLabel}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* footer-copyright: Copyright text. */}
        <div className="text-center md:text-right">
          <p>© {currentYear} Nexus X1 from Nexus AI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
