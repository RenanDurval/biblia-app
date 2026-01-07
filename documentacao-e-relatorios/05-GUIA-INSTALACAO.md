# 🚀 Guia de Instalação e Desenvolvimento

## Requisitos do Sistema

### Para Desenvolvimento
- **Node.js:** v18 ou superior
- **npm** ou **yarn**
- **Expo CLI:** Instalado globalmente
- **Android Studio:** Para emulador (opcional)
- **Git:** Para controle de versão

### Para Teste
- **Expo Go:** App no celular Android/iOS
- **Conexão com internet:** Apenas para primeiro download
- **Celular:** Android 5.0+ ou iOS 13+

---

## 📦 Instalação - Passo a Passo

### 1. Clonar o Repositório

```bash
git clone https://github.com/RenanDurval/biblia-app.git
cd biblia-app
```

### 2. Instalar Dependências

```bash
npm install
```

Ou se preferir Yarn:
```bash
yarn install
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm start
```

Ou:
```bash
expo start
```

### 4. Abrir no Celular

#### Opção A: Expo Go (Recomendado para Testes)
1. Instale o **Expo Go** na Google Play / App Store
2. Escaneie o QR code que aparece no terminal
3. App abrirá automaticamente

#### Opção B: Emulador Android
```bash
npm run android
```

#### Opção C: Emulador iOS (só no Mac)
```bash
npm run ios
```

---

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Iniciar servidor
npm start

# Limpar cache
npx expo start -c

# Verificar TypeScript
npx tsc --noEmit

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Build (Produção)
```bash
# Build para Android (APK)
expo build:android

# Build para iOS (IPA)
expo build:ios
```

---

## 📂 Estrutura de Pastas Explicada

```
biblia/
│
├── App.tsx                      # Componente raiz, navegação principal
├── index.ts                     # Entry point do Expo
├── package.json                 # Dependências do projeto
├── tsconfig.json                # Configuração TypeScript
├── app.json                     # Configuração do Expo
│
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── BibleReader.tsx      # Leitor de versículos
│   │   └── DailyVerseCard.tsx   # Cartão de versículo diário
│   │
│   ├── screens/                 # Telas do aplicativo
│   │   ├── HomeScreen.tsx       # Tela inicial
│   │   ├── LibraryScreen.tsx    # Biblioteca de livros
│   │   ├── ReadingScreen.tsx    # Leitura de capítulos
│   │   ├── SearchScreen.tsx     # Busca de versículos
│   │   ├── BookmarksScreen.tsx  # Favoritos
│   │   ├── ProgressScreen.tsx   # Progresso de leitura
│   │   └── SettingsScreen.tsx   # Configurações
│   │
│   ├── services/                # Lógica de negócio
│   │   ├── bibleService.ts      # CRUD da Bíblia
│   │   ├── bookmarkService.ts   # Gerenciamento de favoritos
│   │   ├── highlightService.ts  # Sistema de destaques
│   │   ├── historyService.ts    # Histórico de leitura
│   │   ├── progressService.ts   # Cálculo de progresso
│   │   ├── notificationService.ts # Notificações
│   │   ├── backupService.ts     # Backup/Restore
│   │   └── completeBibleLoader.ts # Download da Bíblia
│   │
│   ├── database/                # Camada de dados
│   │   ├── init.ts              # Inicialização do SQLite
│   │   └── schema.ts            # Schema das tabelas
│   │
│   ├── data/                    # Dados estáticos
│   │   └── bibleStructure.ts    # Estrutura dos 66 livros
│   │
│   ├── styles/                  # Temas e estilos
│   │   └── theme.ts             # Tema light/dark
│   │
│   └── types/                   # TypeScript types
│       └── index.ts             # Interfaces e tipos
│
└── documentacao-e-relatorios/   # Documentação completa
    ├── 01-VISAO-GERAL.md
    ├── 02-TECNOLOGIAS-USADAS.md
    ├── 03-FUNCIONALIDADES.md
    ├── 04-HISTORICO-MODIFICACOES.md
    └── 05-GUIA-INSTALACAO.md
```

---

## 🔍 Como Funciona o Fluxo de Dados

### 1. Inicialização do App
```
App.tsx
  ↓
HomeScreen.tsx
  ↓
initDatabase() → Cria banco SQLite
  ↓
isBibleLoaded() → Verifica se tem versículos
  ↓
  Se NÃO → loadCompleteBible() → Baixa da internet
  Se SIM → Carrega normalmente
```

