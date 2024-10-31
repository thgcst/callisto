import React, { forwardRef } from "react";

import clsx from "clsx";

export type SelectProps = {
  label: string;
  touched?: boolean;
  error?: string;
} & React.ComponentPropsWithoutRef<"select">;

const Select: React.ForwardRefRenderFunction<HTMLSelectElement, SelectProps> = (
  { label, touched, error, children, ...rest },
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
      <select
        className={clsx(
          "mt-1 block w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:cursor-default disabled:bg-slate-100 disabled:bg-none disabled:text-slate-500 disabled:opacity-100 sm:text-sm",
          hasError && "border-red-600 bg-red-50"
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </select>
      {hasError && (
        <p
          className="absolute -bottom-6 left-2 text-sm text-red-600"
          id="email-error"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default forwardRef(Select);
