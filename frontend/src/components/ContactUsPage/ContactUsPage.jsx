// src/pages/ContactUsPage.jsx (or wherever you keep your pages)
import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react"; // Import relevant icons

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a backend service
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" }); // Clear form
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        backgroundColor: "var(--primary-background-color)",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="w-full max-w-xl sm:max-w-3xl p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col space-y-8"
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
          Get in Touch
        </h1>

        <p
          className="text-center text-sm sm:text-base mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          Have questions, feedback, or need support? Fill out the form below or
          reach out using the contact details provided.
        </p>

        {/* Contact Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <ContactInfoBox
            icon={<Mail size={24} style={{ color: "var(--primary-accent)" }} />}
            title="Email Us"
            value="support@nexusai.com"
            link="mailto:support@nexusai.com"
          />
          <ContactInfoBox
            icon={<Phone size={24} style={{ color: "var(--primary-accent)" }} />}
            title="Call Us"
            value="+91 98765 43210"
            link="tel:+919876543210"
          />
          <ContactInfoBox
            icon={<MapPin size={24} style={{ color: "var(--primary-accent)" }} />}
            title="Our Location"
            value="Mumbai, India"
link="https://www.google.com/maps/search/?api=1&query=Mumbai,+India"          />
        </div>

        <hr style={{ borderTop: "1px dashed var(--border-primary)" }} className="my-6" />

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField
              label="Your Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            <InputField
              label="Your Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              required
            />
          </div>
          <InputField
            label="Subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Regarding an issue..."
            required
          />
          <TextAreaField
            label="Your Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Type your message here..."
            rows={5}
            required
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-lg transition-colors duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg"
            style={{
              background: "var(--primary-accent)",
              color: "white", // Text on accent buttons usually white
              boxShadow: "0 4px 15px rgba(108, 92, 231, 0.4)", // A stronger shadow for the main action
            }}
          >
            <Send size={20} />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

// Helper Components for Reusability and Cleanliness
const InputField = ({ label, ...props }) => (
  <div>
    <label
      className="block text-sm font-medium mb-2"
      style={{ color: "var(--text-muted)" }}
    >
      {label}
    </label>
    <input
      {...props}
      className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
      style={{
        background: "var(--background-secondary)",
        border: "1px solid var(--border-primary)",
        color: "var(--text-primary)",
        "--tw-ring-color": "var(--primary-accent)",
        "&::placeholder": {
          color: "var(--text-placeholder)",
        },
      }}
    />
  </div>
);

const TextAreaField = ({ label, ...props }) => (
  <div>
    <label
      className="block text-sm font-medium mb-2"
      style={{ color: "var(--text-muted)" }}
    >
      {label}
    </label>
    <textarea
      {...props}
      className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base resize-y"
      style={{
        background: "var(--background-secondary)",
        border: "1px solid var(--border-primary)",
        color: "var(--text-primary)",
        "--tw-ring-color": "var(--primary-accent)",
        "&::placeholder": {
          color: "var(--text-placeholder)",
        },
      }}
    ></textarea>
  </div>
);

const ContactInfoBox = ({ icon, title, value, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center p-4 rounded-xl transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg"
    style={{
      background: "var(--background-secondary)",
      border: "1px solid var(--border-primary)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    }}
  >
    <div className="mb-2">{icon}</div>
    <h3
      className="text-base sm:text-lg font-semibold mb-1"
      style={{ color: "var(--text-primary)" }}
    >
      {title}
    </h3>
    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
      {value}
    </p>
  </a>
);

export default ContactUsPage;