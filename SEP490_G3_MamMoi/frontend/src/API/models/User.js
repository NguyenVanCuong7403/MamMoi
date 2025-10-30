export default class User {
  constructor({ userId, fullName, email, roleId }) {
    this.userId = userId;
    this.fullName = fullName;
    this.email = email;
    this.roleId = roleId;
  }

  get displayName() {
    return `${this.fullName} (${this.email})`;
  }
}
