import { PatientInput } from "@/hooks/useTriage";

export interface ParsedVoiceData {
    text: string;
    extracted: Partial<PatientInput & { name: string; Age: number; Gender: string }>;
}

export const parseVoiceInput = (text: string): ParsedVoiceData => {
    const lower = text.toLowerCase()
        .replace(" over ", "/")
        .replace(" by ", "/")
        .replace(" point ", ".");

    const extracted: any = {};

    // Name extraction - multiple patterns with better heuristics
    const namePatterns = [
        /(?:my name is|i am|i'm|patient name is|patient is|name)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
        /(?:this is|speaking)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i
    ];

    for (const pattern of namePatterns) {
        const match = text.match(pattern); // Use original text for capitalization
        if (match && !match[1].toLowerCase().includes("blood") && !match[1].toLowerCase().includes("pressure")) {
            extracted.name = match[1].trim();
            break;
        }
    }

    // Age extraction with number-to-word conversion
    const numberWords: { [key: string]: number } = {
        "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
        "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
        "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
        "eighty": 80, "ninety": 90
    };

    // Try numeric age first: "I am 45", "age 45", "45 years old"
    const numericAgeMatch = lower.match(/(?:age|is|i'm|am|old)[\s:]*([\d]{1,3})(?:\s*years?)?/);
    if (numericAgeMatch) {
        const age = parseInt(numericAgeMatch[1]);
        if (age > 0 && age < 150) {
            extracted.Age = age;
        }
    }

    // Try word-based age: "I am forty five", "thirty two years old"
    if (!extracted.Age) {
        const wordAgePattern = /(?:age|is|i'm|am)\s+(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)?[\s-]*(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)?/i;
        const wordMatch = lower.match(wordAgePattern);
        if (wordMatch) {
            let age = 0;
            if (wordMatch[1]) age += numberWords[wordMatch[1].toLowerCase()] || 0;
            if (wordMatch[2]) age += numberWords[wordMatch[2].toLowerCase()] || 0;
            if (age > 0 && age < 150) {
                extracted.Age = age;
            }
        }
    }

    // Gender detection - more comprehensive patterns
    if (/\b(female|woman|girl|lady|she|her)\b/.test(lower)) {
        extracted.Gender = "Female";
    } else if (/\b(male|man|boy|gentleman|he|him|his)\b/.test(lower)) {
        // Only set Male if we haven't already set Female (to avoid false positives)
        if (!extracted.Gender) {
            extracted.Gender = "Male";
        }
    }

    // --- 2. VITALS ---

    // Temp
    const tempMatch = lower.match(/(?:temp|fever).*?(\d{2,3}(?:\.\d)?)/);
    if (tempMatch) extracted.Temperature = parseFloat(tempMatch[1]);

    // Heart Rate
    const hrMatch = lower.match(/(?:heart|hr|pulse).*?(\d{2,3})/);
    if (hrMatch) extracted.Heart_Rate = parseInt(hrMatch[1]);

    // BP (Smarter Regex: looks for "120 80" or "120/80")
    const bpMatch = lower.match(/(?:bp|pressure)?\s*?(\d{2,3})[\s\/]+(\d{2,3})/);
    if (bpMatch) {
        const s = parseInt(bpMatch[1]);
        const d = parseInt(bpMatch[2]);
        if (s > 50 && d > 30) { // Basic sanity check
            extracted.Systolic_BP = s;
            extracted.Diastolic_BP = d;
        }
    }

    // O2 Sat
    const o2Match = lower.match(/(?:sat|oxygen).*?(\d{2,3})/);
    if (o2Match) extracted.O2_Saturation = parseInt(o2Match[1]);

    // Pain
    const painMatch = lower.match(/pain.*?(\d{1,2})/);
    if (painMatch) extracted.Pain_Score = Math.min(10, parseInt(painMatch[1]));

    return { text, extracted };
};