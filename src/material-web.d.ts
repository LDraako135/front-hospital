// src/material-web.d.ts
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "md-outlined-text-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        label?: string;
        value?: string;
        type?: string;
        placeholder?: string;
      };

      "md-filled-button": React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      > & {
        disabled?: boolean;
      };

      "md-navigation-bar": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;

      "md-navigation-tab": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        label?: string;
        active?: boolean;
      };
    }
  }
}

export {};
