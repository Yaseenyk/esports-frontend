import { MAX_DPI, MAX_SENS, MIN_DPI } from "@/features/sensitivity/domain";
import type { UiLang } from "@/lib/pt-br";

/** Every word the sensitivity converter shows, in English and Brazilian Portuguese (the Portuguese page stays noindex until a native reader approves it). */
export const SENS_COPY = {
  en: {
    current: "Your current setting", from: "From game", to: "To game", sens: "Your sensitivity in the first game", sensHelp: "The number in the game's mouse settings, for example 0.4.",
    dpi: "Mouse DPI", dpiHelp: `From ${MIN_DPI} to ${MAX_DPI}. 400, 800 and 1600 are common.`, swap: "Swap the games", dpiChange: "I am changing my mouse DPI too",
    newDpi: "New mouse DPI", newDpiHelp: "The answer keeps the same hand movement for a full turn at this DPI.",
    out: "Your setting in the other game", fix: "Fix the box marked above to see the answer.", sensOf: "sensitivity:",
    turn: "Distance for a full turn", inches: "In inches", edpiBox: "eDPI (sensitivity x DPI)", toWord: "to",
    rounded: (game: string) => `Rounded to the decimals ${game} takes. The rounded value gives`, roundedTail: "cm/360. eDPI is only comparable between games with the same yaw.",
    tableLabel: "The same setting in every listed game", tableCaption: "The same feel in every listed game", game: "Game", yaw: "Yaw", sensCol: "Sensitivity",
    edpiH: "eDPI calculator",
    edpiP: "eDPI (effective DPI) is your in-game sensitivity multiplied by your mouse DPI: 0.4 at 800 DPI is an eDPI of 320. It puts a player's speed into one number, so two players in the same game can compare settings even if one uses 400 DPI and the other 1600. It does not carry across games, because each game turns by a different amount per mouse count (its yaw). Between games, compare cm/360: how many centimetres the mouse travels for one full turn.",
    edpiGame: "Game", edpiSens: "In-game sensitivity", edpiFix: "Fix the box marked above to see your eDPI.", edpiIn: "eDPI in",
    edpiTableLabel: "The same feel as an eDPI in every listed game", edpiTableCaption: "The eDPI that gives the same cm/360 in each listed game", edpiCol: "eDPI for the same feel",
    edpiNote: "The matching eDPI is your eDPI times this game's yaw, divided by the other game's yaw. Counter-Strike 2 and Apex Legends share a yaw of 0.022, so their eDPI values match directly.",
    srcH: (d: string) => `Where the yaw numbers come from (checked ${d})`, srcNote: "",
    mobile: "Mobile games (BGMI, Free Fire, Call of Duty: Mobile) are not in the list on purpose: their touch and gyro settings have no published value that maps to mouse counts, so any conversion would be a guess.",
    sensError: `Type a sensitivity above 0 and up to ${MAX_SENS}.`, dpiError: `Type a DPI from ${MIN_DPI} to ${MAX_DPI}.`,
    shareTitle: "Sensitivity converted", shareAt: "at", shareSensAt: (dpi: number) => `Sens at ${dpi} DPI`, what: "sensitivity",
  },
  "pt-BR": {
    current: "Sua configuração atual", from: "Jogo de origem", to: "Jogo de destino", sens: "Sua sensibilidade no jogo de origem", sensHelp: "O número nas configurações de mouse do jogo, por exemplo 0.4.",
    dpi: "DPI do mouse", dpiHelp: `De ${MIN_DPI} a ${MAX_DPI}. 400, 800 e 1600 são comuns.`, swap: "Inverter os jogos", dpiChange: "Também vou mudar o DPI do mouse",
    newDpi: "Novo DPI do mouse", newDpiHelp: "A resposta mantém o mesmo movimento da mão para uma volta completa com este DPI.",
    out: "Sua configuração no outro jogo", fix: "Corrija a caixa marcada acima para ver a resposta.", sensOf: "sensibilidade:",
    turn: "Distância para uma volta completa", inches: "Em polegadas", edpiBox: "eDPI (sensibilidade x DPI)", toWord: "para",
    rounded: (game: string) => `Arredondado para as casas decimais que ${game} aceita. O valor arredondado dá`, roundedTail: "cm/360. O eDPI só pode ser comparado entre jogos com o mesmo yaw.",
    tableLabel: "A mesma configuração em todos os jogos da lista", tableCaption: "A mesma sensação em todos os jogos da lista", game: "Jogo", yaw: "Yaw", sensCol: "Sensibilidade",
    edpiH: "Calculadora de eDPI",
    edpiP: "O eDPI (DPI efetivo) é a sua sensibilidade no jogo multiplicada pelo DPI do mouse: 0.4 com 800 DPI dá um eDPI de 320. Ele resume a velocidade do jogador em um número, para que dois jogadores do mesmo jogo comparem configurações mesmo que um use 400 DPI e o outro 1600. Ele não vale entre jogos diferentes, porque cada jogo gira um valor diferente por contagem do mouse (o yaw). Entre jogos, compare o cm/360: quantos centímetros o mouse anda para uma volta completa.",
    edpiGame: "Jogo", edpiSens: "Sensibilidade no jogo", edpiFix: "Corrija a caixa marcada acima para ver o seu eDPI.", edpiIn: "eDPI em",
    edpiTableLabel: "A mesma sensação como eDPI em todos os jogos da lista", edpiTableCaption: "O eDPI que dá o mesmo cm/360 em cada jogo da lista", edpiCol: "eDPI para a mesma sensação",
    edpiNote: "O eDPI equivalente é o seu eDPI vezes o yaw deste jogo, dividido pelo yaw do outro jogo. Counter-Strike 2 e Apex Legends têm o mesmo yaw, 0.022, então os valores de eDPI são iguais.",
    srcH: (d: string) => `De onde vêm os valores de yaw (conferido em ${d})`, srcNote: "As explicações das fontes estão em inglês.",
    mobile: "Os jogos de celular (BGMI, Free Fire, Call of Duty: Mobile) ficam de fora de propósito: as configurações de toque e giroscópio não têm um valor publicado que corresponda às contagens do mouse, então qualquer conversão seria um chute.",
    sensError: `Digite uma sensibilidade acima de 0 e até ${MAX_SENS}.`, dpiError: `Digite um DPI de ${MIN_DPI} a ${MAX_DPI}.`,
    shareTitle: "Sensibilidade convertida", shareAt: "com", shareSensAt: (dpi: number) => `Sens com ${dpi} DPI`, what: "sensibilidade",
  },
} as const;

export const sensCopy = (lang: UiLang = "en") => SENS_COPY[lang];
