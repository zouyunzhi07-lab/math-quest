import { Question } from './types';

// Sample question bank - Level 1 (Numbers & Basic Operations)
export const questions: Question[] = [
  // Level 1-1: Basic Addition
  {
    id: '1-1-1',
    majorLevel: 1,
    minorLevel: 1,
    type: 'choice',
    question: 'What is the SUM of 5 and 3?',
    options: ['6', '7', '8', '9'],
    correctAnswer: '8',
    explanation: '5 + 3 = 8. "Sum" means the result of addition.',
    vocabulary: ['sum', 'addition', 'plus', 'add']
  },
  {
    id: '1-1-2',
    majorLevel: 1,
    minorLevel: 1,
    type: 'fill',
    question: '12 + 7 = ___',
    correctAnswer: '19',
    explanation: '12 + 7 = 19',
    vocabulary: ['addition', 'total']
  },
  {
    id: '1-1-3',
    majorLevel: 1,
    minorLevel: 1,
    type: 'boolean',
    question: 'Is 15 the SUM of 8 and 7?',
    correctAnswer: 'true',
    explanation: '8 + 7 = 15, so this is TRUE.',
    vocabulary: ['sum', 'addition']
  },
  {
    id: '1-1-4',
    majorLevel: 1,
    minorLevel: 1,
    type: 'choice',
    question: 'If you ADD 6 to 9, what is the RESULT?',
    options: ['13', '14', '15', '16'],
    correctAnswer: '15',
    explanation: '9 + 6 = 15. "Result" is the answer to a math problem.',
    vocabulary: ['add', 'result', 'total']
  },
  {
    id: '1-1-5',
    majorLevel: 1,
    minorLevel: 1,
    type: 'fill',
    question: '___ + 4 = 11',
    correctAnswer: '7',
    explanation: '7 + 4 = 11',
    vocabulary: ['unknown', 'missing number']
  },

  // Level 1-2: Basic Subtraction
  {
    id: '1-2-1',
    majorLevel: 1,
    minorLevel: 2,
    type: 'choice',
    question: 'What is the DIFFERENCE between 9 and 4?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '5',
    explanation: '9 - 4 = 5. "Difference" means the result of subtraction.',
    vocabulary: ['difference', 'subtraction', 'minus', 'subtract']
  },
  {
    id: '1-2-2',
    majorLevel: 1,
    minorLevel: 2,
    type: 'fill',
    question: '15 - 8 = ___',
    correctAnswer: '7',
    explanation: '15 - 8 = 7',
    vocabulary: ['subtraction', 'minus']
  },
  {
    id: '1-2-3',
    majorLevel: 1,
    minorLevel: 2,
    type: 'boolean',
    question: 'Is 6 the DIFFERENCE when you subtract 5 from 11?',
    correctAnswer: 'true',
    explanation: '11 - 5 = 6, so this is TRUE.',
    vocabulary: ['difference', 'subtract']
  },
  {
    id: '1-2-4',
    majorLevel: 1,
    minorLevel: 2,
    type: 'choice',
    question: 'What is 20 MINUS 12?',
    options: ['6', '7', '8', '9'],
    correctAnswer: '8',
    explanation: '20 - 12 = 8',
    vocabulary: ['minus', 'subtract', 'take away']
  },
  {
    id: '1-2-5',
    majorLevel: 1,
    minorLevel: 2,
    type: 'fill',
    question: '___ - 6 = 9',
    correctAnswer: '15',
    explanation: '15 - 6 = 9',
    vocabulary: ['unknown', 'missing number']
  },

  // Level 1-3: Multiplication Basics
  {
    id: '1-3-1',
    majorLevel: 1,
    minorLevel: 3,
    type: 'choice',
    question: 'What is the PRODUCT of 4 and 3?',
    options: ['10', '11', '12', '13'],
    correctAnswer: '12',
    explanation: '4 × 3 = 12. "Product" means the result of multiplication.',
    vocabulary: ['product', 'multiplication', 'times', 'multiply']
  },
  {
    id: '1-3-2',
    majorLevel: 1,
    minorLevel: 3,
    type: 'fill',
    question: '5 TIMES 4 = ___',
    correctAnswer: '20',
    explanation: '5 × 4 = 20',
    vocabulary: ['times', 'multiply']
  },
  {
    id: '1-3-3',
    majorLevel: 1,
    minorLevel: 3,
    type: 'boolean',
    question: 'Is 24 the PRODUCT of 6 and 4?',
    correctAnswer: 'true',
    explanation: '6 × 4 = 24, so this is TRUE.',
    vocabulary: ['product', 'multiply']
  },
  {
    id: '1-3-4',
    majorLevel: 1,
    minorLevel: 3,
    type: 'choice',
    question: '3 multiplied by 7 equals ___',
    options: ['18', '20', '21', '24'],
    correctAnswer: '21',
    explanation: '3 × 7 = 21',
    vocabulary: ['multiplied by', 'multiply']
  },
  {
    id: '1-3-5',
    majorLevel: 1,
    minorLevel: 3,
    type: 'fill',
    question: '___ × 5 = 25',
    correctAnswer: '5',
    explanation: '5 × 5 = 25',
    vocabulary: ['multiplication', 'times']
  },

  // Level 1-4: Division Basics
  {
    id: '1-4-1',
    majorLevel: 1,
    minorLevel: 4,
    type: 'choice',
    question: 'What is 20 DIVIDED BY 4?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '5',
    explanation: '20 ÷ 4 = 5. "Divided by" means division.',
    vocabulary: ['divided by', 'division', 'quotient']
  },
  {
    id: '1-4-2',
    majorLevel: 1,
    minorLevel: 4,
    type: 'fill',
    question: '18 ÷ 3 = ___',
    correctAnswer: '6',
    explanation: '18 ÷ 3 = 6',
    vocabulary: ['division', 'quotient']
  },
  {
    id: '1-4-3',
    majorLevel: 1,
    minorLevel: 4,
    type: 'boolean',
    question: 'Is 7 the QUOTIENT of 35 divided by 5?',
    correctAnswer: 'true',
    explanation: '35 ÷ 5 = 7, so this is TRUE.',
    vocabulary: ['quotient', 'divided by']
  },
  {
    id: '1-4-4',
    majorLevel: 1,
    minorLevel: 4,
    type: 'choice',
    question: 'What is the quotient when 24 is divided by 6?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    explanation: '24 ÷ 6 = 4',
    vocabulary: ['quotient', 'divided']
  },
  {
    id: '1-4-5',
    majorLevel: 1,
    minorLevel: 4,
    type: 'fill',
    question: '___ ÷ 7 = 3',
    correctAnswer: '21',
    explanation: '21 ÷ 7 = 3',
    vocabulary: ['division', 'quotient']
  },

  // Level 1-5: Mixed Operations
  {
    id: '1-5-1',
    majorLevel: 1,
    minorLevel: 5,
    type: 'choice',
    question: 'What is 8 + 4 × 2? (Remember: multiply first!)',
    options: ['16', '24', '12', '20'],
    correctAnswer: '16',
    explanation: '4 × 2 = 8, then 8 + 8 = 16. Multiplication before addition!',
    vocabulary: ['operation', 'order', 'multiply', 'add']
  },
  {
    id: '1-5-2',
    majorLevel: 1,
    minorLevel: 5,
    type: 'fill',
    question: '15 - 3 × 4 = ___',
    correctAnswer: '3',
    explanation: '3 × 4 = 12, then 15 - 12 = 3',
    vocabulary: ['multiplication', 'subtraction']
  },
  {
    id: '1-5-3',
    majorLevel: 1,
    minorLevel: 5,
    type: 'boolean',
    question: 'Is 10 + 5 × 2 = 20?',
    correctAnswer: 'true',
    explanation: '5 × 2 = 10, then 10 + 10 = 20. TRUE!',
    vocabulary: ['order of operations']
  },
  {
    id: '1-5-4',
    majorLevel: 1,
    minorLevel: 5,
    type: 'choice',
    question: 'Calculate: 20 ÷ 4 + 3',
    options: ['5', '6', '7', '8'],
    correctAnswer: '7',
    explanation: '20 ÷ 4 = 5, then 5 + 3 = 7',
    vocabulary: ['division', 'addition']
  },
  {
    id: '1-5-5',
    majorLevel: 1,
    minorLevel: 5,
    type: 'fill',
    question: '6 × 3 - 8 = ___',
    correctAnswer: '10',
    explanation: '6 × 3 = 18, then 18 - 8 = 10',
    vocabulary: ['multiplication', 'subtraction']
  },
];

