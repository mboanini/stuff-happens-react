export default function User (userId, email, name, saltedPassword, salt) {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.saltedPassword = saltedPassword;
    this.salt = salt;
}