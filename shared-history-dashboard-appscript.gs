var SPREADSHEET_ID = "1MbTRfJl0hdhwTh5i5GuHP96Vf5PaZiFEPsiFN5Qdwdk";
var SHEET_NAME = "FormData";
var DEFAULT_HISTORY_LIMIT = 120;
var MAX_HISTORY_LIMIT = 250;
var STAFF_SHEET_NAME = "Staff";
var SCHEDULE_SHEET_NAME = "ScheduleEntries";
var STAFF_COLUMN_META_SHEET_NAME = "StaffColumnMeta";
var STAFF_COLUMN_META_HEADERS = ["ColumnId", "Name", "Type", "Options", "Hidden", "SortOrder", "CreatedAt", "UpdatedAt"];
var STAFF_HEADERS = ["StaffId", "Name", "Email", "Phone", "Title", "PrimarySpecialty", "VerifiedDate", "ShiftStart", "ShiftEnd", "TimeZone", "AthenaUser", "HomeLocation", "ScheduleNote", "Active", "CreatedBy", "CreatedAt", "UpdatedBy", "UpdatedAt"];
var SCHEDULE_HEADERS = ["EntryId", "StaffId", "StaffName", "Title", "Location", "StartDate", "StartTime", "EndDate", "EndTime", "Notes", "CreatedBy", "CreatedAt", "UpdatedBy", "UpdatedAt"];
var DEFAULT_STAFF_ROWS = [
  ["Rajeshwari Borkar", "rajeshwari.borkar@stethomd.com", "Clinical Staff", "", "2026-06-09", "08:00", "20:00", "EST", "rborkar", "Tampa", "Tampa (Volunteer): June 1, 3, 6, 8, 13, 15, 20, 22, 27, 29 (Note: Appears as \"Rajeshwary\")"],
  ["Jennifer Chirino", "jennifer.chirino@stethomd.com", "Clinical Staff", "", "2026-06-23", "08:00", "20:00", "EST", "jchirino1", "Zep", "Not listed on June schedule"],
  ["Rayhaan Chowdhury", "rayhaan.chowdhury@stethomd.com", "Clinical Staff", "", "2026-01-21", "08:00", "20:00", "EST", "rchowdhury12", "Zep", "Not listed on June schedule"],
  ["Alyssa Dolotina", "faithapd@gmail.com", "Clinical Staff", "", "2026-04-15", "08:00", "20:00", "EST", "adolotina", "", "Zephyrhills: June 9"],
  ["Jessica Killeen", "jessica.killeen@stethomd.com", "Clinical Staff", "", "2026-06-23", "08:00", "20:00", "EST", "jkilleen9", "Zep", "Not listed on June schedule"],
  ["Ashton Mcgriff", "ashton.mcgriff@stethomd.com", "Clinical Staff", "", "2026-04-15", "08:00", "20:00", "EST", "amcgriff6", "", "Not listed on June schedule"],
  ["Ezinne Nwoye", "ezinne.nwoye@stethomd.com", "Clinical Staff", "", "2026-06-09", "08:00", "20:00", "EST", "enwoye", "Tampa", "Tampa: June 2, 3, 4, 10, 11, 12, 17, 18, 19, 22, 26, 28"],
  ["Samaya Paris", "samayaparis09@gmail.com", "Clinical Staff", "", "2026-06-23", "08:00", "20:00", "EST", "sparis22", "", "Not listed on June schedule"],
  ["Melissa Reimert", "melissa.reimert@stethomd.com", "Clinical Staff", "", "2026-06-23", "08:00", "20:00", "EST", "mreimert", "", "Not listed on June schedule"],
  ["Gabriel Renato", "gabriel.renato@stethomd.com", "Clinical Staff", "", "2026-04-15", "08:00", "20:00", "EST", "grenato", "Tampa", "Zephyrhills: June 2, 4, 5, 6, 9, 11, 12, 13, 16, 18, 19, 20, 23, 25, 26, 27, 30 (Appears as \"Gabi\")Tampa: June 5, 6, 7, 13, 14, 20, 21, 27, 28 (Appears as \"Gabriel\")"],
  ["Sabiha Sikder", "sabiha.sikder@stethomd.com", "Clinical Staff", "", "2022-10-26", "08:00", "20:00", "EST", "ssikder2", "Tampa", "Tampa (Office Lead): June 1, 3, 4, 5, 8, 10, 11, 12, 15, 16, 18, 21, 22, 23, 24, 25, 29 (Note: Appears as \"Sabiha\")"],
  ["Shana Wiggins", "shana.wiggins@stethomd.com", "Clinical Staff", "", "2026-06-09", "08:00", "20:00", "EST", "swiggins54", "", "Not listed on June schedule"],
  ["Lillian Adams", "lilliga29@gmail.com", "Front Desk Staff", "", "2026-01-21", "08:00", "20:00", "EST", "ladams294", "Tampa", "Tampa: June 2, 6, 7, 13, 14, 20, 21, 27, 28, 30"],
  ["Luna Dalay Caraballo Suarez", "luna-dalay.caraballo-suarez@stethomd.com", "Front Desk Staff", "", "2026-06-23", "08:00", "20:00", "EST", "lcaraballosuarez", "Zep", "Not listed on June schedule"],
  ["Krish Adhikari", "krishadhikari77@gmail.com", "Nurse Practitioner", "", "2026-02-24", "08:00", "20:00", "EST", "kadhikari4", "Zep", "Zephyrhills: June 3, 4, 12, 13, 17, 18, 22, 23, 26, 27 (Note: Appears as \"Krish\" / contextually \"Anthony\")"],
  ["Shameka Herring", "shameka.herring@stethomd.com", "Nurse Practitioner", "Nurse Practitioner, Family", "2026-01-21", "08:00", "20:00", "EST", "sherring38", "Tampa", "Tampa: June 1, 2, 5, 8, 9, 13, 14, 15, 16, 19, 22, 23, 27, 28, 29, 30 (Note: Appears as \"Shameka\")"],
  ["Camilla McCallen", "camilla.chacon@stethomd.com", "Nurse Practitioner", "Family Medicine", "2025-06-09", "08:00", "20:00", "EST", "cchacon15", "Tampa", "Zephyrhills: June 1, 15, 29Tampa: June 3, 4, 6, 7, 10, 11, 12, 17, 18, 20, 21, 24, 25, 26, 27, 28, 29"],
  ["Easton Savery", "easton.savery@stethomd.com", "Nurse Practitioner", "Nurse Practitioner", "2026-06-09", "08:00", "20:00", "EST", "esavery", "", "Not listed on June schedule"],
  ["Latoya Woods-Williams", "latoya.woods- (truncated)", "Nurse Practitioner", "Internal Medicine", "2026-06-23", "08:00", "20:00", "EST", "Latoya Woods-Williams", "", "Not listed on June schedule"],
  ["Mohammad Asman", "asman.mohammad@stethomd.com", "Office Manager", "", "2026-02-24", "08:00", "20:00", "EST", "cmohammad1", "Zep", "Not listed on June schedule"],
  ["Josephine Vargas", "josephine.vargas@stethomd.com", "Office Manager", "", "2026-02-24", "08:00", "20:00", "EST", "jvargas218", "Zep", "Zephyrhills: June 1, 2, 8, 9, 15, 16, 22, 23, 29, 30 (Note: Appears as \"Josephine\")"],
  ["Abdul Ghani", "abdul.ghani@stethomd.com", "Physician", "Internal Medicine", "2026-02-24", "08:00", "20:00", "EST", "aghani4", "Zep", "Not listed on June schedule"],
  ["Farhana Rahman", "farhana.rahman@stethomd.com", "Physician", "Family Medicine", "2025-06-09", "08:00", "20:00", "EST", "frahman14", "Zep", "Zephyrhills: June 2, 5, 6, 8, 9, 10, 11, 16, 19, 20, 24, 25, 30 (Note: Appears as \"Dr. Rahman\")"],
  ["Ofozoba Chibuike", "chybyke4real@gmail.com", "Scribe", "", "2025-06-09", "08:00", "14:00", "EST", "ochibuike", "Remote", "Monday-Saturday"],
  ["Benedicta Chidalu", "benedicta.chidalu@stethomd.com", "Scribe", "", "2026-04-15", "08:00", "14:00", "EST", "bchidalu", "Remote", "Monday-Saturday"],
  ["Allycia Estrellas", "allycia.estrellas@stethomd.com", "Staff", "", "2026-01-21", "08:00", "20:00", "EST", "aestrellas", "Tampa", "Not listed on June schedule"],
  ["Lucy Yzabelle Luklukan", "lucy-yzabelle.luklukan@stethomd.com", "Scribe", "", "2026-01-21", "08:00", "14:00", "EST", "Lucy Yzabelle Luklukan", "Remote", "Monday-Saturday"],
  ["Omar Rabah", "omar.rabah@stethomd.com", "Staff", "", "2026-01-21", "08:00", "20:00", "EST", "orabah", "Tampa", "Tampa: June 1, 2, 3, 8, 9, 13, 14, 15, 18, 19, 22, 25, 26, 29 (Note: Appears as \"Omar\")"],
  ["Shahid Ali", "shahid.ali@stethomd.com", "Billing Staff", "", "2026-01-21", "08:00", "17:00", "EST", "sali357", "Remote", ""],
  ["Rane Joseph", "rane.joseph@stethomd.com", "Billing Staff", "", "2026-06-23", "07:30", "16:30", "EST", "rjoseph120", "Remote", ""],
  ["Usama Mazar", "usama.mazhar@help360md.com", "Billing Staff", "", "2025-06-09", "08:00", "20:00", "EST", "umazar", "Remote", ""],
  ["Alan Wake", "alan.wake@stethomd.com", "Billing Staff", "", "2025-06-09", "07:30", "16:30", "EST", "awake1", "Remote", ""],
  ["Muhammad Bilal", "muhammad.bilal@stethomd.com", "Coder", "", "2026-01-21", "08:00", "17:00", "EST", "mbilal50", "Remote", ""],
  ["Fozia Kanwal", "fozia.kanwal@stethomd.com", "HR", "", "2026-06-09", "07:00", "16:00", "EST", "fkanwal1", "Remote", ""],
  ["Aimen Fatima", "aimen.fatima@stethomd.com", "Scribe", "", "2026-01-21", "14:00", "20:00", "EST", "afatima24", "Remote", "Monday-Friday, and Sunday"],
  ["Leon Kennedy", "leon.kennedy@stethomd.com", "Billing Staff", "", "2025-06-09", "11:00", "20:00", "EST", "lkennedy84", "Remote", ""]
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data && data.action === "staffSave") {
      return respond_(handleStaffSave_(data));
    }

    if (data && data.action === "staffColumnAdd") {
      return respond_(handleStaffColumnAdd_(data));
    }

    if (data && data.action === "staffColumnUpdate") {
      return respond_(handleStaffColumnUpdate_(data));
    }

    if (data && data.action === "staffColumnDelete") {
      return respond_(handleStaffColumnDelete_(data));
    }

    if (data && data.action === "staffCustomValueSave") {
      return respond_(handleStaffCustomValueSave_(data));
    }

    if (data && data.action === "scheduleAdd") {
      return respond_(handleScheduleAdd_(data));
    }

    if (data && data.action === "scheduleUpdate") {
      return respond_(handleScheduleUpdate_(data));
    }

    if (data && data.action === "scheduleDelete") {
      return respond_(handleScheduleDelete_(data));
    }

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

    if (action === "shiftReport") {
      return respond_(buildShiftReportResponse_(params), params.prefix);
    }

    if (action === "history") {
      return respond_(buildHistoryResponse_(params), params.prefix);
    }

    if (action === "dashboard") {
      return respond_(buildDashboardResponse_(params), params.prefix);
    }

    if (action === "staffList") {
      return respond_(buildStaffListResponse_(), params.prefix);
    }

    if (action === "scheduleGet") {
      return respond_(buildScheduleGetResponse_(params), params.prefix);
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

function buildShiftReportResponse_(params) {
  var sheet = getTargetSheet_();
  var values = getSheetValues_(sheet);
  var timezone = getSpreadsheetTimeZone_();
  var targetDate = params.paymentDate || Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd");
  var departmentFilter = normalizeShiftReportDepartmentFilter_(params.department || params.departmentFilter || "");
  var summary = createTotalsBucket_();
  var staffGroups = {};
  var departmentGroups = {};
  var transactions = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var paymentDate = normalizePaymentDate_(row[6], row[0], timezone);

    if (!paymentDate || paymentDate !== targetDate) {
      continue;
    }

    if (departmentFilter !== "all" && String(row[2] || "").trim() !== departmentFilter) {
      continue;
    }

    var amount = parseCurrencyValue_(row[5]);
    var method = normalizePaymentMethod_(row[7]);
    addAmountToTotalsBucket_(summary, amount, method);
    addAmountToGroupedTotals_(staffGroups, String(row[1] || "").trim() || "Unassigned Staff", amount, method);
    addAmountToGroupedTotals_(departmentGroups, String(row[2] || "").trim() || "Unassigned Department", amount, method);
    transactions.push(buildShiftReportTransactionRecord_(row, i + 1, timezone, paymentDate));
  }

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
    transactions: transactions.reverse()
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

function getManagedSheet_(sheetName, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  ensureHeaders_(sheet, headers);
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    hideManagedSystemColumns_(sheet, headers);
    return;
  }

  var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  var needsHeader = false;

  for (var i = 0; i < headers.length; i++) {
    if (String(existing[i] || "").trim() !== headers[i]) {
      needsHeader = true;
      break;
    }
  }

  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  hideManagedSystemColumns_(sheet, headers);
}

