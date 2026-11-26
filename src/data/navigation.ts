import { CoreWingExhibition, MuseumRouteId, MuseumZoneInfo } from '../types/museum';

export const MUSEUM_ZONES: MuseumZoneInfo[] = [
  {
    id: 'home',
    orderLabel: '01',
    title: 'Trang chủ – Cổng vào bảo tàng',
    shortTitle: 'Cổng vào',
    category: 'explore',
    subtitle: 'Không gian đón tiếp và bản đồ bảy phân hệ khám phá sử thi.',
    guideTip:
      'Chào bạn! Mình là Sứ Giả Đại Ngàn. Hãy chọn một trong bảy phân hệ trung tâm hoặc bước vào Nhà dài 3D để bắt đầu hành trình đọc hiểu sử thi.',
    stampCode: 'CONG-VAO',
  },
  {
    id: 'epic-gate',
    orderLabel: '02',
    title: 'Cánh cửa sử thi',
    shortTitle: 'Cánh cửa sử thi',
    category: 'explore',
    subtitle: 'Giải mã đặc trưng thể loại sử thi, không gian, thời gian và nghệ thuật kể Khan.',
    guideTip:
      'Để đọc hiểu sử thi lớp 10 vững vàng, hãy nắm ba trụ cột: Người anh hùng cộng đồng, không gian kỳ vĩ và nghệ thuật so sánh phóng đại.',
    stampCode: 'THE-LOAI',
  },
  {
    id: 'vietnam-epics',
    orderLabel: '03',
    title: 'Đại ngàn sử thi Việt Nam',
    shortTitle: 'Sử thi Việt Nam',
    category: 'archive',
    subtitle: 'Kho tàng sử thi Tây Nguyên và các dân tộc Việt Nam: Đăm Săn, Xing Nhã, Đẻ đất đẻ nước.',
    guideTip:
      'Đọc kỹ các trích đoạn và ghi lại dẫn chứng thể hiện sức mạnh cùng khát vọng phồn vinh của buôn làng Tây Nguyên nhé.',
    stampCode: 'DAI-NGAN',
  },
  {
    id: 'world-epics',
    orderLabel: '04',
    title: 'Sử thi thế giới',
    shortTitle: 'Sử thi thế giới',
    category: 'archive',
    subtitle: 'Đối chiếu Odyssey, Iliad, Ramayana trên trục văn hóa nhân loại.',
    guideTip:
      'So sánh Ô-đi-xê với Đăm Săn giúp bạn thấy rõ nét riêng giữa trí tuệ vượt biển Hy Lạp và sức mạnh đại ngàn Tây Nguyên.',
    stampCode: 'THE-GIOI',
  },
  {
    id: 'museum-3d',
    orderLabel: '05',
    title: 'Bảo tàng 3D tương tác',
    shortTitle: 'Bảo tàng 3D',
    category: 'interactive',
    subtitle: 'Tham quan không gian nhà dài Ê-đê dựng bằng Babylon.js với các hiện vật tương tác.',
    guideTip:
      'Dùng phím WASD hoặc kéo chuột để di chuyển quanh nhà dài Ê-đê 3D, chạm vào từng hiện vật phát sáng để đọc thuyết minh văn học.',
    stampCode: 'NHA-DAI-3D',
  },
  {
    id: 'dam-san-journey',
    orderLabel: '06',
    title: 'Theo dấu Đăm Săn – Con đường đến Nữ thần Mặt Trời',
    shortTitle: 'Theo dấu Đăm Săn',
    category: 'interactive',
    subtitle: 'Bản đồ phiêu lưu 3D qua 4 trạm nhiệm vụ 3 lớp và Chiếc La Bàn Sử Thi.',
    guideTip:
      'Hãy vượt qua 4 trạm nhiệm vụ từ đại ngàn đến Cung điện Nữ thần Mặt Trời và thử sức phân tích dẫn chứng với Chiếc La Bàn Sử Thi nhé!',
    stampCode: 'DAM-SAN',
  },
  {
    id: 'hero-arena',
    orderLabel: '07',
    title: 'Đấu trường anh hùng ca',
    shortTitle: 'Đấu trường',
    category: 'learning',
    subtitle: 'Thử thách đọc hiểu nhanh, phân tích dẫn chứng và phản biện văn học.',
    guideTip:
      'Đấu trường thử thách khả năng nhận diện chi tiết tiêu biểu và biện pháp tu từ trong sử thi. Điểm cao nhất sẽ được ghi nhận vào Hộ chiếu.',
    stampCode: 'DAU-TRUONG',
  },
  {
    id: 'stem-studio',
    orderLabel: '08',
    title: 'XƯỞNG STEAM',
    shortTitle: 'Xưởng STEAM',
    category: 'learning',
    subtitle: 'Thiết kế sản phẩm STEAM gắn văn hóa sử thi, tạo mã QR và kết nối bảng trưng bày Padlet.',
    guideTip:
      'Từ kiến trúc nhà dài đến nghệ thuật Tây Nguyên và âm học cồng chiêng, bạn có thể tạo mã QR cho mô hình STEAM và chia sẻ cùng lớp học.',
    stampCode: 'XUONG-STEAM',
  },
  {
    id: 'passport',
    orderLabel: '09',
    title: 'Hộ chiếu nhà thám hiểm',
    shortTitle: 'Hộ chiếu',
    category: 'learning',
    subtitle: 'Theo dõi tiến trình khám phá, huy hiệu đọc hiểu và thẻ mã QR cá nhân.',
    guideTip:
      'Hộ chiếu ghi nhận dấu ấn của bạn ở từng phân khu. Hiện hệ thống lưu tạm ở chế độ Demo trên trình duyệt khi chưa gắn Firebase.',
    stampCode: 'HO-CHIEU',
  },
  {
    id: 'ai-assistant',
    orderLabel: '10',
    title: 'Trợ lý AI',
    shortTitle: 'Trợ lý AI',
    category: 'learning',
    subtitle: 'Đối thoại gợi mở đọc hiểu sử thi cùng Sứ Giả Đại Ngàn qua Gemini API.',
    guideTip:
      'Hãy đặt câu hỏi về cách tìm dẫn chứng, so sánh nhân vật hoặc ý tưởng STEM để nhận gợi ý từng bước.',
    stampCode: 'TRO-LY-AI',
  },
  {
    id: 'teacher-admin',
    orderLabel: '11',
    title: 'Trang quản trị dành cho giáo viên',
    shortTitle: 'Kết quả học tập',
    category: 'admin',
    subtitle: 'Kiểm tra trạng thái dịch vụ (Firebase, Gemini, Padlet) và cấu hình liên kết lớp học.',
    guideTip:
      'Khu vực dành cho giáo viên Ngữ văn theo dõi cấu hình hệ thống và gắn liên kết Padlet trưng bày sản phẩm học sinh.',
    stampCode: 'GIAO-VIEN',
  },
];

