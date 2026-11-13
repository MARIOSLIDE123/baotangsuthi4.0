import {
  ArenaGameMeta,
  ArenaQuestion,
  DialogueScenarioItem,
  EvidenceChallengeItem,
  HeroMatchRound,
  MysteryPuzzleItem,
  StemHouseMission,
  StemJourneyMission,
  StemProjectTemplate,
  StemQrTargetPreset,
  StemRubricCriterion,
  TimelineRound,
} from '../types/museum';

/** Fisher-Yates shuffle returning a new array */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Shuffle choices of a multiple-choice item and remap its correctIndex accurately */
export function shuffleOptionsWithIndex<T extends { choices: string[]; correctIndex: number }>(
  item: T
): T {
  const indexed = item.choices.map((choice, idx) => ({
    choice,
    isCorrect: idx === item.correctIndex,
  }));
  const mixed = shuffleArray(indexed);
  return {
    ...item,
    choices: mixed.map((x) => x.choice),
    correctIndex: mixed.findIndex((x) => x.isCorrect),
  };
}

export const ARENA_GAMES_META: ArenaGameMeta[] = [
  {
    id: 'decode',
    orderNumber: '01',
    title: 'GIẢI MÃ SỬ THI',
    subtitle: 'Trắc nghiệm 4 lựa chọn: xác nhận đáp án, xáo trộn ngẫu nhiên và giải thích chi tiết.',
    durationSeconds: 180,
    scoringFocus: 'Điểm đọc hiểu chuẩn xác + thưởng tốc độ hợp lí',
  },
  {
    id: 'who-is-hero',
    orderNumber: '02',
    title: 'AI LÀ ANH HÙNG?',
    subtitle: 'Ghép nhân vật sử thi với Tác phẩm, Phẩm chất và Sự kiện tiêu biểu.',
    durationSeconds: 210,
    scoringFocus: 'Gắn kết nhân vật – tác phẩm – phẩm chất – sự kiện',
  },
  {
    id: 'timeline',
    orderNumber: '03',
    title: 'DÒNG THỜI GIAN SỬ THI',
    subtitle: 'Kéo thả (hoặc nút điều chỉnh) sắp xếp các sự kiện sử thi theo đúng trình tự tự sự.',
    durationSeconds: 200,
    scoringFocus: 'Tư duy mạch truyện & trình tự diễn biến sử thi',
  },
  {
    id: 'mystery-tiles',
    orderNumber: '04',
    title: 'MẢNH GHÉP BÍ ẨN',
    subtitle: 'Trả lời đúng để mở khóa từng mảnh ghép tác phẩm và ghép hình với thông tin văn hóa.',
    durationSeconds: 220,
    scoringFocus: 'Giải mã tư liệu hình ảnh & kiến thức văn hóa sử thi',
  },
  {
    id: 'evidence-challenge',
    orderNumber: '05',
    title: 'THỬ THÁCH DẪN CHỨNG',
    subtitle: 'Từ một nhận định văn học, chọn dẫn chứng trúng đích và viết giải thích sắc bén.',
    durationSeconds: 240,
    scoringFocus: 'Điểm sử dụng dẫn chứng + điểm phân tích',
  },
  {
    id: 'epic-dialogue',
    orderNumber: '06',
    title: 'ĐỐI THOẠI SỬ THI',
    subtitle: 'Xử lí tình huống mở và nhận gợi ý khía cạnh suy nghĩ từ Trợ lý AI.',
    durationSeconds: 240,
    scoringFocus: 'Điểm phân tích phản biện & góc nhìn nhân văn',
  },
];

// Game 1: GIẢI MÃ SỬ THI (4 options each, balanced correctIndex, also shuffled dynamically on start)
export const ARENA_QUESTIONS: ArenaQuestion[] = [
  {
    id: 'q1',
    category: 'Thể loại',
    prompt: 'Yếu tố nào sau đây là đặc trưng cốt lõi phân biệt nhân vật anh hùng sử thi với nhân vật truyện cổ tích?',
    choices: [
      'Luôn có phép thuật biến hóa nhờ sự giúp đỡ ngẫu nhiên.',
      'Gắn vận mệnh, sức mạnh và danh dự cá nhân với lý tưởng chung của cả cộng đồng.',
      'Thường trải qua cuộc sống đời thường bình dị ở làng quê hiện đại.',
      'Chỉ xuất hiện trong những câu chuyện hài hước dân gian.',
    ],
    correctIndex: 1,
    feedback: 'Người anh hùng sử thi đại diện cho ý chí, sức mạnh và khát vọng phồn vinh của cả buôn làng hoặc dân tộc.',
  },
  {
    id: 'q2',
    category: 'Dẫn chứng',
    prompt: 'Trong trích đoạn Chiến thắng Mtao Mxây, chi tiết so sánh chiếc khiên của Mtao Mxây kêu “lạch xạch như quả mướp khô” có tác dụng gì?',
    excerpt: 'Chi tiết đối chiếu giữa hai màn múa khiên trong trận giao chiến.',
    choices: [
      'Cho thấy Mtao Mxây dùng loại vũ khí nhẹ để di chuyển linh hoạt.',
      'Tô đậm không khí vui tươi của buổi tập luyện trước ngày hội.',
      'Khắc họa sự yếu thế, bất tài và vẻ huênh hoang thảm hại của Mtao Mxây.',
      'Miêu tả phong tục làm nhạc cụ từ vỏ quả khô của người Tây Nguyên.',
    ],
    correctIndex: 2,
    feedback: 'Hình ảnh so sánh “như quả mướp khô” đối lập trực tiếp với bước nhảy rung chuyển đồi tranh của Đăm Săn.',
  },
  {
    id: 'q3',
    category: 'Sử thi thế giới',
    prompt: 'Trong sử thi Ô-đi-xê (Hô-me-rơ), phép thử bí mật chiếc giường cây ô-liu của Pê-nê-lốp thể hiện điều gì?',
    choices: [
      'Chứng minh sức khỏe cơ bắp phi thường của Ô-đi-xê khi nâng chiếc giường.',
      'Thể hiện sự xa hoa tráng lệ của cung điện thành I-ta-ca.',
      'Muốn từ chối cho Ô-đi-xê quay trở lại làm vua xứ I-ta-ca.',
      'Xác nhận danh tính thật của Ô-đi-xê bằng trí tuệ thận trọng và tình nghĩa thủy chung.',
    ],
    correctIndex: 3,
    feedback: 'Chiếc giường đẽo từ gốc cây ô-liu gắn liền đất là bí mật riêng tư, chứng minh trí tuệ tương xứng giữa Ô-đi-xê và Pê-nê-lốp.',
  },
  {
    id: 'q4',
    category: 'Đăm Săn',
    prompt: 'Sau khi đánh bại Mtao Mxây, việc Đăm Săn hỏi dân làng đối thủ ba lần trước khi trở về nhằm khẳng định giá trị nào?',
    choices: [
      'Kiểm tra lại kho tàng xem trong làng còn ai giấu chiêng quý hay không.',
      'Khẳng định tinh thần thu phục lòng người, bao dung và khát vọng hợp nhất cộng đồng.',
      'Thể hiện sự do dự của Đăm Săn khi chuẩn bị rời bỏ chiến trường.',
      'Ép buộc dân làng Mtao Mxây phải nộp tô thuế hằng năm.',
    ],
    correctIndex: 1,
    feedback: 'Điệp khúc hỏi – đáp ba lần khẳng định chiến thắng của Đăm Săn hướng tới đoàn kết và phồn vinh chung chứ không hủy diệt.',
  },
  {
    id: 'q5',
    category: 'Thể loại',
    prompt: 'Không gian nghệ thuật đặc trưng thường gặp trong sử thi anh hùng là kiểu không gian nào?',
    choices: [
      'Không gian căn phòng hẹp mang tính tâm lí cá nhân khép kín.',
      'Không gian kì vĩ, rộng lớn mang tầm vóc vũ trụ, núi rừng và cộng đồng sử thi.',
      'Không gian đô thị công nghiệp hiện đại với nhịp sống gấp gáp.',
      'Không gian siêu thực hoàn toàn tách rời khỏi lịch sử và thiên nhiên.',
    ],
    correctIndex: 1,
    feedback: 'Không gian kì vĩ (đại ngàn Tây Nguyên, biển cả Địa Trung Hải, chiến trường thành Tơ-roa) là phông nền xứng tầm với người anh hùng.',
  },
  {
    id: 'q6',
    category: 'Sử thi thế giới',
    prompt: 'Trong sử thi Ra-ma-ya-na (Ấn Độ), việc Ra-ma dằn lòng thử thách Xi-ta sau chiến thắng thể hiện xung đột tư tưởng nào?',
    choices: [
      'Xung đột giữa bổn phận quân vương mẫu mực trước dư luận cộng đồng với tình yêu cá nhân.',
      'Sự ghen tuông tầm thường do hiểu lầm về tài sản hoàng cung.',
      'Mong muốn Ra-ma nhường ngôi báu lại cho người em trai.',
      'Nỗi sợ hãi trước sức mạnh phép thuật của quỷ vương Ra-va-na.',
    ],
    correctIndex: 0,
    feedback: 'Ra-ma vừa yêu thương Xi-ta vừa phải gánh trách nhiệm danh dự và chuẩn mực đạo lí (Dharma) của bậc quân vương trong sử thi Ấn Độ.',
  },
];

