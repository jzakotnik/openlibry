export default function getMaxId(array: any) {
  if (array.length === 0) {
    return null; // Return null if the array is empty
  }

  return array.reduce((max: any, obj: any) => {
    return obj.id > max ? obj.id : max;
  }, array[0].id);
}
