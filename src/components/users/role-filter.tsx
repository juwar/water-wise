"use client";

interface RoleFilterProps {
  selectedRoles: string[];
  onRoleChange: (roles: string[]) => void;
}

export function RoleFilter({ selectedRoles, onRoleChange }: RoleFilterProps) {
  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      onRoleChange(selectedRoles.filter((r) => r !== role));
    } else {
      onRoleChange([...selectedRoles, role]);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleRoleToggle("user")}
        className={`px-3 py-1 rounded-full text-sm ${
          selectedRoles.includes("user")
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        Users
      </button>
      <button
        onClick={() => handleRoleToggle("officer")}
        className={`px-3 py-1 rounded-full text-sm ${
          selectedRoles.includes("officer")
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        Officers
      </button>
      <button
        onClick={() => handleRoleToggle("admin")}
        className={`px-3 py-1 rounded-full text-sm ${
          selectedRoles.includes("admin")
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        Admins
      </button>
    </div>
  );
}