// Game 2: AI LÀ ANH HÙNG? (3 rounds: Work, Quality, Event)
export const HERO_MATCH_ROUNDS: HeroMatchRound[] = [
  {
    id: 'match-work',
    dimension: 'work',
    dimensionLabel: 'Vòng 1 · Ghép nhân vật với Tác phẩm',
    instruction: 'Chọn một nhân vật ở cột trái, sau đó chọn tác phẩm sử thi tương ứng ở cột phải.',
    pairs: [
      {
        id: 'mw-1',
        heroName: 'Đăm Săn',
        targetText: 'Sử thi Đăm Săn (dân tộc Ê-đê)',
        explanation: 'Đăm Săn là người anh hùng trung tâm trong sử thi Khan nổi tiếng của đồng bào Ê-đê Tây Nguyên.',
      },
      {
        id: 'mw-2',
        heroName: 'Ô-đi-xê (Odysseus)',
        targetText: 'Sử thi Ô-đi-xê (Hy Lạp cổ đại)',
        explanation: 'Ô-đi-xê là nhân vật trung tâm của thiên anh hùng ca Ô-đi-xê kể về hành trình mười năm trở về quê hương I-ta-ca.',
      },
      {
        id: 'mw-3',
        heroName: 'A-sin (Achilles)',
        targetText: 'Sử thi I-li-át (Hy Lạp cổ đại)',
        explanation: 'Cơn giận và bi kịch danh dự của chiến binh A-sin là trục trung tâm của sử thi I-li-át.',
      },
      {
        id: 'mw-4',
        heroName: 'Ra-ma (Rama)',
        targetText: 'Sử thi Ra-ma-ya-na (Ấn Độ cổ đại)',
        explanation: 'Hoàng tử Ra-ma là biểu tượng đạo lí và bổn phận trong đại sử thi Ra-ma-ya-na của Ấn Độ.',
      },
    ],
  },
  {
    id: 'match-quality',
    dimension: 'quality',
    dimensionLabel: 'Vòng 2 · Ghép nhân vật với Phẩm chất nổi bật',
    instruction: 'Nối mỗi hình tượng anh hùng với phẩm chất cốt lõi làm nên bản sắc sử thi của nhân vật.',
    pairs: [
      {
        id: 'mq-1',
        heroName: 'Đăm Săn',
        targetText: 'Thượng võ, hào sảng, trọng danh dự và khát vọng vươn tới đỉnh cao',
        explanation: 'Đăm Săn thách đấu quang minh chính đại với Mtao Mxây và dám vượt rừng tìm Nữ thần Mặt Trời.',
      },
      {
        id: 'mq-2',
        heroName: 'Ô-đi-xê',
        targetText: 'Trí tuệ mưu lược, bản lĩnh điềm tĩnh và lòng thủy chung hướng về quê hương',
        explanation: 'Ô-đi-xê vượt biển cả và cạm bẫy bằng sự tỉnh táo, mưu trí và tình yêu gia đình sâu nặng.',
      },
      {
        id: 'mq-3',
        heroName: 'Héc-to (Hector)',
        targetText: 'Dũng cảm, trách nhiệm sâu nặng với gia đình và thành Tơ-roa',
        explanation: 'Héc-to chiến đấu kiên cường để bảo vệ thành bang dù linh cảm trước kết cục nghiệt ngã.',
      },
      {
        id: 'mq-4',
        heroName: 'Xing Nhã',
        targetText: 'Hiếu thảo, kiên cường báo thù và bảo vệ danh dự dòng họ',
        explanation: 'Xing Nhã rèn luyện phi thường để rửa hận cho cha và khôi phục buôn làng.',
      },
    ],
  },
  {
    id: 'match-event',
    dimension: 'event',
    dimensionLabel: 'Vòng 3 · Ghép nhân vật với Sự kiện tiêu biểu',
    instruction: 'Kết nối từng nhân vật với sự kiện đặc trưng gắn liền tên tuổi của họ.',
    pairs: [
      {
        id: 'me-1',
        heroName: 'Đăm Săn',
        targetText: 'Ném lao trúng đùi nhưng không xuyên giáp, nhờ Trời mách kế lấy chày mòn ném vào vành tai địch',
        explanation: 'Chi tiết Trời chỉ cách dùng chày mòn đánh vào vành tai giúp Đăm Săn hạ gục áo giáp sắt của Mtao Mxây.',
      },
      {
        id: 'me-2',
        heroName: 'Pê-nê-lốp',
        targetText: 'Đưa ra phép thử dời chiếc giường gỗ ô-liu bí mật để nhận diện chồng',
        explanation: 'Nàng Pê-nê-lốp dùng kỉ vật chiếc giường liền gốc cây để kiểm chứng Ô-đi-xê thật sự trở về.',
      },
      {
        id: 'me-3',
        heroName: 'Đăm Săn (chặng Mặt Trời)',
        targetText: 'Kiên quyết quay về lúc nắng lên dù được cảnh báo rừng sáp đen sẽ tan chảy',
        explanation: 'Cuộc đối thoại và lựa chọn ra về tạo nên kết cục bi tráng ở đoạn trích Đăm Săn đi bắt Nữ thần Mặt Trời.',
      },
      {
        id: 'me-4',
        heroName: 'A-sin',
        targetText: 'Trao trả thi hài Héc-to cho vua Pri-am trong nỗi đồng cảm chung của con người',
        explanation: 'Cảnh vua Pri-am đến xin xác con đánh thức lòng trắc ẩn nhân bản trong chiến binh A-sin.',
      },
    ],
  },
];

