import { CORE_SEVEN_WINGS } from '../data/navigation';
import {
  ClassroomRecord,
  CoreWingId,
  ModuleProgressRecord,
  ModuleProgressStatus,
  QuizAttemptRecord,
  UserProfileRecord,
} from '../types/museum';

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
