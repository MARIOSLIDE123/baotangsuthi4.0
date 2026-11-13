import {
  CompassClaim,
  CompassTextDetail,
  JourneyMilestone,
  SunGoddessStation,
} from '../types/museum';

export const SUN_GODDESS_STATIONS: SunGoddessStation[] = [
  {
    id: 'stage-1',
    stepNumber: 1,
    shortName: 'Trạm 1 · Khát vọng lên đường',
    title: 'Trạm 1 – KHÁT VỌNG LÊN ĐƯỜNG',
    emblemType: 'torch',
    locationLabel: 'Cổng buôn đại ngàn · Điểm khởi hành bình minh',
    objective: 'Tìm hiểu động lực hành động và khát vọng của Đăm Săn.',
    tasksChecklist: [
      'Xác định mục đích chuyến đi.',
      'Nhận diện khát vọng của nhân vật.',
      'Tìm chi tiết văn bản thể hiện động lực hành động.',
      'Lí giải ý nghĩa của hành động.',
    ],
    imagePath: '/src/assets/images/dam_san_epic_journey_1794539119260.jpg',
    imageAlt: 'Đăm Săn chuẩn bị hành trình từ buôn làng hướng về núi cao phía mặt trời',
    studySummary:
      'Trong sử thi Đăm Săn (đoạn trích Đăm Săn đi bắt Nữ thần Mặt Trời), sau khi đã trở thành tù trưởng lừng danh, giàu có và chiến thắng các tù trưởng khác, Đăm Săn quyết định cưỡi ngựa đi cầu hôn Nữ thần Mặt Trời (con của Trời và Đất). Dù được bạn thân là Đăm Par Kvây hết lời can ngăn vì đường đi vô cùng hiểm trở, chàng vẫn kiên quyết lên đường.',
    verbatimReferenceNote:
      'CẦN BỔ SUNG TƯ LIỆU: Để đối chiếu nguyên văn từng lời thoại giữa Đăm Săn và Đăm Par Kvây theo bộ SGK (Kết nối tri thức / Chân trời sáng tạo / Cánh diều), giáo viên dán đoạn trích bản in vào Kho tư liệu đối chiếu.',
    mapCoords: { x: -18, y: 1.2, z: -16 },
    layers: [
      {
        id: 's1-layer-1',
        layerType: 'event',
        layerNumber: 1,
        layerLabel: 'Lớp 1: KHÁM PHÁ SỰ KIỆN',
        focusHeading: 'Xác định mục đích chuyến đi & chi tiết khởi hành',
        contextExcerpt:
          'Sự kiện mở đầu: Đăm Săn đến nhà Đăm Par Kvây rủ bạn cùng đi bắt Nữ thần Mặt Trời về làm vợ, bất chấp lời khuyên can về khu rừng sáp đen đầy cạm bẫy chết người.',
        question:
          'Mục đích trực tiếp của chuyến đi và chi tiết nào thể hiện quyết tâm không lay chuyển của Đăm Săn?',
        options: [
          'Chàng đi tìm đất canh tác mới vì buôn làng bị hạn hán kéo dài.',
          'Chàng quyết tâm đi bắt Nữ thần Mặt Trời làm vợ; dù Đăm Par Kvây can ngăn về hiểm nguy, chàng vẫn khẳng định ý chí lên đường bằng mọi giá.',
          'Chàng đi để trả thù một tù trưởng khác đang ẩn náu ở phía chân núi.',
        ],
        correctIndex: 1,
        explanation:
          'Mục đích bề mặt là đi cầu hôn/bắt Nữ thần Mặt Trời, nhưng nổi bật ngay từ chặng đầu là thái độ kiên quyết vượt lên lời can ngăn của Đăm Par Kvây.',
        reflectionPrompt:
          'Theo em, vì sao lời can ngăn của Đăm Par Kvây đóng vai trò quan trọng ở đầu đoạn trích?',
      },
      {
        id: 's1-layer-2',
        layerType: 'artistry',
        layerNumber: 2,
        layerLabel: 'Lớp 2: GIẢI MÃ NGHỆ THUẬT',
        focusHeading: 'Nhận diện cách khắc họa động lực nhân vật',
        contextExcerpt:
          'Thủ pháp đối lập trong đối thoại: Một bên là lời cảnh báo đầy lo âu về quy luật hiểm nguy (Đăm Par Kvây); một bên là lời đáp dứt khoát, kiêu hãnh hướng về phía mặt trời (Đăm Săn).',
        question:
          'Việc đặt lời can ngăn của Đăm Par Kvây bên cạnh sự kiên quyết của Đăm Săn có tác dụng nghệ thuật gì?',
        options: [
          'Làm nổi bật khát vọng phi thường, bản lĩnh dám dấn thân khác hẳn suy nghĩ thông thường của Đăm Săn.',
          'Chứng tỏ Đăm Săn là người cố chấp, hoàn toàn không biết lắng nghe bạn bè.',
          'Tạo tiếng cười châm biếm nhẹ nhàng trước khi bước vào trận đánh.',
        ],
        correctIndex: 0,
        explanation:
          'Tương phản giữa người bạn đại diện cho giới hạn thông thường (Đăm Par Kvây) và người anh hùng dám vượt ngưỡng (Đăm Săn) làm bật khí phách sử thi ngay từ đầu hành trình.',
        reflectionPrompt:
          'Ghi lại một chi tiết cho thấy sự tương phản giữa hai nhân vật ở phần mở đầu.',
      },
      {
        id: 's1-layer-3',
        layerType: 'meaning',
        layerNumber: 3,
        layerLabel: 'Lớp 3: SUY NGẪM Ý NGHĨA',
        focusHeading: 'Lí giải khát vọng của người anh hùng và cộng đồng',
        contextExcerpt:
          'Ở đỉnh cao uy danh trần thế, việc hướng tới Nữ thần Mặt Trời – nguồn sáng tối cao của vũ trụ trong quan niệm sử thi – mang ý nghĩa biểu tượng sâu xa.',
        question:
          'Khát vọng chinh phục Nữ thần Mặt Trời của Đăm Săn mang ý nghĩa tư tưởng nào sâu sắc nhất?',
        options: [
          'Chỉ là mong muốn tìm kiếm một cuộc hôn nhân giàu sang cá nhân.',
          'Biểu tượng cho khát vọng vươn tới đỉnh cao, chinh phục tự nhiên và khẳng định tầm vóc sánh ngang thần linh của cộng đồng Ê-đê.',
          'Thể hiện sự chối bỏ hoàn toàn đời sống buôn làng Tây Nguyên.',
        ],
        correctIndex: 1,
        explanation:
          'Trong tư duy sử thi, người anh hùng mang tầm vóc đại diện cho cộng đồng. Chinh phục Nữ thần Mặt Trời là khát vọng vươn tới ánh sáng, vẻ đẹp và sức mạnh tối thượng.',
        reflectionPrompt:
          'Theo em, hành động lên đường này đẹp nhất ở điểm nào?',
      },
    ],
  },
  {
    id: 'stage-2',
    stepNumber: 2,
    shortName: 'Trạm 2 · Vượt qua thử thách',
    title: 'Trạm 2 – VƯỢT QUA THỬ THÁCH',
    emblemType: 'mountain',
    locationLabel: 'Rừng rậm, núi đá & rừng sáp đen huyền thoại',
    objective: 'Khám phá không gian kì vĩ, những trở ngại và phẩm chất người anh hùng.',
    tasksChecklist: [
      'Xác định những thử thách.',
      'Nhận diện các yếu tố phóng đại.',
      'Phân tích cách xây dựng không gian.',
      'Nhận xét tầm vóc nhân vật.',
    ],
    imagePath: '/src/assets/images/dam_san_forest_mountains_1794540838440.jpg',
    imageAlt: 'Con đường hiểm trở xuyên qua đại ngàn và dãy núi kỳ vĩ hướng lên cung điện Mặt Trời',
    studySummary:
      'Trên hành trình tìm đến nhà Nữ thần Mặt Trời, Đăm Săn phải vượt qua không gian đại ngàn trùng điệp: rừng già rậm rạp, núi cao dốc đứng, sông suối sâu hiểm và đặc biệt là khu rừng sáp đen dày đặc bẫy chông, thú dữ (cọp, gấu, tê giác...). Nhờ sức mạnh phi thường và lòng dũng cảm, chàng băng qua mọi chướng ngại để tiến tới cửa nhà Nữ thần.',
    verbatimReferenceNote:
      'CẦN BỔ SUNG TƯ LIỆU: Nếu đối chiếu câu chữ miêu tả cụ thể các tầng rừng, thú dữ và động tác vượt rừng của Đăm Săn theo bản dịch SGK cụ thể, giáo viên bổ sung vào Kho tư liệu đối chiếu.',
    mapCoords: { x: -6, y: 3.4, z: -4 },
    layers: [
      {
        id: 's2-layer-1',
        layerType: 'event',
        layerNumber: 1,
        layerLabel: 'Lớp 1: KHÁM PHÁ SỰ KIỆN',
        focusHeading: 'Xác định những thử thách trên đường đi',
        contextExcerpt:
          'Chặng đường từ buôn làng đến cõi trời không còn là không gian sinh hoạt thường ngày mà liên tiếp mở ra núi cao, rừng rậm, thú dữ và rừng sáp đen cản bước người trần.',
        question:
          'Những thử thách tiêu biểu nào xuất hiện trên con đường Đăm Săn tìm đến Nữ thần Mặt Trời?',
        options: [
          'Sự phản đối của dân làng khi chàng thu thuế và mở tiệc.',
          'Địa hình hiểm trở nối tiếp (rừng rậm, núi cao, sông suối) cùng thú dữ hung bạo và khu rừng sáp đen đầy hiểm họa.',
          'Cuộc thi đấu trí tuệ giải câu đố trước cổng thành.',
        ],
        correctIndex: 1,
        explanation:
          'Không gian thử thách mang tính chất ranh giới giữa cõi người và cõi thần: địa hình khắc nghiệt, thú dữ và rừng sáp đen.',
        reflectionPrompt:
          'Trong các trở ngại ấy, trở ngại nào mang tính báo hiệu nguy hiểm nhất cho chặng về sau?',
      },
      {
        id: 's2-layer-2',
        layerType: 'artistry',
        layerNumber: 2,
        layerLabel: 'Lớp 2: GIẢI MÃ NGHỆ THUẬT',
        focusHeading: 'Nhận diện yếu tố phóng đại & cách xây dựng không gian',
        contextExcerpt:
          'Nghệ thuật sử thi Tây Nguyên thường dùng lối miêu tả trùng điệp, liệt kê không gian nối tiếp và phóng đại tầm vóc hành động của nhân vật trước thiên nhiên kì vĩ.',
        question:
          'Cách xây dựng không gian kì vĩ kết hợp yếu tố phóng đại nhằm làm nổi bật điều gì?',
        options: [
          'Phóng đại sự nhỏ bé, yếu ớt bất lực của con người trước rừng thiêng.',
          'Lấy không gian vũ trụ rộng lớn, hiểm trở làm phông nền tôn vinh sức mạnh phi thường, ý chí bất khuất của người anh hùng Đăm Săn.',
          'Miêu tả địa lí thực tế để người đọc tra cứu bản đồ Tây Nguyên.',
        ],
        correctIndex: 1,
        explanation:
          'Không gian sử thi vừa kì vĩ vừa giàu tính ước lệ tượng trưng; thử thách càng lớn lao, tầm vóc người anh hùng vượt qua nó càng trở nên phi thường.',
        reflectionPrompt:
          'Hãy chỉ ra tác dụng của biện pháp phóng đại khi miêu tả chặng đường vượt rừng.',
      },
      {
        id: 's2-layer-3',
        layerType: 'meaning',
        layerNumber: 3,
        layerLabel: 'Lớp 3: SUY NGẪM Ý NGHĨA',
        focusHeading: 'Nhận xét tầm vóc và phẩm chất người anh hùng',
        contextExcerpt:
          'Vượt qua ranh giới khắc nghiệt mà người thường không dám đặt chân tới, Đăm Săn khẳng định bản lĩnh đối mặt thiên nhiên khắc nghiệt bằng ý chí tự thân.',
        question:
          'Qua chặng vượt thử thách, tầm vóc của nhân vật Đăm Săn hiện lên như thế nào?',
        options: [
          'Tầm vóc anh hùng kì vĩ: dũng cảm, bền bỉ, không lùi bước trước giới hạn thiên nhiên và nỗi sợ cái chết.',
          'Người lữ hành may mắn vượt đường nhờ sự trợ giúp ngẫu nhiên mà không cần nỗ lực.',
          'Nhân vật mang tâm lí do dự, liên tục muốn quay về buôn làng.',
        ],
        correctIndex: 0,
        explanation:
          'Đăm Săn vượt thử thách bằng lòng quả cảm và sức mạnh phi thường của người anh hùng đại ngàn.',
        reflectionPrompt:
          'So sánh thử thách thiên nhiên ở đây với thử thách giao chiến cùng Mtao Mxây có điểm gì khác biệt?',
      },
    ],
  },
  {
    id: 'stage-3',
    stepNumber: 3,
    shortName: 'Trạm 3 · Trước Nữ thần Mặt Trời',
    title: 'Trạm 3 – TRƯỚC NỮ THẦN MẶT TRỜI',
    emblemType: 'sun',
    locationLabel: 'Ngưỡng cửa Cung điện Nữ thần Mặt Trời',
    objective:
      'Phân tích cuộc gặp gỡ, lời đối thoại và sự đối diện giữa khát vọng chinh phục với giới hạn.',
    tasksChecklist: [
      'Phân tích thái độ của Nữ thần Mặt Trời.',
      'Tìm hiểu diễn biến cuộc đối thoại.',
      'Nhận xét lời nói và hành động của Đăm Săn.',
      'Lí giải ý nghĩa của cuộc gặp gỡ.',
    ],
    imagePath: '/src/assets/images/sun_goddess_palace_epic_1794540838277.jpg',
    imageAlt: 'Cung điện Nữ thần Mặt Trời rực rỡ ánh vàng trên đỉnh núi giữa biển mây huyền thoại',
    studySummary:
      'Tại ngôi nhà rực rỡ ánh sáng của Nữ thần Mặt Trời, Đăm Săn trực tiếp bày tỏ mục đích muốn lấy Nữ thần làm vợ. Nữ thần Mặt Trời hiện lên kiêu sa, quyền uy, thẳng thắn từ chối vì quy luật tự nhiên không thể đảo lộn (nếu Nữ thần theo chàng thì muôn loài sẽ chìm trong bóng tối và diệt vong), đồng thời cảnh báo chàng không nên ra về lúc mặt trời lên cao vì ánh nắng sẽ làm tan chảy rừng sáp đen.',
    verbatimReferenceNote:
      'CẦN BỔ SUNG TƯ LIỆU: Giáo viên có thể bổ sung các câu đối thoại nguyên văn giữa Nữ thần Mặt Trời và Đăm Săn từ bản in SGK vào Kho tư liệu đối chiếu.',
    mapCoords: { x: 7, y: 6.2, z: 7 },
    layers: [
      {
        id: 's3-layer-1',
        layerType: 'event',
        layerNumber: 1,
        layerLabel: 'Lớp 1: KHÁM PHÁ SỰ KIỆN',
        focusHeading: 'Thái độ của Nữ thần Mặt Trời & diễn biến đối thoại',
        contextExcerpt:
          'Cuộc gặp gỡ diễn ra không bằng bạo lực gươm giáo mà bằng đối thoại trực diện giữa chàng tù trưởng trần thế và vị nữ thần nắm giữ ánh sáng vũ trụ.',
        question:
          'Thái độ và lí lẽ chính của Nữ thần Mặt Trời trước lời cầu hôn của Đăm Săn là gì?',
        options: [
          'Nữ thần vui vẻ nhận lời và lập tức rời bỏ bầu trời theo Đăm Săn về buôn.',
          'Nữ thần từ chối dứt khoát nhưng vẫn giữ sự điềm tĩnh, chỉ ra quy luật sống còn của vũ trụ và cảnh báo hiểm họa nếu chàng ra về vào giờ nắng gắt.',
          'Nữ thần nổi giận dùng sấm sét trừng phạt Đăm Săn ngay tại cầu thang.',
        ],
        correctIndex: 1,
        explanation:
          'Nữ thần Mặt Trời đại diện cho trật tự và quy luật tự nhiên: nếu rời vị trí thì vạn vật, con người sẽ chết trong tăm tối, đồng thời nàng cảnh báo nguy cơ rừng sáp tan chảy.',
        reflectionPrompt:
          'Em nhận xét gì về sự tôn trọng lẫn nhau trong cuộc đối thoại này?',
      },
      {
        id: 's3-layer-2',
        layerType: 'artistry',
        layerNumber: 2,
        layerLabel: 'Lớp 2: GIẢI MÃ NGHỆ THUẬT',
        focusHeading: 'Nhận xét lời nói, hành động của Đăm Săn & nghệ thuật đối thoại',
        contextExcerpt:
          'Đăm Săn không hề run sợ trước hào quang thần linh; chàng trò chuyện đường hoàng, tự tin bày tỏ khát vọng và giữ nguyên lòng tự trọng khi bị từ chối.',
        question:
          'Lời nói và hành động của Đăm Săn trong cuộc đối thoại cho thấy nét tính cách nổi bật nào?',
        options: [
          'Thái độ khúm núm, cầu xin ân huệ từ thần linh.',
          'Sự thẳng thắn, tự tin, ngang hàng trước thần linh; không khuất phục và sẵn sàng chấp nhận thử thách cho lựa chọn của mình.',
          'Sự mưu mô, tìm cách lừa dối Nữ thần Mặt Trời.',
        ],
        correctIndex: 1,
        explanation:
          'Đăm Săn đối thoại với thần linh trên tâm thế kiêu hãnh, thẳng thắn của một tù trưởng đại ngàn, giữ trọn khí phách dù không đạt được mục đích ban đầu.',
        reflectionPrompt:
          'Vì sao tác giả dân gian để cuộc gặp gỡ giải quyết bằng đối thoại thay vì giao chiến?',
      },
      {
        id: 's3-layer-3',
        layerType: 'meaning',
        layerNumber: 3,
        layerLabel: 'Lớp 3: SUY NGẪM Ý NGHĨA',
        focusHeading: 'Lí giải ý nghĩa của cuộc gặp gỡ',
        contextExcerpt:
          'Đây là khoảnh khắc va chạm giữa hai lực lượng lớn: khát vọng chinh phục không giới hạn của con người và quy luật khách quan bất biến của tự nhiên.',
        question:
          'Ý nghĩa sâu xa nhất của cuộc gặp gỡ giữa Đăm Săn và Nữ thần Mặt Trời là gì?',
        options: [
          'Khắc họa sự đối diện đầy bi tráng giữa khát vọng vươn tới cái tuyệt đối của con người với giới hạn tất yếu của quy luật tự nhiên.',
          'Chứng tỏ con người hoàn toàn không nên đặt ra bất kì ước mơ lớn lao nào.',
          'Giải thích nguồn gốc ra đời của lễ hội đâm trâu ở Tây Nguyên.',
        ],
        correctIndex: 0,
        explanation:
          'Cuộc gặp gỡ đặt ra vấn đề nhân sinh vượt thời đại: khát vọng con người có thể chạm ngưỡng thần linh, nhưng tự nhiên cũng có trật tự không thể phá vỡ.',
        reflectionPrompt:
          'Theo em, việc Nữ thần từ chối có làm giảm vẻ đẹp anh hùng của Đăm Săn không? Vì sao?',
      },
    ],
  },
  {
    id: 'stage-4',
    stepNumber: 4,
    shortName: 'Trạm 4 · Kết cục và thông điệp',
    title: 'Trạm 4 – KẾT CỤC VÀ THÔNG ĐIỆP',
    emblemType: 'scroll',
    locationLabel: 'Đỉnh hành trình · Suy ngẫm về kết cục bi tráng',
    objective:
      'Lí giải lựa chọn của Đăm Săn, suy ngẫm về kết cục và giá trị tư tưởng của đoạn trích.',
    tasksChecklist: [
      'Phân tích lựa chọn của nhân vật.',
      'Lí giải kết cục.',
      'Nhận xét hình tượng người anh hùng.',
      'Liên hệ với khát vọng và giới hạn của con người.',
    ],
    imagePath: '/src/assets/images/epic_mythic_cosmos_1794540243920.jpg',
    imageAlt: 'Ánh sáng bình minh phủ khắp đỉnh núi sử thi, gợi suy tư về khát vọng và giới hạn con người',
    studySummary:
      'Không lấy được Nữ thần Mặt Trời, Đăm Săn quyết định quay trở về ngay dù biết ánh nắng ban mai sẽ làm rừng sáp đen tan chảy thành bùn lầy. Trên đường về, ngựa và chàng lún sâu xuống rừng sáp đen đang tan chảy. Kết cục bi tráng ấy khép lại hành trình chinh phục đầy kiêu hãnh của người anh hùng.',
    verbatimReferenceNote:
      'CẦN BỔ SUNG TƯ LIỆU: Giáo viên bổ sung đoạn kết nguyên văn (tình tiết Đăm Săn ra về và cảnh rừng sáp đen tan chảy) từ bản in SGK vào Kho tư liệu đối chiếu nếu cần kiểm tra trích dẫn từng câu.',
    mapCoords: { x: 18, y: 9.2, z: 18 },
    layers: [
      {
        id: 's4-layer-1',
        layerType: 'event',
        layerNumber: 1,
        layerLabel: 'Lớp 1: KHÁM PHÁ SỰ KIỆN',
        focusHeading: 'Phân tích lựa chọn ra về & lí giải kết cục',
        contextExcerpt:
          'Trước lời cảnh báo của Nữ thần về cái chết nơi rừng sáp đen khi mặt trời lên, Đăm Săn vẫn dứt khoát không ở lại chờ đợi mà chọn lên đường trở về ngay.',
        question:
          'Vì sao Đăm Săn chọn ra về ngay bất chấp lời cảnh báo nguy hiểm, dẫn tới kết cục chìm trong rừng sáp đen?',
        options: [
          'Vì chàng quên mất lời cảnh báo của Nữ thần Mặt Trời.',
          'Vì lòng tự trọng và bản lĩnh anh hùng không cho phép chàng sống phụ thuộc hay chùn bước trước cái chết; kết cục ấy tất yếu xảy ra khi khát vọng cá nhân vượt quá giới hạn tự nhiên.',
          'Vì chàng muốn quay về thật nhanh để tổ chức một cuộc chiến tranh mới.',
        ],
        correctIndex: 1,
        explanation:
          'Lựa chọn của Đăm Săn thể hiện khí phách tự chủ đến cùng. Kết cục bi tráng không phải thất bại tầm thường mà là hệ quả của xung đột giữa khát vọng vô biên và quy luật tự nhiên.',
        reflectionPrompt:
          'Nếu Đăm Săn ở lại chờ hết nắng mới về, hình tượng chàng sẽ thay đổi ra sao?',
      },
      {
        id: 's4-layer-2',
        layerType: 'artistry',
        layerNumber: 2,
        layerLabel: 'Lớp 2: GIẢI MÃ NGHỆ THUẬT',
        focusHeading: 'Nhận xét vẻ đẹp bi tráng của hình tượng người anh hùng',
        contextExcerpt:
          'Khác với nhiều kết thúc chiến thắng tưng bừng ở buôn làng, đoạn trích này khắc họa hình tượng Đăm Săn trong một kết cục bi tráng đầy dư âm.',
        question:
          'Cái chết/sự lún sâu của Đăm Săn trong rừng sáp đen góp phần tạo nên vẻ đẹp nào cho hình tượng nhân vật?',
        options: [
          'Vẻ đẹp bi tráng: dù thất bại về mặt thể xác trước tự nhiên, tinh thần dám khát vọng lớn và lòng tự tôn anh hùng vẫn tỏa sáng bất tử.',
          'Sự hạ bệ hoàn toàn uy danh của Đăm Săn trong mắt cộng đồng.',
          'Kết thúc hài hước nhằm răn đe người trẻ không nên đi xa.',
        ],
        correctIndex: 0,
        explanation:
          'Vẻ đẹp bi tráng là sự hòa quyện giữa nỗi đau mất mát (bi) và tầm vóc cao cả, bất khuất (tráng), giúp Đăm Săn trở thành biểu tượng nghệ thuật vượt thời gian.',
        reflectionPrompt:
          'Em hiểu thế nào là "bi nhưng không lụy" qua kết cục của Đăm Săn?',
      },
      {
        id: 's4-layer-3',
        layerType: 'meaning',
        layerNumber: 3,
        layerLabel: 'Lớp 3: SUY NGẪM Ý NGHĨA',
        focusHeading: 'Liên hệ khát vọng và giới hạn của con người hôm nay',
        contextExcerpt:
          'Từ thiên sử thi cổ của người Ê-đê, câu chuyện vượt rừng tìm Nữ thần Mặt Trời vẫn gợi đối thoại sâu sắc cho người trẻ thế kỷ XXI.',
        question:
          'Thông điệp nhân sinh cốt lõi nào được gợi ra khi liên hệ hành trình của Đăm Săn với con người hiện đại?',
        options: [
          'Con người cần nuôi dưỡng khát vọng lớn lao, dám bước ra khỏi vùng an toàn để chinh phục tri thức mới, đồng thời biết nhận thức và tôn trọng quy luật tự nhiên.',
          'Mọi khát vọng vượt giới hạn đều vô nghĩa và nên từ bỏ ngay từ đầu.',
          'Chỉ có sức mạnh cơ bắp mới giúp con người chinh phục được thiên nhiên.',
        ],
        correctIndex: 0,
        explanation:
          'Sử thi ngợi ca khát vọng bứt phá của con người nhưng cũng nhắc nhở sự tỉnh táo trước quy luật tự nhiên và giới hạn tồn tại.',
        reflectionPrompt:
          'Trong học tập hoặc cuộc sống lớp 10 của em, "Nữ thần Mặt Trời" tượng trưng cho mục tiêu lớn nào mà em đang theo đuổi?',
      },
    ],
  },
];

