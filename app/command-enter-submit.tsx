"use client";

import { useEffect } from "react";

const textInputTypes = new Set([
  "",
  "email",
  "number",
  "password",
  "search",
  "tel",
  "text",
  "url",
]);

function isTextEntryElement(
  target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement {
  if (target instanceof HTMLTextAreaElement) {
    return !target.disabled && !target.readOnly;
  }

  return (
    target instanceof HTMLInputElement &&
    !target.disabled &&
    !target.readOnly &&
    textInputTypes.has(target.type)
  );
}

export function CommandEnterSubmit() {
  useEffect(() => {
    function submitFocusedForm(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        !event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.isComposing ||
        !isTextEntryElement(event.target)
      ) {
        return;
      }

      const form = event.target.form;

      if (!form) {
        return;
      }

      event.preventDefault();
      form.requestSubmit();
    }

    document.addEventListener("keydown", submitFocusedForm);

    return () => {
      document.removeEventListener("keydown", submitFocusedForm);
    };
  }, []);

  return null;
}
