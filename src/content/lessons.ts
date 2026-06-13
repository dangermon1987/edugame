import type { Lesson, QuizQuestion, SubjectId } from '@/domain/types'

let qSeq = 0
function q(type: string, prompt: string, options: string[], correctIndex: number, hint?: string): QuizQuestion {
  return { id: `q${++qSeq}`, type, prompt, options, correctIndex, hint }
}

interface LessonSeed {
  title: string
  description: string
  estMinutes: number
  coinReward: number
  gemReward: number
  questions: QuizQuestion[]
}

function build(subjectId: SubjectId, seeds: LessonSeed[]): Lesson[] {
  return seeds.map((s, i) => ({
    id: `${subjectId}-l${i + 1}`,
    subjectId,
    order: i + 1,
    ...s,
  }))
}

const english = build('english', [
  {
    title: 'ABCs & Phonics',
    description: 'Learn the alphabet sounds',
    estMinutes: 15,
    coinReward: 50,
    gemReward: 0,
    questions: [
      q('Phonics', 'Which letter makes the "mmm" sound?', ['M', 'N', 'B', 'P'], 0, 'Like in "mom"'),
      q('Phonics', 'What sound does "S" make?', ['ssss', 'zzz', 'fff', 'kkk'], 0),
      q('Vocabulary', 'Which word starts with "B"?', ['Ball', 'Cat', 'Dog', 'Fish'], 0),
      q('Phonics', 'Which letter comes after "C"?', ['D', 'B', 'E', 'A'], 0),
    ],
  },
  {
    title: 'First Words',
    description: 'Common sight words & spelling',
    estMinutes: 20,
    coinReward: 75,
    gemReward: 0,
    questions: [
      q('Spelling', 'How do you spell the color of the sky?', ['blue', 'bloo', 'blew', 'blu'], 0),
      q('Vocabulary', 'A baby dog is called a…', ['puppy', 'kitten', 'cub', 'foal'], 0),
      q('Sight Words', 'Pick the correct word: "I ___ happy."', ['am', 'is', 'are', 'be'], 0),
      q('Vocabulary', 'Which one is a fruit?', ['apple', 'chair', 'shoe', 'car'], 0),
    ],
  },
  {
    title: 'Sentence Building',
    description: 'Put words together to make sentences',
    estMinutes: 20,
    coinReward: 100,
    gemReward: 3,
    questions: [
      q('Vocabulary', 'Which word means "very happy"?', ['Sad', 'Joyful', 'Angry', 'Tired'], 1, 'Choose the best answer'),
      q('Grammar', 'Which sentence is correct?', ['The cat run.', 'The cat runs.', 'The cat running.', 'Cat the runs.'], 1),
      q('Grammar', 'Pick the question.', ['I like cake.', 'Do you like cake?', 'Cake is good.', 'We ate cake.'], 1),
      q('Vocabulary', 'The opposite of "big" is…', ['small', 'tall', 'wide', 'huge'], 0),
    ],
  },
  {
    title: 'Grammar Basics',
    description: 'Nouns, verbs & adjectives',
    estMinutes: 20,
    coinReward: 100,
    gemReward: 0,
    questions: [
      q('Grammar', 'Which word is a noun?', ['quickly', 'dog', 'jump', 'happy'], 1, 'A noun is a person, place or thing'),
      q('Grammar', 'Which word is an action (verb)?', ['table', 'swim', 'blue', 'soft'], 1),
      q('Grammar', 'Which word describes (adjective)?', ['run', 'shiny', 'eat', 'box'], 1),
      q('Grammar', 'Pick the plural of "child".', ['childs', 'children', 'childes', 'child'], 1),
    ],
  },
])

