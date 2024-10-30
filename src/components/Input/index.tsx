import React, { forwardRef } from "react";

import clsx from "clsx";

export type InputProps = {
  label: string;
  touched?: boolean;
  error?: string;
} & React.ComponentPropsWithoutRef<"input">;

const Input: React.ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { label, touched, error, type = "text", ...rest },
  ref
) => {
  const hasError = Boolean(touched && error);

  return (
    <div className={clsx("relative transition-all", hasError && "mb-4")}>
      <label
        htmlFor={rest.name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        type={type}
        className={clsx(
          "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
          "disabled:bg-slate-100 disabled:text-slate-500",
          hasError && "border-red-600 bg-red-50"
        )}
        ref={ref}
        {...rest}
      />
      {hasError && (
        <p
          className="absolute left-2 -bottom-6 text-sm text-red-600"
          id="email-error"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default forwardRef(Input);
