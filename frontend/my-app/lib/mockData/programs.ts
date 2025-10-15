//Mock data

export const mockPrograms = [
  {
    id: "1",
    title: "Campus Fitness Bootcamp",
    description:
      "Join our high-energy morning fitness sessions designed to improve endurance, strength, and flexibility. All levels are welcome!",
    location: "Bronco Recreation and Intramural Complex (BRIC)",
    startTime: "2025-10-20T07:00:00",
    endTime: "2025-10-20T08:30:00",
  },
  {
    id: "2",
    title: "Student Union Game Night",
    description:
      "An evening of games, snacks, and fun! Compete in board games and video game tournaments with other students.",
    location: "BSC Ursa Major Room",
    startTime: "2025-10-22T18:00:00",
    endTime: "2025-10-22T21:00:00",
  },
  {
    id: "3",
    title: "Outdoor Adventure: Mt. Baldy Hike",
    description:
      "Experience a guided hike through Mt. Baldy’s scenic trails. Transportation and gear provided. Register early — spots fill up fast!",
    location: "Meet at BRIC North Entrance",
    startTime: "2025-10-28T06:00:00",
    endTime: "2025-10-28T13:00:00",
  },
  {
    id: "4",
    title: "Art and Wellness Workshop",
    description:
      "A relaxing evening combining mindfulness practices with creative art activities. Materials will be provided.",
    location: "University Art Studio 204",
    startTime: "2025-10-25T17:00:00",
    endTime: "2025-10-25T19:00:00",
  },
];

//data fetching... replace with db when ready
export async function getProgramById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockPrograms.find((p) => p.id === id);
}
