const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors({
    origin: "https://task2front.onrender.com"
}
))
app.options('*', cors())
app.use(express.json());


// Wrap callback-based functions into promises
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

app.get("/api", async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM item ORDER BY number ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

app.put('/api/reorder', async (req, res) => {
    const { orderedIds } = req.body;

    try {
        await dbRun('BEGIN');
        for (let i = 0; i < orderedIds.length; i++) {
            await dbRun('UPDATE item SET number=? WHERE id=?', [i, orderedIds[i]]);
        }
        await dbRun('COMMIT');
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: 'Failed to update order' });
    }
});

process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});


app.listen(5000, () => {
    console.log("Server started on port 5000");
});
