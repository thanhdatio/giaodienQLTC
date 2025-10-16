
import React, { useState, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import useLocalStorage from './hooks/useLocalStorage';
import { Transaction, Account, Category, TransactionType, ReportPeriod, SavingsGoal } from './types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, PIE_CHART_COLORS } from './constants';
import { BalanceIcon, ExpenseIcon, IncomeIcon } from './components/icons';

// HELPER FUNCTIONS
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStartOfPeriod = (date: Date, period: ReportPeriod): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    switch (period) {
        case ReportPeriod.WEEKLY:
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        case ReportPeriod.MONTHLY:
            return new Date(d.getFullYear(), d.getMonth(), 1);
        case ReportPeriod.QUARTERLY:
            const quarter = Math.floor(d.getMonth() / 3);
            return new Date(d.getFullYear(), quarter * 3, 1);
        case ReportPeriod.YEARLY:
            return new Date(d.getFullYear(), 0, 1);
    }
};

const calculateDaysRemaining = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    if (target <= today) return 0;
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}


// SUB-COMPONENTS

interface CardProps {
    title: string;
    amount: number;
    icon: React.ReactNode;
    color: string;
}
const StatCard: React.FC<CardProps> = ({ title, amount, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(amount)}</p>
        </div>
    </div>
);


interface TransactionFormProps {
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    accounts: Account[];
    categories: Category[];
    onClose: () => void;
}
const TransactionForm: React.FC<TransactionFormProps> = ({ addTransaction, accounts, categories, onClose }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');

    const filteredCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !categoryId || !accountId) {
            alert('Vui lòng điền tất cả các trường');
            return;
        }
        addTransaction({ type, description, amount: +amount, date, categoryId, accountId });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-background p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-6 text-text-primary">Thêm Giao Dịch Mới</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex space-x-4">
                        <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full py-2 rounded-lg ${type === TransactionType.EXPENSE ? 'bg-accent text-white' : 'bg-white'}`}>Chi Tiêu</button>
                        <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full py-2 rounded-lg ${type === TransactionType.INCOME ? 'bg-secondary text-white' : 'bg-white'}`}>Thu Nhập</button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Mô tả</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Số tiền</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : +e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Ngày</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Hạng mục</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required>
                            <option value="">Chọn hạng mục</option>
                            {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Tài khoản</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required>
                            <option value="">Chọn tài khoản</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition">Thêm</button>
                </form>
            </div>
        </div>
    );
};

const SavingsGoalForm: React.FC<{
    addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
    onClose: () => void;
}> = ({ addGoal, onClose }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState<number | ''>('');
    const [targetDate, setTargetDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount || !targetDate) {
            alert('Vui lòng điền tất cả các trường');
            return;
        }
        addGoal({ name, targetAmount: +targetAmount, targetDate });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-background p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-6 text-text-primary">Thêm Mục Tiêu Tiết Kiệm</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Tên mục tiêu</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" placeholder="VD: Mua xe mới" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Số tiền mục tiêu</label>
                        <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value === '' ? '' : +e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Ngày mục tiêu</label>
                        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" min={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition">Thêm Mục Tiêu</button>
                </form>
            </div>
        </div>
    );
};

const ContributeForm: React.FC<{
    goal: SavingsGoal;
    accounts: Account[];
    contributeToGoal: (goalId: string, amount: number, accountId: string) => void;
    onClose: () => void;
}> = ({ goal, accounts, contributeToGoal, onClose }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [accountId, setAccountId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedAccount = accounts.find(a => a.id === accountId);
        if (!amount || !accountId) {
            alert('Vui lòng điền tất cả các trường');
            return;
        }
        if (selectedAccount && selectedAccount.balance < amount) {
            alert('Số dư tài khoản không đủ.');
            return;
        }
        if (goal.currentAmount + +amount > goal.targetAmount) {
            const remaining = goal.targetAmount - goal.currentAmount;
            alert(`Số tiền đóng góp vượt quá mục tiêu. Bạn chỉ cần thêm ${formatCurrency(remaining)}.`);
            return;
        }
        contributeToGoal(goal.id, +amount, accountId);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-background p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-2 text-text-primary">Đóng góp cho Mục tiêu</h2>
                 <p className="text-text-secondary mb-6">"{goal.name}"</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary">Số tiền đóng góp</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : +e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Từ tài khoản</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2" required>
                            <option value="">Chọn tài khoản</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-opacity-90 transition">Xác nhận</button>
                </form>
            </div>
        </div>
    );
};


