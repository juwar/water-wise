"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RecordForm } from "./record-form";

interface User {
  id: number;
  name: string;
  nik: string;
  region: string;
}

export function UserSelector() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function searchUsers() {
    if (!searchTerm) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error("Failed to search users");
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleUserSelect(user: User) {
    setSelectedUser(user);
    setUsers([]);
    setSearchTerm("");
  }

  return (
    <div className="space-y-4">
      {!selectedUser ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or NIK..."
              disabled={isLoading}
            />
            <Button onClick={searchUsers} disabled={!searchTerm || isLoading}>
              Search
            </Button>
          </div>

          {users.length > 0 && (
            <div className="rounded-md border">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-2 text-left hover:bg-muted first:rounded-t-md last:rounded-b-md"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground">
                      NIK: {user.nik} • Region: {user.region}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{selectedUser.name}</h3>
              <p className="text-sm text-muted-foreground">
                NIK: {selectedUser.nik} • Region: {selectedUser.region}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
            >
              Change User
            </Button>
          </div>

          <RecordForm
            userId={selectedUser.id.toString()}
            onSuccess={() => setSelectedUser(null)}
          />
        </div>
      )}
    </div>
  );
}
