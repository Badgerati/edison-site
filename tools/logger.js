
function Logger() { }
module.exports = Logger;


Logger.error = function(res, err, msg) {
    if (!err) {
        if (res) {
            res.json({ error: false });
        }

        return;
    }

    console.log(err);

    if (res) {
        res.json({ error: true, message: (msg || err.message) });
    }
}
