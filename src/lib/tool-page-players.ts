import type { ToolPage } from "@/components/seo/ToolLanding";
import { CHECKED as NAME_CHECKED, SOURCES as NAME_SOURCES } from "@/features/name-style/domain";
import { BENCHMARK, MIN_HUMAN_MS, TRIES, WAIT_MAX_MS, WAIT_MIN_MS } from "@/features/reflex/domain";
import { CHECKED as XH_CHECKED, SOURCES as XH_SOURCES } from "@/features/crosshair/domain";

/**
 * The player tools added on 25 Nov 2026: name styles for Free Fire and BGMI, the reaction time and tap speed tests, and the Valorant
 * crosshair code tool. Registered in TOOL_PAGES. Facts about the games are only those we could source (see each feature's domain.ts);
 * anything we could not verify is said to be unverified, with "check in the game".
 */
type Page = ToolPage & { title: string; description: string };

const ffHelp = `[Garena's Free Fire help centre](${NAME_SOURCES.ffNickname})`;
const bgmiHelp = `[BGMI help centre page on changing your name](${NAME_SOURCES.bgmiRename})`;

export const FF_NAME_STYLE_PAGE: Page = {
  slug: "free-fire-name-style", name: "Free Fire name style generator", shortName: "name style generator", updated: "2026-11-25", howTo: true,
  title: "Free Fire name style generator: stylish FF names",
  description: "Type your name and get Free Fire name styles to copy: stylish letters, symbols and frames, with a note on which may show as boxes. Free, no app or sign-up.",
  h1: "Free Fire name style generator: stylish names you can copy",
  lead: "Type your name and this page turns it into Free Fire name styles: fancy letters, symbols and frames, each with a Copy button. It also shows which styles the game is likely to show as boxes, so you only paste names that work. Below the generator there is a long list of ready-made stylish names and a list of symbols, all one tap to copy, and the steps to change your name in the game. Free, in your browser, nothing saved or uploaded.",
  intro: "Type your name and this page turns it into Free Fire name styles: fancy letters, symbols and frames, each with a Copy button. It also shows which styles the game is likely to show as boxes, so you only paste names that work.",
  useHeading: "Make your Free Fire name style",
  benefits: [
    { title: "Every style at once", body: "Your name in eleven letter styles, from plain to small capitals, bold, script and gothic, with a symbol frame and an optional guild tag, each with its character count and a Copy button." },
    { title: "Honest about boxes", body: "Each style says how widely phone fonts draw it. Garena itself warns that special characters may not show on every device, so the plain version is always there." },
    { title: "Ready names and symbols", body: "A list of short stylish names made by this tool and a list of symbols, in the page itself, so you can copy one even before the generator loads." },
  ],
  steps: [
    "Type your name in the box. The page shows it in every style with the symbols you pick.",
    "Press Copy next to the style you like, or copy a ready-made name or a symbol from the lists below.",
    "In Free Fire, tap your profile picture at the top left, then the button next to your current nickname, as Garena's help centre describes.",
    "Paste the name, check that it fits and looks right, and confirm. The game shows the cost before you confirm.",
  ],
  sections: [
    {
      id: "rules", h2: `What Garena says about Free Fire names (checked ${NAME_CHECKED})`,
      paras: [
        `${ffHelp} (the Brazilian help centre, in Portuguese) says a nickname can only be changed with Diamonds or a Nickname Change Card. It asks players to avoid special characters, because Garena cannot guarantee that all of them show on every device.`,
        "We could not find a Garena page that gives the maximum length of a nickname or a list of allowed symbols, so this page gives neither. It shows how many characters each style has and keeps the plain name next to it. If the game refuses a name or cuts it short, try fewer symbols, a plainer style or a shorter name.",
      ],
    },
    {
      id: "boxes", h2: "Why some stylish names turn into boxes",
      paras: [
        "Stylish letters are not a font: each one is a separate Unicode character that looks like a letter. A phone can only show a character its fonts contain. The bold, script, gothic and outline letters come from a part of Unicode that older phones and some game fonts lack, so they are marked \"newer fonts only\". Small capitals, wide and circled letters and the symbols in the frames are drawn by more fonts.",
        "Other players see your name with their own phone's fonts, so a name that looks fine on your phone can still be boxes on theirs. That is a reason to keep at least part of the name in plain letters.",
      ],
    },
  ],
  guides: ["free-fire-tournament-organiser", "run-a-custom-room-tournament", "tournament-registration-form-fields"],
  related: [
    { href: "/tools/free-fire-guild-name/", label: "Free Fire guild name generator", blurb: "Short guild names with a stylish version next to each plain one, and a guild badge." },
    { href: "/tools/bgmi-name-style/", label: "BGMI name style generator", blurb: "The same name styles, with clan tag frames and the BGMI rename steps." },
    { href: "/points-table/free-fire/", label: "Free Fire points table", blurb: "Placement and kill points for a Free Fire custom room, with a picture to share." },
  ],
  faq: [
    { q: "How do I put a stylish name in Free Fire?", a: "Type your name in the generator, press Copy next to the style you like, then open Free Fire. Garena's help centre describes the steps: tap your profile picture at the top left, tap the button next to your current nickname, paste the new name and confirm. Check how the name looks before you confirm, because a rename costs Diamonds or a Nickname Change Card. If the name shows boxes or is refused, go back and pick a plainer style." },
    { q: "Why does my stylish name show boxes or question marks in the game?", a: "Because the phone's fonts do not contain those characters. Each stylish letter is its own Unicode character, and Garena's help centre says it cannot guarantee that special characters show on every device. The bold, script, gothic and outline letters need newer fonts; small capitals, wide and circled letters and the frame symbols are drawn by more phones. Other players see your name with their own fonts, so keep part of it in plain letters." },
    { q: "How many characters can a Free Fire name have?", a: "We could not confirm it. Garena's help centre page on nicknames gives no limit, and guide sites disagree, so this page does not state a number. The generator shows how many characters each style has, counting a symbol such as ꧁ as one, but the game may count some characters differently. Paste the name into the game: if it is refused or cut short, use fewer symbols or a shorter name." },
    { q: "How do I change my name in Free Fire, and does it cost diamonds?", a: "Yes, it costs something. Garena's help centre says the only ways to change a nickname are with Diamonds or a Nickname Change Card. Tap your profile picture at the top left, then the button next to your current nickname, type or paste the new name and confirm. Garena's page does not give the price, and prices can change with events, so check the amount the game shows before you confirm." },
    { q: "Which symbols work in Free Fire names?", a: "Garena publishes no list of allowed symbols, and it advises players to avoid special characters because they may not show on every device. Many players do use symbols such as ꧁ ꧂, 亗, 乂 and ★, which are in the symbol list on this page. Paste a name into the game to see whether it is accepted, and look at it on another phone if you can. Keep the plain name for tournament forms and points tables." },
    { q: "Can I use the same name style for my guild?", a: "You can try the same letters and symbols in the guild name box, but check it there too, because a guild name is entered separately in the game. For guild name ideas from our own word lists, with a stylish version next to each plain one and a guild badge, use the Free Fire guild name generator. Keep a plain spelling of the guild name for tournament registration, where organisers match names against their list." },
    { q: "Is my Free Fire name saved or sent anywhere?", a: "No. The styles are made in your browser and nothing you type is uploaded or stored. When you copy a name, the page only counts that a name was copied, with no name, identifier or cookie, and not at all if your browser sends Do Not Track or Global Privacy Control. The ready-made names on this page were made by this tool from our own word lists; they are not real players' names." },
  ],
};

