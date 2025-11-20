import React, { useEffect, useState } from "react";
import UserRepository from "../API/repositories/UserRepository";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    UserRepository.getAll()
      .then(setUsers)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((u) => (
          <li key={u.userId}>{u.displayName}</li>
        ))}
      </ul>
    </div>
  );
}
