import React, { Suspense, useState, useTransition } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  Column,
} from "@tanstack/react-table";
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
import { useQuery } from "@tanstack/react-query";
import { ClientTableLoading } from "@/components/table-skeleton";
import { ModeToggle } from "@/components/mode-toggle";

const ClientListPage: React.FC = () => {
  // State management
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPending, startTransition] = useTransition();

  // Handle search submission
  const handleSearch = () => {
    startTransition(() => {
      setSearchTerm(inputValue);
      // Reset to first page when searching
      setPage(1);
    });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["clients", page, pageSize, searchTerm, sorting],
    queryFn: () => fetchClients(page, pageSize, searchTerm),
    // Note: Actual sorting would typically be handled server-side
  });

  // Define table columns with sorting
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "picture",
      header: "Avatar",
      enableSorting: false,
      enableColumnFilter: false,
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
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <>
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div>
                          <Filter column={header.column} />
                        </div>
                      ) : null}
                    </>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <Suspense fallback={<ClientTableLoading />}>
          <TableBody>
            {isLoading ? (
              <ClientTableLoading />
            ) : isError ? (
              <div>Error fetching clients</div>
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export default ClientListPage;
