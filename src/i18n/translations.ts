export type Language = "en" | "es";

export interface Translations {
  // Navigation & Header
  navDashboard: string;
  navBuySignals: string;
  navHeatmap: string;
  navNewsFeed: string;
  navGuide: string;
  navPythonCode: string;
  navAlertsLog: string;
  navConfig: string;
  navAiManager: string;
  navPricing: string;
  navArchitecture: string;
  hftEngine: string;
  connected: string;
  connecting: string;
  simulated: string;
  sellSpike: string;
  wallBreak: string;
  liqCascade: string;
  quickSelect: string;
  searchCrypto: string;
  addCustomCrypto: string;
  customCryptoPlaceholder: string;
  language: string;

  // Tab navigation controls
  moveLeft: string;
  moveRight: string;
  reorderTabs: string;
  allSectionsMenu: string;
  deleteChannelTooltip: string;
  restoreDefaultChannels: string;

  // Market Heatmap
  heatmapTitle: string;
  heatmapSubtitle: string;
  metricRiskIndex: string;
  metricVolatility: string;
  metricVolume: string;
  metricSellRatio: string;
  metricLiquidations: string;
  sortBy: string;
  sortByRisk: string;
  sortByVol: string;
  sortByVolume: string;
  sortBySellRatio: string;
  viewGrid: string;
  viewMatrix: string;
  viewTreemap: string;
  monitorPair: string;
  liveFeed: string;
  legendNormal: string;
  legendElevated: string;
  legendHighRisk: string;
  legendFlashCrash: string;

  // Risk Dashboard
  riskIndexTitle: string;
  riskIndexSubtitle: string;
  riskStatusNormal: string;
  riskStatusElevated: string;
  riskStatusHighRisk: string;
  riskStatusFlashCrash: string;
  tickerTitle: string;
  change1m: string;
  change5m: string;
  change1h: string;
  change24h: string;
  change1w: string;
  change1M: string;
  dropMetricLabel: string;
  timeframePerformanceLabel: string;
  multiTimeframeMatrixTitle: string;
  minPriceLabel: string;
  maxPriceLabel: string;
  potentialGainLabel: string;
  maxGainLabel: string;
  maxDropLabel: string;
  drawdownFromHighLabel: string;

  // Rules Cards
  rule1Title: string;
  rule1Subtitle: string;
  sellVolumeRatio5m: string;
  sellVolumeZScore: string;
  volumeAcceleration: string;
  normalRatioRange: string;

  rule2Title: string;
  rule2Subtitle: string;
  nearestBuyWall: string;
  wallConsumption: string;
  wallIntact: string;
  remainingQty: string;

  rule3Title: string;
  rule3Subtitle: string;
  liquidations1m: string;
  longCount1m: string;
  cascadeRisk: string;
  noRecentCascade: string;

  orderBookTitle: string;
  orderBookSubtitle: string;
  minWallSize: string;
  bidPrice: string;
  askPrice: string;
  size: string;
  depthValue: string;

  // Threshold Config
  configTitle: string;
  configSubtitle: string;
  section1Title: string;
  targetCryptoPair: string;
  activeStreamNote: string;
  slidingWindowSec: string;
  slidingWindowHelp: string;

  section2Title: string;
  zScoreThreshold: string;
  zScoreHelp: string;
  sellRatioThreshold: string;
  sellRatioHelp: string;

  section3Title: string;
  minBuyWallSize: string;
  minBuyWallHelp: string;
  wallChewThreshold: string;
  wallChewHelp: string;

  section4Title: string;
  longLiqSpike: string;
  longLiqHelp: string;

  section5Title: string;
  webhookUrl: string;
  webhookHelp: string;
  tgBotToken: string;
  tgChatId: string;
  soundAlerts: string;
  alarmSoundTypeLabel: string;
  alarmSoundTypeHelp: string;
  testAlarmSoundBtn: string;

  saveConfigBtn: string;
  testWebhookBtn: string;
  sendingBtn: string;
  clearLogsBtn: string;

  // AI Analyst
  aiTitle: string;
  aiSubtitle: string;
  aiPromptHeader: string;
  synthesizeRiskPrompt: string;
  orderBookAbsorptionPrompt: string;
  stopLossPrompt: string;
  customPromptPlaceholder: string;
  generateReportBtn: string;
  analyzingBtn: string;
  generatingReport: string;
  reportSuccess: string;
  reportError: string;

  // Alerts Log
  alertsTitle: string;
  alertsSubtitle: string;
  filterAll: string;
  filterFlashCrash: string;
  filterCritical: string;
  filterWarning: string;
  filterInfo: string;
  noAlerts: string;
  copyMarkdown: string;
  copiedMarkdown: string;
  viewPayload: string;

  // Python Code
  pythonTitle: string;
  pythonSubtitle: string;
  monolithTab: string;
  installStep: string;
  runStep: string;
  copyCodeBtn: string;
  downloadCodeBtn: string;
  copyFileBtn: string;
  copiedBtn: string;
  downloadPyBtn: string;

  // Architecture Docs
  archTitle: string;
  archSubtitle: string;
  archSection1Title: string;
  archSection1Text: string;
  archSection2Title: string;
  archSection2Text: string;
  archSection3Title: string;
  archSection3Text: string;

  // News & Channels
  newsFeedTitle: string;
  newsFeedSubtitle: string;
  addChannel: string;
  refreshFeed: string;
  refreshing: string;
  searchPlaceholder: string;
  allActiveChannels: string;
  allCategories: string;
  allSentiments: string;
  bullishTag: string;
  bearishTag: string;
  highImpactTag: string;
  neutralTag: string;
  activeChannelsList: string;
  expandChannels: string;
  collapseChannels: string;
  resetDefaults: string;
  addCustomFeedUrl: string;
  showingHeadlines: string;
  headlines: string;
  lastSync: string;
  fetchingUpdates: string;
  parsingRss: string;
  noNewsMatch: string;
  tryClearingFilters: string;
  resetAllFilters: string;
  readArticle: string;
  addCustomModalTitle: string;
  channelName: string;
  channelNamePlaceholder: string;
  feedUrl: string;
  categoryTag: string;
  iconEmoji: string;
  cancelBtn: string;
  saveChannelBtn: string;
  enterChannelNameErr: string;
  enterValidUrlErr: string;
  mutedStatus: string;
  liveSyncActive: string;
  updatedAgo: string;
  sourceText: string;
  categoryNews: string;
  categoryOnChain: string;
  categoryMacro: string;
  categoryAlerts: string;
  categoryCustom: string;
  newsAlertsTitle: string;
  bullishAlertToggle: string;
  bearishAlertToggle: string;
  simBullishNewsBtn: string;
  simBearishNewsBtn: string;
  newsAlertSound: string;
  newsAlertsActive: string;
  dispatchWebhooksNews: string;
  breakingNewsToastTitle: string;
  navSellSignals: string;
  sellSignalTitle: string;
  sellSignalSubtitle: string;
  sellPillarMfi: string;
  sellPillarLiqs: string;
  sellPillarFunding: string;
  sellPillarResistance: string;
  sellExecutionLevels: string;
  shortEntryZone: string;
  stopLossCeiling: string;
  takeProfitMeanRev: string;
  takeProfitDeepSweep: string;
  distributionThesis: string;
  pushSellAlertTelegram: string;

  // VWAP & EMA Trend Scanner
  navVwapScanner: string;
  vwapScannerTitle: string;
  vwapScannerSubtitle: string;
  vwapPillarVwap: string;
  vwapPillarEma: string;
  vwapPillarCrossover: string;
  vwapPillarSpread: string;
  vwapExecutionTargets: string;
  entryZoneLabel: string;
  stopLossLabel: string;
  takeProfit1Label: string;
  takeProfit2Label: string;
  riskRewardLabel: string;
  vwapQuantThesis: string;
  pushVwapAlertTelegram: string;
  timeframeLabel: string;
  trendStatusLabel: string;
  audioAlertsLabel: string;
  muteAlertsLabel: string;

  // Cryptocurrency Management
  manageCryptos: string;
  cryptoManagerTitle: string;
  cryptoManagerSubtitle: string;
  activeCryptos: string;
  discoverCryptos: string;
  customCryptoPair: string;
  addCryptoBtn: string;
  removeCryptoBtn: string;
  cryptoAddedSuccess: string;
  cryptoRemovedSuccess: string;
  cantRemoveLastCrypto: string;
  cryptoAlreadyInList: string;
  resetDefaultCryptos: string;
  resetDefaultConfirm: string;
  searchAddPlaceholder: string;
  customSymbolLabel: string;
  customSymbolHelp: string;
  customNameLabel: string;
  defaultWallSizeLabel: string;
  verifyingSymbol: string;
  symbolValid: string;
  symbolNotFound: string;
  categoryAll: string;
  categoryAi: string;
  categoryL1L2: string;
  categoryDefi: string;
  categoryMeme: string;
  inWatchlist: string;
  addToWatchlist: string;
  removeFromWatchlist: string;
  quickAddSuggestions: string;

  // Shared Scanner & Common Labels
  syncingText: string;
  liveSpotBadge: string;
  eventsUnit: string;
  allLabel: string;
  noneLabel: string;
  showLabel: string;
  hideLabel: string;
  activeLabel: string;
  optionalLabel: string;
  copiedLabel: string;
  copyUserLabel: string;
  proBadge: string;
  premiumBadge: string;
  shieldActiveBadge: string;
  crashWarningBadge: string;
  whyThisAlertBtn: string;
  whyThisAlertTooltip: string;
  receiveTelegram247Btn: string;
  viewTechDetailsBtn: string;
  rule75Badge: string;
  hideNoiseTooltip: string;
  showNoiseTooltip: string;
  hidingNoiseLabel: string;
  lowerScoringSuffix: string;
  filteredSuffix: string;
  manageCryptosShort: string;
  inspectFilteredSetups: string;
  only75SetupsShown: string;
  scanningHighProbTitle: string;
  scanningSetupsEllipsis: string;
  dispatchingLabel: string;
  pushToTelegramLabel: string;
  audioOnLabel: string;
  mutedUpperLabel: string;
  muteAudioAlertsTitle: string;
  enableAudioAlertsTitle: string;
  audioAlertSettingsTitle: string;
  soundNotificationsLabel: string;
  enabledUpperLabel: string;
  alertSoundStyleLabel: string;
  testSoundLabel: string;
  volumeLabel: string;
  triggerAtScoreLabel: string;
  awaitingNextScannerConfirm: string;
  spotLabel: string;
  entryZoneShort: string;
  targetTp1Short: string;
  stopLossShort: string;
  target1Tp1_15R: string;
  target2Tp2_25R: string;
  stopLossSafetyCap: string;
  futuresFundingLabel: string;

  // RiskDashboard Localized Keys
  rdConnectingTitle: string;
  rdConnectingDesc: string;
  rdProtectionDeskLabel: string;
  rdThermometerTitle: string;
  rdRiskIndexUnit: string;
  rdSlidingWindow15s: string;
  rdStatusLowBadge: string;
  rdStatusLowDesc: string;
  rdStatusModBadge: string;
  rdStatusModDesc: string;
  rdStatusHighBadge: string;
  rdStatusHighDesc: string;
  rdScaleSafe: string;
  rdScaleCaution: string;
  rdScaleHighRisk: string;
  rdScaleFlashCrash: string;
  rdDrift1m: string;
  rdDrift5m: string;
  rdRecentPeak: string;
  rdQuickGuideBadge: string;
  rdNextAction: string;
  rdGuideLowTitle: string;
  rdGuideLowDesc: string;
  rdGuideModTitle: string;
  rdGuideModDesc: string;
  rdGuideHighTitle: string;
  rdGuideHighDesc: string;
  rdBtnInspectVwap: string;
  rdBtnScanBuy: string;
  rdBtnCheckSell: string;
  rdAuthenticBinanceBadge: string;
  rdMatrixTitle: string;
  rdPotentialUpside: string;
  rdMaxDropLegend: string;
  rdTf24hHeader: string;
  rdFetchingKlines: string;
  rdPeakPrice: string;
  rdFloorPrice: string;
  rdPositionInRange: string;
  rdBuySellPressureTitle: string;
  rdBuySellPressureSub: string;
  rdBuyersLabel: string;
  rdSellersLabel: string;
  rdBuyersControl: string;
  rdSellersControl: string;
  rdVolumeBalanced: string;
  rdVolume5mTotal: string;
  rdNearestSupportTitle: string;
  rdNearestSupportSub: string;
  rdKeyDefenseFloor: string;
  rdCalculatingFloor: string;
  rdSupportDesc: string;
  rdSupportStatusLabel: string;
  rdAbsorbedSuffix: string;
  rdFirmSupport: string;
  rdLiqCascadesTitle: string;
  rdLiqCascadesSub: string;
  rdLast1mLiqs: string;
  rdSyncingLiqs: string;
  rdLiqCascadesDesc: string;
  rdAlertStateLabel: string;
  rdCascadeActive: string;
  rdOrderlyMarket: string;
  rdLiveDepthBadge: string;
  rdOrderBookTitle: string;
  rdMinWallSizeLabel: string;
  rdBidsColHeader: string;
  rdAsksColHeader: string;
  rdVolumeColHeader: string;
  rdTotalUsdColHeader: string;
  rdSyncingBids: string;
  rdSyncingAsks: string;
  rdWallBadge: string;
  rdInstitutionalTrendBadge: string;
  rdBullishTrend: string;
  rdBearishTrend: string;
  rdConsolidatingTrend: string;
  rdOpenCompleteScanner: string;
  rdVwapAnchor1h: string;
  rdEmaFast9: string;
  rdEmaSlow21: string;
  rdEmaSpread: string;
  rdTeaserTitle: string;
  rdTeaserDesc: string;
  rdTeaserBtn: string;

  // BuySignalScanner Localized Keys
  buyScannerTitle: string;
  buyScannerSubtitle: string;
  buyCrashBlockedMsg: string;
  buyLinkTelegramErr: string;
  buyPushSuccessPrefix: string;
  buyPushError: string;
  buyPushNetworkErr: string;
  monitoringAssetsPrefix: string;
  monitoringAssetsSuffix: string;
  buyAudioPanelTitle: string;
  buySoundArpeggioOption: string;
  scanNowBtn: string;
  buyTelegramBtn: string;
  buyAudioToastTitle: string;
  buyAudioToastAsset: string;
  buyAudioToastMiddle: string;
  buyCrashBannerRiskPrefix: string;
  buyCrashBannerBadge: string;
  buyCrashBannerTitle: string;
  buyCrashBannerDesc: string;
  buyCrashAntiContradictionTitle: string;
  buyCrashAntiContradictionDesc: string;
  buyMatrixTitle: string;
  buyFilterActive: string;
  buyFilterStrongBuy: string;
  buyFilterOversold: string;
  buyFilterHighScore: string;
  buyCardHumanBanner: string;
  buyAnalyzeBtn: string;
  buyEmptyNoiseDescPrefix: string;
  buyEmptyNoiseDescSuffix: string;
  buySyncingTitle: string;
  buySyncingDesc: string;
  buyHighConvictionDetected: string;
  buyFavorabilityScore: string;
  buyHighReboundProb: string;
  buyExecutionBlueprint: string;
  buyEntryZoneFull: string;
  buyPillar1Title: string;
  buyPillar1Desc: string;
  buyPillar2Title: string;
  buyPillar2Desc: string;
  buyPillar3Desc: string;
  buyPillar4Title: string;
  buyPillar4BidsSuffix: string;
  buyPillar4Desc: string;
  buyConfirmedTriggersTitle: string;
  buyTrigMfi: string;
  buyTrigLiq: string;
  buyTrigFunding: string;
  buyTrigAbsorption: string;
  buyLowScoreDescPrefix: string;
  buyLowScoreDescSuffix: string;

  // SellSignalScanner Localized Keys
  sellBadgeDistribution: string;
  sellLiveSyncLabel: string;
  sellPauseScanTooltip: string;
  sellResumeScanTooltip: string;
  sellAudioPanelTitle: string;
  sellMinThresholdLabel: string;
  sellThreshAll: string;
  sellThreshMod: string;
  sellThreshStrong: string;
  sellAlarmToneLabel: string;
  sellDistChimeOption: string;
  sellTestAlarmBtn: string;
  sellAudioTriggeredLabel: string;
  sellLinkTelegramErr: string;
  sellPushSuccessPrefix: string;
  sellPushFail: string;
  sellNetworkErr: string;
  sellSyncingTitle: string;
  sellSyncingDesc: string;
  sellAwaitingNextUpdate: string;
  sellDistDetectedBadge: string;
  sellDistributionScore: string;
  sellHighSellingPressure: string;
  sellExecutionPlanAtr: string;
  sellPillar1Title: string;
  sellPillar1Desc: string;
  sellPillar2Title: string;
  sellPillar2Exhaustion: string;
  sellPillar2Normal: string;
  sellPillar2Desc: string;
  sellPillar3Desc: string;
  sellPillar4Title: string;
  sellPillar4AsksSuffix: string;
  sellPillar4Fading: string;
  sellPillar4Steady: string;
  sellPillar4Desc: string;
  sellTriggersMetTitle: string;
  sellTrigMfi: string;
  sellTrigShortLiq: string;
  sellTrigFunding: string;
  sellTrigAskWalls: string;
  sellTrigMomFade: string;
  sellDeepRationaleBtn: string;
  sellRadarTitle: string;
  sellRadarPairsSuffix: string;
  sellFilterAll: string;
  sellFilterStrongSell: string;
  sellFilterOverbought: string;
  sellFilterScore75: string;
  sellCardHumanBanner: string;
  sellAnalyzeBtn: string;
  sellEmptyTitle: string;
  sellEmptyDescPrefix: string;
  sellEmptyDescSuffix: string;
  sellHidingShort: string;

