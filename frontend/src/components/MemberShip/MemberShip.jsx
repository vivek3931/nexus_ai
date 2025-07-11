import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckCircle,
  faLock,
  faCreditCard,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import { faPaypal } from "@fortawesome/free-brands-svg-icons";

// The CSS variables are assumed to be available globally from index.css
// No need to inject them here.

const Membership = () => {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isYearly, setIsYearly] = useState(false);

  const plans = {
    free: {
      name: "Free",
      price: 0,
      features: [
        "Basic AI responses",
        "Limited daily queries",
        "Standard response speed",
        "Community support",
      ],
      cta: "Current Plan",
    },
    pro: {
      name: "Pro",
      price: isYearly ? 99 : 9.99,
      period: isYearly ? "year" : "month",
      features: [
        "Advanced AI responses",
        "Unlimited queries",
        "Priority response speed",
        "Early access to new features",
        "Email support",
      ],
      cta: "Upgrade to Pro",
    },
    enterprise: {
      name: "Enterprise",
      price: isYearly ? 299 : 29.99,
      period: isYearly ? "year" : "month",
      features: [
        "All Pro features",
        "Dedicated AI models",
        "API access",
        "24/7 priority support",
        "Custom integrations",
        "Team management",
      ],
      cta: "Contact Sales",
    },
  };

  const handlePlanSelect = (plan) => {
    // Prevent selecting 'free' plan if it's already the current plan or if it's meant to be non-selectable for upgrade
    if (plan === "free") {
      // You might want to add logic here to only allow 'free' to be selected if it's the current plan
      // For now, we'll allow it but keep the button disabled
    }
    setSelectedPlan(plan);
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  return (
    // Main container with dark background and light text
    <div className="min-h-screen bg-[var(--background-dark)] text-[var(--text-light)] p-8 pt-24 flex flex-col items-center font-inter">
      {/* Membership Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-accent)]">Membership Plans</h1>
        <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
          Choose the plan that fits your needs and unlock the full potential of
          News AI
        </p>

        {/* Billing Toggle */}
        <div className="flex bg-[var(--background-secondary)] rounded-lg p-1 shadow-inner inline-flex">
          <span
            className={`px-6 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer ${
              !isYearly
                ? "bg-[var(--primary-accent)] text-[var(--text-accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-light)]"
            }`}
            onClick={() => setIsYearly(false)} // Added onClick for explicit monthly selection
          >
            Monthly
          </span>
          <label className="relative inline-flex items-center cursor-pointer mx-4">
            <input
              type="checkbox"
              checked={isYearly}
              onChange={toggleBilling}
              className="sr-only peer"
            />
            {/* Toggle switch visual */}
            <div className="w-11 h-6 bg-[var(--border-color)] rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--primary-accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--text-accent)] after:content-[''] after:absolute after:top-[9.5px] after:left-[2px] after:bg-[var(--text-accent)] after:border after:border-[var(--border-light)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-accent)]"></div>
          </label>
          <span
            className={`px-6 py-2 rounded-md font-semibold relative transition-colors duration-300 cursor-pointer ${
              isYearly
                ? "bg-[var(--primary-accent)] text-[var(--text-accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-light)]"
            }`}
            onClick={() => setIsYearly(true)} // Added onClick for explicit yearly selection
          >
            Yearly{" "}
            <span className="absolute -top-2 right-0 bg-[var(--success-color)] text-[var(--text-accent)] text-xs px-2 py-0.5 rounded-full transform translate-x-1/2 -translate-y-1/2">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {Object.entries(plans).map(([key, plan]) => (
          <div
            key={key}
            className={`
              relative bg-[var(--glass-background)] rounded-xl p-8 flex flex-col shadow-lg border glass-effect-backdrop
              ${selectedPlan === key ? "border-[var(--primary-accent)] ring-2 ring-[var(--primary-accent)]" : "border-[var(--glass-border)]"}
              ${key === "free" ? "opacity-80 cursor-default" : "hover:border-[var(--primary-accent)] transition-colors duration-200"}
            `}
            onClick={() => handlePlanSelect(key)}
          >
            <div className="flex flex-col items-start mb-6">
              <h3 className="text-2xl font-bold mb-2 text-[var(--text-accent)]">{plan.name}</h3>
              {key !== "free" && (
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-[var(--text-accent)]">${plan.price}</span>
                  <span className="text-[var(--text-muted)] text-base font-normal ml-1">/{plan.period}</span>
                </div>
              )}
              {key === "free" && <div className="text-4xl font-extrabold text-[var(--text-accent)]">Free</div>}
            </div>

            <ul className="text-[var(--text-light)] mb-8 flex-grow space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="text-[var(--success-color)]" />{" "}
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`
                w-full py-3 rounded-lg font-semibold transition-colors duration-200
                ${key === "free"
                  ? "bg-[var(--background-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                  : selectedPlan === key
                    ? "bg-[var(--primary-accent)] hover:bg-[var(--secondary-accent)] text-[var(--text-accent)]"
                    : "bg-[var(--background-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-light)]"
                }
              `}
              disabled={key === "free"}
            >
              {plan.cta}
            </button>

            {key !== "free" && selectedPlan === key && (
              <div className="absolute top-4 right-4 bg-[var(--success-color)] text-[var(--text-accent)] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} size={14} /> Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPlan !== "free" && (
        /* Payment Section */
        <div className="bg-[var(--glass-background)] rounded-xl p-8 shadow-lg w-full max-w-2xl border border-[var(--glass-border)] mt-12 glass-effect-backdrop">
          {/* Payment Methods */}
          <div className="mb-8 ">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-accent)]">Payment Method</h3>
            <div className="flex bg-[var(--background-secondary)] rounded-lg p-1 shadow-inner">
              <div
                className={`flex-1 text-xs lg:text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${paymentMethod === "credit" ? "bg-[var(--primary-accent)] text-[var(--text-accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-light)]"}`}
                onClick={() => handlePaymentChange("credit")}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Credit Card</span>
              </div>
              <div
                className={`flex-1 text-xs lg:text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${paymentMethod === "paypal" ? "bg-[var(--primary-accent)] text-[var(--text-accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-light)]"}`}
                onClick={() => handlePaymentChange("paypal")}
              >
                <FontAwesomeIcon icon={faPaypal} /> <span>PayPal</span>
              </div>
              <div
                className={`flex-1 text-xs lg:text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${paymentMethod === "crypto" ? "bg-[var(--primary-accent)] text-[var(--text-accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-light)]"}`}
                onClick={() => handlePaymentChange("crypto")}
              >
                <FontAwesomeIcon icon={faCoins} /> <span>Crypto</span>
              </div>
            </div>
          </div>

          {paymentMethod === "credit" && (
            /* Credit Card Form */
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--text-light)] mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--text-light)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-[var(--text-light)] mb-2">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--text-light)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                  />
                </div>

                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-[var(--text-light)] mb-2">Security Code</label>
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--text-light)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[var(--text-light)] mb-2">Name on Card</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-color)] text-[var(--text-light)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                />
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mt-8 pt-6 border-t border-[var(--border-dark)] space-y-3">
            <div className="flex justify-between text-[var(--text-light)]">
              <span>Plan</span>
              <span>
                {plans[selectedPlan].name} ({isYearly ? "Yearly" : "Monthly"})
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-light)]">
              <span>Price</span>
              <span>${plans[selectedPlan].price.toFixed(2)}</span>
            </div>
            {isYearly && (
              <div className="flex justify-between text-[var(--success-color)] text-sm">
                <span>Yearly Discount</span>
                <span>-${(plans[selectedPlan].price * 0.2).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[var(--text-accent)] font-bold text-lg pt-2 border-t border-[var(--border-dark)]">
              <span>Total</span>
              <span>
                $
                {(isYearly
                  ? (plans[selectedPlan].price * 0.8)
                  : plans[selectedPlan].price
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button className="w-full py-3 mt-8 rounded-lg bg-[var(--primary-accent)] hover:bg-[var(--secondary-accent)] text-[var(--text-accent)] text-lg font-semibold transition-all duration-200 shadow-md">
            Confirm Payment
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-sm mt-4">
            <FontAwesomeIcon icon={faLock} />{" "}
            <span>Your payment is secure and encrypted</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
