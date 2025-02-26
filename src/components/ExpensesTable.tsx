import React, { useState, useEffect } from 'react';

// Utility function for error handling
const getErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : 'An unknown error occurred';
};

// Utility function for formatting the date
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

// Utility function for formatting the amount e.g £80.50
const formatAmount = (amount: string | number): string => {
    const numericValue = String(amount).trim();
    return `£${numericValue}`;
};

// Utility function for captialising the first letter of each category
const capitaliseWords = (text: string): string => {
    return text
      .toLowerCase() 
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

interface Expense {
  id: number;
  date: string;
  amount: string;
  merchant: string;
  category: string;
}

interface ApiResponse {
  currentPage: number;
  next: {
    page: number;
    limit: number;
  };
  totalPages: number;
  transactions: Expense[];
}

const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://tip-transactions.vercel.app/api/transactions?page=1');
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        const data: ApiResponse = await response.json();
        
        if (!Array.isArray(data.transactions)) {
          throw new Error('Invalid API response: expected an array of transactions');
        }
        setExpenses(data.transactions);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return { expenses, isLoading, error };
};

export const ExpensesTable: React.FC = () => {
  const { expenses, isLoading, error } = useExpenses();

  if (isLoading) {
    return <div className="loading">Loading expenses...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="expenses-container">
      <h1>Expenses</h1>
      <table className="expenses-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Merchant</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.id}</td>
              <td>{formatDate(expense.date)}</td>
              <td>{formatAmount(expense.amount)}</td>
              <td>{expense.merchant}</td>
              <td>{capitaliseWords(expense.category)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};