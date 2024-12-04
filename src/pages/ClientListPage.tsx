import React, { Suspense, useState, useTransition } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  //   getSortedRowModel,
  //   SortingState,
  //   getFilteredRowModel,
  //   getPaginationRowModel,
} from "@tanstack/react-table";
// import { useClients } from "../hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, fetchClients } from "@/api/clients";
// import { ModeToggle } from "@/components/mode-toggle";
import { useQuery } from "@tanstack/react-query";
import { ClientTableLoading } from "@/components/table-skeleton";
import { ModeToggle } from "@/components/mode-toggle";

// Wrapper component to handle suspense and data fetching
const ClientTableContent: React.FC<{
  page: number;
  pageSize: number;
  searchTerm: string;
}> = ({ page, pageSize, searchTerm }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["clients", page, pageSize, searchTerm],
    queryFn: () => fetchClients(page, pageSize, searchTerm),
    //   keepPreviousData: true,
  });

  // Define table columns
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "picture",
      header: "Avatar",
      cell: ({ row }) => (
        <Avatar>
          <AvatarImage
            src={row.original.picture.thumbnail}
            alt="Client Avatar"
          />
          <AvatarFallback>
            {row.original.name.first[0]}
            {row.original.name.last[0]}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "name.first",
      header: "First Name",
      cell: ({ row }) => row.original.name.first,
    },
    {
      accessorKey: "name.last",
      header: "Last Name",
      cell: ({ row }) => row.original.name.last,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "default" : "destructive"}
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  // Create table instance
  const table = useReactTable({
    data: data?.clients || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <ClientTableLoading />;
  if (isError) return <div>Error fetching clients</div>;

  return (
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};

const ClientListPage: React.FC = () => {
  // State management
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  // Handle search submission
  const handleSearch = () => {
    startTransition(() => {
      setSearchTerm(inputValue);
    });
  };

  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search clients..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (e.target.value === "") {
                handleSearch();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="max-w-md"
          />
          <Button onClick={handleSearch} disabled={isPending}>
            Search
          </Button>
        </div>
        <ModeToggle />
      </div>

      {/* Client Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <Suspense fallback={<ClientTableLoading />}>
          <ClientTableContent
            page={page}
            pageSize={pageSize}
            searchTerm={searchTerm}
          />
        </Suspense>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <p>Rows per page:</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientListPage;