  // VwapEmaScanner Localized Keys
  vwapWeeklyLabel: string;
  vwapWeeklyTooltip: string;
  vwapMonthlyLabel: string;
  vwapMonthlyTooltip: string;
  vwapAudioActive: string;
  vwapMuted: string;
  vwapAudioSettings: string;
  vwapTestSoundShort: string;
  vwapAlertVolume: string;
  vwapPausedBadge: string;
  vwapLinkTelegramErr: string;
  vwapPushSuccessPrefix: string;
  vwapPushSuccessMiddle: string;
  vwapPushFail: string;
  vwapNetworkErr: string;
  vwapCrossBullish: string;
  vwapCrossBearish: string;
  vwapSustainedUptrend: string;
  vwapSustainedDowntrend: string;
  vwapConsolidation: string;
  vwapSyncingTitlePrefix: string;
  vwapSyncingDesc: string;
  vwapTrendScoreLabel: string;
  vwapMultiTfTitle: string;
  vwapScanningBadge: string;
  vwapAnalyzingBadge: string;
  vwapIntradayLabel: string;
  vwapWeeklyCardLabel: string;
  vwapMonthlyCardLabel: string;
  vwapBullTag: string;
  vwapBearTag: string;
  vwapChopTag: string;
  vwapChopShortTag: string;
  vwapMacroBiasLabel: string;
  vwapMacroBull: string;
  vwapMacroBear: string;
  vwapDevLabel: string;
  vwapEma9Fast: string;
  vwapEma21Slow: string;
  vwapGtEma21Bull: string;
  vwapLtEma21Bear: string;
  vwapDynamicBenchmark: string;
  vwapStrongExpansion: string;
  vwapCompressed: string;
  vwapAnalyzeConfluenceBtn: string;
  vwapRadarTitle: string;
  vwapPairsUnit: string;
  vwapTimeframePrefix: string;
  vwapLiveStreamedSuffix: string;
  vwapManageTooltip: string;
  vwapFilterBuy: string;
  vwapFilterSell: string;
  vwapFilterCross: string;
  vwapScoreLabel: string;
  vwapMacro33Badge: string;
  vwapCounterBadge: string;
  vwapEmptyNoiseDescPrefix: string;
  vwapEmptyNoiseDescSuffix: string;

  // TelegramConfig / TelegramLinkCard Localized Keys
  tgCardTitle: string;
  tgLinkedBadge: string;
  tgCardSubtitle: string;
  tgExclusiveProTitle: string;
  tgExclusiveProDesc: string;
  tgUpgradeToLinkBtn: string;
  tgBotActiveSynced: string;
  tgLinkedAtLabel: string;
  tgActiveFallback: string;
  tgChatIdLabel: string;
  tgOfficialBotLabel: string;
  tgAutoAlertsNote: string;
  tgRadarAssetsTitle: string;
  tgTop3Recommended: string;
  tgRadarAssetsDesc: string;
  tgZeroAssetsWarning: string;
  tgNightProTipLabel: string;
  tgNightProTipBody: string;
  tgDispatchTestBtn: string;
  tgUnlinkBtn: string;
  tgUnlinkConfirm: string;
  tgStepsTitle: string;
  tgOfficialAlertBotLabel: string;
  tgOpenBotBtn: string;
  tgStep1Title: string;
  tgStep1DescPrefix: string;
  tgStep1DescSuffix: string;
  tgStep2Title: string;
  tgStep2Desc: string;
  tgStep3Title: string;
  tgStep3Desc: string;
  tgOpenBotFullBtn: string;
  tgUsernameLabel: string;
  tgChatIdPlaceholder: string;
  tgUsernamePlaceholder: string;
  tgSaveAndLinkBtn: string;
  tgLinkSuccess: string;
  tgLinkError: string;
  tgTestNeedLink: string;
  tgTestServerErrPrefix: string;
  tgTestServerErrSuffix: string;
  tgTestSuccessPrefix: string;
  tgTestStartBotErr: string;
  tgTestNetworkErr: string;

  // App Shell & Thresholds Localized Keys
  appFreePlanBannerTitle: string;
  appFreePlanBannerDesc: string;
  appVwapGateTitle: string;
  appVwapGateDesc: string;
  appVwapRiskPill: string;
  appBuyGateTitle: string;
  appBuyGateDesc: string;
  appBuyRiskPill: string;
  appSellGateTitle: string;
  appSellGateDesc: string;
  appSellRiskPill: string;
  appAiGateTitle: string;
  appAiGateDesc: string;
  appConfigGateTitle: string;
  appConfigGateDesc: string;
  appAdvancedThresholdsSummary: string;
  appFooterBrand: string;
  appFooterStatus: string;
  thresholdsUpdatedToast: string;
  manageCryptosPlusMinus: string;
  telegramWebhookProTitle: string;
  telegramWebhookProDesc: string;
  unlockTelegramWebhookBtn: string;
  webhookDispatchDesc: string;

  // Streamlined Header (Command Center)
  hdrBrandTitle: string;
  hdrManageCoins: string;
  hdrMuteAudio: string;
  hdrUnmuteAudio: string;
  hdrLogin: string;
  hdrUpgradePro: string;
  hdrProShort: string;
  hdrFreeShort: string;
  hdrTierLabel: string;
  hdrExpiresLabel: string;
  hdrTelegramLinked: string;
  hdrTelegramConnect: string;
  hdrManageSub: string;
  hdrSignOut: string;
  hdrLiveTag: string;
  hdrOfflineTag: string;
  hdrMacroShieldActive: string;
  hdrMacroShieldArmed: string;

  // Command Center: Block 1 - Global Flash Crash Shield
  ccBlock1Label: string;
  ccRiskIndexLabel: string;
  ccBtcHealthLabel: string;
  ccEthHealthLabel: string;
  ccStatusStable: string;
  ccStatusCaution: string;
  ccStatusCrash: string;
  ccMacroShieldBanner: string;
  ccSellingPressureTitle: string;
  ccRiskShortLabel: string;

  // Command Center: Block 2 - Unified Active Signals Feed
  ccBlock2Title: string;
  ccBlock2Subtitle: string;
  ccScopeWatchlist: string;
  ccScopeGlobalRadar: string;
  ccInWatchlistBtn: string;
  ccAddToWatchlistBtn: string;
  ccRemoveFromWatchlistTooltip: string;
  ccAddToWatchlistTooltip: string;
  ccEmptyWatchlistSignalsTitle: string;
  ccEmptyWatchlistSignalsDesc: string;
  ccSwitchToGlobalRadarBtn: string;
  ccFilterAll: string;
  ccFilterBuy: string;
  ccFilterSell: string;
  ccBadgeBuy: string;
  ccBadgeSell: string;
  ccBadgeBreakdown: string;
  ccBreakdownHeadline: string;
  ccBuySimpleDesc: string;
  ccSellSimpleDesc: string;
  ccBreakdownSimpleDesc: string;
  ccPlanEntryZone: string;
  ccPlanStopLoss: string;
  ccPlanMaxStopNote: string;
  ccPlanTp1: string;
  ccPlanTp2: string;
  ccPlanBrokenSupport: string;
  ccPlanEmergencyExit: string;
  ccPlanDownside1: string;
  ccPlanDownside2: string;
  ccCrashBuyLockedNote: string;
  ccSendToTelegramBtn: string;
  ccSendingToTelegram: string;
  ccSentToTelegramOk: string;
  ccUnlockTelegramCta: string;
  ccEmptySignalsTitle: string;
  ccEmptySignalsDesc: string;
  ccConfidenceLabel: string;

  // Command Center: Block 3 - Telegram 24/7 Hub & Coin Selector
  ccBlock3Title: string;
  ccBlock3Subtitle: string;
  ccManageCoinsBtn: string;
  ccMonitoredCountLabel: string;

  // Command Center: Block 4 - Recent Winning Signals Ledger
  ccBlock4Title: string;
  ccBlock4Subtitle: string;
  ccTrackerActiveBadge: string;
  ccColAsset: string;
  ccColSignal: string;
  ccColTarget: string;
  ccColGain: string;
  ccColClosed: string;
  ccSignalBuyTag: string;
  ccSignalSellTag: string;
  ccLedgerEmptyTitle: string;
  ccLedgerEmptyDesc: string;

  // Subscription / Upgrade Modal (5 Core Production Pillars)
  subModalSubtitle: string;
  subModalActiveDesc: string;
  subModalFeaturesTitle: string;
  subFeature1Title: string;
  subFeature1Desc: string;
  subFeature2Title: string;
  subFeature2Desc: string;
  subFeature3Title: string;
  subFeature3Desc: string;
  subFeature4Title: string;
  subFeature4Desc: string;
  subFeature5Title: string;
  subFeature5Desc: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Header
    navDashboard: "Dashboard",
    navBuySignals: "Buy Signal Scanner",
    navHeatmap: "Market Heatmap",
    navNewsFeed: "News & Channels",
    navGuide: "Guide",
    navPythonCode: "Python Sentinel Engine",
    navAlertsLog: "Alerts Log",
    navConfig: "Thresholds",
    navAiManager: "AI Risk Manager",
    navPricing: "Plans & Pricing",
    navArchitecture: "Architecture",
    hftEngine: "ALGO QUANT ENGINE",
    connected: "CONNECTED",
    connecting: "CONNECTING...",
    simulated: "SIMULATED",
    sellSpike: "Sell Spike",
    wallBreak: "Wall Break",
    liqCascade: "Liq Cascade",
    quickSelect: "Quick Select:",
    searchCrypto: "Search crypto or pair...",
    addCustomCrypto: "Custom e.g. PEPE, SUI, NEAR",
    customCryptoPlaceholder: "CUSTOM SYMBOL",
    language: "Language",

    // Tab navigation controls
    moveLeft: "Move Left",
    moveRight: "Move Right",
    reorderTabs: "Reorder Navigation Tabs",
    allSectionsMenu: "All Sections Menu",
    deleteChannelTooltip: "Delete Channel",
    restoreDefaultChannels: "Restore Default Channels",

    // Market Heatmap
    heatmapTitle: "REAL-TIME TOP 10 CRYPTO RISK & VOLATILITY HEATMAP",
    heatmapSubtitle:
      "Cross-market orderbook pressure, sell acceleration, and volume intensity grid",
    metricRiskIndex: "Risk Index Overlay",
    metricVolatility: "Price Volatility (1m)",
    metricVolume: "Trading Volume (24h Est)",
    metricSellRatio: "Sell Volume Ratio",
    metricLiquidations: "Liquidation Pressure",
    sortBy: "Sort By:",
    sortByRisk: "Highest Risk Index",
    sortByVol: "Most Volatile",
    sortByVolume: "Highest Volume",
    sortBySellRatio: "Highest Sell Pressure",
    viewGrid: "Grid Cards",
    viewMatrix: "Risk Matrix",
    viewTreemap: "Proportional Heatmap",
    monitorPair: "Inspect & Monitor Pair",
    liveFeed: "LIVE 10-STREAM TICKER",
    legendNormal: "Normal (0-24)",
    legendElevated: "Elevated (25-49)",
    legendHighRisk: "High Risk (50-74)",
    legendFlashCrash: "Flash Crash (75+)",

    // Risk Dashboard
    riskIndexTitle: "COMPOSITE FLASH CRASH RISK INDEX",
    riskIndexSubtitle:
      "Real-time Algorithmic Engine • Multi-Factor Quantitative Model",
    riskStatusNormal: "NORMAL MARKET CONDITIONS",
    riskStatusElevated: "ELEVATED VOLATILITY DETECTED",
    riskStatusHighRisk: "HIGH RISK • PRE-CRASH SIGNS",
    riskStatusFlashCrash: "FLASH CRASH EARLY WARNING",
    tickerTitle: "TICKER",
    change1m: "1m Change",
    change5m: "5m Change",
    change1h: "1 Hour (1h)",
    change24h: "24 Hours (24h)",
    change1w: "1 Week (1w)",
    change1M: "1 Month (1m)",
    dropMetricLabel: "Drop / Drawdown",
    timeframePerformanceLabel: "Multi-Timeframe Performance",
    multiTimeframeMatrixTitle:
      "MULTI-TIMEFRAME RANGE, PERFORMANCE & DRAWDOWN MATRIX",
    minPriceLabel: "MIN",
    maxPriceLabel: "MAX",
    potentialGainLabel: "Potential Gain",
    maxGainLabel: "Potential Gain",
    maxDropLabel: "Max Drop",
    drawdownFromHighLabel: "Drawdown from High",

    // Rules Cards
    rule1Title: "RULE 1: SELL VOLUME ACCELERATION",
    rule1Subtitle:
      "Detects anomalous high-frequency sell pressure volume spikes",
    sellVolumeRatio5m: "5-Min Sell Ratio",
    sellVolumeZScore: "Sell Volume Z-Score",
    volumeAcceleration: "Volume Acceleration",
    normalRatioRange: "Normal range: 45% - 55%",

    rule2Title: "RULE 2: SUPPORT WALL BREAKDOWN",
    rule2Subtitle:
      "Monitors L2 orderbook buy wall erosion & sudden depth vanishing",
    nearestBuyWall: "Nearest Buy Wall",
    wallConsumption: "Wall Consumption",
    wallIntact: "WALL INTACT",
    remainingQty: "Remaining",

    rule3Title: "RULE 3: LIQUIDATION CASCADE",
    rule3Subtitle: "Tracks forced long liquidations on Binance USDT-M Futures",
    liquidations1m: "1-Min Long Liquidations",
    longCount1m: "Long Liqs Count (1m)",
    cascadeRisk: "Cascade Risk",
    noRecentCascade: "No liquidation cascade detected",

    orderBookTitle: "BINANCE L2 DEPTH ORDER BOOK",
    orderBookSubtitle:
      "Real-time Binance top depth levels scanned for institutional buy support walls",
    minWallSize: "MIN WALL SIZE",
    bidPrice: "BID PRICE (USD)",
    askPrice: "ASK PRICE (USD)",
    size: "SIZE",
    depthValue: "DEPTH VALUE",

    // Threshold Config
    configTitle: "Alert Trigger Thresholds & Webhooks",
    configSubtitle:
      "Configure RAM memory sliding window parameters, Z-score limits, and real-time alert dispatchers",
    section1Title: "1. Active Cryptocurrency & RAM Memory Sliding Window",
    targetCryptoPair: "Target Crypto Pair",
    activeStreamNote:
      "Active Binance stream symbol monitored by Sentinel RAM engine.",
    slidingWindowSec: "Sliding Window (Seconds)",
    slidingWindowHelp:
      "Duration of RAM trade & liquidation queue maintained in memory.",

    section2Title: "2. Rule 1: Sell Volume Acceleration Thresholds",
    zScoreThreshold: "Sell Volume Z-Score Threshold",
    zScoreHelp:
      "Number of standard deviations above 5-min mean sell volume to trigger warning.",
    sellRatioThreshold: "Sell Volume Ratio Threshold (0.0 - 1.0)",
    sellRatioHelp:
      "Fraction of total volume that must be sell trades (e.g. 0.70 = 70% sells).",

    section3Title: "3. Rule 2: Order Book Support Breakdown Thresholds",
    minBuyWallSize: "Minimum Buy Support Wall Size",
    minBuyWallHelp:
      "Minimum depth quantity required to qualify as a major support wall.",
    wallChewThreshold: "Wall Consumption Threshold (%)",
    wallChewHelp:
      "Percentage of support wall eaten through before triggering alert.",

    section4Title: "4. Rule 3: Liquidation Cascade Thresholds",
    longLiqSpike: "1-Min Long Liquidation Spike (USD)",
    longLiqHelp:
      "USD value of long position liquidations in 60s to confirm cascade.",

    section5Title: "5. Webhook & Telegram Alert Dispatcher",
    webhookUrl: "HTTP Webhook Endpoint URL",
    webhookHelp: "Receives real-time JSON alert payload on trigger events.",
    tgBotToken: "Telegram Bot Token (Optional)",
    tgChatId: "Telegram Chat ID (Optional)",
    soundAlerts: "Enable Audio Siren Alarms for Critical Alerts",
    alarmSoundTypeLabel: "Select Alarm Sound Tone",
    alarmSoundTypeHelp:
      "Choose the synthesizer waveform pattern and sound frequency for critical market alerts.",
    testAlarmSoundBtn: "Test Selected Sound",

