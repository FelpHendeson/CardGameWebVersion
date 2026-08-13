# Jogo de Cartas — Índice da Documentação

**Pacote:** Documentação v0.3  
**Fase:** Etapa 1 — Estruturação e Prototipagem

Este diretório reúne a documentação canônica e técnica do projeto.

## Hierarquia de fonte de verdade

1. `01_DOCUMENTO_DO_JOGO.md` — regras, conceitos e decisões canônicas do jogo.
2. `02_CATALOGO_DE_CARTAS.md` — cartas, efeitos, estatísticas, identidade visual e lore já registradas.
3. `03_ESPECIFICACAO_FUNCIONAL_WEB.md` — comportamento esperado da primeira versão Web.
4. `04_ESPECIFICACAO_MOTOR_DUELO.md` — regras determinísticas do motor de partida.
5. `05_MODELO_DE_DOMINIO.md` — entidades e relacionamentos principais.
6. `06_ESQUEMA_DE_DADOS_CARTAS.md` — contrato de dados das cartas.
7. `07_EFEITOS_STATUS_E_PALAVRAS_CHAVE.md` — catálogo inicial de efeitos reutilizáveis.
8. `08_FLUXOS_E_WIREFRAMES_WEB.md` — fluxos de tela e wireframes conceituais.
9. `09_BACKLOG_MVP_WEB.md` — plano de implementação em épicos e histórias.
10. `10_ARQUITETURA_WEB.md` — arquitetura técnica recomendada.
11. `11_PLANO_DE_TESTES.md` — estratégia para testes funcionais, de motor e balanceamento.
12. `12_PROTOCOLO_MULTIPLAYER.md` — contrato conceitual para partidas online.

## Regra de governança

- Quando um documento técnico divergir do Documento do Jogo, prevalece o Documento do Jogo.
- Quando uma carta no código divergir do Catálogo de Cartas, prevalece o Catálogo até que uma alteração seja aprovada e registrada.
- Decisões marcadas como **PROVISÓRIO** devem ser validadas em partidas antes de se tornarem canônicas.
- O motor deve evitar números e regras espalhados pelo código. Regras ajustáveis devem vir de configuração central.

## Meta atual

Entregar um protótipo Web em que seja possível completar um duelo entre **Bestas de Fogo** e **Magos Umbrais**, registrar o estado da partida e coletar dados suficientes para revisar o balanceamento.
