export const normalizeSubjectName = (value = "") =>
    value.trim().replace(/\s+/g, " ");

const academicKeywordStems = [
    "account", "algebra", "algorithm", "anatom", "biology", "biotech", "botany",
    "business", "calculus", "chem", "circuit", "civic", "cloud", "coding",
    "commerce", "computer", "data", "database", "dbms", "design", "digital",
    "dsa", "economic", "electrical", "electronic", "engineering", "english",
    "evs", "finance", "geography", "geometry", "grammar", "history", "hindi",
    "iot", "law", "literature", "machine", "management", "marketing", "math",
    "mathemat", "mechanical", "medicine", "microbiology", "ml", "network",
    "nursing", "operating", "os", "pharmacology", "philosophy", "physics",
    "physiology", "political", "probability", "program", "psychology", "science",
    "security", "software", "spanish", "statistics", "structure", "sanskrit",
    "sociology", "thermo", "trigonometry", "urdu", "zoology"
];

const hasRepeatedPattern = (value) => {
    const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (compact.length < 6) return false;
    return /^(.{2,10})\1+$/.test(compact);
};

const obviousGibberishFragments = ["asdf", "qwer", "zxcv", "qwerty", "asdfgh", "poiuy", "lkjh"];

const isLikelyAcronym = (value) => /^[A-Z]{2,10}$/.test(value);

const hasAcademicKeyword = (subject) => {
    const tokens = subject.toLowerCase().match(/[a-z0-9]+/g) || [];
    return tokens.some((token) =>
        academicKeywordStems.some((keyword) => token.includes(keyword) || keyword.includes(token))
    );
};

export const isValidSubjectName = (value = "") => {
    const subject = normalizeSubjectName(value);
    const acronym = isLikelyAcronym(subject);

    if (subject.length < (acronym ? 2 : 3) || subject.length > 60) return false;
    if (!/^[A-Za-z0-9][A-Za-z0-9&/+\-.,()' ]*[A-Za-z0-9)]$/.test(subject)) return false;

    const letters = (subject.match(/[A-Za-z]/g) || []).length;
    const digits = (subject.match(/[0-9]/g) || []).length;

    if (letters < 2) return false;
    if (digits > letters) return false;
    if (/(.)\1{3,}/i.test(subject.replace(/\s/g, ""))) return false;
    if (hasRepeatedPattern(subject)) return false;

    const compact = subject.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alphaTokens = subject.match(/[A-Za-z]+/g) || [];

    for (const token of alphaTokens) {
        if (!isLikelyAcronym(token) && !/[aeiou]/i.test(token)) {
            return false;
        }
        if (!isLikelyAcronym(token) && /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(token)) {
            return false;
        }
    }

    if (compact.length <= 12 && obviousGibberishFragments.some((fragment) => compact.includes(fragment))) {
        return false;
    }

    if (!acronym && !hasAcademicKeyword(subject)) {
        return false;
    }

    return true;
};

export const sanitizeSubjects = (subjects = []) => {
    const normalized = Array.isArray(subjects)
        ? subjects.map(normalizeSubjectName).filter(Boolean)
        : [];

    const uniqueSubjects = [];
    const seen = new Set();

    for (const subject of normalized) {
        const key = subject.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            uniqueSubjects.push(subject);
        }
    }

    const invalidSubjects = uniqueSubjects.filter((subject) => !isValidSubjectName(subject));

    return {
        subjects: uniqueSubjects,
        invalidSubjects
    };
};
