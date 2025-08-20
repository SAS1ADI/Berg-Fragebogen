import { useState, useEffect } from "react";

// ---- Helper: Schnittmenge zweier Arrays (ohne Duplikate) ----
function intersect(a = [], b = []) {
  const setB = new Set(b);
  return [...new Set(a)].filter((x) => setB.has(x));
}

// ---- Helper: Empfehlung berechnen (Dauer ist HARTE Bedingung) ----
function recommendPeak(peaks, answers, numQuestions) {
  const allKeys = Object.keys(peaks);

  // 1) Kandidatenbasis: gewählte Dauer (Frage 0). Wenn nicht gewählt, alle Peaks.
  let candidates = answers[0] ? [...answers[0]] : [...allKeys];

  // 2) Weitere Antworten schneiden die Kandidaten ein (INTERSECTION)
  for (let i = 1; i < numQuestions; i++) {
    if (answers[i]) {
      candidates = intersect(candidates, answers[i]);
      if (candidates.length === 0) break; // früh beenden
    }
  }

  // 3) Kein Treffer? Fallback auf die Dauer-Kandidaten (harte Bedingung)
  if (candidates.length === 0) {
    candidates = answers[0] ? [...answers[0]] : [...allKeys];
  }

  // 4) Scoring: zähle Vorkommen NUR innerhalb der aktuellen Kandidaten
  const counts = Object.create(null);
  Object.values(answers).forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((key) => {
      if (candidates.includes(key)) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
  });

  // 5) Bestes Ergebnis wählen (stabile Auswahl: höchster Count, dann alphabetisch)
  let best = candidates[0] || null;
  for (const key of candidates) {
    const ca = counts[best] || 0;
    const cb = counts[key] || 0;
    if (cb > ca || (cb === ca && key.localeCompare(best) < 0)) {
      best = key;
    }
  }

  return best;
}

