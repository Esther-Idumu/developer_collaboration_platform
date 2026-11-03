import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

const FOCUSABLE =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Modal({ title, onClose, isBusy = false, size = "md", children }) {
    const dialogRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const isBusyRef = useRef(isBusy);
    const titleId = useId();

    useEffect(() => {
        onCloseRef.current = onClose;
        isBusyRef.current = isBusy;
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        (dialog.querySelector("[data-autofocus]") ?? dialog.querySelector(FOCUSABLE))?.focus();

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                if (!isBusyRef.current) {
                    onCloseRef.current();
                }
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const items = [...dialog.querySelectorAll(FOCUSABLE)];

            if (items.length === 0) {
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, []);

    // "lg" has no built-in header: the content brings its own header and close button.
    const isLarge = size === "lg";

    return createPortal(
        <div className="modal-backdrop">
            <div
                className={isLarge ? "modal modal-lg" : "modal"}
                role="dialog"
                aria-modal="true"
                aria-labelledby={isLarge ? undefined : titleId}
                aria-label={isLarge ? title : undefined}
                ref={dialogRef}
            >
                {!isLarge && (
                    <header className="modal-header">
                        <h2 className="modal-title" id={titleId}>{title}</h2>

                        <button type="button" className="modal-close" aria-label="Close" disabled={isBusy} onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </header>
                )}

                {children}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
