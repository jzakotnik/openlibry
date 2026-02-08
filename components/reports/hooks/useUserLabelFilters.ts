import { useState } from "react";
import { TopicCount } from "../cards/cardConstants";

export function useUserLabelFilters() {
  const [startLabel, setStartLabel] = useState(0);
  const [startUserId, setStartUserId] = useState(0);
  const [endUserId, setEndUserId] = useState(0);
  const [idUserFilter, setIdUserFilter] = useState(0);
  const [schoolgradeFilter, setSchoolgradeFilter] =
    useState<TopicCount | null>(null);

  return {
    startLabel,
    setStartLabel,
    startUserId,
    setStartUserId,
    endUserId,
    setEndUserId,
    idUserFilter,
    setIdUserFilter,
    schoolgradeFilter,
    setSchoolgradeFilter,
  };
}
