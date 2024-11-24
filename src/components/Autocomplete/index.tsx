import React, { Fragment } from "react";

import {
  Combobox,
  Label,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  Field,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useDebounceCallback } from "usehooks-ts";

interface OptionBase<Value> {
  label: string;
  value: Value;
  description?: string;
}

interface IAutocomplete<Value, Option> {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  options: Option[];
  defaultValue?: Value;
  onChange?: (value: Value | null) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
}

function Autocomplete<
  Value extends string | number,
  Option extends OptionBase<Value>,
>({
  id,
  name,
  label,
  placeholder,
  loading,
  disabled,
  options,
  defaultValue,
  onChange,
  query,
  onQueryChange,
}: IAutocomplete<Value, Option>) {
  const debounced = useDebounceCallback((q: string) => {
    onQueryChange?.(q);
  }, 500);

  return (
    <Field>
      {label && (
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <div className="relative">
        <Combobox<Value>
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
        >
          <ComboboxInput
            id={id}
            name={name}
            autoComplete="off"
            placeholder={placeholder}
            onChange={(event) => debounced(event.target.value)}
            displayValue={(opt?: (typeof options)[number]) => opt?.label || ""}
            className={clsx(
              "relative w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm",
              disabled && "bg-slate-100 text-slate-500",
            )}
          />
          {!disabled && (
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="size-5 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>
          )}

          <ComboboxOptions
            portal={false}
            className={clsx(
              "origin-top border transition duration-200 ease-out empty:invisible data-[closed]:scale-95 data-[closed]:opacity-0",
              "absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm",
            )}
          >
            {loading && (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Buscando...
              </div>
            )}
            {options.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nada encontrado
              </div>
            ) : (
              options.map((opt) => (
                <ComboboxOption
                  key={opt.value}
                  className={({ focus }) =>
                    clsx(
                      focus ? "bg-indigo-600 text-white" : "text-gray-900",
                      "relative cursor-pointer select-none py-2 pl-3 pr-9",
                    )
                  }
                  value={opt.value}
                >
                  {({ selected, focus }) => (
                    <>
                      <div className="flex flex-col">
                        <span
                          className={clsx(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate",
                          )}
                        >
                          {opt.label}
                        </span>
                        <span
                          className={clsx(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate text-gray-500",
                          )}
                        >
                          {opt.description}
                        </span>
                      </div>

                      {selected ? (
                        <span
                          className={clsx(
                            focus ? "text-white" : "text-indigo-600",
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                          )}
                        >
                          <CheckIcon className="size-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    </Field>
  );
}

export default Autocomplete;
