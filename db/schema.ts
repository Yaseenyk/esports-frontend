/**
 * SUPERSEDED (15 Nov 2026): the owner chose the existing free D1 (ADR-1, option A). The live v3 schema is in ../esports-backend/src/v3/.
 * This file is the original PostgreSQL design, kept as the LOGICAL reference. Do not build on it.
 *
 * Esports ecosystem: Drizzle ORM schema (PostgreSQL). Phase 0 CONTRACT, not wired to anything yet.
 *
 * Status: DRAFT v0, 15 Nov 2026. Human-readable contract with rules and the mapping to the live D1 tables:
 * docs/ecosystem/v3/DATA_CONTRACT.md. Change this file and that document in the same change.
 *
 * Layer: Trinity layer 3 (Data). Only repositories import this file. Services and routes never import tables.
 * Not type-checked by Next: `db` is excluded in tsconfig.json until drizzle-orm is installed (Phase 1).
 *
 * Conventions
 *  - Primary keys are uuid (gen_random_uuid()); public URLs use a unique `slug`, never the uuid.
 *  - Timestamps are timestamptz in UTC. Every mutable table has created_at and updated_at.
 *  - Soft delete (deleted_at) only where a person asks to be removed (users, teams); results are never deleted.
 *  - NO money columns. Entry fees and prizes are out of scope until a lawyer signs off (see docs/ecosystem/legal-checklist.md).
 *  - NO date of birth, Aadhaar or government id anywhere. Users are 18+ (adult_confirmed_at).
 *  - Enums are Postgres enums so an invalid state cannot be written; add a value with a migration, never with code.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ enums */

export const gameEnum = pgEnum("game", [
  "bgmi",
  "free_fire",
  "valorant",
  "cod_mobile",
  "cs2",
  "other",
]);
/** Roles a player can play. IGL = in-game leader. */
export const playerRoleEnum = pgEnum("player_role", [
  "igl",
  "assaulter",
  "support",
  "sniper",
  "scout",
  "entry",
  "flex",
  "controller",
  "duelist",
  "initiator",
  "sentinel",
  "coach",
  "manager",
  "substitute",
]);
/** Role on a team roster (membership), distinct from the in-game role. */
export const teamRankEnum = pgEnum("team_member_rank", ["captain", "member", "substitute", "coach", "manager"]);
export const userRoleEnum = pgEnum("user_role", ["player", "organiser", "moderator"]);
export const orgKindEnum = pgEnum("organisation_kind", ["college", "club", "community", "company"]);
export const visibilityEnum = pgEnum("visibility", ["private", "unlisted", "public"]);

export const tournamentFormatEnum = pgEnum("tournament_format", [
  "battle_royale_points",
  "single_elimination",
  "double_elimination",
  "round_robin",
  "swiss",
]);
export const tournamentStatusEnum = pgEnum("tournament_status", [
  "draft",
  "published",
  "registration_open",
  "registration_closed",
  "live",
  "completed",
  "cancelled",
]);
export const venueEnum = pgEnum("venue_type", ["online", "offline", "hybrid"]);
export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "approved",
  "rejected",
  "waitlisted",
  "withdrawn",
  "disqualified",
]);
export const matchStatusEnum = pgEnum("match_status", ["scheduled", "live", "completed", "forfeit", "cancelled"]);
export const resultSourceEnum = pgEnum("result_source", ["organiser", "team_report", "dispute_resolution", "import"]);

export const lftKindEnum = pgEnum("lft_kind", [
  "looking_for_team", // a player posts their resume
  "looking_for_player", // a team posts a roster requirement
]);
export const lftStatusEnum = pgEnum("lft_status", ["open", "filled", "closed", "expired", "removed"]);
export const applicationStatusEnum = pgEnum("lft_application_status", ["sent", "accepted", "declined", "withdrawn"]);

