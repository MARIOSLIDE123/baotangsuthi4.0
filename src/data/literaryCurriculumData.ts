import {
  EpicConceptCard,
  EpicDossier,
  HeroComparisonProfile,
  MindMapNode,
} from '../types/museum';

/**
 * TỆP DỮ LIỆU HỌC LIỆU CÓ CẤU TRÚC RIÊNG (Ngữ văn lớp 10).
 * Nguyên tắc học liệu:
 * - Tách hoàn toàn khỏi giao diện.
 * - Không tự sáng tác trích dẫn văn học rồi gán cho tác phẩm.
 * - Các mục cần trích đoạn nguyên văn theo bộ sách giáo khoa hoặc dị bản cụ thể
 *   được ghi rõ "CẦN BỔ SUNG TƯ LIỆU" để giáo viên chủ động cập nhật.
 */

export const EPIC_CONCEPT_CARDS: EpicConceptCard[] = [
  {
    id: 'concept-definition',
    index: '01',
    title: 'Khái niệm sử thi',
    imagePath: '/src/assets/images/zone_epic_gate_1794539494154.jpg',
    imageAlt: 'Cổng sách cổ mở ra kho tàng sử thi nhân loại',
    explanation:
      'Sử thi (còn gọi là anh hùng ca) là thể loại tự sự dân gian hoặc tự sự cổ đại có quy mô lớn, kể về những sự kiện trọng đại trong đời sống cộng đồng, bộ tộc hay dân tộc thông qua hình tượng người anh hùng kỳ vĩ.',
    example:
      'Ví dụ tiêu biểu trong chương trình Ngữ văn 10: Sử thi Đăm Săn (Việt Nam) và Sử thi Ô-đi-xê (Hy Lạp).',
    selfCheckQuestion: 'Đặc điểm cốt lõi làm nên quy mô và tầm vóc của thể loại sử thi là gì?',
    selfCheckOptions: [
      'Kể chuyện sinh hoạt riêng tư thường ngày mang tính giải trí ngắn gọn.',
      'Kể về biến cố trọng đại gắn với vận mệnh cộng đồng qua hình tượng anh hùng.',
      'Ghi chép nhật ký cá nhân theo trình tự thời gian hiện đại.',
    ],
    correctIndex: 1,
    selfCheckFeedback:
      'Chính xác! Sử thi luôn đặt câu chuyện trong tầm vóc cộng đồng và những biến cố có ý nghĩa lịch sử – văn hóa lớn.',
  },
  {
    id: 'concept-origin',
    index: '02',
    title: 'Nguồn gốc và môi trường diễn xướng',
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
    imageAlt: 'Không gian cồng chiêng và sinh hoạt diễn xướng dân gian',
    explanation:
      'Sử thi ra đời từ thời kỳ công xã thị tộc – bộ lạc chuyển sang hình thành cộng đồng rộng lớn hơn. Ở Tây Nguyên, sử thi sống trong môi trường diễn xướng truyền miệng (như hát kể Khan của người Ê-đê, Hơ-mon của người Ba Na) bên bếp lửa nhà dài vào dịp lễ hội hoặc nông nhàn.',
    example:
      'Nghệ nhân hát kể sử thi kết hợp lời kể có vần điệu với ngữ điệu trầm bổng trước đông đảo người nghe trong buôn làng. (CẦN BỔ SUNG TƯ LIỆU audio nghệ nhân cụ thể theo địa phương).',
    selfCheckQuestion: 'Hình thức lưu truyền và thưởng thức nguyên thủy của sử thi Tây Nguyên là gì?',
    selfCheckOptions: [
      'In thành tiểu thuyết chương hồi phát hành rộng rãi.',
      'Hát kể truyền miệng trước cộng đồng trong không gian sinh hoạt chung.',
      'Trình diễn kịch nói trên sân khấu hiện đại có micro.',
    ],
    correctIndex: 1,
    selfCheckFeedback:
      'Đúng rồi! Môi trường diễn xướng cộng đồng quyết định nhịp điệu, tính trùng điệp và sức sống lâu bền của sử thi.',
  },
  {
    id: 'concept-mythic-epic',
    index: '03',
    title: 'Sử thi thần thoại',
    imagePath: '/src/assets/images/epic_mythic_cosmos_1794540243920.jpg',
    imageAlt: 'Bức tranh vũ trụ quan thần thoại với núi thiêng và cây cổ thụ',
    explanation:
      'Sử thi thần thoại tập trung kể về nguồn gốc hình thành trời đất, muôn loài, con người và các phong tục, văn hóa buổi sơ khai của cộng đồng cổ đại.',
    example:
      'Tiêu biểu ở Việt Nam là bộ sử thi Đẻ đất đẻ nước của dân tộc Mường (CẦN BỔ SUNG TƯ LIỆU trích đoạn theo bản sưu tầm được chọn giảng dạy).',
    selfCheckQuestion: 'Nội dung trung tâm của sử thi thần thoại hướng tới việc giải thích điều gì?',
    selfCheckOptions: [
      'Chiến tranh chinh phục giữa các thành bang cổ đại.',
      'Nguồn gốc vũ trụ, sự sống và cội rễ cộng đồng bản mường.',
      'Mưu kế đấu trí trên hành trình vượt biển trở về quê hương.',
    ],
    correctIndex: 1,
    selfCheckFeedback:
      'Chuẩn xác! Sử thi thần thoại phản ánh thế giới quan sơ khai lý giải sự ra đời của vạn vật và con người.',
  },
  {
    id: 'concept-heroic-epic',
    index: '04',
    title: 'Sử thi anh hùng',
    imagePath: '/src/assets/images/dam_san_epic_journey_1794539119260.jpg',
    imageAlt: 'Người anh hùng sử thi giữa núi rừng đại ngàn',
    explanation:
      'Sử thi anh hùng ra đời ở giai đoạn sau, ca ngợi chiến công hiển hách của người anh hùng bảo vệ danh dự, mở rộng uy tín và đem lại sự thịnh vượng, hòa bình cho bộ tộc hoặc quốc gia cổ đại.',
    example:
      'Tiêu biểu: Đăm Săn, Xinh Nhã (Tây Nguyên), Iliad và Odyssey (Hy Lạp).',
    selfCheckQuestion: 'Điểm khác biệt nổi bật của sử thi anh hùng so với sử thi thần thoại là gì?',
    selfCheckOptions: [
      'Đặt con người anh hùng làm trung tâm hành động trong các xung đột cộng đồng.',
      'Chỉ viết về động vật nhân hóa không có nhân vật con người.',
      'Không còn yếu tố tự hào hay danh dự cộng đồng.',
    ],
    correctIndex: 0,
    selfCheckFeedback:
      'Chính xác! Sử thi anh hùng đề cao tầm vóc hành động và phẩm chất cao đẹp của con người anh hùng đại diện cho cộng đồng.',
  },
  {
    id: 'concept-hero-traits',
    index: '05',
    title: 'Đặc trưng nhân vật',
    imagePath: '/src/assets/images/zone_hero_arena_1794539494779.jpg',
    imageAlt: 'Khiên đồng và cuộn thư biểu trưng cho khí phách anh hùng',
    explanation:
      'Nhân vật anh hùng sử thi mang vẻ đẹp toàn bích về sức mạnh thể chất, trí tuệ, lòng quả cảm và tinh thần trọng danh dự. Mọi hành động của nhân vật đều gắn chặt với lợi ích và khát vọng chung của cộng đồng.',
    example:
      'Đăm Săn chiến đấu vì danh dự buôn làng; Ô-đi-xê bền bỉ vượt biển để trở về giữ yên gia đình và xứ I-ta-ca.',
    selfCheckQuestion: 'Động lực cao nhất thúc đẩy người anh hùng sử thi hành động là gì?',
    selfCheckOptions: [
      'Tìm kiếm sự giàu sang riêng cho cá nhân tách rời buôn làng.',
      'Danh dự, lý tưởng và sự bình yên, phồn vinh của cộng đồng.',
      'Trốn chạy khỏi trách nhiệm với quê hương.',
    ],
    correctIndex: 1,
    selfCheckFeedback:
      'Tuyệt vời! Lợi ích cá nhân của người anh hùng sử thi luôn thống nhất với danh dự và vận mệnh cộng đồng.',
  },
  {
    id: 'concept-space-time',
    index: '06',
    title: 'Không gian và thời gian sử thi',
    imagePath: '/src/assets/images/intro_tay_nguyen_dawn_1794539492873.jpg',
    imageAlt: 'Không gian núi rừng bao la dưới ánh bình minh',
    explanation:
      'Không gian sử thi mang tầm vóc rộng lớn, kỳ vĩ (núi rừng bạt ngàn, biển cả mênh mông, chiến trường thành quách). Thời gian sử thi thuộc về quá khứ xa xôi mang tính thiêng liêng, tách khỏi dòng chảy đời thường hiện tại.',
    example:
      'Không gian từ buôn làng Đăm Săn băng qua núi rừng tới chân trời, hay hành trình 10 năm trên biển Địa Trung Hải của Ô-đi-xê.',
    selfCheckQuestion: 'Nhận định nào đúng về thời gian trong thể loại sử thi?',
    selfCheckOptions: [
      'Thời gian quá khứ anh hùng xa xưa được cộng đồng tôn kính như chuẩn mực.',
      'Thời gian tương lai giả tưởng mang màu sắc khoa học viễn tưởng.',
      'Thời gian sinh hoạt vụn vặt từng giờ trong ngày hiện đại.',
    ],
    correctIndex: 0,
    selfCheckFeedback:
      'Chính xác! Quá khứ sử thi là khoảng thời gian mẫu mực, thiêng liêng trong ký ức tập thể.',
  },
  {
    id: 'concept-fantastic',
    index: '07',
    title: 'Yếu tố kì ảo',
    imagePath: '/src/assets/images/epic_mythic_cosmos_1794540243920.jpg',
    imageAlt: 'Minh họa thần linh và thế giới kì ảo cổ đại',
    explanation:
      'Sử thi thường có sự tham gia của thần linh, điềm báo, sức mạnh siêu nhiên hoặc sự tương giao giữa trời – đất – con người nhằm tôn vinh tầm vóc phi thường của người anh hùng.',
    example:
      'Sự xuất hiện của các vị thần trong Iliad/Odyssey hoặc vai trò của Trời (Ông Trời / Yang) trong sử thi Tây Nguyên (CẦN BỔ SUNG TƯ LIỆU trích dẫn cụ thể theo văn bản giảng dạy).',
    selfCheckQuestion: 'Yếu tố kì ảo trong sử thi có vai trò nghệ thuật chính nào?',
    selfCheckOptions: [
      'Gây sợ hãi thuần túy như truyện kinh dị hiện đại.',
      'Tôn vinh tầm vóc phi thường của người anh hùng và phản ánh niềm tin cổ đại.',
      'Làm giảm vai trò và ý chí của nhân vật con người.',
    ],
    correctIndex: 1,
    selfCheckFeedback:
      'Đúng rồi! Thần linh và chi tiết kì ảo nâng tầm sự kiện, nhưng ý chí và hành động của người anh hùng vẫn giữ vị trí trung tâm.',
  },
  {
    id: 'concept-narration',
    index: '08',
    title: 'Nghệ thuật kể chuyện',
    imagePath: '/src/assets/images/zone_museum_3d_1794539494709.jpg',
    imageAlt: 'Không gian trưng bày kể chuyện sử thi',
    explanation:
      'Lời kể sử thi trang trọng, giàu nhịp điệu và nhạc tính; sử dụng phổ biến biện pháp so sánh, phóng đại (khoa trương), điệp ngữ, liệt kê và các định ngữ/tính ngữ cố định lặp lại.',
    example:
      'Trong sử thi Hô-me-rơ thường có những tính ngữ cố định gắn với nhân vật hoặc thiên nhiên; sử thi Tây Nguyên nổi bật với phép so sánh thiên nhiên dữ dội (CẦN BỔ SUNG TƯ LIỆU câu trích nguyên văn theo SGK của trường).',
    selfCheckQuestion: 'Vì sao sử thi thường lặp lại nhiều cấu trúc câu và tính ngữ cố định?',
    selfCheckOptions: [
      'Giúp nghệ nhân dễ ghi nhớ khi hát kể dài và tạo âm hưởng hào hùng, trang trọng.',
      'Do người chép văn bản hiện đại vô tình sao chép nhầm.',
      'Để rút ngắn độ dài tác phẩm xuống mức tối thiểu.',
    ],
    correctIndex: 0,
    selfCheckFeedback:
      'Chuẩn xác! Tính trùng điệp và định ngữ cố định là bí quyết nghệ thuật của văn học truyền miệng quy mô lớn.',
  },
  {
    id: 'concept-values',
    index: '09',
    title: 'Giá trị văn hóa và nhân văn',
    imagePath: '/src/assets/images/zone_stem_studio_1794539494969.jpg',
    imageAlt: 'Xưởng sáng tạo bảo tồn di sản văn hóa',
    explanation:
      'Sử thi lưu giữ bộ bách khoa thư về phong tục, tập quán, kiến trúc, tín ngưỡng và khát vọng sống hòa bình, phồn vinh, trọng nghĩa tình của các dân tộc.',
    example:
      'Cảnh ăn mừng chiến thắng trong Đăm Săn hay cuộc đoàn tụ đầy thấu hiểu trong Ô-đi-xê đều ca ngợi hạnh phúc cộng đồng và giá trị con người.',
    selfCheckQuestion: 'Giá trị nhân văn lâu bền khiến sử thi vẫn có ý nghĩa với học sinh ngày nay là gì?',
    selfCheckOptions: [
      'Đề cao lòng dũng cảm, trách nhiệm với cộng đồng và sự tôn trọng bản sắc văn hóa.',
      'Khuyến khích giải quyết mọi mâu thuẫn bằng bạo lực.',
      'Chỉ có giá trị đối với các nhà nghiên cứu ngôn ngữ cổ.',
    ],
    correctIndex: 0,
    selfCheckFeedback:
      'Chính xác! Đọc sử thi giúp chúng ta trân trọng cội nguồn văn hóa và bồi đắp tinh thần trách nhiệm với cộng đồng.',
  },
];

