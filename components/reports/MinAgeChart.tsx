import Box from "@mui/material/Box";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Chart,
} from "chart.js";

import { Typography, Grid } from "@mui/material";
import { BookType } from "@/entities/BookType";
import { Category } from "@mui/icons-material";

interface MinAgeChartType {
  books: Array<BookType>;
}

function calculateHistogram(books: MinAgeChartType) {
  const data = {};

  books.map((b) => {
    if (b.minAge in data) (data as any)[b.minAge] = (data as any)[b.minAge] + 1;
    else (data as any)[b.minAge] = 1;
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
  console.log("Rendering Min Age Chart", books);
  //const data = calculateHistogram({ books: books });
  const sampledata = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  //what a mess, holiday is waiting
  const calcData = calculateHistogram(books);
  const labels = calcData.labels;
  const datasets = calcData.values;
  const data = { labels: labels, datasets: datasets.datasets };
  console.log(sampledata, data);

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
