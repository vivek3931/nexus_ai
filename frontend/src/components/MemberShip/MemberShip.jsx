import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckCircle,
  faLock,
  faCreditCard,
  faBuildingColumns, // For Net Banking
  faMobileScreenButton, // For UPI
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../AuthContext/AuthContext";

const Membership = () => {
  // Destructure the user object, isAuthenticated, loading, and loadUser from useAuth
  // IMPORTANT: Changed 'refreshUserStatus' to 'loadUser' as per your AuthContext.jsx
  const { user, token, isAuthenticated, loading, loadUser } = useAuth(); // <--- MODIFIED HERE
  console.log("Auth context user object:", user); // Log the user object to debug
  console.log("Auth context isAuthenticated:", isAuthenticated); // Log authentication status
  console.log("Auth token being used:", token); // Log the token to ensure it's being passed correctly
  console.log("Auth context load user:", loadUser); // Log loading state

  const [selectedPlan, setSelectedPlan] = useState("free"); // Default to 'free' initially
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isYearly, setIsYearly] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  // Base URL for your backend
  const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  console.log("BACKEND_BASE_URL resolved to:", BACKEND_BASE_URL);

  // Prices are now in INR (Rupees) - Updated to realistic values
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
      // Monthly price for Pro: ₹799, Yearly price: ₹7999
      price: isYearly ? 11 : 1, // <--- MODIFIED: Set actual Rupee values here
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
      // Monthly price for Enterprise: ₹1999, Yearly price: ₹19999
      price: isYearly ? 19999 : 1999,
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

  // Helper to calculate discount percentage for display
  const getYearlyDiscountPercentage = () => {
    // This calculation now makes more sense with the updated prices
    const monthlyPrice = plans.pro.price / (isYearly ? 10 : 1); // Adjust based on your actual discount logic
    const yearlyPrice = plans.pro.price;
    if (isYearly && monthlyPrice > 0) {
        // Example: If yearly is 7999 and monthly is 799, then 12 months is 9588
        // Discount would be (9588 - 7999) / 9588 * 100 = ~16.5%
        // Adjust this calculation based on your actual intended discount.
        // For a clean 20% on 799*12 = 9588, yearly should be 7670.4
        // If 7999 is the yearly, then ((799 * 12) - 7999) / (799 * 12) * 100
        const potentialMonthlyTotal = 799 * 12; // Assuming 12 months for pro
        if (selectedPlan === 'pro' && isYearly && potentialMonthlyTotal > 0) {
            return Math.round(((potentialMonthlyTotal - plans.pro.price) / potentialMonthlyTotal) * 100);
        }
    }
    return 0; // No discount for free plan or if not yearly
  };


  const handlePlanSelect = (plan) => {
    // Only allow selecting a plan if the user is not a Pro user
    if (user && user.isProUser) {
        // If they are Pro, they can't "select" another paid plan for upgrade via this UI
        // You might still let them select 'free' to view details, but they can't downgrade.
        // For simplicity, we'll prevent selection of paid plans if already Pro.
        if (plan === "free" || user.planType === plan) {
            setSelectedPlan(plan);
        }
        return;
    }
    setSelectedPlan(plan);
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  // --- NEW: Load Razorpay Script ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded successfully.");
    script.onerror = () => console.error("Failed to load Razorpay script.");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // <--- NEW useEffect to initialize selectedPlan based on user's actual plan --->
  useEffect(() => {
    if (user && user.planType) {
        setSelectedPlan(user.planType);
        // If the user is a pro user, we might want to disable yearly toggle or ensure it reflects their subscription type if it's stored
        if (user.planType === 'pro' && user.isYearlySubscription) { // Assuming you store 'isYearlySubscription' on the user
            setIsYearly(true);
        }
    } else if (!user && !loading) {
        // If no user and not loading, default to free
        setSelectedPlan("free");
    }
  }, [user, loading]); // Depend on user and loading state

  // --- NEW: Handle Payment Confirmation ---
  const handleConfirmPayment = async () => {
    if (selectedPlan === "free" || !plans[selectedPlan].price) {
      setPaymentStatus("failed");
      setPaymentMessage("Invalid plan selected for payment.");
      return;
    }

    // <--- NEW: Prevent payment if already a pro user with the selected plan --->
    if (user && user.isProUser && user.planType === selectedPlan) {
        setPaymentStatus("failed");
        setPaymentMessage("You are already subscribed to this plan.");
        return;
    }

    setPaymentStatus(null); // Reset status
    setPaymentMessage(""); // Clear message

    const currentPlan = plans[selectedPlan];
    // Convert Rupee price to Paise for Razorpay
    const amountInPaise = currentPlan.price * 100;

    console.log("Selected Plan:", selectedPlan);
    console.log("Current Plan Object:", currentPlan);
    console.log("Amount being sent to backend (in paise):", amountInPaise);
    console.log("Receipt being generated:", `receipt_${selectedPlan}_${currentPlan.period}_${Date.now()}`);

    try {
      const payload = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${selectedPlan}_${currentPlan.period}_${Date.now()}`,
        plan: selectedPlan,
        isYearly: isYearly // Make sure to send isYearly as well, your backend expects it for notes
      };

      console.log("Frontend payload to /razorpay/order:", payload);
      // 1. Call your backend to create a Razorpay order
      const orderResponse = await fetch(`${BACKEND_BASE_URL}/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-auth-token': isAuthenticated ? token : '' // Use token from AuthContext
        },
        body: JSON.stringify(payload), // Send the payload directly
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order on backend.");
      }

      const orderData = await orderResponse.json();
      const { order_id, currency, amount, key_id } = orderData;

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded. Please try again.");
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Nexus AI",
        description: `${currentPlan.name} Plan Subscription (${currentPlan.period}ly)`,
        order_id: order_id,
        handler: async function (response) {
          console.log("Razorpay Payment Success Response:", response);
          try {
            // 3. Call your backend to verify the payment signature
            const verifyResponse = await fetch(`${BACKEND_BASE_URL}/razorpay/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                'x-auth-token': isAuthenticated ? token : '' // Use token from AuthContext
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan,
                isYearly: isYearly
              }),
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.message || "Payment verification failed on backend.");
            }

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              setPaymentStatus("success");
              setPaymentMessage("Payment successful! Your plan has been upgraded.");
              console.log("Payment successfully verified by backend.");
              // --- CRITICAL CHANGE: Use loadUser from AuthContext to refresh user state ---
              await loadUser(); // <--- MODIFIED HERE
              // Optionally, redirect user or update UI to reflect new subscription
            } else {
              setPaymentStatus("failed");
              setPaymentMessage(verifyData.message || "Payment verification failed.");
            }
          } catch (error) {
            console.error("Error during payment verification:", error);
            setPaymentStatus("failed");
            setPaymentMessage(`Payment failed: ${error.message}`);
          }
        },
        prefill: {
          // Add prefill details from your user object if available
          name: user?.username || "", // Assuming username exists on user object
          email: user?.email || "", // Assuming email exists on user object
          // contact: user?.contact || "", // If you store contact number
        },
        theme: {
          color: "#4F46E5",
        },
      };
      console.log("Razorpay Initialization Options:", options);

      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        setPaymentStatus("failed");
        setPaymentMessage(`Payment failed: ${response.error.description || "An error occurred."}`);
      });

      rzp1.open();
    } catch (error) {
      console.error("Error initiating Razorpay payment:", error);
      setPaymentStatus("failed");
      setPaymentMessage(`Error initiating payment: ${error.message}`);
    }
  };

  // --- NEW: Loading and Not Authenticated States ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--primary-background-color)] text-[var(--text-primary)] p-8 pt-24 flex flex-col items-center justify-center font-inter">
        <p>Loading user membership details...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--primary-background-color)] text-[var(--text-primary)] p-8 pt-24 flex flex-col items-center justify-center font-inter">
        <p>Please log in to view membership plans.</p>
        {/* You might add a link to your login page here */}
      </div>
    );
  }

  // Determine if the current logged-in user is a Pro user
  const isCurrentUserPro = user && user.isProUser;

  return (
    <div className="min-h-screen bg-[var(--primary-background-color)] text-[var(--text-primary)] p-2 lg:md:p-8 pt-24 flex flex-col items-center font-inter">
      {/* Membership Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-[var(--text-primary)]">
          Membership Plans
        </h1>
        <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
          Choose the plan that fits your needs and unlock the full potential of
          Nexus AI
        </p>
        {/* Billing Toggle - Only show if not a Pro user or if you allow Pro users to switch billing cycles */}
        {/* For simplicity, if current user is Pro, we hide the billing toggle as they can't change plan without explicit downgrade/upgrade logic */}
        {!isCurrentUserPro && (
            <div className="flex bg-[var(--background-secondary)] rounded-lg p-1 shadow-inner inline-flex">
                <span
                    className={`px-6 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer ${
                        !isYearly
                            ? "bg-[var(--primary-accent)] text-white"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                    onClick={() => setIsYearly(false)}
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
                    <div className="w-11 h-6 bg-[var(--border-primary)] rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--primary-accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[9.5px] after:left-[2px] after:bg-white after:border after:border-[var(--border-light)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-accent)]"></div>
                </label>
                <span
                    className={`px-6 py-2 rounded-md font-semibold relative transition-colors duration-300 cursor-pointer ${
                        isYearly
                            ? "bg-[var(--primary-accent)] text-white"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                    onClick={() => setIsYearly(true)}
                >
                    Yearly
                    <span className="absolute -top-2 right-0 bg-[var(--success-color)] text-white text-xs px-2 py-0.5 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        Save {getYearlyDiscountPercentage()}%
                    </span>
                </span>
            </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:md:grid-cols-3 gap-8 w-full max-w-6xl">
        {Object.entries(plans).map(([key, plan]) => (
          <div
            key={key}
            className={`
              relative bg-[var(--glass-background)] rounded-xl p-4 lg:md:p-8 flex flex-col shadow-lg border
              ${
                selectedPlan === key
                  ? "border-[var(--primary-accent)] ring-2 ring-[var(--primary-accent)]"
                  : "border-[var(--glass-border)]"
              }
              ${
                // Disable clicks for free plan or if already a pro user on a paid plan
                key === "free" || (isCurrentUserPro && key !== user.planType && user.planType !== 'free')
                  ? "opacity-80 cursor-default"
                  : "hover:border-[var(--primary-accent)] transition-colors duration-200"
              }
            `}
            // Only allow selection if not a Pro user or if selecting their current plan
            onClick={() => {
                if (!isCurrentUserPro || (isCurrentUserPro && key === user.planType)) {
                    handlePlanSelect(key);
                }
            }}
          >
            <div className="flex flex-col items-start mb-6">
              <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
                {plan.name}
              </h3>
              {key !== "free" && (
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-[var(--text-primary)]">
                    ₹{plan.price}
                  </span>
                  <span className="text-[var(--text-muted)] text-base font-normal ml-1">
                    /{plan.period}
                  </span>
                </div>
              )}
              {key === "free" && (
                <div className="text-4xl font-extrabold text-[var(--text-primary)]">
                  Free
                </div>
              )}
            </div>
            <ul className="text-[var(--text-primary)] mb-8 flex-grow space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-[var(--success-color)]"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`
                w-full py-3 rounded-lg font-semibold transition-colors duration-200
                ${
                  key === "free"
                    ? "bg-[var(--background-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                    : selectedPlan === key
                      ? "bg-[var(--primary-accent)] hover:bg-[var(--secondary-accent)] text-white"
                      : "bg-[var(--background-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)]"
                }
              `}
              // Disable based on user's current status and selected plan
              disabled={
                  key === "free" || // Free plan button is always disabled for selection
                  (isCurrentUserPro && key === user.planType) || // Disable if already on this plan
                  (isCurrentUserPro && key !== user.planType && user.planType !== 'free') // Disable if pro and trying to change to another paid plan
              }
            >
              {isCurrentUserPro && user.planType === key ? "Current Plan" : plan.cta}
            </button>
            {key !== "free" && selectedPlan === key && (
              <div className="absolute top-4 right-4 bg-[var(--success-color)] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} size={14} /> Selected
              </div>
            )}
            {/* Display "Current Plan" badge if user is subscribed to it */}
            {isCurrentUserPro && user.planType === key && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheckCircle} size={14} /> Current Plan
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Section - Only show if not a Pro user (or if you allow upgrades from Pro to Enterprise) */}
      {!isCurrentUserPro || (isCurrentUserPro && selectedPlan === 'enterprise') ? (
        <div className="bg-[var(--glass-background)] rounded-xl p-8 shadow-lg w-full max-w-2xl border border-[var(--glass-border)] mt-12">
          {/* Payment Methods */}
          <div className="mb-8 ">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
              Payment Method
            </h3>
            <div className="flex flex-wrap justify-center bg-[var(--background-secondary)] rounded-lg p-1 shadow-inner gap-2">
              <div
                className={`w-full text-xs sm:w-auto lg:flex-1 lg:text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${
                    paymentMethod === "credit"
                      ? "bg-[var(--primary-accent)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                onClick={() => handlePaymentChange("credit")}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Credit/Debit Card</span>
              </div>
              <div
                className={`w-full text-xs sm:w-auto lg:flex-1 lg:text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${
                    paymentMethod === "upi"
                      ? "bg-[var(--primary-accent)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                onClick={() => handlePaymentChange("upi")}
              >
                <FontAwesomeIcon icon={faMobileScreenButton} />
                <span>UPI (GPay/PhonePe)</span>
              </div>
              <div
                className={`w-full text-xs sm:w-auto lg:flex-1 lg:text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-300 cursor-pointer
                  ${
                    paymentMethod === "netbanking"
                      ? "bg-[var(--primary-accent)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                onClick={() => handlePaymentChange("netbanking")}
              >
                <FontAwesomeIcon icon={faBuildingColumns} />
                <span>Net Banking</span>
              </div>
            </div>
          </div>
          {paymentMethod === "credit" && (
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                  disabled
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                    disabled
                  />
                </div>
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                    disabled
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Name on Card
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-[var(--primary-accent)]"
                  disabled
                />
              </div>
            </div>
          )}
          {paymentMethod === "upi" && (
            <div className="space-y-4 text-center">
              <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                Pay with UPI
              </h4>
              <p className="text-[var(--text-muted)] text-sm">
                Click "Confirm Payment" to open the Razorpay popup, which will allow you to pay using UPI via your preferred app (GPay, PhonePe, Paytm, etc.) or by entering your UPI ID.
              </p>
            </div>
          )}
          {paymentMethod === "netbanking" && (
            <div className="space-y-4 text-center">
              <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                Pay with Net Banking
              </h4>
              <p className="text-[var(--text-muted)] text-sm">
                Click "Confirm Payment" to open the Razorpay popup, which will redirect you to your bank's website to complete the payment securely.
              </p>
            </div>
          )}
          {/* Payment Summary */}
          <div className="mt-8 pt-6 border-t border-[var(--border-dark)] space-y-3">
            <div className="flex justify-between text-[var(--text-primary)]">
              <span>Plan</span>
              <span>
                {plans[selectedPlan].name} ({isYearly ? "Yearly" : "Monthly"})
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-primary)]">
              <span>Price</span>
              <span>₹{plans[selectedPlan].price.toFixed(2)}</span>
            </div>
            {isYearly && selectedPlan !== 'free' && ( // Only show discount for paid yearly plans
              <div className="flex justify-between text-[var(--success-color)] text-sm">
                <span>Yearly Discount ({getYearlyDiscountPercentage()}%)</span>
                <span>
                  -₹
                  {(
                    (plans[selectedPlan].price / (1 - getYearlyDiscountPercentage() / 100)) -
                    plans[selectedPlan].price
                  ).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[var(--text-primary)] font-bold text-lg pt-2 border-t border-[var(--border-dark)]">
              <span>Total</span>
              <span>₹{plans[selectedPlan].price.toFixed(2)}</span>
            </div>
          </div>
          {paymentStatus && (
            <div
              className={`mt-4 p-3 rounded-lg text-center font-medium ${
                paymentStatus === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {paymentMessage}
            </div>
          )}
          {/* Confirm Button - Only enable if a valid plan is selected and not already Pro (unless upgrading to Enterprise) */}
          <button
            onClick={handleConfirmPayment}
            className="w-full py-3 mt-8 rounded-lg bg-[var(--primary-accent)] hover:bg-[var(--secondary-accent)] text-white text-lg font-semibold transition-all duration-200 shadow-md"
            disabled={
                !window.Razorpay ||
                selectedPlan === "free" ||
                (isCurrentUserPro && selectedPlan === user.planType) // Disable if already on this plan
            }
          >
            Confirm Payment
          </button>
          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-sm mt-4">
            <FontAwesomeIcon icon={faLock} />
            <span>Your payment is secure and encrypted</span>
          </div>
        </div>
      ) : (
        // Message when already a Pro user
        <div className="bg-[var(--glass-background)] rounded-xl p-8 shadow-lg w-full max-w-2xl border border-[var(--glass-border)] mt-12 text-center text-[var(--text-primary)]">
            <h3 className="text-2xl font-bold mb-4">You are already a Pro User!</h3>
            <p className="text-[var(--text-muted)] mb-4">You have full access to all premium features of Nexus AI.</p>
            <p className="text-[var(--text-muted)]">Your current plan: <span className="font-semibold capitalize">{user.planType}</span></p>
            {user.subscriptionEndDate && (
                <p className="text-[var(--text-muted)]">Subscription ends: <span className="font-semibold">{new Date(user.subscriptionEndDate).toLocaleDateString()}</span></p>
            )}
            {/* You could add a button here to manage subscription or contact support */}
        </div>
      )}
    </div>
  );
};

export default Membership;