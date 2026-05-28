import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';
import { FiPlus } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { AiOutlineEdit } from 'react-icons/ai';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Food' },
    { id: 2, name: 'Transport' },
    { id: 3, name: 'Bills' },
    { id: 4, name: 'Entertainment' },
    { id: 5, name: 'Other' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});

  const { register, handleSubmit, reset } = useForm();

  const addExpense = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/expenses`, data);
      setExpenses([...expenses, response.data]);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/expenses/${id}`);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    const calculateTotalSpent = () => {
      const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
      setTotalSpent(total);
    };
    calculateTotalSpent();
  }, [expenses]);

  useEffect(() => {
    const calculateCategoryBreakdown = () => {
      const breakdown = {};
      expenses.forEach((expense) => {
        const category = categories.find((category) => category.id === expense.categoryId);
        if (category) {
          if (!breakdown[category.name]) {
            breakdown[category.name] = 0;
          }
          breakdown[category.name] += expense.amount;
        }
      });
      setCategoryBreakdown(breakdown);
    };
    calculateCategoryBreakdown();
  }, [expenses, categories]);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const filteredExpenses = selectedCategory
    ? expenses.filter((expense) => expense.categoryId === selectedCategory.id)
    : expenses;

  return (
    <div className="app-wrapper">
      <div className="max-w-5xl mx-auto p-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold">Expense Tracker</h1>
        </header>
        <main>
          <section className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Add Expense</h2>
            <form onSubmit={handleSubmit(addExpense)}>
              <div className="flex flex-wrap -mx-3 mb-2">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="description"
                    type="text"
                    {...register('description')}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="amount">
                    Amount
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="amount"
                    type="number"
                    {...register('amount')}
                  />
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-2">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="categoryId">
                    Category
                  </label>
                  <select
                    className="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="categoryId"
                    {...register('categoryId')}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="date">
                    Date
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="date"
                    type="date"
                    {...register('date')}
                  />
                </div>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Expense
              </button>
            </form>
          </section>
          <section className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Expenses</h2>
            <div className="flex flex-wrap -mx-3 mb-2">
              {categories.map((category) => (
                <div key={category.id} className="w-full md:w-1/5 px-3 mb-6 md:mb-0">
                  <button
                    className={clsx(
                      'bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline',
                      selectedCategory && selectedCategory.id === category.id ? 'bg-blue-500 hover:bg-blue-700 text-white' : ''
                    )}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category.name}
                  </button>
                </div>
              ))}
            </div>
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Notes</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-2">{categories.find((category) => category.id === expense.categoryId).name}</td>
                    <td className="px-4 py-2">${expense.amount}</td>
                    <td className="px-4 py-2">{format(new Date(expense.date), 'MM/dd/yyyy')}</td>
                    <td className="px-4 py-2">{expense.description}</td>
                    <td className="px-4 py-2">
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        <AiOutlineEdit />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <AiOutlineDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Summary</h2>
            <div className="flex flex-wrap -mx-3 mb-2">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-2">Total Spent</h3>
                <p className="text-3xl font-bold">${totalSpent}</p>
              </div>
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-2">Category Breakdown</h3>
                <ul>
                  {Object.keys(categoryBreakdown).map((category) => (
                    <li key={category}>
                      <span className="text-gray-700">{category}: ${categoryBreakdown[category]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
        <footer className="mt-4">
          <p>&copy; 2023 Expense Tracker</p>
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;