// Game 3: DÒNG THỜI GIAN SỬ THI (Drag-and-drop chronological sequences)
export const TIMELINE_ROUNDS: TimelineRound[] = [
  {
    id: 'tl-1',
    workTitle: 'Đăm Săn chiến thắng Mtao Mxây (Sử thi Đăm Săn)',
    instruction: 'Sắp xếp 4 sự kiện sau theo đúng trình tự diễn biến của trích đoạn:',
    events: [
      { id: 'tl1-e1', order: 1, text: 'Đăm Săn đến tận chân cầu thang nhà Mtao Mxây, dõng dạc thách đối thủ xuống giao chiến.' },
      { id: 'tl1-e2', order: 2, text: 'Mtao Mxây múa khiên kêu lạch xạch; Đăm Săn múa khiên dũng mãnh làm rung chuyển núi đồi.' },
      { id: 'tl1-e3', order: 3, text: 'Được Trời mách kế, Đăm Săn dùng chày mòn ném trúng vành tai Mtao Mxây và kết liễu kẻ thù.' },
      { id: 'tl1-e4', order: 4, text: 'Đăm Săn hỏi dân làng Mtao Mxây ba lần rồi cùng đoàn người đông đúc trở về mở hội ăn mừng.' },
    ],
    explanation: 'Trình tự sử thi đi từ hành động thách đấu quang minh → giao chiến phô diễn tài năng → bước ngoặt chiến thắng → thu phục cộng đồng và lễ hội.',
  },
  {
    id: 'tl-2',
    workTitle: 'Đăm Săn đi bắt Nữ thần Mặt Trời',
    instruction: 'Sắp xếp 4 bước hành trình sau theo đúng mạch sự kiện của đoạn trích:',
    events: [
      { id: 'tl2-e1', order: 1, text: 'Đăm Săn đến gặp Đăm Par Kvây rủ đi cầu hôn Nữ thần Mặt Trời bất chấp lời khuyên can.' },
      { id: 'tl2-e2', order: 2, text: 'Chàng cưỡi ngựa băng qua rừng rậm, núi cao, thú dữ và rừng sáp đen đầy hiểm trở.' },
      { id: 'tl2-e3', order: 3, text: 'Tại nhà Nữ thần Mặt Trời, Nữ thần từ chối vì trật tự vũ trụ và cảnh báo nguy cơ nắng gắt.' },
      { id: 'tl2-e4', order: 4, text: 'Đăm Săn dứt khoát ra về ngay và lún sâu xuống vũng sáp đen đang tan chảy dưới ánh mặt trời.' },
    ],
    explanation: 'Hành trình vận động từ khát vọng vượt ngưỡng → thử thách không gian kì vĩ → đối thoại trước giới hạn → kết cục bi tráng.',
  },
  {
    id: 'tl-3',
    workTitle: 'Ô-đi-xê trở về I-ta-ca (Sử thi Ô-đi-xê)',
    instruction: 'Sắp xếp 4 sự kiện theo đúng trình tự trong phần Ô-đi-xê trở về:',
    events: [
      { id: 'tl3-e1', order: 1, text: 'Ô-đi-xê cải trang hành khất trở về cung điện và trừng trị bọn cầu hôn kiêu ngạo.' },
      { id: 'tl3-e2', order: 2, text: 'Pê-nê-lốp giữ thái độ thận trọng, chưa vội nhận chồng ngay dù nhũ mẫu Ơ-ri-clê báo tin.' },
      { id: 'tl3-e3', order: 3, text: 'Nàng thử thách bằng lời đề nghị khiêng chiếc giường gỗ ô-liu ra ngoài phòng ngủ.' },
      { id: 'tl3-e4', order: 4, text: 'Ô-đi-xê kể lại bí mật gốc cây ô-liu làm nên chiếc giường, hai vợ chồng chính thức đoàn tụ.' },
    ],
    explanation: 'Hành trình hồi hương không chỉ kết thúc bằng vũ lực mà được hoàn tất bằng cuộc đấu trí và sự đồng điệu tâm hồn.',
  },
];

