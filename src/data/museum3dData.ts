import { Museum3DHotspot } from '../types/museum';

export const MUSEUM_3D_HOTSPOTS: Museum3DHotspot[] = [
  // KHU VỰC A – BÊN NGOÀI NHÀ DÀI
  {
    id: 'ext-gateway',
    area: 'A',
    areaLabel: 'Khu vực A – Bên ngoài nhà dài',
    title: 'Khuôn viên đại ngàn & Núi Chư Yang Sin',
    shortLabel: 'Cổng vào & Môi trường',
    position: { x: -3.2, y: 1.15, z: 23.5 },
    triggerRadius: 4.2,
    imagePath: '/src/assets/images/hero_tay_nguyen_museum_1794539117734.jpg',
    description:
      'Chào mừng bạn bước vào không gian Bảo tàng Sử thi 3D. Khung cảnh ngoài trời tái hiện bối cảnh đại ngàn Tây Nguyên với đường đất đỏ bazan, những cây Kơ-nia cổ thụ tỏa bóng mát và dải núi Chư Yang Sin mờ ảo phía xa.',
    simulationNote:
      'Mô hình 3D chuẩn Realistic Heritage Visualization, tái hiện chân thực không gian sống và văn hóa kiến trúc nhà dài người Ê-đê.',
    narrationText:
      'Chào mừng bạn đến với khuôn viên Nhà dài Ê-đê. Dưới bóng mát của đại ngàn Tây Nguyên và sắc đỏ đất bazan, ngôi nhà dài vươn mình như một con thuyền lớn rẽ sóng giữa biển rừng.',
    missionQuestion:
      'Môi trường tự nhiên đại ngàn Tây Nguyên có ý nghĩa như thế nào đối với sự ra đời của các bộ sử thi như Đăm Săn?',
    missionOptions: [
      'Là cái nôi nuôi dưỡng trí tưởng tượng kỳ vĩ, tinh thần chinh phục và khát vọng tự do của con người.',
      'Chỉ là bối cảnh ngẫu nhiên không liên quan đến nội dung sử thi.',
      'Là vùng đất cô lập khiến con người không thể giao tiếp với cộng đồng.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Rừng đại ngàn, sông suối dữ dội và thiên nhiên hùng trĩu là chiếc nôi hình thành nên tầm vóc sử thi bất tử.',
    points: 20,
    badgeReward: 'Người mở cổng đại ngàn',
  },
  {
    id: 'ext-facade',
    area: 'A',
    areaLabel: 'Khu vực A – Bên ngoài nhà dài',
    title: 'Kiến trúc Nhà dài & Mái tranh Khau Kut',
    shortLabel: 'Dáng nhà & Mái Khau Kut',
    position: { x: 6.8, y: 1.2, z: 16.5 },
    triggerRadius: 4.2,
    imagePath: '/src/assets/images/zone_museum_3d_1794539494709.jpg',
    description:
      'Ngôi nhà dài truyền thống của người Ê-đê có mặt bằng hình chữ nhật kéo dài theo trục Bắc - Nam. Mái dốc thấp lợp tranh dày nhiều lớp với phần hiên Dring nhô ra phía trước. Hai đầu hồi có họa tiết sừng khau kut vươn lên kiêu hãnh.',
    simulationNote:
      'Hệ thống xà dọc, xà ngang và mái tranh được dựng bằng hình học 3D có độ sâu thực tế, không dùng texture phẳng giả lập.',
    narrationText:
      'Hãy quan sát dáng nhà dài thanh thoát như một cánh buồm. Độ dốc lớn của mái tranh giúp thoát nước mưa rừng nhanh chóng, trong khi hàng cột gỗ nâng sàn cao cách ẩm và đón gió đại ngàn.',
    missionQuestion:
      'Tại sao nhà dài Ê-đê lại được mở rộng theo chiều dọc (kéo dài thêm nhiều gian) qua thời gian?',
    missionOptions: [
      'Mỗi khi một người con gái trong đại gia đình mẫu hệ lấy chồng, một gian buồng mới lại được nối thêm.',
      'Để làm nơi cất giữ gỗ thừa của buôn làng.',
      'Để xây dựng thành phố đông dân trên một mặt sàn duy nhất.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Đúng rồi! Theo chế độ mẫu hệ, mỗi khi người con gái kết hôn, ngôi nhà lại được nối dài thêm về phía sau (Gian Ôk).',
    points: 20,
    badgeReward: 'Nhà quan sát kiến trúc',
  },
  {
    id: 'ext-stairs',
    area: 'A',
    areaLabel: 'Khu vực A – Bên ngoài nhà dài',
    title: 'Cầu thang cái K\'Kha Drai (Trăng khuyết & Bầu ngực)',
    shortLabel: 'Cầu thang K\'Kha Drai',
    position: { x: 2.3, y: 1.1, z: 17.0 },
    triggerRadius: 3.8,
    imagePath: '/src/assets/images/hero_tay_nguyen_museum_1794539117734.jpg',
    description:
      'Cầu thang cái (K\'Kha Drai) là kiệt tác điêu khắc gỗ đặc trưng của người Ê-đê. Đỉnh cầu thang uốn cong hình vầng trăng khuyết, phía dưới chạm khắc nổi đôi bầu ngực người phụ nữ bằng hình học 3D thật — biểu tượng thiêng liêng của chế độ mẫu hệ, tôn vinh nguồn sữa mẹ và sự trù phú sinh sôi.',
    simulationNote:
      'Chi tiết trăng khuyết và đôi bầu ngực được tạo nổi bằng hình học 3D theo đúng tư liệu điêu khắc dân tộc học truyền thống.',
    narrationText:
      'Bạn đang đứng trước chiếc cầu thang cái K\'Kha Drai. Đôi bầu ngực và vầng trăng khuyết chạm nổi trên thân gỗ là lời nhắc nhở thiêng liêng về cội nguồn mẫu hệ và lòng hiếu kính người mẹ.',
    missionQuestion:
      'Hình tượng đôi bầu ngực và vầng trăng khuyết trên cầu thang K\'Kha Drai tượng trưng cho điều gì?',
    missionOptions: [
      'Chế độ mẫu hệ, sự ấm no, trù phú và lòng tôn kính người phụ nữ chủ gia đình.',
      'Chỉ để làm tay vịn cho người leo lên nhà.',
      'Thể hiện số lượng tài sản bằng vàng bạc của gia chủ.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Đôi bầu ngực và vầng trăng khuyết là biểu tượng mẫu quyền tối cao, nhắc nhở con cháu nhớ về công đức nuôi dưỡng của người mẹ.',
    points: 20,
    badgeReward: 'Bước qua bậc thềm mẫu hệ',
  },

  // KHU VỰC B – BÊN TRONG NHÀ DÀI (GIAN GAH & GIAN ÔK)
  {
    id: 'int-kpan',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Gah (Tiếp khách & Cộng đồng)',
    title: 'Ghế Kpan nguyên khối đại ngàn',
    shortLabel: 'Ghế Kpan nguyên khối',
    position: { x: -3.3, y: 3.0, z: 5.8 },
    triggerRadius: 3.8,
    imagePath: '/src/assets/images/dam_san_epic_journey_1794539119260.jpg',
    description:
      'Ghế Kpan là chiếc ghế gỗ dài đẽo từ một thân cây cổ thụ nguyên khối duy nhất, chạy dọc vách phía Tây của Gian Gah. Ghế Kpan dành riêng cho những nghệ nhân tấu cồng chiêng và người uy quyền trong các dịp đại lễ của buôn làng.',
    simulationNote:
      'Được dựng dạng thân gỗ nguyên khối dài có độ võng và vân tự nhiên, phủ tấm thổ cẩm truyền thống trong chế độ lễ hội.',
    narrationText:
      'Chiếc ghế Kpan sừng sững dọc vách Gian Gah là niềm tự hào của mỗi buôn làng. Để đẽo được một chiếc ghế Kpan nguyên vẹn, buôn làng phải làm lễ tạ ơn rừng và hợp sức hàng trăm chàng trai dũng mãnh.',
    missionQuestion:
      'Ghế Kpan trong nhà dài Ê-đê được chế tác từ loại vật liệu nào?',
    missionOptions: [
      'Một thân cây gỗ cổ thụ nguyên khối duy nhất do cả buôn chung sức hạ và đẽo bằng rìu.',
      'Ghép từ nhiều tấm ván ép hiện đại.',
      'Đúc từ kim loại đồng thau nhập khẩu.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Rất chuẩn! Ghế Kpan là độc mộc nguyên khối, tượng trưng cho sức mạnh đoàn kết và uy thế cộng đồng trong sử thi.',
    points: 20,
    badgeReward: 'Bậc thầy Kpan',
  },
  {
    id: 'int-gong-hgor',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Gah (Tiếp khách & Cộng đồng)',
    title: 'Dàn cồng chiêng Knah & Trống đại H\'gơr',
    shortLabel: 'Chiêng Knah & Trống H\'gơr',
    position: { x: 3.0, y: 3.0, z: 6.8 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
    description:
      'Dàn chiêng Knah gồm các chiếc chiêng núm và chiêng bằng được treo trên giá gỗ chạm trổ hoa văn. Bên cạnh là chiếc trống đại H\'gơr bịt da trâu với âm vang trầm hùng, giữ nhịp cho tiếng chiêng ngân vang qua thung lũng.',
    simulationNote:
      'Vật liệu PBR kim loại đồng thau thủ công với độ phản xạ kim loại (metallic) và độ bóng của da thuộc.',
    narrationText:
      'Mỗi khi tiếng trống H\'gơr điểm nhịp và dàn chiêng Knah cất lên, cả buôn làng cùng bước vào vũ điệu xoan say đắm. Tiếng chiêng là cầu nối giữa con người với thần linh Yàng.',
    missionQuestion:
      'Trong sử thi Đăm Săn, âm thanh của cồng chiêng được so sánh như thế nào?',
    missionOptions: [
      'Vang lừng như tiếng sấm, bay qua ngọn cây rừng, rộn rã lòng người khắp buôn làng.',
      'Yên ắng không ai nghe thấy ngoài người đánh.',
      'Giống như tiếng suối chảy thì thầm trong hang đá sâu.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Lời sử thi chép: "Hãy đánh những chiêng có tiếng vang nhất... để tiếng chiêng luồn qua mái tranh, bay qua ngọn cây, đến tai tù trưởng phương xa".',
    points: 20,
    badgeReward: 'Nghệ nhân Chiêng Knah',
  },
  {
    id: 'int-jars',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Gah (Tiếp khách & Cộng đồng)',
    title: 'Hàng ché cổ Tuk, Tang & Văn hóa rượu cần',
    shortLabel: 'Ché cổ & Rượu cần',
    position: { x: 3.4, y: 3.0, z: 2.2 },
    triggerRadius: 3.8,
    imagePath: '/src/assets/images/zone_epic_gate_1794539494154.jpg',
    description:
      'Hàng ché men gốm cổ Tuk, Tang quý giá được buộc cẩn thận vào các cọc thiêng dọc vách Gian Gah. Những chiếc cần trúc uốn cong cắm sâu vào ché rượu men lá rừng sẵn sàng cho khách quý và buôn làng sum họp.',
    simulationNote:
      'Chất liệu PBR Ceramic gốm nung men sẫm có lớp phản chiếu bóng (clearcoat) và hình khối bình gốm truyền thống.',
    narrationText:
      'Ché rượu cần là linh hồn của sự hiếu khách. Uống rượu cần cùng chung chiếc cần trúc thể hiện tình anh em gắn bó, không phân biệt sang hèn giữa đại ngàn.',
    missionQuestion:
      'Nghi thức uống rượu cần tập thể quanh các ché Tuk mang thông điệp đạo đức nào?',
    missionOptions: [
      'Gắn kết tình cảm cộng đồng, thể hiện lòng hiếu khách và sự chân thành giữa chủ và khách.',
      'Khuyến khích mỗi người uống riêng một góc.',
      'Chỉ dành cho các tù trưởng mà người dân thường không được tham dự.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Rượu cần thể hiện sự hòa hợp, chia sẻ ngọt bùi giữa các thành viên buôn làng.',
    points: 20,
    badgeReward: 'Men say đại ngàn',
  },
  {
    id: 'int-hearth',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Gah (Tiếp khách & Cộng đồng)',
    title: 'Bếp lửa Gian Gah & Không gian kể Khan',
    shortLabel: 'Bếp Gah & Sử thi Khan',
    position: { x: 0, y: 3.0, z: 4.2 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/zone_epic_gate_1794539494154.jpg',
    description:
      'Bếp lửa đặt giữa Gian Gah được xây trên khuôn gỗ đệm đất nện và đá cuội. Đây là nơi nghệ nhân hát kể Khan (sử thi) cất giọng trầm bổng suốt đêm thâu, đưa người nghe đắm chìm vào những chiến công kỳ vĩ của Đăm Săn.',
    simulationNote:
      'Ánh lửa bập bùng với nguồn sáng động PointLight ấm áp, tạo bóng đổ tự nhiên của hệ vì kèo lên mặt sàn tre.',
    narrationText:
      'Ánh lửa Gian Gah là trái tim của đêm sử thi. Bên đống lửa ấm áp, nghệ nhân già nhấp ngụm rượu cần rồi cất giọng ngân vang, tái hiện lại những trang sử thi hào hùng của dân tộc.',
    missionQuestion:
      'Nghệ thuật hát kể Khan (sử thi Ê-đê) thường diễn ra trong bối cảnh không gian thời gian nào?',
    missionOptions: [
      'Vào ban đêm bên bếp lửa bập bùng giữa Gian Gah, khi buôn làng đã xong việc nương rẫy.',
      'Vào ban trưa nắng gắt giữa nương rẫy.',
      'Trong các phòng họp kín không có ngọn lửa.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Tuyệt vời! Không gian đêm khuya bên bếp lửa ấm cúng giữa nhà dài chính là sân khấu lý tưởng nhất của hát kể Khan.',
    points: 20,
    badgeReward: 'Người giữ lửa Khan',
  },
  {
    id: 'int-loom',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Ôk (Không gian gia đình)',
    title: 'Khung dệt thổ cẩm Ê-đê truyền thống',
    shortLabel: 'Khung dệt thổ cẩm',
    position: { x: 2.4, y: 3.0, z: -4.5 },
    triggerRadius: 3.8,
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
    description:
      'Khung dệt bằng gỗ và tre mộc mạc nơi bàn tay khéo léo của người phụ nữ Ê-đê dệt nên những tấm thổ cẩm rực rỡ sắc màu (đen, chàm, đỏ, vàng) với hoa văn rồng đất, kỳ đà, rùa và chim muông.',
    simulationNote:
      'Dựng đầy đủ kết cấu thoi dệt, con suốt và các dải sợi căng thổ cẩm có độ dày thực tế.',
    narrationText:
      'Tiếng thoi đưa lách cách bên khung dệt là âm thanh êm đềm của Gian Ôk. Người phụ nữ Ê-đê dệt cả tình yêu thiên nhiên và hoa văn sử thi vào từng đường kim sợi chỉ.',
    missionQuestion:
      'Các hoa văn hình học, động vật (kỳ đà, chim muông) trên thổ cẩm Ê-đê phản ánh điều gì?',
    missionOptions: [
      'Thế giới quan tôn trọng và hòa hợp sâu sắc với muông thú, thiên nhiên đại ngàn.',
      'Sự sao chép các mẫu hoa văn công nghiệp phương Tây.',
      'Không mang ý nghĩa biểu tượng nào.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Hoa văn thổ cẩm là ngôn ngữ thị giác biểu đạt thế giới quan phong phú và lòng yêu thiên nhiên của đồng bào.',
    points: 20,
    badgeReward: 'Bàn tay dệt gấm',
  },
  {
    id: 'int-mortar',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Ôk (Không gian gia đình)',
    title: 'Cối giã gạo & Chày gỗ nguyên khối',
    shortLabel: 'Cối chày giã gạo',
    position: { x: 2.5, y: 3.0, z: -8.8 },
    triggerRadius: 3.8,
    imagePath: '/src/assets/images/zone_stem_studio_1794539494969.jpg',
    description:
      'Chiếc cối giã gạo đẽo từ gốc gỗ lim hoặc sến sắn nguyên khối, kèm theo những thanh chày gỗ thon dài hai đầu. Nhịp chày giã gạo nhịp nhàng vào mỗi sớm mai là hình ảnh quen thuộc nuôi dưỡng buôn làng.',
    simulationNote:
      'Vật liệu gỗ thô đẽo rìu với độ nhám bề mặt và lòng cối khoét sâu chân thực.',
    narrationText:
      'Nhịp chày giã gạo sớm mai gieo vào lòng người khúc ca lao động khỏe khoắn. Lúa gạo nương rẫy là nguồn sinh dưỡng nuôi lớn những dũng sĩ anh hùng.',
    missionQuestion:
      'Âm thanh nhịp chày giã gạo trên sàn nhà dài vào buổi bình minh tượng trưng cho điều gì?',
    missionOptions: [
      'Nhịp sống lao động cần cù, no ấm và thanh bình của buôn làng.',
      'Sự xáo trộn và xung đột giữa các gia đình.',
      'Dấu hiệu thông báo thời tiết xấu.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Đúng rồi! Nhịp chày giã gạo hòa cùng tiếng gà gáy sáng mở đầu cho một ngày lao động ấm no.',
    points: 20,
    badgeReward: 'Hạt ngọc đại ngàn',
  },
  {
    id: 'int-baskets',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Ôk (Không gian gia đình)',
    title: 'Gùi Đới hoa văn & Giỏ đan mây tre',
    shortLabel: 'Gùi Đới & Đồ mây tre',
    position: { x: -2.8, y: 3.0, z: -4.2 },
    triggerRadius: 3.8,
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
    description:
      'Gùi Đới là vật dụng bất ly thân của cư dân Ê-đê khi lên rẫy hay xuống suối. Được đan bằng mây và cật tre già với kỹ thuật đan nan tinh xảo, gùi vừa chắc chắn vừa mang hoa văn nan đan trang nhã.',
    simulationNote:
      'Chất liệu mây tre đan với hoa văn đan nong hai có độ bóng mờ tự nhiên của nan tre phủ khói bếp.',
    narrationText:
      'Chiếc gùi Đới gắn bó trên lưng người từ tấm bé đến khi mái đầu bạc trắng. Gùi theo chân người lên nương trỉa bắp, xuống bến gánh nước trong vắt về nhà dài.',
    missionQuestion:
      'Chiếc gùi Đới của đồng bào Ê-đê được đan chủ yếu từ loại vật liệu tự nhiên nào?',
    missionOptions: [
      'Mây rừng và cật tre nứa già dẻo dai, được hong khói bếp để chống mối mọt.',
      'Sợi nhựa tổng hợp hiện đại.',
      'Dây kẽm kim loại bọc vải.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Chính xác! Mây và tre rừng được hong trên giàn bếp gác củi tạo màu cánh gián tự nhiên và độ bền hàng chục năm.',
    points: 20,
    badgeReward: 'Bàn tay mây tre',
  },
  {
    id: 'int-ok-living',
    area: 'B',
    areaLabel: 'Khu vực B – Gian Ôk (Không gian gia đình)',
    title: 'Gian Ôk & Các buồng ngủ mẫu hệ',
    shortLabel: 'Gian Ôk sinh hoạt',
    position: { x: -1.2, y: 3.0, z: -7.5 },
    triggerRadius: 4.0,
    imagePath: '/src/assets/images/zone_museum_3d_1794539494709.jpg',
    description:
      'Phía sau vách ngăn là Gian Ôk — không gian sinh hoạt riêng tư của đại gia đình. Các buồng ngủ của từng cặp vợ chồng được ngăn cách kín đáo bằng phên nứa, kế bên là bếp nấu ăn chung (Bếp Ôk) với giàn sấy gác củi.',
    simulationNote:
      'Vách ngăn tre nứa đan nan kết hợp hệ thống khung đỡ gỗ, thể hiện ranh giới rõ ràng giữa không gian công và tư.',
    narrationText:
      'Gian Ôk là tổ ấm riêng tư ấm cúng. Nơi đây nuôi dưỡng các thế hệ con cháu trưởng thành dưới sự chở che của người bà, người mẹ trong dòng tộc mẫu hệ.',
    missionQuestion:
      'Sự phân chia giữa Gian Gah (cộng đồng) và Gian Ôk (gia đình) phản ánh tư duy tổ chức không gian nào của người Ê-đê?',
    missionOptions: [
      'Sự hài hòa chặt chẽ giữa tính gắn kết cộng đồng buôn làng với sự tôn trọng quyền riêng tư của từng gia đình nhỏ.',
      'Sự phân biệt giàu nghèo gay gắt trong cùng một gia đình.',
      'Chia ngẫu nhiên không có ý thức về công năng sử dụng.',
    ],
    correctIndex: 0,
    missionExplanation:
      'Xuất sắc! Đó là sự cân bằng tuyệt vời giữa sinh hoạt cộng đồng cởi mở và không gian gia đình ấm cúng mẫu hệ.',
    points: 20,
    badgeReward: 'Đại sứ di sản Ê-đê',
  },
];
