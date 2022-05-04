export type NewUser = {
    firstName: string,
    lastName: string,
    dateOfBirth: FirebaseFirestore.Timestamp,
    email: string,
    isClient: boolean,
    isCoach: boolean,
};
