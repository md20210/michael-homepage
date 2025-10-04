export default function handler(req, res) {
    res.status(200).json({
        hello: "world from mjs",
        method: req.method,
        timestamp: new Date().toISOString()
    });
}
