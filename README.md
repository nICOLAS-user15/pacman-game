# Pac-Man Arcade

Recriação do Pac-Man em HTML5 Canvas e JavaScript puro, com cinco fases, teletransporte nas laterais e nos cantos, e controles pelo teclado.

Projeto feito para estudo de game loop, colisão em grade e inteligência artificial simples de fantasmas. Não usa dependências nem etapa de build.

**[Jogar online](https://nicolas-user15.github.io/pacman-game/)**

## Como rodar

Para rodar localmente, não precisa instalar nada. Clone o repositório e abra o `index.html` no navegador:

```bash
git clone https://github.com/nICOLAS-user15/pacman-game.git
cd pacman-game
```

Depois abra o arquivo `index.html`. Se preferir um servidor local, use:

```bash
npm start
```

## Controles

| Ação | Teclado |
|---|---|
| Mover | Setas ou W A S D |
| Pausar e continuar | Espaço |
| Tela cheia | F |
| Sair da tela cheia | Esc |

## Fases

O jogo tem cinco labirintos. Cada um muda cores, velocidade dos fantasmas, duração do modo assustado e tempo de saída da casa dos fantasmas. A quinta fase tem os fantasmas mais rápidos.

## Estrutura

```
├── index.html   # Página, painel e botões
├── style.css    # Estilos e tela cheia
├── game.js      # Lógica do jogo: mapas, Pac-Man, fantasmas, pontuação e áudio
├── package.json # Script para servidor local
└── LICENSE
```

## Como funciona

- **Renderização:** tudo é desenhado num `<canvas>` a cada quadro, com `requestAnimationFrame`.
- **Mapas:** cada fase é uma matriz 19 × 21 em que cada número representa um tipo de célula: parede, pílula, pílula de poder, porta da casa dos fantasmas, portal e área vazia.
- **Movimento:** o Pac-Man anda alinhado ao centro dos corredores, o que evita atravessar paredes nas curvas.
- **Fantasmas:** cada um escolhe a direção seguinte olhando para um alvo no tabuleiro. Não voltam para trás, a não ser quando são derrotados ou ficam assustados.
- **Áudio:** os efeitos sonoros são gerados com a Web Audio API, sem arquivos de som.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).

Este projeto é uma recriação para fins de estudo. O nome Pac-Man e o personagem são marcas e propriedade intelectual de seus detentores, e não estão cobertos pela licença deste repositório.
