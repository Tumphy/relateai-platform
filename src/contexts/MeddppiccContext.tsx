'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { meddppiccService, researchService } from '@/lib/api';
import toast from 'react-hot-toast';

interface MeddppiccSection {
  score: number;
  notes: string;
  confidence: 'low' | 'medium' | 'high';
}

interface NextStep {
  text: string;
  completed: boolean;
  dueDate: string;
}

interface Meddppicc {
  _id: string;
  account: string;
  metrics: MeddppiccSection;
  economicBuyer: MeddppiccSection;
  decisionCriteria: MeddppiccSection;
  decisionProcess: MeddppiccSection;
  paperProcess: MeddppiccSection;
  identifiedPain: MeddppiccSection;
  champion: MeddppiccSection;
  competition: MeddppiccSection;
  overallScore: number;
  dealHealth: string;
  nextSteps: NextStep[];
  dealNotes: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MeddppiccContextType {
  currentAssessment: Meddppicc | null;
  loading: boolean;
  error: string | null;
  getMeddppicc: (accountId: string) => Promise<Meddppicc | null>;
  createMeddppicc: (accountId: string, data: any) => Promise<Meddppicc | null>;
  updateMeddppicc: (accountId: string, data: any) => Promise<Meddppicc | null>;
  deleteMeddppicc: (accountId: string) => Promise<boolean>;
  generateMeddppicc: (accountId: string) => Promise<Meddppicc | null>;
  addNextStep: (accountId: string, data: { text: string; dueDate: string }) => Promise<Meddppicc | null>;
  updateNextStep: (accountId: string, stepIndex: number, data: { text?: string; completed?: boolean; dueDate?: string }) => Promise<Meddppicc | null>;
}

const MeddppiccContext = createContext<MeddppiccContextType>({
  currentAssessment: null,
  loading: false,
  error: null,
  getMeddppicc: async () => null,
  createMeddppicc: async () => null,
  updateMeddppicc: async () => null,
  deleteMeddppicc: async () => false,
  generateMeddppicc: async () => null,
  addNextStep: async () => null,
  updateNextStep: async () => null
});

export const MeddppiccProvider = ({ children }: { children: ReactNode }) => {
  const [currentAssessment, setCurrentAssessment] = useState<Meddppicc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get MEDDPPICC assessment
  const getMeddppicc = async (accountId: string): Promise<Meddppicc | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await meddppiccService.getMeddppicc(accountId);
      setCurrentAssessment(response.data.assessment);
      return response.data.assessment;
    } catch (err) {
      console.error(`Error fetching MEDDPPICC for account ${accountId}:`, err);
      setError('Failed to fetch MEDDPPICC assessment');
      
      // Don't show error toast if the assessment doesn't exist yet
      if ((err as any)?.response?.status !== 404) {
        toast.error('Failed to fetch MEDDPPICC assessment');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create MEDDPPICC assessment
  const createMeddppicc = async (accountId: string, data: any): Promise<Meddppicc | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await meddppiccService.createMeddppicc(accountId, data);
      setCurrentAssessment(response.data.assessment);
      toast.success('MEDDPPICC assessment created successfully');
      return response.data.assessment;
    } catch (err) {
      console.error(`Error creating MEDDPPICC for account ${accountId}:`, err);
      setError('Failed to create MEDDPPICC assessment');
      toast.error('Failed to create MEDDPPICC assessment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update MEDDPPICC assessment
  const updateMeddppicc = async (accountId: string, data: any): Promise<Meddppicc | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await meddppiccService.updateMeddppicc(accountId, data);
      setCurrentAssessment(response.data.assessment);
      toast.success('MEDDPPICC assessment updated successfully');
      return response.data.assessment;
    } catch (err) {
      console.error(`Error updating MEDDPPICC for account ${accountId}:`, err);
      setError('Failed to update MEDDPPICC assessment');
      toast.error('Failed to update MEDDPPICC assessment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete MEDDPPICC assessment
  const deleteMeddppicc = async (accountId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await meddppiccService.deleteMeddppicc(accountId);
      setCurrentAssessment(null);
      toast.success('MEDDPPICC assessment deleted successfully');
      return true;
    } catch (err) {
      console.error(`Error deleting MEDDPPICC for account ${accountId}:`, err);
      setError('Failed to delete MEDDPPICC assessment');
      toast.error('Failed to delete MEDDPPICC assessment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate MEDDPPICC assessment using AI
  const generateMeddppicc = async (accountId: string): Promise<Meddppicc | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await researchService.generateMeddppicc(accountId);
      setCurrentAssessment(response.data.assessment);
      toast.success('MEDDPPICC assessment generated successfully');
      return response.data.assessment;
    } catch (err) {
      console.error(`Error generating MEDDPPICC for account ${accountId}:`, err);
      setError('Failed to generate MEDDPPICC assessment');
      toast.error('Failed to generate MEDDPPICC assessment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add next step to MEDDPPICC assessment
  const addNextStep = async (accountId: string, data: { text: string; dueDate: string }): Promise<Meddppicc | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await meddppiccService.addNextStep(accountId, data);
      setCurrentAssessment(response.data.assessment);
      toast.success('Next step added successfully');
      return response.data.assessment;
    } catch (err) {
      console.error(`Error adding next step to MEDDPPICC for account ${accountId}:`, err);
      setError('Failed to add next step');
      toast.error('Failed to add next step');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update next step in MEDDPPICC assessment
  const updateNextStep = async (
    accountId: string, 
    stepIndex: number, 
    data: { text?: string; completed?: boolean; dueDate?: string }
  ): Promise<Meddppicc | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await meddppiccService.updateNextStep(accountId, stepIndex, data);
      setCurrentAssessment(response.data.assessment);
      toast.success('Next step updated successfully');
      return response.data.assessment;
    } catch (err) {
      console.error(`Error updating next step in MEDDPPICC for account ${accountId}:`, err);
      setError('Failed to update next step');
      toast.error('Failed to update next step');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MeddppiccContext.Provider
      value={{
        currentAssessment,
        loading,
        error,
        getMeddppicc,
        createMeddppicc,
        updateMeddppicc,
        deleteMeddppicc,
        generateMeddppicc,
        addNextStep,
        updateNextStep
      }}
    >
      {children}
    </MeddppiccContext.Provider>
  );
};

export const useMeddppicc = () => useContext(MeddppiccContext);