### 2. Leitura de Capítulo
```
LibraryScreen → Seleciona livro
  ↓
ReadingScreen → Seleciona capítulo
  ↓
BibleReader → bibleService.getChapterVerses()
  ↓
SQLite → SELECT * FROM verses WHERE book_id=? AND chapter=?
  ↓
Renderiza versículos na tela
```

### 3. Adicionar Favorito
```
BibleReader → Toque longo no versículo
  ↓
bookmarkService.addBookmark()
  ↓
INSERT INTO bookmarks (book_id, chapter, verse)
  ↓
Atualiza UI com ícone de estrela preenchida
```

### 4. Sistema de Backup
```
SettingsScreen → Botão "Exportar Backup"
  ↓
backupService.getBackupStats() → Mostra estatísticas
  ↓
backupService.exportBackup()
  ↓
  1. SELECT dados do SQLite
  2. JSON.stringify()
  3. FileSystem.writeAsStringAsync()
  4. Sharing.shareAsync()
  ↓
Usuário salva no WhatsApp/Drive/Email
```

---

## 🧪 Como Testar

### Teste 1: Primeira Abertura
1. Instale fresh no celular
2. Aguarde modal de "Baixando Bíblia"
3. Verifique se baixou todos os 66 livros
4. Navegue para Gênesis 1
5. Leia versículos 1-31

### Teste 2: Favoritos
1. Vá para João 3:16
2. Toque longo no versículo
3. Adicione aos favoritos
4. Volte ao Home
5. Vá em Favoritos
6. Verifique se João 3:16 está lá

### Teste 3: Marca-texto
1. Vá para Salmos 23
2. Toque longo no versículo 1
3. Escolha cor amarela
4. Verifique se ficou destacado
5. Feche e reabra o app
6. Vá novamente em Salmos 23
7. Verifique se destaque persiste

### Teste 4: Progresso
1. Leia Gênesis capítulo 1
2. Leia Gênesis capítulo 2
3. Vá em Progresso
4. Verifique se mostra 2 capítulos lidos
5. Verifique % da Bíblia

### Teste 5: Backup
1. Adicione alguns favoritos
2. Adicione alguns destaques
3. Vá em Configurações → Backup
4. Exporte backup
5. Salve no Drive
6. Desinstale o app
7. Reinstale
8. Importe o backup
9. Verifique se tudo voltou

---

## 📱 Build para Produção

### Android APK

#### 1. Configurar app.json
```json
{
  "expo": {
    "android": {
      "package": "com.renandurval.bibliasagrada",
      "versionCode": 1
    }
  }
}
```

#### 2. Build
```bash
expo build:android
```

#### 3. Download do APK
- Expo enviará email com link
- Baixe o APK
- Distribua ou publique na Play Store

### Publicação na Play Store

#### 1. Criar Conta Google Play Console
- Taxa única de $25 USD

#### 2. Preparar Assets
- Ícone (512x512 px)
- Screenshots (pelo menos 2)
- Descrição em português
- Política de privacidade

#### 3. Upload
- Upload do APK/AAB
- Preencher informações
- Aguardar revisão (~3-5 dias)

---

## 🐛 Troubleshooting

### Problema: "Module not found"
**Solução:**
```bash
rm -rf node_modules
npm install
npx expo start -c
```

### Problema: "SQLite database locked"
**Solução:**
```bash
# Fechar app completamente
# Limpar dados do app no celular
# Reiniciar
```

### Problema: "Expo Go não conecta"
**Solução:**
- Verifique se celular e PC estão na mesma rede WiFi
- Desative firewall temporariamente
- Use modo tunnel: `npx expo start --tunnel`

### Problema: "Build falhou"
**Solução:**
```bash
# Verificar se package.json está correto
# Verificar se app.json está válido
# Limpar cache: expo build:android --clear
```

---

## 📝 Boas Práticas de Desenvolvimento

### Git Workflow
```bash
# Criar branch para nova feature
git checkout -b feat/nova-funcionalidade

# Fazer mudanças
git add .
git commit -m "feat: Adiciona nova funcionalidade"

# Push para GitHub
git push origin feat/nova-funcionalidade

# Criar Pull Request no GitHub
# Após aprovação, merge para main
```

### Commits Semânticos
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### Code Style
- Use TypeScript para type safety
- Comente código complexo
- Mantenha componentes pequenos
- Extraia lógica para services
- Use async/await em vez de .then()

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/RenanDurval/biblia-app
- **Expo Docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **SQLite:** https://docs.expo.dev/versions/latest/sdk/sqlite/
- **TypeScript:** https://www.typescriptlang.org/

---

**Última Atualização:** 07/01/2026 02:21  
**Versão do Documento:** 1.0
