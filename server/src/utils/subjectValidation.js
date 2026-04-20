export const normalizeSubjectName = (value = "") =>
    value.trim().replace(/\s+/g, " ");

const hasRepeatedPattern = (value) => {
    const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (compact.length < 6) return false;
    return /^(.{2,10})\1+$/.test(compact);
};

const obviousGibberishFragments = ["asdf", "qwer", "zxcv", "qwerty", "asdfgh", "poiuy", "lkjh"];

export const isValidSubjectName = (value = "") => {
    const subject = normalizeSubjectName(value);

    if (subject.length < 3 || subject.length > 60) return false;
    if (!/^[A-Za-z0-9][A-Za-z0-9&/+\-.,()' ]*[A-Za-z0-9)]$/.test(subject)) return false;

    const letters = (subject.match(/[A-Za-z]/g) || []).length;
    const digits = (subject.match(/[0-9]/g) || []).length;

    if (letters < 2) return false;
    if (digits > letters) return false;
    if (/(.)\1{3,}/i.test(subject.replace(/\s/g, ""))) return false;
    if (hasRepeatedPattern(subject)) return false;

    const compact = subject.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (compact.length <= 12 && obviousGibberishFragments.some((fragment) => compact.includes(fragment))) {
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
