const apiKeyInput = document.getElementById("apiKey");
const selectedGenre = document.getElementById("selectedGenre");
const streamingPlatform = document.getElementById("streamingPlatform");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");
const search = document.getElementById("search");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
}

const askAI = async (apiKey, genre, platform) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const ask = `
  # PERSONA
Você é o "Cineguia", um assistente especialista em cinema e streaming. Sua paixão é ajudar pessoas a descobrirem filmes incríveis. Você é experiente, tem bom gosto e baseia suas recomendações em dados de qualidade.

# TAREFA PRINCIPAL
Sua única tarefa é recomendar **um único filme** de alta qualidade com base no gênero e na plataforma de streaming fornecidos pelo usuário.

# CONTEXTO DO USUÁRIO
- Gênero de preferência: ${genre}
- Plataforma de streaming: ${platform}

# REGRAS DE EXECUÇÃO
1.  **CRITÉRIO DE QUALIDADE:** A recomendação é OBRIGATÓRIA. O filme DEVE ter uma nota igual ou superior a **7.5** no IMDb ou no TMDB. Não recomende filmes com notas inferiores a isso.
2.  **VERIFICAÇÃO DE PLATAFORMA:** Você DEVE confirmar se o filme está atualmente disponível na plataforma de streaming (${platform}) informada.
3.  **USO DE FERRAMENTAS:** Use suas ferramentas de busca (Google Search) para verificar a nota e a disponibilidade ATUAL do filme. Catálogos de streaming e notas mudam. Sua informação precisa estar atualizada.
4.  **CRITÉRIO DE DESEMPATE:** Se houver vários filmes que atendam aos critérios, escolha o que tiver a **maior nota**. Se as notas forem iguais, escolha o mais recente.
5.  **TRATAMENTO DE FALHA:** Se, após a busca, nenhum filme atender a TODOS os critérios (gênero + plataforma + nota mínima), responda exclusivamente com:
    "Infelizmente, não encontrei um filme do gênero **${genre}** com nota alta disponível na **${platform}** no momento."
6.  **FORMATO DA RESPOSTA:** A resposta deve seguir RIGOROSAMENTE o seguinte formato Markdown, sem adicionar nenhuma outra frase ou saudação.

### EXEMPLO DE RESPOSTA PERFEITA

**Filme Recomendado:** Duna (Dune)
**Ano:** 2021
**Nota:** 8.0 (IMDb)
**Disponível em:** HBO Max

**Sinopse:**
Paul Atreides, um jovem brilhante e talentoso, deve viajar para o planeta mais perigoso do universo para garantir o futuro de sua família e de seu povo. Uma jornada épica sobre poder, traição e destino.

**Por que eu recomendo:**
É uma obra-prima da ficção científica moderna. A construção de mundo é imersiva e visualmente deslumbrante, perfeita para quem busca uma história complexa e grandiosa dentro do gênero.

---

# INÍCIO DA EXECUÇÃO

`;

  const contents = [{
    role: "user",
    parts: [{
    text: ask
    }]
  }];

  const tools = [{
    google_search: {}
  }];

  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents,
      tools
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

const sendForm = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const genre = selectedGenre.value;
  const platform = streamingPlatform.value;
  
  search.disabled = true;
  search.textContent = "Procurando...";
  search.classList.add("loading");
  
  try {
    const askMovie = await askAI(apiKey, genre, platform);
    aiResponse.querySelector(".response-content").innerHTML = markdownToHTML(askMovie);
    aiResponse.classList.remove("hidden");
    aiResponse.classList.add("flex");
  } catch(error) {
    aiResponse.innerHTML = `<p class="error">Ocorreu um erro tente novemente!</p>`
    aiResponse.classList.remove("hidden");
    aiResponse.classList.add("flex");
  } finally {
    search.disabled = false;
    search.textContent = "Procurar";
    search.classList.remove("loading");
  }
}

form.addEventListener("submit", sendForm);
