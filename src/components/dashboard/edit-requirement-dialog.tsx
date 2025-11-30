'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/app-state-provider';
import { useEffect, useState } from 'react';
import type { Requirement } from '@/lib/types';

export function EditRequirementDialog() {
  const {
    selectedRequirement,
    setSelectedRequirement,
    updateRequirement,
  } = useAppContext();
  const [editedRequirement, setEditedRequirement] =
    useState<Requirement | null>(null);

  useEffect(() => {
    setEditedRequirement(selectedRequirement);
  }, [selectedRequirement]);

  const handleSave = () => {
    if (editedRequirement) {
      updateRequirement(editedRequirement);
    }
    setSelectedRequirement(null);
  };

  const handleCancel = () => {
    setSelectedRequirement(null);
  };

  if (!editedRequirement) return null;

  return (
    <Dialog open={!!selectedRequirement} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Requirement</DialogTitle>
          <DialogDescription>
            Make changes to the requirement details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={editedRequirement.description}
              onChange={e =>
                setEditedRequirement(prev =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Classification
            </Label>
            <Select
              value={editedRequirement.type}
              onValueChange={(value: 'functional' | 'non-functional') =>
                setEditedRequirement(prev =>
                  prev ? { ...prev, type: value } : null
                )
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="functional">Functional</SelectItem>
                <SelectItem value="non-functional">Non-functional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select
              value={editedRequirement.priority}
              onValueChange={(value: 'high' | 'medium' | 'low') =>
                setEditedRequirement(prev =>
                  prev ? { ...prev, priority: value } : null
                )
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
