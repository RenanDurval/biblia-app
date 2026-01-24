// Reading Plan Data - Plano de Leitura Cronológico em 1 Ano
// Baseado na ordem cronológica dos acontecimentos bíblicos

export interface ReadingPlanDay {
    day: number;
    month: string;
    readings: Array<{
        book: string;
        chapters: string; // e.g., "1-3" or "1" or "1-3,5-7"
    }>;
}

// Plano de Leitura Cronológico - 365 dias
// Seguindo a ordem dos acontecimentos bíblicos
export const chronologicalReadingPlan: ReadingPlanDay[] = [
    // OUTUBRO (Dias 1-31)
    { day: 1, month: "Outubro", readings: [{ book: "Gn", chapters: "1-2" }] },
    { day: 2, month: "Outubro", readings: [{ book: "Gn", chapters: "3-5" }] },
    { day: 3, month: "Outubro", readings: [{ book: "Gn", chapters: "6-9" }] },
    { day: 4, month: "Outubro", readings: [{ book: "Gn", chapters: "10-11" }] },
    { day: 5, month: "Outubro", readings: [{ book: "Gn", chapters: "12-15" }] },
    { day: 6, month: "Outubro", readings: [{ book: "Gn", chapters: "16-18" }] },
    { day: 7, month: "Outubro", readings: [{ book: "Gn", chapters: "19-21" }] },
    { day: 8, month: "Outubro", readings: [{ book: "Jó", chapters: "1-5" }] },
    { day: 9, month: "Outubro", readings: [{ book: "Jó", chapters: "6-10" }] },
    { day: 10, month: "Outubro", readings: [{ book: "Jó", chapters: "11-14" }] },
    { day: 11, month: "Outubro", readings: [{ book: "Jó", chapters: "15-19" }] },
    { day: 12, month: "Outubro", readings: [{ book: "Jó", chapters: "20-24" }] },
    { day: 13, month: "Outubro", readings: [{ book: "Jó", chapters: "25-31" }] },
    { day: 14, month: "Outubro", readings: [{ book: "Jó", chapters: "32-36" }] },
    { day: 15, month: "Outubro", readings: [{ book: "Jó", chapters: "37-42" }] },
    { day: 16, month: "Outubro", readings: [{ book: "Gn", chapters: "22-24" }] },
    { day: 17, month: "Outubro", readings: [{ book: "Gn", chapters: "25-26" }] },
    { day: 18, month: "Outubro", readings: [{ book: "Gn", chapters: "27-29" }] },
    { day: 19, month: "Outubro", readings: [{ book: "Gn", chapters: "30-31" }] },
    { day: 20, month: "Outubro", readings: [{ book: "Gn", chapters: "32-34" }] },
    { day: 21, month: "Outubro", readings: [{ book: "Gn", chapters: "35-37" }] },
    { day: 22, month: "Outubro", readings: [{ book: "Gn", chapters: "38-40" }] },
    { day: 23, month: "Outubro", readings: [{ book: "Gn", chapters: "41-42" }] },
    { day: 24, month: "Outubro", readings: [{ book: "Gn", chapters: "43-45" }] },
    { day: 25, month: "Outubro", readings: [{ book: "Gn", chapters: "46-47" }] },
    { day: 26, month: "Outubro", readings: [{ book: "Gn", chapters: "48-50" }] },
    { day: 27, month: "Outubro", readings: [{ book: "Êx", chapters: "1-3" }] },
    { day: 28, month: "Outubro", readings: [{ book: "Êx", chapters: "4-6" }] },
    { day: 29, month: "Outubro", readings: [{ book: "Êx", chapters: "7-9" }] },
    { day: 30, month: "Outubro", readings: [{ book: "Êx", chapters: "10-12" }] },
    { day: 31, month: "Outubro", readings: [{ book: "Êx", chapters: "13-15" }] },

    // NOVEMBRO (Dias 32-61)
    { day: 32, month: "Novembro", readings: [{ book: "Êx", chapters: "16-18" }] },
    { day: 33, month: "Novembro", readings: [{ book: "Êx", chapters: "19-21" }] },
    { day: 34, month: "Novembro", readings: [{ book: "Êx", chapters: "22-24" }] },
    { day: 35, month: "Novembro", readings: [{ book: "Êx", chapters: "25-27" }] },
    { day: 36, month: "Novembro", readings: [{ book: "Êx", chapters: "28-29" }] },
    { day: 37, month: "Novembro", readings: [{ book: "Êx", chapters: "30-32" }] },
    { day: 38, month: "Novembro", readings: [{ book: "Êx", chapters: "33-35" }] },
    { day: 39, month: "Novembro", readings: [{ book: "Êx", chapters: "36-38" }] },
    { day: 40, month: "Novembro", readings: [{ book: "Êx", chapters: "39-40" }] },

    // Continua com o resto do plano...
    // Esse é apenas um exemplo parcial para você completar depois
];

// Mapear abreviações para book_id
export const bookAbbrevToId: { [key: string]: number } = {
    "Gn": 1, "Êx": 2, "Lv": 3, "Nm": 4, "Dt": 5,
    "Js": 6, "Jz": 7, "Rt": 8, "1Sm": 9, "2Sm": 10,
    "1Rs": 11, "2Rs": 12, "1Cr": 13, "2Cr": 14,
    "Ed": 15, "Ne": 16, "Et": 17, "Jó": 18, "Sl": 19,
    "Pv": 20, "Ec": 21, "Ct": 22, "Is": 23, "Jr": 24,
    "Lm": 25, "Ez": 26, "Dn": 27, "Os": 28, "Jl": 29,
    "Am": 30, "Ob": 31, "Jn": 32, "Mq": 33, "Na": 34,
    "Hc": 35, "Sf": 36, "Ag": 37, "Zc": 38, "Ml": 39,
    "Mt": 40, "Mc": 41, "Lc": 42, "Jo": 43, "At": 44,
    "Rm": 45, "1Co": 46, "2Co": 47, "Gl": 48, "Ef": 49,
    "Fp": 50, "Cl": 51, "1Ts": 52, "2Ts": 53, "1Tm": 54,
    "2Tm": 55, "Tt": 56, "Fm": 57, "Hb": 58, "Tg": 59,
    "1Pe": 60, "2Pe": 61, "1Jo": 62, "2Jo": 63,
    "3Jo": 64, "Jd": 65, "Ap": 66
};
