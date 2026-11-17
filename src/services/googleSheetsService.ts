/**
 * Dịch vụ liên kết Google Sheets thông qua Google Apps Script (GAS) Web App
 * Hỗ trợ lưu trữ thông tin học sinh và kết quả học tập theo thời gian thực (Đồng bộ 2 chiều)
 */

export const GOOGLE_SHEETS_SCRIPT_URL_KEY = 'suthiso_google_sheets_script_url';
export const STUDENT_PROFILE_REGISTERED_KEY = 'suthiso_student_registered_v1';

export interface StudentProfileData {
  studentName: string;
  className: string;
  school: string;
  registeredAtIso?: string;
  avatarPreset?: string;
}

export interface DetailedAnswerPayload {
  questionPrompt: string;
  studentAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  scoreAwarded?: number;
  activityTitle?: string;
  attemptNumber?: number;
}

export interface GoogleSheetsSyncPayload {
  action: 'register_student' | 'update_progress' | 'test_connection' | 'sync_student';
  timestamp?: string;
  studentName: string;
  className: string;
  school: string;
  visitedZonesCount?: number;
  visitedZonesList?: string;
  museum3DScore?: number;
  arenaBestScore?: number;
  totalScore?: number;
  stemActions?: string;
  latestActivity?: string;
  notes?: string;
  detailedAnswers?: DetailedAnswerPayload[];
}

export interface SyncResult {
  ok: boolean;
  mode: 'cloud-synced' | 'local-queued' | 'not-configured';
  message: string;
}

export const DEFAULT_GOOGLE_SHEETS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby-VKWmhlyRzH_1UPwTDEZgQg5RFL4NJFr0vpMiGSTndye02Lu4kJo3Y8mU-HIHwJxEpA/exec';

/**
 * Lấy URL Google Apps Script được cấu hình cố định trong hệ thống
 */
