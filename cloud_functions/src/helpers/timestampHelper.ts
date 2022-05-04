export class TimeStampHelper {
    public static convertTimestampToDayMonthYear(timestamp: FirebaseFirestore.Timestamp): string {
        const date: Date = timestamp.toDate();
        const month: number = date.getUTCMonth() + 1;
        const day: number = date.getUTCDate();
        const year: number = date.getUTCFullYear();

        return (day < 10 ? `0${day}` : day) + "/" + (month < 10 ? `0${month}` : month) + "/" + year;
    }

    public static convertTimestampToHHMM(timestamp: FirebaseFirestore.Timestamp): string {
        const date: Date = timestamp.toDate();
        const hours: number = date.getHours();
        const minutes: number = date.getMinutes();

        return (hours < 10 ? `0${hours}` : hours) + ":" + (minutes < 10 ? `0${minutes}` : minutes);
    }
}
