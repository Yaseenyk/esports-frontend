import type { ToolPage } from "@/components/seo/ToolLanding";

/**
 * The words on the four tool pages added on 24 Nov 2026: sensitivity converter, team name generator, slot and prize split, rulebook.
 * Registered in TOOL_PAGES. Each describes only what the tool really does, and says plainly what it does not do.
 */
type Page = ToolPage & { title: string; description: string };

export const SENSITIVITY_PAGE: Page = {
  slug: "sensitivity-converter", name: "Mouse sensitivity converter", shortName: "sensitivity converter", updated: "2026-11-24",
  title: "Mouse sensitivity converter for PC games (cm/360)",
  description: "Free mouse sensitivity converter for Valorant, CS2, Apex Legends and Overwatch 2, with DPI change, cm/360 and inches/360. Every yaw value is cited.",
  h1: "Mouse sensitivity converter for Valorant, CS2, Apex and Overwatch 2",
  lead: "Move from one PC shooter to another without relearning your aim. Pick the game you play now and the one you are moving to, type your sensitivity and mouse DPI, and get the matching sensitivity, the distance your mouse travels for a full turn in centimetres and inches, and the same feel in every listed game. Only games with a published or widely documented yaw value are listed, and each value is cited on the page. Mobile games are left out on purpose. Free, in your browser, no account.",
  intro: "Type your sensitivity in one PC game and get the same feel in another, with cm/360 and a DPI change. Every number on the page has a source.",
  useHeading: "Convert your sensitivity",
  glossary: [
    { term: "Yaw", meaning: "how many degrees the view turns for one count from the mouse at sensitivity 1. Each game has its own." },
    { term: "DPI", meaning: "how many counts the mouse sends per inch it moves. Set in the mouse's own software." },
    { term: "cm/360", meaning: "how far the mouse travels for one full turn. The same cm/360 in two games feels the same." },
    { term: "eDPI", meaning: "sensitivity multiplied by DPI. Useful only between games with the same yaw." },
  ],
  benefits: [
    { title: "Same feel, worked out exactly", body: "The answer keeps sensitivity x yaw x DPI the same, so your hand moves the same distance for a full turn in both games. No guessing and no lookup tables." },
    { title: "Change your DPI at the same time", body: "Going from 400 to 800 DPI, or to a new mouse? Tick the box, type the new DPI, and the sensitivity is worked out so the turn distance does not change." },
    { title: "Every number has a source", body: "The yaw for each game is listed with where it comes from and the date we checked it. Where a publisher does not document the value, the page says so." },
  ],
  steps: [
    "Choose the game you play now and the game you are moving to.",
    "Type your sensitivity from the first game's mouse settings and your mouse DPI.",
    "If you are also changing DPI, tick the box and type the new DPI.",
    "Read the new sensitivity, the cm/360 and the table for every listed game, then set it in the game and play a few rounds before you fine-tune it.",
  ],
  sections: [
    {
      id: "mobile", h2: "Why BGMI, Free Fire and COD Mobile are not in the converter",
      paras: [
        "Mouse games turn the view by a fixed number of degrees for each count the mouse sends, so two PC games can be compared with simple maths. Mobile games do not work that way. Their camera, ADS, scope and gyroscope sliders each map a swipe or a tilt to a turn in their own way, the mapping changes with the screen, and none of the publishers documents a number that can be compared to a mouse count.",
        "A converter that turned a mouse sensitivity into BGMI, Free Fire or COD Mobile settings, or one phone into another, would be inventing the answer. So this page does not offer one. For a new phone, start from your old settings and change one slider at a time in the training ground until a full turn feels the same.",
      ],
    },
  ],
  guides: ["valorant-tournament-organiser", "manage-multiple-games", "run-a-campus-tournament"],
  related: [
    { href: "/tools/team-name-generator/", label: "Team name and badge generator", blurb: "Names from our own word lists and a flat badge to download for your new squad." },
    { href: "/points-table/valorant/", label: "Valorant league table", blurb: "Wins, maps and rounds for 5v5 match play, with a picture to share." },
  ],
  faq: [
    { q: "How does the sensitivity converter work out the new number?", a: "Every game on the list turns your view by your sensitivity multiplied by a fixed number, the yaw, for each count your mouse sends. Multiply that by your DPI and you get degrees per inch of mouse movement. The converter keeps that figure the same between the two games, so the new sensitivity is your old sensitivity times the old game's yaw times the old DPI, divided by the new game's yaw times the new DPI. That keeps your cm/360, the distance for a full turn, exactly the same." },
    { q: "Which yaw values does the converter use, and where do they come from?", a: "Counter-Strike 2 uses 0.022, the default of its m_yaw console setting documented on the Valve Developer Community wiki. Valorant uses 0.07, Apex Legends 0.022 and Overwatch 2 0.0066. Those three are not published by Riot, Respawn or Blizzard; they are community-measured values that the major converter sites agree on, and the page links the reference we used and the date we checked it. If a publisher ever documents a different value, the converter will follow the publisher." },
    { q: "What is cm/360 and why does it matter more than the sensitivity number?", a: "cm/360 is how many centimetres your mouse travels on the pad for your character to turn a full circle. Two players with the same cm/360 have the same aim speed even if their sensitivity numbers and DPI look completely different, because the numbers mean different things in different games. That is why players compare cm/360 when they talk about settings. There is no correct value: it depends on your arm, your pad size, the game and how you like to aim, so use the converter to keep the feel you already have." },
    { q: "Can I use it when I change my mouse DPI but stay in the same game?", a: "Yes. Pick the same game in both boxes, type your sensitivity and old DPI, tick the box for a DPI change and type the new DPI. The answer is the sensitivity that keeps your turn distance the same, so doubling the DPI halves the sensitivity. This is useful after buying a new mouse, or when you raise the DPI to reduce pixel skipping in menus. The table below the answer also shows what the same feel would be in the other listed games at the new DPI." },
    { q: "Why is my converted sensitivity rounded, and does rounding change the feel?", a: "Games only accept a certain number of decimals in their settings box, so the answer is rounded to what the target game takes: three decimals for Valorant and two for the others. The page shows the cm/360 of the rounded value next to the exact one, so you can see how small the difference is. With normal settings it is a fraction of a centimetre, far less than the difference you feel between two mouse pads, so you do not need to chase the last decimal." },
    { q: "Why are BGMI, Free Fire and COD Mobile missing from the converter?", a: "Because no honest conversion exists. Mobile shooters use touch and gyroscope settings, not mouse counts, and each of their sliders maps a swipe to a turn in its own undocumented way that also depends on the screen. A number we produced for them would be a guess dressed up as maths, so we do not offer one. To match your feel on a new phone, start from your old settings and adjust one slider at a time in the training area until a full turn feels the same." },
    { q: "Does the converter account for scoped, ADS or per-hero sensitivity?", a: "No. It converts the general hip-fire sensitivity, which is the number most players mean when they share settings. Zoomed, scoped and ADS sensitivity use separate multipliers and field-of-view rules that differ between games, and Overwatch 2 also lets you set a different sensitivity for each hero, which overrides the general one. Convert your general sensitivity here first, then set the scoped multipliers in the new game by feel, starting from the game's default." },
    { q: "Is anything saved or sent when I use the sensitivity converter?", a: "No. The maths runs in your browser and nothing you type is uploaded or stored, so a reload brings back the example. There is no account and no sign-in. The Share result button makes a picture of your answer on your own device: on a phone it opens the share sheet, and on a computer it saves the picture and copies a short message with the page link. Game names are shown as plain text; the page uses no game logos or artwork." },
  ],
};