export const EPIC_MIND_MAP: MindMapNode = {
  id: 'root-epic',
  label: 'THỂ LOẠI SỬ THI',
  note: 'Thể loại tự sự quy mô lớn, kể về biến cố trọng đại của cộng đồng qua hình tượng người anh hùng.',
  children: [
    {
      id: 'branch-origin',
      label: 'Nguồn gốc & Phân loại',
      note: 'Hình thành từ xã hội cổ đại, lưu truyền qua diễn xướng truyền miệng trước cộng đồng.',
      children: [
        {
          id: 'leaf-mythic',
          label: 'Sử thi thần thoại',
          note: 'Lý giải nguồn gốc trời đất, muôn loài, bản mường (VD: Đẻ đất đẻ nước).',
        },
        {
          id: 'leaf-heroic',
          label: 'Sử thi anh hùng',
          note: 'Ca ngợi chiến công, danh dự và khát vọng cộng đồng (VD: Đăm Săn, Iliad, Odyssey).',
        },
      ],
    },
    {
      id: 'branch-world',
      label: 'Không gian & Thời gian',
      note: 'Khung cảnh rộng lớn mang tầm vóc vũ trụ – cộng đồng.',
      children: [
        {
          id: 'leaf-space',
          label: 'Không gian kỳ vĩ',
          note: 'Núi rừng đại ngàn, biển cả mênh mông, thành lũy cổ xưa.',
        },
        {
          id: 'leaf-time',
          label: 'Thời gian quá khứ thiêng liêng',
          note: 'Thuộc về thuở xa xưa mẫu mực, tách khỏi sinh hoạt vụn vặt thường ngày.',
        },
      ],
    },
    {
      id: 'branch-hero',
      label: 'Nhân vật anh hùng trung tâm',
      note: 'Hội tụ sức mạnh, trí tuệ, danh dự và lý tưởng tập thể.',
      children: [
        {
          id: 'leaf-community',
          label: 'Đại diện cho cộng đồng',
          note: 'Chiến đấu bảo vệ buôn làng, gia đình, thành bang.',
        },
        {
          id: 'leaf-magic',
          label: 'Yếu tố kì ảo hỗ trợ',
          note: 'Thần linh chứng giám, điềm báo tôn vinh tầm vóc phi thường.',
        },
      ],
    },
    {
      id: 'branch-art',
      label: 'Nghệ thuật & Giá trị văn hóa',
      note: 'Âm hưởng hào hùng gắn liền với sinh hoạt diễn xướng.',
      children: [
        {
          id: 'leaf-devices',
          label: 'So sánh – phóng đại – trùng điệp',
          note: 'Tạo nhịp điệu trang trọng, dễ nhớ và giàu sức gợi hình.',
        },
        {
          id: 'leaf-values',
          label: 'Giá trị bách khoa thư văn hóa',
          note: 'Lưu giữ phong tục, kiến trúc nhà dài, nhạc khí và tinh thần nhân văn.',
        },
      ],
    },
  ],
};

