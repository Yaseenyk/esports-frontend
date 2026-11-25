import type { FontSupport } from "@/features/shared/fancy-text";
import type { Frame, Lang, TagStyle } from "@/features/name-style/domain";

/** Every word the name style tool shows, in English and Brazilian Portuguese. The Portuguese page stays noindex until a native reader approves it. */
export const NAME_STYLE_COPY: Record<Lang, {
  nameLabel: string; nameHelp: string; tagToggle: string; tagLabel: string; tagHelp: string; tagGroup: string; frameGroup: string;
  frames: Record<Frame, string>; tagStyles: Record<TagStyle, string>; support: Record<FontSupport, string>; supportNote: string;
  listLabel: string; chars: (n: number) => string; copy: string; copyAria: (s: string) => string; copied: (s: string) => string; copyFail: string; example: string;
}> = {
  en: {
    nameLabel: "Your name", nameHelp: "Letters A to Z and numbers get the fancy styles. Accents and other letters stay as you type them.",
    tagToggle: "Add a clan tag before my name", tagLabel: "Clan tag", tagHelp: "Up to 5 characters, for example your guild or squad short name.", tagGroup: "Tag look",
    frameGroup: "Symbols around the name",
    frames: { none: "None", curl: "꧁ ꧂", mark: "亗", corner: "『 』", star: "★", cross: "乂", crown: "♛", wave: "彡" },
    tagStyles: { bar: "TAG丨Name", corner: "『TAG』Name", dot: "TAG•Name" },
    support: { plain: "Plain letters: work everywhere", common: "Common symbols: most fonts", newer: "Newer fonts only: may show boxes" },
    supportNote: "The labels describe how widely phone fonts draw these characters, not a rule of the game. Paste the style into the game and check how it looks before you confirm.",
    listLabel: "Your name in every style", chars: (n) => `${n} characters`, copy: "Copy", copyAria: (s) => `Copy ${s}`,
    copied: (s) => `Copied: ${s}`, copyFail: "Could not copy here. Select the name and copy it yourself.", example: "Raj",
  },
  "pt-BR": {
    nameLabel: "Seu nome", nameHelp: "As letras de A a Z e os números ganham os estilos. Acentos e outras letras ficam como você digitou.",
    tagToggle: "Colocar a tag do clã antes do nome", tagLabel: "Tag do clã", tagHelp: "Até 5 caracteres, por exemplo a sigla da sua guilda ou do seu esquadrão.", tagGroup: "Formato da tag",
    frameGroup: "Símbolos em volta do nome",
    frames: { none: "Nenhum", curl: "꧁ ꧂", mark: "亗", corner: "『 』", star: "★", cross: "乂", crown: "♛", wave: "彡" },
    tagStyles: { bar: "TAG丨Nome", corner: "『TAG』Nome", dot: "TAG•Nome" },
    support: { plain: "Letras normais: funcionam em todo lugar", common: "Símbolos comuns: a maioria das fontes", newer: "Só fontes novas: podem virar quadrados" },
    supportNote: "Os avisos falam de quantas fontes de celular mostram esses caracteres, não de uma regra do jogo. Cole o estilo no jogo e veja como fica antes de confirmar.",
    listLabel: "Seu nome em todos os estilos", chars: (n) => `${n} caracteres`, copy: "Copiar", copyAria: (s) => `Copiar ${s}`,
    copied: (s) => `Copiado: ${s}`, copyFail: "Não deu para copiar aqui. Selecione o nome e copie você mesmo.", example: "Lucas",
  },
};
