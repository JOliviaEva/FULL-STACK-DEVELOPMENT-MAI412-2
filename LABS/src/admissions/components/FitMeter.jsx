export default function FitMeter({ score, caption }) {
  const tone = score >= 70 ? "var(--green)" : score >= 55 ? "var(--amber)" : "var(--red)";
  return (
    <div className="uai-fit" style={{ "--c": tone }} title={`AI fit score ${score} / 99`}>
      <span className="uai-fit-num">{score}</span>
      <span className="uai-fit-body">
        <span className="uai-fit-bar">
          <i style={{ width: `${score}%` }} />
        </span>
        {caption && <span className="uai-fit-caption">{caption}</span>}
      </span>
    </div>
  );
}