    saveConfigBtn: "Save & Apply Thresholds",
    testWebhookBtn: "Send Test Webhook Payload",
    sendingBtn: "Sending...",
    clearLogsBtn: "Clear alert logs",

    // AI Analyst
    aiTitle: "Intelligent Market Advisor",
    aiSubtitle:
      "Market Diagnosis & Action Plan in Plain Terms • Real-Time Capital Protection",
    aiPromptHeader: "Quick Analysis Prompts",
    synthesizeRiskPrompt: "Diagnose Market Health",
    orderBookAbsorptionPrompt: "Check Support Floor Strength",
    stopLossPrompt: "Capital Protection Strategy",
    customPromptPlaceholder:
      "Ask AI Advisor about current market conditions and risk...",
    generateReportBtn: "Consult AI Advisor",
    analyzingBtn: "Analyzing Live Market...",
    generatingReport: "Consulting AI Advisor...",
    reportSuccess: "Market Diagnosis & Action Plan Complete",
    reportError: "Failed to generate market diagnosis",

    // Alerts Log
    alertsTitle: "Real-Time Flash Crash Alerts Log",
    alertsSubtitle:
      "In-memory log of anomalous market events detected by RAM sliding window engine",
    filterAll: "All Alerts",
    filterFlashCrash: "Flash Crash",
    filterCritical: "Critical",
    filterWarning: "Warning",
    filterInfo: "Info",
    noAlerts:
      "No alerts triggered yet. Sentinel engine is actively monitoring stream...",
    copyMarkdown: "Copy Telegram Markdown",
    copiedMarkdown: "Copied!",
    viewPayload: "Payload JSON",

    // Python Code
    pythonTitle: "Standalone Python Sentinel Crypto Node Engine",
    pythonSubtitle:
      "Zero-dependency async Python script for local deployment, servers, or algorithmic trading bots",
    monolithTab: "Monolith Engine",
    installStep: "1. Install Async Dependencies",
    runStep: "2. Run Sentinel Crypto Node Engine",
    copyCodeBtn: "Copy Code",
    downloadCodeBtn: "Download Python File",
    copyFileBtn: "Copy File",
    copiedBtn: "Copied!",
    downloadPyBtn: "Download .py",

    // Architecture Docs
    archTitle: "Sentinel Crypto Node System Architecture & Design",
    archSubtitle:
      "High-frequency, stateless, zero-database crypto early warning sentinel specification",
    archSection1Title: "1. In-Memory RAM Sliding Window Engine",
    archSection1Text:
      "The Sentinel engine relies on a dual-sliding window mechanism implemented entirely in volatile RAM using high-performance queue buffers (collections.deque). It processes every individual Binance Spot trade tick and USDT-M Futures forced liquidation in real-time, eliminating disk I/O bottlenecks.",
    archSection2Title: "2. Multi-Factor Risk Evaluation Matrix",
    archSection2Text:
      "Three independent mathematical algorithms continually analyze liquidity dynamics: (1) Volume Acceleration Z-Score comparing 1-min sell velocity against 5-min rolling mean; (2) L2 Orderbook Depth Wall Erosion tracking consumption of major bid support; and (3) Long Liquidation Spike Detection isolating market-order sell cascades.",
    archSection3Title: "3. Zero-Latency Event Dispatching",
    archSection3Text:
      "When any rule condition or composite risk score threshold is breached, the engine constructs structured JSON payloads and Telegram Markdown alerts, dispatching them asynchronously via HTTP POST webhooks without interrupting stream processing.",

    // News & Channels
    newsFeedTitle: "CUSTOMIZABLE NEWS & ALERT CHANNELS FEED",
    newsFeedSubtitle:
      "Real-time crypto headlines, Macro developments, and On-Chain alerts parsed directly from your customized source channels.",
    addChannel: "Add Channel",
    refreshFeed: "Refresh Feed",
    refreshing: "Refreshing...",
    searchPlaceholder: "Search news or keywords (e.g. BTC, Fed, ETF)...",
    allActiveChannels: "All Active Channels",
    allCategories: "All Categories",
    allSentiments: "All Sentiments / Impact",
    bullishTag: "BULLISH",
    bearishTag: "BEARISH",
    highImpactTag: "HIGH IMPACT",
    neutralTag: "NEUTRAL",
    activeChannelsList: "ACTIVE CHANNELS",
    expandChannels: "Expand Channels",
    collapseChannels: "Collapse Channels",
    resetDefaults: "Reset",
    addCustomFeedUrl: "Add Custom Feed URL",
    showingHeadlines: "Showing",
    headlines: "headlines",
    lastSync: "Last Sync",
    fetchingUpdates: "Fetching Latest Channel Updates...",
    parsingRss: "Parsing RSS feeds and API endpoints in parallel",
    noNewsMatch: "No news items match your current filters",
    tryClearingFilters:
      "Try clearing search keywords or enabling additional channels",
    resetAllFilters: "Reset All Filters",
    readArticle: "Read Article",
    addCustomModalTitle: "ADD CUSTOM NEWS / RSS FEED",
    channelName: "Channel Name",
    channelNamePlaceholder: "e.g. Solana Research Substack or Whale Alert",
    feedUrl: "Feed URL (RSS / Atom / API)",
    categoryTag: "Category Tag",
    iconEmoji: "Icon / Emoji",
    cancelBtn: "Cancel",
    saveChannelBtn: "Save Channel",
    enterChannelNameErr: "Please enter a channel name.",
    enterValidUrlErr: "Please enter a valid HTTP/HTTPS Feed or API URL.",
    mutedStatus: "Muted",
    liveSyncActive: "Live Sync Active",
    updatedAgo: "Updated",
    sourceText: "Source",
    categoryNews: "News",
    categoryOnChain: "On-Chain",
    categoryMacro: "Macro",
    categoryAlerts: "Alerts",
    categoryCustom: "Custom",
    newsAlertsTitle: "Breaking News Sentiment Alerts",
    bullishAlertToggle: "Bullish News Alerts (🟢)",
    bearishAlertToggle: "Bearish News Alerts (🔴)",
    simBullishNewsBtn: "Simulate Bullish News Alert",
    simBearishNewsBtn: "Simulate Bearish News Alert",
    newsAlertSound: "Alert Sound Tone",
    newsAlertsActive: "News Alerts Active",
    dispatchWebhooksNews: "Forward to Webhook/Telegram",
    breakingNewsToastTitle: "BREAKING NEWS ALERT",
    navSellSignals: "Sell Signal Scanner",
    sellSignalTitle: "ALGORITHMIC EXIT & DISTRIBUTION SCANNER",
    sellSignalSubtitle:
      "Multi-factor quantitative engine detecting exhaustion tops, MFI overbought states (>80), short squeeze liquidations, elevated positive funding, and limit ask resistance absorption",
    sellPillarMfi: "MFI Overbought Index",
    sellPillarLiqs: "Short Squeeze Liquidations",
    sellPillarFunding: "Futures Funding Saturation",
    sellPillarResistance: "Ask Resistance & Absorption",
    sellExecutionLevels: "Short Entry & Take Profit Levels",
    shortEntryZone: "Short Entry Zone",
    stopLossCeiling: "Invalidation Stop Loss",
    takeProfitMeanRev: "Target 1 (Mean Reversion)",
    takeProfitDeepSweep: "Target 2 (Liquidity Sweep)",
    distributionThesis: "Quantitative Distribution Thesis",
    pushSellAlertTelegram: "Push Sell Signal to Telegram",

    // VWAP & EMA Trend Scanner
    navVwapScanner: "VWAP & EMA Scanner",
    vwapScannerTitle: "QUANTITATIVE VWAP & EMA TREND SCANNER",
    vwapScannerSubtitle:
      "Intraday Volume-Weighted Average Price & EMA 9/21 trend alignment engine with real-time crossover alerts and Telegram dispatching",
    vwapPillarVwap: "Institutional VWAP Anchor",
    vwapPillarEma: "Dual EMA Ribbon (9 / 21)",
    vwapPillarCrossover: "Crossover & Trend Status",
    vwapPillarSpread: "EMA Velocity & Spread",
    vwapExecutionTargets: "Algorithmic Execution Targets",
    entryZoneLabel: "Execution Entry Zone",
    stopLossLabel: "Invalidation Stop Loss",
    takeProfit1Label: "Target 1 (Mean Continuation)",
    takeProfit2Label: "Target 2 (Trend Expansion)",
    riskRewardLabel: "Risk / Reward Ratio",
    vwapQuantThesis: "Quantitative Trend Rationale",
    pushVwapAlertTelegram: "Dispatch VWAP/EMA Alert to Telegram",
    timeframeLabel: "Timeframe",
    trendStatusLabel: "Trend Status",
    audioAlertsLabel: "Audio Alerts",
    muteAlertsLabel: "Mute Audio",

    // Cryptocurrency Management
    manageCryptos: "Manage Cryptos",
    cryptoManagerTitle: "CRYPTOCURRENCY & WATCHLIST MANAGER",
    cryptoManagerSubtitle:
      "Add, remove, or customize real-time cryptocurrency pairs tracked by the Sentinel quantitative engine and market scanners",
    activeCryptos: "Active Watchlist",
    discoverCryptos: "Discover & Add Popular Pairs",
    customCryptoPair: "Add Custom Binance Pair",
    addCryptoBtn: "Add Crypto",
    removeCryptoBtn: "Remove",
    cryptoAddedSuccess: "Cryptocurrency successfully added to active watchlist",
    cryptoRemovedSuccess: "Cryptocurrency removed from active watchlist",
    cantRemoveLastCrypto:
      "Cannot remove: at least 1 active cryptocurrency is required",
    cryptoAlreadyInList:
      "This cryptocurrency is already in your active watchlist",
    resetDefaultCryptos: "Reset to Defaults",
    resetDefaultConfirm:
      "Reset watchlist back to the 12 core cryptocurrencies?",
    searchAddPlaceholder:
      "Search by ticker or name (e.g. TAO, RENDER, INJ, SOL)...",
    customSymbolLabel: "Trading Pair Symbol (Binance)",
    customSymbolHelp: "e.g. TAOUSDT, APTUSDT, INJUSDT or base ticker like SUI",
    customNameLabel: "Display Name",
    defaultWallSizeLabel: "Min Buy Wall Size (Base Asset)",
    verifyingSymbol: "Verifying on Binance...",
    symbolValid: "Symbol verified on Binance",
    symbolNotFound:
      "Pair not found on Binance. Please check the ticker symbol.",
    categoryAll: "All Markets",
    categoryAi: "AI & Compute",
    categoryL1L2: "Layer 1 / Layer 2",
    categoryDefi: "DeFi & Infra",
    categoryMeme: "Memes & High Beta",
    inWatchlist: "Added",
    addToWatchlist: "Add to Watchlist",
    removeFromWatchlist: "Remove from Watchlist",
    quickAddSuggestions: "Popular Quick Add:",

    // Shared Scanner & Common Labels
    syncingText: "Syncing...",
    liveSpotBadge: "LIVE SPOT",
    eventsUnit: "events",
    allLabel: "All",
    noneLabel: "None",
    showLabel: "Show",
    hideLabel: "Hide",
    activeLabel: "active",
    optionalLabel: "Optional",
    copiedLabel: "Copied",
    copyUserLabel: "Copy User",
    proBadge: "PRO",
    premiumBadge: "PREMIUM",
    shieldActiveBadge: "SHIELD ACTIVE",
    crashWarningBadge: "CRASH WARNING",
    whyThisAlertBtn: "Why this alert?",
    whyThisAlertTooltip: "Analyze Rationale & Favorability",
    receiveTelegram247Btn: "Receive these alerts on my Telegram 24/7",
    viewTechDetailsBtn: "View technical algorithm details (Advanced)",
    rule75Badge: "≥75% RULE",
    hideNoiseTooltip: "Hide assets scoring <75%",
    showNoiseTooltip: "Show lower-conviction assets (<75%)",
    hidingNoiseLabel: "Hiding Noise",
    lowerScoringSuffix: "lower scoring (<75%)",
    filteredSuffix: "filtered (<75%)",
    manageCryptosShort: "Manage",
    inspectFilteredSetups: "Inspect filtered setups",
    only75SetupsShown: "Only setups with ≥75% confluence are displayed",
    scanningHighProbTitle: "Scanning for high-probability setups (≥75%)...",
    scanningSetupsEllipsis: "Scanning for high-probability setups...",
    dispatchingLabel: "Dispatching...",
    pushToTelegramLabel: "Push to Telegram",
    audioOnLabel: "AUDIO ON",
    mutedUpperLabel: "MUTED",
    muteAudioAlertsTitle: "Mute Audio Alerts",
    enableAudioAlertsTitle: "Enable Audio Alerts",
    audioAlertSettingsTitle: "Audio Alert Settings",
    soundNotificationsLabel: "Sound Notifications:",
    enabledUpperLabel: "ENABLED",
    alertSoundStyleLabel: "Alert Sound Style:",
    testSoundLabel: "Test Sound",
    volumeLabel: "Volume:",
    triggerAtScoreLabel: "Trigger at Score ≥:",
    awaitingNextScannerConfirm:
      "Awaiting next institutional scanner confirmation.",
    spotLabel: "Spot:",
    entryZoneShort: "Entry Zone:",
    targetTp1Short: "Target TP1:",
    stopLossShort: "Stop Loss:",
    target1Tp1_15R: "Target 1 (TP1 - 1.5R)",
    target2Tp2_25R: "Target 2 (TP2 - 2.5R)",
    stopLossSafetyCap: "Stop Loss (Safety Cap <= 4%)",
    futuresFundingLabel: "3. Futures Funding",

    // RiskDashboard Localized Keys
    rdConnectingTitle: "Connecting to Real-Time Binance Data Feeds...",
    rdConnectingDesc:
      "Synchronizing institutional L2 order book, volatility index, and verified multi-timeframe candles without simulated placeholders.",
    rdProtectionDeskLabel: "TRADER PROTECTION DESK",
    rdThermometerTitle: "Market Safety Thermometer",
    rdRiskIndexUnit: "/ 100 Risk Index",
    rdSlidingWindow15s: "Real-time sliding window: 15s",
    rdStatusLowBadge: "🟢 STABLE MARKET / LOW RISK",
    rdStatusLowDesc:
      "Normal liquidity conditions. Safe environment to look for opportunities.",
    rdStatusModBadge: "🟡 CAUTION / MODERATE VOLATILITY",
    rdStatusModDesc:
      "Increased selling pressure or sudden moves. Always trade with a Stop Loss.",
    rdStatusHighBadge: "🔴 CRASH WARNING / HIGH RISK",
    rdStatusHighDesc:
      "Heavy selling pressure or cascading liquidations. Avoid rushing into buy positions.",
    rdScaleSafe: "Safe",
    rdScaleCaution: "Caution",
    rdScaleHighRisk: "High Risk",
    rdScaleFlashCrash: "Flash Crash",
    rdDrift1m: "1m Drift:",
    rdDrift5m: "5m Drift:",
    rdRecentPeak: "Recent Peak:",
    rdQuickGuideBadge: "OPERATOR QUICK GUIDE",
    rdNextAction: "Next action",
    rdGuideLowTitle: "Ideal Conditions to Scan Entries",
    rdGuideLowDesc:
      "Minimal selling pressure allows scanning for clean trend-following setups or strong confluence rebounds.",
    rdGuideModTitle: "Trade with Caution & VWAP Anchors",
    rdGuideModDesc:
      "Active market fluctuations. Verify moving average alignment and avoid trading against momentum.",
    rdGuideHighTitle: "Active Capital Protection Mode",
    rdGuideHighDesc:
      "Heavy liquidations or accelerated selling detected. Protect profits or wait for a confirmed support floor.",
    rdBtnInspectVwap: "Inspect Safe Trend (VWAP)",
    rdBtnScanBuy: "Scan Buy Opportunities",
    rdBtnCheckSell: "Check Exit & Sell Signals",
    rdAuthenticBinanceBadge: "AUTHENTIC BINANCE DATA",
    rdMatrixTitle:
      "Verified Multi-Timeframe Range & Drawdown Matrix (24H • 1W • 1M)",
    rdPotentialUpside: "Potential Upside (+%)",
    rdMaxDropLegend: "Max Drop (-%)",
    rdTf24hHeader: "24 Hours (1h/24h)",
    rdFetchingKlines: "Fetching historical klines...",
    rdPeakPrice: "Peak Price",
    rdFloorPrice: "Floor Price",
    rdPositionInRange: "Position in Range",
    rdBuySellPressureTitle: "Buy vs. Sell Volume Pressure",
    rdBuySellPressureSub: "Last 5 minutes Binance spot",
    rdBuyersLabel: "Buyers",
    rdSellersLabel: "Sellers",
    rdBuyersControl: "Buyers are absorbing the volume flow.",
    rdSellersControl: "Sellers are dominating downward pressure.",
    rdVolumeBalanced: "Volume in balance with no clear direction.",
    rdVolume5mTotal: "5m Total Volume:",
    rdNearestSupportTitle: "Nearest Buy Support Floor",
    rdNearestSupportSub: "L2 Institutional Order Wall",
    rdKeyDefenseFloor: "Key Defense Floor:",
    rdCalculatingFloor: "Calculating floor...",
    rdSupportDesc:
      "Key price level where large limit orders are sitting to defend against a drop.",
    rdSupportStatusLabel: "Support Status:",
    rdAbsorbedSuffix: "absorbed",
    rdFirmSupport: "Firm Support",
    rdLiqCascadesTitle: "Liquidation Cascades",
    rdLiqCascadesSub: "Forced long leverage liquidations",
    rdLast1mLiqs: "Last 1m Liquidations:",
    rdSyncingLiqs: "Syncing liquidations...",
    rdLiqCascadesDesc:
      "Traders whose positions were forcefully closed by the exchange, which can accelerate dips.",
    rdAlertStateLabel: "Alert State:",
    rdCascadeActive: "Cascade Active",
    rdOrderlyMarket: "Orderly Market",
    rdLiveDepthBadge: "LIVE L2 DEPTH RADAR",
    rdOrderBookTitle: "Authentic Buy Bids & Sell Asks (Binance Spot)",
    rdMinWallSizeLabel: "Min Wall Size:",
    rdBidsColHeader: "BID PRICE (USD)",
    rdAsksColHeader: "ASK PRICE (USD)",
    rdVolumeColHeader: "SIZE",
    rdTotalUsdColHeader: "DEPTH USD",
    rdSyncingBids: "Syncing L2 order bids...",
    rdSyncingAsks: "Syncing L2 order asks...",
    rdWallBadge: "WALL",
    rdInstitutionalTrendBadge: "INSTITUTIONAL TREND",
    rdBullishTrend: "BULLISH TREND",
    rdBearishTrend: "BEARISH TREND",
    rdConsolidatingTrend: "CONSOLIDATING",
    rdOpenCompleteScanner: "Open Complete Scanner",
    rdVwapAnchor1h: "VWAP Anchor (1h):",
    rdEmaFast9: "Fast EMA (9):",
    rdEmaSlow21: "Slow EMA (21):",
    rdEmaSpread: "EMA Spread:",
    rdTeaserTitle: "Instant Telegram & Audio Push Alerts",
    rdTeaserDesc:
      "Get notified prior to sudden drops or trend breaks directly on your mobile device.",
    rdTeaserBtn: "EXPLORE SENTINEL PREMIUM",

