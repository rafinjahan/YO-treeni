import OpenAI from "openai";

// Uses generic env parameters allowing user to map to custom open source endpoints!
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

console.log("OpenAI Instantiated:");
console.log("- Base URL:", process.env.OPENAI_BASE_URL);
console.log("- API Key Exists:", !!process.env.OPENAI_API_KEY);

/**
 * Executes a strict Finnish high school LLM grading pass
 */
export async function generateFeedback({ question, studentAnswer, modelAnswer, maxPoints, subject }) {
  console.log("Starting grading request via generic endpoint...");
  
  const systemPrompt = `Olet tiukka ja asiantunteva suomalainen lukion aineenopettaja.
Tehtäväsi on tarkastaa ylioppilaskokeen kaltainen tehtävä.
Sinulle annetaan:
1. Alkuperäinen kysymys
2. Oppilaan vastaus (joka saattaa sisältää LaTeX-koodia tai Mathquill HTML -merkintöjä)
3. Maksimipisteet (esim. 6)
4. Mahdollinen mallivastaus

Ohjeistus:
- Analysoi oppilaan ratkaisun looginen eteneminen askel askeleelta.
- Vertaa ratkaisua mallivastaukseen.
- Anna loppupisteet kokonaislukuina 0 - ${maxPoints} väliltä.
- Pisteiden on oltava realistiset ja virheistä (kuten laskuvirheistä tai loogisista hypyistä) on rokotettava ankarasti.
- Anna palaute ja ohjeet rakentavalla ja kannustavalla, mutta selkeällä suomen kielellä.

VASTAUKSEN MUOTO:
Palauta vastaus AINOASTAAN JSON-muodossa ilman markdown -tägejä. JSON-rakenteen TÄYTYY sisältää seuraavat kentät:
{
  "score": (int),
  "summary": "Lyhyt ja ytimekäs tiivistelmä vastauksen tasosta suomeksi.",
  "correct": ["oikea vaihe 1", "oikea vaihe 2"],
  "errors": ["virhe tai puute 1", "virhe tai puute 2"],
  "hint": "Yksi kannustava vinkki miten asia kannattaisi jatkossa ratkaista tai kerrata."
}
VAIN JSON ON SALLITTU. Älä kirjoita tekstiä ennen tai jälkeen.`;

  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Aine: ${subject}\nMaksimipisteet: ${maxPoints}\nKysymys: ${question}\nMallivastaus: ${modelAnswer}\n\nOppilaan vastaus:\n${studentAnswer}` }
        ],
        temperature: 0.2
      });

      if (!response.choices || response.choices.length === 0) {
         throw new Error("OpenRouter palautti tyhjän vastauksen ilman valintoja (choices).");
      }

      let rawContent = response.choices[0].message.content;
      
      // Generic OSS LLMs frequently ignore JSON constraints and wrap responses in markdown
      rawContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
      
      const parsedData = JSON.parse(rawContent);

      return {
        score: typeof parsedData.score === 'number' ? Math.min(parsedData.score, maxPoints) : 0,
        summary: parsedData.summary || "Palautteen luonti epäonnistui.",
        correct: Array.isArray(parsedData.correct) ? parsedData.correct : [],
        errors: Array.isArray(parsedData.errors) ? parsedData.errors : [],
        hint: parsedData.hint || "Palaute puuttuu."
      };

    } catch (err) {
      console.error(`LLM Grading Attempt ${attempt} Failed:`, err.message);
      lastError = err;
      // Odota hetki ennen uutta yritystä (esim. rate limitin takia)
      if (attempt < MAX_RETRIES) {
         await new Promise(res => setTimeout(res, 1500 * attempt));
      }
    }
  }

  console.error("============== LLM GRADING ERROR ==============");
  console.error(lastError);
  console.error("===============================================");
  
  return {
    score: 0,
    summary: "Tekoälyarviointi ei ole juuri nyt saatavilla väliaikaisen palvelinvirheen vuoksi.",
    correct: [],
    errors: ["Palvelinvirhe tai ruuhka ilmaisessa rajapinnassa."],
    hint: "Kokeile palauttaa koe uudelleen hetken kuluttua."
  };
}
