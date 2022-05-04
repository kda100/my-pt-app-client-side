export enum UpdateType {
    ADDED = "added",
    MODIFIED = "modified",
    REMOVED = "removed",
    COMPLETED = "completed",
    ERROR = "error",
}

export function encode(updateType: UpdateType): string | undefined {
    return updateType as string;
}
