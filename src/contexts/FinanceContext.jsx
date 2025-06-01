import React, { createContext, useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  fetchBills, addBill, updateBill, deleteBill, deleteMasterBill,
  fetchBankBalance, updateBankBalance,
  fetchCreditCards, addCreditCard, updateCreditCard, deleteCreditCard, apiReorderCreditCards,
  fetchDueBalance
} from '../services/api';
import { message } from 'antd';

export const FinanceContext = createContext({
  bills: [],
  pastDueBills: [],
  displayedMonth: dayjs(),
  bankBalance: null,
  creditCards: [],
  loading: true,
  loadingBalance: true,
  loadingCreditCards: true,
  error: null,
  settings: {
    showPaidBills: false,
    showCreditCards: true,
    theme: 'light',
    defaultChartType: 'pie',
    defaultLandingPage: 'dashboard'
  },
  isEditingBankBalance: false,
  updateSettings: () => {},
  toggleBankBalanceEdit: () => {},
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

export const FinanceProvider = ({ children }) => {
  const [bills, setBills] = useState([]);
  const [displayedMonth, setDisplayedMonth] = useState(dayjs());
  const [bankBalance, setBankBalance] = useState(null);
  const [creditCards, setCreditCards] = useState([]);
  const [dueBalanceTotal, setDueBalanceTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingCreditCards, setLoadingCreditCards] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    showPaidBills: false,
    showCreditCards: true,
    theme: 'light',
    defaultChartType: 'pie',
    defaultLandingPage: 'dashboard'
  });
  const [isEditingBankBalance, setIsEditingBankBalance] = useState(false);

  const pastDueBills = bills.filter(bill => {
    const dueDate = dayjs(bill.dueDate);
    const isBillPrep = bill.category?.toLowerCase() === 'bill prep';
    const startOfCurrentMonth = dayjs().startOf('month');
    return (
      !bill.isPaid &&
      !isBillPrep &&
      dueDate.isValid() &&
      dueDate.isBefore(startOfCurrentMonth, 'day')
    );
  });

  const totalCreditCardBalanceAll = creditCards.reduce((sum, card) => sum + Number(card.balance || 0), 0);

  const totalIncludedCreditCardBalance = creditCards.reduce((sum, card) => {
    return (card.includeInDueBalance !== false) ? sum + Number(card.balance || 0) : sum;
  }, 0);

  const hasAnyPastDueBills = pastDueBills.length > 0;
  const pastDueAmountFromPreviousMonths = pastDueBills.reduce(
    (sum, bill) => sum + Number(bill.amount || 0),
    0
  );

  const currentDueAmt = bills.reduce((sum, bill) => {
    const dueDate = dayjs(bill.dueDate);
    const isCurrentMonth = dueDate.isValid() &&
      dueDate.month() === displayedMonth.month() &&
      dueDate.year() === displayedMonth.year();
    return !bill.isPaid && isCurrentMonth ? sum + Number(bill.amount || 0) : sum;
  }, 0);


  const goToPreviousMonth = useCallback(() => {
    setDisplayedMonth(prev => prev.subtract(1, 'month'));
  }, []);

  const goToNextMonth = useCallback(() => {
    setDisplayedMonth(prev => prev.add(1, 'month'));
  }, []);

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

  const handleUpdateBill = async (existingBill, updates) => {
    if (!existingBill || typeof existingBill !== 'object' || !existingBill.id) {
      message.error('Invalid bill data provided for update.');
      console.error('Invalid existingBill:', existingBill);
      return false;
    }

    const optimisticBill = { ...existingBill, ...updates };
    setBills(prev => prev.map(b => (b.id === existingBill.id ? optimisticBill : b)));

    try {
      const result = await updateBill(existingBill.id, updates);
      if (result) {
        setBills(prev => prev.map(b => (b.id === existingBill.id ? { ...b, ...result } : b)));

        if (typeof result.isPaid === 'boolean' && result.isPaid !== existingBill.isPaid && typeof bankBalance === 'number') {
          const amountValue = Number(result.amount || existingBill.amount || 0);
          const newBalance = existingBill.isPaid ? bankBalance + amountValue : bankBalance - amountValue;
          setBankBalance(newBalance);
          try {
            await updateBankBalance({ balance: newBalance });
          } catch (balanceErr) {
            console.error('Error updating bank balance after bill update:', balanceErr);
          }
        }
        message.success('Bill updated successfully');
        return true;
      }
      setBills(prev => prev.map(b => (b.id === existingBill.id ? existingBill : b)));
      return false;
    } catch (err) {
      setBills(prev => prev.map(b => (b.id === existingBill.id ? existingBill : b)));
      console.error('Error updating bill:', err);
      message.error(err.message || 'Failed to update bill');
      return false;
    }
  };

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

  const handleDeleteMasterBill = async (masterId, fromDate) => {
    if (!masterId) {
      message.error('Invalid master bill ID for deletion');
      return false;
    }
    try {
      const result = await deleteMasterBill(masterId, fromDate);
      if (result) {
        message.success('Recurring bills deleted');
        await loadBillsForMonth();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting master bill:', err);
      message.error(err.message || 'Failed to delete recurring bills');
      return false;
    }
  };

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
      setBankBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const handleUpdateBalance = async (balanceData) => {
    setLoadingBalance(true);
    try {
      const result = await updateBankBalance(balanceData);
      if (result && typeof result.balance === 'number') {
        setBankBalance(result.balance);
        message.success('Balance updated successfully');
        return result;
      }
      throw new Error('Failed to update balance');
    } catch (err) {
      console.error('Error updating balance:', err);
      message.error(err.message || 'Failed to update balance');
      return null;
    } finally {
      setLoadingBalance(false);
    }
  };

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
      setCreditCards([]);
    } finally {
      setLoadingCreditCards(false);
    }
  }, []);

  const loadDueBalance = useCallback(async () => {
    try {
      const data = await fetchDueBalance();
      if (data && typeof data.total === 'number') {
        setDueBalanceTotal(data.total);
      } else {
        setDueBalanceTotal(0);
      }
    } catch (err) {
      console.error('Error loading due balance:', err);
      setDueBalanceTotal(0);
    }
  }, []);

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

  const handleReorderCreditCards = async (newOrderedCards) => {
    const reorderPayload = newOrderedCards.map((card, index) => ({
      id: card.id,
      sort_order: index
    }));
    try {
      const result = await apiReorderCreditCards(reorderPayload);
      if (result) {
        setCreditCards(newOrderedCards);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error reordering credit cards:', err);
      message.error('Failed to reorder cards');
      await loadCreditCards();
      return false;
    }
  };

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('financelySettings', JSON.stringify(updated));
      return updated;
    });
    if (newSettings.theme) {
      document.documentElement.setAttribute('data-theme', newSettings.theme);
      localStorage.setItem('theme', newSettings.theme);
    }
    message.success('Settings updated');
  }, []);

  const toggleBankBalanceEdit = useCallback((editing) => {
    setIsEditingBankBalance(editing);
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('financelySettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        if (parsedSettings.theme) {
          document.documentElement.setAttribute('data-theme', parsedSettings.theme);
        }
      } catch (err) {
        console.error('Error parsing saved settings:', err);
      }
    }
  }, []);

  useEffect(() => {
    loadBillsForMonth();
  }, [displayedMonth, loadBillsForMonth]);

  useEffect(() => {
    loadBankBalance();
    loadCreditCards();
  }, [loadBankBalance, loadCreditCards]);

  useEffect(() => {
    loadDueBalance();
  }, [bills, creditCards, loadDueBalance]);

  const contextValue = {
    bills,
    pastDueBills,
    displayedMonth,
    bankBalance,
    creditCards,
    totalCreditCardBalance: totalIncludedCreditCardBalance,
    totalCreditCardBalanceAll,
    dueBalanceTotal,
    hasAnyPastDueBills,
    pastDueAmountFromPreviousMonths,
    currentDueAmt,
    loading,
    loadingBalance,
    loadingCreditCards,
    error,
    settings,
    updateSettings,
    isEditingBankBalance,
    toggleBankBalanceEdit,
    goToPreviousMonth,
    goToNextMonth,
    addBill: handleAddBill,
    updateBill: handleUpdateBill,
    updateBillWithFuture: handleUpdateBillWithFuture,
    deleteBill: handleDeleteBill,
    deleteMasterBill: handleDeleteMasterBill,
    updateBalance: handleUpdateBalance,
    createCreditCard: handleCreateCreditCard,
    editCreditCard: handleEditCreditCard,
    removeCreditCard: handleRemoveCreditCard,
    reorderCreditCards: handleReorderCreditCards,
    loadBillsForMonth,
    loadDueBalance
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};