export const BGMI_NAME_STYLE_PAGE: Page = {
  slug: "bgmi-name-style", name: "BGMI name style generator", shortName: "BGMI name style generator", updated: "2026-11-25", howTo: true,
  title: "BGMI name style generator: stylish names to copy",
  description: "Make a BGMI stylish name in seconds: fancy letters, symbols and clan-tag frames with a Copy button, plus the steps to rename in the game. Free.",
  h1: "BGMI name style generator: stylish names and symbols",
  lead: "Type your name to get BGMI name styles with fancy letters, symbols and a clan tag, each ready to copy. The page also explains how to rename in BGMI and which characters the game accepts. Below the generator there is a list of ready-made stylish names and symbols, each one tap to copy. Free, in your browser, nothing saved or uploaded.",
  intro: "Type your name to get BGMI name styles with fancy letters, symbols and a clan tag, each ready to copy. The page also explains how to rename in BGMI and which characters the game accepts.",
  useHeading: "Make your BGMI name style",
  benefits: [
    { title: "Clan tag frames", body: "Add your clan tag before your name in three looks (TAG丨Name, 『TAG』Name or TAG•Name), styled in the same letters as the name." },
    { title: "Eleven letter styles", body: "Plain, small capitals, wide, circled, bold, bold italic, sans bold, script, gothic, outline and typewriter letters, each with its character count and a Copy button." },
    { title: "Plain name always there", body: "Every style says how widely phone fonts draw it, and the plain version stays next to it for tournament forms and points tables." },
  ],
  steps: [
    "Type your name. Tick the box to add your clan tag and pick how it looks.",
    "Pick the symbols around the name, then press Copy next to the style you like, or copy a ready-made name or a symbol below.",
    "In BGMI, use a Rename Card to change your name, as the BGMI help centre explains, and paste the new name.",
    "Check that the name fits and shows correctly before you confirm.",
  ],
  sections: [
    {
      id: "rules", h2: `What we could check about BGMI names (checked ${NAME_CHECKED})`,
      paras: [
        `BGMI renames use a Rename Card: see the ${bgmiHelp}. We could not open that page ourselves on the day we checked, so this page adds no detail from it about where cards come from or how often you can rename.`,
        "We found no Krafton page that gives the maximum length of a BGMI name or the characters it allows. So this page does not state a limit or promise that a symbol works: it shows how many characters each style has and keeps the plain name next to it. If the game refuses a name, use fewer symbols, a plainer style or a shorter name.",
      ],
    },
    {
      id: "tags", h2: "Putting a clan tag before your name",
      items: [
        "Keep the tag short: two to four letters are easy to read in the kill feed and on a points table.",
        "Use the same tag and the same look for every member, so your squad is easy to spot in a lobby.",
        "Style the tag and leave the name plain if the full name in fancy letters is too long or shows boxes.",
        "Register the plain spelling at tournaments: referees match names against their list.",
      ],
    },
  ],
  guides: ["bgmi-custom-room-tournament", "pubg-mobile-custom-room-results", "run-a-custom-room-tournament"],
  related: [
    { href: "/tools/team-name-generator/", label: "Team name generator", blurb: "Original names for a BGMI squad or a clan, with a name check and a badge." },
    { href: "/points-table/bgmi/", label: "BGMI points table", blurb: "Placement and kill points for BGMI custom rooms, with a picture to share." },
    { href: "/tools/free-fire-name-style/", label: "Free Fire name style generator", blurb: "The same styles for Free Fire, with what Garena says about names." },
  ],
  faq: [
    { q: "How do I write a stylish name in BGMI?", a: "Type your name in the generator, pick the symbols and, if you want, your clan tag, and press Copy next to the style you like. Then change your name in BGMI with a Rename Card and paste the copied name into the name box. Check how it looks before you confirm. If the game refuses it or it shows boxes, come back and pick a plainer style or fewer symbols." },
    { q: "How do I change my name in BGMI?", a: "With a Rename Card. The BGMI help centre has a page on changing your name, linked on this page. We could not open it ourselves on 25 Nov 2026, so we do not repeat details from it about where cards come from or how often you can rename. In the game, look in your inventory for a Rename Card, use it, paste your new name and confirm. Before you use the card, copy the exact name you want from this page and check it on the preview, because the card is used up when you rename." },
    { q: "Which symbols are allowed in BGMI names?", a: "We could not find a published list from Krafton, so this page does not promise that any symbol works. Many players use symbols such as 『 』, 丨, 亗 and ★, which are in the symbol list below. Whether a symbol shows also depends on the fonts on each player's phone. Paste the name into the game to see whether it is accepted, and keep the plain spelling for tournament forms." },
    { q: "How long can a BGMI name be?", a: "We could not verify a limit from Krafton, so this page does not state one. The generator shows how many characters each style has, counting a symbol as one, but the game may count some characters differently. If the game cuts the name short or refuses it, use a shorter name, a shorter clan tag or fewer symbols. A short name is also easier for teammates to call out in voice chat and for organisers to read on a points table." },
    { q: "How do I add my clan tag before my name?", a: "Tick the box to add a clan tag, type up to five characters, and pick one of three looks: TAG丨Name, 『TAG』Name or TAG•Name. The tag gets the same letter style as your name in every row. Copy the row you like and paste it into the game. Agree the tag and the look with your squad so every member uses the same one. The tag is checked together with your name, so an abusive word in either is refused, and nothing you type leaves the page." },
    { q: "Do PUBG Mobile name styles work in BGMI?", a: "The letters and symbols are ordinary Unicode characters, so the same copied text can be pasted into either game. Whether each game accepts and shows a character is up to that game and the player's phone fonts, and we could not verify either game's rules. Test the name in BGMI before you confirm a rename. If a symbol shows as an empty box on your phone, it will probably show that way for other players too, so swap it for a different symbol or a plainer letter style." },
    { q: "Is my BGMI name or clan tag saved anywhere?", a: "No. The styles are made in your browser and nothing you type, including your clan tag, is uploaded or stored. When you copy a name, the page only counts that a name was copied, with no name, identifier or cookie, and not at all if your browser sends Do Not Track or Global Privacy Control. The ready-made names were made by this tool; they are not real players' names." },
  ],
};

