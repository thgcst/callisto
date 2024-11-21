import {
  Checkbox as HLCheckbox,
  CheckboxProps as HLCheckboxProps,
  Description,
  Field,
  Label,
} from "@headlessui/react";

type CheckboxProps = HLCheckboxProps & {
  label?: string;
  description?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  ...props
}) => {
  return (
    <Field>
      <Label>{label}</Label>
      <Description>{description}</Description>
      <HLCheckbox
        checked={false}
        {...props}
        className="group block size-4 rounded border bg-white data-[checked]:bg-blue-500 data-[indeterminate]:bg-blue-500 data-[disabled]:opacity-70"
      >
        {({ indeterminate }) => (
          <svg
            className="stroke-white opacity-0 transition group-data-[checked]:opacity-100 group-data-[indeterminate]:opacity-100"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d={indeterminate ? "M3 7L11 7" : "M3 8L6 11L11 3.5"}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </HLCheckbox>
    </Field>
  );
};
export default Checkbox;
