const { User, NorUser, Admin } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const { JWT_SECRET } = require('../config/config');

exports.register = async (req, res) => {
	try {
		const { user_name, password, role } = req.body;
		const existingUser = await User.findByUsername(user_name);
		if (existingUser) {
			return res.status(400).json({ message: 'Username already exists' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		let userObj;
		if (role === 'admin') {
			userObj = new Admin(null, user_name, hashedPassword);
		} else {
			userObj = new NorUser(null, user_name, hashedPassword);
		}
		await User.create({ user_name: userObj.user_name, password: userObj.password, role: userObj.role });
		res.status(201).json({ message: 'Register success' });
	} catch (err) {
		res.status(500).json({ message: 'Register failed', error: err.message });
	}
};

// Đăng nhập
exports.login = async (req, res) => {
	try {
		const { user_name, password } = req.body;
		const user = await User.findByUsername(user_name);
		if (!user) {
			return res.status(400).json({ message: 'Invalid username or password' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid username or password' });
		}
		let userObj;
		if (user.role === 'admin') {
			userObj = new Admin(user.id, user.user_name, user.password);
		} else {
			userObj = new NorUser(user.id, user.user_name, user.password);
		}
		const token = jwt.sign({ id: userObj.id, user_name: userObj.user_name, role: userObj.role }, JWT_SECRET, { expiresIn: '1d' });
		res.json({ token, user: { id: userObj.id, user_name: userObj.user_name, role: userObj.role } });
	} catch (err) {
		res.status(500).json({ message: 'Login failed', error: err.message });
	}
};
