export type SimulationRequestbody = {
    parameters: Record<string, string | number>;
    externalUserId?: string;
    publicUserId?: string;
    sessionId?: string;
};