export const TEAM_NAME_PAGE: Page = {
  slug: "team-name-generator", name: "Team name and badge generator", shortName: "team name generator", updated: "2026-11-24",
  title: "Esports team name generator with free badge maker",
  description: "Free esports team name generator: original names from our own word lists, a check against game and org names, and a simple badge to download as PNG or SVG.",
  h1: "Esports team name generator and badge maker",
  lead: "Get a team name that is yours: pick a theme (animals, weather and elements, Indian words, legends with no gods or religion, or space) and get eight original names made from our own word lists. Or type your own name and check it. Every name is checked against game and publisher names, esports organisation names and abusive words. Then draw a flat badge from a shape, your initials and two colours, and download it as a PNG or SVG. Free, in your browser, no account.",
  intro: "Pick a theme, get eight original names, check your own, and download a simple badge with your initials. Free, no account.",
  useHeading: "Name your team",
  benefits: [
    { title: "Names nobody else owns", body: "Names come from our own word lists, and any combination that matches a game, a publisher or an esports organisation we know of is skipped. Your own name gets the same check." },
    { title: "A badge in seconds", body: "Five shapes, four patterns and nine flat colours with your initials on top. No game art, no logos copied from anyone: a clean mark for a WhatsApp group, a jersey mock-up or a team page." },
    { title: "Ready for your team page", body: "Download the badge as a PNG for chats or an SVG that stays sharp at any size, copy the name, and create the team with a free account when you are ready." },
  ],
  steps: [
    "Choose a theme and pick one of the eight names, or press More names for another set.",
    "Or tick the box and type your own name to check it.",
    "Choose a shape, a pattern and two colours for the badge.",
    "Download the badge as PNG or SVG, copy the name, and press Create this team to make a free account.",
  ],
  guides: ["tournament-registration-form-fields", "run-a-campus-tournament", "player-id-cards"],
  related: [
    { href: "/tools/registration/", label: "Registration form", blurb: "Collect team names, captains and players in one form or online link." },
    { href: "/tools/id-cards/", label: "ID card maker", blurb: "Put the new team name and badge on player ID cards with a QR code." },
  ],
  faq: [
    { q: "Where do the team names come from?", a: "From word lists we wrote for this page, split into five themes: animals, weather and elements, Indian words, legends and space. Each name joins a first word and a second word from one theme, for example a colour or mood with an animal. Nothing is copied from existing team lists, and words that are already the names of well-known esports or league teams, such as Falcons, Titans, Outlaws or Dragons, were left out of the lists on purpose so the ideas stay original." },
    { q: "Which names does the generator block, and why?", a: "Three kinds. Names of games, publishers and platforms, such as BGMI, Free Fire, Valorant, Krafton or Garena, because a team should not look like it is run by a game company. Names of esports organisations we know of, such as Team Liquid, S8UL, GodLike or Global Esports, because those names belong to someone. And abusive words and slurs in English and Hindi. The check ignores spaces, accents and look-alike characters, so writing a zero for an o does not get around it." },
    { q: "Can I check a name I already thought of?", a: "Yes. Tick the box for your own name and type it. The page tells you straight away if it uses a game or publisher name, matches an esports organisation or contains an abusive word, and says which of the three it is. If the name is fine you see a tick and the badge uses your name and initials. Names can be 2 to 32 characters long. The check is a helpful filter, not a trademark search: if you plan to register a company or sell merchandise, search the trademark register too." },
    { q: "What do the Indian words in the names mean?", a: "The Indian theme mixes everyday Hindi and Mumbai or Delhi words, written in English letters, with team-sounding nouns. When a name uses one, its meaning appears under the badge, for example Bindaas means carefree, Toli means a gang or squad, Toofan is a storm, Bijli is lightning and Baaz is a hawk. The theme avoids gods, religious figures and the names of political groups, so a name works for any campus or community team without taking a side." },
    { q: "How is the team badge made, and can I use it anywhere?", a: "The badge is drawn from simple parts: one of five shapes, a pattern, two flat colours and your team's initials in a bold system font. Nothing is taken from game art or other teams' logos, so you can use it for your group chat picture, a printed banner, a team page or an ID card. It is deliberately plain. If you later hire a designer for a full logo, the badge is still useful as a placeholder and a colour guide." },
    { q: "What is the difference between the PNG and the SVG download?", a: "The PNG is a 1024 by 1024 picture that works everywhere: WhatsApp, Instagram, Discord and printed documents. The SVG is a vector file that stays sharp at any size, so it suits a banner, a jersey mock-up or a design program such as Figma or Inkscape. Both are made in your browser from the same drawing, so they look the same. The letters use your device's system font, which can make the SVG look slightly different on another computer." },
    { q: "What happens when I press Create this team?", a: "It opens the free sign-up page. The team name is not sent with it and nothing is stored, so press Copy the name first and type it in when you make your team page after signing up. Accounts are for people aged 18 and over. Team pages stay private until you choose to publish them. The generator itself needs no account at all: you can make names and badges as often as you like and leave without signing up." },
    { q: "Is anything I type saved or sent anywhere?", a: "No. Names are generated and checked in your browser, the badge is drawn on your device, and the downloads are made there too. Nothing is uploaded, there is no account for the generator and nothing is kept after you close the page, so a reload starts again with the animal theme. Copy the name and download the badge if you want to keep them. Game names on this site are plain text and the page uses no publisher logos or game icons." },
  ],
};