export const STUDY_TEXT_DETAILS: CompassTextDetail[] = [
  {
    id: 'detail-1',
    stationId: 'stage-1',
    label: 'Đăm Săn đến gặp Đăm Par Kvây, khẳng định quyết tâm đi bắt Nữ thần Mặt Trời về làm vợ bất chấp lời khuyên can.',
    relevantClaimIds: ['claim-1', 'claim-4'],
  },
  {
    id: 'detail-2',
    stationId: 'stage-1',
    label: 'Đăm Par Kvây cảnh báo đường đến nhà Nữ thần Mặt Trời đầy rừng sáp đen và hiểm họa khó sống sót trở về.',
    relevantClaimIds: ['claim-1', 'claim-2'],
  },
  {
    id: 'detail-3',
    stationId: 'stage-2',
    label: 'Đăm Săn cưỡi ngựa vượt qua hết tầng rừng rậm, núi cao, sông sâu đến khu rừng sáp đen nhiều thú dữ hung bạo.',
    relevantClaimIds: ['claim-1', 'claim-2'],
  },
  {
    id: 'detail-4',
    stationId: 'stage-3',
    label: 'Nữ thần Mặt Trời tỏa sáng rực rỡ nhưng từ chối lời cầu hôn vì nếu rời đi thì mặt đất sẽ chìm vào bóng tối, muôn loài diệt vong.',
    relevantClaimIds: ['claim-3'],
  },
  {
    id: 'detail-5',
    stationId: 'stage-3',
    label: 'Trước hào quang thần linh, Đăm Săn giữ thái độ thẳng thắn, đường hoàng bày tỏ mong muốn chứ không cầu xin hạ mình.',
    relevantClaimIds: ['claim-1', 'claim-3'],
  },
  {
    id: 'detail-6',
    stationId: 'stage-4',
    label: 'Nữ thần Mặt Trời cảnh báo nếu ra về vào lúc nắng lên thì rừng sáp đen sẽ tan chảy, nhưng Đăm Săn vẫn kiên quyết quay về ngay.',
    relevantClaimIds: ['claim-3', 'claim-4'],
  },
  {
    id: 'detail-7',
    stationId: 'stage-4',
    label: 'Trên đường trở về, rừng sáp đen tan chảy dưới ánh mặt trời khiến ngựa và Đăm Săn lún sâu vào vũng sáp.',
    relevantClaimIds: ['claim-3', 'claim-4'],
  },
  {
    id: 'distractor-1',
    stationId: 'stage-1',
    label: 'Đăm Săn đi bắt Nữ thần Mặt Trời vì buôn làng bị Nữ thần cướp mất chiêng quý và nô lệ.',
    relevantClaimIds: [],
    isDistractor: true,
    distractorReason: 'Chi tiết này nhầm lẫn với sự kiện đi cứu Hơ Nhị trước Mtao Mxây; động lực đến với Nữ thần Mặt Trời là khát vọng chinh phục đỉnh cao mới.',
  },
  {
    id: 'distractor-2',
    stationId: 'stage-3',
    label: 'Đăm Săn dùng khiên đao giao chiến ác liệt suốt ba ngày đêm để hạ gục Nữ thần Mặt Trời.',
    relevantClaimIds: [],
    isDistractor: true,
    distractorReason: 'Trong đoạn trích đi bắt Nữ thần Mặt Trời, hai nhân vật đối thoại trực diện chứ không giao chiến bằng vũ khí.',
  },
  {
    id: 'distractor-3',
    stationId: 'stage-4',
    label: 'Nữ thần Mặt Trời đồng ý theo Đăm Săn về mở tiệc ăn mừng suốt bảy ngày bảy đêm tại nhà dài.',
    relevantClaimIds: [],
    isDistractor: true,
    distractorReason: 'Chi tiết tiệc mừng thuộc hồi chiến thắng Mtao Mxây, không phải kết cục của hành trình đến nhà Nữ thần Mặt Trời.',
  },
];

