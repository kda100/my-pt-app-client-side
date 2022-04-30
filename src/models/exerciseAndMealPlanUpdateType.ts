export enum UpdateType {
    ADDED = "added",
    MODIFIED = "modified",
    REMOVED = "removed",
    COMPLETED = "completed",
    ERROR = "error",
}

export function decode(updateType: string): UpdateType | undefined {
    if (Object.values(updateType).some((value: string) => value === updateType)) {
        return updateType as UpdateType;
    }
    return undefined;
}

export function encode(updateType: UpdateType): string | undefined {
    return updateType as string;
}
