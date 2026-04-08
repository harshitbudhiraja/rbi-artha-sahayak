/**
 * Explains fraud detection results in both English and Hindi.
 * Bridges ML model results with human-understandable language for financial inclusion.
 *
 * @param amount - Transaction amount in INR
 * @param state - Sender's state
 * @param reasonCode - Fraud flag from ML model (0=safe, 1=suspicious)
 * @returns An object containing the english and hindi messages
 */
export function explainFraud(
  amount: number,
  state: string,
  reasonCode: number
): { englishMessage: string; hindiMessage: string } {
  if (reasonCode === 1) {
    return {
      hindiMessage: `चेतावनी: ₹${amount} का यह लेनदेन असामान्य लग रहा है क्योंकि यह ${state} से किया गया है।`,
      englishMessage: `Alert: This transaction of ₹${amount} looks suspicious coming from ${state}.`,
    };
  } else {
    return {
      hindiMessage: "लेनदेन सुरक्षित है।",
      englishMessage: "Transaction is safe.",
    };
  }
}