function hideManagedSystemColumns_(sheet, headers) {
  var hiddenColumns = ["StaffId", "EntryId", "CreatedBy", "CreatedAt", "UpdatedBy", "UpdatedAt"];

  for (var i = 0; i < hiddenColumns.length; i++) {
    var index = headers.indexOf(hiddenColumns[i]);

    if (index >= 0) {
      sheet.hideColumns(index + 1);
    }
  }
}

function getSheetObjects_(sheet, headers) {
  var values = sheet.getDataRange().getValues();
  var records = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var record = {
      rowNumber: i + 1
    };

    for (var j = 0; j < headers.length; j++) {
      record[headers[j]] = normalizeSheetCellForResponse_(row[j], headers[j]);
    }

    records.push(record);
  }

  return records;
}

function normalizeSheetCellForResponse_(value, header) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    if (/time$/i.test(String(header || ""))) {
      return Utilities.formatDate(value, getSpreadsheetTimeZone_(), "HH:mm");
    }

    return Utilities.formatDate(value, getSpreadsheetTimeZone_(), "yyyy-MM-dd");
  }

  return String(value == null ? "" : value).trim();
}

function ensureScheduleData_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var staffSheet = getManagedSheet_(STAFF_SHEET_NAME, STAFF_HEADERS);
    var scheduleSheet = getManagedSheet_(SCHEDULE_SHEET_NAME, SCHEDULE_HEADERS);

    if (staffSheet.getLastRow() < 2) {
      var now = new Date();
      var staffRows = DEFAULT_STAFF_ROWS.map(function(row) {
        var staffId = buildStableId_("staff", row[0] + "|" + row[1]);
        return [
          staffId,
          row[0],
          row[1],
          "",
          row[2],
          row[3],
          row[4],
          row[5],
          row[6],
          row[7],
          row[8],
          normalizeLocationLabel_(row[9]),
          row[10],
          "Yes",
          "Team Directory Import",
          now,
          "Team Directory Import",
          now
        ];
      });

      staffSheet.getRange(2, 1, staffRows.length, STAFF_HEADERS.length).setValues(staffRows);
    }

    if (scheduleSheet.getLastRow() < 2) {
      var staffRecords = getSheetObjects_(staffSheet, STAFF_HEADERS);
      var scheduleRows = buildDefaultScheduleRows_(staffRecords);

      if (scheduleRows.length) {
        scheduleSheet.getRange(2, 1, scheduleRows.length, SCHEDULE_HEADERS.length).setValues(scheduleRows);
      }
    }
  } finally {
    lock.releaseLock();
  }
}

