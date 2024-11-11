import { Fragment } from "react";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export type SelectProps = {
  label?: string;
  touched?: boolean;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  onChange: (value: string[]) => void;
  value: string[];
  disabled?: boolean;
  placeholder?: string;
};

const MultipleSelect: React.FC<SelectProps> = ({
  label,
  options,
  onChange,
  value,
  disabled,
  placeholder,
}) => {
  function getLabelFromValue(value: string) {
    return options.find((option) => option.value === value)?.label;
  }
  return (
    <Listbox value={value} onChange={onChange} multiple disabled={disabled}>
      {({ open }) => (
        <>
          {label && (
            <Listbox.Label className="mb-1 block text-sm font-medium text-gray-700">
              {label}
            </Listbox.Label>
          )}
          <div className="group relative">
            <Listbox.Button
              className={clsx(
                "relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm",
                "disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-500",
              )}
            >
              <span className="flex h-5 items-center truncate">
                {value.length
                  ? value.map((v) => getLabelFromValue(v)).join(", ")
                  : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="size-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            {disabled && (
              <div
                className={clsx(
                  "flex flex-col gap-2",
                  "rounded-md border border-gray-200 bg-slate-50/90 px-3 py-2 text-base shadow backdrop-blur-sm sm:text-sm",
                  "invisible absolute z-10 mt-1 transition-all group-hover:visible",
                )}
              >
                {value.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            )}

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      clsx(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "group relative cursor-pointer select-none overflow-hidden py-2 pl-3 pr-9",
                      )
                    }
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {({ selected, active, disabled }) => (
                      <>
                        <div
                          className={clsx(
                            "flex items-center",
                            disabled && "opacity-50",
                          )}
                        >
                          {disabled && (
                            <span className="mr-2">
                              <LockClosedIcon className="size-3" />
                            </span>
                          )}
                          <span
                            className={clsx(
                              selected ? "font-semibold" : "font-normal",
                              "block truncate",
                              disabled &&
                                "transition-all group-hover:-translate-y-full group-hover:opacity-0",
                            )}
                          >
                            {option.label}
                          </span>
                          {disabled && (
                            <span
                              className={clsx(
                                "absolute",
                                disabled &&
                                  "translate-y-full pl-5 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100",
                              )}
                            >
                              Sem permissão
                            </span>
                          )}
                        </div>

                        {selected ? (
                          <span
                            className={clsx(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                            )}
                          >
                            <CheckIcon className="size-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
                {options.length === 0 && (
                  <div className="p-2 px-3 text-gray-500">
                    Nenhuma opção disponível
                  </div>
                )}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default MultipleSelect;
