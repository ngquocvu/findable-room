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
      newRoom: 'Thêm phòng mới',
      demo: 'Mẫu thử',
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
      smartInventoryBadge: 'Quản lý kho đồ 3D thông minh',
      title: 'Chào mừng bạn đến với RoomFindable',
      subtitle: 'Thiết kế phòng 3D trực quan, ghi nhớ vị trí từng món đồ vật, và tìm thấy mọi thứ trong tích tắc.',
      step1Title: '1. Kéo thả trong không gian 3D',
      step1Desc: 'Bố trí tủ quần áo, bàn học, giường ngủ. Nhấp và kéo rê mượt mà theo lưới phòng.',
      step2Title: '2. Lưu trữ & Sắp xếp đồ',
      step2Desc: 'Nhấp vào bất kỳ đồ vật nào để ghi lại danh sách quần áo, dây sạc, sách vở bên trong.',
      step3Title: '3. Tìm kiếm tức thì ⌘K',
      step3Desc: 'Gõ tên món đồ bất kỳ để định vị và phóng to ngay tới chỗ cất trong phòng 3D.',
      getStartedPrompt: 'Bạn muốn bắt đầu như thế nào?',
      loadDemoTitle: 'Tải phòng mẫu thử',
      loadDemoDesc: 'Khám phá phòng studio có sẵn bàn làm việc, tủ đồ, kệ sách & 15 đồ vật mẫu.',
      startFreshTitle: 'Bắt đầu phòng trống',
      startFreshDesc: 'Bắt đầu với căn phòng trống tinh để tự tay bố trí đồ đạc theo ý bạn.',
      recommended: 'Khuyên dùng',
      emptyCanvas: 'Phòng trống',
      dontShowAgain: 'Không hiển thị lại hướng dẫn này khi mở trang',
      skipForNow: 'Bỏ qua lúc này',
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
      newRoom: 'New Room',
      demo: 'Demo',
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
      smartInventoryBadge: 'Smart 3D Inventory',
      title: 'Welcome to RoomFindable',
      subtitle: 'Visually design your room in 3D, remember where every single item is stored, and find anything in seconds.',
      step1Title: '1. 3D Drag & Drop',
      step1Desc: 'Add wardrobes, desks & beds. Click & drag smoothly across your room.',
      step2Title: '2. Store & Organize',
      step2Desc: 'Double-click any furniture to catalog what items, cables, or documents are inside.',
      step3Title: '3. Instant ⌘K Search',
      step3Desc: 'Type any item name to highlight its exact 3D furniture container in real-time.',
      getStartedPrompt: 'How would you like to get started?',
      loadDemoTitle: 'Load Demo Room',
      loadDemoDesc: 'Explore a pre-built studio with desk, wardrobe, shelf & 15 categorized sample items.',
      startFreshTitle: 'Start Fresh',
      startFreshDesc: 'Begin with a clean room and add your own custom furniture and belongings from scratch.',
      recommended: 'Recommended',
      emptyCanvas: 'Empty Canvas',
      dontShowAgain: "Don't show this guide on startup",
      skipForNow: 'Skip for now',
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
  },
};

/**
 * Helper hook or accessor to get dictionary for current language
 */
export function getTranslation(lang: Language): TranslationDictionary {
  return translations[lang] || translations.vi;
}
