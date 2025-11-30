'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Requirement, ClassifiedRequirement } from '@/lib/types';

interface AppState {
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  classifiedRequirements: ClassifiedRequirement[];
  setClassifiedRequirements: React.Dispatch<React.SetStateAction<ClassifiedRequirement[]>>;
  selectedRequirement: Requirement | null;
  setSelectedRequirement: React.Dispatch<React.SetStateAction<Requirement | null>>;
  updateRequirement: (updatedRequirement: Requirement) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [classifiedRequirements, setClassifiedRequirements] = useState<
    ClassifiedRequirement[]
  >([]);
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  const updateRequirement = (updatedRequirement: Requirement) => {
    setRequirements(prev =>
      prev.map(r => (r.id === updatedRequirement.id ? updatedRequirement : r))
    );
  };

  return (
    <AppStateContext.Provider
      value={{
        requirements,
        setRequirements,
        classifiedRequirements,
        setClassifiedRequirements,
        selectedRequirement,
        setSelectedRequirement,
        updateRequirement,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppStateProvider');
  }
  return context;
}