    // BuySignalScanner Localized Keys
    buyScannerTitle: "ALGORITHMIC OVERSOLD REBOUND SCANNER",
    buyScannerSubtitle:
      "Quantitative scanning for oversold MFI divergence, long liquidation flushes, funding rate squeezes & L2 passive absorption.",
    buyCrashBlockedMsg:
      "🚨 Buy signals disabled: Crash warning active (Risk ≥ 80).",
    buyLinkTelegramErr:
      "Link your Telegram account in the user menu to receive instant signal alerts.",
    buyPushSuccessPrefix: "Buy Signal successfully pushed to Telegram Chat ID:",
    buyPushError: "Failed to dispatch Telegram signal.",
    buyPushNetworkErr: "Network error sending alert to Telegram.",
    monitoringAssetsPrefix: "MONITORING",
    monitoringAssetsSuffix: "ASSETS",
    buyAudioPanelTitle: "Buy Signal Audio Alerts",
    buySoundArpeggioOption: "Bullish Rebound Arpeggio",
    scanNowBtn: "Scan Now",
    buyTelegramBtn: "Push to Telegram",
    buyAudioToastTitle: "BUY SIGNAL AUDIO ALERT DISPATCHED!",
    buyAudioToastAsset: "Asset",
    buyAudioToastMiddle: "triggered opportunity score",
    buyCrashBannerRiskPrefix: "Global Risk Index:",
    buyCrashBannerBadge: "CRASH WARNING ACTIVE",
    buyCrashBannerTitle: "🚨 BUY SIGNALS DISABLED: CRASH WARNING ACTIVE",
    buyCrashBannerDesc:
      "Heavy selling pressure detected globally. Catching falling knives is restricted to protect capital.",
    buyCrashAntiContradictionTitle: "Anti-Contradiction Capital Protection:",
    buyCrashAntiContradictionDesc:
      "During severe market dumps or liquidation cascades, oversold oscillators (MFI < 20) can stay oversold for hours. The engine suppresses buy setups until the Global Risk Index cools below 80.",
    buyMatrixTitle: "HIGH-PROBABILITY OPPORTUNITY MATRIX",
    buyFilterActive: "Active",
    buyFilterStrongBuy: "Strong Buy",
    buyFilterOversold: "MFI < 35",
    buyFilterHighScore: "Score ≥ 85",
    buyCardHumanBanner: "🟢 Sell pressure exhausted • Support absorption",
    buyAnalyzeBtn: "Analyze Signal & Setup",
    buyEmptyNoiseDescPrefix:
      "No monitored assets currently meet the strict 75% favorability threshold.",
    buyEmptyNoiseDescSuffix:
      "lower-confidence setups filtered to protect capital.",
    buySyncingTitle: "Syncing real-time market data for",
    buySyncingDesc: "Loading verified Binance klines, MFI, and L2 depth.",
    buyHighConvictionDetected: "HIGH-CONVICTION SETUP DETECTED",
    buyFavorabilityScore: "Favorability Score",
    buyHighReboundProb: "High Rebound Probability",
    buyExecutionBlueprint: "Execution Blueprint (ATR-Based)",
    buyEntryZoneFull: "Entry Zone",
    buyPillar1Title: "1. Money Flow Index",
    buyPillar1Desc: "Extreme oversold indicates seller exhaustion.",
    buyPillar2Title: "2. Liquidations Flush",
    buyPillar2Desc: "Flushing over-leveraged long positions.",
    buyPillar3Desc: "Low funding favorable for mean reversion.",
    buyPillar4Title: "4. Bid Depth Absorption",
    buyPillar4BidsSuffix: "Bids",
    buyPillar4Desc: "Passive bid depth absorbing sell flow.",
    buyConfirmedTriggersTitle: "Confirmed Technical Triggers",
    buyTrigMfi: "MFI Oversold",
    buyTrigLiq: "Liq Flush",
    buyTrigFunding: "Optimal Funding",
    buyTrigAbsorption: "Order Book Absorption",
    buyLowScoreDescPrefix: "The current asset (Score:",
    buyLowScoreDescSuffix:
      ") does not meet the strict ≥75% institutional threshold. Waiting for optimal confluence.",

    // SellSignalScanner Localized Keys
    sellBadgeDistribution: "DISTRIBUTION / SHORT",
    sellLiveSyncLabel: "Live Sync",
    sellPauseScanTooltip: "Pause scanning",
    sellResumeScanTooltip: "Resume scanning",
    sellAudioPanelTitle: "SELL AUDIO ALERTS",
    sellMinThresholdLabel: "Trigger Threshold:",
    sellThreshAll: "50 (All)",
    sellThreshMod: "75 (Moderate)",
    sellThreshStrong: "85+ (Strong)",
    sellAlarmToneLabel: "Alarm Tone:",
    sellDistChimeOption: "Distribution Chime",
    sellTestAlarmBtn: "Test Alarm Sound",
    sellAudioTriggeredLabel: "Audio Alert Triggered:",
    sellLinkTelegramErr:
      "Please link your Telegram Chat ID in the Thresholds tab first.",
    sellPushSuccessPrefix:
      "Sell signal alert successfully pushed to Telegram (Chat ID:",
    sellPushFail: "Failed to push alert to Telegram.",
    sellNetworkErr: "Network connection error.",
    sellSyncingTitle: "Syncing real-time distribution scan for",
    sellSyncingDesc: "Fetching authentic Binance klines, MFI, and ask walls.",
    sellAwaitingNextUpdate: "Awaiting next quantitative scanner update.",
    sellDistDetectedBadge: "DISTRIBUTION DETECTED",
    sellDistributionScore: "Distribution Score",
    sellHighSellingPressure: "High Selling Pressure",
    sellExecutionPlanAtr: "Short Entry & Take Profit Levels (ATR)",
    sellPillar1Title: "1. MFI (Money Flow)",
    sellPillar1Desc: "Extreme Overbought > 80",
    sellPillar2Title: "2. Short Liqs Climax",
    sellPillar2Exhaustion: "EXHAUSTION TOP",
    sellPillar2Normal: "NORMAL",
    sellPillar2Desc: "Short squeeze climax flushed",
    sellPillar3Desc: "Crowded long leverage",
    sellPillar4Title: "4. Ask Resistance & Decel",
    sellPillar4AsksSuffix: "Asks",
    sellPillar4Fading: "BUY FADING",
    sellPillar4Steady: "STEADY",
    sellPillar4Desc: "Sell resistance ceiling absorbing buyers",
    sellTriggersMetTitle: "Technical Trigger Conditions:",
    sellTrigMfi: "MFI Overbought",
    sellTrigShortLiq: "Short Liq Squeeze",
    sellTrigFunding: "Heavy + Funding",
    sellTrigAskWalls: "Ask Resistance Walls",
    sellTrigMomFade: "Momentum Fade",
    sellDeepRationaleBtn: "Signal Rationale & Favorability Analyzer",
    sellRadarTitle: "QUANT MULTI-PAIR RADAR",
    sellRadarPairsSuffix: "High-Probability Sell Pairs",
    sellFilterAll: "ALL",
    sellFilterStrongSell: "STRONG SELL",
    sellFilterOverbought: "OVERBOUGHT",
    sellFilterScore75: "SCORE ≥ 75",
    sellCardHumanBanner: "🔴 Buying momentum exhausted • Resistance capping",
    sellAnalyzeBtn: "Analyze Signal",
    sellEmptyTitle: "Scanning for high-probability short setups (≥75%)...",
    sellEmptyDescPrefix:
      "No active assets currently meet the strict 75% distribution threshold.",
    sellEmptyDescSuffix:
      "low-confluence setups filtered to prevent false signals.",
    sellHidingShort: "Hiding",

    // VwapEmaScanner Localized Keys
    vwapWeeklyLabel: "1W",
    vwapWeeklyTooltip: "Weekly Horizon (1-Week)",
    vwapMonthlyLabel: "1M",
    vwapMonthlyTooltip: "Monthly Macro Horizon (1-Month)",
    vwapAudioActive: "Audio Active",
    vwapMuted: "Muted",
    vwapAudioSettings: "Audio Alert Settings",
    vwapTestSoundShort: "Test Sound",
    vwapAlertVolume: "Alert Volume",
    vwapPausedBadge: "PAUSED",
    vwapLinkTelegramErr:
      "Link your Telegram account below first to receive instant signals.",
    vwapPushSuccessPrefix: "Signal",
    vwapPushSuccessMiddle: "pushed to Telegram Chat ID",
    vwapPushFail: "Failed to dispatch Telegram alert",
    vwapNetworkErr: "Network error dispatching Telegram alert",
    vwapCrossBullish: "BULLISH CROSSOVER",
    vwapCrossBearish: "BEARISH BREAKDOWN",
    vwapSustainedUptrend: "SUSTAINED UPTREND",
    vwapSustainedDowntrend: "SUSTAINED DOWNTREND",
    vwapConsolidation: "CONSOLIDATION / CHOP",
    vwapSyncingTitlePrefix: "Syncing VWAP & EMA telemetry for",
    vwapSyncingDesc:
      "Computing verified multi-timeframe candles on the backend.",
    vwapTrendScoreLabel: "Trend Score",
    vwapMultiTfTitle: "Multi-Timeframe Trend Confluence",
    vwapScanningBadge: "SCANNING...",
    vwapAnalyzingBadge: "ANALYZING",
    vwapIntradayLabel: "Intraday",
    vwapWeeklyCardLabel: "Weekly (1W)",
    vwapMonthlyCardLabel: "Monthly (1M)",
    vwapBullTag: "BULL ▲",
    vwapBearTag: "BEAR ▼",
    vwapChopTag: "CHOP ▬",
    vwapChopShortTag: "CHOP",
    vwapMacroBiasLabel: "Macro Bias:",
    vwapMacroBull: "Macro Bull",
    vwapMacroBear: "Macro Bear",
    vwapDevLabel: "Dev:",
    vwapEma9Fast: "EMA 9 (Fast)",
    vwapEma21Slow: "EMA 21 (Slow)",
    vwapGtEma21Bull: "> EMA 21 (Bull)",
    vwapLtEma21Bear: "< EMA 21 (Bear)",
    vwapDynamicBenchmark: "Dynamic benchmark",
    vwapStrongExpansion: "Strong Expansion",
    vwapCompressed: "Compressed",
    vwapAnalyzeConfluenceBtn: "Analyze Trend Confluence",
    vwapRadarTitle: "Confluence Radar",
    vwapPairsUnit: "Pairs",
    vwapTimeframePrefix: "Timeframe:",
    vwapLiveStreamedSuffix: "Live Streamed",
    vwapManageTooltip: "Add or Remove Cryptocurrencies",
    vwapFilterBuy: "BUY",
    vwapFilterSell: "SELL",
    vwapFilterCross: "CROSS",
    vwapScoreLabel: "Score:",
    vwapMacro33Badge: "3/3 MACRO",
    vwapCounterBadge: "COUNTER",
    vwapEmptyNoiseDescPrefix:
      "No monitored assets currently meet the strict 75% trend confluence threshold.",
    vwapEmptyNoiseDescSuffix: "choppy or low-momentum assets filtered.",

    // TelegramConfig / TelegramLinkCard Localized Keys
    tgCardTitle: "Telegram Bot Alerts (PRO)",
    tgLinkedBadge: "LINKED",
    tgCardSubtitle:
      "Direct algorithmic 24/7 market alerts and early warnings to your Telegram chat",
    tgExclusiveProTitle: "Exclusive Feature for PRO Subscribers",
    tgExclusiveProDesc:
      "Telegram Bot linkage sends instant sub-second alerts when large buy walls crumble or anomalous sell spikes occur.",
    tgUpgradeToLinkBtn: "UPGRADE TO PREMIUM TO LINK ($29)",
    tgBotActiveSynced: "TELEGRAM BOT ACTIVE & SYNCED",
    tgLinkedAtLabel: "Linked",
    tgActiveFallback: "Active",
    tgChatIdLabel: "Telegram Chat ID",
    tgOfficialBotLabel: "Official Bot",
    tgAutoAlertsNote:
      "Automatic real-time alerts will be dispatched to this Chat ID whenever critical orderbook anomalies are detected.",
    tgRadarAssetsTitle: "Assets to Track",
    tgTop3Recommended: "★ Top 3 (Recommended)",
    tgRadarAssetsDesc:
      "Select which assets you want to receive instant alerts for on your phone. We recommend picking 1 to 3 to stay focused.",
    tgZeroAssetsWarning:
      "⚠️ No assets selected: you will receive zero Telegram alerts until you select at least one asset.",
    tgNightProTipLabel: "Pro Tip:",
    tgNightProTipBody:
      "Crypto never sleeps. Sentinel monitors the market 24/7. We recommend using your phone's native 'Do Not Disturb' or Telegram's custom notification settings if you prefer silence during your local night hours.",
    tgDispatchTestBtn: "Dispatch Test Telegram Alert",
    tgUnlinkBtn: "Unlink",
    tgUnlinkConfirm: "Unlink Telegram Bot?",
    tgStepsTitle: "Steps to Link Your Telegram Bot",
    tgOfficialAlertBotLabel: "Official Alert Bot:",
    tgOpenBotBtn: "Open Bot",
    tgStep1Title: "Open Telegram Bot",
    tgStep1DescPrefix: 'Click "Open Bot" or search',
    tgStep1DescSuffix: "on Telegram and tap START (/start).",
    tgStep2Title: "Obtain your Chat ID",
    tgStep2Desc:
      "The bot will instantly respond with your private numeric Chat ID.",
    tgStep3Title: "Enter or Save your Chat ID",
    tgStep3Desc:
      "Save your Chat ID to receive instant alerts with zero latency.",
    tgOpenBotFullBtn: "Open Bot in Telegram",
    tgUsernameLabel: "Telegram Username",
    tgChatIdPlaceholder: "e.g. 1234567890",
    tgUsernamePlaceholder: "e.g. trader_pro",
    tgSaveAndLinkBtn: "Save & Link Telegram",
    tgLinkSuccess: "Telegram account linked successfully!",
    tgLinkError: "Failed to link Telegram",
    tgTestNeedLink:
      "Please save and link your Telegram Chat ID before testing.",
    tgTestServerErrPrefix: "Server error",
    tgTestServerErrSuffix: "Could not dispatch test alert.",
    tgTestSuccessPrefix: "✓ Test alert successfully dispatched to Chat ID",
    tgTestStartBotErr:
      "Failed to send alert to Telegram. Make sure you started the bot with /start.",
    tgTestNetworkErr: "Network error connecting to Telegram alert dispatcher.",

