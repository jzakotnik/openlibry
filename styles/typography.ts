import palette from "./palette";

const baseStyles = {
  header: {
    h1: {
      fontSize: "2.25rem",
      lineHeight: "1.17",
      "@media (max-width:600px)": {
        fontSize: "1.75rem",
        lineHeight: "1.21",
      },
      marginBottom: "24px",
    },
    h2: {
      fontSize: "1.75rem",
      lineHeight: "1.21",
      "@media (max-width:600px)": {
        fontSize: "1.5rem",
        lineHeight: "1.25",
      },
      marginBottom: "16px",
    },
    h3: {
      fontSize: "1.5rem",
      lineHeight: "1.25",
      "@media (max-width:600px)": {
        fontSize: "1.25rem",
        lineHeight: "1.4",
      },
      marginBottom: "16px",
    },
  },
  body: {
    body1: {
      fontSize: "1rem",
      lineHeight: "1.5",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: "1.43",
    },
  },
};

const header = {
  h1: {
    color: palette.text.secondary,
    ...baseStyles.header.h1,
  },
  h1_primary_contrast: {
    color: palette.primary.contrastText,
    ...baseStyles.header.h1,
  },
  h2: {
    color: palette.text.tertiary,
    ...baseStyles.header.h2,
  },
  h2_primary_light: {
    color: palette.primary.light,
    ...baseStyles.header.h2,
  },
  h2_secondary_main: {
    color: palette.secondary.main,
    ...baseStyles.header.h2,
  },
  h3: {
    color: palette.text.tertiary,
    ...baseStyles.header.h3,
  },
  h3_primary_contrast: {
    color: palette.primary.contrastText,
    ...baseStyles.header.h3,
  },
  h4: {
    color: palette.text.tertiary,
    fontSize: "1.25rem",
    lineHeight: "1.4",
    "@media (max-width:600px)": {
      fontSize: "1.125rem",
      lineHeight: "1.44",
    },
  },
  h5: {
    color: palette.text.tertiary,
    fontSize: "1.125rem",
    lineHeight: "1.44",
    "@media (max-width:600px)": {
      fontSize: "1rem",
      lineHeight: "1.5",
    },
  },
  h6: {
    fontFamily: "KFWCentroSansBold",
    color: palette.text.secondary,
    fontSize: "0.85rem",
    lineHeight: "1.5",
  },
};

const body = {
  body1_primary_contrast: {
    color: palette.primary.contrastText,
    ...baseStyles.body.body1,
  },
  body1: {
    color: palette.text.secondary,
    ...baseStyles.body.body1,
  },
  body1_white: {
    fontSize: "1rem",
    color: "#fff",
    lineHeight: "1.5",
  },
  body1_white_bold: {
    fontFamily: "KFWCentroSansBold",
    fontSize: "1rem",
    color: "#fff",
    lineHeight: "1.5",
  },
  body2: {
    color: palette.text.secondary,
    ...baseStyles.body.body2,
  },
  body2_primary_contrast: {
    color: palette.primary.contrastText,
    ...baseStyles.body.body2,
  },
  link: {
    color: palette.text.tertiary,
    fontSize: "0.875rem",
    lineHeight: "1.43",
  },
  body2_bold: {
    fontFamily: "KFWCentroSansBold",
    color: palette.text.secondary,
    fontSize: "0.875rem",
    lineHeight: "1.43",
  },
  body3: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
    lineHeight: "1.5",
  },
};

const typography = {
  fontSize: 16,
  htmlFontSize: 16,
  color: palette.text.primary,
  fontFamily: ["Roboto", "Helvetica Neue", "Arial", "sans-serif"].join(","),
  ...header,
  ...body,
};

export default typography;
