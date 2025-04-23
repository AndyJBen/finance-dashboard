// src/contexts/FinanceContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  fetchBills, addBill as apiAddBill, updateBill as apiUpdateBill, deleteBill as apiDeleteBill,
  fetchBankBalance, updateBankBalance as apiUpdateBankBalance,
  fetchCreditCards, addCreditCard as apiAddCreditCard,
  updateCreditCard as apiUpdateCreditCard,
  deleteCreditCard as apiDeleteCreditCard,
  apiReorderCreditCards
} from '../services/api';
import { message } from 'antd';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for bills
  const [displayedMonth, setDisplayedMonth] = useState(dayjs().startOf('month'));
  const [bankBalance, setBankBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true); // Separate loading for balance
  const [creditCards, setCreditCards] = useState([]);
  const [loadingCreditCards, setLoadingCreditCards] = useState(true); // Separate loading for credit cards
  const [error, setError] = useState(null); // Generic error state

  // Load initial bank balance
  const loadInitialBalance = useCallback(async () => {
    console.log('[FinanceContext] Attempting to load initial bank balance...');
    setLoadingBalance(true);
    setError(null); // Clear previous errors
    try {
      const data = await fetchBankBalance();
      console.log('[FinanceContext] Bank balance loaded:', data);
      setBankBalance(data.balance);
    } catch (err) {
      console.error('[FinanceContext] Failed to load bank balance:', err);
      message.error(`Failed to load bank balance: ${err.message}`);
      setError(`Failed to load bank balance: ${err.message}`); // Set error state
      setBankBalance(0); // Set a default value on error? Or keep null? Let's default to 0.
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  // Load bills for a given month (including overdue)
  const loadBillsForMonth = useCallback(async (monthDate) => {
    const monthString = monthDate.format('YYYY-MM');
    console.log(`[FinanceContext] Attempting to load bills for month: ${monthString}`);
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Fetch bills for the current month AND any unpaid bills from before this month
      const fetched = await fetchBills(monthString, true); // Pass true for includeOverdue
      console.log(`[FinanceContext] Bills loaded for ${monthString} (incl. overdue):`, fetched);
      setBills(fetched);
    } catch (err) {
      console.error(`[FinanceContext] Failed to load bills for ${monthString}:`, err);
      message.error(`Failed to load bills: ${err.message}`);
      setError(`Failed to load bills: ${err.message}`); // Set error state
      setBills([]); // Clear bills on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load credit cards
  const loadCreditCards = useCallback(async () => {
    console.log('[FinanceContext] Attempting to load credit cards...');
    setLoadingCreditCards(true);
    setError(null); // Clear previous errors
    try {
      const cards = await fetchCreditCards();
      console.log('[FinanceContext] Credit cards loaded:', cards);
      setCreditCards(cards);
    } catch (err) {
      console.error('[FinanceContext] Failed to load credit cards:', err);
      message.error(`Failed to load credit cards: ${err.message}`);
      setError(`Failed to load credit cards: ${err.message}`); // Set error state
      setCreditCards([]); // Clear cards on error
    } finally {
      setLoadingCreditCards(false);
    }
  }, []);

  // Initial effects to load data when the component mounts
  useEffect(() => {
    loadInitialBalance();
    loadCreditCards();
  }, [loadInitialBalance, loadCreditCards]); // Dependencies ensure these run once

  // Effect to load bills whenever the displayed month changes
  useEffect(() => {
    loadBillsForMonth(displayedMonth);
  }, [displayedMonth, loadBillsForMonth]); // Dependency on displayedMonth

  // Navigation functions
  const goToPreviousMonth = () => setDisplayedMonth(m => m.subtract(1, 'month').startOf('month'));
  const goToNextMonth     = () => setDisplayedMonth(m => m.add(1, 'month').startOf('month'));

  // Balance update function
  const updateBalance = useCallback(async (newData) => {
    console.log('[FinanceContext] Attempting to update balance:', newData);
    setLoadingBalance(true); // Indicate loading during update
    try {
      const updated = await apiUpdateBankBalance(newData);
      setBankBalance(updated.balance); // Update local state
      message.success('Bank balance updated.');
      return updated; // Return updated data
    } catch (err) {
      console.error('[FinanceContext] Failed to update balance:', err);
      message.error(`Failed to update balance: ${err.message}`);
      return null; // Indicate failure
    } finally {
      setLoadingBalance(false); // Finish loading
    }
  }, []); // No dependencies needed if it only uses apiUpdateBankBalance

  // --- Bill CRUD Operations ---
  const addBill = async (data) => {
    console.log('[FinanceContext] Attempting to add bill:', data);
    // No loading state change here, happens optimistically or handled by caller
    try {
      const created = await apiAddBill(data);
      message.success(`Bill "${created.name}" added.`);
      // Refresh bills for the current view after adding
      await loadBillsForMonth(displayedMonth);
      return created;
    } catch (err) {
      console.error('[FinanceContext] Failed to add bill:', err);
      message.error(`Failed to add bill: ${err.message}`);
      return null;
    }
  };

  const updateBill = async (orig, upd) => {
    console.log(`[FinanceContext] Attempting to update bill ID ${orig.id}:`, upd);
    // No loading state change here
    try {
      const updated = await apiUpdateBill(orig.id, upd);
      message.success(`Bill "${updated.name}" updated.`);
      // Refresh bills for the current view after updating
      // This ensures recurring bill changes (like next instance creation) are reflected
      await loadBillsForMonth(displayedMonth);
      return updated;
    } catch (err) {
      console.error(`[FinanceContext] Failed to update bill ID ${orig.id}:`, err);
      message.error(`Failed to update bill: ${err.message}`);
      // Optionally, revert optimistic update here if needed
      return null;
    }
  };

  const deleteBill = async (id) => {
    console.log(`[FinanceContext] Attempting to delete bill ID ${id}`);
    // Optimistic UI update: Remove the bill immediately
    const originalBills = [...bills]; // Keep a copy for potential revert
    setBills(bs => bs.filter(b => b.id !== id));
    try {
      await apiDeleteBill(id);
      message.success('Bill deleted.');
      // No need to reload bills here as the backend handles recurring cleanup
      // and the optimistic update already removed the item.
      return true;
    } catch (err) {
      console.error(`[FinanceContext] Failed to delete bill ID ${id}:`, err);
      message.error(`Failed to delete bill: ${err.message}`);
      // Revert optimistic update on failure
      setBills(originalBills);
      return false;
    }
  };
  // --- End Bill CRUD ---

  // --- Credit Card CRUD Operations ---
  const createCreditCard = async (cardData) => {
    console.log('[FinanceContext] Attempting to add credit card:', cardData);
    try {
      const newCard = await apiAddCreditCard(cardData);
      message.success(`Card "${newCard.name}" added.`);
      // Refresh credit cards list
      await loadCreditCards();
      return newCard;
    } catch (err) {
      console.error('[FinanceContext] Failed to add card:', err);
      message.error(`Failed to add card: ${err.message}`);
      return null;
    }
  };

  const editCreditCard = async (id, upd) => {
    console.log(`[FinanceContext] Attempting to update card ID ${id}:`, upd);
    // Optimistic UI update
    const originalCards = [...creditCards];
    setCreditCards(cc => cc.map(c => c.id === id ? { ...c, ...upd } : c));
    try {
      const updated = await apiUpdateCreditCard(id, upd);
      // Update state with the confirmed data from the server
      setCreditCards(cc => cc.map(c => c.id === id ? updated : c));
      message.success(`Card "${updated.name}" updated.`);
      return updated;
    } catch (err) {
      console.error(`[FinanceContext] Failed to update card ID ${id}:`, err);
      message.error(`Failed to update card: ${err.message}`);
      // Revert optimistic update
      setCreditCards(originalCards);
      return null;
    }
  };

  const removeCreditCard = async (id) => {
    console.log(`[FinanceContext] Attempting to delete card ID ${id}`);
    // Optimistic UI update
    const originalCards = [...creditCards];
    setCreditCards(cc => cc.filter(c => c.id !== id));
    try {
      await apiDeleteCreditCard(id);
      message.success('Card deleted.');
      // No need to reload cards, optimistic update is sufficient
      return true;
    } catch (err) {
      console.error(`[FinanceContext] Failed to delete card ID ${id}:`, err);
      message.error(`Failed to delete card: ${err.message}`);
      // Revert optimistic update
      setCreditCards(originalCards);
      return false;
    }
  };

  // Function to handle reordering of credit cards
  const reorderCreditCards = useCallback(async (newOrder) => {
    console.log('[FinanceContext] Attempting to reorder cards:', newOrder.map(c => c.id));
    // Optimistic UI update
    const originalCards = [...creditCards];
    setCreditCards(newOrder); // Update local state immediately

    // Prepare payload for the API (array of {id, sort_order})
    const payload = newOrder.map((c, i) => ({ id: c.id, sort_order: i }));

    // Call the API to save the new order
    const success = await apiReorderCreditCards(payload);
    if (!success) {
      // If API call fails, show error and revert the optimistic update
      message.error('Failed to save card order.');
      console.error('[FinanceContext] Reordering API call failed. Reverting.');
      setCreditCards(originalCards); // Revert to original order
    } else {
      console.log('[FinanceContext] Card reorder saved successfully.');
      // Optionally, could reload cards here to ensure full consistency,
      // but optimistic update + successful API call should be okay.
      // await loadCreditCards();
    }
    return success; // Return success status
  }, [creditCards]); // Dependency on creditCards to have the original state for revert

  // --- Derived Values (Calculated on every render) ---
  // Ensure bills is always an array, even if loading fails
  const safeBills = Array.isArray(bills) ? bills : [];
  // Get the start of the current actual month (not displayedMonth) for past due calculation
  const startOfCurrentActualMonth = dayjs().startOf('month');

  // Filter for bills that were due before the start of this actual month and are unpaid
  const pastDueBills = safeBills.filter(b =>
    !b.isPaid && dayjs(b.dueDate).isValid() && dayjs(b.dueDate).isBefore(startOfCurrentActualMonth)
  );
  // Calculate the total amount of these past due bills
  const pastDueAmt = pastDueBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Filter for bills due within the displayed month that are unpaid
  const startOfDisplayedMonth = displayedMonth.startOf('month');
  const endOfDisplayedMonth = displayedMonth.endOf('month');
  const unpaidThisMonth = safeBills.filter(b =>
    !b.isPaid &&
    dayjs(b.dueDate).isValid() &&
    dayjs(b.dueDate).isBetween(startOfDisplayedMonth, endOfDisplayedMonth, 'day', '[]') // Inclusive check
  );
  // Calculate the total amount of unpaid bills for the displayed month
  const unpaidThisMonthAmt = unpaidThisMonth.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Calculate the total amount currently due (unpaid in displayed month + all past due)
  // Note: This definition might differ from specific card displays. This is the raw total.
  const currentDueAmt = unpaidThisMonthAmt + pastDueAmt;

  // Calculate the total balance across all credit cards
  // Ensure creditCards is an array and balance is treated as a number
  const safeCreditCards = Array.isArray(creditCards) ? creditCards : [];
  const totalCCBalance = safeCreditCards.reduce((sum, c) => sum + Number(c.balance || 0), 0);

  // --- DEBUG LOGGING ---
  console.log('[FinanceContext] --- Context Value Calculation ---');
  console.log('[FinanceContext] Bills State:', bills); // Log raw bills state
  console.log('[FinanceContext] Credit Cards State:', creditCards); // Log raw credit cards state
  console.log('[FinanceContext] Calculated Past Due Amount:', pastDueAmt);
  console.log('[FinanceContext] Calculated Unpaid This Month Amount:', unpaidThisMonthAmt);
  console.log('[FinanceContext] Calculated currentDueAmt (Unpaid This Month + Past Due):', currentDueAmt);
  console.log('[FinanceContext] Calculated totalCCBalance:', totalCCBalance);
  console.log('[FinanceContext] Loading states:', { loading, loadingBalance, loadingCreditCards });
  console.log('[FinanceContext] --- End Context Value Calculation ---');
  // --- END DEBUG LOGGING ---


  // Provide all state and functions to consuming components
  return (
    <FinanceContext.Provider value={{
      // State
      bills: safeBills, // Use the safe array
      loading,
      displayedMonth,
      bankBalance,
      loadingBalance,
      creditCards: safeCreditCards, // Use the safe array
      loadingCreditCards,
      error, // Provide error state

      // Actions
      goToPreviousMonth,
      goToNextMonth,
      addBill,
      updateBill,
      deleteBill,
      updateBalance,
      createCreditCard,
      editCreditCard,
      removeCreditCard,
      reorderCreditCards,

      // Derived/Calculated Values
      pastDueBills, // Array of past due bill objects
      pastDueAmt,   // Sum of amounts for pastDueBills
      currentDueAmt, // Sum of unpaid this month + past due
      totalCCBalance, // Sum of all credit card balances

      // Flags/Helpers derived from state (can be useful for consumers)
      hasAnyPastDueBills: pastDueBills.length > 0,
      // Explicitly provide the past due amount for potential specific use in UI
      // This was used in FinancialOverviewCards subtext logic previously
      pastDueAmountFromPreviousMonths: pastDueAmt,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
