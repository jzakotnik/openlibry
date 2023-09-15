import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { BookType } from "@/entities/BookType";

interface MinAgeChartType {
  books: Array<BookType>;
}

function calculateHistogram(books: Array<BookType>) {
  const data = {};

  books.map((b) => {
    if ("minAge" in b) {
      if (b.minAge! in data) {
        (data as any)[b.minAge!] = (data as any)[b.minAge!] + 1;
      } else {
        (data as any)[b.minAge!] = 1;
      }
    }
  });

  const histogramLabels = [] as any;
  const histogramValues = { datasets: [] } as any;
  const dataValues = [] as any;
  Object.entries(data).map((e) => {
    if (e[0] != "null") {
      histogramLabels.push(e[0]);
      dataValues.push(e[1]);
    }
  });
  histogramValues.datasets.push({ data: dataValues });
  return { labels: histogramLabels, values: histogramValues };
}

export default function MinAgeChart({ books }: MinAgeChartType) {
  Chart.register(CategoryScale);
  Chart.register(LinearScale);
  Chart.register(BarController);
  Chart.register(BarElement);
  //console.log("Rendering Min Age Chart", books);
  //const data = calculateHistogram({ books: books });
  const sampledata = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
      },
    ],
  };
  //what a mess, holiday is waiting
  const calcData = calculateHistogram(books);
  const labels = calcData.labels;
  const datasets = calcData.values;
  const data = { labels: labels, datasets: datasets.datasets };
  //console.log(sampledata, data);

  return (
    <Bar
      data={data}
      width={400}
      height={200}
      options={{
        maintainAspectRatio: false,
      }}
    />
  );
}
