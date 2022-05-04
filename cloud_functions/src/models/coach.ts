export type NewClientManagementCoach = {
    firstName: string,
    lastName: string,
    phoneNumber: string,
    dateOfBirth: FirebaseFirestore.Timestamp,
    email: string,
    companyName: string,
    profilePicDownloadURL: string,
}

export type NewCoach = {
    firstName: string,
    lastName: string,
    phoneNumber: string,
    dateOfBirth: FirebaseFirestore.Timestamp,
    email: string,
    companyName: string,
    profilePicDownloadURL: string,
    clientUIDs: string[],
}

export type UpdateCoach = {
    firstName: string,
    lastName: string,
    phoneNumber: string,
    dateOfBirth: FirebaseFirestore.Timestamp,
    companyName: string,
    profilePicDownloadURL: string,
}
