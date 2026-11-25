import type { ToolPage } from "@/components/seo/ToolLanding";
import { CHECKED as NAME_CHECKED, SOURCES as NAME_SOURCES } from "@/features/name-style/domain";
import { PT_BR_PAGES } from "@/lib/pt-br";

/**
 * The three tool pages in Brazilian Portuguese added on 25 Nov 2026: nick for Free Fire, the sensitivity converter and the guild names.
 * Same facts as the English pages they translate. NOT indexed until a native reader approves each one: see PT_BR_REVIEWED in src/lib/pt-br.ts.
 * Links to English pages say "(em inglês)".
 */
type Page = ToolPage & { title: string; description: string; path: string };

const CRUMB = { name: "Ferramentas (em inglês)", href: "/tools/" };
const FF_POINTS = { href: "/pt-br/points-table/free-fire/", label: "Tabela de pontos do Free Fire", blurb: "Pontos por colocação e por abate para salas personalizadas, com uma imagem para compartilhar." };
const NICK = PT_BR_PAGES["/tools/free-fire-name-style/"]!, SENS = PT_BR_PAGES["/tools/sensitivity-converter/"]!, GUILD = PT_BR_PAGES["/tools/free-fire-guild-name/"]!;
const ffHelp = `[central de ajuda do Free Fire da Garena](${NAME_SOURCES.ffNickname})`;

