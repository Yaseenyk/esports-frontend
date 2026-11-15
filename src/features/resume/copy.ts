/**
 * Every sentence the consent and visibility screens show, in ONE file so it can be reviewed and replaced in one go.
 *
 * STATUS: DRAFT. NEEDS THE OWNER'S LEGAL REVIEW before the `v3.resume` flag is switched on (DPDP Act, consent and withdrawal wording).
 * Nothing here is legal advice. The screen shows a "Draft wording" notice while COPY_IS_DRAFT is true; set it to false only after review.
 */
export const COPY_IS_DRAFT = true;

export const COPY = {
  draftNotice: "Draft wording: the consent text on this page is waiting for a legal review and may change.",
  adultTitle: "Confirm you are 18 or older",
  adultBody: "Esports resumes are for adults only. We store the time you confirmed, not your date of birth or any id.",
  adultButton: "I am 18 or older",

  consentTitle: "Allow your resume to be public",
  consentWhatBecomesPublic: [
    "Your handle and your resume address.",
    "Your bio, your city and state, and the languages you listed.",
    "For each game you added: your in-game name, rank and roles.",
    "The date your resume was last updated.",
  ],
  consentNeverPublic: "Never public: your email, your account name, your user id, your Discord id, the time you gave consent, or anything you did not enter here.",
  consentBody: "If you agree and set your resume to Public, anyone on the internet can open it, and search engines are not asked to hide it. Your resume stays private until you choose Public.",
  consentWithdraw: "You can withdraw this at any time. Withdrawing switches your resume back to private straight away. You can also delete your whole resume.",
  consentCheckbox: "I am 18 or older, I understand what becomes public, and I agree.",
  consentGive: "Give consent",
  consentWithdrawButton: "Withdraw consent",
  consentGivenAt: "You gave consent on",
  consentNone: "You have not given consent yet, so your resume cannot be public.",

  visibilityTitle: "Who can see your resume",
  visibilityPrivate: "Private: only you.",
  visibilityUnlisted: "Unlisted: anyone with the link. Not available yet.",
  visibilityPublic: "Public: anyone on the internet.",
  visibilitySave: "Save visibility",
  visibilityPublicSentence: "Public means anyone on the internet can open your resume and search engines are not asked to hide it. You can make it private again at any time.",
  visibilityMakePublic: "Make my resume public",
  visibilityNowPrivate: "Your resume is private",
  visibilityConsentWithdrawn: "Consent withdrawn. Your resume is private again.",
  visibilityPublicNeedsConsent: "Public needs your 18+ confirmation and your consent first.",

  deleteTitle: "Delete my resume",
  deleteBody: "This removes your profile and every game you added. It cannot be undone.",
} as const;