// MAIN APP COMPONENT
export default function App() {
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', INITIAL_ACCOUNTS);
    const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
    const [savingsGoals, setSavingsGoals] = useLocalStorage<SavingsGoal[]>('savingsGoals', []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);

    const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.MONTHLY);
    
    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = { ...transaction, id: new Date().toISOString() };
        
        setTransactions(prev => [...prev, newTransaction]);
        
        setAccounts(prevAccounts => prevAccounts.map(account => {
            if (account.id === newTransaction.accountId) {
                const newBalance = newTransaction.type === TransactionType.INCOME
                    ? account.balance + newTransaction.amount
                    : account.balance - newTransaction.amount;
                return { ...account, balance: newBalance };
            }
            return account;
        }));
    };

    const addGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
        const newGoal: SavingsGoal = {
            ...goal,
            id: new Date().toISOString() + Math.random(),
            currentAmount: 0,
        };
        setSavingsGoals(prev => [...prev, newGoal]);
    };

    const contributeToGoal = (goalId: string, amount: number, accountId: string) => {
        setSavingsGoals(prevGoals => prevGoals.map(goal => 
            goal.id === goalId ? { ...goal, currentAmount: goal.currentAmount + amount } : goal
        ));

        setAccounts(prevAccounts => prevAccounts.map(account => 
            account.id === accountId ? { ...account, balance: account.balance - amount } : account
        ));
    };

    const filteredTransactions = useMemo(() => {
        const startDate = getStartOfPeriod(new Date(), period);
        return transactions.filter(t => new Date(t.date) >= startDate);
    }, [transactions, period]);

    const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((acc, t) => acc + t.amount, 0);
        const expense = filteredTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => acc + t.amount, 0);
        const balance = accounts.reduce((acc, account) => acc + account.balance, 0);
        return { totalIncome: income, totalExpense: expense, totalBalance: balance };
    }, [filteredTransactions, accounts]);

    const expenseByCategory = useMemo(() => {
        const data: { name: string, value: number }[] = [];
        const expenseTransactions = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
        
        const categoryMap: { [key: string]: number } = {};
        expenseTransactions.forEach(t => {
            const category = categories.find(c => c.id === t.categoryId);
            if (category) {
                if (categoryMap[category.name]) {
                    categoryMap[category.name] += t.amount;
                } else {
                    categoryMap[category.name] = t.amount;
                }
            }
        });

        for (const [name, value] of Object.entries(categoryMap)) {
            data.push({ name, value });
        }
        return data;
    }, [filteredTransactions, categories]);
    
    const incomeExpenseData = useMemo(() => {
        const dataMap = new Map<string, {name: string, income: number, expense: number}>();
        
        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            let key: string;

            if (period === ReportPeriod.WEEKLY || period === ReportPeriod.MONTHLY) {
                 key = `Ngày ${date.getDate()}`;
            } else if (period === ReportPeriod.QUARTERLY || period === ReportPeriod.YEARLY) {
                 key = `Tháng ${date.getMonth() + 1}`;
            } else {
                key = date.toLocaleDateString('vi-VN');
            }

            if (!dataMap.has(key)) {
                dataMap.set(key, {name: key, income: 0, expense: 0});
            }

            const entry = dataMap.get(key)!;
            if (t.type === TransactionType.INCOME) {
                entry.income += t.amount;
            } else {
                entry.expense += t.amount;
            }
        });

        // ROBUST SORTING LOGIC TO PREVENT CRASHES
        return Array.from(dataMap.values()).sort((a, b) => {
            const extractNumber = (name: string): number => {
                // Safely extracts the number from strings like "Ngày 21" or "Tháng 6"
                const match = name.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            };

            const numA = extractNumber(a.name);
            const numB = extractNumber(b.name);

            return numA - numB;
        });
    }, [filteredTransactions, period]);

    return (
        <div className="bg-background min-h-screen text-text-primary font-sans">
            {isModalOpen && <TransactionForm addTransaction={addTransaction} accounts={accounts} categories={categories} onClose={() => setIsModalOpen(false)} />}
            {isGoalModalOpen && <SavingsGoalForm addGoal={addGoal} onClose={() => setIsGoalModalOpen(false)} />}
            {goalToContribute && <ContributeForm goal={goalToContribute} accounts={accounts} contributeToGoal={contributeToGoal} onClose={() => setGoalToContribute(null)} />}
            
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-primary">Bảng điều khiển Tài chính</h1>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition flex items-center space-x-2">
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm Giao Dịch</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <StatCard title="Tổng Thu Nhập" amount={totalIncome} icon={<IncomeIcon />} color="bg-secondary/20 text-secondary" />
                        <StatCard title="Tổng Chi Tiêu" amount={totalExpense} icon={<ExpenseIcon />} color="bg-accent/20 text-accent" />
                        <StatCard title="Số Dư Hiện Tại" amount={totalBalance} icon={<BalanceIcon />} color="bg-primary/20 text-primary" />
                    </div>

                    <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Báo cáo tổng hợp</h3>
                            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                                {Object.values(ReportPeriod).map(p => (
                                    <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-sm rounded-md ${period === p ? 'bg-white shadow' : 'text-gray-600'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Thu nhập vs Chi tiêu</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={incomeExpenseData}>
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatCurrency} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="income" fill="#10b981" name="Thu nhập" />
                                    <Bar dataKey="expense" fill="#ef4444" name="Chi tiêu" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Phân tích Chi tiêu</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {expenseByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-white p-6 rounded-2xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2"><i className="fa-solid fa-trophy text-primary"></i>Mục tiêu Tiết kiệm</h3>
                            <button onClick={() => setIsGoalModalOpen(true)} className="bg-secondary text-white font-bold py-2 px-3 rounded-lg hover:bg-opacity-90 transition flex items-center space-x-2">
                                <i className="fa-solid fa-plus"></i>
                                <span>Thêm Mục tiêu</span>
                            </button>
                        </div>
                        <div className="space-y-6">
                            {savingsGoals.length > 0 ? (
                                savingsGoals.map(goal => {
                                    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
                                    return (
                                        <div key={goal.id} className="border border-gray-200 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-primary">{goal.name}</h4>
                                                    <p className="text-sm text-text-secondary">Mục tiêu: {new Date(goal.targetDate).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setGoalToContribute(goal)}
                                                    disabled={goal.currentAmount >= goal.targetAmount}
                                                    className="bg-green-100 text-green-700 text-xs font-bold py-1 px-3 rounded-full hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">
                                                    Đóng góp
                                                </button>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-text-primary">{formatCurrency(goal.currentAmount)}</span>
                                                    <span className="text-sm font-medium text-text-secondary">{formatCurrency(goal.targetAmount)}</span>
                                                </div>
                                                 <div className="w-full bg-gray-200 rounded-full h-4 relative">
                                                    <div className="bg-primary h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${progressPercentage > 100 ? 100 : progressPercentage}%` }}>
                                                       {progressPercentage > 10 && `${progressPercentage.toFixed(0)}%`}
                                                    </div>
                                                </div>
                                                 <div className="flex justify-between mt-1">
                                                    <span className="text-xs text-text-secondary">Đã đạt được</span>
                                                    <span className="text-xs text-text-secondary">Còn lại {calculateDaysRemaining(goal.targetDate)} ngày</span>
                                                 </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-text-secondary text-center py-4">Bạn chưa đặt mục tiêu tiết kiệm nào. Hãy bắt đầu ngay!</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                       <div className="md:col-span-2 lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Giao Dịch Gần Đây</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Mô tả</th>
                                            <th scope="col" className="px-6 py-3">Số tiền</th>
                                            <th scope="col" className="px-6 py-3">Ngày</th>
                                            <th scope="col" className="px-6 py-3">Hạng mục</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.slice(-5).reverse().map(t => {
                                            const category = categories.find(c => c.id === t.categoryId);
                                            return (
                                                <tr key={t.id} className="bg-white border-b">
                                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{t.description}</td>
                                                    <td className={`px-6 py-4 ${t.type === TransactionType.INCOME ? 'text-secondary' : 'text-accent'}`}>{formatCurrency(t.amount)}</td>
                                                    <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                                                    <td className="px-6 py-4">{category?.name}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Tài khoản</h3>
                            <ul className="space-y-4">
                                {accounts.map(account => (
                                    <li key={account.id} className="flex justify-between items-center">
                                        <span className="font-medium">{account.name}</span>
                                        <span className="font-bold">{formatCurrency(account.balance)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
