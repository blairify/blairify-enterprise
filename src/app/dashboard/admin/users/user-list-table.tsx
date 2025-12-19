"use client";

import { Typography } from "@/components/common/atoms/typography";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/db/schema/auth";

interface UserListTableProps {
  users: User[];
}

export function UserListTable({ users }: UserListTableProps) {
  if (users.length === 0) {
    return (
      <Typography.Body className="text-sm text-muted-foreground">
        No users in this enterprise yet.
      </Typography.Body>
    );
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;

    return aTime - bTime;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Job title</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.fullName}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.jobTitle ?? ""}</TableCell>
            <TableCell>
              <Badge variant="secondary">{user.role}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.isActive ? "outline" : "destructive"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableCaption>
        {users.length} user{users.length === 1 ? "" : "s"}
      </TableCaption>
    </Table>
  );
}