const benchmark = `[Human Benchmark's reaction time statistics](${BENCHMARK.url})`;

export const REACTION_PAGE: Page = {
  slug: "reaction-time-test", name: "Reaction time test", shortName: "reaction time test", updated: "2026-11-25", appCategory: "GameApplication",
  title: "Reaction time test for gamers: tap when it turns",
  description: "Free reaction time test that works on phones: tap when the screen changes, get your average over five tries in milliseconds, and train with a tap drill.",
  h1: "Reaction time test: how fast are your reflexes?",
  lead: `Tap the screen the moment it changes colour; after five tries you get your average reaction time in milliseconds. Phone screens and touch add delay of their own, so compare your scores on the same device. The wait before each change is random, a tap before the change does not count, and your best average is kept in this browser only. Share your score as a picture. Free, no account.`,
  intro: "Tap the screen the moment it changes colour; after five tries you get your average reaction time in milliseconds. Phone screens and touch add delay of their own, so compare your scores on the same device.",
  useHeading: "Test your reaction time",
  benefits: [
    { title: "Made for phones", body: "One big pad that reacts to the touch itself, not the lift of your finger. A keyboard works too: press Space or Enter." },
    { title: "No cheating by guessing", body: `The wait is random, between ${WAIT_MIN_MS / 1000} and ${WAIT_MAX_MS / 1000} seconds. A tap before the change, or under ${MIN_HUMAN_MS} ms after it, does not count.` },
    { title: "Your scores stay yours", body: "Your best and recent averages are kept in this browser only. Share a picture of a result if you want; nothing is uploaded." },
  ],
  steps: [
    "Tap the pad to start, then wait while it says Wait for cyan.",
    "The moment the pad turns cyan, tap it as fast as you can.",
    `Tap again for the next try. After ${TRIES} good tries you see your average and your best.`,
    "Share the result as a picture, or try again. Compare scores only on the same phone or computer.",
  ],
  sections: [
    {
      id: "context", h2: "How to read your score",
      paras: [
        `For context, ${benchmark} page said on ${BENCHMARK.checked} that its median reaction time is ${BENCHMARK.median} milliseconds and the average ${BENCHMARK.average} milliseconds, over ${BENCHMARK.clicks} clicks. Their test runs mostly on computers with a mouse, and they note that it is affected by the latency of your computer and monitor, so a phone score is not directly comparable.`,
        "Your number includes your own reaction plus the delay of your device: how often the screen refreshes, how often the touch screen reports a tap, and the browser. That is why the same person can score differently on two phones. Track your own average on one device over time rather than comparing with friends on other phones.",
      ],
    },
  ],
  guides: ["valorant-tournament-organiser", "manage-multiple-games", "run-a-campus-tournament"],
  related: [
    { href: "/tools/tap-speed-test/", label: "Tap speed test", blurb: "How many taps per second you can make in 5, 10 or 30 seconds." },
    { href: "/tools/sensitivity-converter/", label: "Sens converter and eDPI calculator", blurb: "Keep the same aim when you move between Valorant, CS2, Apex and Overwatch 2." },
    { href: "/tools/valorant-crosshair/", label: "Valorant crosshair code tool", blurb: "Paste a crosshair code to preview it, edit it and copy it back." },
  ],
  faq: [
    { q: "What is a good reaction time?", a: `There is no official figure for gamers. For context, Human Benchmark's statistics page said on ${BENCHMARK.checked} that the median of its reaction time test is ${BENCHMARK.median} milliseconds, over ${BENCHMARK.clicks} clicks. That test runs mostly on computers with a mouse, and device delay is part of every score, so use it as a rough guide only. The most useful comparison is your own average on the same device over time.` },
    { q: "Why is my reaction time slower on a phone?", a: "A phone adds steps between the change and your tap being counted: the screen has to show the new colour, the touch screen samples your finger a number of times per second, and the browser handles the event. Each adds a few milliseconds. A computer with a fast monitor and mouse usually adds less. That is why this page tells you to compare scores only on the same device." },
    { q: "Does screen refresh rate change my score?", a: "It can. A screen that refreshes 60 times a second shows a new picture about every 17 milliseconds, while a 120 Hz screen does it about every 8, so the colour change can reach your eyes a little sooner. The test takes the change time from the frame the colour is drawn in, but it cannot measure the screen itself. Use the same refresh setting when you compare your scores." },
    { q: "Can you train reaction time?", a: "Practice usually makes you more consistent at a test like this, because you learn to stay ready and stop guessing. Sleep, focus and warming up before a match also play a part. This page does not promise a particular improvement. Test yourself at the same time of day on the same device, a few rounds at a time, and watch your average on this device. Short sessions of a few rounds, repeated over days, tell you more than one long session, because tired eyes and fingers slow everyone down." },
    { q: "Is reaction time the same as aim?", a: "No. This test measures how quickly you respond to a simple change on the screen. Aim in a shooter also needs you to track a target, move the right distance and stop on it, which depends on your sensitivity, your crosshair and practice. A fast reaction helps, but it is one part of it. The sensitivity converter and the crosshair tool on this site help with the other parts." },
    { q: "Why does a tap before the change not count?", a: `Because a tap before the screen changes is a guess, not a reaction. The wait before each change is random, between ${WAIT_MIN_MS / 1000} and ${WAIT_MAX_MS / 1000} seconds, so you cannot time it. A tap before the change shows Too soon, and a tap less than ${MIN_HUMAN_MS} milliseconds after it is also treated as a guess, because people do not react to a change on a screen that quickly. Neither counts towards your ${TRIES} tries, so a lucky guess cannot improve your average. Just tap again to try once more.` },
    { q: "Is my reaction time score saved?", a: "Only in this browser. After five good tries, your best average and your last ten averages are kept in this browser's local storage on your device, with no account. Nothing is uploaded, and clearing your browser data or pressing Forget my results on this device removes them. When you finish a test the page only counts that a test was finished, with no score, identifier or cookie." },
  ],
};