const math = build('math', [
  {
    title: 'Counting Fun',
    description: 'Count from 1 to 20',
    estMinutes: 12,
    coinReward: 50,
    gemReward: 0,
    questions: [
      q('Counting', 'What comes after 7?', ['8', '6', '9', '5'], 0),
      q('Counting', 'How many fingers on one hand?', ['5', '4', '6', '10'], 0),
      q('Counting', 'Count: 🍎🍎🍎. How many apples?', ['3', '2', '4', '5'], 0),
      q('Counting', 'What is the biggest number?', ['12', '9', '7', '3'], 0),
    ],
  },
  {
    title: 'Addition Adventure',
    description: 'Add numbers up to 20',
    estMinutes: 18,
    coinReward: 80,
    gemReward: 0,
    questions: [
      q('Addition', '2 + 3 = ?', ['5', '4', '6', '7'], 0),
      q('Addition', '6 + 4 = ?', ['10', '9', '11', '8'], 0),
      q('Addition', '7 + 5 = ?', ['12', '11', '13', '10'], 0),
      q('Addition', '9 + 9 = ?', ['18', '16', '19', '17'], 0),
    ],
  },
  {
    title: 'Subtraction Safari',
    description: 'Take away numbers',
    estMinutes: 18,
    coinReward: 90,
    gemReward: 0,
    questions: [
      q('Subtraction', '5 - 2 = ?', ['3', '2', '4', '1'], 0),
      q('Subtraction', '10 - 4 = ?', ['6', '5', '7', '8'], 0),
      q('Subtraction', '8 - 8 = ?', ['0', '1', '8', '16'], 0),
      q('Subtraction', '15 - 5 = ?', ['10', '9', '11', '20'], 0),
    ],
  },
  {
    title: 'Shapes & Patterns',
    description: 'Circles, squares & more',
    estMinutes: 15,
    coinReward: 100,
    gemReward: 3,
    questions: [
      q('Shapes', 'How many sides does a triangle have?', ['3', '4', '5', '2'], 0),
      q('Shapes', 'Which shape is round?', ['Circle', 'Square', 'Triangle', 'Rectangle'], 0),
      q('Shapes', 'A square has how many equal sides?', ['4', '3', '2', '5'], 0),
      q('Patterns', 'Finish: 🔴🔵🔴🔵🔴 ?', ['🔵', '🔴', '🟢', '🟡'], 0),
    ],
  },
])

const science = build('science', [
  {
    title: 'Amazing Animals',
    description: 'Learn about animals',
    estMinutes: 15,
    coinReward: 60,
    gemReward: 0,
    questions: [
      q('Animals', 'Which animal says "moo"?', ['Cow', 'Dog', 'Cat', 'Duck'], 0),
      q('Animals', 'Which animal can fly?', ['Bird', 'Fish', 'Snake', 'Frog'], 0),
      q('Animals', 'Where do fish live?', ['Water', 'Trees', 'Caves', 'Sky'], 0),
      q('Animals', 'A baby cat is a…', ['kitten', 'puppy', 'calf', 'chick'], 0),
    ],
  },
  {
    title: 'Our Planet',
    description: 'Earth, water & sky',
    estMinutes: 18,
    coinReward: 80,
    gemReward: 0,
    questions: [
      q('Nature', 'What do plants need to grow?', ['Sunlight', 'Candy', 'Plastic', 'Darkness'], 0),
      q('Nature', 'What falls from clouds when it rains?', ['Water', 'Sand', 'Rocks', 'Leaves'], 0),
      q('Nature', 'Which is a planet?', ['Earth', 'Sun', 'Moon', 'Cloud'], 0),
      q('Nature', 'What color is grass?', ['Green', 'Blue', 'Red', 'Purple'], 0),
    ],
  },
  {
    title: 'The Human Body',
    description: 'How our body works',
    estMinutes: 18,
    coinReward: 90,
    gemReward: 0,
    questions: [
      q('Body', 'What do we use to see?', ['Eyes', 'Ears', 'Nose', 'Hands'], 0),
      q('Body', 'How many fingers do you have in total?', ['10', '5', '8', '12'], 0),
      q('Body', 'What pumps blood in your body?', ['Heart', 'Brain', 'Lungs', 'Stomach'], 0),
      q('Body', 'We hear with our…', ['ears', 'eyes', 'teeth', 'feet'], 0),
    ],
  },
  {
    title: 'Weather Watch',
    description: 'Sun, rain & seasons',
    estMinutes: 15,
    coinReward: 100,
    gemReward: 3,
    questions: [
      q('Weather', 'What do you need on a rainy day?', ['Umbrella', 'Sunglasses', 'Sled', 'Fan'], 0),
      q('Weather', 'Which season is the coldest?', ['Winter', 'Summer', 'Spring', 'Fall'], 0),
      q('Weather', 'The sun gives us…', ['Light & heat', 'Rain', 'Snow', 'Wind'], 0),
      q('Weather', 'What shape do snowflakes have?', ['Six points', 'Square', 'Round ball', 'Triangle'], 0),
    ],
  },
])

