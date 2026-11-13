# 🕹️ Pac-Man Arcade - Edição 5 Fases (Polida)

Protótipo completo do **Pac-Man** com 5 fases, labirintos dinâmicos, teletransportes laterais e nos cantos, IA veloz e fluida, movimentação precisa sem travamentos e menu arcade refinado.

---

## 🚀 Como Executar

Abra o arquivo [`index.html`](file:///C:/Users/home/.gemini/antigravity/scratch/pacman-prototype/index.html) em qualquer navegador moderno:
```powershell
Start-Process "C:\Users\home\.gemini\antigravity\scratch\pacman-prototype\index.html"
```

---

## 🎮 Controles

- **Movimento**: Setas direcionais (**▲, ▼, ◀, ▶**) ou teclas **W, A, S, D**
- **Tela Cheia**: Tecla **F** ou botão **⛶ TELA CHEIA** (ocupa 100% da altura da tela)
- **Pausa / Retomar**: Barra de **Espaço** ou botão **⏸️**
- **Reiniciar**: Botão **🔄**
- **Áudio**: Botão **🔊** (silencia ou ativa os efeitos sonoros)
- **Sair da Tela Cheia**: Tecla **ESC** ou botão **🗗 SAIR (ESC)**

---

## ✨ Correções e Aprimoramentos Recentes

### 1. 🛡️ Solução Definitiva do Travamento de Paredes
- **O Pac-Man nunca mais fica preso**:
  - Implementado o sistema original de alinhamento estrito no centro dos corredores (*strict centerline locking*).
  - Ao colidir com uma parede, o Pac-Man para **exatamente no centro da interseção** (`centerX, centerY`), sem penetrar no ladrilho da parede.
  - Como ele para alinhado com a encruzilhada, virar para cima, baixo ou inverter a direção responde **instantaneamente**, sem qualquer travamento ou perda de controle.

### 2. ⚡ Fantasmas em Ação Imediata
- **Redução drástica do tempo de espera**:
  - **Blinky (Vermelho)**: Já começa do lado de fora perseguindo imediatamente (0s).
  - **Pinky (Rosa)**: Sai da casa após apenas **0.4 segundos** em alta velocidade!
  - **Inky (Ciano)**: Sai em **1.6 segundos**.
  - **Clyde (Laranja)**: Sai em **2.8 segundos**.
  - A velocidade de saída da casa foi acelerada em quase 2x, iniciando a perseguição intensa logo nos primeiros segundos da partida.

### 3. 🎨 Menu Elegante e Remoção das Setas Virtuais
- **Interface moderna e limpa**:
  - As antigas setas azuis do D-pad foram **completamente removidas**, eliminando a poluição visual da tela.
  - O cabeçalho foi redesenhado no estilo *neon glassmorphism*, com pílulas elegantes para Score, Record, Nível dinâmico, ícones de Vidas e Frutas.
  - Botões de ação compactos, modernos e com efeitos de brilho arcade.

### 4. ⛶ Modo Tela Cheia Imersivo Real
- O labirinto se expande para ocupar **100% da altura útil da tela**, com proporção preservada e pixels nítidos.

### 5. 🎯 Curva de Dificuldade Equilibrada (Fase 1 Mais Fácil)
- **Fase 1 Amigável**:
  - Velocidade dos fantasmas reduzida para `1.35 px/frame` (o Pac-Man tem velocidade `2.0 px/frame`, sendo ~48% mais rápido, facilitando fugas e curvas).
  - Pílula de poder estendida para **9.0 segundos** de vulnerabilidade nos fantasmas.
  - Saídas espaçadas da casa (Pinky aos 2.5s, Inky aos 6s e Clyde aos 10s) para dar tempo de explorar o labirinto.
  - As fases 2 a 5 aumentam a velocidade progressivamente até o desafio supremo da Fase 5.
