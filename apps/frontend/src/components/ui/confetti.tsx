"use client";

import type { ReactNode } from "react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import confetti from "canvas-confetti";

type ConfettiOptions = NonNullable<Parameters<typeof confetti>[0]>;
type ConfettiInstance = ReturnType<typeof confetti.create>;

export type ConfettiRef = {
  fire: (options?: ConfettiOptions) => Promise<void | null>;
} | null;

export type ConfettiProps = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions;
  globalOptions?: { resize?: boolean; useWorker?: boolean };
  /** Se true, não dispara automaticamente no mount (use ref.fire() para disparar) */
  manualstart?: boolean;
  children?: ReactNode;
};

const ConfettiComponent = forwardRef<ConfettiRef, ConfettiProps>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: false },
    manualstart = false,
    children,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);

  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, {
        ...globalOptions,
        resize: true,
      });
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, []);

  const fire = useCallback(
    async (opts: ConfettiOptions = {}) => {
      try {
        await instanceRef.current?.({ ...options, ...opts });
      } catch (error) {
        console.error("Confetti error:", error);
      }
    },
    [options]
  );

  const api = useMemo(() => ({ fire }), [fire]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) {
      void fire();
    }
  }, [manualstart, fire]);

  return (
    <>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </>
  );
});

ConfettiComponent.displayName = "Confetti";

export const Confetti = ConfettiComponent;