export const VIETNAM_EPIC_DOSSIERS: EpicDossier[] = [
  {
    id: 'vn-dam-san',
    region: 'vietnam',
    title: 'Đăm Săn',
    culturalCommunity: 'Dân tộc Ê-đê',
    distributionArea: 'Tây Nguyên (Đắk Lắk và vùng lân cận)',
    imagePath: '/src/assets/images/dam_san_epic_journey_1794539119260.jpg',
    imageAlt: 'Minh họa người anh hùng Đăm Săn giữa núi rừng Tây Nguyên',
    introduction:
      'Một trong những sử thi anh hùng nổi tiếng bậc nhất của văn học dân gian Việt Nam, được sưu tầm và phổ biến rộng rãi trong chương trình Ngữ văn lớp 10.',
    plotSummary:
      'Kể về cuộc đời tù trưởng Đăm Săn với những chiến công đánh thắng các tù trưởng thù địch như Mtao Grư, Mtao Mxây để bảo vệ vợ và buôn làng, khai phá đất đai, cùng hành trình táo bạo đi hỏi Nữ thần Mặt Trời thể hiện khát vọng chinh phục giới hạn.',
    plotSteps: [
      { step: 'Khởi đầu', detail: 'Đăm Săn kết duyên với Hơ Nhị, Hơ Bhị, trở thành tù trưởng giàu mạnh.' },
      { step: 'Thử thách', detail: 'Chống lại các thế lực cướp phá (Mtao Grư, Mtao Mxây) để giành lại vợ và danh dự.' },
      { step: 'Đỉnh cao', detail: 'Đánh thắng Mtao Mxây, thu phục dân làng, mở hội ăn mừng vang tiếng chiêng.' },
      { step: 'Khát vọng lớn', detail: 'Lên đường hỏi Nữ thần Mặt Trời và hóa thân để lại bài học về giới hạn con người.' },
    ],
    centralCharacter: 'Tù trưởng Đăm Săn — biểu tượng sức mạnh, lòng thượng võ và khát vọng phồn vinh của buôn làng.',
    characterProfile: {
      name: 'Đăm Săn',
      role: 'Tù trưởng anh hùng buôn làng Ê-đê',
      keyConflict: 'Đối đầu thế lực thù địch bắt cóc vợ và khát vọng vượt giới hạn tự nhiên',
      representativeTrait: 'Quang minh chính đại, dũng mãnh, gắn bó máu thịt với buôn làng',
    },
    artisticFeatures: [
      'Nghệ thuật so sánh, phóng đại lấy hình ảnh từ thiên nhiên Tây Nguyên.',
      'Nhịp điệu kể Khan giàu âm hưởng, sử dụng đối thoại kịch tính và điệp cấu trúc.',
      'Tạo sự tương phản sắc nét giữa người anh hùng chính nghĩa và kẻ thù.',
    ],
    culturalValue:
      'Phản ánh sinh động không gian nhà dài, lễ hội cồng chiêng, phong tục hôn nhân – cộng đồng và khát vọng sống tự do, đoàn kết của người Ê-đê.',
    readingQuestions: [
      'Phân tích ý nghĩa hành động Đăm Săn không đâm lén khi Mtao Mxây quay lưng.',
      'Chỉ ra tác dụng của các hình ảnh so sánh phóng đại trong cảnh múa khiên (CẦN BỔ SUNG TƯ LIỆU trích đoạn SGK cụ thể để học sinh gạch chân dẫn chứng).',
    ],
    appliedMission:
      'Thiết kế một đoạn thuyết minh 3 phút hoặc sơ đồ nhân vật Đăm Săn gắn với không gian Nhà dài 3D.',
    referenceNote:
      'Các trích đoạn nguyên văn theo từng bộ sách giáo khoa (KNTT / Cánh Diều / CTST): CẦN BỔ SUNG TƯ LIỆU do giáo viên chọn lọc.',
  },
  {
    id: 'vn-dam-di',
    region: 'vietnam',
    title: 'Đăm Di',
    culturalCommunity: 'Dân tộc Ê-đê',
    distributionArea: 'Tây Nguyên',
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
    imageAlt: 'Hiện vật cồng chiêng và hoa văn Tây Nguyên gắn với sử thi Đăm Di',
    introduction:
      'Tác phẩm tiêu biểu trong hệ thống sử thi Tây Nguyên, ca ngợi tinh thần kiên trung bảo vệ buôn làng và nghĩa tình gia đình – dòng tộc.',
    plotSummary:
      'Kể về chàng Đăm Di cùng anh em trong gia đình vượt qua các thế lực gian ác quấy nhiễu, bảo vệ quê hương và khôi phục cuộc sống yên bình cho cộng đồng. (CẦN BỔ SUNG TƯ LIỆU tóm tắt chi tiết dị bản được sử dụng tại trường).',
    plotSteps: [
      { step: 'Biến cố', detail: 'Gia đình và buôn làng đối mặt với âm mưu xâm lấn của kẻ thù.' },
      { step: 'Thử thách', detail: 'Đăm Di dấn thân vào hành trình gian khổ, vượt qua nhiều chướng ngại.' },
      { step: 'Chiến thắng', detail: 'Đoàn kết lực lượng bảo vệ công lý và khôi phục bình yên buôn làng.' },
    ],
    centralCharacter: 'Đăm Di — người anh hùng trọng nghĩa tình, kiên cường trước nghịch cảnh.',
    characterProfile: {
      name: 'Đăm Di',
      role: 'Anh hùng bảo vệ gia tộc và buôn làng',
      keyConflict: 'Chống lại thế lực bạo tàn chia rẽ gia đình và cộng đồng',
      representativeTrait: 'Bền bỉ, trọng tình nghĩa, đặt sự bình yên buôn làng lên hàng đầu',
    },
    artisticFeatures: [
      'Kết cấu đối thoại – hành động đặc trưng của Khan Ê-đê.',
      'Phóng đại sức mạnh tự nhiên song hành với tình cảm gia đình sâu sắc.',
    ],
    culturalValue:
      'Góp phần làm rõ hệ giá trị đạo đức cộng đồng, tinh thần đoàn kết anh em và ý thức giữ gìn buôn rẫy của cư dân Tây Nguyên.',
    readingQuestions: [
      'So sánh nét tương đồng giữa lý tưởng chiến đấu của Đăm Di và Đăm Săn.',
      'CẦN BỔ SUNG TƯ LIỆU trích đoạn đối thoại tiêu biểu để phân tích giọng điệu.',
    ],
    appliedMission:
      'Lập bảng đối chiếu nhân vật Đăm Di với một anh hùng sử thi khác trong công cụ Đối thoại giữa những người anh hùng.',
    referenceNote: 'Văn bản trích đoạn và dị bản chi tiết: CẦN BỔ SUNG TƯ LIỆU.',
  },
  {
    id: 'vn-xinh-nha',
    region: 'vietnam',
    title: 'Xinh Nhã',
    culturalCommunity: 'Dân tộc Ê-đê',
    distributionArea: 'Tây Nguyên',
    imagePath: '/src/assets/images/hero_tay_nguyen_museum_1794539117734.jpg',
    imageAlt: 'Nhà dài Tây Nguyên giữa đại ngàn gắn với sử thi Xinh Nhã',
    introduction:
      'Thiên sử thi nổi tiếng về hành trình trưởng thành, lòng hiếu thảo và cuộc chiến đòi lại công lý của chàng trai trẻ Xinh Nhã.',
    plotSummary:
      'Cha của Xinh Nhã bị tù trưởng Gia Rơ Bú sát hại, mẹ bị bắt làm tôi tớ. Xinh Nhã lớn lên trong gian khó, tôi luyện bản lĩnh, triệu tập sự ủng hộ của cộng đồng để đánh bại Gia Rơ Bú, giải thoát cho mẹ và đem lại công bằng cho buôn làng.',
    plotSteps: [
      { step: 'Nỗi đau mất mát', detail: 'Gia đình Xinh Nhã bị Gia Rơ Bú tàn hại khi chàng còn nhỏ.' },
      { step: 'Trưởng thành', detail: 'Xinh Nhã vượt nghịch cảnh, rèn luyện tài năng và chí khí.' },
      { step: 'Quyết chiến', detail: 'Giao chiến với thế lực Gia Rơ Bú với sự trợ lực của cộng đồng.' },
      { step: 'Đoàn tụ', detail: 'Giải cứu mẹ, khôi phục danh dự gia đình và bình yên buôn làng.' },
    ],
    centralCharacter: 'Xinh Nhã — hiện thân của lòng hiếu nghĩa, ý chí phục thù chính đáng và khát vọng công lý.',
    characterProfile: {
      name: 'Xinh Nhã',
      role: 'Người con hiếu nghĩa, anh hùng trưởng thành từ nghịch cảnh',
      keyConflict: 'Xung đột giữa công lý – hiếu đạo và thế lực áp bức Gia Rơ Bú',
      representativeTrait: 'Hiếu thảo, kiên định, không khuất phục trước bạo quyền',
    },
    artisticFeatures: [
      'Kết hợp hài hòa giữa yếu tố bi tráng (nỗi đau gia đình) và hào hùng (chiến thắng công lý).',
      'Hình ảnh ẩn dụ âm thanh chiêng, bão tố núi rừng giàu sức gợi.',
    ],
    culturalValue:
      'Đề cao đạo hiếu, khát vọng công bằng xã hội và sức mạnh đoàn kết chống lại cái ác trong tâm thức Tây Nguyên.',
    readingQuestions: [
      'Động lực chiến đấu của Xinh Nhã có điểm gì khác biệt so với Đăm Săn?',
      'CẦN BỔ SUNG TƯ LIỆU đoạn trích cụ thể để học sinh phân tích chi tiết nghệ thuật.',
    ],
    appliedMission:
      'Viết đoạn văn ngắn (150 chữ) bàn về vẻ đẹp lòng hiếu thảo gắn với trách nhiệm cộng đồng của Xinh Nhã.',
    referenceNote: 'Trích đoạn nguyên văn theo dị bản giảng dạy: CẦN BỔ SUNG TƯ LIỆU.',
  },
  {
    id: 'vn-de-dat-de-nuoc',
    region: 'vietnam',
    title: 'Đẻ đất đẻ nước',
    culturalCommunity: 'Dân tộc Mường',
    distributionArea: 'Hòa Bình, Thanh Hóa và vùng cư trú người Mường',
    imagePath: '/src/assets/images/epic_mythic_cosmos_1794540243920.jpg',
    imageAlt: 'Bức tranh vũ trụ quan thần thoại cây chu đồng và sông núi',
    introduction:
      'Bộ sử thi thần thoại đồ sộ của người Mường, thường được diễn xướng trong các nghi lễ truyền thống của cộng đồng, lý giải nguồn gốc vũ trụ và bản mường.',
    plotSummary:
      'Kể từ thuở hỗn mang trời đất tách đôi, mưa lớn tạo sông núi, sự ra đời của cây chu đồng (cây si) kỳ vĩ, nguồn gốc muôn loài và sự hình thành các bản mường đầu tiên dưới sự dẫn dắt của các nhân vật tổ tiên.',
    plotSteps: [
      { step: 'Tạo lập trời đất', detail: 'Sự phân tách trời – đất, hình thành sông ngòi núi non.' },
      { step: 'Khởi nguồn sự sống', detail: 'Sự xuất hiện của cây chu đồng và muôn loài.' },
      { step: 'Dựng bản mường', detail: 'Con người đoàn kết khai phá, lập mường và xây dựng tập quán.' },
    ],
    centralCharacter: 'Hệ thống nhân vật sáng tạo vũ trụ và tổ tiên cộng đồng (Ông Thu Tha, Bà Thu Thiên, Lang Cun Cần...).',
    characterProfile: {
      name: 'Lang Cun Cần & Các vị tổ tiên Mường',
      role: 'Người kiến tạo trật tự bản mường cổ đại',
      keyConflict: 'Chinh phục tự nhiên hỗn mang để dựng xây cuộc sống ổn định',
      representativeTrait: 'Tư duy cội nguồn, gắn bó thiên nhiên, ý thức cộng đồng sâu sắc',
    },
    artisticFeatures: [
      'Lời kể giàu chất thơ dân gian Mường, nhịp điệu song đôi, liên tưởng thần thoại mộc mạc mà kỳ vĩ.',
      'Hình tượng biểu trưng giàu sức khái quát (cây chu đồng, quả trứng hồng hoang).',
    ],
    culturalValue:
      'Khẳng định ý thức cội nguồn chung của cộng đồng và kho tri thức dân gian về thiên nhiên, lao động của người Mường.',
    readingQuestions: [
      'Điểm khác nhau cơ bản giữa sử thi thần thoại “Đẻ đất đẻ nước” và sử thi anh hùng “Đăm Săn” là gì?',
      'CẦN BỔ SUNG TƯ LIỆU bản dịch tiếng Việt chuẩn xác để học sinh đối chiếu hình ảnh.',
    ],
    appliedMission:
      'Vẽ sơ đồ tư duy 3 chặng: Tạo lập vũ trụ – Sinh sôi muôn loài – Dựng xây bản mường.',
    referenceNote: 'Văn bản tiếng Mường và bản dịch chuẩn hóa tại lớp: CẦN BỔ SUNG TƯ LIỆU.',
  },
  {
    id: 'vn-dam-noi',
    region: 'vietnam',
    title: 'Đăm Noi (Truyền thống Hơ-mon Ba Na)',
    culturalCommunity: 'Dân tộc Ba Na',
    distributionArea: 'Gia Lai – Kon Tum – Bình Định (Tây Nguyên & Nam Trung Bộ)',
    imagePath: '/src/assets/images/zone_epic_gate_1794539494154.jpg',
    imageAlt: 'Không gian lưu trữ truyền thống diễn xướng sử thi Hơ-mon',
    introduction:
      'Đại diện cho dòng sử thi Hơ-mon đặc sắc của người Ba Na, góp phần cho thấy bức tranh phong phú của kho tàng sử thi các dân tộc Việt Nam bên cạnh Khan Ê-đê.',
    plotSummary:
      'Kể về người anh hùng Đăm Noi bảo vệ buôn làng trước các thế lực xâm hại, thể hiện lý tưởng công bằng và tình yêu quê hương. (CẦN BỔ SUNG TƯ LIỆU cốt truyện chi tiết và văn bản trích dẫn theo nguồn sưu tầm chính thống).',
    plotSteps: [
      { step: 'Bối cảnh', detail: 'Cuộc sống buôn làng Ba Na và thử thách từ thế lực thù địch.' },
      { step: 'Hành động', detail: 'Đăm Noi đứng lên bảo vệ cộng đồng bằng lòng quả cảm.' },
      { step: 'Ý nghĩa', detail: 'Khẳng định khát vọng hòa bình của truyền thống Hơ-mon.' },
    ],
    centralCharacter: 'Đăm Noi — người anh hùng trong truyền thống diễn xướng Hơ-mon Ba Na.',
    characterProfile: {
      name: 'Đăm Noi',
      role: 'Anh hùng bảo vệ buôn làng Ba Na',
      keyConflict: 'Bảo vệ sự yên bình buôn làng trước thế lực áp bức',
      representativeTrait: 'Quả cảm, gắn bó cộng đồng',
    },
    artisticFeatures: [
      'Hình thức diễn xướng Hơ-mon giàu tính nhạc và đối đáp cộng đồng.',
      'CẦN BỔ SUNG TƯ LIỆU phân tích nghệ thuật chi tiết từ văn bản sưu tầm.',
    ],
    culturalValue:
      'Mở rộng hiểu biết về sự đa dạng của sử thi Tây Nguyên (không chỉ có Ê-đê mà còn Ba Na, Gia Rai, M’nông, Xơ Đăng...).',
    readingQuestions: [
      'Truyền thống Hơ-mon của người Ba Na có điểm gì tương đồng với Khan của người Ê-đê?',
    ],
    appliedMission:
      'Tìm hiểu thêm một bộ sử thi khác của các dân tộc Tây Nguyên để bổ sung vào bảng tư liệu lớp học.',
    referenceNote: 'Văn bản Hơ-mon Đăm Noi chi tiết: CẦN BỔ SUNG TƯ LIỆU.',
  },
];