export const TAP_PAGE: Page = {
  slug: "tap-speed-test", name: "Tap speed test", shortName: "tap speed test", updated: "2026-11-25", appCategory: "GameApplication",
  title: "Tap speed test: taps per second on your phone",
  description: "Count how many times you can tap in 5, 10 or 30 seconds on your phone, see taps per second, and use the drill to warm up before a match.",
  h1: "Tap speed test: taps per second (CPS on mobile)",
  lead: "Tap as fast as you can for 5, 10 or 30 seconds and the test shows your taps per second. It is the phone version of a CPS (clicks per second) test, built for mobile gamers. The clock starts on your first tap, every finger on the pad counts, and your best for each length is kept in this browser only. Share your score as a picture. Free, no account.",
  intro: "Tap as fast as you can for 5, 10 or 30 seconds and the test shows your taps per second. It is the phone version of a CPS (clicks per second) test, built for mobile gamers.",
  useHeading: "Test your tap speed",
  benefits: [
    { title: "Starts when you do", body: "The clock starts on your first tap, not when the page loads, so no time is lost reaching for the screen." },
    { title: "Two thumbs count", body: "Every touch on the pad is one tap, so you can use one finger, two thumbs or a claw grip, as you would in a game." },
    { title: "Best scores on your device", body: "Your best for 5, 10 and 30 seconds is kept in this browser only. Share a picture of a result if you want; nothing is uploaded." },
  ],
  steps: [
    "Pick 5, 10 or 30 seconds.",
    "Tap the pad as fast as you can. The clock starts on your first tap.",
    "When the time is up, read your taps per second and the total taps.",
    "Share the result as a picture, or press Try again.",
  ],
  guides: ["free-fire-tournament-organiser", "bgmi-custom-room-tournament", "run-a-campus-tournament"],
  related: [
    { href: "/tools/reaction-time-test/", label: "Reaction time test", blurb: "Tap the moment the screen changes; get your average over five tries." },
    { href: "/tools/free-fire-name-style/", label: "Free Fire name style generator", blurb: "Stylish letters, symbols and frames for your in-game name." },
  ],
  faq: [
    { q: "What is a good taps-per-second score?", a: "There is no official benchmark for taps per second on a phone, so this page does not give one. The score depends on the length of the test, your grip, the phone's touch screen and how many fingers you use. Compare your own scores for the same length on the same phone, and use the 5-second test for bursts and the 30-second test for stamina. Your best for each length is kept on this device, so you can see whether you are getting faster." },
    { q: "Is a tap test the same as a CPS test?", a: "It is the same idea on a touch screen. A CPS test counts mouse clicks per second on a computer; this test counts taps per second on the pad. The numbers are not directly comparable, because a mouse button and a touch screen work differently, but both show how many presses you can make in a set time. On a phone, this page counts the moment your finger touches the pad, so the score is taps started, not taps lifted." },
    { q: "Does using two thumbs count?", a: "Yes. Every touch that starts on the pad counts as one tap, so two thumbs, or more fingers, all count, the way they would in a game where you tap with both hands. If you want to compare with a friend, agree on the grip first. Taps that land outside the pad, on the rest of the page, are not counted, so keep your fingers on the big box while the clock runs. The pad is large on purpose so that this is easy on a phone." },
    { q: "Why does my phone miss taps?", a: "Touch screens report touches a limited number of times per second, and very fast taps from the same finger can merge into one, especially if the finger does not fully lift. Screen protectors, wet fingers and battery saver modes can make it worse. Lift your finger fully between taps, and try the test with and without a protector. The page counts every touch the browser reports, so a missed tap is one the phone itself did not pass on. That is also why scores are only comparable on the same phone." },
    { q: "How do I warm up before a match?", a: "A short warm-up gets your fingers moving: a couple of 5-second tap tests, a round of the reaction time test, then a few minutes in the game's training area. This page does not claim a warm-up raises your rank. It is a quick way to start a session ready. Do the same short routine before each match, so that you also notice when your fingers feel slower than usual, for example on a cold day or late at night." },
    { q: "Why does the clock start on my first tap?", a: "So that no time is lost while you get ready. If the clock started when the page loaded or when you pressed a button, the first part of the test would be spent moving your hand to the screen, and short tests such as 5 seconds would be unfair. Here the first tap starts the clock and counts as a tap, and every tap after it counts until the time runs out. Taps after the time is up are ignored, and Try again resets the counter for the same length." },
    { q: "Is my tap speed score saved?", a: "Only in this browser. Your best taps for 5, 10 and 30 seconds are kept in this browser's local storage on your device, with no account. Nothing is uploaded, and clearing your browser data or pressing Forget my results on this device removes them. When you finish a test the page only counts that a test was finished, with no score, identifier or cookie." },
  ],
};

