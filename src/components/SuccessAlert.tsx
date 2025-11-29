"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessAlert() {
    const params = useSearchParams();
    const success = params.get("success");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (success === "1") {
            setOpen(true);
            const t = setTimeout(() => {
            setOpen(false);
            window.location.href = "/rec/anime";
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [success]);

    if (!open) return null;

    return (
        <>
            <div
                className="sa-overlay"
                onClick={() => setOpen(false)}
                aria-hidden="true"
            >
                <div
                    className="sa-modal"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="success-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="sa-close"
                        onClick={() => setOpen(false)}
                        aria-label="Tutup"
                    >
                        ✕
                    </button>

                    <div className="sa-icon" aria-hidden="true">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>

                    <h2 id="success-title" className="sa-title">Berhasil</h2>
                    <p className="sa-message">Data berhasil disimpan!</p>

                    <div className="sa-actions">
                        <button className="sa-btn" onClick={() => setOpen(false)}>
                            Tutup
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .sa-overlay {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background: radial-gradient(1200px 500px at 50% 0%, rgba(34, 197, 94, 0.08), transparent),
                        rgba(17, 24, 39, 0.45);
                    backdrop-filter: blur(2px);
                    z-index: 9999;
                    animation: sa-fade-in 180ms ease-out forwards;
                }

                .sa-modal {
                    position: relative;
                    width: 100%;
                    max-width: 420px;
                    background: #ffffff;
                    border-radius: 14px;
                    padding: 20px 22px 22px;
                    box-shadow:
                        0 10px 25px rgba(0, 0, 0, 0.15),
                        0 2px 8px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e6f4ea;
                    animation: sa-pop 220ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                .sa-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 18px;
                    line-height: 1;
                    border-radius: 8px;
                    padding: 6px;
                    transition: color 120ms ease, background-color 120ms ease, transform 60ms ease;
                }
                .sa-close:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }
                .sa-close:active {
                    transform: scale(0.96);
                }
                .sa-close:focus-visible {
                    outline: 2px solid #22c55e;
                    outline-offset: 2px;
                }

                .sa-icon {
                    width: 56px;
                    height: 56px;
                    margin: 6px auto 8px;
                    border-radius: 9999px;
                    color: #ffffff;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    display: grid;
                    place-items: center;
                    box-shadow:
                        inset 0 -2px 6px rgba(0, 0, 0, 0.12),
                        0 6px 14px rgba(34, 197, 94, 0.35);
                }

                .sa-title {
                    margin: 8px 0 0;
                    text-align: center;
                    font-size: 18px;
                    line-height: 1.2;
                    color: #166534;
                    letter-spacing: 0.2px;
                }

                .sa-message {
                    margin: 6px 8px 0;
                    text-align: center;
                    color: #475569;
                    font-size: 14px;
                }

                .sa-actions {
                    margin-top: 14px;
                    display: flex;
                    justify-content: center;
                }

                .sa-btn {
                    border: none;
                    background: linear-gradient(135deg, #16a34a, #22c55e);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow:
                        0 6px 14px rgba(34, 197, 94, 0.35),
                        0 2px 6px rgba(0, 0, 0, 0.06);
                    transition: transform 100ms ease, filter 120ms ease, box-shadow 120ms ease;
                }
                .sa-btn:hover {
                    filter: brightness(1.02);
                    box-shadow:
                        0 8px 18px rgba(34, 197, 94, 0.42),
                        0 3px 8px rgba(0, 0, 0, 0.08);
                }
                .sa-btn:active {
                    transform: translateY(1px) scale(0.99);
                }
                .sa-btn:focus-visible {
                    outline: 2px solid #16a34a;
                    outline-offset: 3px;
                }

                @keyframes sa-fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes sa-pop {
                    from {
                        opacity: 0;
                        transform: translateY(8px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @media (prefers-color-scheme: dark) {
                    .sa-modal {
                        background: #0b1220;
                        border-color: #143324;
                        box-shadow:
                            0 10px 25px rgba(0, 0, 0, 0.4),
                            0 2px 8px rgba(0, 0, 0, 0.3);
                    }
                    .sa-title {
                        color: #86efac;
                    }
                    .sa-message {
                        color: #cbd5e1;
                    }
                    .sa-close:hover {
                        background: rgba(148, 163, 184, 0.15);
                        color: #e2e8f0;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .sa-overlay,
                    .sa-modal {
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}
