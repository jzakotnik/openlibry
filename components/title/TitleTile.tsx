import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import Layout from "@/components/layout/Layout";

interface TitleFileType {
  title: string;
  subtitle: string;
  onClick: any;
}

export default function TitleTile({ title, subtitle, onClick }: TitleFileType) {
  return (
    <Paper
      sx={{
        width: 200,
        height: 200,
        display: "flex",
        textAlign: "center",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ":hover": {
          boxShadow: 10,
        },
        backgroundColor: "tertiary.dark",
        borderRadius: 5,
        p: 2,
      }}
      onClick={onClick}
    >
      <Typography variant="h3" component="div" sx={{ color: "primary.light" }}>
        {title}
      </Typography>
      <Typography sx={{ mb: 1.5, color: "primary.light" }}>
        {subtitle}
      </Typography>
    </Paper>
  );
}