export const PRIZE_SPLIT_PAGE: Page = {
  slug: "prize-split", name: "Slot and prize split calculator", shortName: "slot and prize split calculator", updated: "2026-11-24",
  title: "Slot and prize split calculator for tournaments",
  description: "Free calculator: split qualification slots across groups, and if your event has a prize pool, split that figure across places by percent or rule. Maths only.",
  h1: "Slot and prize split calculator for tournaments",
  lead: "Two small calculators for organisers. Split qualification slots across groups or lobbies, evenly or by group size, so the numbers add up exactly. And if your event has a prize pool, type the figure and split it across places by your own percentages or a simple rule, rounded to whole numbers or to steps of 10, 100 or 1,000, with the total always matching what you typed. Maths only: nothing is collected, paid, held or stored. Free, in your browser, no account.",
  intro: "Split qualification slots across groups, and split a prize pool figure across places, with totals that always add up. Maths only.",
  useHeading: "Do the maths",
  benefits: [
    { title: "Totals that always add up", body: "Shares are rounded with the largest remainder method, so the parts add up to exactly the total you typed: no slot or point lost to rounding, and no place given more than a step above its share." },
    { title: "Fair rules, said plainly", body: "Even split, by group size, your own percentages, equal shares, even steps or halving. Each rule is explained under the buttons, and the note says who got the leftover when a split is not exact." },
    { title: "Share or keep it", body: "Download each split as a CSV for a spreadsheet, or press Share result for a picture of the table to post in your event group." },
  ],
  steps: [
    "Type the number of qualification slots and the number of groups or lobbies.",
    "Choose an even split, or a split by group size and type the teams in each group.",
    "If your event has a prize pool, type the figure, the number of places and a rule or your own percentages.",
    "Choose what to round to, read both tables, and download or share them.",
  ],
  guides: ["choosing-a-tournament-format", "run-a-custom-room-tournament", "esports-tournament-rules-template"],
  related: [
    { href: "/tools/groups/", label: "Groups and knockout maker", blurb: "Split teams into groups, enter scores and get a knockout bracket." },
    { href: "/tools/rulebook/", label: "Rulebook generator", blurb: "Put the slot rule and the split into a rulebook you can download as a PDF." },
  ],
  faq: [
    { q: "How are qualification slots split across groups?", a: "With an even split, every group gets the total divided by the number of groups, and the slots left over go one each to the first groups, so no two groups differ by more than one. For example 16 slots across 5 groups gives 4, 3, 3, 3 and 3. The page says how many groups get the extra slot so you can decide in your rules which ones, for example the groups of the top seeds or a draw held in public. The total always equals the slots you typed." },
    { q: "When should I split slots by group size instead?", a: "When your groups are not the same size, for example four groups of 16 teams and one of 12. A bigger group then sends more teams through, in proportion to its size, so every team has about the same chance. Type the number of teams in each group and the calculator shares the slots in proportion, using the largest remainder method for the leftovers. A group never gets more slots than it has teams, and you are told if you ask for more slots than there are teams." },
    { q: "What is the largest remainder method and why use it?", a: "It is a fair way to round shares so they still add up. Each part is worked out exactly, then rounded down; the few units left over go to the parts with the biggest fractions that were cut off, and on a tie to the higher place or the first group. Rounding each share on its own can leave you one short or one over, which is how a total of 10,000 turns into 9,999 on a poster. This method makes that impossible." },
    { q: "Does this calculator collect, hold or pay out any prize money?", a: "No. It only divides a number you type. It does not ask for or show a currency, it does not take payments, it is not a wallet, and nothing is stored or sent anywhere. Esports Hub itself does not handle entry fees, prizes or payouts. If your event has a prize pool from a sponsor or your college, this does the maths for the announcement and the rulebook; paying the winners is up to the organiser, under the rules and laws that apply to your event." },
    { q: "Which split rules can I choose for a prize pool?", a: "Your own percentages, typed per place and required to add up to 100. Winner takes all. Equal shares for every listed place. Even steps, where with four places the weights are 4, 3, 2 and 1, so first gets 40 percent and fourth 10 percent. And halving, where each place gets half of the place above, which favours the top heavily. None of these is an official or required split for any game or league; they are simple, explainable rules to pick from or start with." },
    { q: "How does rounding to 10, 100 or 1,000 work?", a: "Choose a step and every share becomes a multiple of it, which makes cleaner numbers for a poster. The figure itself must be a whole number of steps, so a pool of 1,005 cannot be rounded to tens; the page tells you when that happens. When the exact shares are not whole steps, each is rounded and the leftover steps go to the places with the biggest cut-off fractions, highest place first on a tie. A note under the table explains this whenever it happens." },
    { q: "Can I use it to split points, kills or anything that is not money?", a: "Yes. The calculator does not care what the number means. You can split a number of reward slots, points for a season ranking, vouchers from a sponsor, practice time on a shared station or seats on a bus. Type the total, choose the places or groups and a rule, and the parts add up exactly. The slot calculator is the same idea for teams going through to the next stage, and works for any game or sport with groups or lobbies." },
    { q: "Is my data saved, and can I share the result?", a: "Nothing is saved or sent: the maths runs in your browser and a reload brings back the example numbers. Download each table as a CSV to keep it or paste it into a sheet. Share result makes a picture of the table on your device, with this page's address at the bottom: on a phone it opens the share sheet for WhatsApp or Instagram, and on a computer it saves the picture and copies a short message." },
  ],
};