export const NICK_FF_PT: Page = {
  slug: "free-fire-name-style", path: NICK, crumb: CRUMB, name: "Gerador de nick para Free Fire", shortName: "gerador de nick", updated: "2026-11-25", howTo: true,
  title: "Gerador de nick para Free Fire: nick FF com símbolos",
  description: "Digite seu nome e copie nicks para Free Fire com letras diferentes, símbolos e molduras. Grátis, sem app e sem cadastro, com o passo a passo no jogo.",
  h1: "Gerador de nick para Free Fire com letras diferentes",
  lead: "Digite seu nome e a página cria nicks para Free Fire com letras diferentes, símbolos e molduras, cada um com um botão Copiar. Ela também avisa quais estilos o jogo pode mostrar como quadrados. Abaixo do gerador há uma lista de nicks prontos e uma lista de símbolos para copiar com um toque, e o passo a passo para trocar o nick no jogo. Grátis, no seu navegador, nada é salvo nem enviado.",
  intro: "Digite seu nome e a página cria nicks para Free Fire com letras diferentes, símbolos e molduras, cada um com um botão Copiar. Ela também avisa quais estilos o jogo pode mostrar como quadrados.",
  useHeading: "Crie seu nick para Free Fire",
  benefits: [
    { title: "Todos os estilos de uma vez", body: "Seu nome em onze estilos de letra, do normal ao versalete, negrito, cursiva e gótica, com uma moldura de símbolos e uma tag opcional, cada um com o número de caracteres e um botão Copiar." },
    { title: "Sincero sobre os quadrados", body: "Cada estilo diz quantas fontes de celular conseguem mostrá-lo. A própria Garena avisa que caracteres especiais podem não aparecer em todos os aparelhos, então a versão normal está sempre ali." },
    { title: "Nicks prontos e símbolos", body: "Uma lista de nicks curtos criados por esta ferramenta e uma lista de símbolos, na própria página, para copiar antes mesmo de o gerador carregar." },
  ],
  steps: [
    "Digite seu nome na caixa. A página mostra o nome em todos os estilos, com os símbolos que você escolher.",
    "Toque em Copiar ao lado do estilo de que gostou, ou copie um nick pronto ou um símbolo das listas abaixo.",
    "No Free Fire, toque na sua foto de perfil no canto superior esquerdo e depois no botão ao lado do nick atual, como explica a central de ajuda da Garena.",
    "Cole o nick, veja se cabe e se aparece certo, e confirme. O jogo mostra o custo antes de você confirmar.",
  ],
  sections: [
    {
      id: "regras", h2: `O que a Garena diz sobre nicks no Free Fire (conferido em ${NAME_CHECKED})`,
      paras: [
        `A ${ffHelp} diz que o nick só pode ser trocado com Diamantes ou com um Cartão de Alteração de Nickname. Ela pede para evitar caracteres especiais, porque não pode garantir que todos apareçam em todos os aparelhos.`,
        "Não encontramos uma página da Garena com o número máximo de caracteres de um nick nem uma lista de símbolos permitidos, então esta página não informa nenhum dos dois. Ela mostra quantos caracteres cada estilo tem e deixa o nome normal ao lado. Se o jogo recusar ou cortar o nick, use menos símbolos, um estilo mais simples ou um nome mais curto.",
      ],
    },
  ],
  related: [
    { href: GUILD, label: "Gerador de nome de guilda para Free Fire", blurb: "Nomes curtos de guilda com uma versão estilosa ao lado de cada um e um emblema grátis." },
    { href: SENS, label: "Conversor de sensibilidade", blurb: "Leve a sensibilidade do mouse entre Valorant, CS2, Apex e Overwatch 2, com cm/360." },
    FF_POINTS,
    { href: "/tools/free-fire-name-style/", label: "Free Fire name style generator (em inglês)", blurb: "A mesma ferramenta em inglês." },
  ],
  faq: [
    { q: "Como colocar nick com símbolo no Free Fire?", a: "Digite seu nome no gerador, toque em Copiar ao lado do estilo de que gostou e abra o Free Fire. A central de ajuda da Garena explica o caminho: toque na sua foto de perfil no canto superior esquerdo, toque no botão ao lado do nick atual, cole o novo nick e confirme. Veja como o nick fica antes de confirmar, porque a troca custa Diamantes ou um Cartão de Alteração de Nickname. Se aparecerem quadrados ou o jogo recusar, volte e escolha um estilo mais simples." },
    { q: "Por que meu nick aparece com quadrados?", a: "Porque as fontes do celular não têm esses caracteres. Cada letra estilosa é um caractere Unicode separado, e a central de ajuda da Garena diz que não pode garantir que caracteres especiais apareçam em todos os aparelhos. As letras em negrito, cursiva, gótica e contorno precisam de fontes mais novas; versalete, letras largas, letras em círculo e os símbolos das molduras aparecem em mais celulares. Os outros jogadores veem o seu nick com as fontes do celular deles, então deixe parte dele em letras normais." },
    { q: "Quantas letras pode ter o nick no Free Fire?", a: "Não conseguimos confirmar. A página de ajuda da Garena sobre nicks não informa um limite, e os sites de dicas não concordam entre si, então esta página não dá um número. O gerador mostra quantos caracteres cada estilo tem, contando um símbolo como ꧁ como um só, mas o jogo pode contar alguns caracteres de outro jeito. Cole o nick no jogo: se ele for recusado ou cortado, use menos símbolos ou um nome mais curto." },
    { q: "Como trocar o nick no Free Fire?", a: "A central de ajuda da Garena diz que as únicas formas de trocar o nick são com Diamantes ou com um Cartão de Alteração de Nickname. Toque na sua foto de perfil no canto superior esquerdo, depois no botão ao lado do nick atual, digite ou cole o novo nick e confirme. A página da Garena não informa o preço, e ele pode mudar com eventos, então confira o valor que o jogo mostra antes de confirmar." },
    { q: "Quais símbolos funcionam no Free Fire?", a: "A Garena não publica uma lista de símbolos permitidos e recomenda evitar caracteres especiais, porque eles podem não aparecer em todos os aparelhos. Muitos jogadores usam símbolos como ꧁ ꧂, 亗, 乂 e ★, que estão na lista de símbolos desta página. Cole o nick no jogo para ver se ele é aceito e, se puder, veja como fica em outro celular. Use o nome normal em inscrições de campeonato e tabelas de pontos." },
    { q: "Posso usar o mesmo estilo no nome da guilda?", a: "Você pode tentar as mesmas letras e símbolos na caixa de nome da guilda, mas confira lá também, porque o nome da guilda é digitado em outro lugar do jogo. Para ideias de nome de guilda, com uma versão estilosa ao lado de cada nome e um emblema, use o gerador de nome de guilda para Free Fire. Guarde uma grafia normal do nome da guilda para inscrições em campeonatos." },
    { q: "Meu nick fica salvo ou é enviado para algum lugar?", a: "Não. Os estilos são criados no seu navegador e nada do que você digita é enviado ou guardado. Os nicks prontos desta página foram criados por esta ferramenta a partir das nossas próprias listas de palavras; não são nicks de jogadores reais." },
  ],
};

