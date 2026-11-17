/**
 * Dịch vụ liên kết Google Sheets thông qua Google Apps Script (GAS) Web App
 * Hỗ trợ lưu trữ thông tin học sinh và kết quả học tập theo thời gian thực
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

export interface GoogleSheetsSyncPayload {
  action: 'register_student' | 'update_progress' | 'test_connection';
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
}

export interface SyncResult {
  ok: boolean;
  mode: 'cloud-synced' | 'local-queued' | 'not-configured';
  message: string;
}

/**
 * Lấy URL Google Apps Script đã cấu hình từ localStorage hoặc env
 */
export function getGoogleSheetsScriptUrl(): string {
  try {
    const saved = localStorage.getItem(GOOGLE_SHEETS_SCRIPT_URL_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore storage errors
  }
  return (import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL || '').trim();
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
      message: 'Đã lưu cục bộ trong máy. Giáo viên có thể gắn URL Google Apps Script trong mục Quản trị GV để tự động đồng bộ thời gian thực.',
    };
  }

  try {
    // Google Apps Script Web App yêu cầu phương thức POST.
    // Dùng mode: 'no-cors' để vượt qua cơ chế chuyển hướng 302 của Google Apps Script trong trình duyệt mà không bị chặn CORS
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedPayload),
    });

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
      message: 'Không thể kết nối Google Apps Script lúc này. Dữ liệu vẫn được lưu an toàn trong hồ sơ học sinh.',
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
 * Mã nguồn mẫu Google Apps Script để giáo viên copy-paste vào Google Sheet
 */
export const SAMPLE_GOOGLE_APPS_SCRIPT_CODE = `/**
 * BẢO TÀNG SỬ THI 4.0 - GOOGLE APPS SCRIPT
 * Tự động ghi danh & cập nhật kết quả học tập của học sinh theo thời gian thực
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("KetQuaHocTap");
    
    // Nếu chưa có sheet, tự động tạo mới với tiêu đề chuẩn
    if (!sheet) {
      sheet = ss.insertSheet("KetQuaHocTap");
      var headers = [
        "Thời Gian Cập Nhật",
        "Họ Và Tên Học Sinh",
        "Lớp",
        "Trường THPT",
        "Hành Động / Hoạt Động",
        "Số Khu Đã Ghé",
        "Điểm 3D Nhà Dài",
        "Điểm Đấu Trường",
        "Tổng Điểm",
        "Hoạt Động STEM",
        "Danh Sách Khu Tham Quan",
        "Ghi Chú"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
           .setBackground("#3d2817")
           .setFontColor("#ffffff")
           .setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    var timeFormatted = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    
    // Tìm kiếm xem học sinh (Tên + Lớp) đã có trong danh sách chưa để cập nhật dòng cũ
    var rows = sheet.getDataRange().getValues();
    var rowIndexToUpdate = -1;
    
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).trim().toLowerCase() === String(data.studentName).trim().toLowerCase() &&
          String(rows[i][2]).trim().toLowerCase() === String(data.className).trim().toLowerCase()) {
        rowIndexToUpdate = i + 1; // 1-based index trong Sheet
        break;
      }
    }
    
    var rowData = [
      timeFormatted,
      data.studentName || "Học sinh",
      data.className || "Lớp 10",
      data.school || "Trường THPT",
      data.latestActivity || "Ghi danh / Cập nhật tiến độ",
      data.visitedZonesCount || 0,
      data.museum3DScore || 0,
      data.arenaBestScore || 0,
      data.totalScore || 0,
      data.stemActions || "",
      data.visitedZonesList || "",
      data.notes || ""
    ];
    
    if (rowIndexToUpdate > 0) {
      // Cập nhật lại dòng của học sinh đó
      sheet.getRange(rowIndexToUpdate, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Thêm dòng mới cho học sinh mới
      sheet.appendRow(rowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", updated: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Bảo tàng Sử thi 4.0 - Google Apps Script đang hoạt động tốt!"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