export default function WanderFragebogen() {
  // --- Vollständige Gipfel-Auswahl im Bezirk Reutte ---
  const peaks = {
    einstein: { name: "Einstein (1866 m)", start: "Tannheim, Tirol", duration: "2-3h" },
    gehrenspitze: { name: "Gehrenspitze (2163 m)", start: "Lechaschau, Tirol", duration: "5-6h" },
    hahnenkamm: { name: "Hahnenkamm (1938 m)", start: "Höfen, Tirol", duration: "3-4h" },
    gimpel: { name: "Gimpel (2176 m)", start: "Nesselwängle, Tirol", duration: "5-6h" },
    krinnenspitze: { name: "Krinnenspitze (2000 m)", start: "Nesselwängle, Tirol", duration: "3-4h" },
    aggenstein: { name: "Aggenstein (1986 m)", start: "Grän, Tirol", duration: "4-5h" },
    neuner: { name: "Neuner (1968 m)", start: "Tannheim, Tirol", duration: "3-4h" },
    rauhhorn: { name: "Rauhhorn (2240 m)", start: "Tannheim, Tirol", duration: "6-7h" },
    alpkopf: { name: "Alpkopf (1802 m)", start: "Bichlbach, Tirol", duration: "2-3h" },
    loreakopf: { name: "Loreakopf (2471 m)", start: "Fernsteinsee, Tirol", duration: "6-7h" },
    hoenig: { name: "Hönig (2034 m)", start: "Weißenbach am Lech, Tirol", duration: "4-5h" },
    gaishorn: { name: "Gaishorn (2247 m)", start: "Tannheim, Tirol", duration: "6-7h" },
    kelenspitze: { name: "Kellenspitze (2238 m)", start: "Nesselwängle, Tirol", duration: "5-6h" },
    litegkopf: { name: "Litnisschrofen (2068 m)", start: "Grän, Tirol", duration: "4-5h" },
    schneidspitze: { name: "Schneidspitze (2006 m)", start: "Höfen, Tirol", duration: "3-4h" },
    pleisspitze: { name: "Pleisspitze (2225 m)", start: "Stanzach, Tirol", duration: "5-6h" },
    kelmerkarspitze: { name: "Kelmer Karspitze (2510 m)", start: "Namlos, Tirol", duration: "7-8h" },
    lichtspitze: { name: "Lichtspitze (2670 m)", start: "Häselgehr, Tirol", duration: "7-8h" },
    thaneller: { name: "Thaneller (2341 m)", start: "Berwang, Tirol", duration: "5-6h" }
  };

  // --- Fragen ---
  const questions = [
    { text: "Wie lange möchtest du wandern?", options: [
        { text: "Kurz (<3h)", peaks: ["einstein", "hahnenkamm", "alpkopf"] },
        { text: "Mittel (3-5h)", peaks: ["krinnenspitze", "aggenstein", "neuner", "schneidspitze", "hoenig"] },
        { text: "Lang (5-7h)", peaks: ["gehrenspitze", "gimpel", "kelenspitze", "pleisspitze", "thaneller"] },
        { text: "Sehr lang (>7h)", peaks: ["rauuhorn", "gaishorn", "loreakopf", "kelmerkarspitze", "lichtspitze"] },
      ]},
    { text: "Möchtest du eine Bergbahn nutzen?", options: [
        { text: "Ja", peaks: ["hahnenkamm", "krinnenspitze", "alpkopf"] },
        { text: "Nein", peaks: Object.keys(peaks) },
      ]},
    { text: "Wie schwierig darf die Tour sein?", options: [
        { text: "Leicht", peaks: ["einstein", "hahnenkamm", "alpkopf"] },
        { text: "Mittel", peaks: ["krinnenspitze", "aggenstein", "neuner", "schneidspitze", "hoenig", "thaneller"] },
        { text: "Anspruchsvoll", peaks: ["gimpel", "gehrenspitze", "rauuhorn", "kelenspitze"] },
      ]},
    { text: "Möchtest du eine Panoramatour?", options: [
        { text: "Ja", peaks: ["gaishorn", "gehrenspitze", "litegkopf", "lichtspitze", "thaneller"] },
        { text: "Nein", peaks: Object.keys(peaks) },
      ]},
    { text: "Bevorzugst du einen Gipfel mit Alm?", options: [
        { text: "Ja", peaks: ["hahnenkamm", "krinnenspitze", "aggenstein"] },
        { text: "Nein", peaks: Object.keys(peaks) },
      ]},
    { text: "Möchtest du einen einsamen Gipfel?", options: [
        { text: "Ja", peaks: ["neuner", "hoenig", "lichtspitze"] },
        { text: "Nein", peaks: Object.keys(peaks) },
      ]},
    { text: "Möchtest du einen Gipfel mit leichter Kletterei?", options: [
        { text: "Ja", peaks: ["aggenstein", "gehrenspitze", "kelenspitze"] },
        { text: "Nein", peaks: Object.keys(peaks) },
      ]},
    { text: "Möchtest du eine Rundtour?", options: [
        { text: "Ja", peaks: ["krinnenspitze", "gehrenspitze", "gaishorn"] },
        { text: "Nein", peaks: Object.keys(peaks) },
      ]},
    { text: "Bevorzugst du Gipfel mit Seen in der Nähe?", options: [
        { text: "Ja", peaks: ["gimpel", "aggenstein", "rauuhorn", "einstein"] },
        { text: "Nein", peaks: Object.keys(peaks) },
      ]},
    { text: "Möchtest du eher sonnige oder schattige Touren?", options: [
        { text: "Sonnig", peaks: ["einstein", "hahnenkamm", "thaneller"] },
        { text: "Schattig", peaks: Object.keys(peaks) },
      ]},
  ];

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleSelect = (qIndex, peakList) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: [...peakList] }));
  };

  useEffect(() => {
    if (Object.keys(answers).length === questions.length) {
      const bestKey = recommendPeak(peaks, answers, questions.length);
      if (bestKey) {
        setResult(peaks[bestKey]);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [answers]);

  return (
<div
  className="p-6 max-w-xl mx-auto space-y-6 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('https://www.tirol.at/images/oqEJOcge2Nw/rs:fill:1180:767/dpr:1.5/cb:/g:ce/aHR0cHM6Ly91cGxvYWRzLm1hcHNlcnZpY2VzLmV1L25lZm9zX3Rpcm9sL3NpdGUtZmlsZXMvMTA1OS91cGxvYWRzL3RoYW5lbGxlcl9hdXNzaWNodF9oZWlfMl8yMDE0MDEwLmpwZw')",
    backgroundPosition: "center center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat"
  }}
>
  <h1 className="text-2xl font-bold text-center bg-white bg-opacity-70 p-2 rounded">
    Wander-Fragebogen
  </h1>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-white bg-opacity-80 rounded-xl shadow p-4 space-y-2">
          <p className="font-semibold">{q.text}</p>
          {q.options.map((opt, oIndex) => (
            <div key={oIndex}>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  onChange={() => handleSelect(qIndex, opt.peaks)}
                  checked={
                    answers[qIndex] &&
                    JSON.stringify(answers[qIndex]) === JSON.stringify(opt.peaks)
                  }
                />
                <span>{opt.text}</span>
              </label>
            </div>
          ))}
        </div>
      ))}

      {result && (
        <div className="bg-green-50 bg-opacity-90 rounded-xl shadow p-4 text-center font-medium">
          Empfohlener Gipfel: {result.name} <br />
          Ausgangspunkt: {result.start} <br />
          Gehzeit: {result.duration}
        </div>
      )}
    </div>
  );
}