export const SENS_PT: Page = {
  slug: "sensitivity-converter", path: SENS, crumb: CRUMB, name: "Conversor de sensibilidade e calculadora de eDPI", shortName: "conversor de sensibilidade", updated: "2026-11-25",
  title: "Conversor de sensibilidade: Valorant, CS2, Apex e eDPI",
  description: "Converta a sensibilidade do mouse entre Valorant, CS2, Apex Legends e Overwatch 2, com mudança de DPI, cm/360 e calculadora de eDPI. Valores citados.",
  h1: "Conversor de sensibilidade para Valorant, CS2, Apex e Overwatch 2",
  lead: "Escolha o jogo de origem e o de destino, digite sua sensibilidade e o DPI, e o conversor mostra o valor que mantém o mesmo movimento do mouse. Também calcula o eDPI e os centímetros por volta de 360°. Só entram jogos com um valor de yaw publicado ou bem documentado, e cada valor tem a sua fonte na página. Os jogos de celular ficam de fora de propósito. Grátis, no seu navegador, sem conta.",
  intro: "Escolha o jogo de origem e o de destino, digite sua sensibilidade e o DPI, e o conversor mostra o valor que mantém o mesmo movimento do mouse. Também calcula o eDPI e os centímetros por volta de 360°.",
  useHeading: "Converta sua sensibilidade",
  glossary: [
    { term: "Yaw", meaning: "quantos graus a visão gira para cada contagem do mouse com sensibilidade 1. Cada jogo tem o seu." },
    { term: "DPI", meaning: "quantas contagens o mouse envia por polegada de movimento. Ajustado no programa do próprio mouse." },
    { term: "cm/360", meaning: "quanto o mouse anda para uma volta completa. O mesmo cm/360 em dois jogos dá a mesma sensação." },
    { term: "eDPI", meaning: "sensibilidade multiplicada pelo DPI. Só serve para comparar jogos com o mesmo yaw." },
  ],
  benefits: [
    { title: "Mesma sensação, conta exata", body: "A resposta mantém sensibilidade x yaw x DPI igual, então a sua mão anda a mesma distância para uma volta completa nos dois jogos." },
    { title: "Mude o DPI ao mesmo tempo", body: "Vai de 400 para 800 DPI ou trocou de mouse? Marque a caixa, digite o novo DPI e a sensibilidade é recalculada para a volta não mudar." },
    { title: "eDPI calculado por jogo", body: "A calculadora multiplica sua sensibilidade pelo DPI, mostra o cm/360 e lista o eDPI que dá a mesma sensação em cada jogo da lista." },
  ],
  steps: [
    "Escolha o jogo que você joga agora e o jogo para o qual está indo.",
    "Digite a sensibilidade das configurações de mouse do primeiro jogo e o DPI do seu mouse.",
    "Se também for mudar o DPI, marque a caixa e digite o novo DPI.",
    "Leia a nova sensibilidade, o cm/360 e a tabela com todos os jogos, ajuste no jogo e jogue algumas partidas antes de fazer ajustes finos.",
  ],
  sections: [
    {
      id: "contas", h2: "A conta que o conversor faz",
      paras: [
        "Cada jogo da lista gira a visão sensibilidade x yaw graus para cada contagem do mouse, e o mouse envia DPI contagens por polegada. Então uma volta completa leva 360 / (sensibilidade x yaw x DPI) polegadas. Multiplique por 2,54 para ter centímetros: esse é o cm/360.",
        "Converter é manter sensibilidade x yaw x DPI igual. Valorant 0.4 com 800 DPI vira 0.4 x 0.07 / 0.022 = 1.27 no Counter-Strike 2 com o mesmo DPI, e os dois dão 40.82 cm/360.",
      ],
    },
  ],
  related: [
    { href: NICK, label: "Gerador de nick para Free Fire", blurb: "Seu nome com letras diferentes, símbolos e molduras, pronto para copiar." },
    { href: GUILD, label: "Gerador de nome de guilda para Free Fire", blurb: "Nomes curtos de guilda com versão estilosa e um emblema grátis." },
    FF_POINTS,
    { href: "/tools/sensitivity-converter/", label: "Sens converter and eDPI calculator (em inglês)", blurb: "A mesma ferramenta em inglês, com as explicações completas das fontes." },
  ],
  faq: [
    { q: "Como converter sensibilidade do CS2 para o Valorant?", a: "Divida a sensibilidade do CS2 por 0.07 / 0.022, que é cerca de 3.18, se mantiver o mesmo DPI. Essa razão vem dos valores de yaw que o conversor usa: 0.022 para o Counter-Strike 2, o padrão da configuração m_yaw, e 0.07 para o Valorant, um valor medido pela comunidade. CS2 1.27 vira cerca de 0.4 no Valorant, e com 800 DPI os dois dão 40.82 cm/360. Se mudar o DPI também, o conversor acima já faz a conta." },
    { q: "O que é eDPI?", a: "eDPI, ou DPI efetivo, é a sua sensibilidade no jogo multiplicada pelo DPI do mouse. Um jogador de Valorant com 0.4 e 800 DPI tem eDPI 320, igual a quem usa 0.2 com 1600 DPI, porque os dois giram o mesmo tanto para o mesmo movimento da mão. O eDPI não vale entre jogos diferentes: o Valorant gira 0.07 grau por contagem com sensibilidade 1 e o CS2 gira 0.022, então um eDPI 320 no Valorant equivale a cerca de 1018 no CS2." },
    { q: "O que é cm/360?", a: "cm/360 é quantos centímetros o mouse anda no mousepad para o personagem dar uma volta completa. Dois jogadores com o mesmo cm/360 têm a mesma velocidade de mira, mesmo com números de sensibilidade e DPI bem diferentes. Não existe um valor certo: depende do braço, do tamanho do mousepad, do jogo e de como você gosta de mirar." },
    { q: "Se eu mudar o DPI, que sensibilidade uso?", a: "Escolha o mesmo jogo nas duas caixas, digite sua sensibilidade e o DPI antigo, marque a caixa de mudança de DPI e digite o novo. A resposta é a sensibilidade que mantém a mesma distância para uma volta, então dobrar o DPI corta a sensibilidade pela metade." },
    { q: "Serve para Free Fire no celular?", a: "Não. O conversor é para mouse. Jogos de celular como Free Fire, BGMI e COD Mobile usam toque e giroscópio, e cada controle deslizante transforma um movimento do dedo em giro de um jeito próprio, não documentado, que também depende da tela. Um número para eles seria um chute, então esta página não oferece. Para a sensibilidade do Free Fire num celular novo, comece pelas configurações antigas e mude um controle de cada vez no treino." },
    { q: "De onde vêm os valores?", a: "O Counter-Strike 2 usa 0.022, o padrão da configuração m_yaw documentada na wiki da Valve. Valorant usa 0.07, Apex Legends 0.022 e Overwatch 2 0.0066. Esses três não são publicados pela Riot, pela Respawn ou pela Blizzard; são valores medidos pela comunidade em que os principais sites de conversão concordam, e a página mostra o link de cada fonte e a data em que conferimos." },
  ],
};

