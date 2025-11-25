import React from "react";


export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            {children}
        </label>
    );
}

export function TextInput(
    props: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }
) {
    const { className = "", icon, ...rest } = props;
    return (
        <div className="relative">
            {icon && (
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {icon}
                </span>
            )}
            <input
                {...rest}
                className={
                    "w-full rounded-xl border border-gray-300 bg-white/60 px-4 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-100 " +
                    (icon ? "pl-10 " : "") +
                    className
                }
            />
        </div>
    );
}


export function PrimaryButton(
    props: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
) {
    const { className = "", loading, children, ...rest } = props;
    return (
        <button
            {...rest}
            className={
                "inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600 " +
                className
            }
        >
            {loading && (
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}


export function Alert({ type = "error", children }: { type?: "error" | "success"; children: React.ReactNode }) {
    const styles =
        type === "error"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200";
    return <div className={"mt-4 rounded-xl border px-4 py-3 text-sm " + styles}>{children}</div>;
}