// Emotional rewards for completing levels
export const rewards = [
  { level: 1, title: 'Great Start!', message: 'You are amazing! Keep learning! 🌟' },
  { level: 2, title: 'Awesome!', message: 'You are so smart! Math is fun! 🎉' },
  { level: 3, title: 'Fantastic!', message: 'You are getting better every day! ⭐' },
  { level: 4, title: 'Super Star!', message: 'Nothing can stop you now! 🚀' },
  { level: 5, title: 'Brilliant!', message: 'Your brain is getting stronger! 💪' },
  { level: 6, title: 'Excellent!', message: 'You think like a real mathematician! 🧠' },
  { level: 7, title: 'Outstanding!', message: 'You are on your way to becoming a doctor! 🎓' },
  { level: 8, title: 'Magnificent!', message: 'Your English Math skills are growing! 📚' },
  { level: 9, title: 'Phenomenal!', message: 'Almost there! You are incredible! 🌈' },
  { level: 10, title: 'You Did It!', message: 'Congratulations! You are now Dr. Nana/Jimi! 🏆' },
];

export function getQuestionsForLevel(major: number, minor: number): Question[] {
  return questions.filter(q => q.majorLevel === major && q.minorLevel === minor);
}

export function getReward(level: number) {
  return rewards[level - 1] || rewards[rewards.length - 1];
}