export const GUILD_PT: Page = {
  slug: "free-fire-guild-name", path: GUILD, crumb: CRUMB, name: "Gerador de nome de guilda para Free Fire", shortName: "gerador de nome de guilda", updated: "2026-11-25",
  title: "Gerador de nome de guilda para Free Fire, com estilo",
  description: "Ideias de nome de guilda para Free Fire com versão estilosa ao lado, checagem contra nomes de times e jogos, e um emblema grátis para baixar.",
  h1: "Gerador de nome de guilda para Free Fire",
  lead: "O gerador cria nomes curtos de guilda para Free Fire, cada um com uma versão estilosa para copiar. Todo nome é checado contra nomes do jogo, de organizações e palavras ofensivas. Os nomes vêm das nossas próprias listas de palavras, em inglês, em quatro temas, e você pode fazer um emblema simples com as iniciais da guilda e baixar em PNG ou SVG. Grátis, no seu navegador, sem conta e sem nada salvo.",
  intro: "O gerador cria nomes curtos de guilda para Free Fire, cada um com uma versão estilosa para copiar. Todo nome é checado contra nomes do jogo, de organizações e palavras ofensivas.",
  useHeading: "Encontre um nome de guilda",
  benefits: [
    { title: "Normal e estiloso lado a lado", body: "Cada nome vem em letras normais e numa versão estilosa (negrito, versalete ou letras largas, com arabescos, estrelas ou colchetes), para guardar o normal para inscrições e tabelas." },
    { title: "Checado, mesmo decorado", body: "As letras diferentes voltam a ser letras normais antes da checagem, então um nome estiloso não esconde o nome de um jogo, de uma organização ou uma palavra ofensiva." },
    { title: "Um emblema para a guilda", body: "Desenhe um emblema simples com uma forma, as iniciais e duas cores, e baixe em PNG ou SVG para o grupo de WhatsApp, o Discord ou a inscrição no campeonato." },
  ],
  steps: [
    "Escolha um tema. O modo de guilda de Free Fire e as versões estilosas já vêm ligados.",
    "Escolha as letras e os símbolos das versões estilosas, ou toque em Mais nomes para ver outra lista.",
    "Toque em Copiar ao lado do nome normal ou estiloso, cole na caixa de nome da guilda no jogo e veja se cabe.",
    "Faça o emblema, baixe e guarde o nome normal para as inscrições.",
  ],
  sections: [
    {
      id: "cabe", h2: "O nome estiloso cabe no Free Fire?",
      paras: [
        "Não conseguimos confirmar, então a página não promete. A Garena não publica uma regra de nome de guilda que pudéssemos conferir, e os sites de dicas dão limites diferentes. Algumas letras e símbolos desta página são um caractere Unicode só, mas o jogo pode contar ou mostrar de outro jeito, e um celular sem a fonte certa mostra um quadrado vazio.",
        "Por isso o gerador mostra quantos caracteres cada versão estilosa tem e mantém a versão normal ao lado. Cole a estilosa na caixa de nome da guilda: se o jogo recusar ou cortar, use um nome mais curto, menos símbolos ou o nome normal.",
      ],
    },
  ],
  related: [
    { href: NICK, label: "Gerador de nick para Free Fire", blurb: "Precisa de um nick de jogador, não de um nome de guilda? Seu nome com letras diferentes e símbolos." },
    { href: SENS, label: "Conversor de sensibilidade", blurb: "Leve a sensibilidade do mouse entre Valorant, CS2, Apex e Overwatch 2." },
    FF_POINTS,
    { href: "/tools/free-fire-guild-name/", label: "Free Fire guild name generator (em inglês)", blurb: "A mesma ferramenta em inglês, com o tema de palavras indianas." },
  ],
  faq: [
    { q: "Como criar uma guilda no Free Fire?", a: "A guilda é criada dentro do jogo, no menu de guilda, e o jogo mostra ali o custo e as exigências do momento. Esta página não cria a guilda: ela ajuda a escolher o nome e a fazer um emblema. Não conseguimos conferir numa página da Garena o custo atual para criar uma guilda, então confira no jogo antes de confirmar." },
    { q: "Quantas letras pode ter o nome da guilda?", a: "Não conseguimos confirmar o limite do jogo, então esta página não informa um número. O modo de guilda do gerador mantém cada ideia com até 14 caracteres, que é uma escolha de estilo desta ferramenta, não uma regra do jogo, porque nomes curtos são mais fáceis de falar, digitar e ler numa tabela de pontos. A página mostra quantos caracteres cada versão estilosa tem para você conferir no jogo." },
    { q: "Como colocar símbolo no nome da guilda?", a: "Ligue as versões estilosas, escolha as letras e os símbolos (arabescos ꧁ ꧂, estrelas ★, colchetes 『 』 ou a marca 亗) e toque em Copiar ao lado da versão estilosa. Cole na caixa de nome da guilda no jogo. Se o jogo recusar ou cortar, use menos símbolos ou o nome normal, que fica sempre ao lado." },
    { q: "Como mudar o nome da guilda?", a: "A troca é feita dentro do jogo, nas configurações da guilda, e o jogo mostra o custo antes de você confirmar. Não encontramos uma página da Garena com os passos e o preço atuais para trocar o nome de uma guilda, então esta página não informa um valor. Copie o novo nome aqui e cole na caixa do jogo." },
    { q: "Ideias de nome para clã ou time", a: "Escolha o modo Clã para nomes como The ..., ... Clan ou Order of the ..., ou o modo Qualquer time para duas palavras do tema. Os temas são animais, clima e elementos, lendas (sem deuses nem religião) e espaço, com palavras em inglês das nossas próprias listas. Todo nome é checado contra nomes de jogos, publicadoras, organizações de esports e palavras ofensivas, e você também pode digitar o seu nome para checar." },
  ],
};