export const disputeTypeEnum = pgEnum("dispute_type", [
  "tie_breaker",
  "wrong_score",
  "cheating_claim",
  "no_show",
  "roster_violation",
  "other",
]);
export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "evidence_requested",
  "under_review",
  "resolved",
  "rejected",
  "escalated",
  "withdrawn",
]);
export const disputeOutcomeEnum = pgEnum("dispute_outcome", [
  "upheld",
  "partially_upheld",
  "rejected",
  "no_action",
]);

export const outboxKindEnum = pgEnum("discord_job_kind", [
  "create_team_channel",
  "assign_team_role",
  "ping_lobby",
  "post_result",
  "archive_channels",
]);
export const outboxStatusEnum = pgEnum("discord_job_status", ["pending", "running", "done", "failed", "dead"]);

/* ------------------------------------------------------------------ shared columns */

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/* ------------------------------------------------------------------ people */

export const users = pgTable(
  "users",
  {
    id: id(),
    /** Canonicalised (lowercased, trimmed) by the service layer before write. */
    email: varchar("email", { length: 254 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    /** Null for Google-only accounts. Never leaves the Data layer. */
    passwordHash: text("password_hash"),
    googleSub: varchar("google_sub", { length: 64 }),
    displayName: varchar("display_name", { length: 60 }).notNull(),
    role: userRoleEnum("role").notNull().default("player"),
    /** Timestamp of the 18+ confirmation. Required before a profile, listing or registration can be public. */
    adultConfirmedAt: timestamp("adult_confirmed_at", { withTimezone: true }),
    discordUserId: varchar("discord_user_id", { length: 32 }),
    /** What the user consented to show on the public Esports Resume. Default is nothing. */
    resumeConsentAt: timestamp("resume_consent_at", { withTimezone: true }),
    locale: varchar("locale", { length: 8 }).notNull().default("en"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("users_email_uq").on(t.email),
    uniqueIndex("users_google_sub_uq").on(t.googleSub).where(sql`${t.googleSub} is not null`),
    uniqueIndex("users_discord_uq").on(t.discordUserId).where(sql`${t.discordUserId} is not null`),
  ],
);

/** A college, club, community or company that hosts tournaments. Pages exist only once it hosts a real one. */
export const organisations = pgTable(
  "organisations",
  {
    id: id(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    kind: orgKindEnum("kind").notNull(),
    city: varchar("city", { length: 60 }),
    state: varchar("state", { length: 60 }),
    /** An organiser from the college confirmed this; unlocks the public college page. */
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("organisations_slug_uq").on(t.slug), index("organisations_city_idx").on(t.state, t.city)],
);

export const organisationMembers = pgTable(
  "organisation_members",
  {
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** owner can do everything, manager runs tournaments, moderator resolves disputes. */
    orgRole: varchar("org_role", { length: 16 }).notNull().default("manager"),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.organisationId, t.userId] }),
    check("organisation_members_role_ck", sql`${t.orgRole} in ('owner','manager','moderator')`),
  ],
);

/* ------------------------------------------------------------------ Esports Resume */

/** One row per user who has a profile. The resume page is built from this plus derived stats; see player_stats. */
export const playerProfiles = pgTable(
  "player_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 60 }).notNull(),
    handle: varchar("handle", { length: 40 }).notNull(),
    bio: varchar("bio", { length: 400 }),
    organisationId: uuid("organisation_id").references(() => organisations.id, { onDelete: "set null" }),
    city: varchar("city", { length: 60 }),
    state: varchar("state", { length: 60 }),
    languages: text("languages").array().notNull().default(sql`'{}'::text[]`),
    /** private by default. public needs users.resume_consent_at and adult_confirmed_at: a cross-table rule, so the service layer enforces it. */
    visibility: visibilityEnum("visibility").notNull().default("private"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("player_profiles_slug_uq").on(t.slug), index("player_profiles_visibility_idx").on(t.visibility)],
);

/** The games a player plays and how: in-game id, rank, roles. One row per player per game. */
export const playerGames = pgTable(
  "player_games",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    game: gameEnum("game").notNull(),
    inGameName: varchar("in_game_name", { length: 40 }).notNull(),
    /** Store the game's own tier code ("diamond_3", "ace"), compared via the rank ladder in the Logic layer. */
    rankCode: varchar("rank_code", { length: 24 }),
    /** 0 is the lowest rung of that game's ladder. Lets the board filter by range without parsing names. */
    rankOrdinal: smallint("rank_ordinal"),
    roles: playerRoleEnum("roles").array().notNull().default(sql`'{}'::player_role[]`),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.game] }), index("player_games_filter_idx").on(t.game, t.rankOrdinal)],
);

