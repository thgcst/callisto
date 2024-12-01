import { useMemo, useState } from "react";

import { useSearchIndividuals } from "@/swr/individual";

import Autocomplete from "../Autocomplete";

interface SelectIndividualProps {
  id?: string;
  name?: string;
  label?: string;
  onChange: (individual: { id: string; name: string } | null) => void;
  idsToExclude?: string[];
}

const SelectIndividual: React.FC<SelectIndividualProps> = ({
  id,
  name,
  label,
  onChange,
  idsToExclude = [],
}) => {
  const [query, setQuery] = useState("");
  const { individuals } = useSearchIndividuals({ name: query });

  const individualsFiltered = useMemo(
    () =>
      individuals.filter((individual) => !idsToExclude.includes(individual.id)),
    [idsToExclude, individuals],
  );

  return (
    <Autocomplete
      id={id}
      name={name}
      options={individualsFiltered.map((item) => ({
        ...item,
        label: item.name,
        value: item.id,
      }))}
      onQueryChange={setQuery}
      query={query}
      placeholder="Digite para buscar"
      label={label}
      onChange={(selectedId) => {
        if (!selectedId) return onChange(null);

        const individual = individuals.find((item) => item.id === selectedId);
        if (!individual) return;

        onChange({ id: individual.id, name: individual?.name });
      }}
    />
  );
};

export default SelectIndividual;
