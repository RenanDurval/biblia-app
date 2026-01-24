const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const PDF_DIR = path.join(__dirname, '../pdfs_to_import');
const OUTPUT_FILE = path.join(__dirname, '../src/data/extra_materials.json');

async function processPdfs() {
    if (!fs.existsSync(PDF_DIR)) {
        console.log('Creating directory:', PDF_DIR);
        fs.mkdirSync(PDF_DIR, { recursive: true });
    }

    const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

    if (files.length === 0) {
        console.warn('⚠️  Nenhum arquivo PDF encontrado na pasta "pdfs_to_import".');
        console.warn('👉 Coloque seus arquivos PDF lá e rode este script novamente.');
        return;
    }

    console.log(`📚 Encontrados ${files.length} PDFs. Iniciando processamento...`);

    const materials = [];

    for (const file of files) {
        console.log(`Processando: ${file}...`);
        const filePath = path.join(PDF_DIR, file);
        const dataBuffer = fs.readFileSync(filePath);

        try {
            const data = await pdf(dataBuffer);

            // Limpeza básica do texto
            // Remove excesso de quebras de linha e espaços
            const cleanText = data.text
                .replace(/\r\n/g, '\n')
                .replace(/\n\s*\n/g, '\n\n') // Mantém parágrafos
                .trim();

            materials.push({
                id: file.replace(/\.pdf$/i, '').toLowerCase().replace(/\s+/g, '-'),
                title: file.replace(/\.pdf$/i, '').replace(/_/g, ' '),
                content: cleanText,
                pageCount: data.numpages,
                info: data.info || {},
                addedAt: new Date().toISOString()
            });
            console.log(`✅ Sucesso: ${file} (${data.numpages} páginas)`);
        } catch (e) {
            console.error(`❌ Erro ao ler ${file}:`, e.message);
        }
    }

    // Garante que o diretório de saída existe
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(materials, null, 2));
    console.log(`\n🎉 Concluído! ${materials.length} materiais salvos em:`);
    console.log(OUTPUT_FILE);
}

processPdfs().catch(console.error);
