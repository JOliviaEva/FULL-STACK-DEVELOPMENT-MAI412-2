// Small helpers shared by every controller.
const sendError = (res, status, message, errors) => res.status(status).json(errors ? { message, errors } : { message });

// Express puts :id in req.params as a string; accept only positive whole numbers.
const parseId = (raw) => (/^\d+$/.test(String(raw)) && Number(raw) > 0 ? Number(raw) : null);

const hasKeys = (obj) => Object.keys(obj).length > 0;

module.exports = { sendError, parseId, hasKeys };
