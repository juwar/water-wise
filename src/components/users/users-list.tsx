"use client";

import { useEffect, useState } from "react";
import { RoleFilter } from "./role-filter";
import { Button } from "@/components/ui/button";
import { UserDetailsDialog } from "./user-details-dialog";

interface RawUser {
  id: number;
  nik: string;
  name: string | null;
  region: string | null;
  address: string | null;
  role: string;
  createdAt: string | null;
}

interface User {
  id: number;
  nik: string;
  name: string | null;
  region: string | null;
  address: string | null;
  role: string;
  createdAt: Date | null;
  monthlyUsage?: number;
  totalUsage?: number;
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["user", "officer", "admin"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
          throw new Error("Gagal mengambil data pengguna");
        }
        const data = await response.json() as RawUser[];
        const processedData = data.map((user: RawUser) => ({
          ...user,
          name: user.name || null,
          region: user.region || null,
          address: user.address || null,
          createdAt: user.createdAt ? new Date(user.createdAt) : null,
        }));
        setUsers(processedData);
        setFilteredUsers(processedData.filter(user => selectedRoles.includes(user.role)));
      } catch (error: Error | unknown) {
        setError("Gagal memuat data pengguna");
        console.error("Terjadi kesalahan saat mengambil data pengguna:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div>Memuat data pengguna...</div>;
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
              <th className="py-3 px-4 text-left font-medium">Nama</th>
              <th className="py-3 px-4 text-left font-medium">Wilayah</th>
              <th className="py-3 px-4 text-left font-medium">Peran</th>
              <th className="py-3 px-4 text-left font-medium">Dibuat Pada</th>
              <th className="py-3 px-4 text-left font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-3 px-4">{user.nik}</td>
                <td className="py-3 px-4">{user.name || 'Tidak tersedia'}</td>
                <td className="py-3 px-4">{user.region || 'Tidak tersedia'}</td>
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
                  {user.createdAt ? user.createdAt.toLocaleDateString() : 'Tidak tersedia'}
                </td>
                <td className="py-3 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    Lihat Detail
                  </Button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center text-muted-foreground">
                  Tidak ada pengguna ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        />
      )}
    </div>
  );
}