export const CROSSHAIR_PAGE: Page = {
  slug: "valorant-crosshair", name: "Valorant crosshair code generator", shortName: "crosshair code tool", updated: "2026-11-25", howTo: true, appCategory: "GameApplication",
  title: "Valorant crosshair code generator, preview and share",
  description: "Paste a Valorant crosshair code to see it, change colour, lines and dot, then copy the new code or share a link. Works with codes from any profile.",
  h1: "Valorant crosshair code generator and preview",
  lead: "Paste any Valorant crosshair code to see a live preview, edit it, and copy the new code back into the game. You can save your codes in the browser and share each one as a link. The editor covers the primary crosshair's colour, outlines, centre dot and inner and outer lines; anything else in a pasted code is kept exactly as it was. Free, no account.",
  intro: "Paste any Valorant crosshair code to see a live preview, edit it, and copy the new code back into the game. You can save your codes in the browser and share each one as a link.",
  useHeading: "Preview and build a crosshair",
  benefits: [
    { title: "Paste, see, change", body: "Paste a code and the preview and every control update at once. Change the colour, outlines, dot and lines and the code updates as you go." },
    { title: "Nothing lost", body: "Settings this tool does not edit, such as firing error or the aim down sights and sniper crosshairs, are kept from your code exactly as they were." },
    { title: "Favourites and links", body: "Save codes with a name in this browser, and copy a link that opens this page with the crosshair loaded." },
  ],
  steps: [
    "Copy a code: in Valorant, open Settings, then the Crosshair tab, and press the arrow pointing up next to Crosshair Profile; or copy one from any page.",
    "Paste it into the box on this page to see the preview, or start from the default.",
    "Change the colour, outlines, dot and lines, then press Copy code.",
    "In Valorant, open Settings, then the Crosshair tab, press the arrow pointing down next to Crosshair Profile, paste the code and press Import.",
  ],
  sections: [
    {
      id: "format", h2: `What the numbers in a crosshair code mean (checked ${XH_CHECKED})`,
      paras: [
        `Riot added crosshair import and export in [patch 4.05](${XH_SOURCES.patch405}), and custom colours and separate line lengths in [patch 5.04](${XH_SOURCES.patch504}), but it does not publish the code format. What follows comes from the open-source [@valapi/crosshair decoder](${XH_SOURCES.valapi}), checked against two other public decoders.`,
        "A code is a list of values separated by semicolons. It starts with 0, then P for the primary crosshair, A for aim down sights and S for the sniper scope. Inside each part, a letter is followed by its value, and a setting that is left out keeps the game's default. In the primary part: c is the colour (0 white, 1 green, 2 yellow green, 3 green yellow, 4 yellow, 5 cyan, 6 pink, 7 red), h turns outlines on or off, t and o are the outline thickness and opacity, d turns the centre dot on, z and a are its thickness and opacity. Inner line settings start with 0 and outer line settings with 1: b shows the lines, t is thickness, l is length, v is a separate vertical length used when g is 1, o is the offset from the centre and a is the opacity.",
      ],
      note: "Supported here: those primary settings with the eight preset colours. Custom hex colours are previewed and kept, but not written, because the public decoders disagree on how a custom colour is stored. The ranges of the sliders come from the decoders, not from Riot.",
    },
  ],
  guides: ["valorant-tournament-organiser", "manage-multiple-games", "run-a-campus-tournament"],
  related: [
    { href: "/tools/sensitivity-converter/", label: "Sens converter and eDPI calculator", blurb: "Move your sensitivity between Valorant, CS2, Apex and Overwatch 2 with cm/360." },
    { href: "/points-table/valorant/", label: "Valorant league table", blurb: "Wins, maps and rounds for 5v5 match play, with a picture to share." },
    { href: "/tools/reaction-time-test/", label: "Reaction time test", blurb: "Tap the moment the screen changes; get your average over five tries." },
  ],
  faq: [
    { q: "How do I import a crosshair code in Valorant?", a: "Open Settings and go to the Crosshair tab. Next to Crosshair Profile, press the icon that looks like an arrow pointing down, paste the code into the field and press Import. Riot described these steps in the patch 4.05 notes. Menus can move between patches, so if you cannot find the icon, look for an import option next to the crosshair profile list." },
    { q: "How do I copy my own crosshair code?", a: "Open Settings, go to the Crosshair tab and press the icon that looks like an arrow pointing up next to Crosshair Profile. The game copies your current profile's code to the clipboard, as the patch 4.05 notes say. Paste it into this page to see it, change it or save it as a favourite in your browser. Keep a copy of your code somewhere safe, such as a note on your phone, so you can import it on another computer or after a reinstall." },
    { q: "What do the numbers in a crosshair code mean?", a: "A code starts with 0 and lists settings as a letter followed by a value, separated by semicolons. P starts the primary crosshair, A the aim down sights crosshair and S the sniper scope. In the primary part, c is the colour, h the outlines, d the centre dot, and settings starting with 0 or 1 are the inner and outer lines. Riot does not publish the format; the full list on this page comes from public open-source decoders." },
    { q: "What is the best Valorant crosshair?", a: "There is no single best one. What matters is that you can see it clearly on every map, it does not hide small targets, and it suits how you aim. A colour that stands out against the maps, such as cyan or a yellow, thin lines, a small gap and outlines if you lose it on bright walls are common choices. Try a few in the Range and keep the one you stop noticing." },
    { q: "Why does a code not import?", a: "Usually the code was cut short or changed when it was copied: a missing value, an extra space inside it or a character from a chat app. This page shows an error for a code that does not start with 0 or has a missing value. Copy the code again from its source. A code from a very old or very new game version may also contain settings the game reads differently." },
    { q: "Can I use pro players' crosshairs?", a: "Yes, any code you can copy works here and in the game, and you can copy a crosshair you spectate in game with /crosshair copy, as Riot's patch 5.04 notes say. This page does not list pro players' codes, because we would have to source and date each one. Sites that collect pro settings, such as prosettings.net, list them with their sources. Remember that a pro's crosshair suits their monitor, resolution and habits, so treat it as a starting point and adjust it in the Range." },
    { q: "Are my codes saved or sent anywhere?", a: "Codes you save as favourites are kept in this browser's local storage on your device, with no account, and nothing is uploaded. A share link carries the code in the address, so anyone you send it to can see it. When you copy a code the page only counts that a code was copied, with no code, identifier or cookie, and not at all under Do Not Track or Global Privacy Control." },
  ],
};
