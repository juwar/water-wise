"use client";

import { useEffect, useState } from "react";
import { RoleFilter } from "./role-filter";

interface User {
  id: number;
  nik: string;
  name: string;
  region: string;
  address: string;
  role: string;
  createdAt: string;
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["user"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (roles: string[]) => {
    setSelectedRoles(roles);
    if (roles.length === 0) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => roles.includes(user.role)));
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data.filter(user => selectedRoles.includes(user.role)));
      } catch (error) {
        setError("Failed to load users");
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="p-4 border-b flex justify-end">
        <RoleFilter selectedRoles={selectedRoles} onRoleChange={handleRoleChange} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left font-medium">NIK</th>
              <th className="py-3 px-4 text-left font-medium">Name</th>
              <th className="py-3 px-4 text-left font-medium">Region</th>
              <th className="py-3 px-4 text-left font-medium">Role</th>
              <th className="py-3 px-4 text-left font-medium">Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-3 px-4">{user.nik}</td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.region}</td>
                <td className="py-3 px-4">
                  <span className={`capitalize ${
                    user.role === "admin" 
                      ? "text-red-600"
                      : user.role === "officer"
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