const art = build('art', [
  {
    title: 'Color Splash',
    description: 'Primary & mixed colors',
    estMinutes: 12,
    coinReward: 50,
    gemReward: 0,
    questions: [
      q('Colors', 'Red + Yellow = ?', ['Orange', 'Green', 'Purple', 'Brown'], 0),
      q('Colors', 'Blue + Yellow = ?', ['Green', 'Orange', 'Pink', 'Gray'], 0),
      q('Colors', 'Which is a primary color?', ['Red', 'Orange', 'Green', 'Purple'], 0),
      q('Colors', 'Red + Blue = ?', ['Purple', 'Green', 'Yellow', 'Black'], 0),
    ],
  },
  {
    title: 'Shapes in Art',
    description: 'Draw with basic shapes',
    estMinutes: 15,
    coinReward: 70,
    gemReward: 0,
    questions: [
      q('Drawing', 'Which shape makes a good sun?', ['Circle', 'Square', 'Triangle', 'Line'], 0),
      q('Drawing', 'A house roof is often a…', ['Triangle', 'Circle', 'Oval', 'Star'], 0),
      q('Drawing', 'How many points does a star have?', ['5', '3', '4', '6'], 0),
      q('Drawing', 'Which tool do we paint with?', ['Brush', 'Spoon', 'Hammer', 'Cup'], 0),
    ],
  },
  {
    title: 'Famous Art',
    description: 'Artists & masterpieces',
    estMinutes: 18,
    coinReward: 90,
    gemReward: 0,
    questions: [
      q('Art History', 'What do artists use to make sculptures?', ['Clay', 'Water', 'Air', 'Sound'], 0),
      q('Art History', 'A painting of a person is a…', ['Portrait', 'Landscape', 'Pattern', 'Doodle'], 0),
      q('Art History', 'Which is a warm color?', ['Red', 'Blue', 'Purple', 'Teal'], 0),
      q('Art History', 'A picture of nature scenery is a…', ['Landscape', 'Portrait', 'Selfie', 'Logo'], 0),
    ],
  },
  {
    title: 'Create & Craft',
    description: 'Make your own art',
    estMinutes: 20,
    coinReward: 100,
    gemReward: 3,
    questions: [
      q('Craft', 'What do we use to cut paper?', ['Scissors', 'Spoon', 'Pencil', 'Cup'], 0),
      q('Craft', 'Glue is used to…', ['Stick things', 'Cut things', 'Paint things', 'Erase things'], 0),
      q('Craft', 'Which makes pictures stick on a fridge?', ['Magnet', 'Water', 'Air', 'Light'], 0),
      q('Craft', 'Origami is the art of folding…', ['Paper', 'Metal', 'Glass', 'Stone'], 0),
    ],
  },
])

export const LESSONS: Lesson[] = [...english, ...math, ...science, ...art]
export const LESSONS_BY_SUBJECT: Record<SubjectId, Lesson[]> = {
  english,
  math,
  science,
  art,
}
export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l])) as Record<string, Lesson>
