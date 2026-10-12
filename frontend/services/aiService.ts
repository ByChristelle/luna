import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const  = async (
  userPrompt: string,
  cyclePhase: string = 'folliculaire',
  cycleDay: number = 1
): Promise<string> => {
  try {
    const token = useAuthStore.getState().token;
    const response = await axios.post(
      'http://127.0.0.1:8000/api/ai/ask',
      { prompt: userPrompt, cycle_phase: cyclePhase, cycle_day: cycleDay },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.reply;
  } catch (error: any) {
    console.error('[aiService] Erreur:', error?.response?.data || error.message);
    return "Désolé, je rencontre un problème. Réessaie plus tard.";
  }
};
