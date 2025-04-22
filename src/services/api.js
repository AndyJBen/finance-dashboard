// src/services/api.js
// COMPLETE FILE CODE - Includes apiReorderCreditCards function

// Base URL for the backend API, using environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
console.log(`Using API_URL: ${API_URL}`); // Log the API URL being used

// --- Helper for Handling API Errors ---
const handleApiError = async (response) => {
    let errorBody = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        try { errorBody = await response.json(); } catch (e) { /* ignore */ }
    } else {
        try { errorBody = await response.text(); } catch (e) { /* ignore */ }
    }
    console.error("API request failed:", response.status, response.statusText, errorBody);
    let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
    if (errorBody) {
        if (typeof errorBody === 'string') {
            errorMessage += ` - ${errorBody}`;
        } else if (errorBody.error) {
            errorMessage += ` - ${errorBody.error}`;
        } else {
            errorMessage += ` - ${JSON.stringify(errorBody)}`;
        }
    }
    const error = new Error(errorMessage);
    error.response = { status: response.status, statusText: response.statusText, data: errorBody };
    return error;
};

// --- Bill Functions ---
export const fetchBills = async (monthString, includeOverdue = false) => {
    if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
        throw new Error('Invalid month format provided to fetchBills. Use YYYY-MM.');
    }
    console.log(`Fetching bills for month: ${monthString}${includeOverdue ? ' (including overdue)' : ''}`);
    let url = `${API_URL}/bills?month=${monthString}`;
    if (includeOverdue) {
        url += '&view=current_and_overdue';
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw await handleApiError(response);
        }
        const data = await response.json();
        console.log(`Fetched bills for ${monthString}${includeOverdue ? ' (including overdue)' : ''}:`, data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error(`Error in fetchBills for month ${monthString}${includeOverdue ? ' (including overdue)' : ''}:`, error);
        throw error;
    }
};

export const addBill = async (billData) => {
    if (!billData || typeof billData.name !== 'string' || typeof billData.amount !== 'number' || !billData.dueDate) {
        throw new Error('Invalid bill data provided to addBill.');
    }
    try {
        const response = await fetch(`${API_URL}/bills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData),
        });
        if (!response.ok) {
            throw await handleApiError(response);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in addBill:", error);
        throw error;
    }
};

export const updateBill = async (id, updatedData) => {
    try {
        const response = await fetch(`${API_URL}/bills/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
            throw await handleApiError(response);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error in updateBill for ID ${id}:`, error);
        throw error;
    }
};

export const deleteBill = async (id) => {
    console.log(`API: Attempting to delete bill with ID: ${id}`);
    try {
        const response = await fetch(`${API_URL}/bills/${id}`, { method: 'DELETE' });
        console.log(`API: Delete bill response status: ${response.status}`);
        if (response.ok || response.status === 204) {
            console.log(`API: Bill ${id} deleted successfully`);
            return true;
        } else {
            throw await handleApiError(response);
        }
    } catch (error) {
        console.error(`Error in deleteBill for ID ${id}:`, error);
        throw error;
    }
};

// --- Balance Functions ---
export const fetchBankBalance = async () => {
    console.log("Fetching bank balance...");
    try {
        const response = await fetch(`${API_URL}/balance`);
        if (!response.ok) {
            throw await handleApiError(response);
        }
        const data = await response.json();
        console.log("Fetched bank balance:", data);
        if (data && typeof data.balance === 'number') {
            return data;
        } else {
            throw new Error("Invalid balance data received from server.");
        }
    } catch (error) {
        console.error('Error in fetchBankBalance:', error);
        throw error;
    }
};

export const updateBankBalance = async (balanceData) => {
    if (!balanceData || typeof balanceData.balance !== 'number' || isNaN(balanceData.balance)) {
        throw new Error('Invalid balance data provided to updateBankBalance.');
    }
    try {
        const response = await fetch(`${API_URL}/balance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(balanceData),
        });
        if (!response.ok) {
            throw await handleApiError(response);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in updateBankBalance:', error);
        throw error;
    }
};

// --- Credit Card Functions ---
export const fetchCreditCards = async () => {
    try {
        const response = await fetch(`${API_URL}/credit_cards`);
        if (!response.ok) {
            throw await handleApiError(response);
        }
        const data = await response.json();
        console.log("Fetched credit cards (ordered by sort_order):", data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error in fetchCreditCards:', error);
        throw error;
    }
};

export const addCreditCard = async (cardData) => {
    if (!cardData || typeof cardData.name !== 'string' || cardData.name.trim() === '') {
        throw new Error("Invalid card data: 'name' is required.");
    }
    const balance = (typeof cardData.balance === 'number' && !isNaN(cardData.balance)) ? cardData.balance : 0;
    const payload = { name: cardData.name.trim(), balance };
    try {
        const response = await fetch(`${API_URL}/credit_cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw await handleApiError(response);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in addCreditCard:", error);
        throw error;
    }
};

export const updateCreditCard = async (id, updateData) => {
    const payload = {};
    if (updateData.name !== undefined) {
        if (typeof updateData.name !== 'string' || updateData.name.trim() === '') {
            throw new Error("Invalid update data: 'name' cannot be empty.");
        }
        payload.name = updateData.name.trim();
    }
    if (updateData.balance !== undefined) {
        if (typeof updateData.balance !== 'number' || isNaN(updateData.balance)) {
            throw new Error("Invalid update data: 'balance' must be a number.");
        }
        payload.balance = updateData.balance;
    }
    if (Object.keys(payload).length === 0) {
        throw new Error("No valid fields provided for update after validation.");
    }
    try {
        const response = await fetch(`${API_URL}/credit_cards/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw await handleApiError(response);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error in updateCreditCard for ID ${id}:`, error);
        throw error;
    }
};

export const deleteCreditCard = async (id) => {
    console.log(`API: Attempting to delete credit card with ID: ${id}`);
    try {
        const response = await fetch(`${API_URL}/credit_cards/${id}`, { method: 'DELETE' });
        console.log(`API: Delete response status: ${response.status}`);
        if (response.ok) {
            return true;
        } else {
            throw await handleApiError(response);
        }
    } catch (error) {
        console.error(`Error in deleteCreditCard for ID ${id}:`, error);
        throw error;
    }
};

// --- START: New Reorder Function ---
/**
 * Sends the new order of credit cards to the backend.
 * @param {Array<{id: number, sort_order: number}>} orderedCards
 */
export const apiReorderCreditCards = async (orderedCards) => {
    console.log('API: Sending reordered cards to backend:', orderedCards);
    const url = `${API_URL}/credit_cards/reorder`;
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cards: orderedCards }),
        });
        if (!response.ok) {
            throw await handleApiError(response);
        }
        // no JSON body expected
        console.log('API: Reorder successful');
        return true;
    } catch (error) {
        console.error('Error in apiReorderCreditCards:', error);
        return false;
    }
};
// --- END: New Reorder Function ---
