"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CheckCircle, Info, Warning, XCircle, Spinner } from "@phosphor-icons/react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CheckCircle weight="duotone" size={16} color="var(--state-success)" />,
        info: <Info weight="duotone" size={16} color="var(--accent-primary)" />,
        warning: <Warning weight="duotone" size={16} color="var(--state-warning)" />,
        error: <XCircle weight="duotone" size={16} color="var(--state-error)" />,
        loading: <Spinner weight="duotone" size={16} color="var(--text-muted)" className="animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "linear-gradient(160deg, rgba(20,26,50,0.92) 0%, rgba(11,15,30,0.96) 100%)",
          "--normal-border": "rgba(255,255,255,0.14)",
          "--normal-text": "#e8edf5",
          "--success-bg": "linear-gradient(160deg, rgba(18,183,106,0.14) 0%, rgba(20,26,50,0.92) 40%, rgba(11,15,30,0.96) 100%)",
          "--success-border": "rgba(18,183,106,0.32)",
          "--success-text": "#e8edf5",
          "--error-bg": "linear-gradient(160deg, rgba(240,68,56,0.14) 0%, rgba(20,26,50,0.92) 40%, rgba(11,15,30,0.96) 100%)",
          "--error-border": "rgba(240,68,56,0.32)",
          "--error-text": "#e8edf5",
          "--warning-bg": "linear-gradient(160deg, rgba(245,166,35,0.14) 0%, rgba(20,26,50,0.92) 40%, rgba(11,15,30,0.96) 100%)",
          "--warning-border": "rgba(245,166,35,0.32)",
          "--warning-text": "#e8edf5",
          "--border-radius": "12px",
          "--font-family": "var(--font-dm-sans, sans-serif)",
          "--font-size": "13px",
          "--width": "340px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "glass-toast",
          title: "!text-(--text-primary) !font-medium",
          description: "!text-(--text-subtle) !text-xs",
          closeButton: "!border-(--glass-border) !bg-(--glass-bg-raised) !text-(--text-muted) hover:!bg-(--glass-bg-hover) hover:!text-(--text-primary)",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
