import { Museum3DHotspot } from '../types/museum';

export const MUSEUM_3D_HOTSPOTS: Museum3DHotspot[] = [
  // KHU VỰC A – BÊN NGOÀI NHÀ DÀI
  {
    id: 'ext-gateway',
    area: 'A',
    areaLabel: 'Khu vực A – Bên ngoài nhà dài',
    title: 'Bảng giới thiệu Bảo tàng mô phỏng',
    shortLabel: 'Bảng giới thiệu',
    position: { x: -3.2, y: 1.15, z: 23.5 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/hero_tay_nguyen_museum_1794539117734.jpg',
    description:
      'Chào mừng bạn bước vào không gian Bảo tàng Sử thi 3D. Tại đây, bạn có thể tự do di chuyển quanh khuôn viên rừng đại ngàn, quan sát tổng thể kiến trúc nhà dài từ xa trước khi leo cầu thang bước vào bên trong.',
    simulationNote:
      'Lưu ý học liệu: Không gian 3D này là mô phỏng nghệ thuật phục vụ giáo dục, giúp hình dung bối cảnh sinh hoạt sử thi Tây Nguyên chứ không khẳng định là bản phục dựng khảo cổ của một ngôi nhà có thật.',
    narrationText:
      'Chào mừng bạn đến với khu vực bên ngoài Nhà dài mô phỏng. Hãy quan sát chiều dài của ngôi nhà sàn gỗ giữa không gian rừng đại ngàn Tây Nguyên, sau đó tiến theo con đường đất đỏ để lên cầu thang vào bên trong.',
    missionQuestion:
      'Khi quan sát không gian bên ngoài trước lúc vào nhà, yếu tố môi trường nào gắn bó mật thiết nhất với bối cảnh sử thi Tây Nguyên?',
    missionOptions: [
      'Đô thị công nghiệp hiện đại với nhà cao tầng.',
      'Rừng đại ngàn, núi đồi và không gian nhà sàn cộng đồng.',
      'Sa mạc khô cằn không có thảm thực vật.',
    ],
    correctIndex: 1,
    missionExplanation:
      'Chính xác! Núi rừng đại ngàn, cây Kơ-nia, bến nước và không gian nhà sàn tạo nên bối cảnh kỳ vĩ đặc trưng của sử thi Tây Nguyên.',
    points: 20,
    badgeReward: 'Người mở cổng đại ngàn',
  },
  {
    id: 'ext-facade',
    area: 'A',
    areaLabel: 'Khu vực A – Bên ngoài nhà dài',
    title: 'Tổng thể dáng nhà dài & hệ cột sàn',
    shortLabel: 'Dáng nhà dài',
    position: { x: 6.8, y: 1.2, z: 16.5 },
    triggerRadius: 4.2,
    imagePath: '/src/assets/images/zone_museum_3d_1794539494709.jpg',
    description:
      'Từ góc nhìn bên hông, ngôi nhà nổi bật với chiều dài kéo sâu về phía sau và mặt sàn được nâng cao trên nhiều hàng cột gỗ. Mái dốc lớn giúp thoát nước mưa rừng nhanh chóng.',
    simulationNote:
      'Kích thước cột và độ dài nhà trong cảnh 3D được đơn giản hóa theo tỉ lệ mô phỏng trực quan cho góc nhìn người thứ nhất.',
    narrationText:
      'Hãy quan sát hệ cột nâng cao mặt sàn và độ dốc của mái nhà. Trong đời sống cộng đồng truyền thống, ngôi nhà dài thường mở rộng theo chiều dọc để nhiều thế hệ cùng chung sống và sinh hoạt.',
    missionQuestion:
      'Thiết kế sàn nhà nâng cao trên hệ thống cột gỗ trong mô hình giúp thích ứng với điều kiện nào?',
    missionOptions: [
      'Tránh ẩm ướt mặt đất rừng, thú dữ và tạo thông thoáng tự nhiên.',
      'Chỉ để trang trí cho ngôi nhà cao hơn ngọn cây.',
      'Để xe cơ giới đi xuyên qua gầm nhà.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Đúng rồi! Nhà sàn nâng cao mặt sàn giúp chống ẩm, bảo vệ cư dân trước côn trùng, thú rừng và đón gió mát tự nhiên.',
    points: 20,
    badgeReward: 'Nhà quan sát kiến trúc',
  },
  {
    id: 'ext-stairs',
    area: 'A',
    areaLabel: 'Khu vực A – Bên ngoài nhà dài',
    title: 'Cầu thang & lối lên hiên trước',
    shortLabel: 'Cầu thang gỗ',
    position: { x: 2.3, y: 1.1, z: 17.0 },
    triggerRadius: 3.8,
    imagePath: '/src/assets/images/hero_tay_nguyen_museum_1794539117734.jpg',
    description:
      'Cầu thang gỗ nối mặt đất với phần hiên trước nâng cao của nhà dài. Trong nhiều sử thi Tây Nguyên, chân cầu thang thường là nơi nhân vật anh hùng cất tiếng gọi hoặc đón khách quý.',
    simulationNote:
      'Cầu thang trong cảnh 3D được dựng dạng bậc phẳng liên kết dốc để nhân vật người chơi đi lên mượt mà.',
    narrationText:
      'Bạn đang đứng ngay chân cầu thang dẫn lên hiên nhà. Trong trích đoạn Đăm Săn, chân cầu thang nhà tù trưởng là điểm mở đầu cho những cuộc đối thoại đầy khí phách.',
    missionQuestion:
      'Trong hành trình đọc hiểu Đăm Săn, chi tiết chân cầu thang thường gắn với không gian nào?',
    missionOptions: [
      'Ranh giới giao tiếp trang trọng giữa khách ngoài buôn với chủ nhà dài.',
      'Nơi cất giữ lương thực dự trữ của cả buôn.',
      'Khu vực tách biệt hoàn toàn với sinh hoạt cộng đồng.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Cầu thang và hiên trước là không gian chuyển tiếp trang trọng đón khách và thể hiện uy thế của ngôi nhà.',
    points: 20,
    badgeReward: 'Bước qua bậc thềm',
  },

  // KHU VỰC B – BÊN TRONG NHÀ DÀI
  {
    id: 'int-structure',
    area: 'B',
    areaLabel: 'Khu vực B – Bên trong nhà dài',
    title: 'Kiến trúc và kết cấu khung gỗ bên trong',
    shortLabel: 'Kết cấu khung nhà',
    position: { x: -3.1, y: 3.0, z: 5.5 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/zone_museum_3d_1794539494709.jpg',
    description:
      'Quan sát hệ thống cột, xà ngang và chiều dài thông suốt của gian sinh hoạt chung. Không gian mở rộng theo trục dọc tạo sức chứa lớn cho buổi họp mặt và diễn xướng sử thi.',
    simulationNote:
      'Thông số cột, xà và mái được lưu tách biệt trong tệp cấu hình longhouse3dConfig.ts để giáo viên hoặc nhà phát triển tùy chỉnh dễ dàng.',
    narrationText:
      'Bước vào bên trong, bạn sẽ thấy không gian được chia nhịp đều theo các hàng cột gỗ vững chãi, nối liền từ cửa chính vào sâu bên trong.',
    missionQuestion:
      'Vì sao không gian bên trong nhà dài lại ưu tiên một gian sinh hoạt dài và thông thoáng thay vì chia nhiều phòng kín nhỏ ở phần đầu nhà?',
    missionOptions: [
      'Phục vụ sinh hoạt cộng đồng, đón khách và tụ họp nghe kể chuyện sử thi.',
      'Vì không đủ gỗ để làm vách ngăn.',
      'Để ánh nắng mặt trời chiếu thẳng xuống toàn bộ sàn nhà.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chuẩn xác! Gian khách rộng và kéo dài là trái tim của sinh hoạt cộng đồng, nơi mọi người cùng quây quần bên bếp lửa.',
    points: 20,
    badgeReward: 'Am hiểu kết cấu',
  },
  {
    id: 'int-materials',
    area: 'B',
    areaLabel: 'Khu vực B – Bên trong nhà dài',
    title: 'Vật liệu xây dựng tự nhiên (Mô phỏng)',
    shortLabel: 'Vật liệu tự nhiên',
    position: { x: 3.2, y: 3.0, z: 3.2 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/zone_stem_studio_1794539494969.jpg',
    description:
      'Mô hình mô phỏng sự kết hợp giữa gỗ chịu lực làm cột khung, vật liệu tre nứa cho mặt sàn đàn hồi và lớp mái lợp thảo mộc dày giúp cách nhiệt giữa nắng gió cao nguyên.',
    simulationNote:
      'Các bề mặt 3D dùng vật liệu lập trình màu gỗ – tre – mái tranh để giữ hiệu suất mượt mà trên mọi thiết bị học sinh.',
    narrationText:
      'Gỗ rừng, tre nứa và mái lợp tự nhiên giúp ngôi nhà thích nghi hài hòa với khí hậu hai mùa mưa nắng của đại ngàn.',
    missionQuestion:
      'Sự kết hợp giữa sàn gỗ/tre nâng cao và mái lợp dày mang lại lợi ích vật lý nào cho không gian sống?',
    missionOptions: [
      'Cách nhiệt ban ngày, giữ ấm vừa phải ban đêm và thông gió tự nhiên.',
      'Tăng trọng lượng tối đa lên nền đất yếu.',
      'Ngăn hoàn toàn không khí lưu thông vào bên trong.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Đây cũng là ý tưởng liên môn Vật lý – Kiến trúc mà các bạn có thể phát triển tiếp tại Xưởng sáng tạo di sản STEM.',
    points: 20,
    badgeReward: 'Kỹ sư vật liệu xanh',
  },
  {
    id: 'int-hearth',
    area: 'B',
    areaLabel: 'Khu vực B – Bên trong nhà dài',
    title: 'Không gian sinh hoạt & Bếp lửa sử thi',
    shortLabel: 'Bếp lửa cộng đồng',
    position: { x: 0, y: 3.0, z: -1.5 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/zone_epic_gate_1794539494154.jpg',
    description:
      'Bếp lửa đặt tại trung tâm gian khách vừa sưởi ấm trong đêm cao nguyên se lạnh, vừa là điểm quy tụ ánh nhìn và cảm xúc khi nghệ nhân cất giọng hát kể Khan suốt đêm dài.',
    simulationNote:
      'Ánh sáng bếp lửa trong cảnh 3D dùng PointLight dao động nhẹ để mô phỏng bầu không khí ấm cúng lúc diễn xướng sử thi.',
    narrationText:
      'Ngọn lửa bập bùng giữa nhà dài chính là sân khấu ánh sáng tự nhiên của sử thi truyền miệng, nơi trí tưởng tượng của cả buôn làng bay bổng theo từng chiến công.',
    missionQuestion:
      'Trong truyền thống hát kể sử thi (Khan), bếp lửa đóng vai trò quan trọng nhất ở phương diện nào?',
    missionOptions: [
      'Tạo không gian ấm áp, gắn kết người kể với cộng đồng lắng nghe suốt đêm.',
      'Chỉ dùng để báo hiệu cho khách ở buôn khác từ xa.',
      'Thay thế hoàn toàn vai trò của lời kể nghệ nhân.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Tuyệt vời! Diễn xướng sử thi sống được là nhờ sợi dây giao cảm trực tiếp giữa người kể chuyện và cộng đồng bên bếp lửa.',
    points: 20,
    badgeReward: 'Người giữ lửa Khan',
  },
  {
    id: 'int-artifacts',
    area: 'B',
    areaLabel: 'Khu vực B – Bên trong nhà dài',
    title: 'Hoa văn trang trí & Hiện vật trưng bày',
    shortLabel: 'Hoa văn & Hiện vật',
    position: { x: 3.0, y: 3.0, z: -6.8 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
    description:
      'Khu vực trưng bày mô phỏng các họa tiết hình học dệt thổ cẩm, dàn chiêng đồng và khiên đồng tượng trưng cho khí phách bảo vệ buôn làng trong sử thi.',
    simulationNote:
      'Chỉ sử dụng họa tiết mô phỏng trang trí văn hóa phổ thông, tôn trọng và không tự ý tái tạo hiện vật nghi lễ thiêng khi chưa có tư liệu xác thực.',
    narrationText:
      'Trên bệ trưng bày là hình ảnh mô phỏng chiếc khiên đồng và những đường nét hoa văn hình học gợi nhắc về nghệ thuật thủ công tinh tế của cư dân Tây Nguyên.',
    missionQuestion:
      'Trong sử thi Đăm Săn, hình ảnh chiếc khiên và tiếng chiêng thường gắn liền với chủ đề nào?',
    missionOptions: [
      'Sức mạnh bảo vệ cộng đồng và niềm vui đoàn kết chiến thắng.',
      'Sự cô đơn tách biệt của nhân vật chính.',
      'Hoạt động giao thương đường biển cổ đại.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Khiên anh hùng bảo vệ bình yên cho buôn làng, còn tiếng chiêng ngân vang đánh dấu ngày hội đoàn kết.',
    points: 20,
    badgeReward: 'Người giải mã hiện vật',
  },
  {
    id: 'int-community',
    area: 'B',
    areaLabel: 'Khu vực B – Bên trong nhà dài',
    title: 'Văn hóa cộng đồng & Ghế dài Kpan',
    shortLabel: 'Văn hóa cộng đồng',
    position: { x: -3.1, y: 3.0, z: -5.5 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/dam_san_epic_journey_1794539119260.jpg',
    description:
      'Chiếc ghế gỗ dài dọc vách (mô phỏng ghế Kpan) gợi nhớ không khí quây quần của nhiều thế hệ trong gian khách cộng đồng — nơi ký ức lịch sử và lý tưởng anh hùng được truyền lại qua lời kể.',
    simulationNote:
      'CẦN BỔ SUNG TƯ LIỆU chi tiết kích thước và quy chuẩn truyền thống từng vùng nếu giáo viên muốn mở rộng chuyên đề dân tộc học.',
    narrationText:
      'Từ không gian sinh hoạt chung này, bạn có thể cảm nhận rõ tinh thần cốt lõi của sử thi: cá nhân anh hùng luôn hòa chung nhịp đập với buôn làng.',
    missionQuestion:
      'Thông điệp nhân văn sâu sắc nhất rút ra từ không gian cộng đồng trong nhà dài và sử thi Tây Nguyên là gì?',
    missionOptions: [
      'Sức mạnh bền vững bắt nguồn từ sự gắn kết, chia sẻ và bảo vệ cộng đồng.',
      'Mỗi cá nhân chỉ cần quan tâm đến lợi ích riêng của mình.',
      'Thiên nhiên và con người luôn đối đầu không thể dung hòa.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Xuất sắc! Bạn đã chạm tới giá trị cốt lõi của sử thi: tôn vinh sức mạnh gắn liền với trách nhiệm và tình yêu cộng đồng.',
    points: 20,
    badgeReward: 'Đại sứ cộng đồng',
  },
];
