
import { WellnessTip } from './types';

export const WELLNESS_TIPS: WellnessTip[] = [
  {
    id: '1',
    category: 'balance',
    content: {
      en: "Pause. Take a deep breath. You don’t have to solve everything today.",
      om: "Hargansuu gad fagoo fudhadhu. Har'a waan hunda hiikuu hin qabdu.",
      am: "ትንሽ ቆም በሉ። ጥልቅ ትንፋሽ ይውሰዱ። ዛሬ ሁሉንም ነገር መፍታት የለብዎትም።"
    }
  },
  {
    id: '2',
    category: 'stress',
    mood: 'Stressed',
    content: {
      en: "Focus on one small task. Progress reduces stress.",
      om: "Hojii xiqqaa tokko irratti xiyyeeffadhu. Tarkaanfiin dhiphuu hir'isa.",
      am: "በአንድ ትንሽ ተግባር ላይ ያተኩሩ። መሻሻል ውጥረትን ይቀንሳል።"
    }
  },
  {
    id: '3',
    category: 'balance',
    mood: 'Sad',
    content: {
      en: "Talk to someone you trust, even briefly.",
      om: "Nama amantu tokko waliin dubbadhu, yoo xiqqaate yeroo gabaabaaf.",
      am: "ለሚያምኑት ሰው በትንሹም ቢሆን ያነጋግሩ።"
    }
  },
  {
    id: '4',
    category: 'motivation',
    mood: 'Happy',
    content: {
      en: "Energy follows attention. Where are you focusing today?",
      om: "Annisaan xiyyeeffannoo hordofa. Har'a eessa irratti xiyyeeffachaa jirta?",
      am: "ጉልበት ትኩረትን ይከተላል። ዛሬ የት ላይ ነው የሚያተኩሩት?"
    }
  },
  {
    id: '5',
    category: 'focus',
    content: {
      en: "Consistency beats intensity. Small daily steps lead to big changes.",
      om: "Itti fufiinsaan hojjechuun dandeettii caala. Tarkaanfiin guyyaa guyyaa jijjiirama guddaa fida.",
      am: "ቀጣይነት ከከባድ ጥረት ይበልጣል። ትናንሽ የየቀኑ እርምጃዎች ወደ ትልቅ ለውጥ ያመራሉ።"
    }
  },
  {
    id: '6',
    category: 'motivation',
    mood: 'Motivated',
    content: {
      en: "Your potential is endless. Keep that momentum going!",
      om: "Dandeettiin kee dhuma hin qabu. Tarkaanfii kee itti fufi!",
      am: "አቅምዎ ማለቂያ የለውም። ያንን መነሳሳት ይቀጥሉበት!"
    }
  },
  {
    id: '7',
    category: 'balance',
    mood: 'Tired',
    content: {
      en: "Rest is not a reward. It is a requirement for growth.",
      om: "Boqonnaan badhaasa miti. Guddinaaf dirqama.",
      am: "እረፍት ሽልማት አይደለም። ለዕድገት አስፈላጊ መስፈርት ነው።"
    }
  },
  {
    id: '8',
    category: 'balance',
    mood: 'Angry',
    content: {
      en: "Anger is often a shield for pain. Be gentle with yourself.",
      om: "Aariin yeroo baay'ee dhukkubbii dhoksa. Ofitti gaarii ta'i.",
      am: "ቁጣ ብዙ ጊዜ የሕመም መከላከያ ነው። ለራስዎ ቸር ይሁኑ።"
    }
  }
];

export function getDailyTip(language: 'en' | 'om' | 'am' = 'en'): string {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tip = WELLNESS_TIPS[dayOfYear % WELLNESS_TIPS.length];
  return tip.content[language];
}

export function getTipByMood(mood: string, language: 'en' | 'om' | 'am' = 'en'): string | null {
  const tip = WELLNESS_TIPS.find(t => t.mood === mood);
  return tip ? tip.content[language] : null;
}
