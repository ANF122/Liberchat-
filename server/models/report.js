const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    ip: String,
    count: { type: Number, default: 0 },
    blocked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Report', reportSchema);
