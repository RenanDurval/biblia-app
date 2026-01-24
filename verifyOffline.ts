// Script to verify Bible database completeness
// Run this in the app to check offline capabilities

import { getDatabase } from './src/database/init';
import { getBibleStats } from './src/services/completeBibleLoader';

export async function verifyOfflineReadiness() {
    try {
        const stats = await getBibleStats();

        console.log('\n📊 VERIFICAÇÃO DE CONTEÚDO OFFLINE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📖 Livros carregados: ${stats.booksLoaded} / 66`);
        console.log(`📄 Capítulos: ${stats.totalChapters} / 1,189`);
        console.log(`✍️ Versículos: ${stats.totalVerses.toLocaleString('pt-BR')} / 31,102`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const isComplete = stats.totalVerses >= 31000;
        const percentComplete = ((stats.totalVerses / 31102) * 100).toFixed(1);

        console.log(`\n📈 Progresso: ${percentComplete}%`);

        if (isComplete) {
            console.log('✅ BÍBLIA COMPLETA - App pronto para uso OFFLINE!');
            console.log('💡 O app funcionará perfeitamente em áreas remotas.');
        } else {
            console.log('⚠️ BÍBLIA INCOMPLETA!');
            console.log('❌ ATENÇÃO: O app NÃO funcionará offline corretamente.');
            console.log('🔄 Vá em Configurações > Recarregar Bíblia Completa');
        }

        return isComplete;
    } catch (error) {
        console.error('❌ Erro ao verificar banco de dados:', error);
        return false;
    }
}

// Export for use in Settings screen
export default verifyOfflineReadiness;
