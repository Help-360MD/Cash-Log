var SPREADSHEET_ID = "1MbTRfJl0hdhwTh5i5GuHP96Vf5PaZiFEPsiFN5Qdwdk";
var SHEET_NAME = "FormData";
var DEFAULT_HISTORY_LIMIT = 120;
var MAX_HISTORY_LIMIT = 250;
var RAW_COLUMN_COUNT = 19;

var RECORD_TYPE_SALE = "sale";
var RECORD_TYPE_EDIT = "edit";
var RECORD_TYPE_VOID = "void";
var RECORD_TYPE_REFUND = "refund";

function doPost(e) {
  try {
    var data = parsePostData_(e);
    var sheet = getTargetSheet_();
    var payload = normalizeSubmissionPayload_(data);

    appendReceiptRow_(sheet, payload);

    return respond_({
      status: "success",
      action: payload.recordType,
      receiptId: payload.receiptId,
      chainId: payload.chainId,
      parentReceiptId: payload.parentReceiptId,
      generatedAt: new Date().toISOString()
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

    if (action === "shiftReport") {
      return respond_(buildShiftReportResponse_(params), params.prefix);
    }

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

function parsePostData_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

function normalizeSubmissionPayload_(data) {
  var now = new Date();
  var recordType = normalizeRecordType_(data.recordType || data.action);
  var receiptId = normalizeReceiptId_(data.receiptId) || Utilities.getUuid();
  var chainId = normalizeReceiptId_(data.chainId) || receiptId;
  var parentReceiptId = normalizeReceiptId_(data.parentReceiptId || data.targetReceiptId || data.sourceReceiptId);
  var paymentDate = normalizePaymentDateText_(data.paymentDate);
  var paymentTime = normalizeText_(data.paymentTime || data.paymentTimeDisplay || "");
  var amount = parseCurrencyValue_(data.amount);
  var correctionAmount = parseCurrencyValue_(data.correctionAmount || data.refundAmount || data.adjustmentAmount);
  var correctionReason = normalizeText_(data.correctionReason || data.reason || "");
  var actorName = normalizeText_(data.actorName || data.staffName || "");
  var note = normalizeText_(data.note || "");

  if (!recordType) {
    recordType = RECORD_TYPE_SALE;
  }

  if ((recordType === RECORD_TYPE_EDIT || recordType === RECORD_TYPE_VOID || recordType === RECORD_TYPE_REFUND) && !correctionReason) {
    throw new Error("A correction reason is required for edits, voids, and refunds.");
  }

  if (recordType === RECORD_TYPE_VOID && correctionAmount <= 0) {
    correctionAmount = amount;
  }

  if (recordType === RECORD_TYPE_REFUND && correctionAmount <= 0) {
    correctionAmount = amount;
  }

  if (recordType === RECORD_TYPE_VOID && correctionAmount <= 0) {
    throw new Error("A void amount is required.");
  }

  if (recordType === RECORD_TYPE_REFUND) {
    if (correctionAmount <= 0) {
      throw new Error("A refund amount is required.");
    }

    if (correctionAmount > amount) {
      throw new Error("Refund amount cannot exceed the original receipt amount.");
    }
  }

  var auditPayload = buildAuditPayload_(data, recordType, amount, correctionAmount, correctionReason);

  return {
    timestamp: now,
    staffName: normalizeText_(data.staffName || ""),
    department: normalizeText_(data.department || ""),
    patientId: normalizeText_(data.patientId || ""),
    service: normalizeText_(data.service || ""),
    amount: amount,
    paymentDate: paymentDate || Utilities.formatDate(now, getSpreadsheetTimeZone_(), "yyyy-MM-dd"),
    paymentMethod: normalizeText_(data.paymentMethod || ""),
    note: note,
    paymentTime: paymentTime,
    patientName: normalizeText_(data.patientName || ""),
    receiptId: receiptId,
    chainId: chainId,
    recordType: recordType,
    parentReceiptId: parentReceiptId,
    correctionReason: correctionReason,
    correctionAmount: correctionAmount,
    actorName: actorName,
    auditPayload: auditPayload
  };
}

function buildAuditPayload_(data, recordType, amount, correctionAmount, correctionReason) {
  var payload = {
    recordType: recordType,
    amount: amount,
    correctionAmount: correctionAmount,
    correctionReason: correctionReason,
    originalReceiptId: normalizeReceiptId_(data.originalReceiptId || data.parentReceiptId || data.targetReceiptId || ""),
    chainId: normalizeReceiptId_(data.chainId || ""),
    receiptId: normalizeReceiptId_(data.receiptId || "")
  };

  if (data.originalSnapshot) {
    payload.originalSnapshot = data.originalSnapshot;
  }

  if (data.updatedSnapshot) {
    payload.updatedSnapshot = data.updatedSnapshot;
  }

  return payload;
}

function appendReceiptRow_(sheet, payload) {
  sheet.appendRow([
    payload.timestamp,
    payload.staffName,
    payload.department,
    payload.patientId,
    payload.service,
    formatCurrencyForSheet_(payload.amount),
    payload.paymentDate,
    payload.paymentMethod,
    payload.note,
    payload.paymentTime,
    payload.patientName,
    payload.receiptId,
    payload.chainId,
    payload.recordType,
    payload.parentReceiptId,
    payload.correctionReason,
    formatCurrencyForSheet_(payload.correctionAmount),
    payload.actorName,
    JSON.stringify(payload.auditPayload || {})
  ]);
}

function buildDashboardResponse_(params) {
  var sheet = getTargetSheet_();
  var values = getSheetValues_(sheet);
  var timezone = getSpreadsheetTimeZone_();
  var targetDate = params.paymentDate || Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd");
  var ledger = buildLedger_(values, timezone);
  var totals = createTotalsBucket_();

  ledger.chains.forEach(function(chain) {
    if (chain.currentReceipt.dos !== targetDate) {
      return;
    }

    addChainToBucket_(totals, chain);
  });

  return {
    status: "success",
    action: "dashboard",
    paymentDate: targetDate,
    generatedAt: new Date().toISOString(),
    totals: roundTotalsBucket_(totals)
  };
}

function buildHistoryResponse_(params) {
  var sheet = getTargetSheet_();
  var values = getSheetValues_(sheet);
  var timezone = getSpreadsheetTimeZone_();
  var patientIdFilter = normalizePatientId_(params.patientId || "");
  var paymentDateFilter = normalizePaymentDateText_(params.paymentDate || "");
  var limit = clampLimit_(params.limit);
  var ledger = buildLedger_(values, timezone);
  var history = ledger.chains.filter(function(chain) {
    if (patientIdFilter && !chainMatchesPatientFilter_(chain, patientIdFilter)) {
      return false;
    }

    if (paymentDateFilter && chain.currentReceipt.dos !== paymentDateFilter && !chainMatchesDateFilter_(chain, paymentDateFilter)) {
      return false;
    }

    return true;
  });

  history.sort(function(left, right) {
    return compareIsoTextDesc_(left.savedAtIso, right.savedAtIso);
  });

  history = history.slice(0, limit);

  return {
    status: "success",
    action: "history",
    generatedAt: new Date().toISOString(),
    count: history.length,
    history: history
  };
}

function buildShiftReportResponse_(params) {
  var sheet = getTargetSheet_();
  var values = getSheetValues_(sheet);
  var timezone = getSpreadsheetTimeZone_();
  var targetDate = params.paymentDate || Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd");
  var departmentFilter = normalizeShiftReportDepartmentFilter_(params.department || params.departmentFilter || "");
  var ledger = buildLedger_(values, timezone);
  var summary = createTotalsBucket_();
  var staffGroups = {};
  var departmentGroups = {};
  var transactions = [];

  ledger.chains.forEach(function(chain) {
    if (chain.currentReceipt.dos !== targetDate) {
      return;
    }

    if (departmentFilter !== "all" && chain.currentReceipt.department !== departmentFilter) {
      return;
    }

    addChainToBucket_(summary, chain);
    addChainToGroupedBucket_(staffGroups, chain.currentReceipt.staffName || "Unassigned Staff", chain);
    addChainToGroupedBucket_(departmentGroups, chain.currentReceipt.department || "Unassigned Department", chain);
    transactions.push(buildShiftReportTransaction_(chain));
  });

  transactions.sort(function(left, right) {
    return compareIsoTextDesc_(left.savedAtIso, right.savedAtIso);
  });

  return {
    status: "success",
    action: "shiftReport",
    paymentDate: targetDate,
    departmentFilter: departmentFilter,
    departmentFilterLabel: getShiftReportDepartmentFilterLabel_(departmentFilter),
    generatedAt: new Date().toISOString(),
    summary: roundTotalsBucket_(summary),
    staffTotals: buildGroupedTotalsResponse_(staffGroups),
    departmentTotals: buildGroupedTotalsResponse_(departmentGroups),
    transactions: transactions
  };
}

function buildShiftReportTransaction_(chain) {
  return {
    id: chain.chainId,
    receiptId: chain.receiptId,
    chainId: chain.chainId,
    savedAtIso: chain.currentReceipt.savedAtIso,
    timestamp: chain.currentReceipt.savedAtLabel,
    action: chain.currentReceipt.status,
    status: chain.currentReceipt.status,
    statusLabel: chain.currentReceipt.statusLabel,
    staffName: chain.currentReceipt.staffName,
    department: chain.currentReceipt.department,
    patientId: chain.currentReceipt.patientId,
    patientName: chain.currentReceipt.patientName,
    service: chain.currentReceipt.service,
    grossAmount: chain.grossAmount,
    voidAmount: chain.voidAmount,
    refundAmount: chain.refundAmount,
    netAmount: chain.netAmount,
    paymentDate: chain.currentReceipt.dos,
    paymentMethod: chain.currentReceipt.method,
    note: chain.currentReceipt.note,
    lastActionLabel: chain.lastActionLabel,
    lastActionReason: chain.lastActionReason,
    auditSummary: chain.auditSummary
  };
}

function getSheetValues_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = Math.max(sheet.getLastColumn(), RAW_COLUMN_COUNT);

  if (lastRow < 1) {
    return [];
  }

  return sheet.getRange(1, 1, lastRow, lastColumn).getValues();
}

function buildLedger_(values, timezone) {
  var grouped = {};
  var chains = [];

  values.forEach(function(row, index) {
    var record = normalizeRecordRow_(row, index + 1, timezone);

    if (!record) {
      return;
    }

    if (!grouped[record.chainId]) {
      grouped[record.chainId] = [];
    }

    grouped[record.chainId].push(record);
  });

  Object.keys(grouped).forEach(function(chainId) {
    chains.push(buildChainSummary_(chainId, grouped[chainId], timezone));
  });

  chains.sort(function(left, right) {
    return compareIsoTextDesc_(left.savedAtIso, right.savedAtIso);
  });

  return {
    chains: chains
  };
}

function buildChainSummary_(chainId, records, timezone) {
  records.sort(compareRecords_);

  var versionRecords = records.filter(function(record) {
    return isVersionRecord_(record);
  });
  var adjustmentRecords = records.filter(function(record) {
    return isAdjustmentRecord_(record);
  });
  var currentVersion = versionRecords.length ? versionRecords[versionRecords.length - 1] : records[records.length - 1];
  var grossAmount = currentVersion ? currentVersion.amount : 0;
  var voidAmount = sumAdjustmentRecords_(adjustmentRecords, RECORD_TYPE_VOID);
  var refundAmount = sumAdjustmentRecords_(adjustmentRecords, RECORD_TYPE_REFUND);
  var netAmount = roundCurrency_(grossAmount - voidAmount - refundAmount);
  var status = getChainStatus_(versionRecords, voidAmount, refundAmount, grossAmount);
  var auditTrail = buildAuditTrail_(records, timezone, versionRecords);
  var latestEvent = auditTrail.length ? auditTrail[auditTrail.length - 1] : null;
  var currentReceipt = buildReceiptSnapshot_(currentVersion, timezone, {
    status: status,
    grossAmount: grossAmount,
    voidAmount: voidAmount,
    refundAmount: refundAmount,
    netAmount: netAmount,
    versionCount: versionRecords.length,
    adjustmentCount: adjustmentRecords.length,
    latestEvent: latestEvent
  });
  var lastActivityIso = latestEvent ? latestEvent.timestampIso : currentReceipt.savedAtIso;
  var lastActivityLabel = latestEvent ? latestEvent.timestamp : currentReceipt.savedAtLabel;

  return {
    id: chainId,
    chainId: chainId,
    receiptId: currentReceipt.receiptId,
    status: status,
    statusLabel: formatStatusLabel_(status),
    grossAmount: roundCurrency_(grossAmount),
    voidAmount: roundCurrency_(voidAmount),
    refundAmount: roundCurrency_(refundAmount),
    netAmount: roundCurrency_(netAmount),
    versionCount: versionRecords.length,
    adjustmentCount: adjustmentRecords.length,
    latestActionLabel: latestEvent ? latestEvent.label : "Sale Recorded",
    lastActionReason: latestEvent ? latestEvent.reason : "",
    auditSummary: latestEvent ? latestEvent.summary : "",
    currentReceipt: currentReceipt,
    receipt: currentReceipt,
    auditTrail: auditTrail,
    savedAtIso: lastActivityIso,
    savedAtLabel: lastActivityLabel
  };
}

function buildReceiptSnapshot_(record, timezone, context) {
  var savedAtIso = record.timestamp instanceof Date && !isNaN(record.timestamp.getTime()) ? record.timestamp.toISOString() : "";
  var savedAtLabel = savedAtIso ? formatDateTimeLabel_(record.timestamp, timezone, "M/d/yy, h:mm a") : "--";
  var status = context && context.status ? context.status : "active";
  var latestEvent = context && context.latestEvent ? context.latestEvent : null;

  return {
    id: String(record.rowNumber),
    receiptId: record.receiptId,
    chainId: record.chainId,
    parentReceiptId: record.parentReceiptId,
    recordType: record.recordType,
    status: status,
    statusLabel: formatStatusLabel_(status),
    dateTime: savedAtLabel,
    savedAtIso: savedAtIso,
    savedAtLabel: savedAtLabel,
    patientId: record.patientId,
    patientName: record.patientName,
    staffName: record.staffName,
    dos: record.paymentDate,
    department: record.department,
    service: record.service,
    amount: formatCurrency_(record.amount),
    amountValue: roundCurrency_(record.amount),
    method: record.paymentMethod,
    note: record.note,
    paymentTime: record.paymentTime,
    correctionReason: record.correctionReason,
    correctionAmount: formatCurrency_(record.correctionAmount),
    correctionAmountValue: roundCurrency_(record.correctionAmount),
    actorName: record.actorName,
    grossAmount: roundCurrency_(context && context.grossAmount != null ? context.grossAmount : record.amount),
    voidAmount: roundCurrency_(context && context.voidAmount != null ? context.voidAmount : 0),
    refundAmount: roundCurrency_(context && context.refundAmount != null ? context.refundAmount : 0),
    netAmount: roundCurrency_(context && context.netAmount != null ? context.netAmount : record.amount),
    versionCount: context && context.versionCount ? context.versionCount : 1,
    adjustmentCount: context && context.adjustmentCount ? context.adjustmentCount : 0,
    lastActionLabel: latestEvent ? latestEvent.label : getRecordActionLabel_(record.recordType),
    lastActionReason: latestEvent ? latestEvent.reason : record.correctionReason || "",
    auditTrail: context && context.auditTrail ? context.auditTrail : []
  };
}

function buildAuditTrail_(records, timezone, versionRecords) {
  var trail = [];
  var versionIndex = 0;
  var previousVersion = null;

  records.forEach(function(record) {
    var event = buildAuditEvent_(record, timezone, {
      previousVersion: previousVersion,
      versionIndex: versionIndex
    });

    trail.push(event);

    if (isVersionRecord_(record)) {
      previousVersion = record;
      versionIndex += 1;
    }
  });

  return trail;
}

function buildAuditEvent_(record, timezone, context) {
  var savedAtIso = record.timestamp instanceof Date && !isNaN(record.timestamp.getTime()) ? record.timestamp.toISOString() : "";
  var savedAtLabel = savedAtIso ? formatDateTimeLabel_(record.timestamp, timezone, "M/d/yy, h:mm a") : "--";
  var label = getRecordActionLabel_(record.recordType);
  var summary = buildEventSummary_(record, context && context.previousVersion ? context.previousVersion : null);
  var changes = [];

  if (record.recordType === RECORD_TYPE_EDIT && context && context.previousVersion) {
    changes = buildRecordChanges_(context.previousVersion, record);
  }

  return {
    id: record.receiptId,
    receiptId: record.receiptId,
    chainId: record.chainId,
    parentReceiptId: record.parentReceiptId,
    recordType: record.recordType,
    label: label,
    timestampIso: savedAtIso,
    timestamp: savedAtLabel,
    actorName: record.actorName,
    staffName: record.staffName,
    department: record.department,
    patientId: record.patientId,
    patientName: record.patientName,
    service: record.service,
    paymentDate: record.paymentDate,
    paymentMethod: record.paymentMethod,
    amount: roundCurrency_(record.amount),
    amountLabel: formatCurrency_(record.amount),
    correctionAmount: roundCurrency_(record.correctionAmount),
    correctionAmountLabel: formatCurrency_(record.correctionAmount),
    reason: record.correctionReason,
    summary: summary,
    changes: changes
  };
}

function buildEventSummary_(record, previousVersion) {
  if (record.recordType === RECORD_TYPE_SALE) {
    return "Sale recorded for " + formatCurrency_(record.amount) + ".";
  }

  if (record.recordType === RECORD_TYPE_EDIT) {
    var changeCount = previousVersion ? buildRecordChanges_(previousVersion, record).length : 0;
    return "Edited receipt with " + changeCount + " field change" + (changeCount === 1 ? "" : "s") + ".";
  }

  if (record.recordType === RECORD_TYPE_VOID) {
    return "Voided " + formatCurrency_(record.correctionAmount || record.amount) + ".";
  }

  if (record.recordType === RECORD_TYPE_REFUND) {
    return "Refunded " + formatCurrency_(record.correctionAmount || record.amount) + ".";
  }

  return "Receipt updated.";
}

function buildRecordChanges_(previousRecord, currentRecord) {
  var fields = [
    { key: "staffName", label: "Staff Name", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "patientId", label: "Patient ID", type: "text" },
    { key: "patientName", label: "Patient Name", type: "text" },
    { key: "service", label: "Service", type: "text" },
    { key: "amount", label: "Amount", type: "currency" },
    { key: "paymentDate", label: "Payment Date", type: "text" },
    { key: "paymentMethod", label: "Payment Method", type: "text" },
    { key: "note", label: "Note", type: "text" },
    { key: "paymentTime", label: "Payment Time", type: "text" }
  ];
  var changes = [];

  fields.forEach(function(field) {
    var previousValue = field.key === "amount" ? roundCurrency_(previousRecord.amount) : normalizeComparableValue_(previousRecord[field.key]);
    var currentValue = field.key === "amount" ? roundCurrency_(currentRecord.amount) : normalizeComparableValue_(currentRecord[field.key]);

    if (previousValue === currentValue) {
      return;
    }

    changes.push({
      field: field.label,
      from: formatValueByType_(previousRecord[field.key], field.type),
      to: formatValueByType_(currentRecord[field.key], field.type)
    });
  });

  return changes;
}

function normalizeComparableValue_(value) {
  return normalizeText_(value || "");
}

function formatValueByType_(value, type) {
  if (type === "currency") {
    return formatCurrency_(value);
  }

  return normalizeText_(value || "") || "--";
}

function sumAdjustmentRecords_(records, recordType) {
  var total = 0;

  records.forEach(function(record) {
    if (record.recordType !== recordType) {
      return;
    }

    total += record.correctionAmount || record.amount || 0;
  });

  return roundCurrency_(total);
}

function getChainStatus_(versionRecords, voidAmount, refundAmount, grossAmount) {
  if (voidAmount >= grossAmount && grossAmount > 0) {
    return "voided";
  }

  if (refundAmount >= grossAmount && grossAmount > 0) {
    return "refunded";
  }

  if (refundAmount > 0) {
    return "partially_refunded";
  }

  if (versionRecords.length > 1) {
    return "edited";
  }

  return "active";
}

function addChainToBucket_(bucket, chain) {
  bucket.grossCashTotal += chain.currentReceipt.method.toLowerCase() === "cash" ? chain.grossAmount : 0;
  bucket.grossZelleTotal += chain.currentReceipt.method.toLowerCase() === "zelle" ? chain.grossAmount : 0;
  bucket.otherGrossTotal += chain.currentReceipt.method.toLowerCase() === "cash" || chain.currentReceipt.method.toLowerCase() === "zelle" ? 0 : chain.grossAmount;
  bucket.grossTotal += chain.grossAmount;
  bucket.voidTotal += chain.voidAmount;
  bucket.refundTotal += chain.refundAmount;
  bucket.netTotal += chain.netAmount;
  bucket.entryCount += 1;
  bucket.editedCount += chain.status === "edited" ? 1 : 0;
  bucket.voidedCount += chain.status === "voided" ? 1 : 0;
  bucket.refundedCount += chain.status === "refunded" || chain.status === "partially_refunded" ? 1 : 0;
}

function addChainToGroupedBucket_(groups, label, chain) {
  if (!groups[label]) {
    groups[label] = createTotalsBucket_();
  }

  addChainToBucket_(groups[label], chain);
}

function createTotalsBucket_() {
  return {
    grossCashTotal: 0,
    grossZelleTotal: 0,
    otherGrossTotal: 0,
    grossTotal: 0,
    voidTotal: 0,
    refundTotal: 0,
    netTotal: 0,
    entryCount: 0,
    editedCount: 0,
    voidedCount: 0,
    refundedCount: 0
  };
}

function roundTotalsBucket_(bucket) {
  return {
    grossCashTotal: roundCurrency_(bucket.grossCashTotal),
    grossZelleTotal: roundCurrency_(bucket.grossZelleTotal),
    otherGrossTotal: roundCurrency_(bucket.otherGrossTotal),
    grossTotal: roundCurrency_(bucket.grossTotal),
    voidTotal: roundCurrency_(bucket.voidTotal),
    refundTotal: roundCurrency_(bucket.refundTotal),
    netTotal: roundCurrency_(bucket.netTotal),
    entryCount: bucket.entryCount,
    editedCount: bucket.editedCount,
    voidedCount: bucket.voidedCount,
    refundedCount: bucket.refundedCount
  };
}

function buildGroupedTotalsResponse_(groups) {
  return Object.keys(groups)
    .sort(function(left, right) {
      return left.localeCompare(right);
    })
    .map(function(label) {
      var bucket = roundTotalsBucket_(groups[label]);
      return {
        label: label,
        grossCashTotal: bucket.grossCashTotal,
        grossZelleTotal: bucket.grossZelleTotal,
        otherGrossTotal: bucket.otherGrossTotal,
        grossTotal: bucket.grossTotal,
        voidTotal: bucket.voidTotal,
        refundTotal: bucket.refundTotal,
        netTotal: bucket.netTotal,
        entryCount: bucket.entryCount,
        editedCount: bucket.editedCount,
        voidedCount: bucket.voidedCount,
        refundedCount: bucket.refundedCount
      };
    });
}

function compareRecords_(left, right) {
  return compareIsoTextAsc_(left.savedAtIso, right.savedAtIso) || (left.rowNumber - right.rowNumber);
}

function compareIsoTextAsc_(left, right) {
  if (left === right) {
    return 0;
  }

  if (!left) {
    return -1;
  }

  if (!right) {
    return 1;
  }

  return left < right ? -1 : 1;
}

function compareIsoTextDesc_(left, right) {
  return compareIsoTextAsc_(right, left);
}

function normalizeRecordRow_(row, rowNumber, timezone) {
  var timestamp = row[0] instanceof Date ? row[0] : new Date(row[0]);

  if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
    timestamp = new Date();
  }

  var savedAtIso = timestamp.toISOString();
  var receiptId = normalizeReceiptId_(row[11]) || "legacy-row-" + rowNumber;
  var chainId = normalizeReceiptId_(row[12]) || receiptId;
  var recordType = normalizeRecordType_(row[13]);
  var parentReceiptId = normalizeReceiptId_(row[14]);
  var correctionReason = normalizeText_(row[15] || "");
  var correctionAmount = parseCurrencyValue_(row[16]);
  var actorName = normalizeText_(row[17] || "") || normalizeText_(row[1] || "");
  var auditSnapshot = parseAuditSnapshot_(row[18]);

  if (!recordType) {
    recordType = RECORD_TYPE_SALE;
  }

  if ((recordType === RECORD_TYPE_VOID || recordType === RECORD_TYPE_REFUND) && correctionAmount <= 0) {
    correctionAmount = parseCurrencyValue_(row[5]);
  }

  return {
    rowNumber: rowNumber,
    timestamp: timestamp,
    savedAtIso: savedAtIso,
    savedAtLabel: formatDateTimeLabel_(timestamp, timezone, "M/d/yy, h:mm a"),
    staffName: normalizeText_(row[1] || ""),
    department: normalizeText_(row[2] || ""),
    patientId: normalizePatientId_(row[3] || ""),
    service: normalizeText_(row[4] || ""),
    amount: parseCurrencyValue_(row[5]),
    paymentDate: normalizePaymentDateText_(row[6] || ""),
    paymentMethod: normalizeText_(row[7] || ""),
    note: normalizeText_(row[8] || ""),
    paymentTime: normalizeText_(row[9] || ""),
    patientName: normalizeText_(row[10] || ""),
    receiptId: receiptId,
    chainId: chainId,
    recordType: recordType,
    parentReceiptId: parentReceiptId,
    correctionReason: correctionReason,
    correctionAmount: correctionAmount,
    actorName: actorName,
    auditSnapshot: auditSnapshot
  };
}

function parseAuditSnapshot_(value) {
  var text = normalizeText_(value || "");

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    return {
      raw: text
    };
  }
}

function normalizeRecordType_(value) {
  var text = normalizeText_(value || "").toLowerCase();

  if (text === RECORD_TYPE_SALE || text === RECORD_TYPE_EDIT || text === RECORD_TYPE_VOID || text === RECORD_TYPE_REFUND) {
    return text;
  }

  return RECORD_TYPE_SALE;
}

function getRecordActionLabel_(recordType) {
  if (recordType === RECORD_TYPE_EDIT) {
    return "Edit Saved";
  }

  if (recordType === RECORD_TYPE_VOID) {
    return "Voided";
  }

  if (recordType === RECORD_TYPE_REFUND) {
    return "Refunded";
  }

  return "Sale Recorded";
}

function isVersionRecord_(record) {
  return record.recordType === RECORD_TYPE_SALE || record.recordType === RECORD_TYPE_EDIT;
}

function isAdjustmentRecord_(record) {
  return record.recordType === RECORD_TYPE_VOID || record.recordType === RECORD_TYPE_REFUND;
}

function chainMatchesPatientFilter_(chain, patientFilter) {
  if (!patientFilter) {
    return true;
  }

  if (normalizePatientId_(chain.currentReceipt.patientId) === patientFilter) {
    return true;
  }

  for (var i = 0; i < chain.auditTrail.length; i++) {
    if (normalizePatientId_(chain.auditTrail[i].patientId || "") === patientFilter) {
      return true;
    }
  }

  return false;
}

function chainMatchesDateFilter_(chain, dateFilter) {
  if (!dateFilter) {
    return true;
  }

  if (chain.currentReceipt.dos === dateFilter) {
    return true;
  }

  for (var i = 0; i < chain.auditTrail.length; i++) {
    if (chain.auditTrail[i].paymentDate === dateFilter) {
      return true;
    }
  }

  return false;
}

function buildShiftReportCsv_(reportData) {
  var lines = [
    ["Shift Close Report"],
    ["Report Date", formatDisplayDateFromIso_(reportData.paymentDate)],
    ["Department Scope", reportData.departmentFilterLabel],
    ["Generated At", reportData.generatedAt],
    [],
    ["Summary"],
    ["Metric", "Value"],
    ["Gross Cash", formatCurrency_(reportData.summary.grossCashTotal)],
    ["Gross Zelle", formatCurrency_(reportData.summary.grossZelleTotal)],
    ["Voids", formatCurrency_(reportData.summary.voidTotal)],
    ["Refunds", formatCurrency_(reportData.summary.refundTotal)],
    ["Net Collected", formatCurrency_(reportData.summary.netTotal)],
    ["Entries", String(reportData.summary.entryCount)],
    [],
    ["Totals by Staff"],
    ["Staff", "Entries", "Gross", "Voids", "Refunds", "Net"]
  ];

  reportData.staffTotals.forEach(function(row) {
    lines.push([
      row.label,
      String(row.entryCount),
      formatCurrency_(row.grossTotal),
      formatCurrency_(row.voidTotal),
      formatCurrency_(row.refundTotal),
      formatCurrency_(row.netTotal)
    ]);
  });

  lines.push([], ["Totals by Department"], ["Department", "Entries", "Gross", "Voids", "Refunds", "Net"]);

  reportData.departmentTotals.forEach(function(row) {
    lines.push([
      row.label,
      String(row.entryCount),
      formatCurrency_(row.grossTotal),
      formatCurrency_(row.voidTotal),
      formatCurrency_(row.refundTotal),
      formatCurrency_(row.netTotal)
    ]);
  });

  lines.push([], ["Detailed Transactions"], ["Receipt ID", "Status", "Staff", "Department", "Patient ID", "Service", "Gross", "Voids", "Refunds", "Net", "Last Action", "Reason"]);

  reportData.transactions.forEach(function(row) {
    lines.push([
      row.receiptId,
      row.statusLabel,
      row.staffName,
      row.department,
      row.patientId,
      row.service,
      formatCurrency_(row.grossAmount),
      formatCurrency_(row.voidAmount),
      formatCurrency_(row.refundAmount),
      formatCurrency_(row.netAmount),
      row.lastActionLabel,
      row.lastActionReason
    ]);
  });

  return lines.map(function(line) {
    return line.map(escapeCsvValue_).join(",");
  }).join("\n");
}

function escapeCsvValue_(value) {
  var text = String(value == null ? "" : value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function normalizeShiftReportDepartmentFilter_(value) {
  var text = normalizeText_(value || "");

  if (!text || text.toLowerCase() === "all" || text.toLowerCase() === "both") {
    return "all";
  }

  return text;
}

function getShiftReportDepartmentFilterLabel_(departmentFilter) {
  return departmentFilter === "all" ? "Both Departments" : departmentFilter;
}

function formatStatusLabel_(status) {
  if (status === "partially_refunded") {
    return "Partially Refunded";
  }

  return normalizeText_(status || "").replace(/\b[a-z]/g, function(match) {
    return match.toUpperCase();
  });
}

function formatDateTimeLabel_(date, timezone, pattern) {
  return Utilities.formatDate(date, timezone, pattern);
}

function formatDisplayDateFromIso_(isoText) {
  var parsedDate = new Date(isoText);

  if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    return isoText || "";
  }

  return Utilities.formatDate(parsedDate, getSpreadsheetTimeZone_(), "MMMM d, yyyy");
}

function formatCurrencyForSheet_(value) {
  return formatCurrency_(value);
}

function parseCurrencyValue_(value) {
  var numeric = String(value == null ? "" : value).replace(/[^0-9.\-]/g, "");
  var parsed = parseFloat(numeric);
  return isNaN(parsed) ? 0 : parsed;
}

function formatCurrency_(value) {
  var amount = roundCurrency_(parseCurrencyValue_(value));
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roundCurrency_(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function normalizeReceiptId_(value) {
  return normalizeText_(value || "");
}

function normalizePatientId_(value) {
  return String(value || "").replace(/\D/g, "").substring(0, 8);
}

function normalizeText_(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
}

function normalizePaymentDateText_(value) {
  var textValue = normalizeText_(value || "");

  if (/^\d{4}-\d{2}-\d{2}$/.test(textValue)) {
    return textValue;
  }

  return textValue;
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
