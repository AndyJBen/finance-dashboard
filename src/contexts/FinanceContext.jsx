// src/contexts/FinanceContext.jsx
// COMPLETE FILE CODE - Fixed ReferenceError by adding derived data calculations back

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
    fetchBills, addBill as apiAddBill, updateBill as apiUpdateBill, deleteBill as apiDeleteBill,
    fetchBankBalance, updateBankBalance as apiUpdateBankBalance,
    fetchCreditCards, addCreditCard as apiAddCreditCard,
    updateCreditCard as apiUpdateCreditCard,
    deleteCreditCard as apiDeleteCreditCard,
    apiReorderCreditCards // Ensure this is imported
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
  // State
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedMonth, setDisplayedMonth] = useState(dayjs().startOf('month'));
  const [bankBalance, setBankBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [creditCards, setCreditCards] = useState([]);
  const [loadingCreditCards, setLoadingCreditCards] = useState(true);

  // Data Loading Functions
  const loadInitialBalance = useCallback(async () => {
    console.log("Context: Attempting to load initial balance...");
    setLoadingBalance(true);
    try {
      const data = await fetchBankBalance();
      setBankBalance(data.balance);
      console.log("Context: Balance loaded successfully:", data.balance);
    } catch (err) {
      console.error("Context: Error loading initial balance:", err);
      message.error(`Failed to load bank balance: ${err.message || 'Unknown error'}`);
      setError(err.message); // Set general error state if needed
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const loadBillsForMonth = useCallback(async (monthDate) => {
    const monthString = monthDate.format('YYYY-MM');
    console.log(`Context: [loadBillsForMonth] Loading bills for ${monthString} including overdue...`);
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Fetch bills including overdue ones relative to the start of the *current actual* month
      const fetchedBills = await fetchBills(monthString, true);
      console.log(`Context: [loadBillsForMonth] Fetched raw bills for ${monthString}:`, fetchedBills);
      setBills(fetchedBills);
      console.log(`Context: [loadBillsForMonth] Bills state updated for ${monthString}. Count: ${fetchedBills.length}`);
    } catch (err) {
      console.error(`Context: [loadBillsForMonth] Error loading bills for ${monthString}:`, err);
      message.error(`Failed to load bills: ${err.message || 'Unknown error'}`);
      setError(err.message); // Set general error state
      setBills([]); // Reset bills on error
    } finally {
      setLoading(false);
    }
  }, []); // Removed displayedMonth dependency as loadBillsForMonth takes monthDate directly

  const loadCreditCards = useCallback(async () => {
      console.log("Context: Attempting to load credit cards...");
      setLoadingCreditCards(true);
      try {
          const cards = await fetchCreditCards(); // Assumes backend sorts by sort_order
          console.log("Context: Fetched credit cards:", cards);
          setCreditCards(cards);
      } catch (err) {
          console.error("Context: Error loading credit cards:", err);
          message.error(`Failed to load credit cards: ${err.message || 'Unknown error'}`);
      } finally { setLoadingCreditCards(false); }
  }, []);

  // Effects
  useEffect(() => {
    loadInitialBalance();
    loadCreditCards();
  }, [loadInitialBalance, loadCreditCards]); // Run once on mount

  useEffect(() => {
    // Load bills relevant to the displayed month when it changes
    loadBillsForMonth(displayedMonth);
  }, [displayedMonth, loadBillsForMonth]); // Run when displayedMonth changes

  // Navigation
  const goToPreviousMonth = () => {
      console.log("[FinanceContext] Navigating to previous month.");
      setDisplayedMonth(prev => prev.subtract(1, 'month').startOf('month'));
  };
  const goToNextMonth = () => {
      console.log("[FinanceContext] Navigating to next month.");
      setDisplayedMonth(prev => prev.add(1, 'month').startOf('month'));
  };

  // Balance Update
  const updateBalance = useCallback(async (newBalanceData) => {
     console.log("Context: Attempting to update balance manually:", newBalanceData);
     setLoadingBalance(true);
     try {
        const updatedData = await apiUpdateBankBalance(newBalanceData);
        setBankBalance(updatedData.balance);
        message.success('Bank balance updated successfully.');
        console.log("Context: Balance updated successfully:", updatedData.balance);
        return updatedData;
     } catch (err) {
        console.error("Context: Error updating bank balance:", err);
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
        message.error(`Failed to update balance: ${errorMsg}`);
        return null;
     } finally {
         setLoadingBalance(false);
     }
  }, []);

  // Bill Management
  const addBill = async (billData) => {
     console.log("Context: [addBill] Attempting to add bill:", billData);
     try {
        const newBill = await apiAddBill(billData);
        message.success(`Bill "${newBill.name}" added successfully.`);
        await loadBillsForMonth(displayedMonth); // Refresh bills for the current view
        return newBill;
     } catch (err) {
        console.error("Context: [addBill] Error adding bill:", err);
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
        message.error(`Failed to add bill: ${errorMsg}`);
        return null;
     }
  };
  const updateBill = async (originalBillRecord, updatedData) => {
     if (!originalBillRecord || typeof originalBillRecord.id === 'undefined') {
         console.error("Context: [updateBill] Invalid originalBillRecord provided:", originalBillRecord);
         message.error("Cannot update bill: Invalid original data.");
         return null;
     }
     const billId = originalBillRecord.id;
     console.log(`Context: [updateBill] Attempting to update bill ${billId}:`, updatedData);
     try {
        const updatedBill = await apiUpdateBill(billId, updatedData);
        console.log(`Context: [updateBill] API update successful for bill ${billId}.`);
        // Optional: Balance Adjustment Logic
        let balanceAdjustment = 0;
        const originalAmount = Number(originalBillRecord.amount) || 0;
        const updatedAmount = Number(updatedBill.amount) || 0;
        const justMarkedPaid = updatedBill.isPaid && !originalBillRecord.isPaid;
        const justMarkedUnpaid = !updatedBill.isPaid && originalBillRecord.isPaid;
        if (justMarkedPaid) { balanceAdjustment = -updatedAmount; }
        else if (justMarkedUnpaid) { balanceAdjustment = +originalAmount; }
        else if (updatedBill.isPaid && updatedData.amount !== undefined && updatedAmount !== originalAmount) { const amountDifference = updatedAmount - originalAmount; balanceAdjustment = -amountDifference; }
        if (balanceAdjustment !== 0 && bankBalance !== null) {
            const newBalance = bankBalance + balanceAdjustment;
            try { await apiUpdateBankBalance({ balance: newBalance }); setBankBalance(newBalance); }
            catch (balanceError) { console.error(`Context: [updateBill] Failed to auto-update bank balance:`, balanceError); message.error(`Failed to automatically update bank balance: ${balanceError.message || 'Unknown error'}`); }
        }
        message.success(`Bill "${updatedBill.name}" updated successfully.`);
        await loadBillsForMonth(displayedMonth); // Refresh bills
        return updatedBill;
     } catch (err) {
        console.error(`Context: [updateBill] Error updating bill ${billId}:`, err);
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
        message.error(`Failed to update bill: ${errorMsg}`);
        return null;
     }
  };
  const deleteBill = async (id) => {
      console.log(`Context: [deleteBill] Attempting to delete bill ID: ${id}`);
      const billToDelete = bills.find(b => b.id === id);
      if (!billToDelete) { console.error(`Context: [deleteBill] Bill with ID ${id} not found.`); message.error('Could not find the bill to delete.'); return false; }
      try {
        await apiDeleteBill(id);
        // Optional: Balance Adjustment Logic
        let balanceAdjustment = 0;
        if (billToDelete.isPaid) {
            balanceAdjustment = +Number(billToDelete.amount || 0);
            if (balanceAdjustment !== 0 && bankBalance !== null) {
                const newBalance = bankBalance + balanceAdjustment;
                try { await apiUpdateBankBalance({ balance: newBalance }); setBankBalance(newBalance); }
                catch (balanceError) { console.error(`Context: [deleteBill] Failed to auto-update bank balance:`, balanceError); message.error(`Failed to automatically update bank balance: ${balanceError.message || 'Unknown error'}`); }
            }
        }
        // Update local state immediately
        setBills(prevBills => prevBills.filter(bill => bill.id !== id));
        message.success(`Bill "${billToDelete.name}" deleted successfully.`);
        return true;
      } catch (err) {
        console.error(`Context: [deleteBill] Error deleting bill ID ${id}:`, err);
        const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
        message.error(`Failed to delete bill: ${errorMsg}`);
        return false;
      }
  };

  // Credit Card Management
  const createCreditCard = async (cardData) => {
      console.log("Context: Attempting to add credit card:", cardData);
      try {
          const newCard = await apiAddCreditCard(cardData);
          await loadCreditCards(); // Reload cards to get correct order
          message.success(`Credit card "${newCard.name}" added.`);
          return newCard;
      } catch (err) {
          console.error("Context: Error adding credit card:", err);
          const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
          message.error(`Failed to add credit card: ${errorMsg}`);
          return null;
      }
  };
  const editCreditCard = async (cardId, updateData) => {
      console.log(`Context: Attempting to update card ${cardId}:`, updateData);
      try {
          const updatedCard = await apiUpdateCreditCard(cardId, updateData);
          setCreditCards(prevCards => prevCards.map(card => card.id === cardId ? updatedCard : card ));
          message.success(`"${updatedCard.name}" updated successfully.`);
          return updatedCard;
      } catch (err) {
          console.error(`Context: Error updating card ${cardId}:`, err);
          const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
          message.error(`Failed to update card: ${errorMsg}`);
          return null;
      }
  };
  const removeCreditCard = async (cardId) => {
       console.log(`Context: [removeCreditCard] Attempting to delete credit card ID: ${cardId}`);
       const cardToDelete = creditCards.find(c => c.id === cardId);
       if (!cardToDelete) { console.error(`Context: [removeCreditCard] Card with ID ${cardId} not found.`); message.error('Could not find the credit card to delete.'); return false; }
       try {
           await apiDeleteCreditCard(cardId);
           setCreditCards(prevCards => prevCards.filter(card => card.id !== cardId));
           message.success(`Credit card "${cardToDelete.name}" deleted.`);
           // Consider re-sequencing sort_order after delete if needed
           return true;
       } catch (err) {
           console.error(`Context: [removeCreditCard] Error deleting card ID ${cardId}:`, err);
           const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
           message.error(`Failed to delete credit card: ${errorMsg}`);
           return false;
       }
  };
  const reorderCreditCards = useCallback(async (reorderedCards) => {
    console.log("Context: [reorderCreditCards] Received reordered cards array:", JSON.stringify(reorderedCards, null, 2));
    setCreditCards(reorderedCards); // Optimistic Update
    const payload = reorderedCards.map((card, index) => ({ id: card.id, sort_order: index }));
    console.log("Context: [reorderCreditCards] Sending payload to API:", JSON.stringify(payload, null, 2));
    try {
        console.log("Context: [reorderCreditCards] Calling apiReorderCreditCards...");
        const success = await apiReorderCreditCards(payload);
        console.log("Context: [reorderCreditCards] API call result (success):", success);
        if (!success) {
            console.error("Context: [reorderCreditCards] Backend update failed. Reverting.");
            message.error("Failed to save card order. Please refresh.");
            await loadCreditCards();
            return false;
        }
        return true;
    } catch (error) {
        console.error("Context: [reorderCreditCards] Error calling API:", error);
        message.error(`Error saving card order: ${error.message || 'Unknown error'}`);
        await loadCreditCards();
        return false;
    }
  }, [loadCreditCards]);


  // --- START: Derived Data Calculations (Added Back) ---
  const safeBills = Array.isArray(bills) ? bills : [];
  const startOfCurrentActualMonth = dayjs().startOf('month'); // Use current actual month for overdue calc

  // Calculate overdue bills (due before the start of the current actual month)
  const overdueBills = safeBills.filter(bill =>
      !bill.isPaid &&
      dayjs(bill.dueDate).isValid() &&
      dayjs(bill.dueDate).isBefore(startOfCurrentActualMonth)
  );

  // Calculate amount for those overdue bills
  const pastDueAmountFromPreviousMonths = overdueBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);

  // Calculate total currently due (using overdue amount + unpaid in current actual month)
  // Note: This calculation might need refinement based on exact definition of "currently due"
  const endOfCurrentActualMonth = dayjs().endOf('month');
  const unpaidBillsForCurrentActualMonth = safeBills.filter(bill =>
      !bill.isPaid &&
      dayjs(bill.dueDate).isValid() &&
      dayjs(bill.dueDate).isBetween(startOfCurrentActualMonth, endOfCurrentActualMonth, 'day', '[]')
  );
  const totalAmountDueCurrentActualMonth = unpaidBillsForCurrentActualMonth.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const totalCurrentlyDue = totalAmountDueCurrentActualMonth + pastDueAmountFromPreviousMonths;

  // Flag if any bills are overdue
  const hasAnyPastDueBills = overdueBills.length > 0;

  // Calculate total credit card balance
  const totalCreditCardBalance = Array.isArray(creditCards)
    ? creditCards.reduce((sum, card) => sum + Number(card.balance || 0), 0)
    : 0;
  // --- END: Derived Data Calculations ---


  // --- Context Value ---
  const value = {
    bills: safeBills, // Use the safeBills array
    loading,
    error,
    displayedMonth,
    loadBillsForMonth, // Expose function to load bills for specific month
    addBill,
    updateBill,
    deleteBill,
    goToPreviousMonth,
    goToNextMonth,
    bankBalance,
    loadingBalance,
    updateBalance,
    // Pass the calculated derived values
    pastDueBillsFromPreviousMonths: overdueBills, // Pass the calculated list
    pastDueAmountFromPreviousMonths,
    totalCurrentlyDue,
    hasAnyPastDueBills,
    creditCards, // Pass the list of cards (ordered by sort_order)
    loadingCreditCards,
    totalCreditCardBalance, // Pass the calculated total balance
    createCreditCard,
    editCreditCard,
    removeCreditCard,
    reorderCreditCards // Pass the reorder function
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