export const WORLD_EPIC_DOSSIERS: EpicDossier[] = [
  {
    id: 'world-iliad',
    region: 'world',
    title: 'I-li-át (Iliad)',
    culturalCommunity: 'Hy Lạp cổ đại · Tương truyền do Hô-me-rơ (Homer) hệ thống hóa',
    distributionArea: 'Vùng biển Aegean – Địa Trung Hải (Hy Lạp cổ đại & Tiểu Á)',
    cultureRegionId: 'greece',
    imagePath: '/src/assets/images/world_epics_odyssey_1794539120237.jpg',
    imageAlt: 'Trưng bày sử thi Hy Lạp cổ đại Iliad và chiến thuyền Aegean',
    introduction:
      'Thiên sử thi bi tráng bậc nhất phương Tây gồm 24 khúc ca, tập trung vào năm mươi ngày cuối trong năm thứ mười của cuộc chiến thành Tơ-roa.',
    plotSummary:
      'Bắt đầu từ cơn giận của anh hùng A-sin khi bị chủ tướng A-ga-mem-nông tước chiến lợi phẩm; A-sin rút lui khiến quân Hy Lạp liên tiếp thất bại trước Héc-to. Sau khi bạn thân Pa-tơ-rô-clơ tử trận, A-sin trở lại chiến trường, đánh bại Héc-to rồi lắng lòng trao trả thi hài Héc-to cho vua cha Pri-am.',
    plotSteps: [
      { step: 'Cơn giận của A-sin', detail: 'Xung đột nội bộ khiến A-sin ngừng tham chiến.' },
      { step: 'Khí phách Héc-to', detail: 'Héc-to bảo vệ thành Tơ-roa, từ biệt vợ con trước giờ ra trận.' },
      { step: 'Bước ngoặt', detail: 'Pa-tơ-rô-clơ tử trận; A-sin trở lại chiến đấu quyết liệt.' },
      { step: 'Lòng nhân bản', detail: 'A-sin cảm động trước nỗi đau của vua Pri-am, cho phép làm lễ an táng Héc-to.' },
    ],
    centralCharacter: 'A-sin (Achilles) & Héc-to (Hector) — hai hình tượng anh hùng bi tráng đại diện cho danh dự và bổn phận.',
    characterProfile: {
      name: 'Héc-to (Hector)',
      role: 'Hoàng tử, thống lĩnh bảo vệ thành Tơ-roa',
      keyConflict: 'Giằng xé giữa tình thương gia đình và bổn phận bảo vệ thành bang',
      representativeTrait: 'Nhân hậu, can trường, ý thức trách nhiệm công dân sâu sắc',
    },
    artisticFeatures: [
      'Nghệ thuật khắc họa tâm lý sâu sắc ngay giữa chiến trận khốc liệt.',
      'Hệ thống tính ngữ cố định và các phép so sánh mở rộng giàu tính tạo hình.',
      'Nhìn nhận cả hai chiến tuyến bằng cái nhìn nhân bản, không phiến diện.',
    ],
    culturalValue:
      'Tôn vinh giá trị nhân bản vượt lên hận thù chiến tranh, phản ánh quan niệm danh dự và số phận của người Hy Lạp cổ đại.',
    readingQuestions: [
      'Vì sao cảnh Héc-to từ biệt Ăng-đrô-mác lại được xem là đoạn trích giàu tính nhân văn nhất của Iliad?',
      'CẦN BỔ SUNG TƯ LIỆU trích đoạn bản dịch chuẩn theo chương trình lớp học.',
    ],
    appliedMission:
      'Thảo luận nhóm: So sánh vẻ đẹp bi tráng của Héc-to với vẻ đẹp hào hùng của Đăm Săn.',
    comparisonQuestion:
      'Điểm khác biệt về thái độ trước chiến tranh giữa Đăm Săn và Iliad là gì?',
    connectionMission:
      'Liên hệ trách nhiệm bảo vệ quê hương và trân trọng hòa bình trong bối cảnh hiện đại.',
    referenceNote: 'Bản dịch trích đoạn cụ thể do giáo viên chọn theo sách giáo khoa: CẦN BỔ SUNG TƯ LIỆU.',
  },
  {
    id: 'world-odyssey',
    region: 'world',
    title: 'Ô-đi-xê (Odyssey)',
    culturalCommunity: 'Hy Lạp cổ đại · Tương truyền do Hô-me-rơ (Homer) sáng tác',
    distributionArea: 'Biển Địa Trung Hải & đảo I-ta-ca (Hy Lạp)',
    cultureRegionId: 'greece',
    imagePath: '/src/assets/images/world_epics_odyssey_1794539120237.jpg',
    imageAlt: 'Mô hình thuyền cổ Hy Lạp trên hành trình trở về I-ta-ca',
    introduction:
      'Tiếp nối Iliad, gồm 24 khúc ca kể về hành trình mười năm phiêu lưu đầy gian nan của người anh hùng trí tuệ Ô-đi-xê để trở về quê hương I-ta-ca.',
    plotSummary:
      'Sau chiến thắng thành Tơ-roa, Ô-đi-xê vượt qua cơn giận của thần biển Pô-dê-đông, mưu trí thoát khỏi tên khổng lồ một mắt Pô-li-phem, cưỡng lại tiếng hát mê hoặc của nàng Xi-ren. Trở về I-ta-ca trong lốt người hành khất, chàng trừng trị bọn cầu hôn và vượt qua phép thử chiếc giường cây ô-liu của người vợ chung thủy Pê-nê-lốp.',
    plotSteps: [
      { step: 'Lênh đênh trên biển', detail: 'Vượt qua đảo Xi-clốp, bão tố và cám dỗ kỳ ảo.' },
      { step: 'Trở về I-ta-ca', detail: 'Cải trang quan sát tình hình cung điện bị bọn cầu hôn quấy phá.' },
      { step: 'Thử thách cung tên', detail: 'Giương cung cứng trừng trị kẻ xấu, giành lại công lý gia đình.' },
      { step: 'Đoàn tụ', detail: 'Vượt phép thử bí mật chiếc giường ô-liu, đoàn tụ cùng Pê-nê-lốp.' },
    ],
    centralCharacter: 'Ô-đi-xê — biểu tượng của trí tuệ sắc sảo, lòng kiên định và tình yêu quê hương gia đình.',
    characterProfile: {
      name: 'Ô-đi-xê (Odysseus)',
      role: 'Vua xứ I-ta-ca, nhà thám hiểm trí tuệ',
      keyConflict: 'Đấu trí vượt qua thiên nhiên khắc nghiệt, cám dỗ và bọn cầu hôn',
      representativeTrait: 'Thông minh, thận trọng, khát khao đoàn tụ gia đình',
    },
    artisticFeatures: [
      'Kết cấu trần thuật lồng ghép, hồi tưởng linh hoạt giàu kịch tính.',
      'Nghệ thuật xây dựng tình huống thử thách tâm lý tinh tế (đoạn trích Gặp gỡ Pê-nê-lốp).',
    ],
    culturalValue:
      'Khẳng định sức mạnh của trí tuệ con người trước thiên nhiên mênh mông và ca ngợi sự thủy chung trong gia đình.',
    readingQuestions: [
      'Chi tiết chiếc giường gốc cây ô-liu chứng minh điều gì về trí tuệ của cả Ô-đi-xê và Pê-nê-lốp?',
    ],
    appliedMission:
      'Vẽ bản đồ hành trình 4 chặng thử thách tiêu biểu của Ô-đi-xê và liên hệ với Đăm Săn.',
    comparisonQuestion:
      'Tại sao nói Đăm Săn là anh hùng của sức mạnh đại ngàn còn Ô-đi-xê là anh hùng của trí tuệ biển khơi?',
    connectionMission:
      'Rút ra bài học về bản lĩnh giữ vững mục tiêu trước thử thách trong học tập lớp 10.',
    referenceNote: 'Trích đoạn “Ô-đi-xê trở về” theo SGK Ngữ văn 10 hiện hành.',
  },
  {
    id: 'world-ramayana',
    region: 'world',
    title: 'Ra-ma-ya-na (Ramayana)',
    culturalCommunity: 'Ấn Độ cổ đại · Đạo sĩ Van-mi-ki (Valmiki)',
    distributionArea: 'Tiểu lục địa Ấn Độ & có ảnh hưởng sâu rộng tới Đông Nam Á',
    cultureRegionId: 'india',
    imagePath: '/src/assets/images/epic_mythic_cosmos_1794540243920.jpg',
    imageAlt: 'Không gian nghệ thuật cổ điển Ấn Độ gắn với sử thi Ramayana',
    introduction:
      'Một trong hai bộ đại sử thi vĩ đại của Ấn Độ cổ đại (gồm 7 quyển, 24.000 câu thơ đôi), đặt ra những chuẩn mực đạo đức Đạt-ma (Dharma) sâu sắc.',
    plotSummary:
      'Hoàng tử Ra-ma vì giữ lời hứa của vua cha đã tự nguyện sống cảnh lưu đày 14 năm trong rừng cùng vợ là nàng Xi-ta và em trai Lắc-ma-na. Quỷ vương Ra-va-na bắt cóc Xi-ta về đảo Lăng-ca. Với sự trợ giúp của tướng khỉ Ha-nu-man, Ra-ma đánh bại Ra-va-na, giải cứu Xi-ta nhưng phải đối mặt với giằng xé nghiệt ngã giữa tình yêu và danh dự quân vương.',
    plotSteps: [
      { step: 'Lưu đày vào rừng', detail: 'Ra-ma giữ trọn chữ hiếu và bổn phận hoàng tử.' },
      { step: 'Biến cố Lăng-ca', detail: 'Quỷ vương Ra-va-na bắt cóc nàng Xi-ta.' },
      { step: 'Chiến thắng', detail: 'Ra-ma cùng Ha-nu-man vượt biển đánh bại Ra-va-na.' },
      { step: 'Thử thách danh dự', detail: 'Cuộc đối chất đầy giằng xé tâm lý (đoạn trích Ra-ma buộc tội).' },
    ],
    centralCharacter: 'Ra-ma & Xi-ta — biểu tượng cho chuẩn mực bổn phận, lòng trung trinh và bi kịch danh dự.',
    characterProfile: {
      name: 'Ra-ma (Rama)',
      role: 'Hoàng tử lý tưởng theo chuẩn mực Đạt-ma',
      keyConflict: 'Mâu thuẫn nội tâm giữa tình yêu người chồng và danh dự bậc quân vương',
      representativeTrait: 'Trọng danh dự, tuân thủ bổn phận, đấu tranh nội tâm sâu sắc',
    },
    artisticFeatures: [
      'Miêu tả diễn biến tâm lý phức tạp qua ngôn ngữ đối thoại và ẩn dụ thiên nhiên.',
      'Tính triết lý đạo đức Đạt-ma kết hợp yếu tố kì ảo phương Đông.',
    ],
    culturalValue:
      'Gìn giữ chuẩn mực ứng xử, lòng chung thủy và đặt ra suy ngẫm sâu sắc về xung đột giữa bổn phận xã hội và hạnh phúc cá nhân.',
    readingQuestions: [
      'Phân tích tâm trạng giằng xé của Ra-ma và bản lĩnh của Xi-ta trong đoạn trích Ra-ma buộc tội.',
    ],
    appliedMission:
      'Tổ chức tranh biện nhỏ: Trong đoạn đối chất ở Lăng-ca, em đồng cảm với góc nhìn của Ra-ma hay Xi-ta? Vì sao?',
    comparisonQuestion:
      'So sánh cách bảo vệ danh dự của Ra-ma (Ấn Độ) và Đăm Săn (Tây Nguyên).',
    connectionMission:
      'Tìm hiểu dấu ấn ảnh hưởng của Ramayana trong văn hóa – nghệ thuật Đông Nam Á.',
    referenceNote: 'Đoạn trích “Ra-ma buộc tội” theo SGK Ngữ văn 10.',
  },
  {
    id: 'world-mahabharata',
    region: 'world',
    title: 'Ma-ha-bha-ra-ta (Mahabharata)',
    culturalCommunity: 'Ấn Độ cổ đại · Tương truyền do đạo sĩ Vi-a-sa (Vyasa) kết tập',
    distributionArea: 'Bắc Ấn Độ cổ đại (Lưu vực sông Hằng – sông Ấn)',
    cultureRegionId: 'india',
    imagePath: '/src/assets/images/epic_mythic_cosmos_1794540243920.jpg',
    imageAlt: 'Mural triết lý vũ trụ và sử thi Ấn Độ cổ đại',
    introduction:
      'Bộ sử thi đồ sộ bậc nhất lịch sử nhân loại (khoảng 100.000 câu thơ đôi), được xem như pho bách khoa toàn thư về triết học, đạo đức và xã hội Ấn Độ cổ đại.',
    plotSummary:
      'Xoay quanh cuộc xung đột kéo dài giữa hai nhánh anh em họ thuộc dòng tộc Bha-ra-ta là Păng-đa-va và Kâu-ra-va để giành quyền trị vì hợp pháp, lên tới đỉnh điểm ở trận chiến Cu-rúc-sê-tra, lồng ghép nhiều câu chuyện triết lý về bổn phận con người (nổi bật là Chí Tôn Ca – Bhagavad Gita).',
    plotSteps: [
      { step: 'Tranh chấp vương quyền', detail: 'Mâu thuẫn giữa năm anh em Păng-đa-va và trăm anh em Kâu-ra-va.' },
      { step: 'Lưu đày 13 năm', detail: 'Thử thách bản lĩnh và sự nhẫn nại của nhánh Păng-đa-va.' },
      { step: 'Đối thoại triết lý', detail: 'Ac-giu-na trăn trở về bổn phận trước giờ giao chiến.' },
      { step: 'Chiến thắng & Suy tư', detail: 'Cái giá của chiến tranh và bài học về lẽ phải Đạt-ma.' },
    ],
    centralCharacter: 'Ac-giu-na (Arjuna) & Giu-đi-xtơ-ra — những nhân vật đối diện câu hỏi lớn về lẽ phải và bổn phận.',
    characterProfile: {
      name: 'Ac-giu-na (Arjuna)',
      role: 'Chiến binh cung thủ tài ba của nhánh Păng-đa-va',
      keyConflict: 'Trăn trở đạo đức khi phải giao chiến với chính những người thân tộc',
      representativeTrait: 'Tài năng kiệt xuất, biết suy tư sâu sắc về ý nghĩa hành động',
    },
    artisticFeatures: [
      'Kết cấu đồ sộ “truyện lồng trong truyện” kết hợp tự sự anh hùng với đối thoại triết học.',
      'Chiều sâu suy tư về thiện – ác, nghĩa vụ và thân phận con người.',
    ],
    culturalValue:
      'Thể hiện khát vọng hướng tới công lý (Dharma) và suy ngẫm vượt thời đại về hậu quả của chiến tranh.',
    readingQuestions: [
      'Điểm nổi bật về tư tưởng của Mahabharata so với các sử thi thuần túy ca ngợi chiến công là gì?',
      'CẦN BỔ SUNG TƯ LIỆU trích đoạn chọn lọc nếu giảng dạy chuyên đề mở rộng.',
    ],
    appliedMission:
      'Chọn một tiêu chí trong công cụ Đối thoại anh hùng để so sánh trăn trở của Ac-giu-na với Héc-to.',
    comparisonQuestion:
      'Sự khác biệt trong cách thể hiện thế giới nội tâm giữa Mahabharata và Đăm Săn?',
    connectionMission:
      'Suy nghĩ về vai trò của đối thoại trong giải quyết xung đột tập thể.',
    referenceNote: 'Chuyên đề đọc mở rộng Sử thi thế giới: CẦN BỔ SUNG TƯ LIỆU trích đoạn cụ thể.',
  },
  {
    id: 'world-gilgamesh',
    region: 'world',
    title: 'Sử thi Gin-ga-mét (Epic of Gilgamesh)',
    culturalCommunity: 'Lưỡng Hà cổ đại (Sumer – Babylon)',
    distributionArea: 'Vùng Lưỡng Hà (Lưu vực sông Tigris và Euphrates, Tây Á)',
    cultureRegionId: 'mesopotamia',
    imagePath: '/src/assets/images/world_gilgamesh_relief_1794540243231.jpg',
    imageAlt: 'Hiện vật bảng đất sét chữ hình nêm và phù điêu Lưỡng Hà cổ đại',
    introduction:
      'Một trong những tác phẩm văn học thành văn cổ xưa nhất của nhân loại được khắc trên các phiến đất sét chữ hình nêm.',
    plotSummary:
      'Kể về vị vua thành U-rúc tên Gin-ga-mét hùng mạnh nhưng kiêu ngạo, sau kết tình bạn tri kỷ với người hoang dã En-ki-đu. Khi En-ki-đu qua đời, nỗi đau mất bạn thôi thúc Gin-ga-mét dấn thân vào hành trình vượt tận cùng thế giới tìm bí quyết bất tử, để rồi cuối cùng ngộ ra giá trị đích thực nằm ở những công trình và di sản để lại cho nhân thế.',
    plotSteps: [
      { step: 'Tình bạn tri kỷ', detail: 'Gin-ga-mét và En-ki-đu từ đối đầu trở thành bạn đồng hành.' },
      { step: 'Chiến công & Bi kịch', detail: 'Cùng lập chiến công nhưng En-ki-đu phải đón nhận cái chết.' },
      { step: 'Tìm kiếm bất tử', detail: 'Hành trình gian khổ đi tìm bí quyết sống mãi của Gin-ga-mét.' },
      { step: 'Thức tỉnh nhân bản', detail: 'Trở về U-rúc, trân trọng cuộc sống hữu hạn và di sản thành quách.' },
    ],
    centralCharacter: 'Vua Gin-ga-mét — hành trình từ kiêu hùng tới thấu hiểu giới hạn và giá trị của đời người.',
    characterProfile: {
      name: 'Gin-ga-mét (Gilgamesh)',
      role: 'Vua thành bang U-rúc cổ đại',
      keyConflict: 'Nỗi sợ cái chết hữu hạn và hành trình đi tìm ý nghĩa bất tử',
      representativeTrait: 'Mạnh mẽ, giàu tình bạn, biết tự nhận thức và trưởng thành qua mất mát',
    },
    artisticFeatures: [
      'Cấu trúc hồi – lặp nhịp điệu nghi lễ trên các phiến đất sét cổ.',
      'Chủ đề triết lý sâu sắc về tình bạn, cái chết và ý nghĩa tồn tại của con người.',
    ],
    culturalValue:
      'Đặt nền móng cho câu hỏi nhân sinh muôn thuở: Con người không bất tử về thể xác, nhưng bất tử qua những giá trị tốt đẹp để lại cho cộng đồng.',
    readingQuestions: [
      'Sự thay đổi nhận thức của Gin-ga-mét ở đầu và cuối sử thi mang lại thông điệp nhân văn gì?',
      'CẦN BỔ SUNG TƯ LIỆU trích đoạn dịch tiếng Việt khi đưa vào bài giảng.',
    ],
    appliedMission:
      'So sánh khát vọng vượt giới hạn của Gin-ga-mét (đi tìm bất tử) và Đăm Săn (đi hỏi Nữ thần Mặt Trời).',
    comparisonQuestion:
      'Cả Gin-ga-mét và Đăm Săn đều đối diện với giới hạn của con người — kết cục của họ gợi suy ngẫm gì?',
    connectionMission:
      'Viết một thông điệp ngắn trả lời câu hỏi: Điều gì làm nên giá trị lâu bền của một đời người?',
    referenceNote: 'Tư liệu phiến đất sét trích dịch chuẩn: CẦN BỔ SUNG TƯ LIỆU.',
  },
];

