import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 20 
  },
  progressHeader: { 
    paddingTop: 15, 
    paddingBottom: 10 
  },
  stepText: { 
    fontSize: 13, 
    color: '#888', 
    marginBottom: 6, 
    fontWeight: '500' 
  },
  progressBarBackground: { 
    height: 6, 
    backgroundColor: '#F0F0F0', 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: '#E91E63', 
    borderRadius: 3 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingVertical: 15 
  },
  stepContainer: { 
    width: '100%' 
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E91E63',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#2D3748', 
    marginBottom: 12,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16, 
    backgroundColor: '#F7FAFC' 
  },
  calendarCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  selectedDateText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#E91E63',
  },
  optionCard: { 
    padding: 14, 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    marginBottom: 10 
  },
  selectedOption: { 
    borderColor: '#E91E63', 
    backgroundColor: '#FCE4EC' 
  },
  optionText: { 
    fontSize: 15, 
    color: '#4A5568', 
    textAlign: 'center', 
    fontWeight: '500' 
  },
  selectedOptionText: { 
    color: '#E91E63', 
    fontWeight: '700' 
  },
  navigationButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12, 
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  prevBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E91E63', 
    alignItems: 'center' 
  },
  prevBtnText: { 
    color: '#E91E63', 
    fontWeight: '600', 
    fontSize: 15 
  },
  nextBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 12, 
    backgroundColor: '#E91E63', 
    alignItems: 'center' 
  },
  nextBtnText: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 15 
  },
});