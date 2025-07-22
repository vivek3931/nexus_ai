// src/pages/TermsAndConditionsPage.jsx (or wherever you keep your pages)
import React from "react";

const TermsAndConditionsPage = () => {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        backgroundColor: "var(--primary-background-color)",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="w-full max-w-xl sm:max-w-3xl p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col space-y-6"
        style={{
          background: "var(--glass-background)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "var(--glass-backdrop-filter)",
          boxShadow: "0 10px 30px var(--glass-shadow)",
        }}
      >
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-4"
          style={{ color: "var(--primary-accent)" }}
        >
          Terms and Conditions
        </h1>

        <p className="text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
          Last updated: July 21, 2025
        </p>

        {/* Section: Introduction */}
        <TermsSection title="Introduction">
          <p>
            Welcome to News AI! These Terms and Conditions ("Terms") govern your use of
            the News AI mobile application and website (collectively, the "Service").
            By accessing or using the Service, you agree to be bound by these Terms.
            If you disagree with any part of the terms, then you may not access the Service.
          </p>
        </TermsSection>

        {/* Section: Accounts */}
        <TermsSection title="Accounts">
          <p>
            When you create an account with us, you must provide us with information that is accurate,
            complete, and current at all times. Failure to do so constitutes a breach of the Terms,
            which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service
            and for any activities or actions under your password, whether your password is with
            our Service or a third-party social media service.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us
            immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </TermsSection>

        {/* Section: Intellectual Property */}
        <TermsSection title="Intellectual Property">
          <p>
            The Service and its original content (excluding content provided by users), features,
            and functionality are and will remain the exclusive property of News AI and its licensors.
            The Service is protected by copyright, trademark, and other laws of both the India and foreign countries.
            Our trademarks and trade dress may not be used in connection with any product or service
            without the prior written consent of News AI.
          </p>
        </TermsSection>

        {/* Section: Links To Other Web Sites */}
        <TermsSection title="Links To Other Web Sites">
          <p>
            Our Service may contain links to third-party web sites or services that are not owned
            or controlled by News AI.
          </p>
          <p>
            News AI has no control over, and assumes no responsibility for, the content, privacy policies,
            or practices of any third party web sites or services. You further acknowledge and agree that
            News AI shall not be responsible or liable, directly or indirectly, for any damage or loss
            caused or alleged to be caused by or in connection with use of or reliance on any such
            content, goods or services available on or through any such web sites or services.
          </p>
          <p>
            We strongly advise you to read the terms and conditions and privacy policies of any
            third-party web sites or services that you visit.
          </p>
        </TermsSection>

        {/* Section: Termination */}
        <TermsSection title="Termination">
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability,
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will immediately cease.
            If you wish to terminate your account, you may simply discontinue using the Service.
          </p>
        </TermsSection>

        {/* Section: Limitation Of Liability */}
        <TermsSection title="Limitation Of Liability">
          <p>
            In no event shall News AI, nor its directors, employees, partners, agents,
            suppliers, or affiliates, be liable for any indirect, incidental, special,
            consequential or punitive damages, including without limitation, loss of profits,
            data, use, goodwill, or other intangible losses, resulting from (i) your access to
            or use of or inability to access or use the Service; (ii) any conduct or content
            of any third party on the Service; (iii) any content obtained from the Service;
            and (iv) unauthorized access, use or alteration of your transmissions or content,
            whether based on warranty, contract, tort (including negligence) or any other
            legal theory, whether or not we have been informed of the possibility of such damage,
            and even if a remedy set forth herein is found to have failed of its essential purpose.
          </p>
        </TermsSection>

        {/* Section: Disclaimer */}
        <TermsSection title="Disclaimer">
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and
            "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether
            express or implied, including, but not limited to, implied warranties of merchantability,
            fitness for a particular purpose, non-infringement or course of performance.
          </p>
          <p>
            News AI its subsidiaries, affiliates, and its licensors do not warrant that
            a) the Service will function uninterrupted, secure or available at any particular time or location;
            b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful
            components; or d) the results of using the Service will meet your requirements.
          </p>
        </TermsSection>

        {/* Section: Governing Law */}
        <TermsSection title="Governing Law">
          <p>
            These Terms shall be governed and construed in accordance with the laws of India,
            without regard to its conflict of law provisions.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions
            of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding
            our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
          </p>
        </TermsSection>

        {/* Section: Changes To These Terms */}
        <TermsSection title="Changes To These Terms">
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
            If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
            What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after those revisions become effective, you agree to be bound
            by the revised terms. If you do not agree to the new terms, please stop using the Service.
          </p>
        </TermsSection>

        {/* Section: Contact Us */}
        <TermsSection title="Contact Us">
          <p>
            If you have any questions about these Terms, please contact us:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>By email: <a href="mailto:support@newsai.com" className="underline" style={{ color: "var(--primary-accent)" }}>support@nexussai.com</a></li>
            <li>By visiting this page on our website: <a href="/contact-us" className="underline" style={{ color: "var(--primary-accent)" }}>/contact</a></li>
          </ul>
        </TermsSection>
      </div>
    </div>
  );
};

// Helper Component for consistent section styling
const TermsSection = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--primary-accent)" }}>
      {title}
    </h2>
    <div className="text-sm sm:text-base space-y-3" style={{ color: "var(--text-primary)" }}>
      {children}
    </div>
  </div>
);

export default TermsAndConditionsPage;