"use client";

import * as React from "react";
import Link from "next/link";
import {
  LockKeyhole,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { selectTotal } from "@/lib/features/cart/cartSelectors";
import { useAppSelector } from "@/lib/hooks";
import { CreateOrder } from "@/lib/api/CreateOrder";
import { selectCartItems } from "@/lib/features/cart/cartSelectors";
import {
  local_states,
  local_cities,
} from "@/data/location";
import { GetDeliveryFee } from "@/lib/delivery/GetDeliveryFee";
import { InitializePayment } from "@/lib/api/InitializePayment";

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CheckoutDetail() {
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectTotal);

  const [formData, setFormData] =
    React.useState<CheckoutFormData>({
      name: "",
      phone: "",
      email: "",
      country: "Nigeria",
      state: "",
      city: "",
      address: "",
    });

  const [deliveryFee, setDeliveryFee] = React.useState(0);

  /*
   * Payment processing state.
   *
   * This remains true while:
   * 1. Creating the order
   * 2. Initializing Paystack
   * 3. Redirecting to Paystack
   */
  const [isProcessing, setIsProcessing] =
    React.useState(false);

  /*
   * Current processing message.
   */
  const [processingMessage, setProcessingMessage] =
    React.useState("Processing your order...");

  /*
   * Find selected state.
   */
  const selectedState = React.useMemo(() => {
    return local_states.find(
      (state) => state.id === formData.state
    );
  }, [formData.state]);

  /*
   * Get cities belonging to selected state.
   */
  const availableCities = React.useMemo(() => {
    if (!selectedState) return [];

    return local_cities.filter(
      (city) => city.stateId === selectedState.id
    );
  }, [selectedState]);

  const hasCityOptions =
    availableCities.length > 0;

  /*
   * Recalculate delivery fee whenever state/city changes.
   */
  React.useEffect(() => {
    if (
      !formData.state ||
      !formData.city.trim()
    ) {
      setDeliveryFee(0);
      return;
    }

    const fee = GetDeliveryFee(
      formData.state,
      formData.city
    );

    setDeliveryFee(fee);
  }, [
    formData.state,
    formData.city,
  ]);

  /*
   * Calculate checkout total.
   */
  const total = cartTotal + deliveryFee;

  /*
   * Handles normal input fields.
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Handles state selection.
   */
  const handleStateChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const stateId = event.target.value;

    setFormData((previous) => ({
      ...previous,
      state: stateId,
      city: "",
    }));
  };

  /*
   * Handles city selection.
   */
  const handleCitySelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((previous) => ({
      ...previous,
      city: event.target.value,
    }));
  };

  /*
   * Submit checkout.
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    /*
     * Prevent duplicate submissions.
     */
    if (isProcessing) {
      return;
    }

    /*
     * Start loading immediately.
     */
    setIsProcessing(true);
    setProcessingMessage(
      "Creating your order..."
    );

    try {
      /*
       * STEP 1
       * Create order on the server.
       */
      const order = await CreateOrder(
        cartItems,
        formData
      );

      console.log(
        "Order created:",
        order
      );

      const orderId =
        order.data?.order.id;

      if (!orderId) {
        throw new Error(
          "Order was created without an ID."
        );
      }

      /*
       * STEP 2
       * Initialize Paystack.
       */
      setProcessingMessage(
        "Preparing secure payment..."
      );

      const payment =
        await InitializePayment(orderId);

      if (
        !payment.data?.authorizationUrl
      ) {
        throw new Error(
          "Payment URL was not returned."
        );
      }

      /*
       * STEP 3
       * Redirect customer to Paystack.
       *
       * Keep isProcessing = true.
       * The browser will leave this page.
       */
      setProcessingMessage(
        "Redirecting to secure payment..."
      );

      window.location.href =
        payment.data.authorizationUrl;
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      /*
       * Something failed before
       * Paystack redirection.
       *
       * Close the loading state so
       * the customer can try again.
       */
      setIsProcessing(false);

      setProcessingMessage(
        "Processing your order..."
      );

      /*
       * You can replace this with
       * your toast implementation.
       */
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing your order."
      );
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.country.trim() !== "" &&
    formData.state.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.address.trim() !== "";

  return (
    <>
      {/* =====================================================
          PROCESSING OVERLAY
      ====================================================== */}

      {isProcessing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 px-6 backdrop-blur-sm">
          <div className="flex w-full max-w-[420px] flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
              <Loader2
                size={28}
                strokeWidth={1.5}
                className="animate-spin"
              />
            </div>

            <h2 className="mt-7 text-[24px] tracking-[-0.02em]">
              {processingMessage}
            </h2>

            <p className="mt-3 text-[15px] leading-[1.6] text-black/50">
              Please do not close this page or click
              the payment button again.
            </p>
          </div>
        </div>
      )}

      <section className="w-full bg-white px-5 py-16 text-neutral-950 sm:px-8 sm:py-20 lg:px-[7%] lg:py-28">
        <div className="mx-auto max-w-[1600px]">
          <form
            onSubmit={handleSubmit}
            className="
              grid
              grid-cols-1
              gap-16
              lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]
              lg:gap-24
              xl:gap-32
            "
          >
            {/* =========================================================
                CUSTOMER INFORMATION
            ========================================================== */}

            <div className="min-w-0">
              <div>
                <h1 className="text-[28px] leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
                  Customer Information
                </h1>

                <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2">
                  <CheckoutInput
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isProcessing}
                    required
                  />

                  <CheckoutInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isProcessing}
                    required
                  />

                  <CheckoutInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isProcessing}
                    className="sm:max-w-[310px]"
                    required
                  />
                </div>
              </div>

              {/* =======================================================
                  SHIPPING INFORMATION
              ======================================================== */}

              <div className="mt-20 sm:mt-24">
                <h2 className="text-[28px] leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
                  Delivery Information
                </h2>

                <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2">
                  <CheckoutInput
                    label="Country"
                    name="country"
                    value="Nigeria"
                    readOnly
                    disabled={isProcessing}
                    required
                  />

                  <CheckoutSelect
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    disabled={isProcessing}
                    required
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select state
                    </option>

                    {local_states.map(
                      (state) => (
                        <option
                          key={state.id}
                          value={state.id}
                        >
                          {state.name}
                        </option>
                      )
                    )}
                  </CheckoutSelect>

                  {hasCityOptions ? (
                    <CheckoutSelect
                      label="City/LGA"
                      name="city"
                      value={formData.city}
                      onChange={
                        handleCitySelectChange
                      }
                      disabled={
                        isProcessing ||
                        !selectedState
                      }
                      required
                    >
                      <option
                        value=""
                        disabled
                      >
                        {selectedState
                          ? "Select city/LGA"
                          : "Select state first"}
                      </option>

                      {availableCities.map(
                        (city) => (
                          <option
                            key={city.id}
                            value={city.name}
                          >
                            {city.name}
                          </option>
                        )
                      )}
                    </CheckoutSelect>
                  ) : (
                    <CheckoutInput
                      label="City/LGA"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder={
                        selectedState
                          ? "Enter city/LGA"
                          : "Select state first"
                      }
                      disabled={
                        isProcessing ||
                        !selectedState
                      }
                      required
                    />
                  )}

                  <CheckoutInput
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isProcessing}
                    required
                  />
                </div>
              </div>
            </div>

            {/* =========================================================
                ORDER SUMMARY
            ========================================================== */}

            <aside className="lg:pt-0">
              <h2 className="text-[28px] leading-[1.15] tracking-[-0.02em] sm:text-[30px]">
                Order Summary
              </h2>

              <div className="mt-12 bg-[#eeece9] px-6 py-8 sm:px-7 sm:py-9">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-[16px]">
                  <span>Subtotal</span>

                  <span>
                    {formatCurrency(
                      cartTotal
                    )}
                  </span>
                </div>

                <div className="my-6 h-px w-full bg-black/70" />

                {/* Delivery */}
                <div className="flex items-center justify-between text-[16px]">
                  <span>Delivery Fee</span>

                  <span>
                    {formData.city.trim()
                      ? formatCurrency(
                          deliveryFee
                        )
                      : "—"}
                  </span>
                </div>

                <div className="my-6 h-px w-full bg-black/70" />

                {/* Total */}
                <div className="flex items-center justify-between text-[17px] font-semibold">
                  <span>Total</span>

                  <span>
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Continue */}
                <button
                  type="submit"
                  disabled={
                    !isFormValid ||
                    isProcessing
                  }
                  className="
                    mt-10
                    flex
                    h-[70px]
                    w-full
                    items-center
                    justify-center
                    gap-3
                    bg-black
                    px-6
                    text-[16px]
                    font-medium
                    text-white
                    transition-opacity
                    duration-200
                    hover:opacity-85
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {isProcessing ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />

                      {processingMessage}
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </button>

                {/* Security */}
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck
                      size={21}
                      strokeWidth={1.5}
                    />

                    <span className="text-[15px]">
                      Secure Payment
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <LockKeyhole
                      size={20}
                      strokeWidth={1.5}
                    />

                    <span className="text-[15px]">
                      SSL Encrypted
                    </span>
                  </div>
                </div>

                {/* Terms */}
                <p className="mt-8 max-w-[460px] text-[15px] leading-[1.4] text-black/35">
                  By continuing, I confirm that I
                  have read and accept the{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-2"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and the{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </form>
        </div>
      </section>
    </>
  );
}

