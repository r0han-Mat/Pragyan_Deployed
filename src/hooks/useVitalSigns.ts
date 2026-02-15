import { useState, useEffect, useRef, useCallback } from 'react';

export type VitalSignType = 'heartRate' | 'spo2' | 'systolic' | 'diastolic';
export type PatientCondition = 'NORMAL' | 'TACHYCARDIA' | 'BRADYCARDIA' | 'HYPOXIA' | 'HYPERTENSIVE_CRISIS' | 'SHOCK';

interface VitalLog {
    time: string;
    value: number;
}

interface VitalsHistory {
    heartRate: VitalLog[];
    spo2: VitalLog[];
    systolic: VitalLog[];
    diastolic: VitalLog[];
}

interface CurrentVitals {
    heartRate: number;
    spo2: number;
    systolic: number;
    diastolic: number;
}

const HISTORY_LENGTH = 30; // Keep extensive history for charts

// Base ranges for conditions
const RANGES = {
    NORMAL: { hr: [60, 90], spo2: [96, 100], sys: [110, 130], dia: [70, 85] },
    TACHYCARDIA: { hr: [120, 160], spo2: [95, 99], sys: [110, 140], dia: [70, 90] },
    BRADYCARDIA: { hr: [30, 50], spo2: [94, 98], sys: [90, 110], dia: [50, 70] },
    HYPOXIA: { hr: [100, 130], spo2: [80, 88], sys: [130, 150], dia: [85, 100] },
    HYPERTENSIVE_CRISIS: { hr: [90, 120], spo2: [94, 98], sys: [180, 220], dia: [110, 130] },
    SHOCK: { hr: [130, 160], spo2: [90, 95], sys: [70, 90], dia: [40, 60] },
};

export function useVitalSigns(initialCondition: PatientCondition = 'NORMAL') {
    const [condition, setCondition] = useState<PatientCondition>(initialCondition);
    const [history, setHistory] = useState<VitalsHistory>({
        heartRate: [],
        spo2: [],
        systolic: [],
        diastolic: [],
    });

    // Use refs for the animation loop to avoid re-renders triggering effect re-runs
    const dataRef = useRef<CurrentVitals>({
        heartRate: 75,
        spo2: 98,
        systolic: 120,
        diastolic: 80,
    });

    const noiseOffset = useRef(Math.random() * 1000);

    // Helper to generate next value based on target range and current value (smoothing)
    const nextValue = useCallback((current: number, min: number, max: number, noiseFactor: number) => {
        const target = (min + max) / 2;
        const noise = (Math.random() - 0.5) * noiseFactor;
        // Move 10% towards target center + noise
        const delta = (target - current) * 0.1;
        return Math.max(min, Math.min(max, current + delta + noise));
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        let lastUpdate = Date.now();

        const updateLoop = () => {
            const now = Date.now();
            // Update at approx 20Hz for smooth graphing, but valid logs every second? 
            // Actually for React state, 1-2Hz is better for performance unless using canvas.
            // We will update state every 1000ms, but internal values can drift faster simulation if needed.

            if (now - lastUpdate >= 1000) {
                lastUpdate = now;
                const range = RANGES[condition];

                // Calculate new values with simple drift physics
                const newHR = Math.round(nextValue(dataRef.current.heartRate, range.hr[0], range.hr[1], 5));
                const newSpO2 = Math.round(nextValue(dataRef.current.spo2, range.spo2[0], range.spo2[1], 1.5));
                const newSys = Math.round(nextValue(dataRef.current.systolic, range.sys[0], range.sys[1], 4));
                const newDia = Math.round(nextValue(dataRef.current.diastolic, range.dia[0], range.dia[1], 3));

                dataRef.current = {
                    heartRate: newHR,
                    spo2: newSpO2,
                    systolic: newSys,
                    diastolic: newDia
                };

                const timeLabel = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

                setHistory(prev => {
                    const updateSeries = (series: VitalLog[], newVal: number) => {
                        const newSeries = [...series, { time: timeLabel, value: newVal }];
                        return newSeries.slice(-HISTORY_LENGTH); // Keep last N points
                    };

                    return {
                        heartRate: updateSeries(prev.heartRate, newHR),
                        spo2: updateSeries(prev.spo2, newSpO2),
                        systolic: updateSeries(prev.systolic, newSys),
                        diastolic: updateSeries(prev.diastolic, newDia),
                    };
                });
            }

            animationFrameId = requestAnimationFrame(updateLoop);
        };

        updateLoop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [condition, nextValue]);

    return {
        current: dataRef.current,
        history,
        condition,
        setCondition
    };
}
