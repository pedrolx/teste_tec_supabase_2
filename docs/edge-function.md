# Função Edge para Gerar Planos de Aula com Gemini AI

Esta é uma função Edge desenvolvida em Deno para integração com a API do Google Gemini e geração de planos de aula automatizados.

## 🔧 Código da Função

```javascript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subject, grade, topic, duration, objective, class_profile } = await req.json();

    // Validação dos campos obrigatórios
    if (!subject || !grade || !topic || !duration) {
      return new Response(
        JSON.stringify({
          error: 'Campos obrigatórios faltando: subject, grade, topic, duration'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Configuração da API Gemini
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    console.log('Chave Gemini carregada');

    // Prompt para a IA
    const prompt = `
Gere um plano de aula completo em PORTUGUÊS com a seguinte estrutura JSON:

{
  "introducao_ludica": "Introdução criativa e engajadora sobre o tema",
  "objetivo_bncc": "Objetivo de aprendizagem alinhado à BNCC",
  "passo_a_passo": ["passo 1 detalhado", "passo 2 detalhado", "passo 3 detalhado", "passo 4 detalhado", "passo 5 detalhado"],
  "rubrica_avaliacao": "Critérios claros para avaliar o aprendizado"
}

CONTEXTO:
- Matéria: ${subject}
- Série/Ano: ${grade}
- Tema: ${topic}
- Duração: ${duration} minutos
- Objetivo específico: ${objective || 'Não especificado'}
- Perfil dos alunos: ${class_profile || 'Turma regular'}

DIRETRIZES:
- A introdução deve ser lúdica e engajadora
- O objetivo deve estar alinhado com a BNCC
- O passo a passo deve ser prático e executável
- A rubrica deve ter critérios mensuráveis

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional ou markdown.
`;

    // Chamada para a API Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Chamando Gemini 2.0 Flash Lite...');
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 40
        }
      })
    });

    console.log('Status Gemini:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Erro Gemini:', errorText);
      throw new Error(`Erro Gemini: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Resposta Gemini recebida');

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log('Texto gerado:', generatedText);

    // Processamento e extração do JSON
    let jsonString = generatedText.trim();
    
    // Remove possíveis markdown code blocks
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Encontra o primeiro { e o último }
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      console.error('JSON não encontrado. Texto completo:', generatedText);
      throw new Error('Não foi possível extrair JSON da resposta da IA');
    }

    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    const lessonPlan = JSON.parse(jsonString);
    
    console.log('Plano parseado com sucesso:', lessonPlan);

    // Retorno de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        lesson_plan: lessonPlan
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Erro na function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
```
