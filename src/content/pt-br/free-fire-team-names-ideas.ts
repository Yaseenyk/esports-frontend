import type { Draft } from "../scheduled/types";

/**
 * /pt-br/guides/free-fire-team-names-ideas/: the Free Fire team names guide in Brazilian Portuguese. A translation of the English
 * guide (src/content/scheduled/live-now.ts, slug "free-fire-team-names-ideas") with the same facts and the same sources:
 * - the Free Fire fact is FACTS.freeFire in src/content/scheduled/facts.ts (Wikipedia and IGN; Clash Squad is "Contra Squad" in the
 *   Brazilian version of the game);
 * - the FFWS MEA 2025 line is FACTS_LIVE in src/content/scheduled/facts-live.ts (official rulebook, section 3.2).
 * The name ideas are made up, as in the English guide; the Portuguese column is new wording of the same kind of idea, not a checked list.
 * Links to other guides go to the English pages and say so. Not indexed until a native reader approves it (PT_BR_REVIEWED in src/lib/pt-br.ts).
 */
export const FREE_FIRE_TEAM_NAMES_PT: Draft = {
  slug: "free-fire-team-names-ideas",
  title: "Nomes para time de Free Fire: ideias originais e regras para o nome",
  seoTitle: "Nomes para time de Free Fire: ideias e regras",
  description: "Nomes para time e guilda de Free Fire: ideias originais por estilo, como escolher uma tag curta, regras de nome para combinar com o organizador e como não copiar.",
  tag: "Ideias de nome",
  answer: "Um nome de time de Free Fire deve ser curto, limpo e diferente dos times que já existem. Escolha um estilo, junte duas palavras, crie uma tag curta para o squad e pesquise o nome na internet e com o organizador antes de se inscrever. As ideias abaixo são originais e não foram verificadas.",
  intro: "Um squad de Free Fire tem quatro jogadores, e o nome precisa ser fácil de digitar num formulário de inscrição e de ler numa tabela de pontos. Este guia traz ideias originais de nome por estilo, um método de tag para a sala, um conjunto curto de regras para escolher o nome e as verificações para fazer antes de fechar a escolha.",
  sections: [
    { h2: "Ideias de nome por estilo", md: `Os nomes abaixo foram inventados para esta página. Eles não foram verificados, então faça as verificações da última seção antes de usar um deles. Os nomes em inglês são os do guia original; a coluna em português traz ideias do mesmo tipo.

| Estilo | Ideias em inglês | Ideias em português |
|---|---|---|
| Fogo e calor | Ember Rush, Cinder Crew, Flarepoint, Ashline | Brasa Viva, Equipe Cinza, Ponto de Chama, Linha de Fogo |
| Velocidade | Rapid Orbit, Quickmark, Dashboard Four, Blur Squad | Órbita Rápida, Marca Veloz, Quarteto Relâmpago, Squad Borrão |
| Calma e precisão | Still Aim, Quiet Pierce, Cold Margin, Hush Fire | Mira Parada, Tiro Silencioso, Margem Fria, Fogo Calado |
| Animal | Copper Jackal, Dusk Viper, Ridge Falcon, Iron Heron | Chacal de Cobre, Víbora do Entardecer, Falcão da Serra, Garça de Ferro |
| Espírito de equipe | Last Four, Fourth Floor, One Circle, Together Zero | Últimos Quatro, Quarto Andar, Um Só Círculo, Juntos do Zero |

O battle royale de Free Fire coloca cerca de 50 jogadores numa partida, e o modo Contra Squad é 4v4 e disputado em rodadas. Os nomes de modos e de personagens pertencem ao jogo, então use palavras suas em vez das deles.` },
    { h2: "Nomes de squad com clima de reta final", md: `Muitos jogadores gostam de nomes sobre vencer o último círculo. Sem usar marcas do jogo:

- Final Circle Four (Quarteto do Círculo Final)
- Last Zone Standing (De Pé na Última Zona)
- Bridge To Win (Ponte para a Vitória)
- Loud Finish (Final Barulhento)
- Sunrise Squad (Squad do Amanhecer)
- Victory Lane (Faixa da Vitória)
- Crown Chase (Atrás da Coroa)
- Last Light (Última Luz)
- Golden Hour Four (Quarteto da Hora Dourada)
- Top Of The Hill (Topo do Morro)

Cuidado com a palavra "Booyah": é uma palavra que o próprio jogo usa, então um nome construído com ela pode ficar perto demais da marca do jogo para um evento com patrocínio. Pergunte ao organizador.` },
    { h2: "Nomes para guilda, escola ou time da cidade", md: `Se o time representa um lugar, junte o lugar com uma palavra curta:

- North Gate Gaming (Portão Norte Gaming)
- Riverside Rush (Beira-Rio Rush)
- Harbour Hawks (Gaviões do Porto)
- Old Town Orbit (Órbita do Centro Velho)
- Campus Cobras (Cobras do Campus)
- Station Road Squad (Squad da Rua da Estação)
- Lakeview Legion (Legião Vista do Lago)
- Sector Seven Crew (Equipe Setor Sete)

Para escolas e faculdades, confira primeiro as regras de nome do evento. Muitos eventos querem o nome da instituição escrito de um jeito padrão. O [guia de torneio universitário](/guides/run-a-campus-tournament/) (em inglês) trata dessa parte. Para listas gerais, veja [nomes de times de esports](/guides/esports-team-names-ideas/) (em inglês) e, para o outro grande battle royale de celular, [nomes de times de BGMI](/guides/bgmi-team-names-ideas/) (em inglês).` },
    { h2: "Tags, nomes e a sala", md: `Os árbitros precisam encontrar na lista o time que aparece na sala. Facilite isso:

1. Escolha uma tag curta, de duas a quatro letras, e coloque antes do nick de cada jogador.
2. Deixe cada nick legível. Sequências longas de símbolos são difíceis de comparar com a lista.
3. Envie os nomes exatos no formulário de inscrição, com letras maiúsculas e símbolos.
4. Não mude um nome depois da inscrição sem avisar o organizador.

No regulamento oficial da FFWS MEA 2025, a configuração do jogo esconde os nicks dos jogadores e o feed de abates nas partidas, então os árbitros de lá dependem da lista de jogadores que têm em mãos. Salas de eventos menores costumam mostrar os nomes, então uma tag ajuda todo mundo.` },
    { h2: "Verifique o nome e as regras", md: `Faça estas verificações antes de se inscrever:

1. Pesquise o nome entre aspas na internet e nas redes sociais que vocês usam.
2. Olhe a lista de inscritos do evento para ver se há nome repetido.
3. Confirme que nenhum time, marca ou criador conhecido usa esse nome.
4. Leia as regras do evento para ver limites de tamanho, símbolos e palavras.
5. Peça a aprovação do squad inteiro.

O seu [formulário de inscrição](/tools/registration/) (em inglês) é o lugar onde a grafia final fica registrada, então confira duas vezes. Para as regras de lista de jogadores sobre nomes e reservas, leia o guia de [regras de torneio de Free Fire para organizadores](/guides/free-fire-tournament-rules-for-organisers/) (em inglês), que também explica por que a lista é fechada antes do evento.` },
    { h2: "Erros comuns", md: `- Mudar uma letra do nome de um time conhecido.
- Colocar a marca do jogo no nome.
- Um nome com símbolos que o formulário não aceita.
- Nomes com ofensas ou piadas adultas que patrocinadores não vão aceitar.
- Inscrever uma grafia e jogar com outra.
- Escolher um nome tão longo que a tabela de pontos mostra só metade dele.` },
  ],
  faq: [
    { q: "Quais são algumas ideias originais de nome para time de Free Fire?", a: "Experimente nomes de duas palavras num estilo que o seu squad curta, como Ember Rush, Quiet Pierce, Copper Jackal ou Last Light, ou em português, como Brasa Viva ou Última Luz. São só ideias e não foram verificadas, então pesquise cada uma na internet e confira a lista do evento antes de se inscrever. Escolha um nome de que os quatro jogadores gostem e que seja curto o bastante para um placar." },
    { q: "Pode colocar Booyah no nome de um time de Free Fire?", a: "É uma palavra que o jogo usa, então não há regra contra ela para um squad casual, mas um nome construído com a marca do jogo pode ser recusado num evento com patrocínio. Pergunte ao organizador e pense num nome com palavras suas, que também é mais fácil de achar nas buscas e de proteger como identidade do time." },
    { q: "Como evitar dois times de Free Fire com o mesmo nome no meu evento?", a: "Receba os nomes dos times num formulário de inscrição, procure nomes repetidos na lista antes de confirmar as vagas e avise os times de que a primeira inscrição confirmada fica com o nome. Peça a grafia exata e uma tag curta, para que os jogadores na sala possam ser ligados à lista sem confusão." },
  ],
  related: ["esports-team-names-ideas", "bgmi-team-names-ideas", "free-fire-tournament-registration-form-template", "free-fire-tournament-rules-for-organisers"],
  cta: { label: "Abrir a ferramenta de formulário de inscrição (em inglês)", href: "/tools/registration/" },
};
