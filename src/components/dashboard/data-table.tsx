'use client';

import * as React from 'react';

import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAppContext } from '@/context/app-state-provider';
import type { UserStory, Stakeholder, Requirement } from '@/lib/types';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Requirement, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { userStories, stakeholders } = useAppContext();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Requirement Report', 14, 16);

    // Requirements Table
    (doc as any).autoTable({
        head: [['Requirement', 'Classification', 'Priority']],
        body: table.getRowModel().rows.map(row => [
            row.original.description,
            row.original.type,
            row.original.priority,
        ]),
        startY: 22,
        didDrawPage: function (data: any) {
          doc.setFontSize(18);
          doc.text('Requirement Repository', 14, data.settings.margin.top);
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY || 10;
    if (finalY > 250) {
      doc.addPage();
      finalY = 10;
    }

    // User Stories
    if (userStories.length > 0) {
      const userStoriesBody = userStories.flatMap(story => [
        [`As a ${story.userPersona}, I want to ${story.feature}, so that ${story.benefit}.`],
        ...story.acceptanceCriteria.map(ac => [`- ${ac}`]),
        [' '] // Spacer row
      ]);

      (doc as any).autoTable({
        startY: finalY + 15,
        head: [['User Stories']],
        body: userStoriesBody,
        didDrawPage: function (data: any) {
          if (data.pageNumber > 1) return;
          doc.setFontSize(18);
          doc.text('User Stories', 14, data.settings.margin.top);
        },
        theme: 'plain'
      });
      finalY = (doc as any).lastAutoTable.finalY;
    }
    
    if (finalY > 250) {
        doc.addPage();
        finalY = 10;
    }

    // Stakeholders
    if (stakeholders.length > 0) {
        const stakeholdersBody = stakeholders.map(s => [s.role, s.description]);
        (doc as any).autoTable({
            startY: finalY + 15,
            head: [['Role', 'Description']],
            body: stakeholdersBody,
            didDrawPage: function (data: any) {
              if (data.pageNumber > 1 && data.pageNumber !== (doc as any).internal.getNumberOfPages()) return;
              doc.setFontSize(18);
              doc.text('Stakeholders', 14, data.settings.margin.top);
            }
        });
    }


    doc.save('report.pdf');
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter requirements..."
          value={
            (table.getColumn('description')?.getFilterValue() as string) ?? ''
          }
          onChange={event =>
            table.getColumn('description')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={exportToPDF} variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Report as PDF
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