function buildStaffListResponse_() {
  ensureScheduleData_();
  var sheet = getManagedSheet_(STAFF_SHEET_NAME, STAFF_HEADERS);
  var customColumns = getStaffCustomColumns_();
  ensureStaffCustomSheetColumns_(sheet, customColumns);
  var records = getDynamicSheetObjects_(sheet);
  var staff = records
    .filter(function(record) {
      return String(record.Active || "").toLowerCase() !== "no";
    })
    .map(function(record) {
      var customValues = {};
      customColumns.forEach(function(column) {
        customValues[column.columnId] = normalizeSheetCellForResponse_(record[column.columnId], column.type === "date" ? "Date" : "");
      });

      return {
        staffId: record.StaffId,
        name: record.Name,
        email: record.Email,
        phone: record.Phone,
        title: record.Title,
        specialty: record.PrimarySpecialty,
        verifiedDate: record.VerifiedDate,
        shiftStart: normalizeTimeText_(record.ShiftStart) || "08:00",
        shiftEnd: normalizeTimeText_(record.ShiftEnd) || "17:00",
        timeZone: record.TimeZone || "EST",
        athenaUser: record.AthenaUser,
        location: normalizeLocationLabel_(record.HomeLocation),
        scheduleNote: record.ScheduleNote,
        active: record.Active,
        customValues: customValues
      };
    });

  return {
    status: "success",
    action: "staffList",
    generatedAt: new Date().toISOString(),
    count: staff.length,
    staff: staff,
    customColumns: customColumns
  };
}



function getDynamicSheetObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  var headers = values.length ? values[0].map(function(header) { return String(header || "").trim(); }) : [];
  var records = [];

  for (var i = 1; i < values.length; i++) {
    var record = { rowNumber: i + 1 };

    for (var j = 0; j < headers.length; j++) {
      if (headers[j]) {
        record[headers[j]] = values[i][j];
      }
    }

    records.push(record);
  }

  return records;
}

function getStaffCustomColumns_() {
  var sheet = getManagedSheet_(STAFF_COLUMN_META_SHEET_NAME, STAFF_COLUMN_META_HEADERS);

  if (sheet.getLastRow() < 2) {
    return [];
  }

  return getSheetObjects_(sheet, STAFF_COLUMN_META_HEADERS)
    .filter(function(record) {
      return record.ColumnId && record.Name;
    })
    .map(function(record) {
      return {
        columnId: record.ColumnId,
        name: record.Name,
        type: String(record.Type || "text").toLowerCase(),
        options: String(record.Options || ""),
        hidden: String(record.Hidden || "No").toLowerCase() === "yes",
        sortOrder: parseInt(record.SortOrder, 10) || 0
      };
    })
    .sort(function(left, right) {
      return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name);
    });
}

function ensureStaffCustomSheetColumns_(staffSheet, columns) {
  if (!columns.length) {
    return;
  }

  var lastColumn = Math.max(staffSheet.getLastColumn(), STAFF_HEADERS.length);
  var headers = staffSheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(header) {
    return String(header || "").trim();
  });

  columns.forEach(function(column) {
    if (headers.indexOf(column.columnId) === -1) {
      staffSheet.getRange(1, headers.length + 1).setValue(column.columnId);
      headers.push(column.columnId);
    }
  });
}