    // App Shell & Thresholds Localized Keys
    appFreePlanBannerTitle: "FREE TIER - LIMITED ACCESS",
    appFreePlanBannerDesc:
      "You are currently on the Free Tier. Upgrade to Sentinel Premium to unlock 24/7 private Telegram alerts, institutional ATR execution plans, and breakdown evacuation warnings.",
    appVwapGateTitle: "SAFE TREND • VWAP & EMA SCANNER",
    appVwapGateDesc:
      "Access to the institutional VWAP trend alignment and EMA 9/21 crossover scanner, custom sound alerts, and real-time Telegram notifications requires an active Sentinel Premium subscription.",
    appVwapRiskPill:
      "Low Risk • Trend-following setups aligned with institutional flow (1H, 1W, 1M)",
    appBuyGateTitle: "BUY OPPORTUNITIES • REBOUNDS & OVERSOLD",
    appBuyGateDesc:
      "Access to the algorithmic rebound opportunity scanner, MFI oversold detection, liquidation flushes, and automated Telegram alerts is exclusive to the Premium plan.",
    appBuyRiskPill:
      "Medium Risk • Tactical rebound entries after sharp market pullbacks",
    appSellGateTitle: "SELL ALERTS • DISTRIBUTION & TAKE PROFIT",
    appSellGateDesc:
      "Access to the quantitative distribution scanner, extreme MFI overbought detection, short squeeze climaxes, funding saturation, and Telegram alerts is exclusive to Premium.",
    appSellRiskPill:
      "Protection • Detecting overbought exhaustion & distribution tops",
    appAiGateTitle: "AI ADVISOR • PLAIN-ENGLISH INTEL",
    appAiGateDesc:
      "Generating quantitative risk reports in plain language and strategic capital protection recommendations requires an active Premium plan.",
    appConfigGateTitle: "ALERTS & TELEGRAM • SMART NOTIFICATIONS",
    appConfigGateDesc:
      "Link your Telegram bot to receive automated alerts on your phone and configure real-time audio alert sirens.",
    appAdvancedThresholdsSummary:
      "Advanced Algorithmic Threshold Configuration (Optional for Experts)",
    appFooterBrand:
      "SENTINEL QUANT • Intelligent Crypto Risk & Market Protection Platform",
    appFooterStatus: "Real-Time Market Monitoring • Capital Protection Active",
    thresholdsUpdatedToast: "Thresholds Updated Live",
    manageCryptosPlusMinus: "Manage Cryptos (+/-)",
    telegramWebhookProTitle:
      "Telegram & Webhook Alert Dispatcher (PRO Exclusive)",
    telegramWebhookProDesc:
      "Instant sub-second Telegram Bot notifications (@SentinelRiskBot\_bot) and automated JSON HTTP webhooks are exclusive to PRO subscribers.",
    unlockTelegramWebhookBtn: "UNLOCK TELEGRAM & WEBHOOK DISPATCHER ($29)",
    webhookDispatchDesc:
      "Dispatches a JSON POST payload whenever the Composite Risk Index breaches configured thresholds.",

    // Streamlined Header (Command Center)
    hdrBrandTitle: "SENTINEL",
    hdrManageCoins: "Manage Coins",
    hdrMuteAudio: "Mute audio alerts",
    hdrUnmuteAudio: "Enable audio alerts",
    hdrLogin: "Log In",
    hdrUpgradePro: "PRO $29",
    hdrProShort: "PRO",
    hdrFreeShort: "FREE",
    hdrTierLabel: "Plan:",
    hdrExpiresLabel: "Expires:",
    hdrTelegramLinked: "Telegram: Linked",
    hdrTelegramConnect: "Connect Telegram",
    hdrManageSub: "Manage Subscription",
    hdrSignOut: "Sign Out",
    hdrLiveTag: "LIVE",
    hdrOfflineTag: "CONNECTING",
    hdrMacroShieldActive: "MACRO SHIELD",
    hdrMacroShieldArmed: "SHIELD ARMED",

    // Command Center: Block 1 - Global Flash Crash Shield
    ccBlock1Label: "Global Flash Crash Shield",
    ccRiskIndexLabel: "Market Risk Index",
    ccBtcHealthLabel: "BTC Risk",
    ccEthHealthLabel: "ETH Risk",
    ccStatusStable: "🟢 Stable Market: Optimal trading conditions.",
    ccStatusCaution: "🟡 Caution: Rising volatility.",
    ccStatusCrash:
      "🚨 CRASH SHIELD ACTIVE: Buy signals locked to protect your capital.",
    ccMacroShieldBanner:
      "High-impact US macro window active — new entries paused for safety.",
    ccSellingPressureTitle: "Coins Under Selling Pressure",
    ccRiskShortLabel: "Risk",

    // Command Center: Block 2 - Unified Active Signals Feed
    ccBlock2Title: "Active High-Probability Signals",
    ccBlock2Subtitle:
      "Actionable opportunities filtered for clear execution and capped risk.",
    ccScopeWatchlist: "My Watchlist",
    ccScopeGlobalRadar: "Global Radar",
    ccInWatchlistBtn: "In Watchlist",
    ccAddToWatchlistBtn: "+ Watchlist",
    ccRemoveFromWatchlistTooltip: "Remove from My Watchlist",
    ccAddToWatchlistTooltip: "Add to My Watchlist",
    ccEmptyWatchlistSignalsTitle: "No Active Signals in Your Watchlist Yet",
    ccEmptyWatchlistSignalsDesc:
      "None of your selected Watchlist coins currently meet the ≥75% institutional threshold. Switch to Global Radar to inspect all server-monitored pairs or add more coins.",
    ccSwitchToGlobalRadarBtn: "View Global Radar",
    ccFilterAll: "All Signals",
    ccFilterBuy: "Buy Only",
    ccFilterSell: "Take Profit & Crash Alerts",
    ccBadgeBuy: "🟢 BUY OPPORTUNITY",
    ccBadgeSell: "🔴 TAKE PROFIT",
    ccBadgeBreakdown: "🚨 CRASH / EVACUATION ALERT",
    ccBreakdownHeadline: "🚨 {symbol} — BEARISH BREAKDOWN / DUMP RISK",
    ccBuySimpleDesc:
      "Strong buyer support detected near key floor. High bounce probability with tight protection at {sl}.",
    ccSellSimpleDesc:
      "Heavy overhead resistance and profit-taking pressure detected. Downside protection placed at {sl}.",
    ccBreakdownSimpleDesc:
      "Strong selling pressure detected on {symbol} after losing institutional support (VWAP). Risk of further downside.",
    ccPlanEntryZone: "Entry Zone",
    ccPlanStopLoss: "Stop Loss",
    ccPlanMaxStopNote: "Max 4% cap",
    ccPlanTp1: "TP1 (1.5R)",
    ccPlanTp2: "TP2 (2.5R)",
    ccPlanBrokenSupport: "Broken Support (VWAP)",
    ccPlanEmergencyExit: "Emergency Stop",
    ccPlanDownside1: "Downside Target 1",
    ccPlanDownside2: "Downside Target 2",
    ccCrashBuyLockedNote:
      "Buy setups are automatically paused while the Global Crash Shield is active.",
    ccSendToTelegramBtn: "Push to My Telegram",
    ccSendingToTelegram: "Sending...",
    ccSentToTelegramOk: "✅ Sent to Telegram!",
    ccUnlockTelegramCta: "Get 24/7 Telegram Alerts",
    ccEmptySignalsTitle: "Market Radar Active",
    ccEmptySignalsDesc:
      "Scanning the market 24/7. We'll notify you via Telegram as soon as a high-probability opportunity is confirmed.",
    ccConfidenceLabel: "Score",

    // Command Center: Block 3 - Telegram 24/7 Hub & Coin Selector
    ccBlock3Title: "Telegram 24/7 Hub & Watchlist",
    ccBlock3Subtitle:
      "Link your Telegram account and choose which coins send instant notifications to your phone.",
    ccManageCoinsBtn: "Add / Manage Coins",
    ccMonitoredCountLabel: "coins active",

    // Command Center: Block 4 - Recent Winning Signals Ledger
    ccBlock4Title: "Recent Winning Signals Ledger",
    ccBlock4Subtitle:
      "Verified signals from this session that hit TP1 or TP2 targets against live market prices.",
    ccTrackerActiveBadge: "Verifying every 20s",
    ccColAsset: "Asset",
    ccColSignal: "Signal",
    ccColTarget: "Target Hit",
    ccColGain: "Gain",
    ccColClosed: "Closed",
    ccSignalBuyTag: "BUY",
    ccSignalSellTag: "SELL",
    ccLedgerEmptyTitle: "No targets closed yet in this session",
    ccLedgerEmptyDesc:
      "Active signals are checked every 20 seconds against live Binance prices. Completed TP1/TP2 wins appear here automatically.",

