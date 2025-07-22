// src/pages/AccessDeliveryPolicyPage.jsx
import React from "react";

const AccessDeliveryPolicyPage = () => {
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
          Access & Service Delivery Policy
        </h1>

        <p className="text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
          Last updated: July 21, 2025
        </p>

        {/* Section: Introduction */}
        <PolicySection title="Introduction">
          <p>
            This Access & Service Delivery Policy outlines how Nexus AI provides
            access to its services and delivers digital content and features to its users.
            As an AI-powered digital service, there are no physical products shipped.
            All services and content are delivered electronically.
          </p>
        </PolicySection>

        {/* Section: Service Access */}
        <PolicySection title="Service Access">
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Account Creation:</span>
              &nbsp;Upon successful registration, users gain immediate access to
              the free tier of Nexus AI's services through their user account on
              our website and mobile application.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Subscription Activation:</span>
              &nbsp;For premium features and expanded access (e.g., "Soul Pro," "Soul Custom"),
              access is granted immediately upon successful payment and subscription
              activation. Confirmation of your subscription and updated account status
              will be reflected within your app profile and via email.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Geographical Restrictions:</span>
              &nbsp;Access to Nexus AI services may be limited or vary in certain
              geographical regions due to regulatory requirements or service
              availability. We strive to make our service broadly accessible but
              cannot guarantee availability in all locations.
            </li>
          </ul>
        </PolicySection>

        {/* Section: Digital Content and Feature Delivery */}
        <PolicySection title="Digital Content and Feature Delivery">
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>AI Responses & Interactions:</span>
              &nbsp;All AI-generated responses, search results, and interactive
              content are delivered instantly within the Nexus AI application
              interface following your queries.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Reports & Downloads:</span>
              &nbsp;If your subscription plan includes downloadable reports, summaries,
              or other digital assets, these will be made available for download
              directly within the application or sent to your registered email
              address immediately upon generation or request.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Feature Updates:</span>
              &nbsp;New features and service enhancements are delivered
              electronically as updates to the Nexus AI application (web and mobile).
              Users will be notified of significant updates through in-app messages
              or email.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Service Availability:</span>
              &nbsp;We strive for 24/7 service availability. However, occasional
              downtime may occur due to maintenance, unforeseen technical issues,
              or external factors. We will endeavor to provide prior notice for
              scheduled maintenance.
            </li>
          </ul>
        </PolicySection>

        {/* Section: Support for Access Issues */}
        <PolicySection title="Support for Access Issues">
          <p>
            If you experience any issues accessing your Nexus AI account, premium
            features, or digital content, please:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Refer to our <a href="/faq" className="underline" style={{ color: "var(--primary-accent)" }}>Frequently Asked Questions (FAQ)</a> section.
            </li>
            <li>
              Contact our support team immediately at{" "}
              <a href="mailto:support@nexusai.com" className="underline" style={{ color: "var(--primary-accent)" }}>support@newsai.com</a>
              &nbsp;or visit our <a href="/contact-us" className="underline" style={{ color: "var(--primary-accent)" }}>Contact Us page</a>.
              We aim to resolve access issues promptly.
            </li>
          </ul>
        </PolicySection>

        {/* Section: Changes to This Policy */}
        <PolicySection title="Changes to This Policy">
          <p>
            Nexus AI may update this Access & Service Delivery Policy from time to time.
            We will notify you of any changes by posting the new Policy on this page.
            Your continued use of the Service after such modifications will constitute
            your acknowledgment of the modified Policy and agreement to abide and be
            bound by the modified Policy.
          </p>
        </PolicySection>

        {/* Section: Contact Us */}
        <PolicySection title="Contact Us">
          <p>
            If you have any questions about this Access & Service Delivery Policy,
            please contact us:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>By email: <a href="mailto:support@newsai.com" className="underline" style={{ color: "var(--primary-accent)" }}>support@nexusai.com</a></li>
            <li>By visiting our Contact Us page: <a href="/contact-us" className="underline" style={{ color: "var(--primary-accent)" }}>/contact</a></li>
          </ul>
        </PolicySection>
      </div>
    </div>
  );
};

// Reusing the PolicySection helper component
const PolicySection = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--primary-accent)" }}>
      {title}
    </h2>
    <div className="text-sm sm:text-base space-y-3" style={{ color: "var(--text-primary)" }}>
      {children}
    </div>
  </div>
);

export default AccessDeliveryPolicyPage;