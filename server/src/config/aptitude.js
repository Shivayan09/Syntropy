export const MAX_APTITUDE_QUESTIONS = 25;
export const MIN_APTITUDE_QUESTIONS = 5;
export const MAX_APTITUDE_DURATION = 120;
export const MIN_APTITUDE_DURATION = 5;

export const APTITUDE_SECTIONS = [
    {
        key: "quantitative",
        label: "Quantitative Aptitude",
        blurb: "Numbers, arithmetic and speed maths asked in every placement round.",
        topics: [
            "Number System",
            "LCM and HCF",
            "Percentages",
            "Profit and Loss",
            "Simple and Compound Interest",
            "Ratio and Proportion",
            "Averages",
            "Mixtures and Alligations",
            "Time and Work",
            "Pipes and Cisterns",
            "Time Speed and Distance",
            "Boats and Streams",
            "Problems on Ages",
            "Permutation and Combination",
            "Probability",
            "Mensuration",
            "Geometry",
            "Algebra",
            "Number Series",
            "Partnership"
        ]
    },
    {
        key: "logical",
        label: "Logical Reasoning",
        blurb: "Pattern, deduction and puzzle rounds used to shortlist candidates.",
        topics: [
            "Series Completion",
            "Analogy",
            "Classification",
            "Coding Decoding",
            "Blood Relations",
            "Direction Sense",
            "Syllogism",
            "Seating Arrangement",
            "Puzzles",
            "Statement and Conclusion",
            "Statement and Assumption",
            "Clocks and Calendars",
            "Cubes and Dice",
            "Venn Diagrams",
            "Data Sufficiency",
            "Order and Ranking",
            "Input Output",
            "Odd One Out"
        ]
    },
    {
        key: "verbal",
        label: "Verbal Ability",
        blurb: "English usage and comprehension sections of aptitude papers.",
        topics: [
            "Reading Comprehension",
            "Synonyms",
            "Antonyms",
            "Sentence Correction",
            "Spotting Errors",
            "Para Jumbles",
            "Fill in the Blanks",
            "Idioms and Phrases",
            "One Word Substitution",
            "Sentence Completion",
            "Critical Reasoning",
            "Active and Passive Voice",
            "Direct and Indirect Speech",
            "Articles and Prepositions"
        ]
    },
    {
        key: "data-interpretation",
        label: "Data Interpretation",
        blurb: "Chart, table and caselet reading rounds common in analyst interviews.",
        topics: [
            "Table Charts",
            "Bar Graphs",
            "Line Graphs",
            "Pie Charts",
            "Caselet DI",
            "Mixed Charts",
            "Data Comparison",
            "Data Sufficiency in DI"
        ]
    }
];

export const COMPANY_TARGETS = [
    {
        key: "general",
        label: "General Placement",
        hint: "Balanced campus placement pattern with moderate difficulty and standard shortcuts."
    },
    {
        key: "tcs",
        label: "TCS NQT",
        hint: "TCS NQT style: numerical ability, reasoning ability and verbal ability with heavy time pressure and compact word problems."
    },
    {
        key: "infosys",
        label: "Infosys",
        hint: "Infosys style: heavier logical reasoning and puzzles, moderate quant, very high accuracy expectation."
    },
    {
        key: "wipro",
        label: "Wipro",
        hint: "Wipro NLTH style: quant, reasoning and verbal with straightforward but strictly time boxed questions."
    },
    {
        key: "accenture",
        label: "Accenture",
        hint: "Accenture style: common applications, quant and verbal at easy to medium difficulty with a speed focus."
    },
    {
        key: "cognizant",
        label: "Cognizant",
        hint: "Cognizant GenC style: quant and reasoning built around application based word problems."
    },
    {
        key: "capgemini",
        label: "Capgemini",
        hint: "Capgemini style: game based logic, pattern reasoning and standard arithmetic."
    },
    {
        key: "product",
        label: "Product Companies",
        hint: "Product company style: harder probability, combinatorics, puzzles and multi step quantitative reasoning."
    },
    {
        key: "banking",
        label: "Banking and Govt",
        hint: "Banking exam style: fast arithmetic, data interpretation sets and reasoning puzzles."
    },
    {
        key: "cat",
        label: "CAT / MBA",
        hint: "MBA entrance style: multi step quant, dense DI sets and inference heavy verbal reasoning."
    }
];