// Game 4: MẢNH GHÉP BÍ ẨN (Unlock 4 tiles -> match image with cultural/literary info)
export const MYSTERY_PUZZLES: MysteryPuzzleItem[] = [
  {
    id: 'mp-1',
    title: 'Bức tranh sử thi 01',
    imagePath: '/src/assets/images/sun_goddess_palace_epic_1794540838277.jpg',
    imageAlt: 'Cung điện Nữ thần Mặt Trời trên đỉnh núi Tây Nguyên trong ánh bình minh',
    cultureLabel: 'Sử thi Đăm Săn · Chặng cuối hành trình',
    tileQuestions: [
      {
        id: 'mp1-t1',
        prompt: 'Mảnh ghép 1: Khi đến gặp Đăm Par Kvây, Đăm Săn rủ bạn đi thực hiện việc gì?',
        choices: [
          'Đi săn voi trắng bên bờ sông Sê-rê-pốk.',
          'Đi bắt Nữ thần Mặt Trời về làm vợ.',
          'Đi đúc thêm một bộ cồng chiêng lớn.',
          'Đi dựng nhà dài mới bên sườn núi.',
        ],
        correctIndex: 1,
        explanation: 'Chính khát vọng chinh phục Nữ thần Mặt Trời mở đầu cho hành trình kì vĩ và bi tráng này.',
      },
      {
        id: 'mp1-t2',
        prompt: 'Mảnh ghép 2: Chướng ngại vật đặc biệt nguy hiểm khi trời nắng lên trên đường đi – về là gì?',
        choices: [
          'Dòng sông băng giá đóng băng.',
          'Cánh đồng cỏ lau bốc cháy.',
          'Khu rừng sáp đen có thể tan chảy thành vũng sáp.',
          'Thành đá cao vút không có cổng vào.',
        ],
        correctIndex: 2,
        explanation: 'Rừng sáp đen là ranh giới chết chóc giữa cõi người và cõi thần khi mặt trời lên cao.',
      },
      {
        id: 'mp1-t3',
        prompt: 'Mảnh ghép 3: Vì sao Nữ thần Mặt Trời từ chối theo Đăm Săn?',
        choices: [
          'Vì nàng chê Đăm Săn không mang đủ sính lễ chiêng ché.',
          'Vì nếu nàng rời bỏ bầu trời, mặt đất sẽ tăm tối và muôn loài sẽ chết.',
          'Vì nàng đã hứa hôn với Mtao Mxây từ trước.',
          'Vì đường xuống buôn làng quá xa xôi.',
        ],
        correctIndex: 1,
        explanation: 'Lời từ chối đặt trên quy luật sống còn của vũ trụ và sự sống muôn loài.',
      },
      {
        id: 'mp1-t4',
        prompt: 'Mảnh ghép 4: Kết cục của Đăm Săn gợi lên cảm hứng thẩm mĩ nào?',
        choices: [
          'Cảm hứng trào phúng, châm biếm nhẹ nhàng.',
          'Cảm hứng bi tráng về khát vọng lớn lao đối diện giới hạn tự nhiên.',
          'Cảm hứng đời tư gia đình hiện đại.',
          'Cảm hứng ngụ ngôn khuyên bảo về kinh doanh.',
        ],
        correctIndex: 1,
        explanation: 'Vẻ đẹp bi tráng là dấu ấn nghệ thuật độc đáo của chặng cuối sử thi Đăm Săn.',
      },
    ],
    matchQuestion: 'Bức tranh vừa mở khóa trọn vẹn biểu tượng cho không gian nào sau đây?',
    matchOptions: [
      'Cung điện thành Tơ-roa trong sử thi I-li-át.',
      'Cung điện Nữ thần Mặt Trời trên đỉnh thiêng – đích đến khát vọng của Đăm Săn.',
      'Kinh thành A-yô-đi-a trong sử thi Ra-ma-ya-na.',
      'Đảo Ô-gi-gi của nữ thần Ca-líp-xô trong Ô-đi-xê.',
    ],
    correctMatchIndex: 1,
    summaryFact: 'Đây là điểm cuối trong hành trình “Đăm Săn đi bắt Nữ thần Mặt Trời” – nơi người anh hùng đối diện quy luật vũ trụ.',
  },
  {
    id: 'mp-2',
    title: 'Bức tranh sử thi 02',
    imagePath: '/src/assets/images/world_epics_odyssey_1794539120237.jpg',
    imageAlt: 'Không gian sử thi thế giới với thuyền cổ Hy Lạp và phù điêu cổ đại',
    cultureLabel: 'Sử thi Thế giới · Hy Lạp & Ấn Độ',
    tileQuestions: [
      {
        id: 'mp2-t1',
        prompt: 'Mảnh ghép 1: Quê hương mà người anh hùng Ô-đi-xê luôn khao khát trở về sau chiến tranh Tơ-roa là đâu?',
        choices: [
          'Đảo I-ta-ca.',
          'Thành Ba-bi-lon.',
          'Sông Hằng.',
          'Núi Chư Prông.',
        ],
        correctIndex: 0,
        explanation: 'Mười năm lênh đênh trên biển của Ô-đi-xê đều hướng về hòn đảo I-ta-ca.',
      },
      {
        id: 'mp2-t2',
        prompt: 'Mảnh ghép 2: Nghệ nhân hát kể sử thi vĩ đại được truyền tụng là tác giả của I-li-át và Ô-đi-xê là ai?',
        choices: [
          'Van-mi-ki.',
          'Hô-me-rơ (Homer).',
          'Vơ-gin.',
          'Xô-phốc.',
        ],
        correctIndex: 1,
        explanation: 'Hô-me-rơ là tác giả truyền thuyết của hai bộ sử thi nền tảng văn học châu Âu: I-li-át và Ô-đi-xê.',
      },
      {
        id: 'mp2-t3',
        prompt: 'Mảnh ghép 3: Phẩm chất nổi bật nhất giúp Ô-đi-xê thoát khỏi các cạm bẫy biển cả là gì?',
        choices: [
          'Trí tuệ sắc sảo, mưu trí và bản lĩnh kiên định.',
          'Sức mạnh chạy nhanh hơn gió bão.',
          'Sự giàu có để mua chuộc thần biển.',
          'Khả năng tàng hình bẩm sinh.',
        ],
        correctIndex: 0,
        explanation: 'Ô-đi-xê là mẫu hình “con người trí tuệ” của văn hóa Hy Lạp cổ đại.',
      },
      {
        id: 'mp2-t4',
        prompt: 'Mảnh ghép 4: Khi đối chiếu Ô-đi-xê và Đăm Săn, điểm chung lớn nhất của cả hai tác phẩm là gì?',
        choices: [
          'Đều lấy bối cảnh chiến trường biển Địa Trung Hải.',
          'Đều tôn vinh phẩm chất anh hùng gắn với danh dự, trí tuệ và cộng đồng.',
          'Đều được viết bằng văn xuôi chữ Quốc ngữ thế kỉ XX.',
          'Đều kết thúc bằng việc nhân vật từ bỏ quê hương.',
        ],
        correctIndex: 1,
        explanation: 'Dù khác không gian văn hóa (biển cả vs đại ngàn), cả hai thiên sử thi đều ca ngợi tầm vóc và lí tưởng cộng đồng.',
      },
    ],
    matchQuestion: 'Hãy ghép bức tranh vừa mở khóa với bộ sử thi tương ứng:',
    matchOptions: [
      'Thuyền vượt biển của Ô-đi-xê (Hy Lạp) & đối thoại văn minh sử thi thế giới.',
      'Sử thi Đẻ đất đẻ nước của dân tộc Mường.',
      'Truyện thơ Tiễn dặn người yêu của dân tộc Thái.',
      'Truyền thuyết Sơn Tinh – Thủy Tinh.',
    ],
    correctMatchIndex: 0,
    summaryFact: 'Hình ảnh con thuyền Địa Trung Hải gắn với hành trình hồi hương đầy trí tuệ trong sử thi Ô-đi-xê.',
  },
];

