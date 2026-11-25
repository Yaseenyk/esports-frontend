import { BLOCK_WORDS, NAME_MAX, NAME_MIN, checkName, type BlockReason, type Frame, type Letters, type Pattern, type Preset, type Shape, type Theme } from "@/features/team-name/domain";
import type { UiLang } from "@/lib/pt-br";

/**
 * Every word the team name and badge tool shows, in English and Brazilian Portuguese. English is the default everywhere; only the
 * Portuguese guild name page passes "pt-BR", and it stays noindex until a native reader approves it. The Indian words theme is left out
 * of the Portuguese page (its meanings are explained in English).
 */
export interface TeamNameCopy {
  presets: Record<Preset, { label: string; hint: string }>;
  themes: Record<Theme, string>;
  letters: Record<Letters, string>;
  frames: Record<Frame, string>;
  shapes: Record<Shape, string>;
  patterns: Record<Pattern, string>;
  colours: Record<string, string>;
  block: Record<BlockReason, string>;
  tooShort: string; tooLong: string;
  step1: string; game: string; theme: string; showStylish: string; lettersLabel: string; symbolsLabel: string; styleNote: string; listLabel: string;
  copy: string; copyAria: (n: string) => string; copyStylishAria: (n: string) => string; characters: string; more: string;
  own: string; ownLabel: string; ownHelp: string; ownOk: string;
  step2: string; shape: string; pattern: string; main: string; second: string; badgeAlt: (n: string) => string; noBadge: string; noName: string;
  step3: string; png: string; svg: string; copyName: string; create: string; createNote: string;
  savedSvg: string; savedPng: string; saveFail: string; copied: (t: string) => string; copyFail: string;
}

const EN: TeamNameCopy = {
  presets: {
    general: { label: "Any team", hint: "Two words from the theme, for any game or sport." },
    "ff-guild": { label: "Free Fire guild", hint: "Short names, some written as one word, for a guild or a squad." },
    "bgmi-team": { label: "BGMI team", hint: "Squad-style names: two words, Team ..., ... Esports or ... Squad." },
    "pc-team": { label: "Valorant or COD team", hint: "Names for a team of five that read well on a scoreboard." },
    clan: { label: "Clan", hint: "Clan-style names: The ..., ... Clan or Order of the ..." },
  },
  themes: { animals: "Animals", elements: "Weather and elements", indian: "Indian words", legends: "Legends (no gods or religion)", space: "Space" },
  letters: { plain: "Plain letters", bold: "Bold letters", smallcaps: "Small capitals", wide: "Wide letters" },
  frames: { none: "No symbols", curl: "Curls ꧁ ꧂", stars: "Stars ★", corner: "Brackets 『 』", mark: "Mark 亗" },
  shapes: { shield: "Shield", hexagon: "Hexagon", circle: "Circle", diamond: "Diamond", square: "Rounded square" },
  patterns: { plain: "Plain", band: "Band", split: "Split", ring: "Ring" },
  colours: { cyan: "Cyan", violet: "Violet", red: "Red", amber: "Amber", green: "Green", blue: "Blue", slate: "Slate", ink: "Black", white: "White" },
  block: BLOCK_WORDS,
  tooShort: `Type at least ${NAME_MIN} characters.`, tooLong: `Keep it to ${NAME_MAX} characters.`,
  step1: "1. Pick a game, a theme and a name", game: "Game", theme: "Theme", showStylish: "Show stylish versions (fancy letters and symbols)", lettersLabel: "Letters", symbolsLabel: "Symbols",
  styleNote: "Check it fits in the game before you use it. We could not find a reliable published rule for which symbols or how many characters Free Fire, BGMI or other games accept in a guild or team name, so the plain name stays next to every stylish one. Some phones show a symbol they do not have as an empty box.",
  listLabel: "Name ideas", copy: "Copy", copyAria: (n) => `Copy ${n}`, copyStylishAria: (n) => `Copy the stylish version of ${n}`, characters: "characters", more: "More names",
  own: "I have my own name: check it and use it", ownLabel: "Your team name", ownHelp: `Up to ${NAME_MAX} characters. It is checked against game, publisher and esports organisation names and abusive words.`, ownOk: "That name is fine to use.",
  step2: "2. Make the badge", shape: "Shape", pattern: "Pattern", main: "Main colour", second: "Second colour", badgeAlt: (n) => `Badge for ${n}`, noBadge: "Choose or type a name to see the badge.", noName: "No name yet",
  step3: "3. Download it, or create the team", png: "Download PNG", svg: "Download SVG", copyName: "Copy the name", create: "Create this team",
  createNote: "Create this team opens the free sign-up. The name is not sent or saved anywhere, so copy it first and type it in when you make your team page.",
  savedSvg: "Badge saved as SVG.", savedPng: "Badge saved as PNG (1024 x 1024).", saveFail: "The badge could not be saved.", copied: (t) => `Copied: ${t}`, copyFail: "Could not copy here. Select the name and copy it yourself.",
};

