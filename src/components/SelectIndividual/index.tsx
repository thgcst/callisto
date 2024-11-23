import { useState } from "react";

import { useIndividuals } from "@/swr/individual";

import Autocomplete from "../Autocomplete";

interface SelectIndividualProps {
  id?: string;
  name?: string;
  label?: string;
  onChange: (individual: { id: string; name: string } | null) => void;
}

const SelectIndividual: React.FC<SelectIndividualProps> = ({
  id,
  name,
  label,
  onChange,
}) => {
  const [query, setQuery] = useState("");
  const { individuals } = useIndividuals({ name: query });

  return (
    <Autocomplete
      id={id}
      name={name}
      options={individuals.map((item) => ({
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