// Game 5: THỬ THÁCH DẪN CHỨNG
export const EVIDENCE_CHALLENGES: EvidenceChallengeItem[] = [
  {
    id: 'ev-1',
    workTitle: 'Đăm Săn chiến thắng Mtao Mxây',
    claim: 'Đăm Săn là người anh hùng trọng danh dự và có tinh thần thượng võ cao đẹp.',
    evidenceChoices: [
      'Đăm Săn đến tận chân cầu thang nhà Mtao Mxây, đường hoàng gọi đối thủ xuống đấu tay đôi và từ chối đâm khi đối thủ quay lưng.',
      'Đăm Săn tổ chức ăn uống linh đình tại buôn làng trước khi mặt trời mọc.',
      'Dân làng Đăm Săn mang nhiều chiêng quý đến trao đổi với các buôn lân cận.',
      'Ngựa của Đăm Săn chạy chậm hơn ngựa của Đăm Par Kvây khi qua suối.',
    ],
    correctIndex: 0,
    rubricKeywords: ['thách đấu', 'quay lưng', 'quang minh', 'danh dự', 'thượng võ', 'cầu thang'],
    explanation: 'Hành động thách đấu trực diện và không đánh lén sau lưng là bằng chứng xác thực nhất cho tinh thần thượng võ.',
  },
  {
    id: 'ev-2',
    workTitle: 'Đăm Săn đi bắt Nữ thần Mặt Trời',
    claim: 'Đăm Săn sở hữu ý chí dấn thân phi thường, dám đối diện hiểm nguy vì khát vọng lớn.',
    evidenceChoices: [
      'Đăm Săn ở lại nhà Đăm Par Kvây đợi hết mùa mưa rồi mới bàn chuyện đi xa.',
      'Dù Đăm Par Kvây cảnh báo đường đến nhà Nữ thần đầy rừng sáp đen chết người, Đăm Săn vẫn kiên quyết lên đường.',
      'Đăm Săn nhờ bà con trong buôn đào giếng nước tránh hạn hán.',
      'Nữ thần Mặt Trời cử sứ giả mang lễ vật sang buôn của Đăm Săn.',
    ],
    correctIndex: 1,
    rubricKeywords: ['can ngăn', 'rừng sáp', 'kiên quyết', 'khát vọng', 'hiểm nguy', 'nữ thần'],
    explanation: 'Sự tương phản giữa lời cảnh báo cái chết với quyết tâm lên đường thể hiện rõ ý chí phi thường.',
  },
  {
    id: 'ev-3',
    workTitle: 'Sử thi Ô-đi-xê (Hô-me-rơ)',
    claim: 'Vẻ đẹp của Pê-nê-lốp không chỉ ở lòng thủy chung mà còn ở sự thận trọng, sắc sảo về trí tuệ.',
    evidenceChoices: [
      'Pê-nê-lốp chạy ùa ra ôm lấy Ô-đi-xê ngay khi nhũ mẫu vừa cất tiếng báo tin.',
      'Pê-nê-lốp yêu cầu nhũ mẫu mang vàng bạc ra ban thưởng cho toàn bộ người hầu.',
      'Nàng thử thách Ô-đi-xê bằng cách đề nghị dời chiếc giường vốn được đẽo liền từ gốc cây ô-liu bất di bất dịch.',
      'Pê-nê-lốp rời bỏ cung điện I-ta-ca đi tìm chồng ở thành Tơ-roa.',
    ],
    correctIndex: 2,
    rubricKeywords: ['chiếc giường', 'ô-liu', 'thử thách', 'bí mật', 'thận trọng', 'trí tuệ'],
    explanation: 'Phép thử chiếc giường cây ô-liu vừa kiểm chứng danh tính vừa khẳng định bản lĩnh trí tuệ của Pê-nê-lốp.',
  },
];

// Game 6: ĐỐI THOẠI SỬ THI
export const DIALOGUE_SCENARIOS: DialogueScenarioItem[] = [
  {
    id: 'dlg-1',
    title: 'Tình huống 1 · Khi khát vọng chạm giới hạn',
    workTitle: 'Đăm Săn đi bắt Nữ thần Mặt Trời',
    situation:
      'Một bạn học sinh cho rằng: “Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ thần Mặt Trời để rồi lún sâu trong rừng sáp đen là một sự thất bại vô nghĩa.”',
    openQuestion:
      'Em có đồng tình với ý kiến đó không? Hãy viết quan điểm phản biện của em (khoảng 3–5 câu), lí giải giá trị biểu tượng của lựa chọn ấy.',
    coreDimensions: [
      'Phân biệt giữa “thất bại thể xác” và “chiến thắng tinh thần / vẻ đẹp bi tráng” của anh hùng sử thi.',
      'Đặt hành động của Đăm Săn trong khát vọng vươn tới ánh sáng, tầm vóc của cộng đồng Ê-đê.',
      'Bài học hai chiều cho người trẻ hôm nay: dám mơ lớn nhưng vẫn biết nhận thức giới hạn tự nhiên.',
    ],
  },
  {
    id: 'dlg-2',
    title: 'Tình huống 2 · Chiến thắng để thống nhất hay hủy diệt?',
    workTitle: 'Chiến thắng Mtao Mxây',
    situation:
      'Sau khi hạ gục kẻ thù đã cướp vợ mình là Mtao Mxây, Đăm Săn không cướp phá hay tàn sát dân làng bên kia mà kiên nhẫn gõ cửa hỏi họ ba lần cùng về chung một buôn.',
    openQuestion:
      'Chi tiết này cho em suy nghĩ gì về quan niệm “sức mạnh đích thực” của người lãnh đạo cộng đồng trong sử thi và trong đời sống hôm nay?',
    coreDimensions: [
      'Sức mạnh thu phục lòng người (nhân nghĩa, bao dung) lớn hơn sức mạnh vũ lực áp đặt.',
      'Lí tưởng hòa hợp cộng đồng, xây dựng sự giàu mạnh chung trong sử thi Tây Nguyên.',
      'Liên hệ cách ứng xử văn minh, tôn trọng tập thể trong môi trường học đường lớp 10.',
    ],
  },
  {
    id: 'dlg-3',
    title: 'Tình huống 3 · Bản lĩnh người giữ lửa trí tuệ',
    workTitle: 'Sử thi Ô-đi-xê',
    situation:
      'Trong thời đại bùng nổ tin giả và thông tin nhanh, nhiều người dễ tin vội chỉ qua một lời đồn, còn nàng Pê-nê-lốp lại giữ sự điềm tĩnh kiểm chứng cho tới tận phép thử chiếc giường cây ô-liu.',
    openQuestion:
      'Từ thái độ của Pê-nê-lốp, em rút ra bài học nào về sự tỉnh táo khi tiếp nhận thông tin và giữ gìn niềm tin trong cuộc sống hiện đại?',
    coreDimensions: [
      'Tư duy phản biện và kiểm chứng bằng căn cứ đáng tin cậy trước khi kết luận.',
      'Sự cân bằng giữa tình cảm chân thành và lí trí tỉnh táo.',
      'Giá trị vượt thời gian của trí tuệ nhân văn từ sử thi cổ đại đến công dân số.',
    ],
  },
];

