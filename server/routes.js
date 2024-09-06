const Report = require('./models/report');

const reportUser = async (req, res) => {
    const ip = req.body.ip;
    let report = await Report.findOne({ ip });
    if (report) {
        report.count += 1;
        if (report.count >= 3) {
            report.blocked = true;
        }
    } else {
        report = new Report({ ip, count: 1, blocked: false });
    }
    await report.save();
    res.status(200).send('Reported successfully');
};

const checkIpBlock = async (ip) => {
    const report = await Report.findOne({ ip });
    return report && report.blocked;
};

module.exports = { reportUser, checkIpBlock };
