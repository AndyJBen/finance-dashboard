// src/contexts/FinanceContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  fetchBills, addBill, updateBill, deleteBill,
  fetchBankBalance, updateBankBalance,
  fetchCreditCards, addCreditCard, updateCreditCard, deleteCreditCard, apiReorderCreditCards
} from '../services/api';
import { message } from 'antd';

// Create the context with default values
export const FinanceContext = createContext({
  // Data States
  bills: [],
  pastDueBills: [],
  displayedMonth: dayjs(),
  bankBalance: null,
  creditCards: [],

  // Loading States
  loading: true,
  loadingBalance: true,
  loadingCreditCards: true,

  // Error States
  error: null,

  // Settings States
  settings: {
    showPaidBills: false,
    showCreditCards: true,
    theme: 'light',
    defaultChartType: 'pie',
    defaultLandingPage: 'dashboard'
  },

  // NEW: Editing State
  isEditingBankBalance: false, // Add default value for editing state

  // Actions
  updateSettings: () => {},
  toggleBankBalanceEdit: () => {}, // Add default function for toggling edit mode

  // Functions
  goToPreviousMonth: () => {},
  goToNextMonth: () => {},
  addBill: async () => false,
  updateBill: async () => false,
  deleteBill: async () => false,
  updateBalance: async () => null,
  createCreditCard: async () => false,
  editCreditCard: async () => false,
  removeCreditCard: async () => false,
  reorderCreditCards: async () => false,
  loadBillsForMonth: async () => false,
});

