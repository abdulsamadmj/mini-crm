import React, { Suspense, useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  Column,
  FilterFn,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useClientStore } from "@/store/clientStore";
import ClientProfile from "@/components/client-profile";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useToast } from "@/hooks/use-toast";

const ClientListPage: React.FC = () => {
  // State management
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { toast } = useToast();

  useEffect(() => {
    setGlobalFilter(inputValue);
  }, [inputValue]);

  const { clientDialog, setClientDialog } = useClientStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["clients", page, pageSize, sorting, globalFilter],
    queryFn: () => fetchClients(page, pageSize),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({ itemRank });

    // Return if the item should be filtered in/out
    return itemRank.passed;
  };

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
      globalFilter,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "auto",
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  return (
    <div className="w-full p-4 pb-0 space-y-4">
      <Dialog
        open={clientDialog.open}
        onOpenChange={(open) => setClientDialog({ ...clientDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
            <DialogDescription>
              {clientDialog.client ? (
                <>
                  <ClientProfile {...clientDialog.client} />
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between">
        <ModeToggle />
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Global Search..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            className="w-52"
          />
        </div>
      </div>

      {/* Client Table */}
      <Table className="relative w-full max-h-96 h-96 overflow-y-scroll">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <>
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={"header" + header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          "flex items-center"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ArrowUp height={15} />,
                          desc: <ArrowDown height={15} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {headerGroup.headers.map((header) => (
                  <TableHead key={"filter" + header.id}>
                    {header.column.getCanFilter() ? (
                      <div>
                        <Filter column={header.column} />
                      </div>
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            </>
          ))}
        </TableHeader>

        <Suspense fallback={<ClientTableLoading />}>
          <TableBody>
            {isLoading ? (
              <ClientTableLoading />
            ) : isError ? (
              <div className="flex w-full justify-center text-red-500">
                Error fetching clients
              </div>
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={"row" + row.id}
                    className="hover:cursor-pointer"
                    onClick={() =>
                      setClientDialog({
                        client: row.original,
                        open: true,
                      })
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={"cell" + cell.id}>
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
      <div className="sticky bottom-2 flex items-center justify-between space-x-2 bg-primary-foreground p-2 px-4 rounded-sm">
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
      className="w-full rounded-none"
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
