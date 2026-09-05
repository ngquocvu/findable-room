import { FurnitureType, ItemCategory, Language } from '../types';

export interface TranslationDictionary {
  common: {
    appName: string;
    rooms: string;
    furniture: string;
    items: string;
    search: string;
    qrLabels: string;
    guide: string;
    save: string;
    close: string;
    name: string;
    cancel: string;
    delete: string;
    edit: string;
    clear: string;
    export: string;
    import: string;
    empty: string;
    print: string;
    copied: string;
    link: string;
    width: string;
    depth: string;
    color: string;
    floorColor: string;
    wallColor: string;
    position: string;
    rotation: string;
    tags: string;
    category: string;
    quantity: string;
    pieces: string;
    langName: string;
  };
  categories: Record<ItemCategory, string>;
  furniturePresets: Record<FurnitureType, { label: string; desc: string }>;
  topbar: {
    searchPlaceholder: string;
    printQR: string;
    guideDemo: string;
    guideShort: string;
    language: string;
  };
  sidebar: {
    yourRooms: string;
    newRoom: string;
    demo: string;
    addSampleRoom: string;
    sampleRoomSubtitle: string;
    addDemoRoomTip: string;
    editRoom: string;
    roomNamePlaceholder: string;
    addFurniture: string;
    selectRoomFirst: string;
    noFurnitureInRoom: string;
    viewItems: string;
    printStickers: string;
    editFurniture: string;
    viewManageItems: string;
    furnitureNamePlaceholder: string;
    invalidBackup: string;
    parseFailed: string;
  };
  contentsModal: {
    emptyContents: string;
    itemNamePlaceholder: string;
    tagsPlaceholder: string;
    addItem: string;
    qrSticker: string;
    qtyShort: string;
  };
  searchModal: {
    searchInputPlaceholder: string;
    typeToSearch: string;
    noResults: string;
    clearBtn: string;
  };
  welcomeModal: {
    smartInventoryBadge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    controlsTitle: string;
    controlRotate: string;
    controlPan: string;
    controlZoom: string;
    controlOpen: string;
    getStartedPrompt: string;
    loadDemoTitle: string;
    loadDemoDesc: string;
    startFreshTitle: string;
    startFreshDesc: string;
    recommended: string;
    emptyCanvas: string;
    dontShowAgain: string;
    skipForNow: string;
  };
  qrLabelModal: {
    batchTitle: string;
    singleTitle: string;
    scanHelper: string;
    printStickersBtn: string;
    printNow: string;
    labelSize: string;
    styleDetailed: string;
    styleStandard: string;
    styleCompact: string;
    stickersReady: string;
    storedItemsLabel: string;
    scanToInspect: string;
    scanWithPhone: string;
    printingTip: string;
    emptyContainer: string;
    moreItems: string;
  };
  mobileScanModal: {
    scannedBoxBadge: string;
    searchInBox: string;
    openIn3D: string;
    saveContainer: string;
    savedSuccess: string;
    emptyScanned: string;
    noMatchingScanned: string;
  };
  mobileBottomBar: {
    rooms: string;
    search: string;
    qrLabels: string;
    guide: string;
  };
  imageToRoom: {
    buttonLabel: string;
    modalTitle: string;
    modalSubtitle: string;
    dropzonePrompt: string;
    dropzoneHint: string;
    analyzing: string;
    analyzingStep1: string;
    analyzingStep2: string;
    analyzingStep3: string;
    previewTitle: string;
    roomDimensions: string;
    wallFloorColors: string;
    detectedFurniture: string;
    noFurnitureFound: string;
    confidence: string;
    confidenceHigh: string;
    confidenceMedium: string;
    confidenceLow: string;
    dimensionRationale: string;
    createRoomBtn: string;
    createEmptyRoomBtn: string;
    retakeBtn: string;
    errorNotRoom: string;
    errorBlurry: string;
    errorTooClose: string;
    errorGeneric: string;
    emptyRoomMsg: string;
    emptyRoomSub: string;
    furnitureToggleAll: string;
    adjustDimensions: string;
    newRoomNamePlaceholder: string;
    apiKeyPrompt: string;
    enterApiKey: string;
  };
  voiceItems: {
    buttonLabel: string;
    modalTitle: string;
    listening: string;
    processing: string;
    speakNow: string;
    retryBtn: string;
    addMode: string;
    replaceMode: string;
    replaceWarning: string;
    previewTitle: string;
    transcriptLabel: string;
    parsedItems: string;
    noItemsParsed: string;
    diffAddSummary: string;
    diffReplaceSummary: string;
    confirmBtn: string;
    cancelBtn: string;
    editTranscript: string;
    parseBtn: string;
    sourceCloud: string;
    sourceBrowser: string;
    intentDetected: string;
    apiKeyPrompt: string;
    enterApiKey: string;
  };
  agentBar: {
    placeholder: string;
    placeholderMobile: string;
    thinking: string;
    confirmPlan: string;
    cancelPlan: string;
    executingStep: string;
    doneMessage: string;
    errorMessage: string;
    cloudFallback: string;
    voiceBtn: string;
    sendBtn: string;
  };
  aiLabs: {
    title: string;
    subtitle: string;
    providerTitle: string;
    providerAuto: string;
    providerAutoDesc: string;
    providerCloud: string;
    providerCloudDesc: string;
    providerBrowser: string;
    providerBrowserDesc: string;
    browserAvailable: string;
    browserUnavailable: string;
    featureFlagsTitle: string;
    flagImageToRoom: string;
    flagImageToRoomDesc: string;
    flagVoiceToItems: string;
    flagVoiceToItemsDesc: string;
    flagBrowserAgent: string;
    flagBrowserAgentDesc: string;
    closeBtn: string;
    apiKeyMissing: string;
    apiKeyTitle: string;
    apiKeyDesc: string;
    apiKeyPlaceholder: string;
    apiKeySave: string;
    apiKeySaved: string;
    apiKeyRemove: string;
    apiKeyStatusActive: string;
    apiKeyStatusEnv: string;
    apiKeyStatusNone: string;
    apiKeyGetFree: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  vi: {
    common: {
      appName: 'RoomFindable',
      rooms: 'Phòng',
      furniture: 'Nội thất',
      items: 'Đồ đạc',
      search: 'Tìm kiếm',
      qrLabels: 'Tem mã QR',
      guide: 'Hướng dẫn',
      save: 'Lưu',
      close: 'Đóng',
      name: 'Tên',
      cancel: 'Huỷ',
      delete: 'Xoá',
      edit: 'Chỉnh sửa',
      clear: 'Xoá tìm kiếm',
      export: 'Xuất file',
      import: 'Nhập file',
      empty: 'Trống',
      print: 'In',
      copied: 'Đã sao chép',
      link: 'Link',
      width: 'Chiều rộng',
      depth: 'Chiều sâu',
      color: 'Màu sắc',
      floorColor: 'Màu sàn',
      wallColor: 'Màu tường',
      position: 'Vị trí',
      rotation: 'Góc xoay',
      tags: 'Thẻ tag',
      category: 'Danh mục',
      quantity: 'Số lượng',
      pieces: 'món đồ',
      langName: 'Tiếng Việt',
    },
    categories: {
      clothing: 'Quần áo',
      documents: 'Giấy tờ',
      electronics: 'Thiết bị điện tử',
      tools: 'Dụng cụ & Đồ nghề',
      books: 'Sách & Vở',
      kitchenware: 'Đồ dùng bếp',
      toys: 'Đồ chơi & Giải trí',
      misc: 'Đồ linh tinh',
    },
    furniturePresets: {
      wardrobe: { label: 'Tủ quần áo', desc: 'Tủ cao đứng có cánh cửa' },
      cabinet: { label: 'Tủ kệ', desc: 'Tủ lưu trữ cỡ vừa' },
      closet: { label: 'Tủ âm tường', desc: 'Tủ lưu trữ lớn có cửa đôi' },
      table: { label: 'Bàn', desc: 'Mặt bàn phẳng có chân' },
      desk: { label: 'Bàn làm việc', desc: 'Bàn làm việc có ngăn kéo' },
      shelf: { label: 'Kệ sách', desc: 'Kệ sách mở nhiều tầng' },
      drawer: { label: 'Tủ ngăn kéo', desc: 'Tủ nhiều ngăn kéo kéo ra' },
      box: { label: 'Thùng / Hộp', desc: 'Hộp hoặc thùng đựng đồ' },
      bed: { label: 'Giường ngủ', desc: 'Giường ngủ có đầu giường và khung' },
      fridge: { label: 'Tủ lạnh', desc: 'Tủ lạnh bảo quản' },
    },
    topbar: {
      searchPlaceholder: 'Tìm kiếm...',
      printQR: 'In tem QR',
      guideDemo: 'Hướng dẫn & Mẫu',
      guideShort: 'Hướng dẫn',
      language: 'Ngôn ngữ',
    },
    sidebar: {
      yourRooms: 'Danh sách phòng của bạn',
      newRoom: 'Tạo phòng mới',
      demo: 'Mẫu thử',
      addSampleRoom: 'Thêm phòng mẫu có sẵn đồ',
      sampleRoomSubtitle: 'Gồm bàn ghế, tủ kệ & 15 đồ đạc mẫu',
      addDemoRoomTip: 'Tạo thêm một phòng mẫu có sẵn đồ đạc mà không làm mất phòng hiện có',
      editRoom: 'Chỉnh sửa phòng',
      roomNamePlaceholder: 'Tên phòng...',
      addFurniture: 'Thêm đồ nội thất',
      selectRoomFirst: 'Vui lòng chọn hoặc tạo phòng trước',
      noFurnitureInRoom: 'Nhấp vào loại đồ bên trên để đặt vào phòng',
      viewItems: 'Đồ đạc',
      printStickers: 'in tem nhãn',
      editFurniture: 'Chỉnh sửa nội thất',
      viewManageItems: 'Xem & Quản lý đồ',
      furnitureNamePlaceholder: 'Tên món đồ nội thất...',
      invalidBackup: 'Tệp sao lưu không hợp lệ',
      parseFailed: 'Không thể đọc tệp sao lưu',
    },
    contentsModal: {
      emptyContents: 'Chưa có đồ nào — thêm đồ đạc bên dưới',
      itemNamePlaceholder: 'Tên món đồ (vd: Hộ chiếu, Sách)...',
      tagsPlaceholder: 'Thẻ tag (cách nhau bởi dấu phẩy)...',
      addItem: 'Thêm món đồ',
      qrSticker: 'Tem QR',
      qtyShort: 'SL',
    },
    searchModal: {
      searchInputPlaceholder: 'Tìm kiếm đồ đạc, thẻ tag, hoặc danh mục...',
      typeToSearch: 'Nhập từ khoá để bắt đầu tìm đồ...',
      noResults: 'Không tìm thấy món đồ nào phù hợp.',
      clearBtn: 'Xoá',
    },
    welcomeModal: {
      smartInventoryBadge: 'Bản đồ phòng & Quản lý đồ 3D thông minh',
      title: 'Chào mừng bạn đến với RoomFindable',
      subtitle: 'Bản đồ 3D trực quan giúp bạn biết chính xác từng món đồ (hộ chiếu, sạc cáp, quần áo...) đang ở tủ hay ngăn kéo nào.',
      step1Title: '1. Xếp đồ phòng 3D',
      step1Desc: 'Chọn phòng ở thanh bên, thêm tủ, bàn, giường. Kéo thả đồ vật trong phòng 3D theo ý muốn.',
      step2Title: '2. Ghi nhớ đồ cất bên trong',
      step2Desc: 'Nhấp đúp vào bất kỳ tủ/hộp nào để ghi tên đồ đạc, số lượng và thẻ tag cất bên trong.',
      step3Title: '3. Tìm kiếm tức thì (⌘K)',
      step3Desc: 'Chỉ cần gõ tên món đồ bất kỳ, camera 3D sẽ tự động xoay và phóng to đến đúng nơi cất.',
      step4Title: '4. In tem QR dán thùng thực tế',
      step4Desc: 'In mã QR dán lên hộp/ngăn kéo ngoài đời thực. Quét bằng điện thoại để xem đồ bên trong mà không cần lục tung!',
      controlsTitle: 'Cách điều khiển trong phòng 3D:',
      controlRotate: 'Chuột trái / 1 ngón: Xoay phòng 360°',
      controlPan: 'Chuột phải / 2 ngón: Di chuyển góc nhìn',
      controlZoom: 'Cuộn chuột / Chụm ngón: Phóng to & thu nhỏ',
      controlOpen: 'Nhấp vào đồ vật: Mở danh sách đồ bên trong',
      getStartedPrompt: 'Bắt đầu sử dụng ngay:',
      loadDemoTitle: 'Thử ngay với Phòng mẫu có sẵn đồ',
      loadDemoDesc: 'Trải nghiệm ngay phòng studio có sẵn bàn làm việc, tủ đồ & 15 món đồ mẫu để bạn thử xoay 3D và tìm kiếm.',
      startFreshTitle: 'Tự tạo phòng mới của tôi',
      startFreshDesc: 'Bắt đầu với một căn phòng trống để bạn tự thiết kế kích thước và sắp xếp đồ đạc nhà mình.',
      recommended: 'Khuyên dùng cho người mới',
      emptyCanvas: 'Phòng trống tự tạo',
      dontShowAgain: 'Không tự động mở lại khi vào trang',
      skipForNow: 'Khám phá ngay',
    },
    qrLabelModal: {
      batchTitle: 'In danh sách tem nhãn đồ đạc',
      singleTitle: 'In tem QR dán đồ vật',
      scanHelper: 'Quét bằng camera điện thoại để xem và tìm ngay đồ bên trong',
      printStickersBtn: 'In tem nhãn',
      printNow: 'In ngay bây giờ',
      labelSize: 'Cỡ nhãn:',
      styleDetailed: 'Chi tiết (Kèm đồ)',
      styleStandard: 'Tiêu chuẩn',
      styleCompact: 'Nhỏ gọn mini',
      stickersReady: 'tem sẵn sàng',
      storedItemsLabel: 'Đồ đạc bên trong:',
      scanToInspect: 'Quét để xem danh mục đồ',
      scanWithPhone: 'Quét bằng camera điện thoại để mở danh mục đồ.',
      printingTip: 'Mẹo: In được trên giấy decal dán bóc (A4 / Avery) hoặc máy in nhiệt cầm tay!',
      emptyContainer: 'Hộp đồ đang trống',
      moreItems: 'món đồ khác...',
    },
    mobileScanModal: {
      scannedBoxBadge: 'Hộp quét từ mã QR',
      searchInBox: 'Tìm đồ trong hộp này...',
      openIn3D: 'Mở xem trong phòng 3D',
      saveContainer: 'Lưu hộp này vào RoomFindable của tôi',
      savedSuccess: 'Đã lưu thành công vào danh sách phòng!',
      emptyScanned: 'Hộp đồ này hiện đang trống.',
      noMatchingScanned: 'Không có món đồ nào khớp với từ khoá tìm kiếm.',
    },
    mobileBottomBar: {
      rooms: 'Phòng',
      search: 'Tìm kiếm',
      qrLabels: 'Tem QR',
      guide: 'Hướng dẫn',
    },
    imageToRoom: {
      buttonLabel: 'Quét phòng từ ảnh (AI)',
      modalTitle: 'Phân tích phòng từ ảnh',
      modalSubtitle: 'Tải ảnh phòng thực tế để AI tự nhận biết kích thước và đồ nội thất.',
      dropzonePrompt: 'Thả ảnh vào đây hoặc nhấp để chọn',
      dropzoneHint: 'Hỗ trợ JPG, PNG, WEBP tối đa 10MB',
      analyzing: 'Đang phân tích ảnh...',
      analyzingStep1: 'Xác định ranh giới phòng...',
      analyzingStep2: 'Ước tính kích thước từ tỷ lệ thực...',
      analyzingStep3: 'Nhận diện đồ nội thất...',
      previewTitle: 'Xem trước kết quả',
      roomDimensions: 'Kích thước phòng',
      wallFloorColors: 'Màu tường & sàn',
      detectedFurniture: 'Đồ nội thất nhận diện được',
      noFurnitureFound: 'Không tìm thấy đồ nội thất nào trong ảnh.',
      confidence: 'Độ tin cậy',
      confidenceHigh: 'Cao',
      confidenceMedium: 'Trung bình',
      confidenceLow: 'Thấp',
      dimensionRationale: 'Căn cứ ước tính',
      createRoomBtn: 'Tạo phòng với bố cục này',
      createEmptyRoomBtn: 'Tạo phòng trống',
      retakeBtn: 'Chụp/chọn lại',
      errorNotRoom: 'Không nhận ra không gian trong nhà. Hãy chụp rõ toàn bộ phòng nhé.',
      errorBlurry: 'Ảnh quá tối hoặc mờ. Hãy bật đèn và chụp lại.',
      errorTooClose: 'Ảnh chụp quá gần. Hãy lùi ra và chụp toàn cảnh phòng.',
      errorGeneric: 'Phân tích thất bại. Vui lòng thử lại.',
      emptyRoomMsg: 'Phòng trống được phát hiện!',
      emptyRoomSub: 'AI đã đo kích thước và nhận màu tường/sàn. Bạn có muốn tạo phòng trống này không?',
      furnitureToggleAll: 'Chọn tất cả',
      adjustDimensions: 'Điều chỉnh kích thước',
      newRoomNamePlaceholder: 'Tên phòng mới...',
      apiKeyPrompt: 'Cần có Gemini API Key để phân tích ảnh phòng.',
      enterApiKey: 'Nhập API Key',
    },
    voiceItems: {
      buttonLabel: 'Nói để thêm đồ (AI)',
      modalTitle: 'Thêm đồ bằng giọng nói',
      listening: 'Đang nghe...',
      processing: 'Đang xử lý...',
      speakNow: 'Hãy nói tên đồ đạc bạn muốn lưu vào đây...',
      retryBtn: 'Thu âm lại',
      addMode: 'Thêm vào',
      replaceMode: 'Thay thế tất cả',
      replaceWarning: 'Sẽ xoá {{count}} đồ hiện có trong {{name}}',
      previewTitle: 'Xem trước trước khi lưu',
      transcriptLabel: 'Bạn đã nói:',
      parsedItems: 'Đồ nhận diện được:',
      noItemsParsed: 'Không nhận diện được đồ nào. Hãy thử nói rõ hơn.',
      diffAddSummary: 'Hiện có {{current}} đồ → Sẽ thành {{next}} đồ (+{{added}} mới)',
      diffReplaceSummary: 'Hiện có {{current}} đồ → Sẽ thành {{next}} đồ (xoá {{current}} cũ)',
      confirmBtn: 'Xác nhận cập nhật',
      cancelBtn: 'Huỷ',
      editTranscript: 'Chỉnh sửa văn bản',
      parseBtn: 'Phân tích lại',
      sourceCloud: 'Cloud AI',
      sourceBrowser: 'AI trên thiết bị',
      intentDetected: 'AI nhận biết ý định:',
      apiKeyPrompt: 'Cần có Gemini API Key cho phân tích qua Cloud AI.',
      enterApiKey: 'Nhập API Key',
    },
    agentBar: {
      placeholder: 'Hỏi AI hoặc ra lệnh... (vd: "Thêm tủ quần áo", "Laptop đang ở đâu?")',
      placeholderMobile: 'Lệnh AI...',
      thinking: 'AI đang suy nghĩ...',
      confirmPlan: 'Thực hiện kế hoạch này?',
      cancelPlan: 'Huỷ',
      executingStep: 'Đang thực hiện bước {{step}}/{{total}}...',
      doneMessage: 'Hoàn thành!',
      errorMessage: 'Thực thi thất bại. Vui lòng thử lại.',
      cloudFallback: 'Đang dùng Cloud AI (trình duyệt không hỗ trợ AI tích hợp)',
      voiceBtn: 'Nói lệnh',
      sendBtn: 'Gửi',
    },
    aiLabs: {
      title: 'AI Labs & Cài đặt',
      subtitle: 'Bật/tắt tính năng AI và chọn nhà cung cấp AI phù hợp.',
      providerTitle: 'Nhà cung cấp AI',
      providerAuto: 'Tự động (Khuyên dùng)',
      providerAutoDesc: 'AI on-device cho giọng nói, Cloud Gemini cho phân tích ảnh.',
      providerCloud: 'Cloud Gemini Flash Lite',
      providerCloudDesc: 'Toàn bộ dùng Gemini Flash Lite qua máy chủ.',
      providerBrowser: 'AI trên thiết bị (Gemini Nano)',
      providerBrowserDesc: 'Xử lý hoàn toàn trong trình duyệt. Miễn phí & riêng tư.',
      browserAvailable: 'AI trên thiết bị sẵn sàng (Gemini Nano)',
      browserUnavailable: 'AI trên thiết bị chưa khả dụng trên trình duyệt này',
      featureFlagsTitle: 'Tính năng AI',
      flagImageToRoom: 'Quét phòng từ ảnh',
      flagImageToRoomDesc: 'Nhận diện đồ nội thất và kích thước phòng từ ảnh chụp.',
      flagVoiceToItems: 'Thêm đồ bằng giọng nói',
      flagVoiceToItemsDesc: 'Nói tên đồ đạc để tự động thêm vào tủ/hộp.',
      flagBrowserAgent: 'AI Copilot trong ứng dụng',
      flagBrowserAgentDesc: 'Gõ hoặc nói lệnh để AI tự động sắp xếp phòng.',
      closeBtn: 'Đóng',
      apiKeyMissing: 'Chưa thiết lập GEMINI_API_KEY. Bạn có thể nhập khoá thủ công ngay bên dưới để sử dụng.',
      apiKeyTitle: 'Khóa API Gemini (Thủ công)',
      apiKeyDesc: 'Nhập khóa API cá nhân từ Google AI Studio để sử dụng Cloud AI hoàn toàn miễn phí & riêng tư.',
      apiKeyPlaceholder: 'Dán Gemini API Key (bắt đầu bằng AIzaSy...)',
      apiKeySave: 'Lưu API Key',
      apiKeySaved: 'Đã lưu API Key an toàn trên trình duyệt này',
      apiKeyRemove: 'Xoá Key',
      apiKeyStatusActive: 'Đã lưu khoá thủ công',
      apiKeyStatusEnv: 'Đang dùng từ tệp cấu hình (.env)',
      apiKeyStatusNone: 'Chưa thiết lập',
      apiKeyGetFree: 'Lấy API Key miễn phí tại Google AI Studio →',
    },
  },
  en: {
    common: {
      appName: 'RoomFindable',
      rooms: 'Rooms',
      furniture: 'Furniture',
      items: 'Items',
      search: 'Search',
      qrLabels: 'QR Labels',
      guide: 'Guide',
      save: 'Save',
      close: 'Close',
      name: 'Name',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      clear: 'Clear',
      export: 'Export',
      import: 'Import',
      empty: 'Empty',
      print: 'Print',
      copied: 'Copied',
      link: 'Link',
      width: 'Width',
      depth: 'Depth',
      color: 'Color',
      floorColor: 'Floor Color',
      wallColor: 'Wall Color',
      position: 'Position',
      rotation: 'Rotation',
      tags: 'Tags',
      category: 'Category',
      quantity: 'Quantity',
      pieces: 'pieces',
      langName: 'English',
    },
    categories: {
      clothing: 'Clothing',
      documents: 'Documents',
      electronics: 'Electronics',
      tools: 'Tools',
      books: 'Books',
      kitchenware: 'Kitchenware',
      toys: 'Toys',
      misc: 'Misc',
    },
    furniturePresets: {
      wardrobe: { label: 'Wardrobe', desc: 'Tall storage with doors' },
      cabinet: { label: 'Cabinet', desc: 'Medium storage unit' },
      closet: { label: 'Closet', desc: 'Large walk-in storage' },
      table: { label: 'Table', desc: 'Flat surface with legs' },
      desk: { label: 'Desk', desc: 'Work desk with drawers' },
      shelf: { label: 'Shelf', desc: 'Open multi-tier shelving' },
      drawer: { label: 'Drawer', desc: 'Stacked pull-out drawers' },
      box: { label: 'Box', desc: 'Storage container/box' },
      bed: { label: 'Bed', desc: 'Bed with headboard & frame' },
      fridge: { label: 'Fridge', desc: 'Refrigerator/freezer' },
    },
    topbar: {
      searchPlaceholder: 'Search...',
      printQR: 'Print QR Stickers',
      guideDemo: 'Guide & Demo',
      guideShort: 'Guide',
      language: 'Language',
    },
    sidebar: {
      yourRooms: 'Your Rooms',
      newRoom: 'New Empty Room',
      demo: 'Demo',
      addSampleRoom: 'Add Pre-Furnished Sample Room',
      sampleRoomSubtitle: 'Includes studio furniture & 15 items',
      addDemoRoomTip: 'Creates an example room with furniture & items without altering existing rooms',
      editRoom: 'Edit Room',
      roomNamePlaceholder: 'Room Name',
      addFurniture: 'Add Furniture',
      selectRoomFirst: 'Select a room first',
      noFurnitureInRoom: 'Click a type above to add furniture',
      viewItems: 'Items',
      printStickers: 'print stickers',
      editFurniture: 'Edit Furniture',
      viewManageItems: 'View & Manage Items',
      furnitureNamePlaceholder: 'Furniture Name',
      invalidBackup: 'Invalid backup file',
      parseFailed: 'Failed to parse file',
    },
    contentsModal: {
      emptyContents: 'Empty — add items below',
      itemNamePlaceholder: 'Item name (e.g. Passport, Book)...',
      tagsPlaceholder: 'Tags (comma separated)...',
      addItem: 'Add Item',
      qrSticker: 'QR Sticker',
      qtyShort: 'Qty',
    },
    searchModal: {
      searchInputPlaceholder: 'Search items, tags, or categories...',
      typeToSearch: 'Type to start searching...',
      noResults: 'No items found.',
      clearBtn: 'Clear',
    },
    welcomeModal: {
      smartInventoryBadge: 'Smart 3D Room & Inventory Map',
      title: 'Welcome to RoomFindable',
      subtitle: 'Visually map your room in 3D and always know exactly where passports, cables, or documents are stored.',
      step1Title: '1. Arrange Room in 3D',
      step1Desc: 'Select a room, add wardrobes, desks & beds. Click and drag furniture anywhere across the 3D room floor.',
      step2Title: '2. Catalog Stored Items',
      step2Desc: 'Click any furniture piece to log item names, quantities, and tags stored inside.',
      step3Title: '3. Instant Search (⌘K)',
      step3Desc: 'Type any item name to automatically rotate and zoom the 3D camera to its exact storage location.',
      step4Title: '4. Print Physical QR Stickers',
      step4Desc: 'Print smart QR stickers for your real boxes or drawers. Scan with your phone camera to inspect contents instantly!',
      controlsTitle: '3D Navigation Controls:',
      controlRotate: 'Left click / 1 finger: Rotate 360°',
      controlPan: 'Right click / 2 fingers: Pan view',
      controlZoom: 'Mouse wheel / Pinch: Zoom in & out',
      controlOpen: 'Click furniture: View & manage items',
      getStartedPrompt: 'Get started now:',
      loadDemoTitle: 'Try with Pre-Furnished Sample Room',
      loadDemoDesc: 'Explore a complete studio room with desk, wardrobe, laptop & books ready for you to try searching and 3D navigation.',
      startFreshTitle: 'Create My Own Empty Room',
      startFreshDesc: 'Start with a blank canvas to customize dimensions, wall colors, and organize your real-world room.',
      recommended: 'Recommended for beginners',
      emptyCanvas: 'Custom Empty Room',
      dontShowAgain: "Don't show this guide automatically on startup",
      skipForNow: 'Explore Room',
    },
    qrLabelModal: {
      batchTitle: 'Print Storage Stickers Sheet',
      singleTitle: 'Print Container QR Sticker',
      scanHelper: 'Scan with your phone to immediately view & find stored items',
      printStickersBtn: 'Print Stickers',
      printNow: 'Print Now',
      labelSize: 'Label Size:',
      styleDetailed: 'Detailed List',
      styleStandard: 'Standard Bin',
      styleCompact: 'Compact Mini',
      stickersReady: 'stickers ready',
      storedItemsLabel: 'Stored Items:',
      scanToInspect: 'Scan to inspect items',
      scanWithPhone: 'Scan with any phone camera to reveal full inventory & contents.',
      printingTip: 'Tip: Works with standard sticker paper (e.g. Avery sheets) or thermal Bluetooth label makers!',
      emptyContainer: 'Empty container',
      moreItems: 'more items...',
    },
    mobileScanModal: {
      scannedBoxBadge: 'QR Scanned Box',
      searchInBox: 'Search items in this container...',
      openIn3D: 'Open in 3D Room Viewer',
      saveContainer: 'Save Container to My RoomFindable',
      savedSuccess: 'Saved to your rooms!',
      emptyScanned: 'This container is currently empty.',
      noMatchingScanned: 'No items match your search.',
    },
    mobileBottomBar: {
      rooms: 'Rooms',
      search: 'Search',
      qrLabels: 'QR Labels',
      guide: 'Guide',
    },
    imageToRoom: {
      buttonLabel: 'AI Room Scan from Photo',
      modalTitle: 'Analyze Room from Photo',
      modalSubtitle: 'Upload a room photo and AI will detect dimensions and furniture layout automatically.',
      dropzonePrompt: 'Drop photo here or click to browse',
      dropzoneHint: 'Supports JPG, PNG, WEBP up to 10MB',
      analyzing: 'Analyzing image...',
      analyzingStep1: 'Detecting room boundaries...',
      analyzingStep2: 'Estimating dimensions from scale anchors...',
      analyzingStep3: 'Recognizing furniture pieces...',
      previewTitle: 'Preview Results',
      roomDimensions: 'Room Dimensions',
      wallFloorColors: 'Wall & Floor Colors',
      detectedFurniture: 'Detected Furniture',
      noFurnitureFound: 'No furniture detected in this image.',
      confidence: 'Confidence',
      confidenceHigh: 'High',
      confidenceMedium: 'Medium',
      confidenceLow: 'Low',
      dimensionRationale: 'Estimation basis',
      createRoomBtn: 'Create Room with this Layout',
      createEmptyRoomBtn: 'Create Empty Room',
      retakeBtn: 'Pick Another Photo',
      errorNotRoom: 'Could not detect an indoor room. Please capture a clear photo of a room interior.',
      errorBlurry: 'Image is too dark or blurry. Turn on lights and try again.',
      errorTooClose: 'Photo is too close. Step back and capture the whole room.',
      errorGeneric: 'Analysis failed. Please try again.',
      emptyRoomMsg: 'Empty room detected!',
      emptyRoomSub: 'AI estimated room size and matched wall/floor tones. Would you like to create this empty room?',
      furnitureToggleAll: 'Select all',
      adjustDimensions: 'Adjust dimensions',
      newRoomNamePlaceholder: 'New room name...',
      apiKeyPrompt: 'Gemini API Key is required for room photo analysis.',
      enterApiKey: 'Enter API Key',
    },
    voiceItems: {
      buttonLabel: 'Voice Add Items (AI)',
      modalTitle: 'Add Items by Voice',
      listening: 'Listening...',
      processing: 'Processing...',
      speakNow: 'Say the names of items you want to store here...',
      retryBtn: 'Re-record',
      addMode: 'Add new',
      replaceMode: 'Replace all',
      replaceWarning: 'This will remove {{count}} existing items in {{name}}',
      previewTitle: 'Preview Before Saving',
      transcriptLabel: 'You said:',
      parsedItems: 'Parsed items:',
      noItemsParsed: 'No items detected. Try speaking more clearly.',
      diffAddSummary: 'Currently {{current}} items → Will become {{next}} (+{{added}} new)',
      diffReplaceSummary: 'Currently {{current}} items → Will become {{next}} (removes {{current}} existing)',
      confirmBtn: 'Confirm & Save',
      cancelBtn: 'Cancel',
      editTranscript: 'Edit transcript',
      parseBtn: 'Re-parse',
      sourceCloud: 'Cloud AI',
      sourceBrowser: 'On-Device AI',
      intentDetected: 'AI detected intent:',
      apiKeyPrompt: 'Gemini API Key is required for Cloud AI parsing.',
      enterApiKey: 'Enter API Key',
    },
    agentBar: {
      placeholder: 'Ask AI or give a command... (e.g. "Add a wardrobe", "Where is my laptop?")',
      placeholderMobile: 'AI command...',
      thinking: 'AI is thinking...',
      confirmPlan: 'Execute this plan?',
      cancelPlan: 'Cancel',
      executingStep: 'Executing step {{step}} of {{total}}...',
      doneMessage: 'Done!',
      errorMessage: 'Execution failed. Please try again.',
      cloudFallback: 'Using Cloud AI (browser AI not available)',
      voiceBtn: 'Voice command',
      sendBtn: 'Send',
    },
    aiLabs: {
      title: 'AI Labs & Settings',
      subtitle: 'Toggle AI features and select your preferred AI provider.',
      providerTitle: 'AI Provider',
      providerAuto: 'Auto (Recommended)',
      providerAutoDesc: 'On-device AI for voice, Cloud Gemini for image analysis.',
      providerCloud: 'Cloud Gemini Flash Lite',
      providerCloudDesc: 'All AI via server with Gemini Flash Lite.',
      providerBrowser: 'On-Device AI (Gemini Nano)',
      providerBrowserDesc: 'Process entirely in the browser. Free & private.',
      browserAvailable: 'On-Device AI Ready (Gemini Nano)',
      browserUnavailable: 'On-Device AI not available in this browser',
      featureFlagsTitle: 'AI Features',
      flagImageToRoom: 'AI Room Scan from Photo',
      flagImageToRoomDesc: 'Detect furniture and room dimensions from a photo.',
      flagVoiceToItems: 'Add Items by Voice',
      flagVoiceToItemsDesc: 'Speak item names to auto-populate storage inventory.',
      flagBrowserAgent: 'In-App AI Copilot',
      flagBrowserAgentDesc: 'Type or speak commands to let AI organize your room.',
      closeBtn: 'Close',
      apiKeyMissing: 'GEMINI_API_KEY is not configured. You can enter your API key manually below.',
      apiKeyTitle: 'Gemini API Key (Manual)',
      apiKeyDesc: 'Enter your personal API key from Google AI Studio to use Cloud AI features freely & privately.',
      apiKeyPlaceholder: 'Paste Gemini API Key (starts with AIzaSy...)',
      apiKeySave: 'Save API Key',
      apiKeySaved: 'API Key saved securely in this browser',
      apiKeyRemove: 'Remove Key',
      apiKeyStatusActive: 'Custom Key Active',
      apiKeyStatusEnv: 'Using from Environment (.env)',
      apiKeyStatusNone: 'Not Configured',
      apiKeyGetFree: 'Get a free API Key at Google AI Studio →',
    },
  },
};

/**
 * Helper hook or accessor to get dictionary for current language
 */
export function getTranslation(lang: Language): TranslationDictionary {
  return translations[lang] || translations.vi;
}
