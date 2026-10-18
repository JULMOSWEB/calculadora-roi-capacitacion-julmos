
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método no permitido.'
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'No está configurada la clave de OpenAI.'
    });
  }

  const x = req.body || {};

  const validos = [x.inversion, x.beneficio, x.roi, x.participantes]
    .every(v => typeof v === 'number' && Number.isFinite(v));

  if (
    !['individual', 'anual'].includes(x.modo) ||
    !validos ||
    x.inversion <= 0 ||
    x.inversion > 1e15 ||
    x.beneficio < 0 ||
    x.beneficio > 1e15 ||
    x.participantes < 0 ||
    x.participantes > 1e9
  ) {
    return res.status(400).json({
      error: 'Datos inválidos para el análisis.'
    });
  }

  const input = {
    modalidad: x.modo,
    pais: String(x.pais || '').slice(0, 60),
    moneda: String(x.moneda || '').slice(0, 4),
    tipo: x.modo === 'individual'
      ? String(x.tipo || '').slice(0, 60)
      : undefined,
    numeroCapacitaciones: x.modo === 'anual'
      ? x.capacitaciones
      : undefined,
    participantes: x.participantes,
    inversion: x.inversion,
    beneficioEstimado: x.beneficio,
    beneficioNeto: x.beneficioNeto,
    roiPorcentaje: x.roi
  };

  try {
    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          max_output_tokens: 550,
          instructions:
            'Eres consultor senior de gestión humana de Julmos Consultores. ' +
            'Responde en español neutro, breve, útil y directo, con 3 recomendaciones ' +
            'concretas para potenciar y medir el retorno de la capacitación. ' +
            'Diferencia estimaciones de resultados comprobados. ' +
            'No inventes causalidad, métricas ni benchmarks. ' +
            'Si se trata de un plan anual, recomienda evitar doble contabilización ' +
            'de beneficios y distinguir participaciones de personas únicas.',
          input: JSON.stringify(input)
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', {
        status: response.status,
        code: data.error?.code,
        type: data.error?.type
      });

      throw new Error('Error de servicio de IA');
    }

    const analysis = (data.output || [])
      .flatMap(item =>
        (item.content || [])
          .filter(content => content.type === 'output_text')
          .map(content => content.text)
      )
      .join('\n')
      .trim();

    if (!analysis) {
      throw new Error('Respuesta vacía de OpenAI');
    }

    return res.status(200).json({
      analisis: analysis
    });

  } catch (e) {
    console.error('Error al generar análisis:', e.message);

    return res.status(502).json({
      error: 'No fue posible generar el análisis con IA. Inténtalo nuevamente más tarde.'
    });
  }
};
