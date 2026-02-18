import { ColorOptions, TagCloud } from "react-tagcloud";

interface TagCloudPropType {
  tagsSet: Array<any>;
}

export default function TagCloudDashboard({ tagsSet }: TagCloudPropType) {
  const options = {
    luminosity: "dark",
    hue: "blue",
  } as ColorOptions;

  const sortedData = tagsSet
    .map((t: any) => ({ value: t.topic, count: t.count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 80);

  return (
    <div className="flex flex-col w-full text-center py-1">
      <TagCloud
        minSize={12}
        maxSize={35}
        tags={sortedData}
        colorOptions={options}
      />
    </div>
  );
}
