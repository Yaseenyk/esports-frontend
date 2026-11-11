import type { ToolPage } from "@/components/seo/ToolLanding";

/** The words on the public groups-then-knockout tool page. The lead registers it in TOOL_PAGES as "groups". Describes only what the tool really does. */
export const GROUPS_PAGE: ToolPage & { title: string; description: string } = {
  slug: "groups", name: "Groups and knockout tournament maker",
  title: "Groups and knockout tournament maker",
  description: "Free groups and knockout tournament maker: split teams into groups, enter scores, see live group tables, then get a knockout bracket that keeps group mates apart.",
  h1: "Groups and knockout tournament maker",
  lead: "Add your teams and get the format most college fests run: teams are split into groups, everyone plays their group once, and the best teams of every group go through to a knockout bracket. Enter the group scores and the tables update by themselves, then tap the winners of the knockout. Free, no account, and it runs in your browser.",
  useHeading: "Make your groups and knockout",
  benefits: [
    { title: "Even groups, spread by pots", body: "Teams are split into 2 to 8 groups whose sizes differ by at most one. List your best teams first and turn on pots, and the strongest teams are spread across the groups." },
    { title: "Tables that follow the rules", body: "A win gives 3 points, a draw 1 and a loss 0. Ties are broken by score difference, then scores for, then head-to-head, then team name, and the order is explained under every table." },
    { title: "A knockout that avoids repeat matches", body: "The best teams of each group go through, and the bracket is drawn so teams from the same group do not meet in the first round when that can be avoided. Odd numbers get byes." },
  ],
  steps: [
    "Add your teams, one per line, between 4 and 64.",
    "Choose how many groups and how many go through from each. Good numbers are already filled in.",
    "Enter the group scores as matches finish and watch every group table update.",
    "Look at the knockout bracket and tap the winner of each match to move them on.",
    "Optional: show the bracket or the group tables full screen on a TV or stream.",
  ],
  guides: ["choosing-a-tournament-format", "run-a-campus-tournament", "esports-tournament-rules-template", "round-robin-schedule", "tournament-bracket-template", "football-cricket-tournament-maker"],
  faq: [
    { q: "How does a groups and knockout tournament work?", a: "The teams are split into groups, and inside a group every team plays every other team once, like a small league. The group tables rank the teams by points. Then the best teams of each group, usually the top two, go through to a knockout bracket where you lose once and you are out. The knockout ends with a final and one champion. It is the format of most college fests and many football and cricket events, because every team plays several matches but the final days stay short." },
    { q: "How many groups should I make for my teams?", a: "A good size is four teams per group, because each team then plays three matches. The tool starts with that: 16 teams give 4 groups, 12 teams give 3 groups and 8 teams give 2 groups. You can choose anything from 2 to 8 groups, as long as each group keeps at least two teams. More groups means fewer group matches but more of the field going into the knockout. Check the match count in step 3 against the hours you have on the day." },
    { q: "What happens when the teams do not split evenly?", a: "The groups differ by at most one team. For 10 teams in 4 groups you get two groups of three and two groups of two. Smaller groups play fewer matches, which is the usual compromise, and the tables show matches played so nobody is confused. A group with an odd number of teams has one team free in each round. If that feels unfair for your event, change the number of teams or groups until the split is even." },
    { q: "How are teams ranked inside a group?", a: "By points first: 3 for a win, 1 for a draw, 0 for a loss. If teams are level on points, the order goes to score difference (scores made minus scores conceded), then to scores for. If they are still level, the matches between only those teams decide, which is called head-to-head. The last tie-break is the team name, so the table never changes between viewings. These rules are written under every table. If your rulebook is different, tell your teams in advance." },
    { q: "Can teams from the same group meet in the first knockout round?", a: "The tool avoids it whenever that is possible. After the standard seeding, which puts group winners against runners-up, it checks the first round and swaps teams of similar rank until no match is between two teams of one group. With two groups and the top two through, that gives the familiar A1 against B2 and B1 against A2. In rare setups, for example one group providing most of the teams that play in round 1, it cannot be avoided, and the tool tells you." },
    { q: "What if the number of teams going through is not a power of two?", a: "Some teams get a bye, which means they go straight to the next round without playing. With 6 teams in the knockout, the two best seeds get a bye and the other four play a first round. The byes go to the best group winners, so finishing first in a group has a real reward. The bracket shows byes as names already waiting in round 2, and no match is ever shown against an empty seat." },
    { q: "Can the best third-placed teams also go through?", a: "Yes, under More options. If your groups have enough teams, you can let the best few of the teams that finished just below the cut also go through. They are compared across groups on points, then score difference, then scores for. This is useful with three or five groups, where taking only the top two would leave an awkward bracket. It is fairest when the groups have the same size, because a team in a bigger group has played more matches." },
    { q: "Is my data saved, and can I show the result on a TV?", a: "Nothing is uploaded. The groups, tables and bracket are worked out in your browser, so a reload brings back the example teams. Keep your list in your notes if you need it again. Step 5 opens a full-screen view of the bracket or the group tables for a venue TV, a projector or a stream, and it updates while both windows stay open. To save the matches online and enter results from phones, make a free account and use the groups panel of an event." },
  ],
};