/**
 * Cached aggregates for the Esports Resume. Derived from match_results and player_match_stats; rebuilt by a job,
 * never edited by hand. A missing row means "no results yet", and the resume then shows no stats.
 */
export const playerStats = pgTable(
  "player_stats",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    game: gameEnum("game").notNull(),
    tournamentsPlayed: integer("tournaments_played").notNull().default(0),
    matchesPlayed: integer("matches_played").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    podiums: integer("podiums").notNull().default(0),
    kills: integer("kills").notNull().default(0),
    deaths: integer("deaths").notNull().default(0),
    bestPlacement: smallint("best_placement"),
    rebuiltAt: timestamp("rebuilt_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.game] })],
);

/* ------------------------------------------------------------------ teams */

export const teams = pgTable(
  "teams",
  {
    id: id(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 60 }).notNull(),
    tag: varchar("tag", { length: 6 }),
    game: gameEnum("game").notNull(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id),
    organisationId: uuid("organisation_id").references(() => organisations.id, { onDelete: "set null" }),
    logoKey: text("logo_key"),
    visibility: visibilityEnum("visibility").notNull().default("unlisted"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("teams_slug_uq").on(t.slug), index("teams_owner_idx").on(t.ownerUserId), index("teams_game_idx").on(t.game)],
);

export const teamMembers = pgTable(
  "team_members",
  {
    id: id(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rank: teamRankEnum("rank").notNull().default("member"),
    /** The role they play in-game for this team. */
    playerRole: playerRoleEnum("player_role"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (t) => [
    // A person is on a team once at a time; history is kept as closed rows (left_at set).
    uniqueIndex("team_members_active_uq").on(t.teamId, t.userId).where(sql`${t.leftAt} is null`),
    index("team_members_user_idx").on(t.userId),
  ],
);

/* ------------------------------------------------------------------ tournaments */

export const tournaments = pgTable(
  "tournaments",
  {
    id: id(),
    /** URL: /tournaments/<slug>/. Stable once published; renames keep the slug. */
    slug: varchar("slug", { length: 100 }).notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    game: gameEnum("game").notNull(),
    format: tournamentFormatEnum("format").notNull(),
    status: tournamentStatusEnum("status").notNull().default("draft"),
    organiserUserId: uuid("organiser_user_id")
      .notNull()
      .references(() => users.id),
    organisationId: uuid("organisation_id").references(() => organisations.id, { onDelete: "set null" }),
    venue: venueEnum("venue").notNull().default("online"),
    city: varchar("city", { length: 60 }),
    state: varchar("state", { length: 60 }),
    summary: varchar("summary", { length: 300 }),
    /** Markdown. The public page needs real text here; see seo_ready. */
    description: text("description"),
    rules: text("rules"),
    teamSizeMin: smallint("team_size_min").notNull().default(1),
    teamSizeMax: smallint("team_size_max").notNull().default(4),
    maxTeams: smallint("max_teams"),
    registrationOpensAt: timestamp("registration_opens_at", { withTimezone: true }),
    registrationClosesAt: timestamp("registration_closes_at", { withTimezone: true }),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    /** Discord server this tournament runs in; null means no bot automation. */
    discordGuildId: varchar("discord_guild_id", { length: 32 }),
    discordCategoryId: varchar("discord_category_id", { length: 32 }),
    /**
     * pSEO gate. The static export only emits an indexable page when a build step has checked the page has enough unique content
     * (see docs/ecosystem/v3/README.md, "Thin-page guard"). False means the page exists for sharing but is noindex and not in the sitemap.
     */
    seoReady: boolean("seo_ready").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("tournaments_slug_uq").on(t.slug),
    index("tournaments_status_start_idx").on(t.status, t.startsAt),
    index("tournaments_game_idx").on(t.game, t.startsAt),
    index("tournaments_org_idx").on(t.organisationId),
    check("tournaments_team_size_ck", sql`${t.teamSizeMin} >= 1 and ${t.teamSizeMax} >= ${t.teamSizeMin}`),
    check("tournaments_dates_ck", sql`${t.endsAt} is null or ${t.startsAt} is null or ${t.endsAt} >= ${t.startsAt}`),
  ],
);

export const tournamentRegistrations = pgTable(
  "tournament_registrations",
  {
    id: id(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id),
    registeredByUserId: uuid("registered_by_user_id")
      .notNull()
      .references(() => users.id),
    status: registrationStatusEnum("status").notNull().default("pending"),
    seed: smallint("seed"),
    groupLabel: varchar("group_label", { length: 8 }),
    /** Roster as it stood at registration: [{ userId, playerRole }]. Later roster changes do not rewrite history. */
    rosterSnapshot: jsonb("roster_snapshot").notNull().default(sql`'[]'::jsonb`),
    discordChannelId: varchar("discord_channel_id", { length: 32 }),
    discordRoleId: varchar("discord_role_id", { length: 32 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("registrations_tournament_team_uq").on(t.tournamentId, t.teamId),
    index("registrations_status_idx").on(t.tournamentId, t.status),
  ],
);

/* ------------------------------------------------------------------ matches and results */

export const matches = pgTable(
  "matches",
  {
    id: id(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    roundLabel: varchar("round_label", { length: 40 }).notNull(),
    groupLabel: varchar("group_label", { length: 8 }),
    matchNo: smallint("match_no").notNull(),
    status: matchStatusEnum("status").notNull().default("scheduled"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    mapName: varchar("map_name", { length: 40 }),
    /** Room id and password. AES-GCM ciphertext written by the Data layer; never logged, never in a public payload. */
    lobbyCiphertext: text("lobby_ciphertext"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("matches_tournament_no_uq").on(t.tournamentId, t.roundLabel, t.matchNo),
    index("matches_schedule_idx").on(t.tournamentId, t.scheduledAt),
  ],
);

/**
 * One row per team per match. Battle-royale games fill placement, kills and points. Head-to-head games fill score_for and
 * score_against. The service layer decides which set a tournament format uses; the check below stops a row with neither.
 */
export const matchResults = pgTable(
  "match_results",
  {
    id: id(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => tournamentRegistrations.id),
    placement: smallint("placement"),
    kills: smallint("kills"),
    points: numeric("points", { precision: 7, scale: 2 }),
    scoreFor: smallint("score_for"),
    scoreAgainst: smallint("score_against"),
    isWinner: boolean("is_winner"),
    source: resultSourceEnum("source").notNull().default("organiser"),
    /** A moderator or organiser confirmed it. Only verified rows count toward the Esports Resume and standings. */
    verifiedByUserId: uuid("verified_by_user_id").references(() => users.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    /** Set when a dispute replaced the original row; the old row stays for the audit trail. */
    supersededByDisputeId: uuid("superseded_by_dispute_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("match_results_match_reg_uq")
      .on(t.matchId, t.registrationId)
      .where(sql`${t.supersededByDisputeId} is null`),
    index("match_results_registration_idx").on(t.registrationId),
    check("match_results_has_outcome_ck", sql`${t.placement} is not null or ${t.scoreFor} is not null`),
  ],
);

/** Per-player numbers for a result, so the Esports Resume can show a person's own kills, not their team's. */
export const playerMatchStats = pgTable(
  "player_match_stats",
  {
    matchResultId: uuid("match_result_id")
      .notNull()
      .references(() => matchResults.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kills: smallint("kills"),
    deaths: smallint("deaths"),
    assists: smallint("assists"),
    damage: integer("damage"),
    /** Game-specific extras (agent, weapon, survival time) kept out of the typed columns. */
    extra: jsonb("extra"),
  },
  (t) => [primaryKey({ columns: [t.matchResultId, t.userId] }), index("player_match_stats_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ LFT / LFP board */

export const lftListings = pgTable(
  "lft_listings",
  {
    id: id(),
    kind: lftKindEnum("kind").notNull(),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Set for looking_for_player: which team is recruiting. Null for a player's own listing. */
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
    game: gameEnum("game").notNull(),
    /** Roles the player plays (looking_for_team) or the team needs (looking_for_player). */
    roles: playerRoleEnum("roles").array().notNull().default(sql`'{}'::player_role[]`),
    rankMinOrdinal: smallint("rank_min_ordinal"),
    rankMaxOrdinal: smallint("rank_max_ordinal"),
    state: varchar("state", { length: 60 }),
    city: varchar("city", { length: 60 }),
    onlineOk: boolean("online_ok").notNull().default(true),
    organisationId: uuid("organisation_id").references(() => organisations.id, { onDelete: "set null" }),
    languages: text("languages").array().notNull().default(sql`'{}'::text[]`),
    /** Plain text, 600 characters. No links, no phone numbers; the service layer rejects them. */
    message: varchar("message", { length: 600 }).notNull(),
    status: lftStatusEnum("status").notNull().default("open"),
    /** Listings expire so the board does not fill with dead posts. */
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastBumpedAt: timestamp("last_bumped_at", { withTimezone: true }).notNull().defaultNow(),
    reportCount: smallint("report_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("lft_board_idx").on(t.status, t.game, t.kind, t.lastBumpedAt),
    index("lft_author_idx").on(t.authorUserId),
    index("lft_location_idx").on(t.game, t.state, t.city),
    check("lft_team_kind_ck", sql`(${t.kind} = 'looking_for_player') = (${t.teamId} is not null)`),
    check("lft_rank_range_ck", sql`${t.rankMinOrdinal} is null or ${t.rankMaxOrdinal} is null or ${t.rankMaxOrdinal} >= ${t.rankMinOrdinal}`),
  ],
);

export const lftApplications = pgTable(
  "lft_applications",
  {
    id: id(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => lftListings.id, { onDelete: "cascade" }),
    applicantUserId: uuid("applicant_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: varchar("message", { length: 400 }),
    status: applicationStatusEnum("status").notNull().default("sent"),
    /** Contact (Discord handle) is revealed to the other side only after accept. */
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("lft_applications_once_uq").on(t.listingId, t.applicantUserId), index("lft_applications_applicant_idx").on(t.applicantUserId)],
);

/* ------------------------------------------------------------------ disputes */

export const disputes = pgTable(
  "disputes",
  {
    id: id(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    matchId: uuid("match_id").references(() => matches.id, { onDelete: "set null" }),
    type: disputeTypeEnum("type").notNull(),
    status: disputeStatusEnum("status").notNull().default("open"),
    raisedByUserId: uuid("raised_by_user_id")
      .notNull()
      .references(() => users.id),
    raisedByRegistrationId: uuid("raised_by_registration_id")
      .notNull()
      .references(() => tournamentRegistrations.id),
    /** The team the claim is about; null for general disputes (wrong score, tie-breaker). */
    againstRegistrationId: uuid("against_registration_id").references(() => tournamentRegistrations.id),
    summary: varchar("summary", { length: 1000 }).notNull(),
    outcome: disputeOutcomeEnum("outcome"),
    resolutionNote: varchar("resolution_note", { length: 1000 }),
    resolvedByUserId: uuid("resolved_by_user_id").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    /** Organisers promise an answer by this time; the dashboard flags overdue ones. */
    dueAt: timestamp("due_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("disputes_queue_idx").on(t.tournamentId, t.status, t.dueAt),
    index("disputes_raised_by_idx").on(t.raisedByUserId),
    check("disputes_resolved_ck", sql`(${t.status} in ('resolved','rejected')) = (${t.resolvedAt} is not null)`),
  ],
);

/** Screenshots and clips. The file lives in object storage (R2); only its key and fingerprint are stored here. */
export const disputeEvidence = pgTable(
  "dispute_evidence",
  {
    id: id(),
    disputeId: uuid("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id),
    storageKey: text("storage_key").notNull(),
    mimeType: varchar("mime_type", { length: 40 }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    /** SHA-256 of the stored file. Two uploads of the same image are detectable, and a swapped file is. */
    sha256: varchar("sha256", { length: 64 }).notNull(),
    caption: varchar("caption", { length: 200 }),
    /** Evidence is deleted from storage this long after resolution (data minimisation); the row stays with purged_at set. */
    purgeAfter: timestamp("purge_after", { withTimezone: true }),
    purgedAt: timestamp("purged_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("dispute_evidence_dispute_idx").on(t.disputeId),
    uniqueIndex("dispute_evidence_hash_uq").on(t.disputeId, t.sha256),
    check("dispute_evidence_mime_ck", sql`${t.mimeType} in ('image/png','image/jpeg','image/webp')`),
    check("dispute_evidence_size_ck", sql`${t.sizeBytes} > 0 and ${t.sizeBytes} <= 5242880`),
  ],
);

/** Append-only history of a dispute: who did what, and the status change. Never updated or deleted. */
export const disputeEvents = pgTable(
  "dispute_events",
  {
    id: id(),
    disputeId: uuid("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    action: varchar("action", { length: 32 }).notNull(),
    fromStatus: disputeStatusEnum("from_status"),
    toStatus: disputeStatusEnum("to_status"),
    note: varchar("note", { length: 1000 }),
    createdAt: createdAt(),
  },
  (t) => [index("dispute_events_dispute_idx").on(t.disputeId, t.createdAt)],
);

/* ------------------------------------------------------------------ Discord */

/** A Discord server the bot is installed in, and who installed it. */
export const discordGuilds = pgTable(
  "discord_guilds",
  {
    guildId: varchar("guild_id", { length: 32 }).primaryKey(),
    organisationId: uuid("organisation_id").references(() => organisations.id, { onDelete: "set null" }),
    installedByUserId: uuid("installed_by_user_id")
      .notNull()
      .references(() => users.id),
    /** The bot checked it has Manage Channels and Manage Roles; false disables automation for that server. */
    permissionsOk: boolean("permissions_ok").notNull().default(false),
    installedAt: timestamp("installed_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

/**
 * Outbox for bot actions. The web app writes a job in the same transaction as the change (registration approved);
 * a scheduled worker drains it. This keeps channel creation retryable and idempotent, and the bot never needs a gateway connection.
 */
export const discordOutbox = pgTable(
  "discord_outbox",
  {
    id: id(),
    kind: outboxKindEnum("kind").notNull(),
    guildId: varchar("guild_id", { length: 32 }).notNull(),
    payload: jsonb("payload").notNull(),
    /** For example "create_team_channel:<registration_id>". A repeat write is ignored, so a retry cannot make two channels. */
    idempotencyKey: varchar("idempotency_key", { length: 120 }).notNull(),
    status: outboxStatusEnum("status").notNull().default("pending"),
    attempts: smallint("attempts").notNull().default(0),
    runAfter: timestamp("run_after", { withTimezone: true }).notNull().defaultNow(),
    lastError: varchar("last_error", { length: 300 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("discord_outbox_key_uq").on(t.idempotencyKey), index("discord_outbox_due_idx").on(t.status, t.runAfter)],
);
