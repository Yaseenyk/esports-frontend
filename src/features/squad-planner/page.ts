import type { ToolPage } from "@/components/seo/ToolLanding";

/**
 * The words on /tools/scrim-time-planner/ (seo-PLAN.md, F2). Registered in TOOL_PAGES. Describes only what the planner really does, and says plainly
 * what it does not do. No claims about how long a scrim "should" be: the session length is the captain's choice.
 */
export const SCRIM_PLANNER_PAGE: ToolPage & { title: string; description: string } = {
  slug: "scrim-time-planner", name: "Scrim time planner", shortName: "scrim time planner", updated: "2026-11-25",
  title: "Scrim time planner: find when your whole squad is free",
  description: "Share one link, every teammate taps the hours they are free, and the planner shows the best scrim time. Like When2meet, made for gaming squads on phones.",
  h1: "Scrim time planner: find the hour your squad is free",
  lead: "Send one link to your squad; each player taps the hours they can play, in their own time zone. The planner then shows the hours when everyone, or most of the squad, is free. Pick the days and the hours you want to play, choose 30 minute or one hour slots, and get a link for WhatsApp or Discord. Teammates need no account: a name and a few taps. The best times are listed for the session length you choose, with who is free, and a button to post the time on the scrim finder. Plans and answers are deleted after 30 days, and the captain can delete them sooner. Free.",
  intro: "Send one link to your squad; each player taps the hours they can play, in their own time zone. The planner then shows the hours when everyone, or most of the squad, is free.",
  useHeading: "Make a plan",
  benefits: [
    { title: "Made for phones", body: "Big tap targets for every slot, grouped by day, and the share button opens WhatsApp. Nobody has to drag across a tiny grid on a phone screen." },
    { title: "Every player's own time zone", body: "The captain picks the days and hours in one zone (India by default). Each teammate sees every slot in the time zone of their own phone, so a player abroad never has to convert." },
    { title: "Best times, for your session length", body: "Choose how long you want to play, from one slot up to four, and the planner lists the windows where the most people are free for the whole session, with their names." },
  ],
  steps: [
    "Pick the game, the first day, how many days, and the hours you want to play.",
    "Make the plan and send the link to your squad on WhatsApp or Discord.",
    "Each teammate types their name and taps the slots they are free, then saves.",
    "Read the best times, then copy the result or post the time on the scrim finder.",
  ],
  guides: ["run-a-custom-room-tournament", "bgmi-custom-room-tournament", "free-fire-tournament-organiser"],
  related: [
    { href: "/tools/schedule/", label: "Match schedule maker", blurb: "Planning a whole tournament day, not practice? Turn matches into a timed run-sheet." },
    { href: "/tools/team-name-generator/", label: "Team name generator", blurb: "New squad? Get an original team name and a simple badge for your group chat." },
  ],
  faq: [
    { q: "How do I find a time when my whole team is free?", a: "Make a plan here with the days and hours you could play, then send the link to your squad. Each player opens it on their phone, types their name and taps every slot they are free. As answers come in, the Best times list shows the windows where the most people are free, with their names, so you can see at a glance whether everyone can make it or who is missing. Choose the session length first, for example two hours, and only windows where people are free for the whole two hours are listed." },
    { q: "Is this like When2meet?", a: "Yes, it is the same idea, and When2meet is free and works well for general meetings. The differences are small but matter for a gaming squad: this planner is built for taps on a phone rather than dragging across a grid, it lists the best windows for a session length you choose instead of only shading a grid, it can run past midnight for late-night scrims, and it links straight to posting the time on the scrim finder. If your group already uses When2meet happily, there is no need to switch." },
    { q: "Do my teammates need an account?", a: "No. Teammates type a display name and tap their free hours; that is all. Their browser keeps a private key so that only they can change or remove their own answers later from the same phone. The captain does not need an account either: the browser that made the plan remembers it, which is what shows the Delete plan button. If a teammate clears their browser data they lose the key, and can simply answer again under the same name." },
    { q: "How does it handle different time zones?", a: "The captain picks the hours in one time zone, India time by default, and the plan stores each slot as an exact moment. Every person who opens the link sees the slots in the time zone of their own device, and the page says which zone that is. So a captain in India can plan 9 pm to midnight IST, and a teammate in Dubai sees 7:30 pm to 10:30 pm on the same buttons. Nobody has to convert times by hand, and daylight saving changes are handled by the browser." },
    { q: "How long should a scrim session be?", a: "That is up to your squad, and the planner does not assume a length. Pick the session length above the Best times list, from one slot up to four slots, which is up to four hours with one hour slots or two hours with 30 minute slots. The list then only shows windows where people are free for the whole session. If your plan uses one hour slots and you need 90 minutes, make the plan with 30 minute slots so you can choose three of them." },
    { q: "Can I share the result in WhatsApp or Discord?", a: "Yes. After making the plan you get a Copy the link button and a Share on WhatsApp button that opens WhatsApp with the link in a short message; paste the same link into Discord. On the plan page, Copy the best time copies a one-line summary, such as the day, the start time and how many of the squad are free, together with the link, ready to paste into your team chat so that late answers can still be added." },
    { q: "Who can see the plan, and what is stored?", a: "Anyone who has the link can see the plan, the names people typed and the hours they picked, so share it only in your team chat. The link carries a long random code after a # sign, which browsers never send to any server, so it does not appear in our logs or analytics. We store the game, the optional plan name, the slots and each person's name and picks. There are no accounts, emails or phone numbers. Everything is deleted 30 days after the plan was made, or at once when the captain deletes it." },
    { q: "Can I post the best time as a scrim?", a: "Yes. Each of the best times has a Post a scrim at this time link that opens the scrim finder's posting form with the game, the date and the start time already filled in, shown in India time. Posting a scrim needs a free account aged 18 or over and a team page, because other captains send requests to your team. If the scrim finder is not switched on yet, the link says so; your plan keeps working either way." },
  ],
};
