import type { ToolPage } from "@/components/seo/ToolLanding";

/**
 * The words on the four tool pages added on 24 Nov 2026 (sensitivity converter, team name generator, slot and prize split, rulebook)
 * and the Free Fire guild name page added on 25 Nov 2026.
 * Registered in TOOL_PAGES. Each describes only what the tool really does, and says plainly what it does not do.
 */
type Page = ToolPage & { title: string; description: string };

export const SENSITIVITY_PAGE: Page = {
  slug: "sensitivity-converter", name: "Sensitivity converter and eDPI calculator", shortName: "sens converter", updated: "2026-11-25",
  title: "Sens converter and eDPI calculator: Valorant, CS2, Apex",
  description: "Free sens converter and eDPI calculator for Valorant, CS2, Apex Legends and Overwatch 2: mouse sensitivity, DPI change and cm/360. Every yaw value is cited.",
  h1: "Sensitivity converter and eDPI calculator for Valorant, CS2, Apex and Overwatch 2",
  lead: "Move from one PC shooter to another without relearning your aim. The sens converter takes your sensitivity and mouse DPI in the game you play now and gives the matching sensitivity in the game you are moving to, the distance your mouse travels for a full turn (cm/360 and inches/360), and the same feel in every listed game. The eDPI calculator multiplies sensitivity by DPI and shows the eDPI that gives the same feel in each game. Only games with a published or widely documented yaw value are listed, and each value is cited on the page. Mobile games are left out on purpose. Free, in your browser, no account.",
  intro: "A sens converter and an eDPI calculator in one: type your sensitivity and DPI in one PC game and get the same feel in another, with cm/360. Every number on the page has a source.",
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
    { title: "eDPI, worked out per game", body: "The eDPI calculator multiplies your sensitivity by your DPI, shows the cm/360 it gives, and lists the eDPI that feels the same in each listed game, because eDPI only compares within one game." },
  ],
  steps: [
    "Choose the game you play now and the game you are moving to.",
    "Type your sensitivity from the first game's mouse settings and your mouse DPI.",
    "If you are also changing DPI, tick the box and type the new DPI.",
    "Read the new sensitivity, the cm/360 and the table for every listed game, then set it in the game and play a few rounds before you fine-tune it.",
    "For eDPI, pick a game in the eDPI calculator and type your sensitivity and DPI.",
  ],
  sections: [
    {
      id: "maths", h2: "The maths the sens converter uses",
      paras: [
        "Each game on the list turns your view by sensitivity x yaw degrees for every count the mouse sends, and the mouse sends DPI counts for every inch it moves. So one inch of mouse travel turns sensitivity x yaw x DPI degrees, and a full turn takes 360 / (sensitivity x yaw x DPI) inches. Multiply by 2.54 for centimetres: that is cm/360.",
        "Converting keeps sensitivity x yaw x DPI the same. New sensitivity = old sensitivity x old yaw x old DPI / (new yaw x new DPI). Valorant 0.4 at 800 DPI is 0.4 x 0.07 / 0.022 = 1.27 in Counter-Strike 2 at the same DPI, and both give 40.82 cm/360. Going the other way, divide a CS2 sensitivity by 3.18 to get Valorant.",
      ],
    },
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
    { href: "/tools/valorant-crosshair/", label: "Valorant crosshair code generator", blurb: "Paste a crosshair code to preview it, edit it and copy it back into the game." },
    { href: "/tools/reaction-time-test/", label: "Reaction time test", blurb: "Test your reflexes next: tap the moment the screen changes, average over five tries." },
    { href: "/tools/team-name-generator/", label: "Team name and badge generator", blurb: "Names from our own word lists and a flat badge to download for your new squad." },
    { href: "/points-table/valorant/", label: "Valorant league table", blurb: "Wins, maps and rounds for 5v5 match play, with a picture to share." },
  ],
  faq: [
    { q: "How does the sensitivity converter work out the new number?", a: "Every game on the list turns your view by your sensitivity multiplied by a fixed number, the yaw, for each count your mouse sends. Multiply that by your DPI and you get degrees per inch of mouse movement. The converter keeps that figure the same between the two games, so the new sensitivity is your old sensitivity times the old game's yaw times the old DPI, divided by the new game's yaw times the new DPI. That keeps your cm/360, the distance for a full turn, exactly the same." },
    { q: "Which yaw values does the converter use, and where do they come from?", a: "Counter-Strike 2 uses 0.022, the default of its m_yaw console setting documented on the Valve Developer Community wiki. Valorant uses 0.07, Apex Legends 0.022 and Overwatch 2 0.0066. Those three are not published by Riot, Respawn or Blizzard; they are community-measured values that the major converter sites agree on, and the page links the reference we used and the date we checked it. If a publisher ever documents a different value, the converter will follow the publisher." },
    { q: "What is eDPI?", a: "eDPI, short for effective DPI, is your in-game sensitivity multiplied by your mouse DPI. A Valorant player on 0.4 at 800 DPI has an eDPI of 320, and so does a player on 0.2 at 1600 DPI, because both turn the same amount for the same hand movement. That makes eDPI a handy single number for comparing settings inside one game. It does not carry across games: Valorant turns 0.07 degrees per count at sensitivity 1 and CS2 turns 0.022, so a Valorant eDPI of 320 feels like a CS2 eDPI of about 1018. The eDPI calculator on this page shows that matching number for each listed game." },
    { q: "How do I convert Valorant sensitivity to CS2?", a: "Multiply your Valorant sensitivity by 0.07 / 0.022, which is about 3.18, if you keep the same mouse DPI. That ratio comes from the yaw values the converter uses: 0.07 degrees per count for Valorant, a community-measured figure, and 0.022 for Counter-Strike 2, the default of its m_yaw setting. Valorant 0.4 becomes 0.4 x 0.07 / 0.022 = 1.27 in CS2, and at 800 DPI both give 40.82 cm/360. If you change DPI as well, multiply by the old DPI and divide by the new one. For CS2 to Valorant, divide by 3.18 instead. The converter above does all of this and rounds to the decimals each game takes." },
    { q: "What is cm/360?", a: "cm/360 is how many centimetres your mouse travels on the pad for your character to turn a full circle. Two players with the same cm/360 have the same aim speed even if their sensitivity numbers and DPI look completely different, because the numbers mean different things in different games. That is why players compare cm/360 when they talk about settings. There is no correct value: it depends on your arm, your pad size, the game and how you like to aim, so use the converter to keep the feel you already have." },
    { q: "Can I use it when I change my mouse DPI but stay in the same game?", a: "Yes. Pick the same game in both boxes, type your sensitivity and old DPI, tick the box for a DPI change and type the new DPI. The answer is the sensitivity that keeps your turn distance the same, so doubling the DPI halves the sensitivity. This is useful after buying a new mouse, or when you raise the DPI to reduce pixel skipping in menus. The table below the answer also shows what the same feel would be in the other listed games at the new DPI." },
    { q: "Why is my converted sensitivity rounded, and does rounding change the feel?", a: "Games only accept a certain number of decimals in their settings box, so the answer is rounded to what the target game takes: three decimals for Valorant and two for the others. The page shows the cm/360 of the rounded value next to the exact one, so you can see how small the difference is. With normal settings it is a fraction of a centimetre, far less than the difference you feel between two mouse pads, so you do not need to chase the last decimal." },
    { q: "Why are BGMI, Free Fire and COD Mobile missing from the converter?", a: "Because no honest conversion exists. Mobile shooters use touch and gyroscope settings, not mouse counts, and each of their sliders maps a swipe to a turn in its own undocumented way that also depends on the screen. A number we produced for them would be a guess dressed up as maths, so we do not offer one. To match your feel on a new phone, start from your old settings and adjust one slider at a time in the training area until a full turn feels the same." },
    { q: "Does the converter account for scoped, ADS or per-hero sensitivity?", a: "No. It converts the general hip-fire sensitivity, which is the number most players mean when they share settings. Zoomed, scoped and ADS sensitivity use separate multipliers and field-of-view rules that differ between games, and Overwatch 2 also lets you set a different sensitivity for each hero, which overrides the general one. Convert your general sensitivity here first, then set the scoped multipliers in the new game by feel, starting from the game's default." },
    { q: "Is anything saved or sent when I use the sensitivity converter?", a: "No. The maths runs in your browser and nothing you type is uploaded or stored, so a reload brings back the example. There is no account and no sign-in. The Share result button makes a picture of your answer on your own device: on a phone it opens the share sheet, and on a computer it saves the picture and copies a short message with the page link. Game names are shown as plain text; the page uses no game logos or artwork." },
  ],
};

