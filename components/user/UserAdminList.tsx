import { Typography, IconButton, ListItemButton } from "@mui/material";
import { useState } from "react";

import InputIcon from "@mui/icons-material/Input";

import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";

import palette from "@/styles/palette";
import { UserType } from "@/entities/UserType";

export default function UserAdminList({
  users,
  rentals,
  searchString,
  selectItem,
  handleEditUser,
}: any) {
  //attach amount of rented books to the user
  const rentalAmount: { [key: number]: number } = {};

  rentals.map((r: any) => {
    if (r.userid in rentalAmount) {
      rentalAmount[r.userid] = rentalAmount[r.userid] + 1;
    } else rentalAmount[r.userid] = 1;
  });

  return (
    <List dense={true}>
      {users.map((u: UserType) => {
        if (
          u.lastName.toLowerCase().includes(searchString.toLowerCase()) ||
          u.firstName.toLowerCase().includes(searchString.toLowerCase())
        )
          return (
            <ListItem
              key={u.id}
              secondaryAction={
                <IconButton
                  onClick={() => handleEditUser(u.id)}
                  edge="end"
                  aria-label="delete"
                >
                  <InputIcon />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => selectItem(u.id!.toString())}>
                <ListItemAvatar>
                  <Avatar>
                    {rentalAmount[u.id!] != undefined ? rentalAmount[u.id!] : 0}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    "Klasse " +
                    u.schoolGrade +
                    ", Lehrkaft " +
                    u.schoolTeacherName
                  }
                  primaryTypographyProps={{
                    variant: "caption",
                    color: palette.secondary.light,
                  }}
                  secondaryTypographyProps={{
                    color: palette.primary.main,
                  }}
                  secondary={u.lastName + ", " + u.firstName}
                />
              </ListItemButton>
            </ListItem>
          );
      })}
    </List>
  );
}
