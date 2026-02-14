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

    // --- 1. DEMOGRAPHICS ---
    // Age: "50 years old", "age 50"
    const ageMatch = lower.match(/(?:age|is|old)\s*?(\d{2})\b/);
    if (ageMatch) extracted.Age = parseInt(ageMatch[1]);

    // Gender: Check Female FIRST, then Male to avoid substring overlap
    if (/\b(female|woman|girl|lady)\b/.test(lower)) {
        extracted.Gender = "Female";
    } else if (/\b(male|man|boy|gentleman)\b/.test(lower)) {
        extracted.Gender = "Male";
    }

    // Name extraction (basic heuristic)
    const nameMatch = lower.match(/(?:name is|patient is)\s+([a-z]+(?:\s+[a-z]+)?)/);
    if (nameMatch && !nameMatch[1].includes("blood")) {
        extracted.name = nameMatch[1].replace(/\b\w/g, l => l.toUpperCase());
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