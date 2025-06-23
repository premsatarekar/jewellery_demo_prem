import db from '../config/db.js';

/* --- ADD Expense --- */
export const addExpense = async (req, res) => {
  const { name, category, date, amount } = req.body;
  if (!name || !category || !date || !amount)
    return res.status(400).json({ msg: 'All fields required' });

  try {
    const [result] = await db.query(
      `INSERT INTO expenses (name, category, date, amount) VALUES (?, ?, ?, ?)`,
      [name.trim(), category.trim(), date, parseFloat(amount)]
    );
    res.status(201).json({ msg: 'Expense added', id: result.insertId });
  } catch (err) {
    console.error('ADD EXPENSE ERR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/* --- GET All Expenses --- */
export const getAllExpenses = async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM expenses ORDER BY date DESC`);
    res.json(rows);
  } catch (err) {
    console.error('GET EXPENSES ERR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
/* --- GET single Expense by ID --- */
export const getExpenseById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM expenses WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ msg: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET EXPENSE BY ID ERR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* --- UPDATE Expense --- */
export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { name, date, amount } = req.body;
  if (!name || !date || !amount)
    return res.status(400).json({ msg: 'All fields required' });

  try {
    const [result] = await db.query(
      `UPDATE expenses SET name=?, date=?, amount=? WHERE id=?`,
      [name.trim(), date, parseFloat(amount), id]
    );
    if (!result.affectedRows) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Expense updated' });
  } catch (err) {
    console.error('UPDATE EXPENSE ERR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/* --- DELETE Expense --- */
export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(`DELETE FROM expenses WHERE id=?`, [id]);
    if (!result.affectedRows) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    console.error('DELETE EXPENSE ERR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
