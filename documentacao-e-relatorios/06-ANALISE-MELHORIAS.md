# 🔍 Análise do Projeto e Recomendações (Roadmap v1.1)

## 📊 Estado Atual do App

O app já possui uma base **sólida e impressionante** para um MVP (Produto Mínimo Viável).
- **Core:** Leitura Offline, DB SQLite, Busca, Configurações.
- **Features Extras:** Favoritos, Marca-texto, Histórico, Backup.
- **Novidades:** Harpa Cristã (estrutura), Planos de Leitura (estrutura).

---

## 🚀 Recomendações Prioritárias para Amanhã

### 1. ⚡ Performance e Banco de Dados (Crítico)

| Problema | Solução Recomendada | Impacto |
|----------|---------------------|---------|
| **Busca Lenta** | Implementar **FTS5 (Full Text Search)** do SQLite. O `LIKE %query%` atual será lento com 31k versículos. | 🚀🚀🚀 (50x mais rápido) |
| **Listas Grandes** | Substituir `FlatList` por **`FlashList`** (Shopify) nas telas de Bíblia e Harpa. | 🚀🚀 (Menor uso de RAM) |
| **Estado Global** | Implementar **Context API** ou **Zustand** para `Theme`, `FontSize` e `UserSettings`. Atualmente, cada tela recarrega configs do DB. | ⚡ (Navegação mais fluida) |

### 2. 🎨 UI/UX e Design

*   **Animações de Transição:** Adicionar `react-native-reanimated` para transições suaves entre telas e ao abrir o modal de leitura.
*   **Gestos:** Implementar troca de capítulo arrastando para o lado (Swipe) na tela de leitura.
*   **Feedback Visual:** Adicionar "Toast" ou "Snackbar" (mensagens flutuantes) ao salvar favoritos ou copiar versículos, em vez de `Alert.alert` (que interrompe o fluxo).
*   **Modo Foco:** Opção de esconder o Header/Footer durante a leitura (duplo toque na tela).

### 3. 🛠️ Refinamentos Técnicos

*   **Types Centralizados:** Mover todas as interfaces de `schema.ts`, `services/*` para a pasta `src/types/index.ts` para evitar dependências circulares e manter organização.
*   **Tratamento de Erros:** Criar um `ErrorBoundary` global para o app não fechar se der erro, mas mostrar uma tela amigável de "Algo deu errado".
*   **Assets Otimizados:** Garantir que ícones e imagens estejam comprimidos (WebP) para manter o APK pequeno.

### 4. 🧩 Novas Features (Quick Wins)

*   **Gerador de Imagens:** Em vez de compartilhar só texto, criar uma imagem bonita com o versículo e fundo degradê para Instagram/Status (usando `react-native-view-shot`).
*   **Notas nos Versículos:** Estender o sistema de favoritos para permitir escrever anotações pessoais longas (Diário Espiritual).
*   **Widget Android:** (Avançado) Criar um widget para a tela inicial do celular com o versículo do dia.

---

## 📅 Plano de Ação Sugerido para Amanhã

### Manhã: Dados & Performance
1. **[FTS5]** Otimizar a busca da Bíblia.
2. **[Dados]** Carregar o JSON da Harpa Cristã (640 hinos).
3. **[Dados]** Completar o JSON do Plano de Leitura (365 dias).

### Tarde: UI & UX
4. **[Gestos]** Swipe para mudar capítulo.
5. **[Context]** Otimizar carregamento de configurações.
6. **[Share]** Criar compartilhamento de imagem.

### Noite: Polimento Final
7. **[Testes]** Rodar em dispositivo físico e ajustar tamanhos de fonte.
8. **[Build]** Gerar APK Final.

---

**Conclusão:** O app está excelente funcionalmente. O foco agora deve ser **fluidez** (fazer parecer um app nativo premium) e **conteúdo** (preencher os dados que faltam).
