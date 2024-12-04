import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

export const TableSkeleton: React.FC<{ columnCount: number }> = ({
  columnCount,
}) => {
  return (
    <TableRow>
      {Array.from({ length: columnCount }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton className="h-8 w-full p-5" />
        </TableCell>
      ))}
    </TableRow>
  );
};

export const ClientTableLoading: React.FC = () => {
  const SKELETON_ROWS = 10;
  const COLUMN_COUNT = 5;

  return (
    <>
      {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
        <TableSkeleton key={index} columnCount={COLUMN_COUNT} />
      ))}
    </>
  );
};
