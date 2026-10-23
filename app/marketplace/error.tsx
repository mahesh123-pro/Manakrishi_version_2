"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mk-container">
      <h2 className="font-heading text-2xl">
        Marketplace unavailable / మార్కెట్ అందుబాటులో లేదు
      </h2>
      <button onClick={reset} className="mk-btn mt-5">
        Try again / మళ్లీ ప్రయత్నించు
      </button>
    </div>
  );
}
