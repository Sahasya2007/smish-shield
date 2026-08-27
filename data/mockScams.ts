export interface MockScamVector {
  id: number;
  sender: string;
  message: string;
  url: string | null;
  riskScore: number;
  classification: "CRITICAL_PHISHING" | "SUSPICIOUS" | "SAFE";
  dltHeaderFailureRationale: string;
}

/*
 * Synthetic test data for SmishShield.
 * Sender headers below are realistic-looking examples for testing only.
 * They are NOT claims of actual registration with TRAI/DLT.
 */

export const mockScams: MockScamVector[] = [

  {
    id: 1,
    sender: "AD-SBIALERT",
    message:
      "URGENT: Your SBI KYC is incomplete. Your account will be suspended today. Verify PAN and KYC immediately at https://sbi-kyc-update.top/verify",
    url: "https://sbi-kyc-update.top/verify",
    riskScore: 96,
    classification: "CRITICAL_PHISHING",
    dltHeaderFailureRationale:
      "Synthetic sender header does not establish verified DLT registration, while the message uses an urgent KYC threat and a deceptive .top domain."
  },

  {
    id: 2,
    sender: "AX-HDFCBK",
    message:
      "HDFC Bank Alert: PAN verification is pending. Complete KYC within 2 hours to avoid account restriction: https://hdfc-secure-kyc.xyz/login",
    url: "https://hdfc-secure-kyc.xyz/login",
    riskScore: 94,
    classification: "CRITICAL_PHISHING",
    dltHeaderFailureRationale:
      "Header is only a synthetic test value and cannot prove DLT authorization. The message impersonates a bank and requests login through a deceptive .xyz domain."
  },

  {
    id: 3,
    sender: "VM-DISCOM",
    message:
      "Electricity DISCONNECTION NOTICE: Your power supply will be disconnected tonight due to unpaid bill. Pay immediately at https://discom-payment.site/pay",
    url: "https://discom-payment.site/pay",
    riskScore: 91,
    classification: "CRITICAL_PHISHING",
    dltHeaderFailureRationale:
      "Synthetic sender header is not proof of an authorized DISCOM sender. Immediate disconnection pressure and an unverified .site payment domain are strong phishing indicators."
  },

  {
    id: 4,
    sender: "AD-TRAIIND",
    message:
      "TRAI Notice: Your SIM services will be disconnected within 24 hours because your KYC information is outdated. Update details at https://trai-simverify.top/update",
    url: "https://trai-simverify.top/update",
    riskScore: 98,
    classification: "CRITICAL_PHISHING",
    dltHeaderFailureRationale:
      "Synthetic header cannot establish DLT authorization. The message falsely invokes TRAI, threatens SIM disconnection and directs the recipient to a deceptive domain."
  },

  {
    id: 5,
    sender: "VK-ITREFND",
    message:
      "Income Tax Department: Your Section 143(1) refund of Rs. 18,450 is pending. Confirm bank details to receive your refund at https://incometax-refund.in.net/claim",
    url: "https://incometax-refund.in.net/claim",
    riskScore: 93,
    classification: "CRITICAL_PHISHING",
    dltHeaderFailureRationale:
      "Synthetic sender identity does not prove government authorization. The message uses a refund lure and a deceptive .in.net domain to request financial information."
  },

  {
    id: 6,
    sender: "AD-FESTWIN",
    message:
      "Diwali Mega Cashback! Congratulations, you have won Rs. 25,000. Claim your festive cashback before midnight: https://festive-cashback.xyz/reward",
    url: "https://festive-cashback.xyz/reward",
    riskScore: 89,
    classification: "CRITICAL_PHISHING",
    dltHeaderFailureRationale:
      "Synthetic promotional header cannot prove DLT registration. Prize urgency, unexpected cashback and a deceptive .xyz domain indicate a likely phishing campaign."
  },

  {
    id: 7,
    sender: "10-digit GSM",
    message:
      "Your electricity bill is overdue. Please review your latest bill and contact your electricity provider through the official customer-care channel.",
    url: null,
    riskScore: 18,
    classification: "SAFE",
    dltHeaderFailureRationale:
      "A 10-digit GSM sender does not provide a DLT-registered sender identity by itself, but this synthetic message contains no suspicious URL, payment request or urgent credential request."
  },

  {
    id: 8,
    sender: "10-digit GSM",
    message:
      "Your bank account requires an update. Please check your bank's official mobile application or website for any pending KYC notification. Do not share OTP or passwords.",
    url: null,
    riskScore: 22,
    classification: "SAFE",
    dltHeaderFailureRationale:
      "The synthetic GSM sender cannot be validated as a registered DLT header, but the message does not provide a suspicious link and explicitly advises against sharing credentials."
  },

  {
    id: 9,
    sender: "AD-TAXALERT",
    message:
      "Income Tax reminder: Please review your tax information through the official Income Tax e-filing portal. Do not use links received from unknown senders.",
    url: null,
    riskScore: 24,
    classification: "SAFE",
    dltHeaderFailureRationale:
      "Synthetic header is not evidence of DLT registration, but the message avoids credential requests, payment links and suspicious domains."
  },

  {
    id: 10,
    sender: "AX-REWARDX",
    message:
      "Festival Reward Alert: You may be eligible for a special cashback offer. Review the offer carefully before entering any personal or financial information: https://festival-offer.site/info",
    url: "https://festival-offer.site/info",
    riskScore: 57,
    classification: "SUSPICIOUS",
    dltHeaderFailureRationale:
      "Synthetic promotional header cannot prove DLT authorization. The unexpected cashback claim and external .site domain require additional reputation and content verification."
  }
];