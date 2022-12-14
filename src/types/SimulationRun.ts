export type SimulationRun<T = Record<string, number>> = {
    groups: { from: number; title: string }[];
    results: { group: string; values: T }[];
};