export const HERO_COMPARISON_PROFILES: HeroComparisonProfile[] = [
  {
    id: 'hero-dam-san',
    name: 'Đăm Săn',
    workTitle: 'Sử thi Đăm Săn (Việt Nam)',
    origin: 'Buôn làng Ê-đê · Đại ngàn Tây Nguyên',
    appearanceContext:
      'Xuất hiện như vị tù trưởng trẻ trung, dũng mãnh, đứng đầu buôn làng trong xã hội mẫu hệ Tây Nguyên.',
    aspiration:
      'Bảo vệ hạnh phúc gia đình, danh dự buôn làng, mở rộng sự phồn vinh cộng đồng và vươn tới khát vọng chinh phục giới hạn (Nữ thần Mặt Trời).',
    actions:
      'Đấu tay đôi quang minh với Mtao Grư, Mtao Mxây; thu phục dân làng đối thủ; chặt cây thần Smuk; lên đường cầu hôn Nữ thần Mặt Trời.',
    qualities: 'Dũng cảm phi thường, trọng danh dự, thượng võ, giàu tinh thần tập thể.',
    communityRelation:
      'Gắn bó máu thịt; chiến thắng của Đăm Săn mang lại ấm no, đoàn kết và niềm tự hào cho cả buôn làng.',
    fate: 'Lập nhiều chiến công lừng lẫy nhưng cuối cùng gục ngã khi thách thức quy luật tự nhiên, để lại bài học về giới hạn con người.',
    symbolicMeaning:
      'Biểu tượng sức mạnh đại ngàn, tinh thần thượng võ và khát vọng tự do – phồn vinh của cộng đồng Tây Nguyên.',
  },
  {
    id: 'hero-xinh-nha',
    name: 'Xinh Nhã',
    workTitle: 'Sử thi Xinh Nhã (Việt Nam)',
    origin: 'Buôn làng Ê-đê · Tây Nguyên',
    appearanceContext:
      'Trưởng thành từ bi kịch mất cha, mẹ bị bắt làm tôi tớ dưới ách áp bức của tù trưởng Gia Rơ Bú.',
    aspiration:
      'Trả thù chính đáng cho cha, giải cứu mẹ và lập lại công bằng, bình yên cho buôn làng.',
    actions:
      'Tôi luyện bản lĩnh, cất tiếng chiêng hiệu triệu sự ủng hộ của cộng đồng và đánh bại thế lực tàn bạo Gia Rơ Bú.',
    qualities: 'Hiếu thảo, kiên cường vượt nghịch cảnh, trọng công lý.',
    communityRelation:
      'Được cộng đồng và gia tộc đồng lòng trợ lực trong cuộc chiến bảo vệ lẽ phải.',
    fate: 'Chiến thắng cái ác, giải cứu được mẹ và khôi phục trật tự bình yên cho quê hương.',
    symbolicMeaning:
      'Biểu tượng của đạo hiếu, ý chí vươn lên từ nghịch cảnh và niềm tin cái thiện chiến thắng cái ác.',
  },
  {
    id: 'hero-odysseus',
    name: 'Ô-đi-xê (Odysseus)',
    workTitle: 'Sử thi Odyssey (Hy Lạp)',
    origin: 'Vua đảo I-ta-ca · Thế giới Hy Lạp cổ đại',
    appearanceContext:
      'Xuất hiện trên hành trình lênh đênh 10 năm trở về quê hương sau khi kết thúc cuộc chiến thành Tơ-roa.',
    aspiration:
      'Vượt qua muôn trùng gian nan để đoàn tụ cùng vợ con (Pê-nê-lốp, Tê-lê-mác) và lập lại trật tự cho xứ I-ta-ca.',
    actions:
      'Dùng mưu trí thoát khỏi Xi-clốp Pô-li-phem, chống lại cám dỗ kỳ ảo, cải trang trừng trị bọn cầu hôn và giải mã phép thử chiếc giường ô-liu.',
    qualities: 'Trí tuệ sắc sảo, mưu lược, kiên nhẫn, thủy chung sâu sắc.',
    communityRelation:
      'Là vị vua khôn ngoan có trách nhiệm bảo vệ công lý gia đình và bình yên thần dân I-ta-ca.',
    fate: 'Vượt qua mọi thử thách, đoàn tụ hạnh phúc và giữ vững vương quốc.',
    symbolicMeaning:
      'Biểu tượng trí tuệ chinh phục thiên nhiên, bản lĩnh vượt cám dỗ và tình yêu gia đình – quê hương.',
  },
  {
    id: 'hero-hector',
    name: 'Héc-to (Hector)',
    workTitle: 'Sử thi Iliad (Hy Lạp)',
    origin: 'Hoàng tử thành Tơ-roa · Hy Lạp cổ đại',
    appearanceContext:
      'Giữa những ngày khốc liệt nhất của cuộc chiến bảo vệ thành Tơ-roa bị bao vây.',
    aspiration:
      'Bảo vệ sự an toàn, danh dự của thành Tơ-roa và giữ tròn tình yêu với vợ con (Ăng-đrô-mác, A-xti-a-nắc).',
    actions:
      'Ra trận nơi tuyến đầu dù linh cảm trước ngày thành sụp đổ; dũng cảm đối đầu A-sin trước cổng thành.',
    qualities: 'Nhân hậu, giàu tình cảm gia đình, ý thức bổn phận công dân cao cả.',
    communityRelation:
      'Chỗ dựa tinh thần và lá chắn bảo vệ toàn thể dân chúng thành Tơ-roa.',
    fate: 'Hy sinh bi tráng dưới tay A-sin và được an táng trong niềm thương tiếc của toàn thành.',
    symbolicMeaning:
      'Hình mẫu vẻ đẹp bi tráng của người anh hùng đặt bổn phận cộng đồng lên trên sinh mệnh cá nhân.',
  },
  {
    id: 'hero-rama',
    name: 'Ra-ma (Rama)',
    workTitle: 'Sử thi Ramayana (Ấn Độ)',
    origin: 'Hoàng tử vương quốc Kô-sa-la · Ấn Độ cổ đại',
    appearanceContext:
      'Tự nguyện chịu lưu đày 14 năm trong rừng để giữ trọn lời hứa của vua cha theo chuẩn mực Đạt-ma.',
    aspiration:
      'Giữ trọn đạo lý Đạt-ma, giải cứu nàng Xi-ta khỏi quỷ vương Ra-va-na và bảo vệ thanh danh bậc quân vương.',
    actions:
      'Liên minh cùng Ha-nu-man vượt biển đánh bại Ra-va-na; đối diện cuộc giằng xé nội tâm với Xi-ta sau chiến thắng.',
    qualities: 'Đức độ, tuân thủ bổn phận, dũng mãnh nhưng chịu nhiều giằng xé tâm lý.',
    communityRelation:
      'Đặt dư luận và chuẩn mực đạo đức vương triều làm thước đo hành động của người trị vì.',
    fate: 'Chiến thắng kẻ thù nhưng phải trải qua bi kịch thử thách tình cảm sâu sắc.',
    symbolicMeaning:
      'Biểu tượng lý tưởng đạo đức Đạt-ma và bi kịch xung đột giữa tình yêu cá nhân với bổn phận xã hội.',
  },
  {
    id: 'hero-gilgamesh',
    name: 'Gin-ga-mét (Gilgamesh)',
    workTitle: 'Sử thi Gilgamesh (Lưỡng Hà)',
    origin: 'Vua thành U-rúc · Nền văn minh Lưỡng Hà cổ đại',
    appearanceContext:
      'Vị vua hùng mạnh buổi bình minh lịch sử thành thị cổ đại, trưởng thành sau tình bạn với En-ki-đu.',
    aspiration:
      'Ban đầu muốn khẳng định uy quyền, sau cái chết của bạn thân đã khao khát đi tìm bí quyết bất tử.',
    actions:
      'Lập chiến công cùng En-ki-đu, vượt biển tối và núi non tìm người bất tử U-ta-na-pis-tim.',
    qualities: 'Mạnh mẽ, chân thành trong tình bạn, dám đối diện sự thật về giới hạn đời người.',
    communityRelation:
      'Cuối cùng trở về chăm lo xây dựng thành U-rúc vững bền để lại di sản cho nhân dân.',
    fate: 'Không đạt được bất tử thể xác nhưng đạt tới sự thức tỉnh sâu sắc về ý nghĩa cuộc sống hữu hạn.',
    symbolicMeaning:
      'Biểu tượng hành trình tự nhận thức của con người cổ đại về hữu hạn, tình bạn và giá trị di sản văn hóa.',
  },
];
