/** Private screens and one-off links, kept out of crawling (robots.txt). Pages that only carry demo data are crawlable but marked noindex. */
export const PRIVATE_PATHS = ["/app/", "/gate/", "/join/", "/pass/", "/register/", "/display/", "/live/", "/overlay/", "/embed/", "/score/", "/report/", "/ready/", "/run/", "/unsubscribe/", "/verify-email/", "/login/", "/signup/", "/forgot-password/", "/reset-password/", "/admin/"];

/**
 * AI search and assistant crawlers, named in robots.txt so a later blanket rule can never block them by accident. A named group
 * replaces "*" for that crawler, so it repeats the same private paths. Google-Extended, Applebot-Extended and CCBot decide use for
 * model training rather than search; they are allowed because the site wants assistants to know and recommend its tools.
 */
export const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "Google-Extended", "Bingbot", "Applebot", "Applebot-Extended", "CCBot"];
