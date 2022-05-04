export type NewClient = {
    firstName: string,
    lastName: string,
    phoneNumber: string,
    dateOfBirth: FirebaseFirestore.Timestamp,
    email: string,
    profilePicDownloadURL: string,
    coachUID: string,
}

export type UpdateClient = {
    firstName: string,
    lastName: string,
    phoneNumber: string,
    dateOfBirth: FirebaseFirestore.Timestamp,
    profilePicDownloadURL: string,
}