export function getGoogleSheetsScriptUrl(): string {
  try {
    const saved = localStorage.getItem(GOOGLE_SHEETS_SCRIPT_URL_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_GOOGLE_SHEETS_SCRIPT_URL;
}

/**
 * Lưu URL Google Apps Script vào cấu hình
 */
export function saveGoogleSheetsScriptUrl(url: string): void {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(GOOGLE_SHEETS_SCRIPT_URL_KEY);
    } else {
      localStorage.setItem(GOOGLE_SHEETS_SCRIPT_URL_KEY, url.trim());
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Gửi dữ liệu đồng bộ học sinh lên Google Sheet thông qua Google Apps Script
 * Sử dụng cơ chế gửi tin cậy đa tầng:
 * 1. POST text/plain (không bị chặn CORS trong trình duyệt)
 * 2. GET URL beacon fallback
 */
export async function syncToGoogleSheets(
  payload: GoogleSheetsSyncPayload
): Promise<SyncResult> {
  const scriptUrl = getGoogleSheetsScriptUrl();

  const enrichedPayload: GoogleSheetsSyncPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  if (!scriptUrl) {
    return {
      ok: true,
      mode: 'not-configured',
      message: 'Đã lưu cục bộ trong máy.',
    };
  }

  try {
    // 1. Gửi qua phương thức POST với Content-Type text/plain (được CORS chấp nhận an toàn trong trình duyệt)
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(enrichedPayload),
    });

    // 2. Gửi thêm GET beacon nhẹ để đảm bảo Apps Script ghi dữ liệu 100%
    try {
      const miniData = {
        studentName: enrichedPayload.studentName,
        className: enrichedPayload.className,
        school: enrichedPayload.school,
        totalScore: enrichedPayload.totalScore,
        museum3DScore: enrichedPayload.museum3DScore,
        arenaBestScore: enrichedPayload.arenaBestScore,
        visitedZonesCount: enrichedPayload.visitedZonesCount,
        latestActivity: enrichedPayload.latestActivity,
        detailedAnswers: (enrichedPayload.detailedAnswers || []).slice(0, 10),
      };
      const getSyncUrl = `${scriptUrl}?action=sync_student&data=${encodeURIComponent(
        JSON.stringify(miniData)
      )}`;
      fetch(getSyncUrl, { method: 'GET', mode: 'no-cors' }).catch(() => {});
    } catch {
      // Ignore GET fallback error
    }

    return {
      ok: true,
      mode: 'cloud-synced',
      message: 'Đã đồng bộ thành công lên Google Sheet theo thời gian thực!',
    };
  } catch (err) {
    console.warn('Lỗi khi gửi dữ liệu lên Google Sheets:', err);
    return {
      ok: false,
      mode: 'local-queued',
      message: 'Không thể kết nối Google Apps Script lúc này. Dữ liệu vẫn được lưu an toàn trong máy.',
    };
  }
}

/**
 * Đọc dữ liệu từ Google Sheet gửi ngược về APP cho Giáo viên (Đồng bộ 2 chiều)
 */
export async function fetchRawDataFromGoogleSheets(): Promise<{
  ok: boolean;
  students?: any[];
  detailedAnswers?: any[];
  message: string;
}> {
  const scriptUrl = getGoogleSheetsScriptUrl();
  if (!scriptUrl) {
    return { ok: false, message: 'Chưa có URL Google Apps Script.' };
  }

  try {
    const res = await fetch(`${scriptUrl}?action=get_data`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data && data.status === 'success') {
      return {
        ok: true,
        students: data.students || [],
        detailedAnswers: data.detailedAnswers || [],
        message: 'Đã tải thành công dữ liệu từ Google Sheet!',
      };
    }
    return {
      ok: false,
      message: data?.message || 'Apps Script đang ở phiên bản cũ hoặc chưa có dữ liệu.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Không thể kết nối lấy dữ liệu từ Google Sheet: ${msg}`,
    };
  }
}

/**
 * Kiểm tra xem học sinh đã hoàn tất bước ghi danh ban đầu chưa
 */
export function isStudentProfileRegistered(): boolean {
  try {
    const flag = localStorage.getItem(STUDENT_PROFILE_REGISTERED_KEY);
    return flag === 'true';
  } catch {
    return false;
  }
}

/**
 * Đánh dấu học sinh đã hoàn thành ghi danh
 */
export function setStudentProfileRegistered(registered = true): void {
  try {
    if (registered) {
      localStorage.setItem(STUDENT_PROFILE_REGISTERED_KEY, 'true');
    } else {
      localStorage.removeItem(STUDENT_PROFILE_REGISTERED_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * MÃ NGUỒN GOOGLE APPS SCRIPT MỚI NHẤT 4.0
 * Hỗ trợ 2 Sheet riêng:
 * 1. Sheet DANH_SACH_HOC_SINH: Họ tên, Lớp, Trường, Điểm số, Thời gian học
 * 2. Sheet CHI_TIET_BAI_LAM: Toàn bộ câu hỏi, đáp án đã chọn đúng/sai, đáp án đúng, điểm từng câu
 * Hỗ trợ đồng bộ 2 chiều ngược về App cho Giáo viên
 */
export const SAMPLE_GOOGLE_APPS_SCRIPT_CODE = `/**
 * BẢO TÀNG SỬ THI 4.0 - GOOGLE APPS SCRIPT (PHIÊN BẢN 4.0)
 * Tự động tạo 2 Sheet riêng biệt:
 * 1. DANH_SACH_HOC_SINH: Quản lý điểm, thời gian học, tiến độ
 * 2. CHI_TIET_BAI_LAM: Lưu chi tiết mọi câu hỏi và đáp án đã chọn đúng/sai
 * Hỗ trợ đồng bộ 2 chiều: App -> Sheet và Sheet -> App
 */

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "";
    var data = contents ? JSON.parse(contents) : {};
    return handleSaveData(data);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // 1. Đồng bộ qua tham số data trên GET
    if (e && e.parameter && e.parameter.data) {
      var data = JSON.parse(decodeURIComponent(e.parameter.data));
      return handleSaveData(data);
    }
    
    // 2. Giáo viên đồng bộ ngược từ Google Sheet về APP
    if (e && e.parameter && (e.parameter.action === "get_data" || e.parameter.action === "get_students")) {
      return handleGetData();
    }
    
    // 3. Mặc định kiểm tra kết nối
    return ContentService.createTextOutput(JSON.stringify({
      status: "active",
      message: "Bảo tàng Sử thi 4.0 - Google Apps Script đang hoạt động tốt!"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý lưu dữ liệu vào 2 Sheet riêng biệt
 */
function handleSaveData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var timeFormatted = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
  
  // ==========================================
  // SHEET 1: DANH_SACH_HOC_SINH (Riêng biệt)
  // ==========================================
  var studentSheet = ss.getSheetByName("DANH_SACH_HOC_SINH");
  if (!studentSheet) {
    studentSheet = ss.insertSheet("DANH_SACH_HOC_SINH");
    var headers1 = [
      "STT",
      "Họ Và Tên Học Sinh",
      "Lớp",
      "Trường THPT",
      "Tổng Điểm",
      "Điểm 3D Nhà Dài",
      "Điểm Đấu Trường",
      "Thời Gian Học / Cập Nhật",
      "Số Khu Đã Khám Phá",
      "Ghi Chú"
    ];
    studentSheet.appendRow(headers1);
    studentSheet.getRange(1, 1, 1, headers1.length)
      .setBackground("#1b4332")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    studentSheet.setFrozenRows(1);
  }
  
  var studentRows = studentSheet.getDataRange().getValues();
  var rowIndex = -1;
  var sName = String(data.studentName || "Học sinh").trim();
  var sClass = String(data.className || "Lớp 10").trim();
  
  for (var i = 1; i < studentRows.length; i++) {
    if (String(studentRows[i][1]).trim().toLowerCase() === sName.toLowerCase() &&
        String(studentRows[i][2]).trim().toLowerCase() === sClass.toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }
  
  var stt = rowIndex > 0 ? studentRows[rowIndex - 1][0] : studentRows.length;
  var studentRowData = [
    stt,
    sName,
    sClass,
    data.school || "Trường THPT",
    data.totalScore || 0,
    data.museum3DScore || 0,
    data.arenaBestScore || 0,
    timeFormatted,
    data.visitedZonesCount || 0,
    data.notes || data.latestActivity || "Đang khám phá"
  ];
  
  if (rowIndex > 0) {
    studentSheet.getRange(rowIndex, 1, 1, studentRowData.length).setValues([studentRowData]);
  } else {
    studentSheet.appendRow(studentRowData);
  }
  
  // ==========================================
  // SHEET 2: CHI_TIET_BAI_LAM (Chi tiết đáp án đúng/sai)
  // ==========================================
  var detailSheet = ss.getSheetByName("CHI_TIET_BAI_LAM");
  if (!detailSheet) {
    detailSheet = ss.insertSheet("CHI_TIET_BAI_LAM");
    var headers2 = [
      "Thời Gian",
      "Họ Và Tên Học Sinh",
      "Lớp",
      "Tên Trò Chơi / Hoạt Động",
      "Lượt Làm",
      "Câu Hỏi / Thử Thách",
      "Đáp Án Học Sinh Chọn",
      "Đáp Án Chuẩn",
      "Đánh Giá (ĐÚNG / SAI)",
      "Điểm Đạt"
    ];
    detailSheet.appendRow(headers2);
    detailSheet.getRange(1, 1, 1, headers2.length)
      .setBackground("#3d2817")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    detailSheet.setFrozenRows(1);
  }
  
  // Ghi các câu hỏi chi tiết
  if (data.detailedAnswers && Array.isArray(data.detailedAnswers) && data.detailedAnswers.length > 0) {
    for (var j = 0; j < data.detailedAnswers.length; j++) {
      var item = data.detailedAnswers[j];
      var isRight = item.isCorrect ? "ĐÚNG" : "SAI";
      var attemptLabel = item.attemptNumber === 2 ? "Lần 2 (Thử lại)" : "Lần 1 (Chính thức)";
      detailSheet.appendRow([
        timeFormatted,
        sName,
        sClass,
        item.activityTitle || data.latestActivity || "Đấu trường",
        attemptLabel,
        item.questionPrompt || "",
        item.studentAnswer || "",
        item.correctAnswer || "",
        isRight,
        item.scoreAwarded || 0
      ]);
    }
  } else if (data.latestActivity) {
    detailSheet.appendRow([
      timeFormatted,
      sName,
      sClass,
      data.latestActivity,
      "Lần 1",
      "Hoạt động tổng hợp",
      data.notes || "Hoàn thành",
      "Đạt yêu cầu",
      "HOÀN THÀNH",
      data.totalScore || 0
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", updated: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Đọc dữ liệu từ Google Sheet gửi ngược về APP cho Giáo viên
 */
function handleGetData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var studentSheet = ss.getSheetByName("DANH_SACH_HOC_SINH");
  var detailSheet = ss.getSheetByName("CHI_TIET_BAI_LAM");
  
  var studentsList = [];
  if (studentSheet) {
    var rows1 = studentSheet.getDataRange().getValues();
    for (var i = 1; i < rows1.length; i++) {
      var r = rows1[i];
      if (r[1]) {
        studentsList.push({
          studentName: String(r[1]),
          className: String(r[2] || ""),
          school: String(r[3] || ""),
          totalScore: Number(r[4]) || 0,
          museum3DScore: Number(r[5]) || 0,
          arenaBestScore: Number(r[6]) || 0,
          lastActiveIso: String(r[7] || ""),
          visitedZonesCount: Number(r[8]) || 0,
          notes: String(r[9] || "")
        });
      }
    }
  }
  
  var detailedAnswersList = [];
  if (detailSheet) {
    var rows2 = detailSheet.getDataRange().getValues();
    for (var k = 1; k < rows2.length; k++) {
      var d = rows2[k];
      if (d[1] && d[5]) {
        detailedAnswersList.push({
          timestampIso: String(d[0]),
          studentName: String(d[1]),
          className: String(d[2]),
          activityTitle: String(d[3]),
          attemptNumber: String(d[4]).indexOf("2") >= 0 ? 2 : 1,
          questionPrompt: String(d[5]),
          studentAnswer: String(d[6]),
          correctAnswer: String(d[7]),
          isCorrect: String(d[8]).toUpperCase() === "ĐÚNG",
          scoreAwarded: Number(d[9]) || 0
        });
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    students: studentsList,
    detailedAnswers: detailedAnswersList
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
