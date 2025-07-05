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
    setSelectedPlan(plan);
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  return (
  
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 pt-24 flex flex-col items-center">
      {/* membership-header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Membership Plans</h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Choose the plan that fits your needs and unlock the full potential of
          News AI
        </p>

        {/* billing-toggle */}
        <div className="flex bg-[#1e1e1e] rounded-lg p-1 shadow-inner inline-flex">
          <span className={`px-6 py-2 rounded-md font-semibold transition-colors duration-300 ${!isYearly ? "bg-purple-700 text-white" : "text-gray-400 hover:text-white"}`}>Monthly</span>
          <label className="relative inline-flex items-center cursor-pointer mx-4">
            <input
              type="checkbox"
              checked={isYearly}
              onChange={toggleBilling}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700"></div>
          </label>
          <span className={`px-6 py-2 rounded-md font-semibold relative transition-colors duration-300 ${isYearly ? "bg-purple-700 text-white" : "text-gray-400 hover:text-white"}`}>
            Yearly <span className="absolute -top-2 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full transform translate-x-1/2 -translate-y-1/2">Save 20%</span>
          </span>
        </div>
      </div>

      {/* plans-grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {Object.entries(plans).map(([key, plan]) => (
          <div
            key={key}
            className={`
              relative bg-[#121212] rounded-xl p-8 flex flex-col shadow-lg border cursor-pointer
              ${selectedPlan === key ? "border-purple-700 ring-2 ring-purple-700" : "border-gray-800"}
              ${key === "free" ? "opacity-80 cursor-default" : "hover:border-purple-500 transition-colors duration-200"}
            `}
            onClick={() => handlePlanSelect(key)}
          >
            <div className="flex flex-col items-start mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              {key !== "free" && (
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="text-gray-400 text-base font-normal ml-1">/{plan.period}</span>
                </div>
              )}
              {key === "free" && <div className="text-4xl font-extrabold">Free</div>}
            </div>

            <ul className="text-gray-300 mb-8 flex-grow space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} className="text-green-500" /> {feature}
                </li>
              ))}
            </ul>

            <button
              className={`
                w-full py-3 rounded-lg font-semibold transition-colors duration-200
                ${key === "free"
                  ? "bg-gray-700 text-white cursor-not-allowed"
                  : selectedPlan === key
                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }
              `}
              disabled={key === "free"}
            >
              {plan.cta}
            </button>

            {key !== "free" && selectedPlan === key && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} size={14} /> Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPlan !== "free" && (
        // payment-section
        <div className="bg-[#121212] rounded-xl p-8 shadow-lg w-full max-w-2xl border border-gray-800 mt-12">
          {/* payment-methods */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Payment Method</h3>
            <div className="flex bg-[#1e1e1e] rounded-lg p-1 shadow-inner">
              <div
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${paymentMethod === "credit" ? "bg-purple-700 text-white" : "text-gray-400 hover:text-white"}`}
                onClick={() => handlePaymentChange("credit")}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Credit Card</span>
              </div>
              <div
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${paymentMethod === "paypal" ? "bg-purple-700 text-white" : "text-gray-400 hover:text-white"}`}
                onClick={() => handlePaymentChange("paypal")}
              >
                <FontAwesomeIcon icon={faPaypal} /> <span>PayPal</span>
              </div>
              <div
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${paymentMethod === "crypto" ? "bg-purple-700 text-white" : "text-gray-400 hover:text-white"}`}
                onClick={() => handlePaymentChange("crypto")}
              >
                <FontAwesomeIcon icon={faCoins} /> <span>Crypto</span>
              </div>
            </div>
          </div>

          {paymentMethod === "credit" && (
            // credit-card-form
            <div className="space-y-6">
              <div className="relative"> {/* form-group */}
                <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="flex gap-4"> {/* form-row */}
                <div className="flex-1 relative"> {/* form-group */}
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div className="flex-1 relative"> {/* form-group */}
                  <label className="block text-sm font-medium text-gray-300 mb-2">Security Code</label>
                  <input type="text" placeholder="CVC" className="w-full p-3 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600" />
                </div>
              </div>

              <div className="relative"> {/* form-group */}
                <label className="block text-sm font-medium text-gray-300 mb-2">Name on Card</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-3 rounded-lg bg-[#1e1e1e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>
          )}

          {/* payment-summary */}
          <div className="mt-8 pt-6 border-t border-gray-700 space-y-3">
            <div className="flex justify-between text-gray-300">
              <span>Plan</span>
              <span>
                {plans[selectedPlan].name} ({isYearly ? "Yearly" : "Monthly"})
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Price</span>
              <span>${plans[selectedPlan].price.toFixed(2)}</span>
            </div>
            {isYearly && (
              <div className="flex justify-between text-green-400 text-sm">
                <span>Yearly Discount</span>
                <span>-${(plans[selectedPlan].price * 0.2).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-800">
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

          {/* confirm-button */}
          <button className="w-full py-3 mt-8 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-lg font-semibold transition-all duration-200 shadow-md">Confirm Payment</button>

          {/* security-note */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-4">
            <FontAwesomeIcon icon={faLock} />{" "}
            <span>Your payment is secure and encrypted</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