/* ================================================================
   INPUT
================================================================ */

interface CheckoutInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function CheckoutInput({
  label,
  name,
  required,
  className = "",
  ...props
}: CheckoutInputProps) {
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={name}
        className="mb-3 block text-[16px] leading-none"
      >
        {label}
        {required && <span>*</span>}
      </label>

      <input
        id={name}
        name={name}
        required={required}
        {...props}
        className="
          block
          h-[36px]
          w-full
          border-0
          border-b
          border-black
          bg-transparent
          px-0
          text-[16px]
          outline-none
          placeholder:text-black/30
          focus:border-black
          focus:ring-0
          disabled:cursor-not-allowed
          disabled:opacity-50
          read-only:cursor-not-allowed
        "
      />
    </div>
  );
}

/* ================================================================
   SELECT
================================================================ */

interface CheckoutSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

function CheckoutSelect({
  label,
  name,
  required,
  className = "",
  children,
  ...props
}: CheckoutSelectProps) {
  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={name}
        className="mb-3 block text-[16px] leading-none"
      >
        {label}
        {required && <span>*</span>}
      </label>

      <select
        id={name}
        name={name}
        required={required}
        {...props}
        className="
          block
          h-[36px]
          w-full
          border-0
          border-b
          border-black
          bg-transparent
          px-0
          text-[16px]
          outline-none
          focus:border-black
          focus:ring-0
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {children}
      </select>
    </div>
  );
}