export const STEM_MISSION_01_HOUSE: StemHouseMission = {
  code: 'NHIỆM VỤ STEM 01',
  title: 'THIẾT KẾ MÔ HÌNH NHÀ DÀI Ê-ĐÊ',
  subtitle:
    'Vận dụng kiến thức Ngữ văn 10 kết hợp nguyên lí kết cấu – tỉ lệ – vật liệu để tạo mô hình nhà dài phục vụ thuyết trình và trưng bày bảo tàng lớp học.',
  imagePath: '/src/assets/images/zone_stem_studio_1794539494969.jpg',
  imageAlt: 'Không gian mô hình nhà dài Ê-đê trong xưởng sáng tạo STEM học đường',
  objective:
    'Học sinh thiết kế và chế tạo được mô hình nhà dài Ê-đê phản ánh đúng cấu trúc sàn nâng – cột trụ – mái dốc – cầu thang truyền thống, qua đó hiểu rõ mối quan hệ giữa không gian kiến trúc với sinh hoạt cộng đồng và diễn xướng sử thi Tây Nguyên.',
  culturalKnowledge: [
    'Cấu trúc nhà sàn dài theo chế độ mẫu hệ của đồng bào Ê-đê: mở rộng chiều dài theo các thế hệ con gái nối tiếp trong đại gia đình.',
    'Không gian sinh hoạt bên trong gồm phần khách (Gah – nơi tiếp đón khách, đặt chiêng ché, kể khan/sử thi quanh bếp lửa) và phần sinh hoạt gia đình (Ôk).',
    'Hệ thống cầu thang đẽo gỗ hai đầu hồi (cầu thang cái thường chạm khắc hình ảnh bầu sữa mẹ và vầng trăng khuyết biểu trưng cho truyền thống mẫu hệ).',
    'Kết cấu sàn nâng cao khỏi mặt đất giúp chống ẩm, tránh thú dữ và tạo mái dốc thoát nước mưa đặc trưng khí hậu cao nguyên.',
  ],
  suggestedMaterials: [
    { name: 'Bìa carton', usageNote: 'Làm khung sàn, vách thưng và mái dốc chính chắc chắn, dễ cắt ghép.' },
    { name: 'Que gỗ', usageNote: 'Dựng hệ thống cột chống chịu lực, dầm ngang, lan can sàn và bậc cầu thang.' },
    { name: 'Giấy màu', usageNote: 'Tạo hoa văn thổ cẩm, trang trí chiêng ché, bếp lửa và bảng chú thích.' },
    { name: 'Vật liệu tái chế', usageNote: 'Ống hút giấy, hộp giấy cũ, sợi dây thừng nhỏ, cành khô tạo cảnh quan quanh nhà.' },
    { name: 'Keo dán', usageNote: 'Keo sữa hoặc keo nến (sử dụng an toàn dưới hướng dẫn giáo viên) để liên kết khung cột.' },
    { name: 'Màu trang trí', usageNote: 'Màu nước/acrylic phủ tông nâu gỗ trầm, đen than và điểm nhấn đỏ – vàng Tây Nguyên.' },
  ],
  designProcess: [
    {
      phase: '01 · Đặt vấn đề & Quan sát',
      summary: 'Đối chiếu không gian nhà dài trong sử thi Đăm Săn và Bảo tàng 3D để xác định các bộ phận bắt buộc phải có.',
    },
    {
      phase: '02 · Bản vẽ & Tỉ lệ',
      summary: 'Phác thảo mặt bằng hình chữ nhật kéo dài, quy ước tỉ lệ kích thước (ví dụ 1:50) và tính số lượng cột đỡ.',
    },
    {
      phase: '03 · Lựa chọn vật liệu',
      summary: 'Ưu tiên vật liệu tái chế nhẹ, dễ tìm, phân công nguyên vật liệu bền vững giữa các thành viên nhóm.',
    },
    {
      phase: '04 · Thi công & Kiểm thử',
      summary: 'Lắp ghép khung cột – sàn – mái – cầu thang, kiểm tra độ thăng bằng và khả năng chịu lực của sàn nâng.',
    },
  ],
  fabricationSteps: [
    {
      stepNumber: 1,
      title: 'Tìm hiểu tư liệu về nhà dài Ê-đê',
      detail: 'Ghi chú lại công năng của Gah, Ôk, bếp lửa, ghế Kpan, chiêng ché và ý nghĩa hoa văn cầu thang đực – cái.',
    },
    {
      stepNumber: 2,
      title: 'Phác thảo thiết kế',
      detail: 'Vẽ phác mặt đứng, mặt cắt ngang và sơ đồ bố trí các cột chịu lực trên giấy A4 trước khi cắt vật liệu.',
    },
    {
      stepNumber: 3,
      title: 'Xác định vật liệu',
      detail: 'Chuẩn bị bìa carton, que gỗ, giấy màu, vật liệu tái chế, keo dán và màu trang trí theo danh mục đã tính.',
    },
    {
      stepNumber: 4,
      title: 'Chế tạo mô hình',
      detail: 'Lắp đế – dựng hàng cột – cố định sàn nâng – dựng khung vì kèo mái dốc – hoàn thiện cầu thang và nội thất minh họa.',
    },
    {
      stepNumber: 5,
      title: 'Hoàn thiện và kiểm tra',
      detail: 'Thử nghiệm độ đứng vững của mô hình, dán thẻ tên bộ phận, gắn mã QR liên kết tới trang trưng bày số của nhóm.',
    },
    {
      stepNumber: 6,
      title: 'Thuyết minh ý tưởng',
      detail: 'Chuẩn bị bài nói 3–5 phút và chụp ảnh/đăng tải sản phẩm lên bảng Padlet “Bảo tàng của chúng em”.',
    },
  ],
  evaluationCriteria: [
    'Thể hiện chính xác đặc trưng kiến trúc cơ bản của nhà dài Ê-đê (sàn cao, mái dốc, không gian Gah – Ôk, cầu thang).',
    'Kết cấu mô hình đứng vững, cân đối tỉ lệ, đường dán sạch sẽ và tận dụng hiệu quả vật liệu tái chế.',
    'Liên kết được mô hình với bối cảnh sử thi Đăm Săn (lễ hội ăn mừng chiến thắng, không gian diễn xướng khan).',
    'Nhóm trình bày mạch lạc, tự tin, giải đáp được câu hỏi phản biện từ giáo viên và các nhóm khác.',
  ],
  presentationRequirements: [
    'Giới thiệu tên nhóm/mã nhóm, tỉ lệ ước lượng và các vật liệu tái chế đã sử dụng.',
    'Chỉ rõ vị trí từng bộ phận trên mô hình thật (sàn nâng, hệ cột, cầu thang, gian khách Gah, bếp lửa).',
    'Nêu một chi tiết trong sử thi Đăm Săn gắn với không gian nhà dài (ví dụ cảnh đánh chiêng, mời khách, mở hội).',
    'Dán nhãn mã QR tải từ Xưởng sáng tạo lên đế mô hình để người xem quét mở trang trưng bày Padlet.',
  ],
};

