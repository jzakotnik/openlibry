type TopicCount = {
  topic: string;
  count: number;
};

/**
 * Converts an array of string arrays (or plain strings) into
 * a deduplicated list of { topic, count } objects.
 *
 * Handles both nested arrays (e.g. from splitting book topics)
 * and flat string arrays (e.g. school grades).
 */
export function convertToTopicCount(
  arr: (string | string[])[],
): TopicCount[] {
  const flattenedArray = arr.flat();

  const topicCountMap = flattenedArray.reduce(
    (acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.keys(topicCountMap).map((topic) => ({
    topic,
    count: topicCountMap[topic],
  }));
}

/**
 * Extracts topic tags from books and returns topic counts.
 * Topics are stored as semicolon-separated strings on each book.
 */
export function getBookTopicCounts(
  books: Array<{ topics?: string | null }>,
): TopicCount[] {
  const allTags: string[][] = [];
  books.forEach((b) => {
    if (b.topics) {
      allTags.push(b.topics.split(";").filter((t: string) => t.length > 0));
    }
  });
  return convertToTopicCount(allTags);
}

/**
 * Extracts school grade counts from users.
 */
export function getSchoolGradeCounts(
  users: Array<{ schoolGrade?: string | null }>,
): TopicCount[] {
  const allGrades: string[] = [];
  users.forEach((u) => {
    if (u.schoolGrade) {
      allGrades.push(u.schoolGrade);
    }
  });
  return convertToTopicCount(allGrades);
}
