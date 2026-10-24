/**
 * Single source of truth for every user-facing string in the app.
 *
 * Slumbering is Vietnamese-only. This is not a locale-switching i18n layer --
 * it is one static language module resolved at compile time; there is no
 * `t()`, no locale selection, and no English counterpart file.
 *
 * Rules:
 *  - Screens, components, and logic modules import `COPY` (and `fmt`) from
 *    `../copy`. No user-facing string literals inline in JSX or logic.
 *  - Object *keys* are stable identifiers, never displayed, and must not be
 *    renamed casually -- the `as const` type ties every call site to them.
 *    Where a value doubles as a lookup key elsewhere (e.g. regularity bands),
 *    the key/label split lives in the owning module and only the label sits here.
 *  - `{name}` placeholders are filled by `fmt()`. Vietnamese has no plural
 *    inflection, so a template carries one form and callers pass the count.
 *  - Arrays are date-seeded message pools (see lib/dateSeed.ts). Order is not
 *    significant; keep at least 2 entries so the "no repeat day-to-day" rule
 *    has something to pick from.
 *  - The "Slumbering" wordmark and the English badge titles
 *    (`achievements.badges.*.name`) are deliberately left in English.
 */

export const COPY = {
  common: {
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    save: 'Lưu',
    back: 'Quay lại',
    edit: 'Sửa',
    add: 'Thêm',
    gotIt: 'Đã rõ',
    nice: 'Tuyệt vời!',
    yes: 'Có',
    no: 'Không',
    continue: 'Tiếp tục',
    continueAnyway: 'Vẫn tiếp tục',
    changeGoal: 'Sửa mục tiêu',
    home: 'Trang chủ',
  },

  greeting: {
    firstTime: 'Xin chào',
    returning: 'Chào mừng trở lại',
    morning: 'Chào buổi sáng',
    afternoon: 'Chào buổi chiều',
    evening: 'Chào buổi tối',
  },

  home: {
    /** {greeting}, {name}! */
    greetingWithName: '{greeting}, {name}!',
    greetingWithoutName: '{greeting}!',
    goalsStatus: {
      checkInQuestion: 'Bạn đã đạt được mục tiêu của mình chứ?',
      pickGoals: 'Chọn mục tiêu cho tối nay',
      /** {count} goal(s) to review */
      goalsToReview: '{count} mục tiêu để kiểm tra',
      takesLessThanMinute: 'Cần ít hơn 1 phút để hoàn thành',
      tonightsGoals: "Mục tiêu tối nay",
      edit: 'Sửa',
    },
    /** {count}-night streak */
    streak: '{count} đêm liên tiếp',
    journeyPreview: {
      header: 'Hành trình · Tuần vừa qua',
      seeAll: 'Xem toàn bộ →',
      /** {count} night(s) logged, drawn among the stars */
      nightsLogged: '{count} đêm hòa mình vào bầu trời sao',
      journeyStartsTonight: 'Hành trình của bạn bắt đầu từ hôm nay.',
      /** Strong point: {category} */
      strongPoint: 'Điểm mạnh: {category}',
    },
    bedtimePanel: {
      header: 'Lịch ngủ',
      bedtimeField: 'Đi ngủ',
      wakeField: 'Thức dậy',
      /** Sleep duration · {hours}h {minutes}m */
      sleepDuration: 'Thời lượng · {hours}h {minutes}m',
    },
  },

  goalCategories: {
    bedtime: 'Đi ngủ',
    windDown: 'Định tâm',
    relaxation: 'Thả lỏng',
    custom: 'Mục tiêu khác',
  },

  goalPicker: {
    headline: 'Chọn mục tiêu cho tối nay',
    tip: 'Mách bạn: Hãy chỉ đặt 1-2 mục tiêu để tập trung vào những điều quan trọng nhất.',
    unhealthyBedtimeDisclaimer:
      'Các chuyên gia về giấc ngủ thường khuyên nên đi ngủ sớm hơn. Bạn có muốn tiếp tục với mục tiêu này không?',
    /** {count} selected */
    selectedCount: 'Đã chọn {count}',
    addYourOwn: 'Thêm mục tiêu...',
    add: 'Thêm',
    confirmGoals: 'Xác nhận mục tiêu',
  },

  tonightConfirmation: {
    headline: "Mục tiêu của tối nay là",
    editGoals: 'Sửa mục tiêu',
    restWell: "Nghỉ ngơi thật tốt. Hẹn gặp lại bạn vào ngày mai.",
    toastSaved: 'Đã lưu mục tiêu cho tối nay',
  },

  checkIn: {
    headlineSleep: 'Đêm hôm qua của bạn thế nào?',
    headlineGoalsOnly: 'Bạn đã đạt được mục tiêu của mình chứ?',
    reportActualTimes: 'Hãy điều chỉnh chúng nếu chưa chính xác, sau đó xác nhận lại.',
    bedtimeField: 'Đi ngủ',
    wakeField: 'Thức dậy',
    /** Post-check-in toast, keyed by how much of the night's goals were achieved. */
    toast: {
      full: [
        'Làm tốt lắm!',
        'Bạn đã giữ lời hứa với chính mình.',
        'Bạn đã hoàn thành xuất sắc các mục tiêu.',
      ],
      partial: [
        'Bạn đang làm tốt.',
        'Mọi tiến bộ đều đáng quý.',
        'Tiếp tục cố gắng nhé.',
      ],
      none: [
        'Đã lưu bản ghi.',
        'Cảm ơn bạn đã lưu lại tiến độ.',
        'Ngày mai lại là một khởi đầu mới.',
      ],
    },
    /** Feedback comparing reported sleep times against the plan. */
    sleepFeedback: {
      onPlan: ['Đúng như kế hoạch của bạn.', 'Chính xác như bạn đã dự tính.'],
      shorterThanPlanned: [
        'Bạn nghỉ ngơi ít hơn dự định. Hãy nhẹ nhàng với bản thân mình hôm nay nhé.',
        'Bạn ngủ ít hơn dự định. Hãy nghỉ ngơi thật tốt tối nay nhé.',
      ],
      longerThanPlanned: [
        'Một đêm dài hơn dự tính. Hy vọng bạn đã nghỉ ngơi đủ.',
        'Bạn nghỉ lâu hơn dự tính. Mong là bạn cảm thấy khỏe.',
      ],
    },
  },

  addPastRecord: {
    titleEdit: 'Sửa bản ghi',
    titleAdd: 'Thêm bản ghi',
    dateLabel: 'Ngày',
    goalsLabel: 'Mục tiêu',
    goalsOptionalHint: 'Tùy chọn — thêm vào nếu bạn nhớ những mục tiêu mình đã đặt ra cho đêm đó.',
    didYouAchieve: 'Bạn đã đạt được mục tiêu chứ?',
    sleepScheduleLabel: 'Lịch ngủ',
    sleepOptionalHint: 'Tùy chọn — thêm vào nếu bạn nhớ giờ ngủ của mình đêm đó.',
    addYourOwn: 'Thêm mục tiêu...',
    add: 'Thêm',
    setDate: 'Ngày',
    bedtimeField: 'Đi ngủ',
    wakeField: 'Thức dậy',
    toastInvalidDate: 'Nhập ngày hợp lệ (dd/mm/yy)',
    toastFutureDate: 'Hãy chọn một ngày trước hôm nay',
    toastDuplicate: 'Đã có bản ghi cho ngày đó',
    toastUpdated: 'Bản ghi đã được cập nhật',
    toastAdded: 'Bản ghi đã được thêm vào',
  },

  journey: {
    screenTitle: 'Hành trình',
    /** {count} night(s) logged */
    nightsLogged: '{count} đêm đã ghi nhận',
    /** {count} fully successful, all-time */
    successfulAllTime: '{count} đêm thành công',
    /** {count}-night longest streak */
    longestStreak: '{count} đêm liên tiếp (dài nhất)',
    timelineEmpty: 'Chưa có bản ghi nào. Sau khi hoàn thành việc kiểm tra tiến độ, hành trình của bạn sẽ hiển thị tại đây.',
    addedLater: ' · thêm sau',
    successRingLabel: 'Thành công',
    milestoneProgress: 'Còn {count} đêm cho đến mốc {label}',
    majorMilestone: '{count} đêm thành công!',
    engagementFirst: 'Đêm đầu tiên với Slumbering.',
    engagementMany: '{count} đêm với Slumbering.',
  },

  companion: {
    homeMessages: {
      firstTime: ['Hãy bắt đầu với một mục tiêu đơn giản.', 'Sẵn sàng bắt đầu?'],
      returning: [
        "Hãy tiếp tục từ chỗ bạn đã dừng lại.",
        "Rất vui được gặp lại bạn.",
        "Hành trình của bạn vẫn còn ở đây bất cứ khi nào bạn sẵn sàng.",
        "Cảm ơn vì đã quay lại.",
        "Không bao giờ là quá muộn để bắt đầu lại.",
      ],
      streak3to6: ["Bạn đang tạo đà.", "Hãy tiếp tục nhé!"],
      streak7: ['Cả một tuần kiên trì.', 'Một tuần đầy năng lượng!'],
      streak30: ['Chuỗi điểm danh liên tục trong một tháng. Thật tuyệt vời!', 'Bạn đã kiên trì trong 30 ngày. Cứ tiếp tục như vậy nhé!'],
      goalStatusAllAchieved: [
        'Tối nay bạn đã giữ đúng lời hứa với chính mình.',
        'Một đêm thành công nữa đã được ghi nhận.',
        'Giỏi lắm. Hẹn gặp lại ngày mai!',
      ],
      goalStatusPartial: ['Nỗ lực của bạn hôm nay rất đáng quý.', 'Cảm ơn nỗ lực của bạn.'],
      goalStatusNone: ['Ngày mai lại là một cơ hội mới.'],
      default: [
        'Chúc bạn một ngày tốt lành.',
        'Mong đêm nay sẽ thuận lợi cho bạn.',
        'Sẵn sàng cho những mục tiêu tối nay chưa?',
        'Cảm ơn bạn đã ghé đến.',
      ],
    },
    todaysActions: {
      newUser: ['Đặt mục tiêu giấc ngủ đầu tiên của bạn.'],
      beforeGoals: ['Tối nay bạn muốn thử điều gì?', 'Bạn muốn đạt được điều gì tối nay?'],
      afterGoalsSameDay: ['Bạn đã sẵn sàng cho tối nay rồi!', 'May mắn nhé!'],
      beforeCheckInNextDay: ['Đêm qua của bạn thế nào?'],
    },
  },

  bedtime: {
    screenTitle: 'Lịch ngủ',
    tabs: { week: 'Tuần', month: 'Tháng' },
    /** {monthWord} 8, 2026 */
    monthWord: 'Tháng',
    cardHeaders: { bedtime: 'Đi ngủ', wakeup: 'Thức dậy', duration: 'Thời lượng' },
    graph: {
      /** Target {value} */
      target: 'Mục tiêu: {value}',
      /** Average {value} */
      average: 'Trung bình: {value}',
      noData: 'Chưa có dữ liệu',
      /** {hours}h {minutes}m */
      duration: '{hours}h {minutes}m',
    },
    regularity: {
      verySteady: 'Rất đều đặn',
      fairlySteady: 'Tương đối đều đặn',
      aBitVariable: 'Hơi biến thiên',
      quiteVariable: 'Khá biến thiên',
    },
    recommendationCategories: {
      duration: 'Thời lượng',
      regularity: 'Độ đều đặn',
      bedtime: 'Đi ngủ',
      wakeUp: 'Thức dậy',
      tips: 'Mẹo giúp ngủ ngon hơn',
    },
    recommendationPools: {
      duration: [
        'Thông thường, thanh thiếu niên cần 8-10 giờ ngủ mỗi đêm để hỗ trợ sự phát triển và học tập lành mạnh.',
        'Ngủ đủ giấc (8-10 giờ mỗi ngày) có thể giúp bạn cảm thấy tập trung hơn, tràn đầy năng lượng, và sẵn sàng cho một ngày mới.',
        'Duy trì một thói quen trước khi ngủ đều đặn có thể tạo ra sự khác biệt đáng kể.',
      ],
      regularity: [
        'Hãy cố gắng đi ngủ và thức dậy vào những thời điểm tương tự nhau mỗi ngày, kể cả cuối tuần.',
        'Một lịch trình ngủ đều đặn giúp cơ thể bạn duy trì đồng hồ sinh học khỏe mạnh.',
        'Giữ giờ ngủ đều đặn có thể giúp bạn dễ dàng đi vào giấc ngủ và thức dậy một cách tự nhiên.'
      ],
      bedtime: [
        'Đi ngủ sớm hơn có thể giúp cơ thể bạn có thêm thời gian để ngủ đủ giấc.',
        'Đi ngủ sớm hơn thường liên quan đến thói quen ngủ tốt hơn và sức khỏe tổng thể tốt hơn.',
        'Dần dần điều chỉnh giờ đi ngủ sớm hơn có thể là một cách dễ dàng để cải thiện thói quen ngủ của bạn.'
      ],
      wakeUp: [
        'Thức dậy vào một giờ cố định có thể giúp cơ thể bạn thiết lập một nhịp sinh học ổn định.',
        'Tiếp xúc với ánh nắng mặt trời buổi sáng có thể giúp thiết lập lại đồng hồ sinh học và hỗ trợ giấc ngủ ngon hơn vào ban đêm.',
        'Hãy dành đủ thời gian để thức dậy mà không cần vội vã, để bạn có thể bắt đầu ngày mới với tinh thần sảng khoái.'
      ],
      tips: [
        'Hãy cất điện thoại và các thiết bị màn hình khác đi ít nhất 30 phút trước khi đi ngủ.',
        'Giữ phòng ngủ mát mẻ, yên tĩnh, thoải mái và càng tối càng tốt.',
        'Tránh dùng caffeine vào buổi chiều và tối để dễ ngủ hơn.',
        'Thư giãn bằng một hoạt động nhẹ nhàng như đọc sách, tập thể dục hoặc nghe nhạc nhẹ.',
        'Hãy dành một chút thời gian để thư giãn trước khi đi ngủ thay vì đi thẳng từ chỗ làm về phòng ngủ.'
      ],
    },
    scheduleWarnings: {
      lateAndShort:
        'Đây là giờ đi ngủ rất muộn, và bạn ngủ chưa đến 6 tiếng. Các chuyên gia về giấc ngủ thường khuyên nên đi ngủ sớm hơn và ngủ nhiều hơn.',
      late: 'Đây là giờ đi ngủ rất muộn. Các chuyên gia về giấc ngủ thường khuyên nên đi ngủ sớm hơn.',
      short: 'Bạn ngủ ít hơn 6 tiếng với lịch trình này. Các chuyên gia về giấc ngủ thường khuyên nên ngủ nhiều hơn.',
    },
  },

  sound: {
    screenTitle: 'Audio',
    setTitles: {
      meditation: 'Chánh niệm',
      colorNoise: 'Tiếng ồn màu',
      ambient: 'Âm thanh thiên nhiên',
    },
    trackNames: {
      meditationBodyScanShort: 'Body Scan (rút gọn)',
      meditationBodyScanFull: 'Body Scan (đầy đủ)',
      noiseWhite: 'Tiếng ồn trắng',
      noisePink: 'Tiếng ồn hồng',
      noiseBrown: 'Tiếng ồn nâu',
      ambientRain: 'Tiếng mưa rơi',
      ambientForest: 'Rừng cây',
      ambientBeach: 'Sóng biển',
    },
    play: 'Phát',
    pause: 'Tạm dừng',
    downloaded: 'Đã tải về',
    downloading: 'Đang tải…',
    downloadFailed: 'Chưa tải được âm thanh. Bạn thử lại nhé.',
    downloadUnavailable: 'Âm thanh chưa sẵn sàng để tải về.',
  },

  settings: {
    title: 'Cài đặt',
    sections: {
      profile: 'Hồ sơ',
      reminders: 'Lời nhắc',
      appearance: 'Giao diện',
      backup: 'Sao lưu & Khôi phục',
    },
    profilePlaceholder: 'Tên bạn',
    reminders: {
      setGoals: 'Nhắc đặt mục tiêu',
      checkIn: 'Nhắc kiểm tra tiến độ',
      windDown: 'Nhắc nghỉ ngơi',
      windDownHint: '10 phút trước giờ ngủ trong kế hoạch',
      permissionDenied: 'Bật thông báo của Slumbering trong Cài đặt Hệ thống để kích hoạt tính năng này.',
    },
    appearance: {
      theme: 'Chế độ',
      textSize: 'Cỡ chữ',
      light: 'Sáng',
      dark: 'Tối',
      small: 'Nhỏ',
      medium: 'Vừa',
      large: 'Lớn',
    },
    backup: {
      export: 'Xuất bản sao lưu',
      import: 'Nhập bản sao lưu',
      toastExported: 'Đã xuất bản sao lưu',
      toastExportFailed: 'Không thể xuất bản sao lưu',
      toastInvalidJson: 'Hãy nhập một tệp JSON hợp lệ',
      toastInvalidShape: "Hãy nhập một tệp sao lưu của Slumbering",
      toastRestored: 'Đã khôi phục bản sao lưu',
      toastImportFailed: 'Không thể nhập bản sao lưu',
      confirmTitle: 'Thay thế dữ liệu hiện tại?',
      confirmMessage: 'Việc nhập dữ liệu sẽ thay thế tất cả mục tiêu, lịch sử hành trình, và cài đặt hiện tại.',
      confirmCancel: 'Hủy',
      confirmImport: 'Nhập',
      exportDialogTitle: 'Xuất bản sao lưu của Slumbering',
    },
  },

  onboarding: {
    orient: {
      headline: 'Ngủ ngon hơn, từng bước một.',
      body: 'Slumbering giúp bạn tái thiết lập thói quen ngủ. Bạn chỉ cần vài mục tiêu nhỏ và 10 giây mỗi ngày để nhìn lại giấc ngủ của mình.',
      loop: ['Chọn mục tiêu', 'Ngủ thật ngon', 'Kiểm tra tiến độ'],
      repeats: 'Lặp lại mỗi ngày',
    },
    dailyActions: {
      headline: 'Mỗi ngày chỉ cần hai việc đơn giản',
      eveningLabel: 'Buổi tối',
      eveningBody: 'Chọn 1-2 mục tiêu nhỏ cho tối nay, như dành một chút thời gian để thư giãn hoặc hạn chế dùng thiết bị điện tử trước khi ngủ.',
      morningLabel: 'Sáng hôm sau',
      morningBody:
        'Dành vài giây nhìn lại đêm qua. Giờ ngủ sẽ được điền sẵn theo kế hoạch của bạn. Nếu đúng thì cứ giữ nguyên, còn nếu chưa đúng, bạn có thể chỉnh lại. Lỡ bỏ qua một mục tiêu cũng không sao.',
      reassurance: 'Không đạt được mục tiêu không có nghĩa là bạn thất bại. Chỉ cần bạn vẫn tiếp tục, vậy là đã rất đáng ghi nhận rồi.',
    },
    featureMap: {
      headline: 'Mỗi bước nhỏ đều đáng ghi nhận',
      features: [
        { name: 'Trang chủ', body: 'Bắt đầu một ngày mới của bạn.' },
        { name: 'Hành trình', body: 'Xem chuỗi ngày, huy hiệu và những tối bạn đã ghi nhận.' },
        { name: 'Lịch ngủ', body: 'Theo dõi cách giờ ngủ của bạn dần trở nên đều đặn hơn.' },
      ],
      settingsLine: 'Cài đặt — cá nhân hóa Slumbering theo cách của bạn.',
      remindersCallout: 'Muốn nhận được lời nhắc khi đến giờ thực hiện mục tiêu hoặc kiểm tra tiến độ? Bật Thông báo →',
      permissionDenied: 'Hãy bật thông báo cho Slumbering trong Cài đặt Hệ thống để sử dụng tính năng này.',
    },
    setup: {
      eyebrow: 'Rất vui được gặp bạn',
      headline: "Cùng cài đặt Slumbering nhé",
      whatToCallYou: 'Mình nên gọi bạn là gì?',
      namePlaceholder: 'Tên của bạn',
      nameHint: 'Cá nhân hóa Slumbering. Bạn có thể thêm hoặc thay đổi mục này sau trong Cài đặt.',
      theme: 'Chủ đề',
      light: 'Sáng',
      dark: 'Tối',
    },
    skip: 'Bỏ qua',
    next: 'Tiếp',
    back: 'Quay lại',
    turnOnReminders: 'Bật Lời nhắc',
    remindersOn: 'Lời nhắc đã bật',
    getStarted: 'Bắt đầu thôi',
  },

  achievements: {
    celebration: {
      congratulations: 'Chúc mừng!',
      newAchievementOne: 'Thành tựu mới!',
      newAchievementMany: 'Thành tựu mới!',
    },
    badges: {
      firstStep: { name: 'First Step', description: 'Hoàn thành kiểm tra tiến độ lần đầu tiên' },
      fullWeek: { name: 'Full Week', description: '7 đêm liên tiếp đạt được ít nhất một mục tiêu.' },
      oneMonth: { name: 'One Month', description: '30 đêm với Slumbering.' },
      welcomeBack: { name: 'Welcome Back', description: 'Quay trở lại sau vài ngày vắng bóng.' },
      goGetter: { name: 'Go-getter', description: 'Đạt được 50 mục tiêu.' },
      fullNight: { name: 'Full Night', description: '10 đêm ngủ đủ giấc.' },
      steadyRhythm: { name: 'Steady Rhythm', description: 'Giữ giờ ngủ đều đặn trong 2 tuần liên tiếp.' },
    },
  },

  notifications: {
    setGoals: { title: 'Đặt mục tiêu cho tối nay', body: 'Một vài mục tiêu nhỏ có thể tạo nên khác biệt lớn.' },
    checkIn: { title: 'Kiểm tra tiến độ', body: 'Đêm qua của bạn thế nào?' },
    windDown: { title: 'Thư giãn', body: 'Đã đến lúc bắt đầu thư giãn và chìm vào giấc ngủ.' },
  },

  scheduleWarningModal: {
    back: 'Quay lại',
    continueAnyway: 'Vẫn tiếp tục',
  },

  disclaimer: {
    changeGoal: 'Thay đổi mục tiêu',
    continue: 'Tiếp tục',
  },

  suggestedGoalsDefaults: {
    bedtime: ['Đi ngủ trước 23:00', 'Lên giường vào 22:45', 'Thức dậy lúc 6:30'],
    windDown: ["Tắt toàn bộ thiết bị điện tử 30 phút trước khi đi ngủ", "Đọc 10 trang sách trước khi ngủ"],
    relaxation: ['Tập giãn cơ 10 phút trước khi ngủ', 'Tập hít thở hoặc thiền định trong 5 phút trước khi đi ngủ'],
  },
} as const;

export type Copy = typeof COPY;