export const STEM_MISSION_02_JOURNEY: StemJourneyMission = {
  code: 'NHIỆM VỤ STEM 02',
  title: 'THIẾT KẾ CON ĐƯỜNG ĐẾN NỮ THẦN MẶT TRỜI',
  subtitle:
    'Chuyển hóa mạch tự sự đoạn trích “Đăm Săn đi bắt Nữ thần Mặt Trời” thành bản đồ hành trình sáng tạo kết hợp đọc hiểu sử thi.',
  imagePath: '/src/assets/images/dam_san_forest_mountains_1794540838440.jpg',
  imageAlt: 'Bản đồ hành trình vượt đại ngàn hướng tới đỉnh núi Nữ thần Mặt Trời',
  objective:
    'Giúp học sinh hệ thống hóa trọn vẹn diễn biến cốt truyện, hình tượng nhân vật và giá trị biểu tượng của đoạn trích “Đăm Săn đi bắt Nữ thần Mặt Trời” thông qua sản phẩm bản đồ trực quan (vật lí hoặc sản phẩm số).',
  requiredComponents: [
    {
      title: '1. Bốn trạm hành trình rõ ràng',
      requirement:
        'Thể hiện đầy đủ 4 trạm nối tiếp nhau: Trạm 1 – Khát vọng lên đường; Trạm 2 – Vượt qua thử thách; Trạm 3 – Trước Nữ thần Mặt Trời; Trạm 4 – Vẻ đẹp bi tráng của người anh hùng.',
    },
    {
      title: '2. Hệ thống nhân vật tiêu biểu',
      requirement:
        'Làm nổi bật Đăm Săn (trung tâm), Đăm Par Kvây (người can ngăn) và Nữ thần Mặt Trời (biểu tượng quy luật vũ trụ).',
    },
    {
      title: '3. Sự kiện cốt lõi từng chặng',
      requirement:
        'Tóm lược mạch sự kiện chính: lời rủ đi – vượt rừng gai, núi cao, rừng sáp đen – cuộc đối thoại cầu hôn – lựa chọn quay về lúc nắng gắt.',
    },
    {
      title: '4. Hình ảnh minh họa sinh động',
      requirement:
        'Có tranh vẽ tay, cắt dán mô hình nổi 3D (núi rừng, mặt trời, ngựa chiến, rừng sáp đen) hoặc đồ họa minh họa rõ nét.',
    },
    {
      title: '5. Các thử thách đọc hiểu đi kèm',
      requirement:
        'Thiết kế tối thiểu 1 câu hỏi/thẻ thử thách lật mở tại mỗi trạm để bạn đọc tương tác kiểm tra kiến thức sử thi.',
    },
    {
      title: '6. Phần giải thích ý nghĩa từng trạm',
      requirement:
        'Có khung chú giải ngắn gọn phân tích giá trị nghệ thuật (phóng đại, không gian kì vĩ) và ý nghĩa bi tráng ở mỗi trạm.',
    },
  ],
  creativeFormats: [
    {
      format: 'Bìa cứng / Mô hình nổi 3D (Diorama)',
      examples: 'Dựng địa hình dốc từ bìa carton nhiều lớp, đường mòn dây thừng dẫn lên đỉnh Mặt Trời có thẻ gài từng trạm.',
    },
    {
      format: 'Giấy mỹ thuật / Bản đồ gấp Pop-up',
      examples: 'Sổ tay bản đồ khổ A2/A3 gập mở các cửa sổ bí mật chứa thử thách đọc hiểu và lời giải thích.',
    },
    {
      format: 'Vật liệu tái chế',
      examples: 'Tận dụng nắp chai, vỏ hộp giấy, cành cây khô, giấy báo cũ tạo rừng sáp đen và dãy núi Tây Nguyên.',
    },
    {
      format: 'Sản phẩm số tương tác',
      examples: 'Bản đồ tương tác bằng Canva, Genially, PowerPoint siêu liên kết hoặc infographic gắn mã QR kèm sản phẩm giấy.',
    },
  ],
  implementationSteps: [
    {
      stepNumber: 1,
      title: 'Ôn lại 4 trạm trong phân khu Theo dấu Đăm Săn',
      detail: 'Chốt lại chi tiết văn bản, nhân vật và ý nghĩa từng trạm để bảo đảm không sai lệch nội dung tác phẩm.',
    },
    {
      stepNumber: 2,
      title: 'Chọn hình thức bản đồ & phân chia tuyến đường',
      detail: 'Quy hoạch bố cục đường đi từ buôn làng qua đại ngàn đến cung điện Mặt Trời sao cho cân đối.',
    },
    {
      stepNumber: 3,
      title: 'Tích hợp hình minh họa, câu hỏi thử thách & phần giải thích',
      detail: 'Mỗi trạm gắn bộ 3 thẻ: Tóm tắt sự kiện – Thử thách đọc hiểu – Giải mã ý nghĩa.',
    },
    {
      stepNumber: 4,
      title: 'Chụp ảnh / xuất liên kết và nộp lên Padlet nhóm Hành trình',
      detail: 'Đăng sản phẩm lên bảng Padlet “Sản phẩm hành trình Đăm Săn” kèm tên nhóm/mã nhóm rõ ràng.',
    },
  ],
  presentationRequirements: [
    'Dẫn dắt người nghe đi qua trọn vẹn 4 trạm theo đúng mạch thời gian và không gian của đoạn trích.',
    'Mời lớp trả lời thử thách đọc hiểu tại ít nhất 1 trạm trên bản đồ của nhóm mình.',
    'Làm rõ thông điệp bi tráng và khát vọng vươn tới đỉnh cao của con người Tây Nguyên xưa.',
  ],
};

