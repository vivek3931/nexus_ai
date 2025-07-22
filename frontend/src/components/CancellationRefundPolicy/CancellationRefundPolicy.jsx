// src/pages/CancellationRefundPolicyPage.jsx (or wherever you keep your pages)
import React from "react";

const CancellationRefundPolicyPage = () => {
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
          Cancellation & Refund Policy
        </h1>

        <p className="text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
          Last updated: July 21, 2025
        </p>

        {/* Section: Introduction */}
        <PolicySection title="Introduction">
          <p>
            This Cancellation and Refund Policy ("Policy") outlines the terms under
            which subscriptions to Nexus AI's services can be cancelled and refunds
            may be issued. By subscribing to and using our Service, you agree to
            the terms of this Policy.
          </p>
        </PolicySection>

        {/* Section: Subscription Terms */}
        <PolicySection title="Subscription Terms">
          <p>
            Nexus AI offers various subscription plans (e.g., monthly, annual)
            that provide access to our AI features. Subscriptions are billed
            in advance on a recurring basis (e.g., monthly or annually) and
            are non-refundable, except as expressly stated in this Policy.
          </p>
          <p>
            Your subscription will automatically renew at the end of each billing
            period unless you cancel it before the renewal date.
          </p>
        </PolicySection>

        {/* Section: Cancellation Policy */}
        <PolicySection title="Cancellation Policy">
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>How to Cancel:</span>
              &nbsp;You can cancel your subscription at any time through your
              account settings page on our website/app. Look for the "Membership" or
              "Subscription" section and follow the cancellation instructions.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Effect of Cancellation:</span>
              &nbsp;If you cancel your subscription, your access to premium
              features will continue until the end of your current paid billing period.
              You will not be charged for the subsequent billing period.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>No Pro-rata Refunds for Cancellation:</span>
              &nbsp;We do not offer pro-rata refunds for cancellations made
              during a billing period. For example, if you are on a monthly plan
              and cancel halfway through the month, you will still have access
              until the end of that month, but will not receive a refund for the
              unused portion of the month.
            </li>
          </ul>
        </PolicySection>

        {/* Section: Refund Policy */}
        <PolicySection title="Refund Policy">
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Initial Subscription Refund (Money-Back Guarantee):</span>
              &nbsp;We offer a <strong> 3 </strong>-day money-back guarantee for
              new annual subscriptions. If you are not satisfied with Nexus AI
              within <strong> 7 </strong> days of your initial annual subscription
              purchase, you may request a full refund. This guarantee applies
              only to your first annual subscription purchase.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Eligibility for Refund:</span>
              &nbsp;Refunds are generally only issued under the conditions of
              our initial subscription money-back guarantee or in cases where
              there has been a clear service error or billing mistake on our part.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Non-Refundable Circumstances:</span>
              &nbsp;Except for the initial money-back guarantee, refunds will
              NOT be issued for:
              <ul className="list-circle ml-6 space-y-1">
                <li>Monthly subscriptions.</li>
                <li>Renewals of any subscription plan (monthly or annual).</li>
                <li>Cancellations due to dissatisfaction beyond the initial money-back guarantee period.</li>
                <li>Account termination due to violation of our Terms and Conditions.</li>
                <li>Changes in personal circumstances or change of mind.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Processing Refunds:</span>
              &nbsp;Eligible refunds will be processed within
              <strong> 7 </strong> business days of approval. The refund will
              be issued to the original payment method used for the purchase.
              Please note that it may take additional time for the refund to
              appear on your bank statement.
            </li>
          </ul>
        </PolicySection>

        {/* Section: Changes to Service or Pricing */}
        <PolicySection title="Changes to Service or Pricing">
          <p>
            Nexus AI reserves the right to modify its subscription plans and
            pricing at any time. Any changes will be communicated to you in advance.
            Such changes will not affect your current billing period but will apply
            to subsequent renewals.
          </p>
        </PolicySection>

        {/* Section: Contact Us */}
        <PolicySection title="Contact Us">
          <p>
            If you have any questions about this Cancellation & Refund Policy or
            wish to request a refund, please contact us:
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

// Reusing the PolicySection helper component from previous pages
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

export default CancellationRefundPolicyPage;