export const APTITUDE_PRESETS = [
    {
        key: "placement-mock",
        label: "Full Placement Mock",
        description: "All four sections in one timed set, closest to a real aptitude round.",
        sections: ["quantitative", "logical", "verbal", "data-interpretation"],
        topics: [],
        questions: 24,
        duration: 30,
        difficulty: "Medium",
        company: "general"
    },
    {
        key: "quant-sprint",
        label: "Quant Speed Sprint",
        description: "Arithmetic drill that trains you to solve in under a minute per question.",
        sections: ["quantitative"],
        topics: ["Percentages", "Profit and Loss", "Time and Work", "Time Speed and Distance", "Averages"],
        questions: 20,
        duration: 20,
        difficulty: "Medium",
        company: "tcs"
    },
    {
        key: "reasoning-puzzles",
        label: "Reasoning and Puzzles",
        description: "Seating, syllogism and puzzle heavy set used by service companies.",
        sections: ["logical"],
        topics: ["Seating Arrangement", "Puzzles", "Syllogism", "Blood Relations", "Coding Decoding"],
        questions: 15,
        duration: 25,
        difficulty: "Medium",
        company: "infosys"
    },
    {
        key: "verbal-drill",
        label: "Verbal Ability Drill",
        description: "Grammar, vocabulary and comprehension practice for the English section.",
        sections: ["verbal"],
        topics: ["Sentence Correction", "Spotting Errors", "Para Jumbles", "One Word Substitution", "Fill in the Blanks"],
        questions: 15,
        duration: 15,
        difficulty: "Medium",
        company: "general"
    },
    {
        key: "di-focus",
        label: "Data Interpretation Focus",
        description: "Chart and caselet reading with calculation shortcuts.",
        sections: ["data-interpretation"],
        topics: ["Table Charts", "Bar Graphs", "Pie Charts", "Caselet DI"],
        questions: 12,
        duration: 20,
        difficulty: "Medium",
        company: "banking"
    },
    {
        key: "hard-round",
        label: "Product Company Round",
        description: "Harder probability, combinatorics and puzzle questions.",
        sections: ["quantitative", "logical"],
        topics: ["Probability", "Permutation and Combination", "Puzzles", "Data Sufficiency"],
        questions: 15,
        duration: 30,
        difficulty: "Hard",
        company: "product"
    }
];

const sectionByKey = new Map(APTITUDE_SECTIONS.map((section) => [section.key, section]));
const companyByKey = new Map(COMPANY_TARGETS.map((company) => [company.key, company]));

export const getAptitudeSection = (key) => sectionByKey.get(key) || null;

export const getCompanyTarget = (key) => companyByKey.get(key) || null;

export const getSectionLabel = (key) => getAptitudeSection(key)?.label || "Aptitude";

export const isValidAptitudeTopic = (sectionKeys, topic) =>
    sectionKeys.some((key) => getAptitudeSection(key)?.topics.includes(topic));

export const sanitizeSections = (sections = []) => {
    const unique = [];
    const seen = new Set();

    for (const raw of Array.isArray(sections) ? sections : []) {
        const key = typeof raw === "string" ? raw.trim().toLowerCase() : "";
        if (sectionByKey.has(key) && !seen.has(key)) {
            seen.add(key);
            unique.push(key);
        }
    }

    return unique;
};

export const sanitizeTopics = (sectionKeys, topics = []) => {
    const unique = [];
    const seen = new Set();

    for (const raw of Array.isArray(topics) ? topics : []) {
        const topic = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
        if (!topic || seen.has(topic.toLowerCase())) continue;
        if (!isValidAptitudeTopic(sectionKeys, topic)) continue;
        seen.add(topic.toLowerCase());
        unique.push(topic);
    }

    return unique;
};

export const buildAptitudeCatalog = () => ({
    sections: APTITUDE_SECTIONS,
    companies: COMPANY_TARGETS,
    presets: APTITUDE_PRESETS,
    limits: {
        minQuestions: MIN_APTITUDE_QUESTIONS,
        maxQuestions: MAX_APTITUDE_QUESTIONS,
        minDuration: MIN_APTITUDE_DURATION,
        maxDuration: MAX_APTITUDE_DURATION
    }
});
