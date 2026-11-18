// Saari values yahin hardcoded hain. Sirf yahan change karo, baaki code mein kuch nahi.

export const API_URL = "https://ascendorabackend.vercel.app";
export const REGISTRATION_FEE = 199; // INR  <-- TODO: real fee
export const UPI_ID = "yourupi@bank"; // <-- TODO: real UPI ID
export const PAYEE_NAME = "Ascendora Talent Solutions";

export const STATUS_TOKEN_KEY = "ascendora_status_token";

export const upiLink = () =>
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}` +
  `&am=${REGISTRATION_FEE}&cu=INR&tn=${encodeURIComponent("Registration fee")}`;