const PT: TeamNameCopy = {
  presets: {
    general: { label: "Qualquer time", hint: "Duas palavras do tema, para qualquer jogo ou esporte." },
    "ff-guild": { label: "Guilda de Free Fire", hint: "Nomes curtos, alguns escritos como uma palavra só, para uma guilda ou um esquadrão." },
    "bgmi-team": { label: "Time de BGMI", hint: "Nomes de esquadrão: duas palavras, Team ..., ... Esports ou ... Squad." },
    "pc-team": { label: "Time de Valorant ou COD", hint: "Nomes para um time de cinco que ficam bem no placar." },
    clan: { label: "Clã", hint: "Nomes de clã: The ..., ... Clan ou Order of the ..." },
  },
  themes: { animals: "Animais", elements: "Clima e elementos", indian: "Palavras indianas", legends: "Lendas (sem deuses nem religião)", space: "Espaço" },
  letters: { plain: "Letras normais", bold: "Letras em negrito", smallcaps: "Versalete", wide: "Letras largas" },
  frames: { none: "Sem símbolos", curl: "Arabescos ꧁ ꧂", stars: "Estrelas ★", corner: "Colchetes 『 』", mark: "Marca 亗" },
  shapes: { shield: "Escudo", hexagon: "Hexágono", circle: "Círculo", diamond: "Losango", square: "Quadrado arredondado" },
  patterns: { plain: "Liso", band: "Faixa", split: "Dividido", ring: "Anel" },
  colours: { cyan: "Ciano", violet: "Violeta", red: "Vermelho", amber: "Âmbar", green: "Verde", blue: "Azul", slate: "Ardósia", ink: "Preto", white: "Branco" },
  block: {
    game: "O nome usa o nome de um jogo, de uma publicadora ou de uma plataforma. Times não podem usar esses nomes.",
    org: "O nome é igual ao de uma organização de esports que já existe. Escolha um nome seu.",
    slur: "O nome tem uma palavra ofensiva ou de ódio. Escolha outro nome.",
  },
  tooShort: `Digite pelo menos ${NAME_MIN} caracteres.`, tooLong: `Use até ${NAME_MAX} caracteres.`,
  step1: "1. Escolha o jogo, o tema e um nome", game: "Jogo", theme: "Tema", showStylish: "Mostrar versões estilosas (letras diferentes e símbolos)", lettersLabel: "Letras", symbolsLabel: "Símbolos",
  styleNote: "Confira se cabe no jogo antes de usar. Não encontramos uma regra publicada e confiável sobre quais símbolos ou quantos caracteres o Free Fire, o BGMI ou outros jogos aceitam no nome de uma guilda ou de um time, então o nome normal fica ao lado de cada versão estilosa. Alguns celulares mostram como quadrado o símbolo que não têm.",
  listLabel: "Ideias de nome", copy: "Copiar", copyAria: (n) => `Copiar ${n}`, copyStylishAria: (n) => `Copiar a versão estilosa de ${n}`, characters: "caracteres", more: "Mais nomes",
  own: "Já tenho um nome: checar e usar", ownLabel: "O nome do seu time", ownHelp: `Até ${NAME_MAX} caracteres. Ele é checado contra nomes de jogos, publicadoras e organizações de esports e palavras ofensivas.`, ownOk: "Esse nome pode ser usado.",
  step2: "2. Faça o emblema", shape: "Forma", pattern: "Padrão", main: "Cor principal", second: "Segunda cor", badgeAlt: (n) => `Emblema de ${n}`, noBadge: "Escolha ou digite um nome para ver o emblema.", noName: "Nenhum nome ainda",
  step3: "3. Baixe ou crie o time", png: "Baixar PNG", svg: "Baixar SVG", copyName: "Copiar o nome", create: "Criar este time",
  createNote: "Criar este time abre o cadastro grátis (em inglês). O nome não é enviado nem salvo, então copie antes e digite quando criar a página do time.",
  savedSvg: "Emblema salvo em SVG.", savedPng: "Emblema salvo em PNG (1024 x 1024).", saveFail: "Não foi possível salvar o emblema.", copied: (t) => `Copiado: ${t}`, copyFail: "Não deu para copiar aqui. Selecione o nome e copie você mesmo.",
};

export const teamNameCopy = (lang: UiLang = "en"): TeamNameCopy => (lang === "pt-BR" ? PT : EN);

/** Why a typed name cannot be used, in the page's language, or undefined when it is fine. Same rules as nameProblem in domain.ts. */
export function nameProblemIn(name: string, lang: UiLang = "en"): string | undefined {
  const c = teamNameCopy(lang), n = name.replace(/\s+/g, " ").trim();
  if (Array.from(n).length < NAME_MIN) return c.tooShort;
  if (Array.from(n).length > NAME_MAX) return c.tooLong;
  const r = checkName(n);
  return r.blocked ? c.block[r.reason!] : undefined;
}