function handleStaffColumnAdd_(payload) {
  ensureScheduleData_();
  var column = payload.column || payload;
  var name = String(column.name || "").trim();
  var type = String(column.type || "text").trim().toLowerCase();

  if (!name) {
    throw new Error("Column name is required.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var now = new Date();
    var metaSheet = getManagedSheet_(STAFF_COLUMN_META_SHEET_NAME, STAFF_COLUMN_META_HEADERS);
    var existing = getStaffCustomColumns_();
    var columnId = buildStableId_("staffcol", name + "|" + type + "|" + now.getTime());
    var sortOrder = existing.length ? Math.max.apply(null, existing.map(function(item) { return item.sortOrder; })) + 1 : 1;
    metaSheet.appendRow([
      columnId,
      name,
      type || "text",
      String(column.options || "").trim(),
      "No",
      sortOrder,
      now,
      now
    ]);
    ensureStaffCustomSheetColumns_(getManagedSheet_(STAFF_SHEET_NAME, STAFF_HEADERS), getStaffCustomColumns_());

    return {
      status: "success",
      action: "staffColumnAdd",
      columnId: columnId
    };
  } finally {
    lock.releaseLock();
  }
}

function handleStaffColumnUpdate_(payload) {
  ensureScheduleData_();
  var column = payload.column || payload;
  var columnId = String(column.columnId || "").trim();

  if (!columnId) {
    throw new Error("ColumnId is required.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var sheet = getManagedSheet_(STAFF_COLUMN_META_SHEET_NAME, STAFF_COLUMN_META_HEADERS);
    var records = getSheetObjects_(sheet, STAFF_COLUMN_META_HEADERS);

    for (var i = 0; i < records.length; i++) {
      if (records[i].ColumnId === columnId) {
        var row = [
          columnId,
          String(column.name || records[i].Name || "").trim(),
          String(column.type || records[i].Type || "text").trim().toLowerCase(),
          String(typeof column.options === "undefined" ? records[i].Options : column.options).trim(),
          column.hidden ? "Yes" : "No",
          parseInt(column.sortOrder, 10) || parseInt(records[i].SortOrder, 10) || i + 1,
          records[i].CreatedAt || new Date(),
          new Date()
        ];
        sheet.getRange(records[i].rowNumber, 1, 1, STAFF_COLUMN_META_HEADERS.length).setValues([row]);
        return {
          status: "success",
          action: "staffColumnUpdate",
          columnId: columnId
        };
      }
    }
  } finally {
    lock.releaseLock();
  }

  throw new Error("Custom column was not found.");
}

function handleStaffColumnDelete_(payload) {
  ensureScheduleData_();
  var columnId = String(payload.columnId || payload.ColumnId || "").trim();

  if (!columnId) {
    throw new Error("ColumnId is required.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var metaSheet = getManagedSheet_(STAFF_COLUMN_META_SHEET_NAME, STAFF_COLUMN_META_HEADERS);
    var records = getSheetObjects_(metaSheet, STAFF_COLUMN_META_HEADERS);

    for (var i = 0; i < records.length; i++) {
      if (records[i].ColumnId === columnId) {
        metaSheet.deleteRow(records[i].rowNumber);
        break;
      }
    }

    var staffSheet = getManagedSheet_(STAFF_SHEET_NAME, STAFF_HEADERS);
    var headers = staffSheet.getRange(1, 1, 1, staffSheet.getLastColumn()).getValues()[0].map(function(header) {
      return String(header || "").trim();
    });
    var columnIndex = headers.indexOf(columnId);

    if (columnIndex >= 0) {
      staffSheet.deleteColumn(columnIndex + 1);
    }

    return {
      status: "success",
      action: "staffColumnDelete",
      columnId: columnId
    };
  } finally {
    lock.releaseLock();
  }
}

function handleStaffCustomValueSave_(payload) {
  ensureScheduleData_();
  var staffId = String(payload.staffId || "").trim();
  var columnId = String(payload.columnId || "").trim();
  var value = payload.value == null ? "" : String(payload.value);

  if (!staffId || !columnId) {
    throw new Error("StaffId and ColumnId are required.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var staffSheet = getManagedSheet_(STAFF_SHEET_NAME, STAFF_HEADERS);
    ensureStaffCustomSheetColumns_(staffSheet, getStaffCustomColumns_());
    var headers = staffSheet.getRange(1, 1, 1, staffSheet.getLastColumn()).getValues()[0].map(function(header) {
      return String(header || "").trim();
    });
    var staffIdIndex = headers.indexOf("StaffId");
    var columnIndex = headers.indexOf(columnId);

    if (staffIdIndex < 0 || columnIndex < 0) {
      throw new Error("Staff or custom column was not found.");
    }

    var lastRow = staffSheet.getLastRow();
    var staffIds = staffSheet.getRange(2, staffIdIndex + 1, Math.max(lastRow - 1, 1), 1).getValues();

    for (var i = 0; i < staffIds.length; i++) {
      if (String(staffIds[i][0] || "").trim() === staffId) {
        staffSheet.getRange(i + 2, columnIndex + 1).setValue(value);
        return {
          status: "success",
          action: "staffCustomValueSave",
          staffId: staffId,
          columnId: columnId
        };
      }
    }
  } finally {
    lock.releaseLock();
  }

  throw new Error("Staff member was not found.");
}

function buildScheduleGetResponse_(params) {
  ensureScheduleData_();
  var startDate = normalizeIsoDateText_(params.start || params.startDate || "");
  var endDate = normalizeIsoDateText_(params.end || params.endDate || "");
  var sheet = getManagedSheet_(SCHEDULE_SHEET_NAME, SCHEDULE_HEADERS);
  var entries = getSheetObjects_(sheet, SCHEDULE_HEADERS)
    .filter(function(record) {
      if (!record.EntryId || !record.StaffId || !record.StartDate) {
        return false;
      }

      if (startDate && record.StartDate < startDate) {
        return false;
      }

      if (endDate && record.StartDate > endDate) {
        return false;
      }

      return true;
    })
    .map(buildScheduleEntryResponse_);

  return {
    status: "success",
    action: "scheduleGet",
    generatedAt: new Date().toISOString(),
    startDate: startDate,
    endDate: endDate,
    count: entries.length,
    entries: entries
  };
}

function buildScheduleEntryResponse_(record) {
  return {
    entryId: record.EntryId,
    staffId: record.StaffId,
    staffName: record.StaffName,
    title: record.Title,
    location: normalizeLocationLabel_(record.Location),
    startDate: record.StartDate,
    startTime: normalizeTimeText_(record.StartTime),
    endDate: record.EndDate || record.StartDate,
    endTime: normalizeTimeText_(record.EndTime),
    notes: record.Notes,
    createdBy: record.CreatedBy,
    createdAt: record.CreatedAt,
    updatedBy: record.UpdatedBy,
    updatedAt: record.UpdatedAt
  };
}

function handleScheduleAdd_(payload) {
  ensureScheduleData_();
  var rawEntries = Array.isArray(payload.entries) ? payload.entries : [payload.entry || payload];
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var staffMap = getStaffMap_();
    var sheet = getManagedSheet_(SCHEDULE_SHEET_NAME, SCHEDULE_HEADERS);
    var existingEntries = getSheetObjects_(sheet, SCHEDULE_HEADERS);
    var now = new Date();
    var rows = [];

    for (var i = 0; i < rawEntries.length; i++) {
      rows.push(buildScheduleRowFromPayload_(rawEntries[i], staffMap, existingEntries, now, ""));
      existingEntries.push(rowToScheduleRecord_(rows[rows.length - 1]));
    }

    if (rows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, SCHEDULE_HEADERS.length).setValues(rows);
    }

    return {
      status: "success",
      action: "scheduleAdd",
      count: rows.length
    };
  } finally {
    lock.releaseLock();
  }
}

function handleScheduleUpdate_(payload) {
  ensureScheduleData_();
  var entry = payload.entry || payload;
  var entryId = String(entry.entryId || entry.EntryId || "").trim();

  if (!entryId) {
    throw new Error("EntryId is required to update a schedule entry.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var staffMap = getStaffMap_();
    var sheet = getManagedSheet_(SCHEDULE_SHEET_NAME, SCHEDULE_HEADERS);
    var existingEntries = getSheetObjects_(sheet, SCHEDULE_HEADERS);
    var target = null;

    for (var i = 0; i < existingEntries.length; i++) {
      if (existingEntries[i].EntryId === entryId) {
        target = existingEntries[i];
        break;
      }
    }

    if (!target) {
      throw new Error("Schedule entry was not found.");
    }

    var merged = {
      entryId: entryId,
      staffId: entry.staffId || entry.StaffId || target.StaffId,
      location: entry.location || entry.Location || target.Location,
      startDate: entry.startDate || entry.StartDate || target.StartDate,
      startTime: entry.startTime || entry.StartTime || target.StartTime,
      endDate: entry.endDate || entry.EndDate || target.EndDate,
      endTime: entry.endTime || entry.EndTime || target.EndTime,
      notes: typeof entry.notes !== "undefined" ? entry.notes : target.Notes
    };
    var row = buildScheduleRowFromPayload_(merged, staffMap, existingEntries, new Date(), entryId, target);
    sheet.getRange(target.rowNumber, 1, 1, SCHEDULE_HEADERS.length).setValues([row]);

    return {
      status: "success",
      action: "scheduleUpdate",
      entryId: entryId
    };
  } finally {
    lock.releaseLock();
  }
}

function handleScheduleDelete_(payload) {
  ensureScheduleData_();
  var entryId = String(payload.entryId || payload.EntryId || "").trim();

  if (!entryId) {
    throw new Error("EntryId is required to delete a schedule entry.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var sheet = getManagedSheet_(SCHEDULE_SHEET_NAME, SCHEDULE_HEADERS);
    var existingEntries = getSheetObjects_(sheet, SCHEDULE_HEADERS);

    for (var i = 0; i < existingEntries.length; i++) {
      if (existingEntries[i].EntryId === entryId) {
        sheet.deleteRow(existingEntries[i].rowNumber);
        return {
          status: "success",
          action: "scheduleDelete",
          entryId: entryId
        };
      }
    }
  } finally {
    lock.releaseLock();
  }

  throw new Error("Schedule entry was not found.");
}

function getStaffMap_() {
  var sheet = getManagedSheet_(STAFF_SHEET_NAME, STAFF_HEADERS);
  var records = getSheetObjects_(sheet, STAFF_HEADERS);
  var map = {};

  for (var i = 0; i < records.length; i++) {
    map[records[i].StaffId] = records[i];
  }

  return map;
}

function handleStaffSave_(payload) {
  ensureScheduleData_();
  var staff = payload.staff || payload;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var sheet = getManagedSheet_(STAFF_SHEET_NAME, STAFF_HEADERS);
    var records = getSheetObjects_(sheet, STAFF_HEADERS);
    var now = new Date();
    var staffId = String(staff.staffId || staff.StaffId || "").trim();
    var existingRecord = null;

    for (var i = 0; i < records.length; i++) {
      if (records[i].StaffId === staffId) {
        existingRecord = records[i];
        break;
      }
    }

    var name = String(staff.name || staff.Name || "").trim();
    var email = String(staff.email || staff.Email || "").trim();

    if (!name) {
      throw new Error("Staff name is required.");
    }

    if (!staffId) {
      staffId = buildStableId_("staff", name + "|" + email + "|" + now.getTime());
    }

    var row = [
      staffId,
      name,
      email,
      String(staff.phone || staff.Phone || "").trim(),
      String(staff.title || staff.Title || "").trim(),
      String(staff.specialty || staff.PrimarySpecialty || "").trim(),
      normalizeIsoDateText_(staff.verifiedDate || staff.VerifiedDate || ""),
      normalizeTimeText_(staff.shiftStart || staff.ShiftStart || "") || "08:00",
      normalizeTimeText_(staff.shiftEnd || staff.ShiftEnd || "") || "17:00",
      String(staff.timeZone || staff.TimeZone || "EST").trim(),
      String(staff.athenaUser || staff.AthenaUser || "").trim(),
      normalizeLocationLabel_(staff.location || staff.HomeLocation || "Unassigned"),
      String(staff.scheduleNote || staff.ScheduleNote || "").trim(),
      String(staff.active || staff.Active || "Yes").trim() || "Yes",
      existingRecord ? existingRecord.CreatedBy : "ClinicSnap Staff",
      existingRecord ? existingRecord.CreatedAt : now,
      "ClinicSnap Staff",
      now
    ];

    if (existingRecord) {
      sheet.getRange(existingRecord.rowNumber, 1, 1, STAFF_HEADERS.length).setValues([row]);
    } else {
      sheet.getRange(sheet.getLastRow() + 1, 1, 1, STAFF_HEADERS.length).setValues([row]);
    }

    return {
      status: "success",
      action: "staffSave",
      staffId: staffId
    };
  } finally {
    lock.releaseLock();
  }
}

function buildScheduleRowFromPayload_(entry, staffMap, existingEntries, now, forcedEntryId, originalRecord) {
  var staffId = String(entry.staffId || entry.StaffId || "").trim();
  var staff = staffMap[staffId];

  if (!staff) {
    throw new Error("A valid StaffId is required for each schedule entry.");
  }

  var startDate = normalizeIsoDateText_(entry.startDate || entry.StartDate);
  var endDate = normalizeIsoDateText_(entry.endDate || entry.EndDate || startDate);
  var startTime = normalizeTimeText_(entry.startTime || entry.StartTime || staff.ShiftStart);
  var endTime = normalizeTimeText_(entry.endTime || entry.EndTime || staff.ShiftEnd);
  var location = normalizeLocationLabel_(entry.location || entry.Location || staff.HomeLocation || "Tampa");
  var notes = String(entry.notes || entry.Notes || "").trim();

  validateScheduleFields_(startDate, startTime, endDate, endTime, location);
  assertNoScheduleOverlap_(existingEntries, forcedEntryId, staffId, startDate, startTime, endDate, endTime);

  var entryId = forcedEntryId || buildStableId_("entry", staffId + "|" + startDate + "|" + startTime + "|" + location + "|" + now.getTime());
  var createdBy = originalRecord ? originalRecord.CreatedBy : "ClinicSnap Schedule";
  var createdAt = originalRecord ? originalRecord.CreatedAt : now;

  return [
    entryId,
    staffId,
    staff.Name,
    staff.Title,
    location,
    startDate,
    startTime,
    endDate,
    endTime,
    notes,
    createdBy,
    createdAt,
    "ClinicSnap Schedule",
    now
  ];
}

function rowToScheduleRecord_(row) {
  var record = {};

  for (var i = 0; i < SCHEDULE_HEADERS.length; i++) {
    record[SCHEDULE_HEADERS[i]] = normalizeSheetCellForResponse_(row[i], SCHEDULE_HEADERS[i]);
  }

  return record;
}

function validateScheduleFields_(startDate, startTime, endDate, endTime, location) {
  if (!startDate || !endDate || !startTime || !endTime) {
    throw new Error("Schedule date and time fields are required.");
  }

  if (!location) {
    throw new Error("Location is required.");
  }

  if (startDate > endDate || (startDate === endDate && startTime >= endTime)) {
    throw new Error("Schedule end time must be after the start time.");
  }
}

function assertNoScheduleOverlap_(entries, ignoredEntryId, staffId, startDate, startTime, endDate, endTime) {
  var startValue = startDate + "T" + startTime;
  var endValue = endDate + "T" + endTime;

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    if (entry.EntryId === ignoredEntryId || entry.StaffId !== staffId) {
      continue;
    }

    var entryStart = entry.StartDate + "T" + normalizeTimeText_(entry.StartTime);
    var entryEnd = (entry.EndDate || entry.StartDate) + "T" + normalizeTimeText_(entry.EndTime);

    if (startValue < entryEnd && endValue > entryStart) {
      throw new Error("This staff member already has an overlapping shift.");
    }
  }
}

function buildDefaultScheduleRows_(staffRecords) {
  var rows = [];
  var now = new Date();

  for (var i = 0; i < staffRecords.length; i++) {
    var staff = staffRecords[i];
    var datesByLocation = parseJuneScheduleNote_(staff.ScheduleNote, staff.HomeLocation);
    var locations = Object.keys(datesByLocation);

    for (var j = 0; j < locations.length; j++) {
      var location = locations[j];
      var dates = datesByLocation[location];

      for (var k = 0; k < dates.length; k++) {
        var date = dates[k];
        var entryId = buildStableId_("entry", staff.StaffId + "|" + date + "|" + location);
        rows.push([
          entryId,
          staff.StaffId,
          staff.Name,
          staff.Title,
          normalizeLocationLabel_(location),
          date,
          normalizeTimeText_(staff.ShiftStart) || "08:00",
          date,
          normalizeTimeText_(staff.ShiftEnd) || "17:00",
          "Imported from Team Directory June 2026 schedule.",
          "Team Directory Import",
          now,
          "Team Directory Import",
          now
        ]);
      }
    }
  }

  return rows;
}

function parseJuneScheduleNote_(note, homeLocation) {
  var text = String(note || "").trim();
  var result = {};

  if (!text || /not listed/i.test(text)) {
    return result;
  }

  if (/monday/i.test(text)) {
    var weekdays = /monday-friday/i.test(text) ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6];

    if (/sunday/i.test(text)) {
      weekdays.push(0);
    }

    result[normalizeLocationLabel_(homeLocation || "Remote")] = getJune2026DatesByWeekdays_(weekdays);
    return result;
  }

  text = text.replace(/(\d)(Tampa|Zephyrhills|Remote)\s*:/g, "$1 $2:");
  var matcher = /(Tampa|Zephyrhills|Remote)(?:\s*\([^)]+\))?\s*:\s*June\s+([0-9,\s]+)/gi;
  var match;

  while ((match = matcher.exec(text)) !== null) {
    var location = normalizeLocationLabel_(match[1]);
    var days = match[2].split(",")
      .map(function(dayText) {
        return parseInt(dayText, 10);
      })
      .filter(function(day) {
        return day >= 1 && day <= 30;
      })
      .map(function(day) {
        return "2026-06-" + String(day).padStart(2, "0");
      });

    if (!result[location]) {
      result[location] = [];
    }

    result[location] = result[location].concat(days);
  }

  return result;
}

