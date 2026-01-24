# 📖 Bíblia Sagrada - App Android

Um aplicativo bíblico moderno e completo para Android com suporte offline, múltiplas versões da Bíblia, Torah, Alcorão e Livros Apócrifos.

## ✨ Características

### 📚 Conteúdo Completo
- **Bíblia Completa**: Todos os 66 livros (39 do AT + 27 do NT)
- **Múltiplas Versões**: ACF, NVI, ARA (Português), KJV (Inglês), RVR (Espanhol)
- **Torah**: Os 5 primeiroslivros (Gênesis, Êxodo, Levítico, Números, Deuteronômio)
- **Alcorão**: 114 suras em português
- **Apócrifos**: 14 livros deuterocanônicos para estudos teológicos

### 🎨 Interface Moderna
- Design com essência bíblica (tons terrosos e dourados)
- Modo claro e escuro automático
- Interface responsiva e fluida
- Leitura imersiva sem distrações

### 📴 Funciona 100% Offline
- Todos os textos armazenados localmente
- Banco de dados SQLite otimizado
- Acesso instantâneo mesmo sem internet
- Perfeito para igrejas e locais sem sinal

### 🔔 Recursos Avançados
- **Versículo Diário**: Notificação automática com versículo inspirador
- **Compartilhamento Social**: Compartilhe versículos no WhatsApp, Facebook, Instagram
- **Busca Avançada**: Encontre versículos por palavras-chave
- **Seletor de Versões**: Alterne facilmente entre diferentes traduções

## 🚀 Como Usar

### Pré-requisitos
- Node.js 18+ instalado
- Expo CLI instalado globalmente
- Android Studio (para emulador) ou dispositivo Android físico

### Instalação

1. **Clone o projeto** (ou já está no diretório biblia):
```bash
cd c:\Users\renan\Desktop\biblia
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Inicie o servidor Expo**:
```bash
npm start
```

4. **Execute no Android**:
   - Pressione `a` para abrir no emulador Android
   - Ou escaneie o QR code com o app Expo Go no seu celular

### Primeira Execução
- O app levará 1-2 minutos na primeira vez para configurar o banco de dados
- Após isso, tudo funcionará instantaneamente offline!

## 📱 Telas Principais

### 🏠 Tela Inicial
- Versículo do dia com imagem
- Acesso rápido à Bíblia, Torah, Alcorão e Apócrifos
- Busca de versículos
- Configurações

### 📚 Biblioteca
- Navege por todos os livros
- Filtro por Bíblia, Torah, Alcorão ou Apócrifos
- Informações sobre cada livro

### 📖 Leitura
- Interface limpa e focada
- Navegação entre capítulos
- Seleção de versículos
- SEM anúncios durante a leitura

### 🔍 Busca
- Pesquise palavras-chave
- Resultados com referências completas
- Toque para ir direto ao capítulo

### ⚙️ Configurações
- Escolha sua versão preferida
- Ative/desative versículo diário
- Teste notificações

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Toolchain e runtime
- **TypeScript** - Type safety
- **SQLite** - Banco de dados offline
- **React Navigation** - Navegação entre telas
- **Expo Notifications** - Notificações push
- **Expo Sharing** - Compartilhamento social

## 📦 Estrutura do Projeto

```
biblia/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── BibleReader.tsx
│   │   └── DailyVerseCard.tsx
│   ├── screens/         # Telas do app
│   │   ├── HomeScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── ReadingScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/        # Lógica de negócio
│   │   ├── bibleService.ts
│   │   └── notificationService.ts
│   ├── database/        # SQLite
│   │   ├── schema.ts
│   │   └── init.ts
│   ├── data/            # Dados estáticos
│   │   ├── bibleStructure.ts
│   │   └── sampleVerses.ts
│   ├── styles/          # Temas
│   │   └── theme.ts
│   └── types/           # TypeScript types
│       └── index.ts
├── App.tsx              # Componente raiz
├── app.json             # Configuração Expo
└── package.json         # Dependências
```

## 🎯 Próximos Passos

- [ ] Adicionar mais versículos para todas as passagens
- [ ] Implementar sistema de favoritos
- [ ] Adicionar histórico de leitura
- [ ] Integrar anúncios não-intrusivos (AdMob)
- [ ] Preparar para publicação na Google Play Store
- [ ] Expandir para iOS (futuro)
- [ ] Versão web (futuro)

## 📄 Licença

Este projeto é para uso pessoal e estudo bíblico.

## 🙏 Créditos

Desenvolvido com ❤️ para ajudar pessoas a lerem e estudarem a Palavra de Deus.

---

**Versão**: 1.0.0  
**Plataforma**: Android (iOS e Web em breve)
