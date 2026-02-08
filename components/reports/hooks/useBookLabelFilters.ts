import { useState } from "react";
import { TopicCount } from "../cards/cardConstants";

export function useBookLabelFilters() {
  const [startLabel, setStartLabel] = useState(0);
  const [startId, setStartId] = useState(0);
  const [endId, setEndId] = useState(0);
  const [idFilter, setIdFilter] = useState(0);
  const [topicsFilter, setTopicsFilter] = useState<TopicCount | null>(null);

  return {
    startLabel,
    setStartLabel,
    startId,
    setStartId,
    endId,
    setEndId,
    idFilter,
    setIdFilter,
    topicsFilter,
    setTopicsFilter,
  };
}