function getJune2026DatesByWeekdays_(weekdays) {
  var dates = [];

  for (var day = 1; day <= 30; day++) {
    var date = new Date(2026, 5, day);

    if (weekdays.indexOf(date.getDay()) >= 0) {
      dates.push("2026-06-" + String(day).padStart(2, "0"));
    }
  }

  return dates;
}

function normalizeLocationLabel_(value) {
  var text = String(value || "").trim();

  if (/^zep$/i.test(text)) {
    return "Zephyrhills";
  }

  return text || "Unassigned";
}

function normalizeIsoDateText_(value) {
  var text = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, getSpreadsheetTimeZone_(), "yyyy-MM-dd");
  }

  return "";
}

function normalizeTimeText_(value) {
  var text = String(value || "").trim();
  var match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) {
    return "";
  }

  return String(match[1]).padStart(2, "0") + ":" + match[2];
}

function buildStableId_(prefix, text) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ""), Utilities.Charset.UTF_8);
  var hex = digest.map(function(byte) {
    var value = byte < 0 ? byte + 256 : byte;
    return ("0" + value.toString(16)).slice(-2);
  }).join("").substring(0, 18);

  return prefix + "-" + hex;
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

function buildShiftReportTransactionRecord_(row, rowNumber, timezone, paymentDate) {
  var timestamp = row[0] instanceof Date ? row[0] : new Date(row[0]);
  var timestampLabel = timestamp instanceof Date && !isNaN(timestamp.getTime())
    ? Utilities.formatDate(timestamp, timezone, "M/d/yy, h:mm a")
    : "";

  return {
    id: String(rowNumber),
    timestamp: timestampLabel || "--",
    staffName: String(row[1] || "").trim() || "--",
    department: String(row[2] || "").trim() || "--",
    patientId: normalizePatientId_(row[3]) || "--",
    service: String(row[4] || "").trim() || "--",
    amountCollected: formatCurrency_(row[5]),
    paymentDate: paymentDate || "--",
    paymentMethod: String(row[7] || "").trim() || "--",
    note: String(row[8] || "").trim() || "--"
  };
}