export const CORE_SEVEN_WINGS: CoreWingExhibition[] = [
  {
    id: 'epic-gate',
    orderNumber: '01',
    title: 'CÁNH CỬA SỬ THI',
    shortDescription:
      'Giải mã 4 trụ cột thể loại sử thi, nghệ thuật so sánh – phóng đại và bối cảnh diễn xướng bên bếp lửa.',
    imagePath: '/src/assets/images/zone_epic_gate_1794539494154.jpg',
    imageAlt: 'Cánh cổng gỗ chạm khắc dẫn vào thư viện sử thi cổ',
    ctaLabel: 'Mở cánh cửa',
  },
  {
    id: 'vietnam-epics',
    orderNumber: '02',
    title: 'ĐẠI NGÀN SỬ THI VIỆT NAM',
    shortDescription:
      'Đọc trích đoạn Đăm Săn, Xing Nhã, Đẻ đất đẻ nước kèm công cụ ghi chú và tìm dẫn chứng văn bản.',
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
    imageAlt: 'Dàn chiêng đồng và hoa văn dệt truyền thống Tây Nguyên trong phòng trưng bày',
    ctaLabel: 'Vào kho đại ngàn',
  },
  {
    id: 'world-epics',
    orderNumber: '03',
    title: 'SỬ THI THẾ GIỚI',
    shortDescription:
      'Đối chiếu Ô-đi-xê, I-li-át và Ra-ma-ya-na cùng sử thi Tây Nguyên trên bản đồ văn minh nhân loại.',
    imagePath: '/src/assets/images/world_epics_odyssey_1794539120237.jpg',
    imageAlt: 'Phòng trưng bày sử thi thế giới với mô hình thuyền cổ Hy Lạp và phù điêu Ấn Độ',
    ctaLabel: 'Khám phá thế giới',
  },
  {
    id: 'museum-3d',
    orderNumber: '04',
    title: 'BẢO TÀNG 3D TƯƠNG TÁC',
    shortDescription:
      'Di chuyển tự do trong không gian Nhà dài Ê-đê dựng bằng Babylon.js và chạm mở từng hiện vật 3D.',
    imagePath: '/src/assets/images/zone_museum_3d_1794539494709.jpg',
    imageAlt: 'Mặt cắt không gian bảo tàng số Nhà dài Ê-đê với bệ trưng bày tương tác',
    ctaLabel: 'Bước vào 3D',
  },
  {
    id: 'dam-san-journey',
    orderNumber: '05',
    title: 'THEO DẤU ĐĂM SĂN',
    shortDescription:
      'Bản đồ 3D Con đường đến Nữ thần Mặt Trời gồm 4 trạm 3 lớp và Chiếc La Bàn Sử Thi.',
    imagePath: '/src/assets/images/sun_goddess_palace_epic_1794540838277.jpg',
    imageAlt: 'Cung điện Nữ thần Mặt Trời rực sáng trên đỉnh núi đại ngàn Tây Nguyên',
    ctaLabel: 'Theo dấu anh hùng',
  },
  {
    id: 'hero-arena',
    orderNumber: '06',
    title: 'ĐẤU TRƯỜNG ANH HÙNG CA',
    shortDescription:
      'Thử sức với câu hỏi đọc hiểu nhanh, phân tích chi tiết nghệ thuật và ghi điểm kỷ lục cá nhân.',
    imagePath: '/src/assets/images/zone_hero_arena_1794539494779.jpg',
    imageAlt: 'Đấu trường tri thức sử thi với bục cuộn thư và khiên đồng trung tâm',
    ctaLabel: 'Vào đấu trường',
  },
  {
    id: 'stem-studio',
    orderNumber: '07',
    title: 'XƯỞNG STEAM',
    shortDescription:
      'Phát triển mô hình STEAM văn hóa sử thi, tạo tem mã QR gắn lên sản phẩm và kết nối bảng Padlet.',
    imagePath: '/src/assets/images/zone_stem_studio_1794539494969.jpg',
    imageAlt: 'Bàn xưởng sáng tạo mô hình nhà dài STEAM, compa và thiết bị đo âm học',
    ctaLabel: 'Mở xưởng STEAM',
  },
];

export const TOP_NAV_ITEMS: Array<{ id: MuseumRouteId; label: string }> = [
  { id: 'home', label: 'Cổng vào' },
  { id: 'epic-gate', label: 'Kho sử thi' },
  { id: 'museum-3d', label: 'Bảo tàng 3D' },
  { id: 'hero-arena', label: 'Đấu trường & STEAM' },
  { id: 'ai-assistant', label: 'Trợ lý AI' },
];

export function getZoneInfo(routeId: MuseumRouteId): MuseumZoneInfo {
  return MUSEUM_ZONES.find((z) => z.id === routeId) || MUSEUM_ZONES[0];
}
