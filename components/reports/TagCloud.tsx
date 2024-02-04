import Box from "@mui/material/Box";
import { ColorOptions, TagCloud } from "react-tagcloud";

interface TagCloudPropType {
  tagsSet: Array<string>;
}

export default function TagCloudDashboard({ tagsSet }: TagCloudPropType) {
  const options = {
    luminosity: "dark",
    hue: "blue",
  } as ColorOptions;
  const data = [] as any;
  const tags = Object.keys(tagsSet);
  tags.map((t: any) => data.push({ value: t, count: tagsSet[t] }));
  //take only the top 30 keywords
  const sortedData = data
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 80);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        textAlign: "center",
        py: 0.5,
      }}
    >
      {" "}
      <TagCloud
        minSize={12}
        maxSize={35}
        tags={sortedData}
        colorOptions={options}
      />
    </Box>
  );
}
