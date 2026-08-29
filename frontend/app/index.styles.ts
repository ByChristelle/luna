import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
const { width } = Dimensions.get('window');


export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    paddingBottom: 40,
  },

  /* ================== BANDEAU MODE INVITÉ ================== */
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 8,
  },
  guestBannerText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
  },
  guestCta: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  guestCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },

  /* ========================================================= */
  /* ====================== DASHBOARD ======================== */
  /* ========================================================= */
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helloText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  nameText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textMain,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },

  cycleCard: {
    marginHorizontal: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  cardCentered: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loaderText: {
    marginTop: 12,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorTitle: {
    marginTop: 12,
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textMain,
    textAlign: 'center',
  },
  errorSub: {
    marginTop: 6,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaMini: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },
  ctaMiniText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.textMain,
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary,
    marginRight: 2,
  },

  statsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  statsGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  statSubValue: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  shortcutsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  shortcutsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  shortcutBtn: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  shortcutIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMain,
    textAlign: 'center',
  },

  /* ========================================================= */
  /* ====================== LANDING ========================== */
  /* ========================================================= */
  hero: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  brandName: {
    fontFamily: FONTS.script,
    fontSize: 52,
    color: COLORS.primary,
    marginTop: 4,
    marginBottom: 18,
  },
  slogan: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.textMain,
    textAlign: 'center',
    lineHeight: 30,
  },
  sloganLine2: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.textMain,
    textAlign: 'center',
    marginTop: 4,
  },
  sloganScript: {
    fontFamily: FONTS.script,
    fontSize: 32,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  ctaContainer: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
  ctaPrimary: {
    height: 54,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaPrimaryGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    opacity: 1,
  },
  ctaPrimaryText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  ctaSecondary: {
    height: 52,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  ctaSecondaryText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.primary,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  waveContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveBar: {
    width: width * 0.6,
    height: 6,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  featuresSection: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  featuresTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 6,
  },
  featuresSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 26,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: COLORS.primaryLight,
  },
  featureTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textMain,
    marginBottom: 6,
  },
  featureDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  footer: {
    paddingTop: 36,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});