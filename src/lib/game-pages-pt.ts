import type { GamePage } from "@/lib/game-pages";
import { PT_BR_PAGES } from "@/lib/pt-br";

/**
 * The Free Fire points table page in Brazilian Portuguese (/pt-br/points-table/free-fire/). Same facts as GAME_PAGES["free-fire"]: the
 * same example scale, the same limits (up to 12 matches, 14 screen designs), the same tie-break order. Keep the two in step when one changes.
 * Not indexed until a native reader approves it: see PT_BR_REVIEWED in src/lib/pt-br.ts.
 */
export const FREE_FIRE_PT: GamePage = {
  slug: "free-fire-points-table", path: PT_BR_PAGES["/points-table/free-fire/"]!, preset: "free-fire", updated: "2026-11-24",
  crumb: { name: "Tabela de pontos (em inglês)", href: "/tools/points-table/" },
  name: "Tabela de pontos de Free Fire", shortName: "tabela de pontos de Free Fire",
  related: [
    { href: "/points-table/free-fire/", label: "Free Fire points table maker (English)", blurb: "Esta mesma página em inglês." },
    { href: "/points-table/bgmi/", label: "Tabela de pontos de BGMI (em inglês)", blurb: "Pontos por colocação e por abate para salas personalizadas de BGMI." },
    { href: "/tools/points-table/", label: "Tabela de pontos para qualquer battle royale (em inglês)", blurb: "A mesma ferramenta sem o nome de um jogo, para qualquer tabela de colocação e de abates." },
  ],
  title: "Tabela de pontos de Free Fire grátis, com pontuação",
  description: "Tabela de pontos de Free Fire para salas personalizadas: defina os pontos por colocação e por abate, lance os resultados e tenha a classificação para o WhatsApp ou a TV.",
  h1: "Tabela de pontos de Free Fire e sistema de pontuação",
  lead: "Num sistema de pontos de Free Fire para sala personalizada, cada equipe ganha pontos de colocação pela posição em que terminou, mais pontos por cada abate, somados em todas as partidas. Coloque a sua tabela, digite a posição e os abates de cada equipe e tenha uma classificação com critérios de desempate para compartilhar no WhatsApp ou mostrar numa TV. Grátis e sem conta. A tabela mostrada é um exemplo, não uma tabela oficial.",
  table: { caption: "Exemplo de pontos por colocação no Free Fire (um exemplo, não a tabela oficial)", head: ["Posição", "Pontos de colocação"], rows: [["1º", "10"], ["2º", "6"], ["3º", "5"], ["4º", "4"], ["5º", "3"], ["6º", "2"], ["7º e 8º", "1 cada"], ["Cada abate", "1 ponto"]] },
  useHeading: "Monte a sua tabela de pontos de Free Fire",
  benefits: [
    { title: "Você define os pontos", body: "Digite os seus pontos por colocação e por abate. A tabela inicial é só um exemplo, então troque pela tabela das suas regras ou do regulamento da publicadora do jogo." },
    { title: "Feita para noites de sala personalizada", body: "Adicione quantas equipes tiver, lance até doze partidas e veja os pontos de cada equipe em cada partida ao lado do total, para ninguém precisar perguntar de onde veio uma pontuação." },
    { title: "Poste ou mostre na tela", body: "Transforme a classificação numa imagem para o WhatsApp ou o Instagram, mande como texto ou abra em tela cheia numa TV, num projetor ou no OBS, com uma faixa opcional de patrocinadores." },
  ],
  steps: ["Coloque os pontos por colocação, os pontos por abate e o número de partidas.", "Adicione cada equipe e digite a posição e os abates dela em cada partida.", "Confira a classificação, que se atualiza enquanto você digita.", "Compartilhe a imagem no WhatsApp ou no Instagram, baixe o CSV ou abra a tela para uma TV."],
  guides: ["free-fire-tournament-organiser", "points-table", "esports-tournament-rules-template", "run-a-campus-tournament"],
  faq: [
    { q: "Como funciona o sistema de pontos do Free Fire numa sala personalizada?", a: "Um sistema comum de sala personalizada dá a cada equipe pontos pela posição final e pontos extras por cada abate. Depois de cada partida, você soma as duas partes, e a tabela ordena as equipes pelo total de todas as partidas. Esta ferramenta faz essa conta por você. Você escolhe os pontos por colocação e por abate, digita o resultado de cada equipe, e ela mostra os pontos de cada partida, o total e a posição, então uma discussão pode ser resolvida olhando a linha da equipe." },
    { q: "Quais são os pontos de colocação e de abate no Free Fire?", a: "Depende do evento, e este site não informa uma tabela oficial. A página começa com um exemplo de 10, 6, 5, 4, 3, 2, 1 e 1 ponto para as oito primeiras posições e um ponto por abate, para a tabela não começar vazia. É uma amostra e pode não seguir as regras atuais de nenhum torneio oficial de Free Fire. Use a tabela do seu regulamento ou das regras publicadas pela publicadora do jogo, e passe os números para as equipes antes da primeira partida." },
    { q: "Como faço uma tabela de pontos de Free Fire?", a: "Defina os pontos por colocação, os pontos por abate e o número de partidas, depois adicione uma linha para cada equipe e digite a posição e os abates dela em cada partida, assim que a partida terminar. A classificação se atualiza na hora. Baixe em CSV se quiser uma cópia em planilha, ou compartilhe a tabela como imagem. Funciona no navegador, roda no celular, não precisa instalar nada e não pede login." },
    { q: "O que acontece quando duas equipes de Free Fire têm a mesma pontuação?", a: "A ferramenta ordena as duas por mais vitórias, depois por mais abates, depois pela melhor posição na última partida e, por fim, pelo nome da equipe, e marca a linha como desempate para você ver. Essas são as regras da própria ferramenta, não um padrão oficial. Se o seu evento usa outros critérios de desempate, coloque nas regras com antecedência e confira as equipes empatadas à mão, porque a tabela não tem como saber uma regra que você não informou." },
    { q: "Posso compartilhar a tabela de pontos de Free Fire no WhatsApp?", a: "Sim. Use o botão de compartilhar no último passo para criar uma imagem. No celular, abre o menu de compartilhar com a imagem anexada; no computador, salva um PNG para você anexar. Escolha post quadrado para grupos e feeds ou story para status, e escolha um dos 14 visuais. Se o grupo não mostra bem as imagens, mande a classificação como mensagem de texto com o outro botão." },
    { q: "Posso mostrar a classificação numa TV no local do evento?", a: "Sim. Toque em Abrir a tela e leve essa janela para a TV ou o projetor, depois aperte F para tela cheia. A tela acompanha a ferramenta, então cada resultado que você digita aparece nela. Dá para adicionar logos de patrocinadores e uma linha de avisos passando na tela, e existe um fundo transparente para o OBS. Uma conta grátis também permite publicar a classificação numa página ao vivo que os jogadores abrem no próprio celular." },
    { q: "Esta é uma ferramenta oficial do Free Fire?", a: "Não. É uma ferramenta independente e grátis para quem organiza os próprios torneios, e não tem ligação com a publicadora do jogo. Ela não se conecta ao jogo nem a resultados oficiais: você mesmo digita as posições e os abates, então a tabela só fica tão certa quanto os dados que você lançar. Use em eventos de faculdade, lan houses e treinos da comunidade, e use os canais do organizador para a classificação de torneios oficiais." },
  ],
};
