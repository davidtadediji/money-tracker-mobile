/**
 * Support Context
 * 
 * Manages global state for FAQ, support tickets, onboarding, and app info
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as SupportService from '@/services/supportService';
import type {
  FAQ,
  SupportTicket,
  OnboardingStep,
  UserOnboardingProgress,
  AppInfo,
} from '@/services/supportService';

// =====================================================
// Context Types
// =====================================================

interface SupportContextValue {
  // FAQ State
  faqs: FAQ[];
  featuredFAQs: FAQ[];
  faqCategories: string[];
  
  // Support Tickets State
  tickets: SupportTicket[];
  openTicketsCount: number;
  
  // Onboarding State
  onboardingSteps: OnboardingStep[];
  onboardingProgress: UserOnboardingProgress | null;
  isOnboardingComplete: boolean;
  currentOnboardingStep: number;
  
  // App Info State
  appInfo: AppInfo | null;
  
  // Loading States
  isLoadingFAQs: boolean;
  isLoadingTickets: boolean;
  isLoadingOnboarding: boolean;
  isLoadingAppInfo: boolean;
  
  // Error States
  error: string | null;
  
  // FAQ Actions
  loadFAQs: (category?: string) => Promise<void>;
  searchFAQs: (searchTerm: string) => Promise<FAQ[]>;
  markFAQHelpful: (faqId: string, isHelpful: boolean) => Promise<void>;
  
  // Support Ticket Actions
  loadTickets: () => Promise<void>;
  createTicket: (ticketData: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<SupportTicket>;
  getTicket: (ticketId: string) => Promise<SupportTicket>;
  updateTicket: (ticketId: string, updates: Partial<SupportTicket>) => Promise<void>;
  rateTicket: (ticketId: string, rating: number, feedback?: string) => Promise<void>;
  
  // Onboarding Actions
  loadOnboarding: () => Promise<void>;
  completeStep: (stepNumber: number) => Promise<void>;
  skipStep: (stepNumber: number) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => Promise<void>;
  
  // App Info Actions
  loadAppInfo: () => Promise<void>;
  
  // Utility Actions
  refresh: () => Promise<void>;
  clearError: () => void;
}

// =====================================================
// Create Context
// =====================================================

const SupportContext = createContext<SupportContextValue | undefined>(undefined);

// =====================================================
// Provider Component
// =====================================================

export function SupportProvider({ children }: { children: React.ReactNode }) {
  // FAQ State
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [featuredFAQs, setFeaturedFAQs] = useState<FAQ[]>([]);
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(false);
  
  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  
  // Onboarding State
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [onboardingProgress, setOnboardingProgress] = useState<UserOnboardingProgress | null>(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(false);
  
  // App Info State
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoadingAppInfo, setIsLoadingAppInfo] = useState(false);
  
  // Error State
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // Computed Values
  // =====================================================

  const faqCategories = useMemo(() => {
    const categories = new Set(faqs.map(faq => faq.category));
    return Array.from(categories);
  }, [faqs]);

  const openTicketsCount = useMemo(() => {
    return tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  }, [tickets]);

  const isOnboardingComplete = useMemo(() => {
    return onboardingProgress?.is_completed || false;
  }, [onboardingProgress]);

  const currentOnboardingStep = useMemo(() => {
    return onboardingProgress?.current_step || 1;
  }, [onboardingProgress]);

  // =====================================================
  // FAQ Actions
  // =====================================================

  const loadFAQs = useCallback(async (category?: string) => {
    try {
      setIsLoadingFAQs(true);
      setError(null);

      const [allFAQs, featured] = await Promise.all([
        SupportService.getAllFAQs(category),
        SupportService.getFeaturedFAQs(),
      ]);

      setFaqs(allFAQs);
      setFeaturedFAQs(featured);
    } catch (err: any) {
      console.error('Error loading FAQs:', err);
      setError(err.message || 'Failed to load FAQs');
    } finally {
      setIsLoadingFAQs(false);
    }
  }, []);

  const searchFAQs = useCallback(async (searchTerm: string): Promise<FAQ[]> => {
    try {
      setError(null);
      const results = await SupportService.searchFAQs(searchTerm);
      return results;
    } catch (err: any) {
      console.error('Error searching FAQs:', err);
      setError(err.message || 'Failed to search FAQs');
      return [];
    }
  }, []);

  const markFAQHelpful = useCallback(async (faqId: string, isHelpful: boolean) => {
    try {
      setError(null);
      await SupportService.markFAQHelpful(faqId, isHelpful);
      
      // Update local state
      setFaqs(prev => prev.map(faq => {
        if (faq.id === faqId) {
          return {
            ...faq,
            helpful_count: isHelpful ? faq.helpful_count + 1 : faq.helpful_count,
            not_helpful_count: !isHelpful ? faq.not_helpful_count + 1 : faq.not_helpful_count,
          };
        }
        return faq;
      }));
    } catch (err: any) {
      console.error('Error marking FAQ helpful:', err);
      setError(err.message || 'Failed to mark FAQ helpful');
    }
  }, []);

  // =====================================================
  // Support Ticket Actions
  // =====================================================

  const loadTickets = useCallback(async () => {
    try {
      setIsLoadingTickets(true);
      setError(null);

      const userTickets = await SupportService.getUserSupportTickets();
      setTickets(userTickets);
    } catch (err: any) {
      console.error('Error loading tickets:', err);
      setError(err.message || 'Failed to load support tickets');
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  const createTicket = useCallback(async (
    ticketData: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<SupportTicket> => {
    try {
      setError(null);
      const newTicket = await SupportService.createSupportTicket(ticketData);
      
      // Add to local state
      setTickets(prev => [newTicket, ...prev]);
      
      return newTicket;
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Failed to create support ticket');
      throw err;
    }
  }, []);

  const getTicket = useCallback(async (ticketId: string): Promise<SupportTicket> => {
    try {
      setError(null);
      return await SupportService.getSupportTicket(ticketId);
    } catch (err: any) {
      console.error('Error getting ticket:', err);
      setError(err.message || 'Failed to get support ticket');
      throw err;
    }
  }, []);

  const updateTicket = useCallback(async (
    ticketId: string,
    updates: Partial<SupportTicket>
  ) => {
    try {
      setError(null);
      const updatedTicket = await SupportService.updateSupportTicket(ticketId, updates);
      
      // Update local state
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
    } catch (err: any) {
      console.error('Error updating ticket:', err);
      setError(err.message || 'Failed to update support ticket');
      throw err;
    }
  }, []);

  const rateTicket = useCallback(async (
    ticketId: string,
    rating: number,
    feedback?: string
  ) => {
    try {
      setError(null);
      await SupportService.rateSupportTicket(ticketId, rating, feedback);
      
      // Reload tickets to get updated data
      await loadTickets();
    } catch (err: any) {
      console.error('Error rating ticket:', err);
      setError(err.message || 'Failed to rate support ticket');
      throw err;
    }
  }, [loadTickets]);

  // =====================================================
  // Onboarding Actions
  // =====================================================

  const loadOnboarding = useCallback(async () => {
    try {
      setIsLoadingOnboarding(true);
      setError(null);

      const [steps, progress] = await Promise.all([
        SupportService.getOnboardingSteps(),
        SupportService.getUserOnboardingProgress(),
      ]);

      setOnboardingSteps(steps);
      setOnboardingProgress(progress);

      // Initialize progress if it doesn't exist
      if (!progress) {
        const newProgress = await SupportService.initializeOnboardingProgress();
        setOnboardingProgress(newProgress);
      }
    } catch (err: any) {
      console.error('Error loading onboarding:', err);
      setError(err.message || 'Failed to load onboarding');
    } finally {
      setIsLoadingOnboarding(false);
    }
  }, []);

  const completeStep = useCallback(async (stepNumber: number) => {
    try {
      setError(null);
      await SupportService.completeOnboardingStep(stepNumber);
      
      // Reload progress
      const updatedProgress = await SupportService.getUserOnboardingProgress();
      setOnboardingProgress(updatedProgress);
    } catch (err: any) {
      console.error('Error completing step:', err);
      setError(err.message || 'Failed to complete onboarding step');
      throw err;
    }
  }, []);

  const skipStep = useCallback(async (stepNumber: number) => {
    try {
      setError(null);
      await SupportService.skipOnboardingStep(stepNumber);
      
      // Reload progress
      const updatedProgress = await SupportService.getUserOnboardingProgress();
      setOnboardingProgress(updatedProgress);
    } catch (err: any) {
      console.error('Error skipping step:', err);
      setError(err.message || 'Failed to skip onboarding step');
      throw err;
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      setError(null);
      await SupportService.resetOnboardingProgress();
      
      // Reload progress
      const updatedProgress = await SupportService.getUserOnboardingProgress();
      setOnboardingProgress(updatedProgress);
    } catch (err: any) {
      console.error('Error resetting onboarding:', err);
      setError(err.message || 'Failed to reset onboarding');
      throw err;
    }
  }, []);

  const goToNextStep = useCallback(async () => {
    if (!onboardingProgress) return;
    
    const nextStep = onboardingProgress.current_step + 1;
    if (nextStep <= onboardingSteps.length) {
      await completeStep(onboardingProgress.current_step);
    }
  }, [onboardingProgress, onboardingSteps, completeStep]);

  const goToPreviousStep = useCallback(async () => {
    if (!onboardingProgress || onboardingProgress.current_step <= 1) return;
    
    try {
      setError(null);
      const prevStep = onboardingProgress.current_step - 1;
      await SupportService.updateOnboardingProgress({
        current_step: prevStep,
      });
      
      // Reload progress
      const updatedProgress = await SupportService.getUserOnboardingProgress();
      setOnboardingProgress(updatedProgress);
    } catch (err: any) {
      console.error('Error going to previous step:', err);
      setError(err.message || 'Failed to go to previous step');
    }
  }, [onboardingProgress]);

  // =====================================================
  // App Info Actions
  // =====================================================

  const loadAppInfo = useCallback(async () => {
    try {
      setIsLoadingAppInfo(true);
      setError(null);

      const info = await SupportService.getCurrentAppInfo();
      setAppInfo(info);
    } catch (err: any) {
      console.error('Error loading app info:', err);
      setError(err.message || 'Failed to load app info');
    } finally {
      setIsLoadingAppInfo(false);
    }
  }, []);

  // =====================================================
  // Utility Actions
  // =====================================================

  const refresh = useCallback(async () => {
    await Promise.all([
      loadFAQs(),
      loadTickets(),
      loadOnboarding(),
      loadAppInfo(),
    ]);
  }, [loadFAQs, loadTickets, loadOnboarding, loadAppInfo]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    loadFAQs();
    loadAppInfo();
    // Don't auto-load tickets and onboarding - load on demand
  }, [loadFAQs, loadAppInfo]);

  // =====================================================
  // Context Value
  // =====================================================

  const value: SupportContextValue = {
    // FAQ State
    faqs,
    featuredFAQs,
    faqCategories,
    
    // Support Tickets State
    tickets,
    openTicketsCount,
    
    // Onboarding State
    onboardingSteps,
    onboardingProgress,
    isOnboardingComplete,
    currentOnboardingStep,
    
    // App Info State
    appInfo,
    
    // Loading States
    isLoadingFAQs,
    isLoadingTickets,
    isLoadingOnboarding,
    isLoadingAppInfo,
    
    // Error State
    error,
    
    // FAQ Actions
    loadFAQs,
    searchFAQs,
    markFAQHelpful,
    
    // Support Ticket Actions
    loadTickets,
    createTicket,
    getTicket,
    updateTicket,
    rateTicket,
    
    // Onboarding Actions
    loadOnboarding,
    completeStep,
    skipStep,
    resetOnboarding,
    goToNextStep,
    goToPreviousStep,
    
    // App Info Actions
    loadAppInfo,
    
    // Utility Actions
    refresh,
    clearError,
  };

  return (
    <SupportContext.Provider value={value}>
      {children}
    </SupportContext.Provider>
  );
}

// =====================================================
// Hook to use context
// =====================================================

export function useSupport() {
  const context = useContext(SupportContext);
  
  if (context === undefined) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  
  return context;
}