// Provider component
export const FinanceProvider = ({ children }) => {
  // --- Data States ---
  const [bills, setBills] = useState([]);
  const [displayedMonth, setDisplayedMonth] = useState(dayjs());
  const [bankBalance, setBankBalance] = useState(null);
  const [creditCards, setCreditCards] = useState([]);

  // --- Loading States ---
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingCreditCards, setLoadingCreditCards] = useState(true);

  // --- Error States ---
  const [error, setError] = useState(null);

  // --- Settings State ---
  const [settings, setSettings] = useState({
    showPaidBills: false,
    showCreditCards: true,
    theme: 'light',
    defaultChartType: 'pie',
    defaultLandingPage: 'dashboard'
  });

  // --- NEW: Bank Balance Editing State ---
  const [isEditingBankBalance, setIsEditingBankBalance] = useState(false);

  // --- Computed Values ---
  // Filter for past due bills
  const pastDueBills = bills.filter(bill => {
    const dueDate = dayjs(bill.dueDate);
    return !bill.isPaid && dueDate.isValid() && dueDate.isBefore(dayjs(), 'day');
  });

  // Calculate total credit card balance
  const totalCreditCardBalance = creditCards.reduce((sum, card) => sum + Number(card.balance || 0), 0);

  // Check if there are past due bills from previous months
  const hasAnyPastDueBills = pastDueBills.length > 0;

  // Calculate any past due amount from previous months
  const pastDueAmountFromPreviousMonths = pastDueBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);

  // Calculate current amount due (unpaid bills in the current month)
  const currentDueAmt = bills.reduce((sum, bill) => {
    const dueDate = dayjs(bill.dueDate);
    const isCurrentMonth = dueDate.isValid() &&
      dueDate.month() === displayedMonth.month() &&
      dueDate.year() === displayedMonth.year();

    return !bill.isPaid && isCurrentMonth ? sum + Number(bill.amount || 0) : sum;
  }, 0);

  // Calculate total amount due (current + past due + unpaid 'Bill Prep')
  const dueBalanceTotal = bills.reduce((sum, bill) => {
    if (bill.isPaid) return sum;
    const dueDate = dayjs(bill.dueDate);
    const isCurrentOrPast =
      dueDate.isValid() && dueDate.isSameOrBefore(displayedMonth.endOf('month'));
    const isBillPrep = bill.category?.toLowerCase() === 'bill prep';

    return isCurrentOrPast || isBillPrep
      ? sum + Number(bill.amount || 0)
      : sum;
  }, 0) + totalCreditCardBalance;

  // --- Month Navigation Functions ---
  const goToPreviousMonth = useCallback(() => {
    setDisplayedMonth(prev => prev.subtract(1, 'month'));
  }, []);

  const goToNextMonth = useCallback(() => {
    setDisplayedMonth(prev => prev.add(1, 'month'));
  }, []);

  // --- API Functions ---

  // Load bills for the current month
  const loadBillsForMonth = useCallback(async (targetMonth = displayedMonth) => {
    setLoading(true);
    setError(null);
    try {
      const monthString = targetMonth.format('YYYY-MM');
      const fetchedBills = await fetchBills(monthString, true);
      if (Array.isArray(fetchedBills)) {
        setBills(fetchedBills);
      } else {
        throw new Error('Invalid data format received for bills');
      }
      return true;
    } catch (err) {
      console.error('Error loading bills:', err);
      setError(err.message || 'Failed to load bills. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [displayedMonth]);

  // Add a new bill
  const handleAddBill = async (billData) => {
    try {
      const result = await addBill(billData);
      if (result) {
        message.success('Bill added successfully');
        await loadBillsForMonth();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding bill:', err);
      message.error(err.message || 'Failed to add bill');
      return false;
    }
  };

  // Update an existing bill
  const handleUpdateBill = async (existingBill, updates) => {
    // Ensure existingBill is an object and has an id
    if (!existingBill || typeof existingBill !== 'object' || !existingBill.id) {
      message.error('Invalid bill data provided for update.');
      console.error('Invalid existingBill:', existingBill);
      return false;
    }

    // Optimistically update local state so UI updates immediately
    const optimisticBill = { ...existingBill, ...updates };
    setBills(prev => prev.map(b => (b.id === existingBill.id ? optimisticBill : b)));

    try {
      const result = await updateBill(existingBill.id, updates);
      if (result) {
        // Replace with server response in case it differs
        setBills(prev => prev.map(b => (b.id === existingBill.id ? { ...b, ...result } : b)));

        // If paid status changed, adjust bank balance
        if (typeof result.isPaid === 'boolean' && result.isPaid !== existingBill.isPaid && typeof bankBalance === 'number') {
          const amountValue = Number(result.amount || existingBill.amount || 0);
          const newBalance = existingBill.isPaid ? bankBalance + amountValue : bankBalance - amountValue;

          // Optimistically update local balance
          setBankBalance(newBalance);

          // Persist the updated balance
          try {
            await updateBankBalance({ balance: newBalance });
          } catch (balanceErr) {
            console.error('Error updating bank balance after bill update:', balanceErr);
          }
        }

        message.success('Bill updated successfully');
        return true;
      }

      // If no result, revert the optimistic update
      setBills(prev => prev.map(b => (b.id === existingBill.id ? existingBill : b)));
      return false;
    } catch (err) {
      // Revert optimistic update on error
      setBills(prev => prev.map(b => (b.id === existingBill.id ? existingBill : b)));
      console.error('Error updating bill:', err);
      message.error(err.message || 'Failed to update bill');
      return false;
    }
  };

  // Update a bill and optionally apply changes to future recurring bills
  const handleUpdateBillWithFuture = async (existingBill, updates, applyFields = []) => {
    const success = await handleUpdateBill(existingBill, updates);
    if (!success || !existingBill.isRecurring || applyFields.length === 0) {
      return success;
    }

    const futureBills = bills.filter(
      b => b.isRecurring && b.name === existingBill.name && dayjs(b.dueDate).isAfter(dayjs(existingBill.dueDate))
    );

    for (const bill of futureBills) {
      const futureUpdates = {};
      if (applyFields.includes('amount') && typeof updates.amount !== 'undefined') {
        futureUpdates.amount = updates.amount;
      }
      if (applyFields.includes('category') && typeof updates.category !== 'undefined') {
        futureUpdates.category = updates.category;
      }
      if (applyFields.includes('dueDate') && updates.dueDate) {
        futureUpdates.dueDate = dayjs(bill.dueDate)
          .date(dayjs(updates.dueDate).date())
          .format('YYYY-MM-DD');
      }
      if (Object.keys(futureUpdates).length > 0) {
        try {
          const result = await updateBill(bill.id, futureUpdates);
          if (result) {
            setBills(prev => prev.map(b => (b.id === bill.id ? { ...b, ...result } : b)));
          }
        } catch (err) {
          console.error('Error updating future bill:', err);
        }
      }
    }
    return true;
  };


  // Delete a bill
  const handleDeleteBill = async (billId) => {
    if (!billId) {
      message.error('Invalid bill ID for deletion');
      return false;
    }

    try {
      const result = await deleteBill(billId);
      if (result) {
        message.success('Bill deleted successfully');
        await loadBillsForMonth();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting bill:', err);
      message.error(err.message || 'Failed to delete bill');
      return false;
    }
  };

  // Load bank balance
  const loadBankBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const balanceData = await fetchBankBalance();
      if (balanceData && typeof balanceData.balance === 'number') {
        setBankBalance(balanceData.balance);
      } else {
        throw new Error('Invalid balance data received');
      }
    } catch (err) {
      console.error('Error loading bank balance:', err);
      // Set balance to null on error
      setBankBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  // Update bank balance
  const handleUpdateBalance = async (balanceData) => {
    setLoadingBalance(true);
    try {
      const result = await updateBankBalance(balanceData);
      if (result && typeof result.balance === 'number') {
        setBankBalance(result.balance);
        message.success('Balance updated successfully');
        return result; // Return the updated balance data
      }
      throw new Error('Failed to update balance');
    } catch (err) {
      console.error('Error updating balance:', err);
      message.error(err.message || 'Failed to update balance');
      return null; // Return null on failure
    } finally {
      setLoadingBalance(false);
    }
  };

  // Load credit cards
  const loadCreditCards = useCallback(async () => {
    setLoadingCreditCards(true);
    try {
      const cards = await fetchCreditCards();
      if (Array.isArray(cards)) {
        setCreditCards(cards);
      } else {
        throw new Error('Invalid credit card data received');
      }
    } catch (err) {
      console.error('Error loading credit cards:', err);
      // Set to empty array on error
      setCreditCards([]);
    } finally {
      setLoadingCreditCards(false);
    }
  }, []);

  // Create a new credit card
  const handleCreateCreditCard = async (cardData) => {
    try {
      const result = await addCreditCard(cardData);
      if (result) {
        message.success('Credit card added successfully');
        await loadCreditCards();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating credit card:', err);
      message.error(err.message || 'Failed to add credit card');
      return false;
    }
  };

  // Edit an existing credit card
  const handleEditCreditCard = async (cardId, updateData) => {
    if (!cardId) {
      message.error('Invalid card ID for update');
      return false;
    }

    try {
      const result = await updateCreditCard(cardId, updateData);
      if (result) {
        message.success('Credit card updated successfully');
        await loadCreditCards();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating credit card:', err);
      message.error(err.message || 'Failed to update credit card');
      return false;
    }
  };

  // Remove a credit card
  const handleRemoveCreditCard = async (cardId) => {
    if (!cardId) {
      message.error('Invalid card ID for deletion');
      return false;
    }

    try {
      const result = await deleteCreditCard(cardId);
      if (result) {
        message.success('Credit card removed successfully');
        await loadCreditCards();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error removing credit card:', err);
      message.error(err.message || 'Failed to remove credit card');
      return false;
    }
  };

  // Reorder credit cards
  const handleReorderCreditCards = async (newOrderedCards) => {
    // Create array with new sort order values
    const reorderPayload = newOrderedCards.map((card, index) => ({
      id: card.id,
      sort_order: index
    }));

    try {
      const result = await apiReorderCreditCards(reorderPayload);
      if (result) {
        // Update local state without API call
        setCreditCards(newOrderedCards);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error reordering credit cards:', err);
      message.error('Failed to reorder cards');
      // Reload cards from API to ensure correct order
      await loadCreditCards();
      return false;
    }
  };

  // --- Settings Functions ---

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Save all settings to localStorage
      localStorage.setItem('financelySettings', JSON.stringify(updated));
      return updated;
    });

    // Apply appropriate side effects based on settings changes
    if (newSettings.theme) {
      // Apply theme change logic here
      document.documentElement.setAttribute('data-theme', newSettings.theme);
      localStorage.setItem('theme', newSettings.theme);
    }

    message.success('Settings updated');
  }, []); // Removed 'settings' dependency to avoid potential loops if updateSettings causes re-render

  // --- NEW: Bank Balance Edit Toggle ---
  const toggleBankBalanceEdit = useCallback((editing) => {
    setIsEditingBankBalance(editing);
  }, []);

  // --- Load Initial Data ---

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('financelySettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);

        // Apply theme if saved
        if (parsedSettings.theme) {
          document.documentElement.setAttribute('data-theme', parsedSettings.theme);
        }
      } catch (err) {
        console.error('Error parsing saved settings:', err);
      }
    }
  }, []);

  // Load bills when displayedMonth changes
  useEffect(() => {
    loadBillsForMonth();
  }, [displayedMonth, loadBillsForMonth]);

  // Load bank balance and credit cards on mount
  useEffect(() => {
    loadBankBalance();
    loadCreditCards();
  }, [loadBankBalance, loadCreditCards]);

  // Construct the context value
  const contextValue = {
    // Data
    bills,
    pastDueBills,
    displayedMonth,
    bankBalance,
    creditCards,

    // Computed values
    totalCreditCardBalance,
    dueBalanceTotal,
    hasAnyPastDueBills,
    pastDueAmountFromPreviousMonths,
    currentDueAmt,

    // Loading states
    loading,
    loadingBalance,
    loadingCreditCards,

    // Error state
    error,

    // Settings
    settings,
    updateSettings,

    // NEW: Editing State & Function
    isEditingBankBalance,
    toggleBankBalanceEdit,

    // Functions
    goToPreviousMonth,
    goToNextMonth,
    addBill: handleAddBill,
    updateBill: handleUpdateBill,
    updateBillWithFuture: handleUpdateBillWithFuture,
    deleteBill: handleDeleteBill,
    updateBalance: handleUpdateBalance,
    createCreditCard: handleCreateCreditCard,
    editCreditCard: handleEditCreditCard,
    removeCreditCard: handleRemoveCreditCard,
    reorderCreditCards: handleReorderCreditCards,
    loadBillsForMonth
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};
