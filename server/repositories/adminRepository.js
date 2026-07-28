import { COLLECTIONS } from '../config/collections.js';
import { TransactionRepository } from './transactionRepository.js';
import { DebtRepository } from './debtRepository.js';
import { UserRepository } from './userRepository.js';
import { AppDataService } from '../services/appDataService.js';

async function summarizeUser(db, doc) {
  const userId = doc.userId;
  const transactions = db.collection(COLLECTIONS.TRANSACTIONS);
  const debts = db.collection(COLLECTIONS.DEBTS);

  const [transactionCount, debtCount, incomeAgg, expenseAgg] = await Promise.all([
    transactions.countDocuments({ userId }),
    debts.countDocuments({ userId }),
    transactions
      .aggregate([
        { $match: { userId, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray(),
    transactions
      .aggregate([
        { $match: { userId, type: { $in: ['cash', 'debt'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray(),
  ]);

  return {
    userId,
    disabled: Boolean(doc.disabled),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    transactionCount,
    debtCount,
    totalIncome: incomeAgg[0]?.total || 0,
    totalExpenses: expenseAgg[0]?.total || 0,
    currentMonth: doc.currentMonth || doc.data?.currentMonth || null,
  };
}

export class AdminRepository {
  /** @param {import('mongodb').Db} db */
  constructor(db) {
    this.db = db;
    this.users = db.collection(COLLECTIONS.USERS);
    this.transactions = new TransactionRepository(db);
    this.debts = new DebtRepository(db);
    this.userRepo = new UserRepository(db);
    this.appData = new AppDataService(db);
  }

  async countUsers(filter = {}) {
    return this.users.countDocuments(filter);
  }

  async listUsers({ search = '', page = 1, limit = 20, disabled = null } = {}) {
    const filter = {};
    if (search) filter.userId = { $regex: search, $options: 'i' };
    if (disabled === 'true') filter.disabled = true;
    if (disabled === 'false') filter.disabled = { $ne: true };

    const skip = (Math.max(1, page) - 1) * limit;
    const [docs, total] = await Promise.all([
      this.users.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray(),
      this.users.countDocuments(filter),
    ]);

    const users = await Promise.all(docs.map((doc) => summarizeUser(this.db, doc)));

    return {
      users,
      total,
      page: Math.max(1, page),
      limit,
    };
  }

  async getUserDetail(userId) {
    const doc = await this.users.findOne({ userId });
    if (!doc) return null;

    const loaded = await this.appData.load(userId);
    if (!loaded) return null;

    return {
      ...(await summarizeUser(this.db, doc)),
      data: loaded.data,
    };
  }

  async setUserDisabled(userId, disabled) {
    return this.userRepo.setDisabled(userId, disabled);
  }

  async deleteUser(userId) {
    await this.appData.deleteUser(userId);
    return true;
  }

  async getDashboardStats() {
    const userDocs = await this.users.find({}).toArray();
    const txCollection = this.db.collection(COLLECTIONS.TRANSACTIONS);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let activeUsers = 0;
    const userGrowthMap = {};

    for (const doc of userDocs) {
      if (doc.disabled) continue;
      const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : null;
      if (updatedAt && updatedAt >= thirtyDaysAgo) activeUsers += 1;

      const createdKey = doc.createdAt
        ? new Date(doc.createdAt).toISOString().slice(0, 7)
        : 'unknown';
      userGrowthMap[createdKey] = (userGrowthMap[createdKey] || 0) + 1;
    }

    const [totalTransactions, incomeAgg, expenseAgg, monthlyAgg, categoryAgg] =
      await Promise.all([
        txCollection.countDocuments({}),
        txCollection
          .aggregate([{ $match: { type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
          .toArray(),
        txCollection
          .aggregate([
            { $match: { type: { $in: ['cash', 'debt'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ])
          .toArray(),
        txCollection
          .aggregate([
            {
              $group: {
                _id: { $substr: ['$date', 0, 7] },
                income: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                },
                expenses: {
                  $sum: {
                    $cond: [{ $in: ['$type', ['cash', 'debt']] }, '$amount', 0],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        txCollection
          .aggregate([
            { $match: { type: { $in: ['cash', 'debt'] } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
            { $limit: 8 },
          ])
          .toArray(),
      ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;

    const monthlyCashflow = monthlyAgg.slice(-12).map((row) => ({
      month: row._id || 'unknown',
      income: row.income || 0,
      expenses: row.expenses || 0,
      net: (row.income || 0) - (row.expenses || 0),
    }));

    const topCategories = categoryAgg.map((row) => ({
      category: row._id || 'Other',
      total: row.total || 0,
    }));

    const userGrowth = Object.entries(userGrowthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      totalUsers: userDocs.length,
      activeUsers,
      disabledUsers: userDocs.filter((d) => d.disabled).length,
      totalTransactions,
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      monthlyCashflow,
      topCategories,
      userGrowth,
    };
  }

  async listAllTransactions(filters = {}) {
    const result = await this.transactions.listFiltered(filters);
    const disabledUsers = new Set(
      (
        await this.users
          .find({ disabled: true }, { projection: { userId: 1 } })
          .toArray()
      ).map((doc) => doc.userId)
    );

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        userDisabled: disabledUsers.has(item.userId),
      })),
    };
  }

  async getReports() {
    const txCollection = this.db.collection(COLLECTIONS.TRANSACTIONS);
    const activeUsers = await this.users.countDocuments({ disabled: { $ne: true } });

    const [monthlyIncome, monthlyExpenses, topCategories, highestSpendingUsers] =
      await Promise.all([
        txCollection
          .aggregate([
            { $match: { type: 'income' } },
            { $group: { _id: { $substr: ['$date', 0, 7] }, total: { $sum: '$amount' } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        txCollection
          .aggregate([
            { $match: { type: { $in: ['cash', 'debt'] } } },
            { $group: { _id: { $substr: ['$date', 0, 7] }, total: { $sum: '$amount' } } },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        txCollection
          .aggregate([
            { $match: { type: { $in: ['cash', 'debt'] } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
            { $limit: 10 },
          ])
          .toArray(),
        txCollection
          .aggregate([
            { $match: { type: { $in: ['cash', 'debt'] } } },
            { $group: { _id: '$userId', totalExpenses: { $sum: '$amount' } } },
            { $sort: { totalExpenses: -1 } },
            { $limit: 10 },
          ])
          .toArray(),
      ]);

    const totalExpenseSum = highestSpendingUsers.reduce((s, u) => s + u.totalExpenses, 0);

    return {
      monthlyIncome: monthlyIncome.map((row) => ({ month: row._id, total: row.total })),
      monthlyExpenses: monthlyExpenses.map((row) => ({ month: row._id, total: row.total })),
      averageSpendingPerUser: totalExpenseSum / (activeUsers || 1),
      topCategories: topCategories.map((row) => ({
        category: row._id || 'Other',
        total: row.total,
      })),
      highestSpendingUsers: highestSpendingUsers.map((row) => ({
        userId: row._id,
        totalExpenses: row.totalExpenses,
      })),
    };
  }
}