function normalizeShiftReportDepartmentFilter_(value) {
  var textValue = String(value || "").trim();

  if (!textValue || textValue.toLowerCase() === "all" || textValue.toLowerCase() === "both") {
    return "all";
  }

  return textValue;
}

function getShiftReportDepartmentFilterLabel_(departmentFilter) {
  return departmentFilter === "all" ? "Both Departments" : departmentFilter;
}

function parseCurrencyValue_(value) {
  var numeric = String(value == null ? "" : value).replace(/[^0-9.\-]/g, "");
  var parsed = parseFloat(numeric);
  return isNaN(parsed) ? 0 : parsed;
}

function normalizePaymentMethod_(value) {
  return String(value || "").trim().toLowerCase();
}

function formatCurrency_(value) {
  var amount = parseCurrencyValue_(value);
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roundCurrency_(value) {
  return Math.round(value * 100) / 100;
}

function createTotalsBucket_() {
  return {
    cashTotal: 0,
    zelleTotal: 0,
    otherTotal: 0,
    totalCollected: 0,
    entryCount: 0
  };
}

function addAmountToTotalsBucket_(bucket, amount, method) {
  bucket.entryCount++;
  bucket.totalCollected += amount;

  if (method === "cash") {
    bucket.cashTotal += amount;
  } else if (method === "zelle") {
    bucket.zelleTotal += amount;
  } else {
    bucket.otherTotal += amount;
  }
}

function addAmountToGroupedTotals_(groups, label, amount, method) {
  if (!groups[label]) {
    groups[label] = createTotalsBucket_();
  }

  addAmountToTotalsBucket_(groups[label], amount, method);
}

function roundTotalsBucket_(bucket) {
  return {
    cashTotal: roundCurrency_(bucket.cashTotal),
    zelleTotal: roundCurrency_(bucket.zelleTotal),
    otherTotal: roundCurrency_(bucket.otherTotal),
    totalCollected: roundCurrency_(bucket.totalCollected),
    entryCount: bucket.entryCount
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
        cashTotal: bucket.cashTotal,
        zelleTotal: bucket.zelleTotal,
        otherTotal: bucket.otherTotal,
        totalCollected: bucket.totalCollected,
        entryCount: bucket.entryCount
      };
    });
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
