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
  const [loading, setLoading] = useState(true);
  const [displayedMonth, setDisplayedMonth] = useState(dayjs().startOf('month'));
  const [bankBalance, setBankBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [creditCards, setCreditCards] = useState([]);
  const [loadingCreditCards, setLoadingCreditCards] = useState(true);

  // Load initial bank balance
  const loadInitialBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const data = await fetchBankBalance();
      setBankBalance(data.balance);
    } catch (err) {
      message.error(`Failed to load bank balance: ${err.message}`);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  // Load bills for a given month (including overdue)
  const loadBillsForMonth = useCallback(async (monthDate) => {
    const monthString = monthDate.format('YYYY-MM');
    setLoading(true);
    try {
      const fetched = await fetchBills(monthString, true);
      setBills(fetched);
    } catch (err) {
      message.error(`Failed to load bills: ${err.message}`);
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load credit cards
  const loadCreditCards = useCallback(async () => {
    setLoadingCreditCards(true);
    try {
      const cards = await fetchCreditCards();
      setCreditCards(cards);
    } catch (err) {
      message.error(`Failed to load credit cards: ${err.message}`);
    } finally {
      setLoadingCreditCards(false);
    }
  }, []);

  // Initial effects
  useEffect(() => {
    loadInitialBalance();
    loadCreditCards();
  }, [loadInitialBalance, loadCreditCards]);

  useEffect(() => {
    loadBillsForMonth(displayedMonth);
  }, [displayedMonth, loadBillsForMonth]);

  // Navigation
  const goToPreviousMonth = () => setDisplayedMonth(m => m.subtract(1, 'month').startOf('month'));
  const goToNextMonth     = () => setDisplayedMonth(m => m.add(1, 'month').startOf('month'));

  // Balance update
  const updateBalance = useCallback(async (newData) => {
    setLoadingBalance(true);
    try {
      const updated = await apiUpdateBankBalance(newData);
      setBankBalance(updated.balance);
      message.success('Bank balance updated.');
      return updated;
    } catch (err) {
      message.error(`Failed to update balance: ${err.message}`);
      return null;
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  // Bill CRUD
  const addBill = async (data) => {
    try {
      const created = await apiAddBill(data);
      message.success(`Bill "${created.name}" added.`);
      await loadBillsForMonth(displayedMonth);
      return created;
    } catch (err) {
      message.error(`Failed to add bill: ${err.message}`);
      return null;
    }
  };

  const updateBill = async (orig, upd) => {
    try {
      const updated = await apiUpdateBill(orig.id, upd);
      message.success(`Bill "${updated.name}" updated.`);
      await loadBillsForMonth(displayedMonth);
      return updated;
    } catch (err) {
      message.error(`Failed to update bill: ${err.message}`);
      return null;
    }
  };

  const deleteBill = async (id) => {
    try {
      await apiDeleteBill(id);
      message.success('Bill deleted.');
      setBills(bs => bs.filter(b => b.id !== id));
      return true;
    } catch (err) {
      message.error(`Failed to delete bill: ${err.message}`);
      return false;
    }
  };

  // Credit card CRUD
  const createCreditCard = async (cardData) => {
    try {
      const newCard = await apiAddCreditCard(cardData);
      message.success(`Card "${newCard.name}" added.`);
      await loadCreditCards();
      return newCard;
    } catch (err) {
      message.error(`Failed to add card: ${err.message}`);
      return null;
    }
  };

  const editCreditCard = async (id, upd) => {
    try {
      const updated = await apiUpdateCreditCard(id, upd);
      setCreditCards(cc => cc.map(c => c.id === id ? updated : c));
      message.success(`Card "${updated.name}" updated.`);
      return updated;
    } catch (err) {
      message.error(`Failed to update card: ${err.message}`);
      return null;
    }
  };

  const removeCreditCard = async (id) => {
    try {
      await apiDeleteCreditCard(id);
      message.success('Card deleted.');
      setCreditCards(cc => cc.filter(c => c.id !== id));
      return true;
    } catch (err) {
      message.error(`Failed to delete card: ${err.message}`);
      return false;
    }
  };

  const reorderCreditCards = useCallback(async (newOrder) => {
    setCreditCards(newOrder);
    const payload = newOrder.map((c, i) => ({ id: c.id, sort_order: i }));
    const success = await apiReorderCreditCards(payload);
    if (!success) {
      message.error('Failed to save card order.');
      await loadCreditCards();
    }
    return success;
  }, [loadCreditCards]);

  // Derived values
  const safeBills = Array.isArray(bills) ? bills : [];
  const startOfMonth = dayjs().startOf('month');
  const overdueBills = safeBills.filter(b => !b.isPaid && dayjs(b.dueDate).isBefore(startOfMonth));
  const pastDueAmt = overdueBills.reduce((sum,b) => sum + Number(b.amount||0), 0);
  const unpaidThisMonth = safeBills.filter(b =>
    !b.isPaid &&
    dayjs(b.dueDate).isBetween(startOfMonth, dayjs().endOf('month'), 'day','[]')
  );
  const currentDueAmt = unpaidThisMonth.reduce((sum,b) => sum + Number(b.amount||0), 0) + pastDueAmt;
  const totalCCBalance = creditCards.reduce((sum,c) => sum + Number(c.balance||0), 0);

  return (
    <FinanceContext.Provider value={{
      bills: safeBills,
      loading,
      displayedMonth,
      goToPreviousMonth,
      goToNextMonth,
      addBill,
      updateBill,
      deleteBill,
      bankBalance,
      loadingBalance,
      updateBalance,
      creditCards,
      loadingCreditCards,
      createCreditCard,
      editCreditCard,
      removeCreditCard,
      reorderCreditCards,
      pastDueBills,
      pastDueAmt,
      currentDueAmt,
      totalCCBalance,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
