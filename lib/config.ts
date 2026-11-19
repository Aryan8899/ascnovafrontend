// Saari values yahin hardcoded hain. Sirf yahan change karo, baaki code mein kuch nahi.

export const API_URL = "https://ascendorabackend.vercel.app";
export const REGISTRATION_FEE = 199; // INR  <-- TODO: real fee
export const UPI_ID = "9296273325@sbi";
export const PAYEE_NAME = "Aniket Agarwal";

export const BANK = {
  name: "State Bank of India",
  holder: "Aniket Agarwal",
  accountNumber: "44473752320",
  ifsc: "SBIN0003444",
};

export const STATUS_TOKEN_KEY = "ascendora_status_token";

const upiParams = () =>
  `pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}` +
  `&am=${REGISTRATION_FEE}&cu=INR&tn=${encodeURIComponent("Registration fee")}`;

// Generic link: phone kisi bhi UPI app (WhatsApp bhi) ko offer karta hai
export const upiLink = () => `upi://pay?${upiParams()}`;

// App-specific links
export const gpayLink = () => `tez://upi/pay?${upiParams()}`;
export const phonepeLink = () => `phonepe://pay?${upiParams()}`;
export const paytmLink = () => `paytmmp://pay?${upiParams()}`;