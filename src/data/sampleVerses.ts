// Sample Bible Content for Testing
// This provides initial verses so the app can work offline immediately

export const sampleVerses = {
    // Genesis 1 (Complete chapter - Creation)
    genesis1: [
        { bookId: 1, chapterNumber: 1, verseNumber: 1, text: 'No princípio, criou Deus os céus e a terra.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 2, text: 'E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 3, text: 'E disse Deus: Haja luz. E houve luz.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 4, text: 'E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 5, text: 'E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã: o dia primeiro.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 6, text: 'E disse Deus: Haja uma expansão no meio das águas, e haja separação entre águas e águas.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 7, text: 'E fez Deus a expansão e fez separação entre as águas que estavam debaixo da expansão e as águas que estavam sobre a expansão. E assim foi.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 8, text: 'E chamou Deus à expansão Céus; e foi a tarde e a manhã: o dia segundo.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 9, text: 'E disse Deus: Ajuntem-se as águas debaixo dos céus num lugar; e apareça a porção seca. E assim foi.', versionId: 'acf' },
        { bookId: 1, chapterNumber: 1, verseNumber: 10, text: 'E chamou Deus à porção seca Terra; e ao ajuntamento das águas chamou Mares. E viu Deus que era bom.', versionId: 'acf' },
    ],

    // John 3:16-17 (Famous passage)
    john3_16: [
        { bookId: 43, chapterNumber: 3, verseNumber: 16, text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', versionId: 'acf' },
        { bookId: 43, chapterNumber: 3, verseNumber: 17, text: 'Porque Deus enviou o seu Filho ao mundo não para que condenasse o mundo, mas para que o mundo fosse salvo por ele.', versionId: 'acf' },
    ],

    // Psalm 23 (Complete - The Lord is my Shepherd)
    psalm23: [
        { bookId: 19, chapterNumber: 23, verseNumber: 1, text: 'O Senhor é o meu pastor; nada me faltará.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 23, verseNumber: 2, text: 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 23, verseNumber: 3, text: 'Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 23, verseNumber: 4, text: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 23, verseNumber: 5, text: 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 23, verseNumber: 6, text: 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na Casa do Senhor por longos dias.', versionId: 'acf' },
    ],

    // Psalm 91 (Protection)
    psalm91: [
        { bookId: 19, chapterNumber: 91, verseNumber: 1, text: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 91, verseNumber: 2, text: 'Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 91, verseNumber: 3, text: 'Porque ele te livrará do laço do passarinheiro e da peste perniciosa.', versionId: 'acf' },
        { bookId: 19, chapterNumber: 91, verseNumber: 4, text: 'Ele te cobrirá com as suas penas, e debaixo das suas asas estarás seguro; a sua verdade é pavês e escudo.', versionId: 'acf' },
    ],
};

/**
 * Insert sample verses into database for testing
 */
export async function insertSampleVerses(db: any): Promise<void> {
    const allVerses = [
        ...sampleVerses.genesis1,
        ...sampleVerses.john3_16,
        ...sampleVerses.psalm23,
        ...sampleVerses.psalm91,
    ];

    for (const verse of allVerses) {
        await db.runAsync(
            `INSERT OR IGNORE INTO verses (book_id, chapter_number, verse_number, text, version_id)
       VALUES (?, ?, ?, ?, ?)`,
            verse.bookId,
            verse.chapterNumber,
            verse.verseNumber,
            verse.text,
            verse.versionId
        );
    }

    console.log(`✅ ${allVerses.length} sample verses inserted`);
}
