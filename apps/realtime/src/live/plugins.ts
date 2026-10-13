// Plugins connected to each slot, to disconnect them when their slot is removed or its token changes
const plugins = new Map<string, () => void>();

export function registerPlugin(slotId: string, close: () => void): void {
    plugins.set(slotId, close);
}

export function unregisterPlugin(slotId: string, close: () => void): void {
    if (plugins.get(slotId) === close) plugins.delete(slotId);
}

export function disconnectPlugin(slotId: string): void {
    const close = plugins.get(slotId);
    plugins.delete(slotId);
    close?.();
}