export const STEM_FOUR_LEVEL_RUBRIC: StemRubricCriterion[] = [
  {
    id: 'rubric-content',
    orderNumber: '01',
    criterionName: 'Đúng nội dung văn hóa, văn học',
    weightLabel: 'Kiến thức nền tảng Ngữ văn & Văn hóa',
    levels: {
      chua_dat: {
        label: 'Chưa đạt',
        scorePoints: 1,
        descriptor:
          'Thiếu các bộ phận hoặc trạm sự kiện cơ bản; thông tin về kiến trúc nhà dài Ê-đê hoặc cốt truyện Đăm Săn còn sai lệch nhiều.',
      },
      dat: {
        label: 'Đạt',
        scorePoints: 2,
        descriptor:
          'Thể hiện đúng các yếu tố chính của nhà dài hoặc đủ 4 trạm hành trình Đăm Săn; còn một vài chi tiết chú thích chưa sâu.',
      },
      kha: {
        label: 'Khá',
        scorePoints: 3,
        descriptor:
          'Đảm bảo chính xác chi tiết văn hóa Tây Nguyên và mạch sự kiện văn bản; giải thích được ý nghĩa biểu tượng của nhân vật/không gian.',
      },
      tot: {
        label: 'Tốt',
        scorePoints: 4,
        descriptor:
          'Chính xác tuyệt đối, giàu chiều sâu văn hóa – văn học; lồng ghép khéo léo dẫn chứng sử thi và thử thách đọc hiểu sắc sảo.',
      },
    },
  },
  {
    id: 'rubric-creativity',
    orderNumber: '02',
    criterionName: 'Tính sáng tạo và thẩm mỹ',
    weightLabel: 'Thiết kế thị giác & Nghệ thuật trình bày',
    levels: {
      chua_dat: {
        label: 'Chưa đạt',
        scorePoints: 1,
        descriptor:
          'Sản phẩm sơ sài, rời rạc, màu sắc thiếu hài hòa hoặc chỉ sao chép máy móc mẫu có sẵn.',
      },
      dat: {
        label: 'Đạt',
        scorePoints: 2,
        descriptor:
          'Bố cục rõ ràng, sạch sẽ, hoàn thiện đầy đủ phần hình ảnh minh họa theo yêu cầu tối thiểu.',
      },
      kha: {
        label: 'Khá',
        scorePoints: 3,
        descriptor:
          'Phối hợp màu sắc mang âm hưởng Tây Nguyên hài hòa, có điểm nhấn sáng tạo trong cách tạo hình hoặc thẻ lật mở.',
      },
      tot: {
        label: 'Tốt',
        scorePoints: 4,
        descriptor:
          'Thiết kế ấn tượng, giàu tính nghệ thuật sử thi, cách thể hiện độc đáo (mô hình nổi, pop-up, chất liệu bản địa hoặc sản phẩm số tinh tế).',
      },
    },
  },
  {
    id: 'rubric-stem',
    orderNumber: '03',
    criterionName: 'Khả năng vận dụng kiến thức STEM',
    weightLabel: 'Kết cấu, tỉ lệ, vật liệu & Công nghệ số',
    levels: {
      chua_dat: {
        label: 'Chưa đạt',
        scorePoints: 1,
        descriptor:
          'Mô hình thiếu ổn định, dễ đổ sập; chưa chú ý tỉ lệ hoặc chưa gắn được liên kết số / quy trình thiết kế.',
      },
      dat: {
        label: 'Đạt',
        scorePoints: 2,
        descriptor:
          'Kết cấu đứng vững cơ bản, biết sử dụng vật liệu tái chế phù hợp và thực hiện theo đủ các bước chế tạo.',
      },
      kha: {
        label: 'Khá',
        scorePoints: 3,
        descriptor:
          'Tính toán tỉ lệ hợp lí, xử lí kết cấu cột – sàn – mái hoặc bố cục bản đồ chắc chắn; tích hợp mã QR đúng quy chuẩn.',
      },
      tot: {
        label: 'Tốt',
        scorePoints: 4,
        descriptor:
          'Vận dụng xuất sắc nguyên lí chịu lực, tối ưu vật liệu tái chế bền đẹp, kèm bản phác thảo tỉ lệ khoa học và tích hợp QR – Padlet mượt mà.',
      },
    },
  },
  {
    id: 'rubric-presentation',
    orderNumber: '04',
    criterionName: 'Khả năng thuyết minh và trình bày',
    weightLabel: 'Giao tiếp, phản biện & Hợp tác nhóm',
    levels: {
      chua_dat: {
        label: 'Chưa đạt',
        scorePoints: 1,
        descriptor:
          'Thuyết minh rời rạc, đọc nguyên văn giấy ghi chép, chưa phân công rõ ràng hoặc chưa trả lời được câu hỏi.',
      },
      dat: {
        label: 'Đạt',
        scorePoints: 2,
        descriptor:
          'Trình bày đủ ý chính theo cấu trúc yêu cầu, giới thiệu được sản phẩm trên mô hình hoặc Padlet.',
      },
      kha: {
        label: 'Khá',
        scorePoints: 3,
        descriptor:
          'Diễn đạt trôi chảy, kết hợp chỉ dẫn trực tiếp trên sản phẩm, thể hiện sự phối hợp nhịp nhàng giữa các thành viên.',
      },
      tot: {
        label: 'Tốt',
        scorePoints: 4,
        descriptor:
          'Thuyết minh truyền cảm, làm chủ không gian lớp học, tương tác lôi cuốn với người nghe và phản biện thuyết phục dựa trên dẫn chứng.',
      },
    },
  },
];

export const STEM_QR_PRESETS: StemQrTargetPreset[] = [
  {
    id: 'qr-house',
    label: 'Nhiệm vụ STEM nhà dài',
    shortTag: 'STEM 01 · Nhà dài Ê-đê',
    description: 'Quét mã để mở thẳng hướng dẫn thiết kế, vật liệu và các bước chế tạo mô hình nhà dài Ê-đê.',
    stemTab: 'house',
    fileSlug: 'qr-nhiem-vu-stem-nha-dai',
  },
  {
    id: 'qr-journey',
    label: 'Nhiệm vụ hành trình Đăm Săn',
    shortTag: 'STEM 02 · Con đường Mặt Trời',
    description: 'Quét mã để mở yêu cầu thiết kế bản đồ Con đường đến Nữ thần Mặt Trời (4 trạm, thử thách, ý nghĩa).',
    stemTab: 'journey',
    fileSlug: 'qr-nhiem-vu-hanh-trinh-dam-san',
  },
  {
    id: 'qr-gallery',
    label: 'Trang trưng bày sản phẩm',
    shortTag: 'Padlet · Bảo tàng của chúng em',
    description: 'Quét mã đặt trên mô hình vật lí để mở trực tiếp khu vực trưng bày Padlet “Bảo tàng của chúng em”.',
    stemTab: 'gallery',
    fileSlug: 'qr-trang-trung-bay-san-pham',
  },
];

export const STEM_TEMPLATES: StemProjectTemplate[] = [
  {
    id: 'stem-longhouse',
    title: 'Mô hình Nhà dài Ê-đê thích ứng địa hình dốc',
    disciplinaryLink: 'Văn học · Kiến trúc · Vật lý kết cấu',
    description:
      'Nghiên cứu hệ cột sàn, mái dốc thoát mưa gió Tây Nguyên và mối liên hệ với không gian diễn xướng sử thi trong bài học Ngữ văn 10.',
    deliverables: ['Bản vẽ tỉ lệ 1:50', 'Thuyết minh kết cấu chịu lực', 'Mã QR gắn trực tiếp lên mô hình'],
    materialHint: 'Que gỗ, bìa carton, giấy màu, vật liệu tái chế.',
  },
  {
    id: 'stem-sun-journey',
    title: 'Bản đồ Con đường đến Nữ thần Mặt Trời',
    disciplinaryLink: 'Ngữ văn · Mỹ thuật · Tư duy hệ thống',
    description:
      'Thiết kế bản đồ 4 trạm hành trình Đăm Săn bằng bìa, giấy, vật liệu tái chế hoặc sản phẩm số kèm thử thách đọc hiểu.',
    deliverables: ['Bản đồ 4 trạm có minh họa', 'Bộ thẻ câu hỏi đọc hiểu', 'Chú giải ý nghĩa từng trạm'],
    materialHint: 'Bìa cứng, giấy màu, dây thừng hoặc Canva/Genially.',
  },
  {
    id: 'stem-qr-exhibition',
    title: 'Thẻ hiện vật Bảo tàng sử thi tích hợp mã QR',
    disciplinaryLink: 'Ngữ văn · Mỹ thuật · Công nghệ số',
    description:
      'In mã QR từ Xưởng sáng tạo đặt trực tiếp bên cạnh mô hình vật lí để kết nối tới không gian trưng bày Padlet của lớp.',
    deliverables: ['Nhãn mã QR in giấy cứng', 'Liên kết trực tiếp tới Padlet lớp', 'Bài thuyết minh nhóm'],
    materialHint: 'Giấy cứng A5/A6 và tem mã QR tải trực tiếp dạng PNG.',
  },
];
