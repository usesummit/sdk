export type SimulationRun = {
    groups: { from: number; title: string }[];
    results: { group: string; values: Record<string, number> }[];
};