export const TEAM_NAME_PAGE: Page = {
  slug: "team-name-generator", name: "Team name generator and badge maker", shortName: "team name generator", updated: "2026-11-25",
  title: "Esports team name generator: BGMI, clan names",
  description: "Free esports team name generator for BGMI teams, clans and Valorant or COD squads: original names, stylish versions, a name check and a badge maker.",
  h1: "Esports team name generator for BGMI teams, clans and squads, with a badge maker",
  lead: "Get a team name that is yours. Pick a game (Free Fire guild, BGMI team, Valorant or COD team, clan, or any team) and a theme (animals, weather and elements, Indian words, legends with no gods or religion, or space), and get eight original names made from our own word lists. Turn on stylish versions for fancy letters and symbols, always shown next to the plain name. Or type your own name and check it. Every name, plain or stylish, is checked against game and publisher names, esports organisation names and abusive words. Then make a simple esports logo: a flat badge from a shape, your initials and two colours, downloaded as PNG or SVG. Free, in your browser, no account.",
  intro: "Pick a game and a theme, get eight original team names (with stylish versions if you want them), copy any of them, and download a simple badge with your initials. Free, no account.",
  useHeading: "Name your team",
  benefits: [
    { title: "Names nobody else owns", body: "Names come from our own word lists, and any combination that matches a game, a publisher or an esports organisation we know of is skipped. Your own name gets the same check." },
    { title: "A simple esports logo in seconds", body: "The badge maker is a small esports logo maker: five shapes, four patterns and nine flat colours with your initials on top. No game art, no logos copied from anyone: a clean mark for a WhatsApp group, a jersey mock-up or a team page." },
    { title: "Ready for your team page", body: "Download the badge as a PNG for chats or an SVG that stays sharp at any size, copy the name, and create the team with a free account when you are ready." },
  ],
  steps: [
    "Choose the game the name is for, then a theme, and pick one of the eight names, or press More names for another set.",
    "Tick Show stylish versions for fancy letters and symbols, and press Copy next to any plain or stylish name.",
    "Or tick the box and type your own name to check it.",
    "Choose a shape, a pattern and two colours for the badge.",
    "Download the badge as PNG or SVG, copy the name, and press Create this team to make a free account.",
  ],
  guides: ["tournament-registration-form-fields", "run-a-campus-tournament", "player-id-cards"],
  related: [
    { href: "/tools/free-fire-guild-name/", label: "Free Fire guild name generator", blurb: "The same generator set up for a Free Fire guild: short names, stylish versions on, and guild questions answered." },
    { href: "/tools/bgmi-name-style/", label: "BGMI name style generator", blurb: "A player name, not a team name: stylish letters, symbols and clan tag frames to copy." },
    { href: "/tools/registration/", label: "Registration form", blurb: "Collect team names, captains and players in one form or online link." },
    { href: "/tools/id-cards/", label: "ID card maker", blurb: "Put the new team name and badge on player ID cards with a QR code." },
  ],
  faq: [
    { q: "Where do the team names come from?", a: "From word lists we wrote for this page, split into five themes: animals, weather and elements, Indian words, legends and space. Each name joins a first word and a second word from one theme, for example a colour or mood with an animal. Nothing is copied from existing team lists, and words that are already the names of well-known esports or league teams, such as Falcons, Titans, Outlaws or Dragons, were left out of the lists on purpose so the ideas stay original." },
    { q: "Which names does the generator block, and why?", a: "Three kinds. Names of games, publishers and platforms, such as BGMI, Free Fire, Valorant, Krafton or Garena, because a team should not look like it is run by a game company. Names of esports organisations we know of, such as Team Liquid, S8UL, GodLike or Global Esports, because those names belong to someone. And abusive words and slurs in English and Hindi. The check ignores spaces, accents and look-alike characters, so writing a zero for an o does not get around it." },
    { q: "Can I check a name I already thought of?", a: "Yes. Tick the box for your own name and type it. The page tells you straight away if it uses a game or publisher name, matches an esports organisation or contains an abusive word, and says which of the three it is. If the name is fine you see a tick and the badge uses your name and initials. Names can be 2 to 32 characters long. The check is a helpful filter, not a trademark search: if you plan to register a company or sell merchandise, search the trademark register too." },
    { q: "How do the game presets change the team names?", a: "They change the shape of a name, not the words. Free Fire guild keeps names short and writes some as one word, such as a colour joined to an animal. BGMI team gives squad-style names: two words, Team and a word, a word and Esports, or a word and Squad. Valorant or COD team gives names for a five that read well on a scoreboard, such as a word and Gaming. Clan gives The and two words, a word and Clan, or Order of the and a word. Any team keeps the plain two-word style. The presets are this tool's style choices, not rules from any game, so check that the name fits wherever you type it." },
    { q: "Does the team name generator make stylish names with symbols?", a: "Yes, if you tick Show stylish versions. Each name then gets a second line in bold, small capital or wide Unicode letters, framed by symbols such as curls, stars or corner brackets, with its own Copy button and its length in characters. The plain name always stays next to it, because we could not find a reliable published rule for which symbols or how many characters Free Fire, BGMI or other games accept, and some phones show a symbol they lack as an empty box. Stylish versions are checked against the same blocklist after the fancy letters are turned back into plain ones." },
    { q: "What do the Indian words in the names mean?", a: "The Indian theme mixes everyday Hindi and Mumbai or Delhi words, written in English letters, with team-sounding nouns. When a name uses one, its meaning appears under the badge, for example Bindaas means carefree, Toli means a gang or squad, Toofan is a storm, Bijli is lightning and Baaz is a hawk. The theme avoids gods, religious figures and the names of political groups, so a name works for any campus or community team without taking a side." },
    { q: "Is the badge maker a real esports logo maker?", a: "It is a simple one, and honest about it. The badge is drawn from simple parts: one of five shapes, a pattern, two flat colours and your team's initials in a bold system font. Nothing is taken from game art or other teams' logos, so you can use it for your group chat picture, a printed banner, a team page or an ID card. It is deliberately plain. It will not draw a mascot or an illustrated logo; if you later hire a designer for one, the badge is still useful as a placeholder and a colour guide." },
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

/**
 * The Free Fire guild name page (25 Nov 2026): the team name generator started on the Free Fire guild preset with stylish versions
 * on, plus guild-specific text and questions. Same tool, so it reports as "team-name-generator" in tool_complete.
 */
export const FF_GUILD_PAGE: Page = {
  slug: "free-fire-guild-name", name: "Free Fire guild name generator", shortName: "guild name generator", updated: "2026-11-25",
  title: "Free Fire guild name generator with stylish names",
  description: "Free Fire guild name ideas from our own word lists, with stylish versions next to each plain name, a check against game and org names, and a free guild badge.",
  h1: "Free Fire guild name generator: plain and stylish names",
  lead: "Find a Free Fire guild name that nobody else owns. The generator starts on short guild-style names made from our own word lists, in five themes including Indian words with their meanings, and shows a stylish version of each one in fancy letters and symbols next to the plain name, each with a Copy button. Every name is checked against game and publisher names, esports organisation names and abusive words, after fancy letters are turned back into plain ones. Then make a flat guild badge with your initials and download it. Free, in your browser, no account, nothing saved.",
  intro: "Short guild names from our own word lists, a stylish version next to each plain one, a Copy button for both, and a free guild badge. Check that your pick fits in the game.",
  useHeading: "Find a guild name",
  benefits: [
    { title: "Plain and stylish, side by side", body: "Each name comes in plain letters and in a stylish version (bold, small capital or wide letters with curls, stars or brackets), so you can keep the plain one for forms and points tables." },
    { title: "Checked, even when decorated", body: "Fancy letters are turned back into plain ones before the check, so a stylish name cannot hide a game, publisher or esports organisation name or an abusive word." },
    { title: "A guild badge to go with it", body: "Draw a flat badge from a shape, your initials and two colours, and download it as PNG or SVG for the guild's WhatsApp group, Discord server or tournament sign-up." },
  ],
  steps: [
    "Pick a theme. The Free Fire guild preset and stylish versions are already on.",
    "Choose the letters and symbols for the stylish versions, or press More names for another set.",
    "Press Copy next to the plain or stylish name you like, then paste it into the guild name box in the game and check that it fits.",
    "Make the badge, download it, and keep the plain name for registration forms.",
  ],
  sections: [
    {
      id: "fits", h2: "Will a stylish guild name fit in Free Fire?",
      paras: [
        "We could not confirm it, so the page does not promise it. Garena does not publish a guild name rule that we could check, and guide sites give different character limits for guild names. Some of the fancy letters and symbols on this page are single Unicode characters, but a game can count or display them differently, and a phone without the right font shows an empty box instead.",
        "So the generator shows how many characters each stylish version has and keeps the plain version beside it. Paste the stylish one into the game's guild name box: if the game refuses it or cuts it short, use a shorter name, fewer symbols or the plain name.",
      ],
    },
    {
      id: "tips", h2: "Choosing a guild name your members will use",
      items: [
        "Short names are easier to say in voice chat, read on a points table and type into a registration form.",
        "Keep a plain spelling for tournaments: organisers and referees match names against their list, and symbols make that harder.",
        "Pick a theme the guild shares: a city, a Hindi word you all use, an animal, the weather.",
        "Search the name in quotes before you commit, to see whether another guild or team already uses it.",
        "Use a short tag of two to four letters before each member's in-game name, so the guild is easy to spot in a lobby.",
      ],
      note: "More name ideas and the checks to run before you register are in the [esports team names guide](/guides/esports-team-names-ideas/).",
    },
  ],
  guides: ["free-fire-tournament-organiser", "tournament-registration-form-fields", "run-a-custom-room-tournament"],
  related: [
    { href: "/tools/free-fire-name-style/", label: "Need a player name, not a guild name?", blurb: "The Free Fire name style generator: your own name in stylish letters, symbols and frames, ready to copy." },
    { href: "/tools/team-name-generator/", label: "Team name generator", blurb: "Names for a BGMI team, a Valorant or COD five, a clan or any team, with the same check and badge maker." },
    { href: "/points-table/free-fire/", label: "Free Fire points table", blurb: "Placement and kill points for a Free Fire custom room event, with a picture to share." },
  ],
  faq: [
    { q: "How do I get a Free Fire guild name from this generator?", a: "The page opens on the Free Fire guild preset, which makes short names from our own word lists and writes some as one word, with stylish versions already on. Pick a theme such as animals, Indian words or space, and press More names until one fits your guild. Press Copy next to the plain or the stylish version and paste it into the guild name box in the game. If you already have a name in mind, tick the box for your own name and the page checks it against game, publisher and esports organisation names and abusive words." },
    { q: "Does Free Fire accept stylish guild names with symbols?", a: "We could not confirm what Free Fire accepts. Garena does not publish a guild name rule that we could check, and guide sites disagree about the character limit, so this page claims none. Many players do use fancy letters and symbols in guild and in-game names. The safe way is to paste the stylish version into the guild name box and see whether the game takes it in full. If it is refused or cut short, use fewer symbols, a shorter name or the plain version, which the generator always shows next to the stylish one." },
    { q: "How long should a Free Fire guild name be?", a: "Short. The Free Fire guild preset keeps every idea to 14 characters or fewer, which is a style choice of this tool rather than a rule of the game, because short names are easier to say, type and read on a points table. The game's own limit is not something we could verify, so the page shows how many characters each stylish version has and tells you to check that it fits. Remember that a symbol can look like one character but be counted differently by a game, and decorations on both sides of the name add to its length." },
    { q: "Why can I not use Free Fire, Garena or FF in a guild name here?", a: "Because those are the game's and the publisher's names, and a guild or team named after them looks as if the game company runs it, which some tournaments refuse. The generator blocks the names of games, publishers and platforms, the names of esports organisations we know of, and abusive words in English and Hindi. FF is blocked as a whole word only, so a word that happens to contain those letters is fine. The check ignores spaces, accents, look-alike digits and fancy Unicode letters, so a decorated spelling does not get around it." },
    { q: "Should my guild and my tournament squad use the same name?", a: "They can, and it helps people find you, but keep a plain spelling for tournaments. Registration forms, points tables and referee lists work best with ordinary letters, and an organiser matching names in a custom room has to compare what the room shows with the list. Use the stylish version inside the game where it fits and the plain version everywhere else. If the guild has more than one squad in an event, add a short word or number to each, for example the guild name followed by A and B, and tell the organiser in advance." },
    { q: "What do the Hindi words in the guild name ideas mean?", a: "The Indian words theme uses everyday Hindi and city slang written in English letters, and the meaning of any such word in the chosen name is shown under the badge. Bindaas means carefree, Tez means fast, Toofani means stormy, Jhakaas is Mumbai slang for awesome, Josh means zeal, Aandhi is a dust storm and Tadka is the burst of spices added at the end of cooking. Words joined without a space, as some guild names are, still get their meaning. The theme leaves out gods, religious figures and political names." },
    { q: "Can I make a Free Fire guild logo here?", a: "You can make a simple guild badge: one of five shapes, a pattern, two flat colours and your guild's initials, downloaded as a 1024 by 1024 PNG or as an SVG that stays sharp at any size. It is an image for your guild's WhatsApp group, Discord server, YouTube channel or tournament sign-up, and it does not change anything inside the game. It uses no Free Fire artwork or characters, so it is your own mark. For a mascot or an illustrated logo you would need a designer, and the badge still works as a placeholder." },
    { q: "Is anything saved when I use the guild name generator?", a: "No. Names are made and checked in your browser, the badge is drawn on your device and the downloads are made there too. Nothing is uploaded, there is no account, and a reload starts the page again, so copy the name and download the badge if you want to keep them. When you copy a name, the page only counts that a name was copied, with no name, identifier or cookie, and not at all if your browser sends Do Not Track or Global Privacy Control. Game names on this site are plain text, used only to identify the game." },
  ],
};
