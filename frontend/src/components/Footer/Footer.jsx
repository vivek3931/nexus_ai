import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { href: '/terms', text: 'Terms', ariaLabel: 'Terms of Service' },
    { href: '/privacy', text: 'Privacy', ariaLabel: 'Privacy Policy' },
    { href: '/contact', text: 'Contact', ariaLabel: 'Contact Us' },
    { href: '/about', text: 'About', ariaLabel: 'About AyeSoul' }
  ];

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <nav className="footer-nav" aria-label="Footer navigation">
          <ul className="footer-links">
            {footerLinks.map((link, index) => (
              <li key={index} className="footer-link-item">
                <a 
                  href={link.href} 
                  className="footer-link"
                  aria-label={link.ariaLabel}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="footer-copyright">
          <p>© {currentYear} Nexus X1 from Nexus AI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;