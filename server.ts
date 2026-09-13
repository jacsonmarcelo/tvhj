import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no ambiente.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();

  // Aumentar o limite para aceitar uploads em base64 de imagens
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // API para extrair e estruturar a programação a partir das fotos das tabelas
  app.post('/api/extract-schedule', async (req, res) => {
    try {
      const { images, dateTitle } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem foi fornecida.' });
      }

      const ai = getGeminiClient();

      const imageParts = images.map((img: { data: string; mimeType?: string }) => {
        // Remove cabeçalho base64 caso venha incluído
        const cleanBase64 = img.data.replace(/^data:image\/[a-zA-Z0-9.-]+;base64,/, '');
        return {
          inlineData: {
            mimeType: img.mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        };
      });

      const promptText = `
Você é um especialista em OCR e dados esportivos da televisão brasileira.
Analise com extrema precisão estas fotos das tabelas de programação esportiva na TV (formato clássico @esportesnatv com horários, competições, jogos e canais de TV/streaming).

Extraia TODAS as linhas de programação esportiva visíveis em ordem cronológica de horário.
Para cada evento esportivo identificado na tabela, produza o objeto com:
- time: Horário no formato "HHhMM" (ex: "01h00", "08h30", "11h00", "16h00", "21h20").
- leagueOrSport: Nome da competição, torneio ou esporte indicado (ex: "Brasileirão", "Premier League", "Fórmula 1", "NFL", "Superliga Vôlei", "US Open").
- category: Escolha a categoria exata entre:
  "futebol", "futebol-fem", "automobilismo", "nfl", "volei", "basquete", "tenis", "tenis-mesa", "futsal", "lutas", "outros"
- matchTitle: Título do confronto ou evento (ex: "Flamengo x Corinthians", "SF - H. Calderano x Kallberg", "GP de San Marino - corrida", "Zverev x Shelton").
- team1: (Opcional) Primeiro time/atleta.
- team2: (Opcional) Segundo time/atleta.
- stage: (Opcional) Fase (ex: "Final", "Semifinal", "Rodada 24", "Treino Livre").
- channels: Lista com os canais ou serviços de streaming de transmissão (ex: ["GLOBO", "PREMIERE"], ["ESPN", "DISNEY+"], ["youtube CazéTV"], ["BANDSPORTS", "BAND"]).
- highlight: Booleano true se na tabela a linha possuir destaque visual, tarja de cor chamativa (amarela, rosa, azul, etc) ou se for um grande clássico/final.
- highlightType: Se highlight for true, tente classificar a cor ("yellow", "pink", "blue", "green", "orange").
- highlightBadge: Se for destaque, insira um rótulo curto como "Final", "Clássico", "Destaque Brasil", "Superclássico".
- scoreOrContext: (Opcional) Placar, agregado ou observação (ex: "(2x0)", "(Ida: 1x0)", "(ao vivo)").
- period: Período do dia correspondente ao horário:
  - "madrugada" (00h00 às 05h59)
  - "manha" (06h00 às 11h59)
  - "tarde" (12h00 às 17h59)
  - "noite" (18h00 às 23h59)

Seja minucioso para não deixar nenhum horário ou canal de fora.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...imageParts,
          { text: promptText },
        ],
        config: {
          systemInstruction: 'Você extrai rigorosamente os dados esportivos tabelados de imagens para JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dateFound: {
                type: Type.STRING,
                description: 'Data ou dia da semana encontrado no cabeçalho das imagens (ex: "Domingo, 13 de Setembro de 2026").',
              },
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    leagueOrSport: { type: Type.STRING },
                    category: { type: Type.STRING },
                    matchTitle: { type: Type.STRING },
                    team1: { type: Type.STRING },
                    team2: { type: Type.STRING },
                    stage: { type: Type.STRING },
                    channels: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    highlight: { type: Type.BOOLEAN },
                    highlightType: { type: Type.STRING },
                    highlightBadge: { type: Type.STRING },
                    scoreOrContext: { type: Type.STRING },
                    period: { type: Type.STRING },
                  },
                  required: ['time', 'leagueOrSport', 'category', 'matchTitle', 'channels', 'period'],
                },
              },
            },
            required: ['matches'],
          },
        },
      });

      const jsonText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(jsonText);

      // Normaliza dados para o padrão do app
      const rawMatches = parsedData.matches || [];
      const normalizedMatches = rawMatches.map((m: any, idx: number) => {
        const timeStr = m.time || '12h00';
        const parts = timeStr.toLowerCase().replace('h', ':').split(':');
        const h = parseInt(parts[0] || '0', 10);
        const min = parseInt(parts[1] || '0', 10);
        const timeMinutes = h * 60 + min;

        let period = m.period;
        if (!['madrugada', 'manha', 'tarde', 'noite'].includes(period)) {
          if (timeMinutes < 360) period = 'madrugada';
          else if (timeMinutes < 720) period = 'manha';
          else if (timeMinutes < 1080) period = 'tarde';
          else period = 'noite';
        }

        return {
          id: `evt-custom-${Date.now()}-${idx + 1}`,
          time: timeStr,
          timeMinutes: isNaN(timeMinutes) ? 720 : timeMinutes,
          leagueOrSport: m.leagueOrSport || 'Competição Esportiva',
          category: m.category || 'outros',
          matchTitle: m.matchTitle || 'Confronto',
          team1: m.team1,
          team2: m.team2,
          stage: m.stage,
          channels: Array.isArray(m.channels) && m.channels.length > 0 ? m.channels : ['A definir'],
          highlight: !!m.highlight,
          highlightType: m.highlightType || (m.highlight ? 'yellow' : undefined),
          highlightBadge: m.highlightBadge,
          scoreOrContext: m.scoreOrContext,
          period,
        };
      });

      // Ordenar cronologicamente
      normalizedMatches.sort((a: any, b: any) => a.timeMinutes - b.timeMinutes);

      res.json({
        success: true,
        dateFound: parsedData.dateFound || dateTitle || 'Programação Atualizada',
        totalMatches: normalizedMatches.length,
        matches: normalizedMatches,
      });
    } catch (err: any) {
      console.error('Erro no processamento OCR com Gemini:', err);
      res.status(500).json({
        error: err.message || 'Falha ao processar imagens e extrair programação.',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