export const COMPASS_CLAIMS: CompassClaim[] = [
  {
    id: 'claim-1',
    stationId: 'stage-1',
    statement: 'Đăm Săn là người anh hùng mang khát vọng chinh phục những điều phi thường.',
    focusHint:
      'Gợi ý lập luận: Chỉ rõ Đăm Săn không bằng lòng với vinh quang sẵn có, dám vượt lời can ngăn và hiểm trở để hướng tới Nữ thần Mặt Trời — biểu tượng ánh sáng tối cao.',
    rubricKeywords: ['khát vọng', 'nữ thần mặt trời', 'can ngăn', 'vượt', 'phi thường', 'thử thách'],
  },
  {
    id: 'claim-2',
    stationId: 'stage-2',
    statement: 'Không gian kì vĩ và phép phóng đại đã nâng tầm vóc Đăm Săn ngang hàng sức mạnh đại ngàn.',
    focusHint:
      'Gợi ý lập luận: Liên kết các tầng thử thách (núi cao, rừng rậm, thú dữ, rừng sáp đen) với bản lĩnh vượt ngưỡng của nhân vật trung tâm.',
    rubricKeywords: ['không gian', 'phóng đại', 'rừng', 'núi', 'tầm vóc', 'thử thách'],
  },
  {
    id: 'claim-3',
    stationId: 'stage-3',
    statement: 'Cuộc gặp gỡ Nữ thần Mặt Trời cho thấy sự đối diện giữa khát vọng con người và giới hạn của quy luật tự nhiên.',
    focusHint:
      'Gợi ý lập luận: Phân tích lí lẽ từ chối vì sự sống muôn loài của Nữ thần và thái độ kiêu hãnh, tự chủ của Đăm Săn.',
    rubricKeywords: ['quy luật', 'tự nhiên', 'giới hạn', 'đối thoại', 'từ chối', 'muôn loài'],
  },
  {
    id: 'claim-4',
    stationId: 'stage-4',
    statement: 'Kết cục trong rừng sáp đen tạo nên vẻ đẹp bi tráng cho hình tượng người anh hùng sử thi.',
    focusHint:
      'Gợi ý lập luận: Lí giải vì sao chàng vẫn ra về dù biết trước hiểm nguy và giá trị tư tưởng "bi mà không lụy" của kết thúc.',
    rubricKeywords: ['bi tráng', 'kết cục', 'lựa chọn', 'rừng sáp', 'tự trọng', 'hiểm nguy'],
  },
];

// Keep backward-compatible 4-milestone export so HomePage & PassportPage reflect the 4 stations accurately
export const DAM_SAN_MILESTONES: JourneyMilestone[] = SUN_GODDESS_STATIONS.map((s) => ({
  id: s.id,
  stepNumber: s.stepNumber,
  title: s.title,
  locationLabel: s.locationLabel,
  narrative: s.studySummary,
  keyQuote: s.objective,
  comprehensionQuestion: s.layers[0].question,
  options: s.layers[0].options,
  correctIndex: s.layers[0].correctIndex,
  explanation: s.layers[0].explanation,
}));
