require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Route files
const appointmentRoutes = require('./routes/appointmentRoutes');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

// Connect Database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100 // 100 requests per windowMs
});
app.use(limiter);

// Mount routers
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
