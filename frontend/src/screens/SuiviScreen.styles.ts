import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';


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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
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

    statValue: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  statSubValue: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
