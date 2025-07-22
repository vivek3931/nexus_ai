// src/pages/PrivacyPolicyPage.jsx (or wherever you keep your pages)
import React from "react";

const PrivacyPolicyPage = () => {
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
          Privacy Policy
        </h1>

        <p className="text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
          Last updated: July 21, 2025
        </p>

        {/* Section: Introduction */}
        <PolicySection title="Introduction">
          <p>
            Welcome to News AI! This Privacy Policy describes how News AI ("we,"
            "us," or "our") collects, uses, and discloses your information when
            you use our mobile application and website (collectively, the
            "Service"). By accessing or using the Service, you agree to the
            collection and use of information in accordance with this Privacy Policy.
          </p>
        </PolicySection>

        {/* Section: Information We Collect */}
        <PolicySection title="Information We Collect">
          <p>We collect several types of information from and about users of our Service:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Personal Data:</span>
              &nbsp;While using our Service, we may ask you to provide us with
              certain personally identifiable information that can be used to contact
              or identify you ("Personal Data"). This may include, but is not
              limited to:
              <ul className="list-circle ml-6 space-y-1">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Usage Data</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Usage Data:</span>
              &nbsp;We may also collect information that your browser sends
              whenever you visit our Service or when you access the Service by or
              through a mobile device ("Usage Data"). This Usage Data may include
              information such as your computer's Internet Protocol address (e.g.,
              IP address), browser type, browser version, the pages of our Service
              that you visit, the time and date of your visit, the time spent on
              those pages, unique device identifiers, and other diagnostic data.
            </li>
            <li>
              <span className="font-semibold" style={{ color: "var(--primary-accent)" }}>Conversation Data:</span>
              &nbsp;As an AI service, we process the queries you submit and the
              responses generated. If you enable "Allow Data Retention for Training"
              in your settings, this data may be used to improve our AI models.
              You can disable this at any time in your settings.
            </li>
          </ul>
        </PolicySection>

        {/* Section: Use of Data */}
        <PolicySection title="Use of Data">
          <p>News AI uses the collected data for various purposes:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent, and address technical issues</li>
            <li>To provide you with news, special offers, and general information about other goods, services, and events which we offer that are similar to those that you have already purchased or enquired about unless you have opted not to receive such information</li>
            <li>To improve our AI models if data retention for training is enabled by you</li>
          </ul>
        </PolicySection>

        {/* Section: Data Retention */}
        <PolicySection title="Data Retention">
          <p>
            News AI will retain your Personal Data only for as long as is
            necessary for the purposes set out in this Privacy Policy. We will
            retain and use your Personal Data to the extent necessary to comply
            with our legal obligations (for example, if we are required to retain
            your data to comply with applicable laws), resolve disputes, and
            enforce our legal agreements and policies.
          </p>
          <p>
            News AI will also retain Usage Data for internal analysis purposes.
            Usage Data is generally retained for a shorter period, except when
            this data is used to strengthen the security or to improve the
            functionality of our Service, or we are legally obligated to retain
            this data for longer periods.
          </p>
        </PolicySection>

        {/* Section: Transfer of Data */}
        <PolicySection title="Transfer of Data">
          <p>
            Your information, including Personal Data, may be transferred to —
            and maintained on — computers located outside of your state, province,
            country, or other governmental jurisdiction where the data protection
            laws may differ from those of your jurisdiction.
          </p>
          <p>
            News AI will take all steps reasonably necessary to ensure that your
            data is treated securely and in accordance with this Privacy Policy
            and no transfer of your Personal Data will take place to an
            organization or a country unless there are adequate controls in place
            including the security of your data and other personal information.
          </p>
        </PolicySection>

        {/* Section: Security of Data */}
        <PolicySection title="Security of Data">
          <p>
            The security of your data is important to us, but remember that no
            method of transmission over the Internet or method of electronic
            storage is 100% secure. While we strive to use commercially acceptable
            means to protect your Personal Data, we cannot guarantee its absolute
            security.
          </p>
        </PolicySection>

        {/* Section: Your Data Protection Rights */}
        <PolicySection title="Your Data Protection Rights">
          <p>
            Depending on your location, you may have the following data protection rights:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              The right to access, update, or delete the information we have on you.
            </li>
            <li>
              The right of rectification.
            </li>
            <li>
              The right to object.
            </li>
            <li>
              The right of restriction.
            </li>
            <li>
              The right to data portability.
            </li>
            <li>
              The right to withdraw consent.
            </li>
          </ul>
          <p>
            If you wish to exercise any of these rights, please contact us.
          </p>
        </PolicySection>

        {/* Section: Links to Other Sites */}
        <PolicySection title="Links to Other Sites">
          <p>
            Our Service may contain links to other sites that are not operated
            by us. If you click on a third-party link, you will be directed to
            that third party's site. We strongly advise you to review the Privacy
            Policy of every site you visit.
          </p>
          <p>
            We have no control over and assume no responsibility for the content,
            privacy policies, or practices of any third-party sites or services.
          </p>
        </PolicySection>

        {/* Section: Children's Privacy */}
        <PolicySection title="Children's Privacy">
          <p>
            Our Service does not address anyone under the age of 18 ("Children").
          </p>
          <p>
            We do not knowingly collect personally identifiable information from
            anyone under the age of 18. If you are a parent or guardian and you
            are aware that your Children have provided us with Personal Data,
            please contact us. If we become aware that we have collected Personal
            Data from children without verification of parental consent, we take
            steps to remove that information from our servers.
          </p>
        </PolicySection>

        {/* Section: Changes to This Privacy Policy */}
        <PolicySection title="Changes to This Privacy Policy">
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
          </p>
          <p>
            We will let you know via email and/or a prominent notice on our
            Service, prior to the change becoming effective and update the "last
            updated" date at the top of this Privacy Policy.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </PolicySection>

        {/* Section: Contact Us */}
        <PolicySection title="Contact Us">
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>By email: <a href="mailto:support@newsai.com" className="underline" style={{ color: "var(--primary-accent)" }}>support@nexusai.com</a></li>
            <li>By visiting this page on our website: <a href="/contact-us" className="underline" style={{ color: "var(--primary-accent)" }}>/contact</a></li>
          </ul>
        </PolicySection>
      </div>
    </div>
  );
};

// Helper Component for consistent section styling
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

export default PrivacyPolicyPage;