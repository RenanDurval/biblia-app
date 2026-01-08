// Quick diagnostic script to check offline Bible status
// Run this during development to verify Bible data is loaded

import { getBibleStats } from './src/services/completeBibleLoader';

async function checkStatus() {
    console.log('\n🔍 VERIFICAÇÃO DE STATUS OFFLINE\n');
    console.log('='.repeat(50));

    try {
        const stats = await getBibleStats();

        console.log('\n📊 ESTATÍSTICAS DO BANCO DE DADOS:');
        console.log(`📖 Livros carregados: ${stats.booksLoaded} / 66`);
        console.log(`📄 Capítulos: ${stats.totalChapters} / 1,189`);
        console.log(`✍️ Versículos: ${stats.totalVerses.toLocaleString('pt-BR')} / 31,102`);

        const percentComplete = ((stats.totalVerses / 31102) * 100).toFixed(1);
        console.log(`📈 Progresso: ${percentComplete}%`);

        console.log('\n' + '='.repeat(50));

        if (stats.totalVerses >= 31000) {
            console.log('✅ STATUS: BÍBLIA COMPLETA - Pronta para uso 100% OFFLINE');
            console.log('🎉 O app pode funcionar completamente SEM internet!');
        } else if (stats.totalVerses > 0) {
            console.log('⚠️ STATUS: BÍBLIA PARCIAL - Conteúdo incompleto');
            console.log(`📥 Faltam ${31102 - stats.totalVerses} versículos`);
            console.log('💡 AÇÃO: Aguarde o carregamento completo na tela inicial');
        } else {
            console.log('❌ STATUS: BANCO VAZIO - Nenhum versículo carregado');
            console.log('💡 AÇÃO: Abra o app para carregar a Bíblia pela primeira vez');
        }

        console.log('\n');

    } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
    }
}

checkStatus();
