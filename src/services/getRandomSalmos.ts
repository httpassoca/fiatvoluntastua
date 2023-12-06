import json from '../salmos.json'

type Chapter = {
  chapter: number;
  text: string[];
};
const salmos: Chapter[] = json; 

function getRandomItemFromArray(jsonArray: any[]) {
  // Check if the input array is empty or not an array
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    return null;
  }

  // Generate a random index within the array length
  const randomIndex = Math.floor(Math.random() * jsonArray.length);

  // Return the random item from the array
  return jsonArray[randomIndex];
}

export const getRandomSalmo = () => {
  // Get a random item from the JSON array
  const salmoRandom: Chapter = getRandomItemFromArray(salmos) || salmos[50];

  const salmo = `
    SALMO ${salmoRandom.chapter}

${salmoRandom.text.join('\n')}
  `
  return salmo
}
