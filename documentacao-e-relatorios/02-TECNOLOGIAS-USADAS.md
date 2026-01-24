# 🛠️ Tecnologias Utilizadas

## Stack Principal

### **React Native + Expo**
- **Versão:** Expo SDK 54
- **React:** 19.1.0
- **React Native:** 0.81.5
- **Por quê?**
  - Desenvolvimento rápido
  - Suporte nativo a SQLite
  - Fácil distribuição via Expo Go
  - Build para Android/iOS com um código

---

## 📦 Dependências Principais

### **1. Banco de Dados**

#### `expo-sqlite` (v16.0.10)
- **Função:** Banco de dados local SQLite
- **Uso:**
  - Armazenamento de 31.102 versículos bíblicos
  - Favoritos, histórico, destaques
  - Configurações do usuário
- **Por quê?**
  - 100% offline
  - Rápido e eficiente
  - Nativo do Expo

```typescript
// Exemplo de uso
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('bible.db');
```

---

### **2. Navegação**

#### `@react-navigation/native` (v7.1.26)
#### `@react-navigation/stack` (v7.6.13)
- **Função:** Sistema de navegação entre telas
- **Uso:**
  - Stack Navigator para fluxo de telas
  - Navegação Home → Biblioteca → Leitura → Busca
- **Por quê?**
  - Padrão da indústria
  - Gestão de histórico de navegação
  - Animações nativas

```typescript
// Stack de navegação
<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Reading" component={ReadingScreen} />
</Stack.Navigator>
```

---

### **3. Notificações**

#### `expo-notifications` (v0.32.16)
- **Função:** Notificações push locais
- **Uso:**
  - Versículo diário às 8h da manhã
  - Lembretes de leitura
- **Por quê?**
  - Funciona offline (local notifications)
  - Permissões gerenciadas pelo Expo

```typescript
// Agendar notificação diária
await Notifications.scheduleNotificationAsync({
  content: { title: 'Versículo do Dia', body: verseText },
  trigger: { hour: 8, minute: 0, repeats: true }
});
```

---

### **4. UI & Design**

#### `expo-linear-gradient` (v15.0.8)
- **Função:** Gradientes para UI moderna
- **Uso:**
  - Cartão de versículo diário
  - Backgrounds de telas
- **Por quê?**
  - Visual mais atraente
  - Performance nativa

#### `react-native-safe-area-context` (v5.6.0)
- **Função:** Gerenciamento de área segura (notch, barra de status)
- **Uso:**
  - SafeAreaView em todas as telas
- **Por quê?**
  - Compatibilidade com dispositivos modernos

---

### **5. Backup & Sharing**

#### `expo-file-system` (v19.0.21)
- **Função:** Sistema de arquivos
- **Uso:**
  - Criar arquivos JSON de backup
  - Leitura/escrita de dados

#### `expo-sharing` (v14.0.8)
- **Função:** Compartilhar arquivos
- **Uso:**
  - Exportar backup via WhatsApp, Drive, Email

#### `expo-document-picker` (v14.0.8)
- **Função:** Selecionador de arquivos
- **Uso:**
  - Importar backup do dispositivo

```typescript
// Export backup
const fileName = `biblia_backup_${date}.json`;
const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
await FileSystem.writeAsStringAsync(fileUri, jsonData);
await Sharing.shareAsync(fileUri);
```

---

### **6. Utilitários**

#### `expo-device` (v8.0.10)
- **Função:** Informações do dispositivo
- **Uso:**
  - Detectar tipo de dispositivo
  - Otimizações específicas

#### `expo-constants` (v18.0.13)
- **Função:** Constantes da aplicação
- **Uso:**
  - Configurações de ambiente
  - Metadados do app

#### `expo-status-bar` (v3.0.9)
- **Função:** Controle da barra de status
- **Uso:**
  - Adaptar cor da barra ao tema (dark/light)

---

## 🎨 Arquitetura de Pastas

```
biblia/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── BibleReader.tsx
│   │   └── DailyVerseCard.tsx
│   ├── screens/             # Telas do app
│   │   ├── HomeScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── ReadingScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # Lógica de negócio
│   │   ├── bibleService.ts
│   │   ├── bookmarkService.ts
│   │   ├── highlightService.ts
│   │   ├── historyService.ts
│   │   ├── progressService.ts
│   │   ├── notificationService.ts
│   │   ├── backupService.ts
│   │   └── completeBibleLoader.ts
│   ├── database/            # Banco de dados
│   │   ├── init.ts
│   │   └── schema.ts
│   ├── data/                # Dados estáticos
│   │   └── bibleStructure.ts
│   ├── styles/              # Temas e estilos
│   │   └── theme.ts
│   └── types/               # TypeScript types
│       └── index.ts
├── App.tsx                  # Componente raiz
└── package.json             # Dependências
```

---

## 🔧 Ferramentas de Desenvolvimento

### TypeScript (v5.9.2)
- **Função:** Type safety
- **Benefícios:**
  - Menos bugs
  - Melhor autocompletar
  - Documentação de código

### Git & GitHub
- **Controle de versão**
- **Repositório:** https://github.com/RenanDurval/biblia-app
- **Commits semânticos:**
  - `feat:` Novas funcionalidades
  - `fix:` Correções de bugs
  - `docs:` Documentação

---

## 📊 Dados Armazenados

### SQLite Schema

**Tabelas:**
1. `bible_versions` - Versões da Bíblia
2. `books` - 66 livros bíblicos
3. `verses` - 31.102 versículos
4. `bookmarks` - Favoritos do usuário
5. `verse_highlights` - Destaques coloridos
6. `reading_history` - Histórico de leitura
7. `user_settings` - Configurações

**Tamanho Total:** ~5-8 MB

---

## 🚀 Build & Deploy

### Desenvolvimento Local
```bash
npm install
npm start
```

### Build Android (Futuro)
```bash
expo build:android
```

### Distribuição
- Google Play Store (planejado)
- APK direto (comunidades offline)

---

## 📈 Performance

### Otimizações Implementadas
- ✅ Lazy loading de componentes
- ✅ Cache de consultas SQLite
- ✅ Virtualização de listas longas
- ✅ Debounce em busca de texto
- ✅ Compressão de dados

### Métricas Alvo
- **Carregamento inicial:** < 3s
- **Abrir capítulo:** < 500ms
- **Busca:** < 1s para 31k versículos
- **Tamanho do app:** ~40-50 MB

---

**Última Atualização:** 07/01/2026 02:21  
**Versão do Documento:** 1.0
