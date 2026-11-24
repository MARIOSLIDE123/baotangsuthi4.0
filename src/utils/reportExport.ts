import { CORE_SEVEN_WINGS } from '../data/navigation';
import {
  ClassroomRecord,
  CoreWingId,
  ModuleProgressRecord,
  ModuleProgressStatus,
  QuizAttemptRecord,
  UserProfileRecord,
} from '../types/museum';
import { StudentFullLearningProfile } from '../services/studentLearningRecordsService';

const STATUS_VI: Record<ModuleProgressStatus, string> = {
  not_started: 'Chưa khám phá',
  in_progress: 'Đang khám phá',
  completed: 'Đã hoàn thành',
};

function escapeCsvCell(val: string | number): string {
  const s = String(val ?? '');
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

function escapeHtml(val: string | number): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportClassReportCsv(params: {
  classLabel: string;
  students: UserProfileRecord[];
  progressRecords: ModuleProgressRecord[];
  quizAttempts: QuizAttemptRecord[];
}): void {
  const { students, progressRecords, quizAttempts } = params;
  const wingHeaders = CORE_SEVEN_WINGS.map((w) => `${w.title} (Trạng thái)`);

  const lines: string[] = [];
  lines.push(
    [
      'UID',
      'Họ và tên',
      'Trường',
      'Lớp',
      'Mã lớp',
      'Vai trò',
      'Tổng điểm',
      'Số phân hệ hoàn thành',
      'Số lượt làm bài/game',
      ...wingHeaders,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  for (const st of students) {
    const stProgress = progressRecords.filter((p) => p.studentUid === st.uid);
    const completedCount = stProgress.filter((p) => p.status === 'completed').length;
    const attemptsCount = quizAttempts.filter((a) => a.studentUid === st.uid).length;

    const wingCells = CORE_SEVEN_WINGS.map((w) => {
      const rec = stProgress.find((p) => p.moduleId === (w.id as CoreWingId));
      return rec ? `${STATUS_VI[rec.status]} (${rec.scoreEarned}đ)` : 'Chưa khám phá';
    });

    lines.push(
      [
        st.uid,
        st.displayName,
        st.school,
        st.className,
        st.joinCode || st.classId,
        st.role,
        st.totalScore,
        completedCount,
        attemptsCount,
        ...wingCells,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  }

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `bao-cao-su-thi-so-${stamp}.csv`);
}

export function exportClassReportExcel(params: {
  classLabel: string;
  classes: ClassroomRecord[];
  students: UserProfileRecord[];
  progressRecords: ModuleProgressRecord[];
  quizAttempts: QuizAttemptRecord[];
}): void {
  const { classLabel, students, progressRecords, quizAttempts } = params;

  const studentRowsHtml = students
    .map((st) => {
      const stProgress = progressRecords.filter((p) => p.studentUid === st.uid);
      const completedCount = stProgress.filter((p) => p.status === 'completed').length;
      const inProgressCount = stProgress.filter((p) => p.status === 'in_progress').length;
      const attemptsCount = quizAttempts.filter((a) => a.studentUid === st.uid).length;

      const wingCells = CORE_SEVEN_WINGS.map((w) => {
        const rec = stProgress.find((p) => p.moduleId === (w.id as CoreWingId));
        return `<td>${escapeHtml(
          rec ? `${STATUS_VI[rec.status]} (${rec.scoreEarned}đ)` : 'Chưa khám phá'
        )}</td>`;
      }).join('');

      return `<tr>
        <td>${escapeHtml(st.displayName)}</td>
        <td>${escapeHtml(st.school)}</td>
        <td>${escapeHtml(st.className)}</td>
        <td>${escapeHtml(st.joinCode || st.classId)}</td>
        <td>${st.totalScore}</td>
        <td>${completedCount}</td>
        <td>${inProgressCount}</td>
        <td>${attemptsCount}</td>
        ${wingCells}
      </tr>`;
    })
    .join('');

  const attemptsRowsHtml = quizAttempts
    .slice(0, 200)
    .map(
      (att) => `<tr>
        <td>${escapeHtml(att.studentName)}</td>
        <td>${escapeHtml(att.activityType)}</td>
        <td>${escapeHtml(att.activityTitle)}</td>
        <td>${escapeHtml(att.workTitle || '-')}</td>
        <td>${escapeHtml(att.difficultTopic || '-')}</td>
        <td>${att.score}</td>
        <td>${att.maxScore}</td>
        <td>${att.correctCount}</td>
        <td>${att.wrongCount}</td>
        <td>${escapeHtml(new Date(att.createdAtIso).toLocaleString('vi-VN'))}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" lang="vi">
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: Arial, sans-serif; }
  table { border-collapse: collapse; margin-bottom: 24px; }
  th, td { border: 1px solid #999; padding: 6px 8px; font-size: 12px; }
  th { background: #2d4f3c; color: #ffffff; font-weight: bold; }
</style>
</head>
<body>
  <h2>BÁO CÁO HỌC TẬP SỬ THI SỐ 4.0 · ${escapeHtml(classLabel)}</h2>
  <p>Ngày xuất: ${escapeHtml(new Date().toLocaleString('vi-VN'))}</p>
  <h3>1. Bảng tổng hợp tiến độ và điểm học sinh</h3>
  <table>
    <thead>
      <tr>
        <th>Họ và tên</th>
        <th>Trường</th>
        <th>Lớp</th>
        <th>Mã lớp</th>
        <th>Tổng điểm</th>
        <th>Phân hệ hoàn thành</th>
        <th>Phân hệ đang khám phá</th>
        <th>Số lượt làm bài</th>
        ${CORE_SEVEN_WINGS.map((w) => `<th>${escapeHtml(w.title)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>${studentRowsHtml}</tbody>
  </table>

  <h3>2. Chi tiết kết quả trò chơi &amp; đọc hiểu</h3>
  <table>
    <thead>
      <tr>
        <th>Học sinh</th>
        <th>Loại hoạt động</th>
        <th>Tên nhiệm vụ / Trò chơi</th>
        <th>Tác phẩm</th>
        <th>Chủ đề cần lưu ý</th>
        <th>Điểm đạt</th>
        <th>Điểm tối đa</th>
        <th>Số câu đúng</th>
        <th>Số câu sai</th>
        <th>Thời gian</th>
      </tr>
    </thead>
    <tbody>${attemptsRowsHtml}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `bao-cao-su-thi-so-${stamp}.xls`);
}

/**
 * Xuất Báo Cáo Học Tập Sử Thi Số 4.0 trực tiếp từ danh sách học sinh thực tế (Đầy đủ họ tên, điểm số và chi tiết đáp án)
 */
export function exportFullStudentProfilesToExcel(params: {
  classLabel: string;
  profiles: StudentFullLearningProfile[];
}): void {
  const { classLabel, profiles } = params;

  const studentRowsHtml = profiles
    .map((st, idx) => {
      const accuracy =
        st.totalQuestionsAnswered > 0
          ? `${Math.round((st.totalQuestionsCorrect / st.totalQuestionsAnswered) * 100)}%`
          : '100%';

      const timeFormatted = st.lastActiveIso
        ? new Date(st.lastActiveIso).toLocaleString('vi-VN')
        : 'Mới tham gia';

      return `<tr>
        <td style="text-align: center;">${st.sheetStt != null ? st.sheetStt : idx + 1}</td>
        <td><strong>${escapeHtml(st.studentName)}</strong></td>
        <td style="text-align: center;">${escapeHtml(st.className)}</td>
        <td>${escapeHtml(st.school)}</td>
        <td style="text-align: center; font-weight: bold; color: #1b4332;">${st.totalScore}đ</td>
        <td style="text-align: center;">${st.museum3DScore}đ</td>
        <td style="text-align: center;">${st.arenaBestScore}đ</td>
        <td style="text-align: center;">${st.readingScore || 0}đ</td>
        <td style="text-align: center;">${st.visitedZones.length}/7 khu</td>
        <td style="text-align: center;">${st.totalQuestionsAnswered} câu</td>
        <td style="text-align: center;">${st.totalQuestionsCorrect} đúng</td>
        <td style="text-align: center; font-weight: bold;">${accuracy}</td>
        <td>${escapeHtml(timeFormatted)}</td>
        <td>${st.totalScore >= 180 ? 'Xuất sắc' : st.totalScore >= 120 ? 'Tốt' : 'Đạt yêu cầu'}</td>
      </tr>`;
    })
    .join('');

  // Thu thập toàn bộ câu trả lời chi tiết của tất cả học sinh
  let allDetailedAnswersHtml = '';
  let answerIndex = 1;

  for (const st of profiles) {
    if (st.detailedAnswers && st.detailedAnswers.length > 0) {
      for (const ans of st.detailedAnswers) {
        const isRightStr = ans.isCorrect ? 'ĐÚNG' : 'SAI';
        const rightColor = ans.isCorrect ? '#1b4332' : '#991b1b';
        const attemptLabel = ans.attemptNumber === 2 ? 'Lần 2 (Thử lại)' : 'Lần 1 (Chính thức)';
        const ansTime = ans.timestampIso
          ? new Date(ans.timestampIso).toLocaleString('vi-VN')
          : '';

        allDetailedAnswersHtml += `<tr>
          <td style="text-align: center;">${answerIndex++}</td>
          <td>${escapeHtml(ansTime)}</td>
          <td><strong>${escapeHtml(st.studentName)}</strong></td>
          <td style="text-align: center;">${escapeHtml(st.className)}</td>
          <td>${escapeHtml(ans.activityTitle || 'Đấu trường')}</td>
          <td style="text-align: center;">${escapeHtml(attemptLabel)}</td>
          <td>${escapeHtml(ans.questionPrompt)}</td>
          <td>${escapeHtml(ans.studentAnswer)}</td>
          <td>${escapeHtml(ans.correctAnswer || 'Theo chuẩn đáp án tác phẩm')}</td>
          <td style="text-align: center; font-weight: bold; color: ${rightColor};">${isRightStr}</td>
          <td style="text-align: center; font-weight: bold;">${ans.scoreAwarded}đ</td>
          <td>${escapeHtml(ans.teacherOrAiFeedback || 'Hoàn thành tốt')}</td>
        </tr>`;
      }
    }
  }

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" lang="vi">
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; }
  .header-box { margin-bottom: 20px; }
  h1 { color: #1b4332; font-size: 20px; margin-bottom: 4px; }
  h2 { color: #2d4f3c; font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
  p { font-size: 13px; color: #444; margin: 4px 0; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
  th, td { border: 1px solid #999; padding: 7px 10px; font-size: 12px; }
  th { background: #1b4332; color: #ffffff; font-weight: bold; }
  .table-detail th { background: #3d2817; color: #ffffff; }
  tr:nth-child(even) { background: #fbfbf8; }
</style>
</head>
<body>
  <div class="header-box">
    <p><strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO · TRƯỜNG THPT TRẦN NGUYÊN HÃN</strong></p>
    <p><strong>TỔ NGỮ VĂN · NĂM HỌC 2025 - 2026</strong></p>
    <h1>BÁO CÁO KẾT QUẢ HỌC TẬP SỬ THI SỐ 4.0 · BẢO TÀNG SỬ THI XUYÊN KHÔNG</h1>
    <p>Giáo viên phụ trách: <strong>Cô Hồ Thị Thanh Loan</strong></p>
    <p>Phạm vi lớp: <strong>${escapeHtml(classLabel)}</strong></p>
    <p>Thời gian xuất báo cáo: <strong>${escapeHtml(new Date().toLocaleString('vi-VN'))}</strong></p>
    <p>Tổng số học sinh ghi nhận: <strong>${profiles.length} học sinh</strong></p>
  </div>

  <h2>1. BẢNG TỔNG HỢP TIẾN ĐỘ &amp; KẾT QUẢ ĐIỂM SỐ CỦA HỌC SINH</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">STT</th>
        <th>Họ và tên học sinh</th>
        <th>Lớp</th>
        <th>Trường THPT</th>
        <th>Tổng điểm</th>
        <th>Điểm 3D Nhà dài</th>
        <th>Điểm Đấu trường</th>
        <th>Điểm Đọc hiểu</th>
        <th>Khu đã khám phá</th>
        <th>Số câu đã làm</th>
        <th>Số câu đúng</th>
        <th>Tỉ lệ đúng</th>
        <th>Thời gian cập nhật</th>
        <th>Đánh giá</th>
      </tr>
    </thead>
    <tbody>
      ${studentRowsHtml || '<tr><td colspan="14" style="text-align: center;">Chưa có dữ liệu học sinh.</td></tr>'}
    </tbody>
  </table>

  <h2>2. BẢNG CHI TIẾT TỪNG CÂU HỎI &amp; ĐÁP ÁN ĐÃ CHỌN CỦA HỌC SINH (LƯU BÀI LÀM MỚI NHẤT)</h2>
  <table class="table-detail">
    <thead>
      <tr>
        <th style="width: 40px;">STT</th>
        <th>Thời gian</th>
        <th>Họ và tên học sinh</th>
        <th>Lớp</th>
        <th>Trò chơi / Hoạt động</th>
        <th>Lượt làm</th>
        <th>Câu hỏi / Thử thách</th>
        <th>Đáp án học sinh đã chọn</th>
        <th>Đáp án chuẩn văn bản</th>
        <th>Kết quả</th>
        <th>Điểm đạt</th>
        <th>Nhận xét của Giáo viên / Hệ thống</th>
      </tr>
    </thead>
    <tbody>
      ${allDetailedAnswersHtml || '<tr><td colspan="12" style="text-align: center;">Chưa có câu hỏi chi tiết.</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `Bao-cao-ket-qua-hoc-tap-Su-thi-so-4.0-${stamp}.xls`);
}

/**
 * Mở cửa sổ in / xuất báo cáo học tập PDF chuẩn mực của Trường THPT Trần Nguyên Hãn
 */
export function printClassLearningReportPdf(params: {
  classLabel: string;
  profiles: StudentFullLearningProfile[];
}): void {
  const { classLabel, profiles } = params;

  const totalScore = profiles.reduce((a, b) => a + b.totalScore, 0);
  const avgScore = profiles.length > 0 ? Math.round(totalScore / profiles.length) : 0;
  const totalQuestions = profiles.reduce((a, b) => a + b.totalQuestionsAnswered, 0);
  const totalCorrect = profiles.reduce((a, b) => a + b.totalQuestionsCorrect, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 100;

  const rows = profiles
    .map(
      (st, idx) => `<tr>
        <td style="text-align: center;">${st.sheetStt != null ? st.sheetStt : idx + 1}</td>
        <td><strong>${escapeHtml(st.studentName)}</strong></td>
        <td style="text-align: center;">${escapeHtml(st.className)}</td>
        <td>${escapeHtml(st.school)}</td>
        <td style="text-align: center; font-weight: bold; color: #1b4332;">${st.totalScore}đ</td>
        <td style="text-align: center;">${st.museum3DScore}đ</td>
        <td style="text-align: center;">${st.arenaBestScore}đ</td>
        <td style="text-align: center;">${st.totalQuestionsAnswered} câu</td>
        <td style="text-align: center;">${
          st.totalQuestionsAnswered > 0
            ? Math.round((st.totalQuestionsCorrect / st.totalQuestionsAnswered) * 100) + '%'
            : '100%'
        }</td>
        <td>${st.lastActiveIso ? new Date(st.lastActiveIso).toLocaleDateString('vi-VN') : ''}</td>
      </tr>`
    )
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>BÁO CÁO HỌC TẬP SỬ THI SỐ 4.0 - ${escapeHtml(classLabel)}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; margin: 30px; font-size: 13pt; line-height: 1.4; color: #111; }
  .header-tbl { width: 100%; border: none; margin-bottom: 20px; }
  .header-tbl td { border: none; padding: 0; text-align: center; }
  h1 { font-size: 16pt; font-weight: bold; text-align: center; margin: 16px 0 6px 0; text-transform: uppercase; color: #1b4332; }
  .sub-title { text-align: center; font-style: italic; margin-bottom: 20px; font-size: 12pt; }
  table.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11pt; }
  table.data-table th, table.data-table td { border: 1px solid #333; padding: 6px 8px; }
  table.data-table th { background: #f2f2f2; text-align: center; }
  .stats-box { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; border: 1px dashed #666; background: #fafafa; font-size: 11pt; }
  .footer-sig { width: 100%; border: none; margin-top: 40px; }
  .footer-sig td { border: none; padding: 0; text-align: center; font-size: 12pt; }
  @media print {
    button { display: none; }
    body { margin: 15mm; }
  }
</style>
</head>
<body>
  <table class="header-tbl">
    <tr>
      <td style="width: 45%;">
        <strong>SỞ GD&amp;ĐT HẢI PHÒNG</strong><br/>
        <strong>TRƯỜNG THPT TRẦN NGUYÊN HÃN</strong><br/>
        TỔ NGỮ VĂN
      </td>
      <td style="width: 55%;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
        <em>Hải Phòng, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em>
      </td>
    </tr>
  </table>

  <h1>BÁO CÁO KẾT QUẢ HỌC TẬP SỬ THI SỐ 4.0</h1>
  <div class="sub-title">Dự án: Bảo tàng sử thi xuyên không · Văn bản "Đăm Săn đi bắt Nữ thần Mặt Trời"</div>

  <p>
    - Giáo viên phụ trách: <strong>Cô Hồ Thị Thanh Loan</strong><br/>
    - Phân công giảng dạy: <strong>Lớp 10D3 và Lớp 10D7 · Trường THPT Trần Nguyên Hãn</strong><br/>
    - Lớp được báo cáo: <strong>${escapeHtml(classLabel)}</strong><br/>
    - Tổng số học sinh: <strong>${profiles.length} học sinh</strong>
  </p>

  <div class="stats-box">
    <div>Điểm trung bình: <strong>${avgScore}đ</strong></div>
    <div>Tổng câu hỏi đã làm: <strong>${totalQuestions}</strong></div>
    <div>Tỉ lệ đúng trung bình: <strong>${avgAccuracy}%</strong></div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 35px;">STT</th>
        <th>Họ và tên học sinh</th>
        <th>Lớp</th>
        <th>Trường</th>
        <th>Tổng điểm</th>
        <th>Điểm 3D</th>
        <th>Đấu trường</th>
        <th>Số câu làm</th>
        <th>Tỉ lệ đúng</th>
        <th>Ngày cập nhật</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="footer-sig">
    <tr>
      <td style="width: 50%;"></td>
      <td style="width: 50%;">
        <strong>GIÁO VIÊN PHỤ TRÁCH</strong><br/>
        <em>(Ký và ghi rõ họ tên)</em><br/><br/><br/><br/>
        <strong>Cô Hồ Thị Thanh Loan</strong>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="padding: 10px 24px; font-size: 14px; background: #1b4332; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
      In Báo Cáo / Lưu PDF
    </button>
  </div>
</body>
</html>`);
  printWindow.document.close();
}