export const RULEBOOK_PAGE: Page = {
  slug: "rulebook", name: "Tournament rulebook generator", shortName: "rulebook generator", updated: "2026-11-24",
  title: "Tournament rulebook generator with free PDF download",
  description: "Free tournament rulebook template for BGMI, Free Fire, COD Mobile, Valorant and other games: pick a format, fill a few fields, edit the text and download a PDF.",
  h1: "Tournament rulebook generator: an editable template and PDF",
  lead: "Write the rules for your event in minutes. Choose the game and the format (battle royale points, single or double elimination, round robin or league, or best-of maps the Valorant way), fill in the event name, dates, team size, check-in, conduct and dispute rules, and get a full rulebook to read and edit on the page. Download it as a PDF made in your browser, or copy the text. It is a template to adapt, not the official rules of any game, publisher or league. Free, no account.",
  intro: "Pick the game and format, fill a few fields, edit the text and download a PDF. A template to adapt, never official rules.",
  useHeading: "Write your rulebook",
  benefits: [
    { title: "Every section a rulebook needs", body: "Event details, teams and players, check-in, the format, match settings, fair play, disputes and changes to the rules, written in plain English and ready to adapt." },
    { title: "Your decisions stay yours", body: "Anything only you can decide, such as the points scale, the map pool or the age rule, is left in [square brackets], and the page counts how many are still to fill in." },
    { title: "Edit, then print", body: "Change any word in the preview. The PDF is drawn in your browser from your edited text, so names in any script print correctly, with page numbers and a template note." },
  ],
  steps: [
    "Choose the game and the format. The usual format for the game is picked for you and can be changed.",
    "Fill in the event name, organiser, dates, place, team size and contact.",
    "Set the check-in time, the late limit, the dispute window and the conduct rules to include.",
    "Read and edit the rulebook, fill every [bracket], then download the PDF or copy the text.",
  ],
  guides: ["esports-tournament-rules-template", "free-fire-tournament-organiser", "bgmi-custom-room-tournament", "choosing-a-tournament-format"],
  related: [
    { href: "/tools/plan/", label: "Plan my tournament", blurb: "Format, match counts and a timed schedule for your teams, rooms and hours." },
    { href: "/tools/prize-split/", label: "Slot and prize split calculator", blurb: "Work out qualification slots per group, and a prize pool split if your event has one." },
  ],
  faq: [
    { q: "Are these the official rules for BGMI, Free Fire, COD Mobile or Valorant?", a: "No. The generator writes a template for your own event, and the first lines of every rulebook and every PDF page say so. Game publishers and leagues publish their own rules for their own tournaments, and those change between seasons. Nothing here copies them or claims to match them. The text is a sensible starting point written for small and campus events, and you, as the organiser, decide and own every rule once you have edited it." },
    { q: "What does the rulebook template include?", a: "A title and the template note, then event details (game, organiser, dates, place and contact), teams and players (team size, substitutes, roster lock and eligibility), check-in with the late limit, a format section that matches the format you chose, match settings and disconnections, fair play and conduct, disputes with the time window and evidence, and how the rules can change. Every section is plain text you can edit, delete or extend before you download it." },
    { q: "How is each format written up?", a: "Battle royale points covers matches per team, room details, placement and kill points (left for your scale) and tie-breaks. Single elimination covers knockout rounds, best of, seeding and byes. Double elimination adds the losers bracket, the grand final and whether a reset is played. Round robin or league covers points for a result, tie-breaks and who goes through. Best-of maps covers the map pool, veto order, side choice and overtime, with the number of maps needed to win worked out from best of 1, 3 or 5." },
    { q: "Why are some parts of the rulebook in square brackets?", a: "Because only the organiser can decide them, and guessing would be worse than leaving a gap. The points scale, the map pool, the age or college rule, the restart rule for disconnections and the channel for announcements are different for every event. Each is left as a short instruction in [square brackets]. The page counts how many brackets are left so you can see when the rulebook is complete. Remove or fill every one before you publish." },
    { q: "Can I edit the text after it is generated?", a: "Yes, the preview is a text box and every word can be changed, added or deleted. Lines that start with # become headings in the PDF and lines that start with a dash become bullet points; everything else is a paragraph. Once you edit the text, changing the form above no longer overwrites your edits. If you want to start again from the form, press Rebuild from the form, which replaces the text with a fresh copy." },
    { q: "How is the PDF made, and does it work offline?", a: "The PDF is drawn page by page in your browser from your edited text, the same way this site's run of show PDF is made, and saved to your device. It uses A4 pages with headings, bullets, page numbers and a footer that says it is a template. Because the text is drawn by your browser, names and words in Hindi or any other script print correctly. Once the page has loaded, making the PDF needs no internet connection." },
    { q: "What rules should every small tournament write down?", a: "At least five: when check-in closes and what happens to a late team, how a match or game is scored and how ties are broken, what counts as cheating and what the penalty is, how a player raises a dispute and how long they have, and who makes the final decision. Most arguments at campus events come from one of those being unclear. Publish the rulebook before registration closes so every captain has read it, and pin it in your event group." },
    { q: "Is the rulebook saved or sent anywhere?", a: "No. The form, the text and the PDF all stay in your browser. Nothing is uploaded and there is no account, so a reload starts again from the default form and any edits are gone. Download the PDF or copy the text before you leave the page. If you want to keep editing later, paste the copied text into a document, a Discord post or a note, and paste it back into the text box when you return." },
  ],
};