    // Subscription / Upgrade Modal (5 Core Production Pillars)
    subModalSubtitle:
      "24/7 Telegram alert bot, institutional ATR execution plans & Global Crash Shield",
    subModalActiveDesc:
      "You have full unlimited access to the 24/7 Private Telegram Alert Bot, ATR execution plans, Global Flash Crash Shield, and custom Spot & Futures watchlist radar.",
    subModalFeaturesTitle: "Exclusive Premium Features",
    subFeature1Title: "24/7 Private Telegram Alert Bot",
    subFeature1Desc:
      "Instant Buy, Take-Profit, and Emergency Breakdown notifications sent straight to your phone.",
    subFeature2Title: "Institutional ATR Execution Plans",
    subFeature2Desc:
      "Exact Entry Zones, TP1/TP2 targets, and a strict Stop-Loss capped at max 4% risk on every signal.",
    subFeature3Title: "Global Flash Crash Shield",
    subFeature3Desc:
      "Real-time risk radar that automatically locks buy signals during market dumps to protect your capital.",
    subFeature4Title: "Breakdown & Evacuation Warnings",
    subFeature4Desc:
      "Early per-coin alerts when key institutional supports (VWAP/EMA) break down with heavy selling volume.",
    subFeature5Title: "Custom Multi-Asset Watchlist (Spot & Futures)",
    subFeature5Desc:
      "Track your favorite Binance pairs 24/7 with smart 4h anti-spam filtering.",
  },

  es: {
    // Navigation & Header
    navDashboard: "Panel de Control",
    navBuySignals: "Escáner de Compras",
    navHeatmap: "Mapa de Calor",
    navNewsFeed: "Noticias y Canales",
    navGuide: "Guía",
    navPythonCode: "Motor Sentinel Python",
    navAlertsLog: "Historial de Alertas",
    navConfig: "Umbrales",
    navAiManager: "Gestor de Riesgo IA",
    navPricing: "Planes y Suscripción",
    navArchitecture: "Arquitectura",
    hftEngine: "MOTOR CUANTITATIVO",
    connected: "CONECTADO",
    connecting: "CONECTANDO...",
    simulated: "SIMULADO",
    sellSpike: "Pico de Ventas",
    wallBreak: "Ruptura Muro",
    liqCascade: "Cascada Liq.",
    quickSelect: "Selección Rápida:",
    searchCrypto: "Buscar cripto o par...",
    addCustomCrypto: "Personalizado p.ej. PEPE, SUI, NEAR",
    customCryptoPlaceholder: "SÍMBOLO PERSONALIZADO",
    language: "Idioma",

    // Tab navigation controls
    moveLeft: "Mover a la Izquierda",
    moveRight: "Mover a la Derecha",
    reorderTabs: "Reordenar Pestañas de Navegación",
    allSectionsMenu: "Menú de Todas las Secciones",
    deleteChannelTooltip: "Eliminar Canal",
    restoreDefaultChannels: "Restaurar Canales por Defecto",

    // Market Heatmap
    heatmapTitle:
      "MAPA DE CALOR DE RIESGO Y VOLATILIDAD EN TIEMPO REAL (TOP 10)",
    heatmapSubtitle:
      "Presión de libro de órdenes, aceleración de ventas e intensidad de volumen",
    metricRiskIndex: "Índice de Riesgo",
    metricVolatility: "Volatilidad de Precio (1m)",
    metricVolume: "Volumen de Operaciones (24h Est)",
    metricSellRatio: "Ratio Volumen de Venta",
    metricLiquidations: "Presión de Liquidaciones",
    sortBy: "Ordenar por:",
    sortByRisk: "Mayor Índice de Riesgo",
    sortByVol: "Más Volátil",
    sortByVolume: "Mayor Volumen",
    sortBySellRatio: "Mayor Presión Vendedora",
    viewGrid: "Tarjetas Cuadrícula",
    viewMatrix: "Matriz de Riesgo",
    viewTreemap: "Mapa Proporcional",
    monitorPair: "Inspeccionar y Monitorear",
    liveFeed: "CANAL DE 10 PARES EN VIVO",
    legendNormal: "Normal (0-24)",
    legendElevated: "Elevado (25-49)",
    legendHighRisk: "Alto Riesgo (50-74)",
    legendFlashCrash: "Flash Crash (75+)",

    // Risk Dashboard
    riskIndexTitle: "ÍNDICE COMPUESTO DE RIESGO DE FLASH CRASH",
    riskIndexSubtitle:
      "Motor Algorítmico en Tiempo Real • Modelo Cuantitativo Multifactorial",
    riskStatusNormal: "CONDICIONES DE MERCADO NORMALES",
    riskStatusElevated: "VOLATILIDAD ELEVADA DETECTADA",
    riskStatusHighRisk: "ALTO RIESGO • SEÑALES PRE-CRASH",
    riskStatusFlashCrash: "ADVERTENCIA TEMPRANA DE FLASH CRASH",
    tickerTitle: "COTIZACIÓN",
    change1m: "Cambio 1m",
    change5m: "Cambio 5m",
    change1h: "1 Hora (1h)",
    change24h: "24 Horas (24hs)",
    change1w: "1 Semana (1w)",
    change1M: "1 Mes (1m)",
    dropMetricLabel: "Caída / Drawdown",
    timeframePerformanceLabel: "Rendimiento Multitemporal",
    multiTimeframeMatrixTitle:
      "MATRIZ MULTITEMPORAL DE RANGO, RENDIMIENTO Y DRAWDOWN",
    minPriceLabel: "MÍN",
    maxPriceLabel: "MÁX",
    potentialGainLabel: "Ganancia Potencial",
    maxGainLabel: "Ganancia Potencial",
    maxDropLabel: "Caída Máx",
    drawdownFromHighLabel: "Caída desde Máx",

    // Rules Cards
    rule1Title: "REGLA 1: ACELERACIÓN DEL VOLUMEN DE VENTA",
    rule1Subtitle:
      "Detecta picos anómalos en el volumen de presión de venta de alta frecuencia",
    sellVolumeRatio5m: "Ratio de Venta (5m)",
    sellVolumeZScore: "Puntuación Z de Venta",
    volumeAcceleration: "Aceleración de Volumen",
    normalRatioRange: "Rango normal: 45% - 55%",

    rule2Title: "REGLA 2: RUPTURA DE SOPORTE DEL LIBRO DE ÓRDENES",
    rule2Subtitle:
      "Monitorea la erosión del muro de compra L2 y la desaparición repentina de profundidad",
    nearestBuyWall: "Muro de Compra Cercano",
    wallConsumption: "Consumo del Muro",
    wallIntact: "MURO INTACTO",
    remainingQty: "Restante",

    rule3Title: "REGLA 3: CASCADA DE LIQUIDACIÓN",
    rule3Subtitle:
      "Rastrea liquidaciones forzadas en posiciones Long en Binance USDT-M Futures",
    liquidations1m: "Liquidaciones Long (1m)",
    longCount1m: "Conteo Liqs Long (1m)",
    cascadeRisk: "Riesgo de Cascada",
    noRecentCascade: "No se detecta cascada de liquidaciones reciente",

    orderBookTitle: "LIBRO DE ÓRDENES PROFUNDIDAD L2 BINANCE",
    orderBookSubtitle:
      "Niveles de profundidad superior de Binance escaneados en tiempo real para muros de soporte institucional",
    minWallSize: "TAMAÑO MÍN DE MURO",
    bidPrice: "PRECIO COMPRA (USD)",
    askPrice: "PRECIO VENTA (USD)",
    size: "TAMAÑO",
    depthValue: "VALOR PROFUNDIDAD",

    // Threshold Config
    configTitle: "Umbrales de Activación de Alertas y Webhooks",
    configSubtitle:
      "Configure parámetros de ventana RAM, límites Z-score y despachadores de alertas en tiempo real",
    section1Title: "1. Criptomoneda Activa y Ventana Deslizante en Memoria RAM",
    targetCryptoPair: "Par de Criptomonedas Objetivo",
    activeStreamNote:
      "Símbolo del flujo de Binance activo monitoreado por el motor Sentinel en RAM.",
    slidingWindowSec: "Ventana Deslizante (Segundos)",
    slidingWindowHelp:
      "Duración de la cola de operaciones y liquidaciones en memoria RAM.",

    section2Title: "2. Regla 1: Umbrales de Aceleración de Volumen de Venta",
    zScoreThreshold: "Umbral Z-Score de Volumen de Venta",
    zScoreHelp:
      "Número de desviaciones estándar por encima de la media de 5 minutos para activar advertencia.",
    sellRatioThreshold: "Umbral de Ratio de Volumen de Venta (0.0 - 1.0)",
    sellRatioHelp:
      "Fracción del volumen total que deben ser ventas (ej. 0.70 = 70% ventas).",

    section3Title:
      "3. Regla 2: Umbrales de Ruptura de Soporte del Libro de Órdenes",
    minBuyWallSize: "Tamaño Mínimo del Muro de Soporte de Compra",
    minBuyWallHelp:
      "Cantidad mínima de profundidad requerida para calificar como muro de soporte principal.",
    wallChewThreshold: "Umbral de Consumo del Muro (%)",
    wallChewHelp:
      "Porcentaje del muro de soporte consumido antes de activar la alerta.",

    section4Title: "4. Regla 3: Umbrales de Cascada de Liquidación",
    longLiqSpike: "Pico de Liquidación Long 1m (USD)",
    longLiqHelp:
      "Valor USD de liquidaciones de posiciones long en 60s para confirmar la cascada.",

    section5Title: "5. Despachador de Alertas Webhook y Telegram",
    webhookUrl: "URL Endpoint Webhook HTTP",
    webhookHelp:
      "Recibe la carga útil JSON de alertas en tiempo real en eventos de activación.",
    tgBotToken: "Token del Bot de Telegram (Opcional)",
    tgChatId: "ID del Chat de Telegram (Opcional)",
    soundAlerts: "Habilitar Alarmas de Sirena de Audio para Alertas Críticas",
    alarmSoundTypeLabel: "Seleccionar Tono de Sonido de Alarma",
    alarmSoundTypeHelp:
      "Elija el patrón de onda del sintetizador y la frecuencia de sonido para alertas críticas.",
    testAlarmSoundBtn: "Probar Sonido Seleccionado",

    saveConfigBtn: "Guardar y Aplicar Umbrales",
    testWebhookBtn: "Enviar Carga Útil de Prueba Webhook",
    sendingBtn: "Enviando...",
    clearLogsBtn: "Limpiar historial de alertas",

    // AI Analyst
    aiTitle: "Asesor Inteligente de Mercado",
    aiSubtitle:
      "Diagnóstico y Plan de Acción en Simple • Protección de Capital en Tiempo Real",
    aiPromptHeader: "Consultas Rápidas de Análisis",
    synthesizeRiskPrompt: "Diagnosticar Salud del Mercado",
    orderBookAbsorptionPrompt: "Evaluar Firmeza del Piso de Soporte",
    stopLossPrompt: "Estrategia de Protección de Capital",
    customPromptPlaceholder:
      "Haga preguntas al Asesor IA sobre el estado del mercado...",
    generateReportBtn: "Consultar al Asesor IA",
    analyzingBtn: "Analizando Mercado en Vivo...",
    generatingReport: "Consultando al Asesor IA...",
    reportSuccess: "Diagnóstico de Mercado y Plan de Acción Completo",
    reportError: "Error al generar el diagnóstico de mercado",

    // Alerts Log
    alertsTitle: "Historial de Alertas de Flash Crash en Tiempo Real",
    alertsSubtitle:
      "Registro en memoria de eventos anómalos de mercado detectados por el motor RAM",
    filterAll: "Todas las Alertas",
    filterFlashCrash: "Flash Crash",
    filterCritical: "Críticas",
    filterWarning: "Advertencias",
    filterInfo: "Información",
    noAlerts:
      "Aún no se han activado alertas. El motor Sentinel está monitoreando activamente...",
    copyMarkdown: "Copiar Markdown Telegram",
    copiedMarkdown: "¡Copiado!",
    viewPayload: "Carga Útil JSON",

    // Python Code
    pythonTitle: "Motor Sentinel Crypto Node Python Independiente",
    pythonSubtitle:
      "Script de Python asíncrono sin dependencias pesadas para despliegue local o bots de trading",
    monolithTab: "Motor Monolítico",
    installStep: "1. Instalar Dependencias Asíncronas",
    runStep: "2. Ejecutar Motor Sentinel Crypto Node",
    copyCodeBtn: "Copiar Código",
    downloadCodeBtn: "Descargar Archivo Python",
    copyFileBtn: "Copiar Archivo",
    copiedBtn: "¡Copiado!",
    downloadPyBtn: "Descargar .py",

    // Architecture Docs
    archTitle: "Arquitectura y Diseño del Sistema Sentinel Crypto Node",
    archSubtitle:
      "Especificación del sistema de alerta temprana cripto de alta frecuencia sin base de datos",
    archSection1Title: "1. Motor de Ventana Deslizante en Memoria RAM",
    archSection1Text:
      "El motor Sentinel utiliza un mecanismo de doble ventana implementado completamente en memoria RAM volátil mediante colas de alto rendimiento (collections.deque). Procesa cada operación individual de Binance Spot y liquidación forzada de USDT-M Futures en tiempo real, eliminando cuellos de botella de disco.",
    archSection2Title: "2. Matriz de Evaluación de Riesgo Multifactorial",
    archSection2Text:
      "Tres algoritmos matemáticos independientes analizan continuamente la dinámica de liquidez: (1) Puntuación Z de aceleración de volumen comparando la velocidad de venta de 1m contra la media de 5m; (2) Erosión de muros de compra L2 siguiendo el consumo del soporte; y (3) Detección de picos de liquidación long identificando cascadas de venta.",
    archSection3Title: "3. Despacho de Eventos con Cero Latencia",
    archSection3Text:
      "Cuando se supera cualquier condición de regla o umbral compuesto de riesgo, el motor construye cargas JSON estructuradas y alertas Markdown para Telegram, despachándolas de forma asíncrona mediante webhooks HTTP POST sin interrumpir el procesamiento del flujo.",

    // News & Channels
    newsFeedTitle: "CANAL DE NOTICIAS Y ALERTAS PERSONALIZABLE",
    newsFeedSubtitle:
      "Titulares cripto en tiempo real, desarrollos macro y alertas on-chain procesados directamente de sus canales de origen personalizados.",
    addChannel: "Añadir Canal",
    refreshFeed: "Actualizar Canal",
    refreshing: "Actualizando...",
    searchPlaceholder:
      "Buscar noticias o palabras clave (ej. BTC, Fed, ETF)...",
    allActiveChannels: "Todos los Canales Activos",
    allCategories: "Todas las Categorías",
    allSentiments: "Todos los Sentimientos / Impacto",
    bullishTag: "ALCISTA",
    bearishTag: "BAJISTA",
    highImpactTag: "ALTO IMPACTO",
    neutralTag: "NEUTRAL",
    activeChannelsList: "CANALES ACTIVOS",
    expandChannels: "Expandir Canales",
    collapseChannels: "Contraer Canales",
    resetDefaults: "Restablecer",
    addCustomFeedUrl: "Añadir URL de Feed Personalizado",
    showingHeadlines: "Mostrando",
    headlines: "titulares",
    lastSync: "Última Sincro",
    fetchingUpdates: "Obteniendo Últimas Actualizaciones de Canales...",
    parsingRss: "Procesando feeds RSS y endpoints API en paralelo",
    noNewsMatch: "Ninguna noticia coincide con sus filtros actuales",
    tryClearingFilters:
      "Intente limpiar palabras clave o activar canales adicionales",
    resetAllFilters: "Restablecer Todos los Filtros",
    readArticle: "Leer Artículo",
    addCustomModalTitle: "AÑADIR FEED DE NOTICIAS / RSS PERSONALIZADO",
    channelName: "Nombre del Canal",
    channelNamePlaceholder: "ej. Solana Research Substack o Whale Alert",
    feedUrl: "URL del Feed (RSS / Atom / API)",
    categoryTag: "Etiqueta de Categoría",
    iconEmoji: "Icono / Emoji",
    cancelBtn: "Cancelar",
    saveChannelBtn: "Guardar Canal",
    enterChannelNameErr: "Por favor ingrese un nombre de canal.",
    enterValidUrlErr: "Por favor ingrese una URL HTTP/HTTPS válida.",
    mutedStatus: "Silenciado",
    liveSyncActive: "Sincro en Vivo Activa",
    updatedAgo: "Actualizado hace",
    sourceText: "Fuente",
    categoryNews: "Noticias",
    categoryOnChain: "On-Chain",
    categoryMacro: "Macro",
    categoryAlerts: "Alertas",
    categoryCustom: "Personalizado",
    newsAlertsTitle: "Alertas de Impacto de Noticias Alcistas / Bajistas",
    bullishAlertToggle: "Alertas Alcistas (🟢)",
    bearishAlertToggle: "Alertas Bajistas (🔴)",
    simBullishNewsBtn: "Simular Alerta Alcista",
    simBearishNewsBtn: "Simular Alerta Bajista",
    newsAlertSound: "Tono de Alerta Sonora",
    newsAlertsActive: "Alertas de Noticias Activas",
    dispatchWebhooksNews: "Reenviar a Webhook / Telegram",
    breakingNewsToastTitle: "ALERTA DE ÚLTIMA HORA",
    navSellSignals: "Escáner de Ventas",
    sellSignalTitle: "ESCÁNER DE TOMA DE GANANCIAS Y TECHOS DE MERCADO",
    sellSignalSubtitle:
      "Algoritmo multifactorial de detección de techos de mercado, sobrecompra extrema MFI (>80), clímax de liquidaciones de shorts, saturación de financiación positiva y absorción de órdenes ask",
    sellPillarMfi: "Índice de Sobrecompra MFI",
    sellPillarLiqs: "Liquidaciones de Short Squeeze",
    sellPillarFunding: "Saturación de Financiación Positiva",
    sellPillarResistance: "Resistencia y Absorción Ask",
    sellExecutionLevels: "Niveles de Entrada Short y Take Profit",
    shortEntryZone: "Zona de Entrada Short",
    stopLossCeiling: "Stop Loss de Invalidación",
    takeProfitMeanRev: "Objetivo 1 (Reversión Media)",
    takeProfitDeepSweep: "Objetivo 2 (Barrido de Liquidez)",
    distributionThesis: "Tesis Cuántica de Distribución",
    pushSellAlertTelegram: "Enviar Señal de Venta a Telegram",

    // VWAP & EMA Trend Scanner
    navVwapScanner: "Escáner VWAP & EMA",
    vwapScannerTitle: "ESCÁNER CUÁNTICO DE TENDENCIAS VWAP & EMA",
    vwapScannerSubtitle:
      "Motor algorítmico de alineación de precio ponderado por volumen y medias EMA 9/21 con alertas de cruce en tiempo real y despacho a Telegram",
    vwapPillarVwap: "Anclaje Institucional VWAP",
    vwapPillarEma: "Cinta Dual EMA (9 / 21)",
    vwapPillarCrossover: "Estado de Cruce y Tendencia",
    vwapPillarSpread: "Velocidad y Dispersión EMA",
    vwapExecutionTargets: "Niveles Algorítmicos de Ejecución",
    entryZoneLabel: "Zona de Entrada de Ejecución",
    stopLossLabel: "Stop Loss de Invalidación",
    takeProfit1Label: "Objetivo 1 (Continuación Media)",
    takeProfit2Label: "Objetivo 2 (Expansión Tendencial)",
    riskRewardLabel: "Ratio Riesgo / Beneficio",
    vwapQuantThesis: "Tesis Cuántica de Tendencia",
    pushVwapAlertTelegram: "Enviar Alerta VWAP/EMA a Telegram",
    timeframeLabel: "Temporalidad",
    trendStatusLabel: "Estado de Tendencia",
    audioAlertsLabel: "Alertas Sonoras",
    muteAlertsLabel: "Silenciar Audio",

    // Cryptocurrency Management
    manageCryptos: "Gestionar Criptomonedas",
    cryptoManagerTitle: "GESTOR DE CRIPTOMONEDAS Y LISTA DE SEGUIMIENTO",
    cryptoManagerSubtitle:
      "Agregue, elimine o personalice pares de criptomonedas rastreados en tiempo real por el motor cuantitativo Sentinel y los escáneres",
    activeCryptos: "Lista Activa",
    discoverCryptos: "Descubrir y Añadir Populares",
    customCryptoPair: "Añadir Par Personalizado de Binance",
    addCryptoBtn: "Añadir Cripto",
    removeCryptoBtn: "Eliminar",
    cryptoAddedSuccess: "Criptomoneda añadida exitosamente a la lista activa",
    cryptoRemovedSuccess: "Criptomoneda eliminada de la lista activa",
    cantRemoveLastCrypto:
      "No se puede eliminar: se requiere al menos 1 criptomoneda activa",
    cryptoAlreadyInList: "Esta criptomoneda ya está en su lista activa",
    resetDefaultCryptos: "Restaurar Predeterminadas",
    resetDefaultConfirm:
      "¿Restaurar la lista a las 12 criptomonedas principales?",
    searchAddPlaceholder:
      "Buscar por símbolo o nombre (ej. TAO, RENDER, INJ, SOL)...",
    customSymbolLabel: "Símbolo del Par (Binance)",
    customSymbolHelp: "ej. TAOUSDT, APTUSDT, INJUSDT o el ticker base ej. SUI",
    customNameLabel: "Nombre para Mostrar",
    defaultWallSizeLabel: "Tamaño Muro de Compra Mínimo (Activo Base)",
    verifyingSymbol: "Verificando en Binance...",
    symbolValid: "Símbolo verificado en Binance",
    symbolNotFound: "Par no encontrado en Binance. Revise el símbolo.",
    categoryAll: "Todos los Mercados",
    categoryAi: "IA y Cómputo",
    categoryL1L2: "Capa 1 / Capa 2",
    categoryDefi: "DeFi e Infraestructura",
    categoryMeme: "Memes y Alta Beta",
    inWatchlist: "Añadido",
    addToWatchlist: "Añadir a la Lista",
    removeFromWatchlist: "Eliminar de la Lista",
    quickAddSuggestions: "Añadidos Rápidos Populares:",

    // Shared Scanner & Common Labels
    syncingText: "Sincronizando...",
    liveSpotBadge: "SPOT EN VIVO",
    eventsUnit: "eventos",
    allLabel: "Todas",
    noneLabel: "Ninguna",
    showLabel: "Mostrar",
    hideLabel: "Ocultar",
    activeLabel: "activas",
    optionalLabel: "Opcional",
    copiedLabel: "Copiado",
    copyUserLabel: "Copiar Usuario",
    proBadge: "PRO",
    premiumBadge: "PREMIUM",
    shieldActiveBadge: "ESCUDO ACTIVO",
    crashWarningBadge: "ALERTA DE CRASH",
    whyThisAlertBtn: "¿Por qué la alerta?",
    whyThisAlertTooltip: "Analizar Razón y Favorabilidad",
    receiveTelegram247Btn: "Recibir estas alertas en mi Telegram 24/7",
    viewTechDetailsBtn: "Ver detalles técnicos del algoritmo (Avanzado)",
    rule75Badge: "REGLA ≥75%",
    hideNoiseTooltip: "Ocultar activos con <75%",
    showNoiseTooltip: "Ver activos de menor convicción (<75%)",
    hidingNoiseLabel: "Ocultando Ruido",
    lowerScoringSuffix: "con ruido (<75%)",
    filteredSuffix: "filtrados (<75%)",
    manageCryptosShort: "Gestionar",
    inspectFilteredSetups: "Ver activos secundarios",
    only75SetupsShown: "Solo se muestran setups con confluencia ≥ 75%",
    scanningHighProbTitle:
      "Escaneando configuraciones de alta probabilidad (≥75%)...",
    scanningSetupsEllipsis:
      "Escaneando configuraciones de alta probabilidad...",
    dispatchingLabel: "Enviando...",
    pushToTelegramLabel: "Enviar a Telegram",
    audioOnLabel: "AUDIO ACTIVO",
    mutedUpperLabel: "SILENCIADO",
    muteAudioAlertsTitle: "Silenciar Alertas de Audio",
    enableAudioAlertsTitle: "Activar Alertas de Audio",
    audioAlertSettingsTitle: "Configuración de Audio",
    soundNotificationsLabel: "Notificación Sonora:",
    enabledUpperLabel: "ACTIVADO",
    alertSoundStyleLabel: "Tono de Alerta:",
    testSoundLabel: "Probar Sonido",
    volumeLabel: "Volumen:",
    triggerAtScoreLabel: "Disparar con Puntuación ≥:",
    awaitingNextScannerConfirm:
      "Esperando la próxima confirmación del escáner institucional.",
    spotLabel: "Spot:",
    entryZoneShort: "Zona Entrada:",
    targetTp1Short: "Objetivo TP1:",
    stopLossShort: "Límite Stop:",
    target1Tp1_15R: "Objetivo 1 (TP1 - 1.5R)",
    target2Tp2_25R: "Objetivo 2 (TP2 - 2.5R)",
    stopLossSafetyCap: "Límite de Protección (Stop Loss)",
    futuresFundingLabel: "3. Financiación Futuros",

    // RiskDashboard Localized Keys
    rdConnectingTitle: "Conectando con Binance en Tiempo Real...",
    rdConnectingDesc:
      "Sincronizando el libro de órdenes L2 institucional, cálculo de volatilidad y datos de velas auténticas sin valores simulados.",
    rdProtectionDeskLabel: "PANEL DE PROTECCIÓN AL OPERADOR",
    rdThermometerTitle: "Termómetro de Seguridad del Mercado",
    rdRiskIndexUnit: "/ 100 Índice de Riesgo",
    rdSlidingWindow15s: "Ventana en tiempo real: 15s",
    rdStatusLowBadge: "🟢 MERCADO ESTABLE / RIESGO BAJO",
    rdStatusLowDesc:
      "Condiciones normales de liquidez. Entorno seguro para buscar oportunidades.",
    rdStatusModBadge: "🟡 PRECAUCIÓN / VOLATILIDAD MODERADA",
    rdStatusModDesc:
      "Aumento de ventas o movimientos bruscos. Opere siempre con Stop Loss.",
    rdStatusHighBadge: "🔴 ALERTA DE CAÍDA / RIESGO ALTO",
    rdStatusHighDesc:
      "Fuerte presión de venta o liquidaciones en curso. Evite abrir compras apresuradas.",
    rdScaleSafe: "Seguro",
    rdScaleCaution: "Precaución",
    rdScaleHighRisk: "Riesgo Alto",
    rdScaleFlashCrash: "Caída Inminente",
    rdDrift1m: "Variación 1 min:",
    rdDrift5m: "Variación 5 min:",
    rdRecentPeak: "Pico Máximo Reciente:",
    rdQuickGuideBadge: "GUÍA RÁPIDA PARA EL OPERADOR",
    rdNextAction: "Paso sugerido",
    rdGuideLowTitle: "Condiciones Ideales para Buscar Entradas",
    rdGuideLowDesc:
      "La baja presión de venta permite buscar tendencias alcistas limpias o rebotes con alta confluencia.",
    rdGuideModTitle: "Operar con Cautela y Soporte VWAP",
    rdGuideModDesc:
      "Hay volatilidad en curso. Compruebe la alineación de medias móviles y evite operar contra la tendencia.",
    rdGuideHighTitle: "Protección Activa de Capital",
    rdGuideHighDesc:
      "Se detectan liquidaciones o ventas aceleradas. Se recomienda asegurar ganancias o esperar que el precio frene en soporte.",
    rdBtnInspectVwap: "Ver Tendencia Segura (VWAP)",
    rdBtnScanBuy: "Buscar Oportunidades de Compra",
    rdBtnCheckSell: "Revisar Alertas de Venta (Salida)",
    rdAuthenticBinanceBadge: "DATOS AUTÉNTICOS DE BINANCE",
    rdMatrixTitle: "Rendimiento y Rango Real (24H • 1 Semana • 1 Mes)",
    rdPotentialUpside: "Subida Máxima (+%)",
    rdMaxDropLegend: "Retroceso Máximo (-%)",
    rdTf24hHeader: "24 Horas (1h/24h)",
    rdFetchingKlines: "Consultando velas históricas...",
    rdPeakPrice: "Pico Máximo",
    rdFloorPrice: "Piso Mínimo",
    rdPositionInRange: "Posición en Rango",
    rdBuySellPressureTitle: "Presión de Compra vs. Venta",
    rdBuySellPressureSub: "Últimos 5 minutos en Binance",
    rdBuyersLabel: "Compradores",
    rdSellersLabel: "Vendedores",
    rdBuyersControl: "Los compradores tienen el control del volumen.",
    rdSellersControl: "Los vendedores están dominando el mercado a la baja.",
    rdVolumeBalanced: "Equilibrio temporal entre compradores y vendedores.",
    rdVolume5mTotal: "Volumen 5m Total:",
    rdNearestSupportTitle: "Piso de Soporte Cercano",
    rdNearestSupportSub: "Muro institucional en el libro L2",
    rdKeyDefenseFloor: "Nivel Defensivo Clave:",
    rdCalculatingFloor: "Calculando piso...",
    rdSupportDesc:
      "Precio donde hay órdenes institucionales grandes defendiendo contra una caída.",
    rdSupportStatusLabel: "Estado del Soporte:",
    rdAbsorbedSuffix: "consumido",
    rdFirmSupport: "Soporte Firme",
    rdLiqCascadesTitle: "Cascadas de Liquidación",
    rdLiqCascadesSub: "Cierres forzados de largos",
    rdLast1mLiqs: "Liquidaciones Último Minuto:",
    rdSyncingLiqs: "Sincronizando liquidaciones...",
    rdLiqCascadesDesc:
      "Posiciones de traders que el mercado forzó a cerrar, lo que puede acelerar una caída repentina.",
    rdAlertStateLabel: "Nivel de Alerta:",
    rdCascadeActive: "Cascada Activa",
    rdOrderlyMarket: "Mercado Ordenado",
    rdLiveDepthBadge: "PROFUNDIDAD DEL LIBRO EN VIVO",
    rdOrderBookTitle: "Órdenes Reales de Compra y Venta (Binance Spot)",
    rdMinWallSizeLabel: "Muro Institucional Mínimo:",
    rdBidsColHeader: "COMPRADORES (BID)",
    rdAsksColHeader: "VENDEDORES (ASK)",
    rdVolumeColHeader: "VOLUMEN",
    rdTotalUsdColHeader: "TOTAL USD",
    rdSyncingBids: "Sincronizando libro de compras L2...",
    rdSyncingAsks: "Sincronizando libro de ventas L2...",
    rdWallBadge: "MURO",
    rdInstitutionalTrendBadge: "TENDENCIA INSTITUCIONAL",
    rdBullishTrend: "TENDENCIA ALCISTA",
    rdBearishTrend: "TENDENCIA BAJISTA",
    rdConsolidatingTrend: "CONSOLIDACIÓN",
    rdOpenCompleteScanner: "Abrir Escáner Completo",
    rdVwapAnchor1h: "Ancla VWAP (1h):",
    rdEmaFast9: "EMA Rápida (9):",
    rdEmaSlow21: "EMA Lenta (21):",
    rdEmaSpread: "Separación EMA:",
    rdTeaserTitle: "Alertas Inmediatas por Telegram y Sonido",
    rdTeaserDesc:
      "Reciba avisos antes de caídas súbitas o confirmaciones de tendencia directamente en su móvil.",
    rdTeaserBtn: "CONOCER SENTINEL PREMIUM",

    // BuySignalScanner Localized Keys
    buyScannerTitle: "ESCÁNER DE REBOTES Y OPORTUNIDADES DE COMPRA",
    buyScannerSubtitle:
      "Detección cuantitativa de sobreventa MFI, purgas de liquidación, short squeeze y absorción de volumen pasivo.",
    buyCrashBlockedMsg:
      "🚨 Señales de compra bloqueadas: Alerta de crash activa (Riesgo ≥ 80).",
    buyLinkTelegramErr:
      "Vincula tu cuenta de Telegram en el menú de usuario para recibir alertas directas.",
    buyPushSuccessPrefix: "¡Señal enviada con éxito al chat de Telegram ID:",
    buyPushError: "Error al enviar la señal a Telegram.",
    buyPushNetworkErr: "Error de red al enviar la alerta a Telegram.",
    monitoringAssetsPrefix: "MONITOREANDO",
    monitoringAssetsSuffix: "ACTIVOS",
    buyAudioPanelTitle: "Alertas Sonoras de Compra",
    buySoundArpeggioOption: "Arpegio Cuántico Alcista",
    scanNowBtn: "Escanear Ahora",
    buyTelegramBtn: "Alerta Telegram",
    buyAudioToastTitle: "¡ALERTA DE AUDIO DISPARADA!",
    buyAudioToastAsset: "Activo",
    buyAudioToastMiddle: "superó el umbral con",
    buyCrashBannerRiskPrefix: "Índice de Riesgo:",
    buyCrashBannerBadge: "ALERTA DE RIESGO EXTREMO",
    buyCrashBannerTitle:
      "🚨 SEÑALES DE COMPRA DESACTIVADAS: ALERTA DE CRASH ACTIVA",
    buyCrashBannerDesc:
      "Fuerte presión de venta detectada globalmente. Intentar atrapar cuchillos que caen está restringido para proteger tu capital.",
    buyCrashAntiContradictionTitle:
      "Protocolo de Protección Anti-Contradicción:",
    buyCrashAntiContradictionDesc:
      "Durante caídas de mercado severas o cascadas de liquidación, los osciladores de sobreventa (MFI < 20) pueden permanecer irracionales durante horas. El sistema bloquea compras automáticas hasta que el Índice de Riesgo descienda por debajo de 80.",
    buyMatrixTitle: "OPORTUNIDADES DE ALTA PROBABILIDAD",
    buyFilterActive: "Activos",
    buyFilterStrongBuy: "Compra Fuerte",
    buyFilterOversold: "MFI < 35",
    buyFilterHighScore: "Score ≥ 85",
    buyCardHumanBanner: "🟢 Presión vendedora agotada • Absorción en soporte",
    buyAnalyzeBtn: "Analizar Señal y Favorabilidad",
    buyEmptyNoiseDescPrefix:
      "Ningún activo supera actualmente el umbral de convicción del 75%.",
    buyEmptyNoiseDescSuffix:
      "activos con bajo momentum ocultos para prevenir sobreoperación.",
    buySyncingTitle: "Sincronizando datos en tiempo real para",
    buySyncingDesc: "Consultando velas auténticas, MFI y libro L2 en Binance.",
    buyHighConvictionDetected: "CONFIGURACIÓN DE ALTA CONVICCIÓN",
    buyFavorabilityScore: "Puntuación de Favorabilidad",
    buyHighReboundProb: "Alta Probabilidad de Rebote",
    buyExecutionBlueprint: "Plan de Ejecución Cuantitativo (Basado en ATR)",
    buyEntryZoneFull: "Zona de Entrada (Entry Zone)",
    buyPillar1Title: "1. Índice de Flujo Monetario (MFI)",
    buyPillar1Desc: "Sobreventa extrema señala agotamiento de vendedores.",
    buyPillar2Title: "2. Purga de Liquidaciones",
    buyPillar2Desc: "Purgas eliminan exceso de apalancamiento.",
    buyPillar3Desc: "Financiación baja propicia para rebote.",
    buyPillar4Title: "4. Absorción de Compras L2",
    buyPillar4BidsSuffix: "Compras",
    buyPillar4Desc: "Muros pasivos absorben ventas y frenan caída.",
    buyConfirmedTriggersTitle: "Gatillos Técnicos Confirmados",
    buyTrigMfi: "MFI Sobreventa",
    buyTrigLiq: "Purga Liquidaciones",
    buyTrigFunding: "Financiación Óptima",
    buyTrigAbsorption: "Absorción en Libro",
    buyLowScoreDescPrefix: "El activo actual (Puntuación:",
    buyLowScoreDescSuffix:
      ") no cumple con el umbral institucional estricto ≥75%. Esperando confluencia óptima.",

    // SellSignalScanner Localized Keys
    sellBadgeDistribution: "DISTRIBUCIÓN / SHORT",
    sellLiveSyncLabel: "Sincro en Vivo",
    sellPauseScanTooltip: "Pausar escaneo",
    sellResumeScanTooltip: "Reanudar escaneo",
    sellAudioPanelTitle: "ALERTAS SONORAS DE VENTA",
    sellMinThresholdLabel: "Umbral Mínimo:",
    sellThreshAll: "50 (Todas)",
    sellThreshMod: "75 (Moderadas)",
    sellThreshStrong: "85+ (Fuertes)",
    sellAlarmToneLabel: "Tono de Alarma:",
    sellDistChimeOption: "Campana de Distribución",
    sellTestAlarmBtn: "Probar Sonido de Alarma",
    sellAudioTriggeredLabel: "Alerta sonora disparada:",
    sellLinkTelegramErr:
      "Debe vincular su Telegram en la pestaña de Umbrales primero.",
    sellPushSuccessPrefix: "¡Señal enviada con éxito a Telegram (Chat ID:",
    sellPushFail: "Error al enviar alerta a Telegram.",
    sellNetworkErr: "Error de conexión.",
    sellSyncingTitle: "Sincronizando distribución en vivo para",
    sellSyncingDesc: "Consultando velas auténticas, MFI y libro L2 en Binance.",
    sellAwaitingNextUpdate:
      "Esperando la próxima actualización del escáner cuantitativo.",
    sellDistDetectedBadge: "DISTRIBUCIÓN DETECTADA",
    sellDistributionScore: "Puntuación de Distribución",
    sellHighSellingPressure: "Alta Intensidad de Venta",
    sellExecutionPlanAtr: "Plan de Ejecución en Corto / Salida (ATR)",
    sellPillar1Title: "1. MFI (Flujo Monetario)",
    sellPillar1Desc: "Sobrecompra extrema > 80",
    sellPillar2Title: "2. Clímax Liqs Short",
    sellPillar2Exhaustion: "TECHO DE AGOTAMIENTO",
    sellPillar2Normal: "NORMAL",
    sellPillar2Desc: "Squeeze de shorts liquidado",
    sellPillar3Desc: "Largos sobreapalancados",
    sellPillar4Title: "4. Resistencia Ask y Desacel.",
    sellPillar4AsksSuffix: "Asks",
    sellPillar4Fading: "COMPRA AGOTADA",
    sellPillar4Steady: "ESTABLE",
    sellPillar4Desc: "Muros de venta absorbiendo compras",
    sellTriggersMetTitle: "Gatillos Técnicos Cumplidos:",
    sellTrigMfi: "MFI Sobrecompra",
    sellTrigShortLiq: "Short Liq Squeeze",
    sellTrigFunding: "Financiación +",
    sellTrigAskWalls: "Muros de Venta",
    sellTrigMomFade: "Pérdida Momentum",
    sellDeepRationaleBtn:
      "Analizador Cuántico de Razón de Señal & Favorabilidad",
    sellRadarTitle: "RANKING CUÁNTICO DE PARES",
    sellRadarPairsSuffix: "Pares de Alta Convicción de Venta",
    sellFilterAll: "TODOS",
    sellFilterStrongSell: "VENTA FUERTE",
    sellFilterOverbought: "SOBRECOMPRA",
    sellFilterScore75: "SCORE ≥ 75",
    sellCardHumanBanner: "🔴 Presión compradora agotada • Freno en resistencia",
    sellAnalyzeBtn: "Analizar Señal",
    sellEmptyTitle: "Escaneando señales de venta de alta convicción (≥75%)...",
    sellEmptyDescPrefix:
      "Ningún par muestra agotamiento institucional con puntuación ≥75%.",
    sellEmptyDescSuffix: "pares con ruido de baja convicción filtrados.",
    sellHidingShort: "Ocultando",

    // VwapEmaScanner Localized Keys
    vwapWeeklyLabel: "1S",
    vwapWeeklyTooltip: "Marco Semanal (1 Semana)",
    vwapMonthlyLabel: "1M",
    vwapMonthlyTooltip: "Marco Mensual Macro (1 Mes)",
    vwapAudioActive: "Sonido Activo",
    vwapMuted: "Silenciado",
    vwapAudioSettings: "Ajustes de Audio",
    vwapTestSoundShort: "Probar",
    vwapAlertVolume: "Volumen de Alerta",
    vwapPausedBadge: "PAUSADO",
    vwapLinkTelegramErr:
      "Vincule su cuenta de Telegram a continuación antes de despachar alertas.",
    vwapPushSuccessPrefix: "¡Señal",
    vwapPushSuccessMiddle: "enviada a Telegram Chat ID",
    vwapPushFail: "Error al enviar alerta a Telegram",
    vwapNetworkErr: "Error de red al enviar alerta a Telegram",
    vwapCrossBullish: "CRUCE ALCISTA",
    vwapCrossBearish: "CRUCE BAJISTA",
    vwapSustainedUptrend: "TENDENCIA ALCISTA",
    vwapSustainedDowntrend: "TENDENCIA BAJISTA",
    vwapConsolidation: "CONSOLIDACIÓN / CHOP",
    vwapSyncingTitlePrefix: "Sincronizando VWAP & EMA para",
    vwapSyncingDesc:
      "Calculando velas reales multi-temporalidad en el servidor.",
    vwapTrendScoreLabel: "Puntaje de Tendencia",
    vwapMultiTfTitle: "Alineación Multi-Marco de Tendencia",
    vwapScanningBadge: "ESCANEANDO...",
    vwapAnalyzingBadge: "ANALIZANDO",
    vwapIntradayLabel: "Intradiario",
    vwapWeeklyCardLabel: "Semanal (1W)",
    vwapMonthlyCardLabel: "Mensual (1M)",
    vwapBullTag: "ALCISTA ▲",
    vwapBearTag: "BAJISTA ▼",
    vwapChopTag: "LATERAL ▬",
    vwapChopShortTag: "LATERAL",
    vwapMacroBiasLabel: "Sesgo Macro:",
    vwapMacroBull: "Alcista",
    vwapMacroBear: "Bajista",
    vwapDevLabel: "Desviación:",
    vwapEma9Fast: "EMA 9 (Rápida)",
    vwapEma21Slow: "EMA 21 (Lenta)",
    vwapGtEma21Bull: "> EMA 21 (Alcista)",
    vwapLtEma21Bear: "< EMA 21 (Bajista)",
    vwapDynamicBenchmark: "Soporte dinámico",
    vwapStrongExpansion: "Expansión Fuerte",
    vwapCompressed: "Comprimido",
    vwapAnalyzeConfluenceBtn: "Analizar Confluencia",
    vwapRadarTitle: "Radar de Confluencia",
    vwapPairsUnit: "Pares",
    vwapTimeframePrefix: "Marco:",
    vwapLiveStreamedSuffix: "Actualizado en vivo",
    vwapManageTooltip: "Añadir o Quitar Criptomonedas",
    vwapFilterBuy: "COMPRA",
    vwapFilterSell: "VENTA",
    vwapFilterCross: "CRUCE",
    vwapScoreLabel: "Puntaje:",
    vwapMacro33Badge: "3/3 MACRO",
    vwapCounterBadge: "CONTRA",
    vwapEmptyNoiseDescPrefix:
      "Ningún par presenta alineación de tendencia limpia con puntuación ≥75%.",
    vwapEmptyNoiseDescSuffix: "pares con ruido de consolidación filtrados.",

    // TelegramConfig / TelegramLinkCard Localized Keys
    tgCardTitle: "Alertas por Telegram (PRO)",
    tgLinkedBadge: "VINCULADO",
    tgCardSubtitle:
      "Alertas algorítmicas de trading y Flash Crash directo a su dispositivo móvil 24/7",
    tgExclusiveProTitle: "Función Exclusiva para Suscriptores PRO",
    tgExclusiveProDesc:
      "La vinculación con el Bot de Telegram envía alertas instantáneas de caídas abruptas de precio y ruptura de buy walls antes de que afecten su portafolio.",
    tgUpgradeToLinkBtn: "MEJORAR A PREMIUM PARA VINCULAR ($29)",
    tgBotActiveSynced: "BOT ACTIVO Y SINCRONIZADO",
    tgLinkedAtLabel: "Vinculado",
    tgActiveFallback: "Activo",
    tgChatIdLabel: "ID de Chat Telegram",
    tgOfficialBotLabel: "Bot Oficial",
    tgAutoAlertsNote:
      "Las alertas automáticas se enviarán a este Chat ID siempre que se detecten condiciones críticas en el libro de órdenes.",
    tgRadarAssetsTitle: "Monedas en el Radar",
    tgTop3Recommended: "★ Top 3 (Recomendado)",
    tgRadarAssetsDesc:
      "Selecciona de qué monedas quieres recibir alertas instantáneas en tu celular. Recomendamos elegir entre 1 y 3 para mantener el enfoque.",
    tgZeroAssetsWarning:
      "⚠️ Ninguna moneda seleccionada: no recibirás alertas en Telegram hasta que elijas al menos una moneda.",
    tgNightProTipLabel: "Pro Tip:",
    tgNightProTipBody:
      "El mercado nunca duerme. Sentinel vigila 24/7. Recomendamos usar el modo 'No Molestar' de tu teléfono o silenciar el chat nativamente en Telegram si prefieres silencio durante la madrugada.",
    tgDispatchTestBtn: "Enviar Alerta de Prueba",
    tgUnlinkBtn: "Desvincular",
    tgUnlinkConfirm: "¿Desvincular bot de Telegram?",
    tgStepsTitle: "Pasos para Vincular su Telegram",
    tgOfficialAlertBotLabel: "Bot Oficial de Alertas:",
    tgOpenBotBtn: "Abrir Bot",
    tgStep1Title: "Abra el Bot de Telegram",
    tgStep1DescPrefix: 'Haga clic en "Abrir Bot" o busque',
    tgStep1DescSuffix: "en Telegram y toque INICIAR (/start).",
    tgStep2Title: "Obtenga su Chat ID",
    tgStep2Desc:
      "El bot responderá instantáneamente con su Chat ID numérico privado.",
    tgStep3Title: "Ingrese o Guarde su Chat ID",
    tgStep3Desc:
      "Guarde su Chat ID para recibir alertas instantáneas sin retrasos.",
    tgOpenBotFullBtn: "Abrir Bot en Telegram",
    tgUsernameLabel: "Usuario de Telegram",
    tgChatIdPlaceholder: "ej. 1234567890",
    tgUsernamePlaceholder: "ej. trader_pro",
    tgSaveAndLinkBtn: "Guardar y Vincular Telegram",
    tgLinkSuccess: "¡Cuenta de Telegram vinculada con éxito!",
    tgLinkError: "Error al vincular Telegram",
    tgTestNeedLink:
      "Debe guardar y vincular su Chat ID antes de enviar una alerta de prueba.",
    tgTestServerErrPrefix: "Error del servidor",
    tgTestServerErrSuffix: "No se pudo despachar la alerta de prueba.",
    tgTestSuccessPrefix: "✓ Alerta de prueba enviada con éxito al Chat ID",
    tgTestStartBotErr:
      "Error al enviar alerta a Telegram. Verifique que haya iniciado el bot con /start.",
    tgTestNetworkErr: "Error de red o conexión con el despachador de Telegram.",

    // App Shell & Thresholds Localized Keys
    appFreePlanBannerTitle: "ACCESO GRATUITO LIMITADO - PLAN FREE",
    appFreePlanBannerDesc:
      "Actualmente está en el modo Free Tier. Actualice a Sentinel Premium para desbloquear alertas privadas 24/7 en Telegram, planes de ejecución ATR y avisos de ruptura y evacuación.",
    appVwapGateTitle: "TENDENCIA SEGURA • ESCÁNER VWAP & EMA",
    appVwapGateDesc:
      "El acceso al escáner institucional de alineación tendencial VWAP y cruce de medias EMA 9/21, alertas sonoras personalizadas y notificaciones en tiempo real a Telegram requiere una suscripción activa a Sentinel Premium.",
    appVwapRiskPill:
      "Riesgo Bajo • Operaciones a favor de la tendencia institucional (1H, 1S, 1M)",
    appBuyGateTitle: "OPORTUNIDADES DE COMPRA • REBOTES Y SOBREVENTA",
    appBuyGateDesc:
      "El acceso al escáner algorítmico de oportunidades, sobreventa MFI, purgas de liquidación, short squeeze y alertas automáticas a Telegram es una función exclusiva del plan Premium.",
    appBuyRiskPill:
      "Riesgo Medio • Compras rápidas tras caídas fuertes del mercado",
    appSellGateTitle: "ALERTAS DE VENTA • TOMA DE GANANCIAS",
    appSellGateDesc:
      "El acceso al escáner cuantitativo de distribución, sobrecompra extrema MFI, clímax de liquidaciones de shorts, saturación de financiación y alertas automáticas a Telegram es una función exclusiva del plan Premium.",
    appSellRiskPill:
      "Protección • Detección de sobrecompra y techos de mercado",
    appAiGateTitle: "ASESOR IA • ANÁLISIS EN SIMPLE",
    appAiGateDesc:
      "La generación de reportes de riesgo cuantitativo con IA en lenguaje claro y recomendaciones estratégicas es una función exclusiva del plan Premium.",
    appConfigGateTitle: "ALERTAS Y TELEGRAM • NOTIFICACIONES INTELIGENTES",
    appConfigGateDesc:
      "Vincule su bot de Telegram para recibir alertas automáticas en su celular y configure notificaciones sonoras en tiempo real.",
    appAdvancedThresholdsSummary:
      "Configuración Avanzada de Umbrales Algorítmicos (Opcional para Expertos)",
    appFooterBrand:
      "SENTINEL QUANT • Plataforma Inteligente de Análisis y Protección Cripto",
    appFooterStatus:
      "Monitoreo de Mercado en Tiempo Real • Protección de Capital Activa",
    thresholdsUpdatedToast: "Umbrales Actualizados en Vivo",
    manageCryptosPlusMinus: "Gestionar Criptos (+/-)",
    telegramWebhookProTitle: "Alertas Telegram y Webhooks (Exclusivo PRO)",
    telegramWebhookProDesc:
      "El despacho de alertas automáticas vía Telegram Bot (@SentinelRiskBot\_bot) y Webhooks HTTP de ultra baja latencia está disponible exclusivamente para cuentas Premium.",
    unlockTelegramWebhookBtn: "DESBLOQUEAR TELEGRAM & WEBHOOKS ($29)",
    webhookDispatchDesc:
      "Enviará un payload JSON POST cuando el Risk Index supere el umbral configurado.",

    // Streamlined Header (Command Center)
    hdrBrandTitle: "SENTINEL",
    hdrManageCoins: "Gestionar Monedas",
    hdrMuteAudio: "Silenciar alertas de audio",
    hdrUnmuteAudio: "Activar alertas de audio",
    hdrLogin: "Ingresar",
    hdrUpgradePro: "PRO $29",
    hdrProShort: "PRO",
    hdrFreeShort: "GRATIS",
    hdrTierLabel: "Plan:",
    hdrExpiresLabel: "Vence:",
    hdrTelegramLinked: "Telegram: Conectado",
    hdrTelegramConnect: "Conectar Telegram",
    hdrManageSub: "Gestionar Suscripción",
    hdrSignOut: "Cerrar Sesión",
    hdrLiveTag: "EN VIVO",
    hdrOfflineTag: "CONECTANDO",
    hdrMacroShieldActive: "ESCUDO MACRO",
    hdrMacroShieldArmed: "ESCUDO ACTIVO",

    // Command Center: Block 1 - Global Flash Crash Shield
    ccBlock1Label: "Escudo Global Anti-Crash",
    ccRiskIndexLabel: "Índice de Riesgo Global",
    ccBtcHealthLabel: "Riesgo BTC",
    ccEthHealthLabel: "Riesgo ETH",
    ccStatusStable: "🟢 Mercado Estable: Condiciones óptimas para operar.",
    ccStatusCaution: "🟡 Precaución: Volatilidad en aumento.",
    ccStatusCrash:
      "🚨 ESCUDO ANTI-CRASH ACTIVO: Señales de compra bloqueadas para proteger tu capital.",
    ccMacroShieldBanner:
      "Ventana macro de EE. UU. activa — nuevas entradas pausadas por seguridad.",
    ccSellingPressureTitle: "Monedas en Presión de Venta",
    ccRiskShortLabel: "Riesgo",

    // Command Center: Block 2 - Unified Active Signals Feed
    ccBlock2Title: "Señales Activas de Alta Probabilidad",
    ccBlock2Subtitle:
      "Oportunidades claras listas para ejecutar con protección automática de capital.",
    ccScopeWatchlist: "Mi Watchlist",
    ccScopeGlobalRadar: "Radar Global",
    ccInWatchlistBtn: "En Watchlist",
    ccAddToWatchlistBtn: "+ Watchlist",
    ccRemoveFromWatchlistTooltip: "Quitar de Mi Watchlist",
    ccAddToWatchlistTooltip: "Añadir a Mi Watchlist",
    ccEmptyWatchlistSignalsTitle: "Sin Señales Activas en tu Watchlist",
    ccEmptyWatchlistSignalsDesc:
      "Ninguna de las monedas en tu Watchlist supera actualmente el umbral institucional ≥75%. Cambia a Radar Global para explorar todos los pares monitoreados o añade más monedas.",
    ccSwitchToGlobalRadarBtn: "Ver Radar Global",
    ccFilterAll: "Todas",
    ccFilterBuy: "Solo Compras",
    ccFilterSell: "Toma de Ganancias y Caídas",
    ccBadgeBuy: "🟢 OPORTUNIDAD DE COMPRA",
    ccBadgeSell: "🔴 TOMA DE GANANCIAS",
    ccBadgeBreakdown: "🚨 ALERTA DE CAÍDA / EVACUACIÓN",
    ccBreakdownHeadline: "🚨 {symbol} — RUPTURA BAJISTA / RIESGO DE CAÍDA",
    ccBuySimpleDesc:
      "Fuerte respaldo comprador en soporte clave. Alta probabilidad de rebote con protección ajustada en {sl}.",
    ccSellSimpleDesc:
      "Presión vendedora detectada en zona de resistencia. Protección superior fijada en {sl}.",
    ccBreakdownSimpleDesc:
      "Fuerte presión de venta detectada en {symbol} tras perder su soporte institucional (VWAP). Riesgo de caída mayor.",
    ccPlanEntryZone: "Zona de Entrada",
    ccPlanStopLoss: "Stop Loss",
    ccPlanMaxStopNote: "Máx. 4%",
    ccPlanTp1: "TP1 (1.5R)",
    ccPlanTp2: "TP2 (2.5R)",
    ccPlanBrokenSupport: "Soporte Perdido (VWAP)",
    ccPlanEmergencyExit: "Salida de Emergencia",
    ccPlanDownside1: "Objetivo Bajista 1",
    ccPlanDownside2: "Objetivo Bajista 2",
    ccCrashBuyLockedNote:
      "Las señales de compra están bloqueadas mientras el Escudo Anti-Crash esté activo.",
    ccSendToTelegramBtn: "Enviar a Mi Telegram",
    ccSendingToTelegram: "Enviando...",
    ccSentToTelegramOk: "✅ ¡Enviado a Telegram!",
    ccUnlockTelegramCta: "Activar Alertas Telegram 24/7",
    ccEmptySignalsTitle: "Radar de Mercado Activo",
    ccEmptySignalsDesc:
      "Escaneando el mercado 24/7. Te avisaremos por Telegram apenas se confirme una oportunidad de alta probabilidad.",
    ccConfidenceLabel: "Puntaje",

    // Command Center: Block 3 - Telegram 24/7 Hub & Coin Selector
    ccBlock3Title: "Centro Telegram 24/7 y Monedas en Radar",
    ccBlock3Subtitle:
      "Vincula tu cuenta de Telegram y elige qué monedas envían alertas automáticas a tu celular.",
    ccManageCoinsBtn: "Añadir / Quitar Monedas",
    ccMonitoredCountLabel: "monedas activas",

    // Command Center: Block 4 - Recent Winning Signals Ledger
    ccBlock4Title: "Historial Reciente de Señales Ganadoras",
    ccBlock4Subtitle:
      "Señales verificadas en esta sesión que alcanzaron TP1 o TP2 frente a precios reales del mercado.",
    ccTrackerActiveBadge: "Verificando cada 20s",
    ccColAsset: "Activo",
    ccColSignal: "Señal",
    ccColTarget: "Objetivo",
    ccColGain: "Ganancia",
    ccColClosed: "Cerrada",
    ccSignalBuyTag: "COMPRA",
    ccSignalSellTag: "VENTA",
    ccLedgerEmptyTitle: "Aún no hay objetivos alcanzados en esta sesión",
    ccLedgerEmptyDesc:
      "Cada señal activa se verifica cada 20 segundos con precios en vivo. Los cierres ganadores en TP1/TP2 aparecerán aquí automáticamente.",

    // Subscription / Upgrade Modal (5 Core Production Pillars)
    subModalSubtitle:
      "Bot privado de alertas 24/7 en Telegram, planes ATR exactos y Escudo Anti-Crash",
    subModalActiveDesc:
      "Cuenta con acceso ilimitado al Bot Privado de Alertas 24/7 en Telegram, planes de ejecución ATR, Escudo Global Anti-Crash y radar personalizado Spot y Futuros.",
    subModalFeaturesTitle: "Beneficios Exclusivos Premium",
    subFeature1Title: "Bot Privado de Alertas 24/7 en Telegram",
    subFeature1Desc:
      "Notificaciones instantáneas de Compra, Toma de Ganancias y Evacuación directo a tu celular.",
    subFeature2Title: "Planes de Ejecución Exactos (ATR)",
    subFeature2Desc:
      "Zona de Entrada, Objetivos TP1/TP2 y Stop Loss estricto limitado al 4% de riesgo máximo en cada señal.",
    subFeature3Title: "Escudo Global Anti-Crash",
    subFeature3Desc:
      "Radar de riesgo en tiempo real que bloquea las compras durante desplomes para proteger tu capital.",
    subFeature4Title: "Alertas de Ruptura y Evacuación",
    subFeature4Desc:
      "Avisos inmediatos por moneda cuando se rompen soportes institucionales (VWAP/EMA) con fuerte presión de venta.",
    subFeature5Title: "Radar Personalizado (Spot y Futuros)",
    subFeature5Desc:
      "Monitoreo 24/7 de tus criptomonedas favoritas de Binance con filtro inteligente anti-spam.",
  },
};
