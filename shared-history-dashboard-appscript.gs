var SPREADSHEET_ID = "1MbTRfJl0hdhwTh5i5GuHP96Vf5PaZiFEPsiFN5Qdwdk";
var SHEET_NAME = "FormData";
var DEFAULT_HISTORY_LIMIT = 120;
var MAX_HISTORY_LIMIT = 250;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getTargetSheet_();

    sheet.appendRow([
      new Date(),
      data.staffName || "",
      data.department || "",
      data.patientId || "",
      data.service || "",
      data.amount || "",
      data.paymentDate || "",
      data.paymentMethod || "",
      data.note || "",
      data.paymentTime || "",
      data.patientName || ""
    ]);

    return respond_({
      status: "success"
    });
  } catch (err) {
    Logger.log("doPost error: " + err.toString());
    return respond_({
      status: "error",
      message: err.toString()
    });
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = params.action || "dashboard";

    if (action === "history") {
      return respond_(buildHistoryResponse_(params), params.prefix);
    }

    if (action === "dashboard") {
      return respond_(buildDashboardResponse_(params), params.prefix);
    }

    return respond_({
      status: "error",
      message: "Unsupported action: " + action
    }, params.prefix);
  } catch (err) {
    Logger.log("doGet error: " + err.toString());
    return respond_({
      status: "error",
      message: err.toString()
    }, e && e.parameter ? e.parameter.prefix : "");
  }
}

function getTargetSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" was not found.');
  }

  return sheet;
}

function getSpreadsheetTimeZone_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSpreadsheetTimeZone() || Session.getScriptTimeZone() || "America/New_York";
}

function buildDashboardResponse_(params) {
  var sheet = getTargetSheet_();
  var values = getSheetValues_(sheet);
  var timezone = getSpreadsheetTimeZone_();
  var targetDate = params.paymentDate || Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd");
  var totals = {
    cashTotal: 0,
    zelleTotal: 0,
    entryCount: 0
  };

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var paymentDate = normalizePaymentDate_(row[6], row[0], timezone);

    if (!paymentDate || paymentDate !== targetDate) {
      continue;
    }

    totals.entryCount++;

    var amount = parseCurrencyValue_(row[5]);
    var method = String(row[7] || "").trim().toLowerCase();

    if (method === "cash") {
      totals.cashTotal += amount;
    } else if (method === "zelle") {
      totals.zelleTotal += amount;
    }
  }

  totals.cashTotal = roundCurrency_(totals.cashTotal);
  totals.zelleTotal = roundCurrency_(totals.zelleTotal);

  return {
    status: "success",
    action: "dashboard",
    paymentDate: targetDate,
    generatedAt: new Date().toISOString(),
    totals: totals
  };
}

function buildHistoryResponse_(params) {
  var sheet = getTargetSheet_();
  var values = getSheetValues_(sheet);
  var timezone = getSpreadsheetTimeZone_();
  var patientIdFilter = normalizePatientId_(params.patientId || "");
  var paymentDateFilter = params.paymentDate || "";
  var limit = clampLimit_(params.limit);
  var history = [];

  for (var i = values.length - 1; i >= 0; i--) {
    var row = values[i];
    var record = buildHistoryRecord_(row, i + 1, timezone);

    if (!record) {
      continue;
    }

    if (patientIdFilter && record.receipt.patientId !== patientIdFilter) {
      continue;
    }

    if (paymentDateFilter && record.receipt.dos !== paymentDateFilter) {
      continue;
    }

    history.push(record);

    if (history.length >= limit) {
      break;
    }
  }

  return {
    status: "success",
    action: "history",
    generatedAt: new Date().toISOString(),
    count: history.length,
    history: history
  };
}

function getSheetValues_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = Math.max(sheet.getLastColumn(), 11);

  if (lastRow < 1) {
    return [];
  }

  return sheet.getRange(1, 1, lastRow, lastColumn).getValues();
}

function buildHistoryRecord_(row, rowNumber, timezone) {
  var patientId = normalizePatientId_(row[3]);
  var service = String(row[4] || "").trim();

  if (!patientId || !service) {
    return null;
  }

  var timestamp = row[0] instanceof Date ? row[0] : new Date(row[0]);
  var savedAtIso = timestamp instanceof Date && !isNaN(timestamp.getTime())
    ? timestamp.toISOString()
    : "";
  var savedAtLabel = savedAtIso
    ? Utilities.formatDate(timestamp, timezone, "M/d/yy, h:mm a")
    : "--";
  var paymentDate = normalizePaymentDate_(row[6], timestamp, timezone);

  return {
    id: String(rowNumber),
    savedAtIso: savedAtIso,
    savedAtLabel: savedAtLabel,
    receipt: {
      dateTime: savedAtLabel,
      patientId: patientId,
      patientName: String(row[10] || "").trim(),
      staffName: String(row[1] || "").trim(),
      dos: paymentDate || "--",
      department: String(row[2] || "").trim() || "--",
      service: service,
      amount: formatCurrency_(row[5]),
      method: String(row[7] || "").trim() || "--"
    }
  };
}

function parseCurrencyValue_(value) {
  var numeric = String(value == null ? "" : value).replace(/[^0-9.\-]/g, "");
  var parsed = parseFloat(numeric);
  return isNaN(parsed) ? 0 : parsed;
}

function formatCurrency_(value) {
  var amount = parseCurrencyValue_(value);
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roundCurrency_(value) {
  return Math.round(value * 100) / 100;
}

function normalizePatientId_(value) {
  return String(value || "").replace(/\D/g, "").substring(0, 8);
}

function normalizePaymentDate_(paymentDateValue, timestamp, timezone) {
  var textValue = String(paymentDateValue || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
    return textValue;
  }

  if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
    return Utilities.formatDate(timestamp, timezone, "yyyy-MM-dd");
  }

  return "";
}

function clampLimit_(limitValue) {
  var parsed = parseInt(limitValue, 10);

  if (isNaN(parsed) || parsed < 1) {
    return DEFAULT_HISTORY_LIMIT;
  }

  return Math.min(parsed, MAX_HISTORY_LIMIT);
}

function respond_(payload, prefix) {
  if (prefix && isValidJsonpPrefix_(prefix)) {
    return ContentService
      .createTextOutput(prefix + "(" + JSON.stringify(payload) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function isValidJsonpPrefix_(prefix) {
  return /^[A-Za-z_$][0-9A-Za-z_$\.]{0,100}$/.test(prefix);
}
