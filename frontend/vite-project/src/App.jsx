import { useState } from 'react'
import { supabase } from "./lib/supabaseClient"
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    duration: 60,
    learning_objective: '',
    student_profile: ''
  })
  const [loading, setLoading] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Enviando dados:', formData)

      const response = await fetch(
        'https://oypnvszoboacltjwhqsx.supabase.co/functions/v1/generate_lesson_plan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(formData)
        }
      )

      console.log('Status da resposta:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro HTTP:', response.status, errorText)
        throw new Error(`Erro do servidor: ${response.status}`)
      }

      const result = await response.json()
      console.log('Resposta completa:', result)

      if (!result.success) {
        throw new Error(result.error || 'Erro ao gerar plano de aula')
      }

      setGeneratedPlan(result.lesson_plan)

      // Salvar no Supabase
      try {
        const { data, error } = await supabase
          .from('lesson_plans')
          .insert([
            {
              subject: formData.subject,
              grade: formData.grade,
              topic: formData.topic,
              duration: formData.duration,
              learning_objective: formData.learning_objective || null,
              student_profile: formData.student_profile || null,
              generated_content: result.lesson_plan
            }
          ])
          .select()

        if (error) {
          console.warn('Aviso: Plano não salvo no banco:', error.message)
        } else {
          console.log('Plano salvo no Supabase:', data)
        }
      } catch (saveError) {
        console.warn('Aviso: Erro ao salvar no banco:', saveError.message)
      }

    } catch (error) {
      console.error('Erro completo:', error)
      alert('Erro ao gerar plano: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">

      {/* Header */}

      <div className="text-center mb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-4">
            Gerador de Planos de Aula
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
            Crie planos de aula personalizados e alinhados à BNCC com Inteligência Artificial
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">

        {/* Form Section */}

        <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">Informações da Aula</h2>
            <p className="text-secondary-600">Preencha os dados abaixo para gerar seu plano de aula</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

              {/* Matéria */}

              <div className="space-y-3">
                <label className="block text-base font-semibold text-secondary-700">
                  Matéria *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none placeholder-secondary-400"
                  placeholder="Ex: Matemática, Português"
                />
              </div>

              {/* Ano/Série */}

              <div className="space-y-3">
                <label className="block text-base font-semibold text-secondary-700">
                  Ano/Série *
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none placeholder-secondary-400"
                  placeholder="Ex: 5º ano, 1º ano EM"
                />
              </div>

              {/* Tema */}

              <div className="md:col-span-2 space-y-3">
                <label className="block text-base font-semibold text-secondary-700">
                  Tema da Aula *
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none placeholder-secondary-400"
                  placeholder="Ex: Frações, Substantivos, Sistema Solar"
                />
              </div>

              {/* Duração */}

              <div className="space-y-3">
                <label className="block text-base font-semibold text-secondary-700">
                  Duração (minutos) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="15"
                  max="240"
                  className="w-full px-4 py-3 text-base border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none"
                />
              </div>

              {/* Objetivo de Aprendizagem */}

              <div className="md:col-span-2 space-y-3">
                <label className="block text-base font-semibold text-secondary-700">
                  Objetivo de Aprendizagem
                </label>
                <textarea
                  name="learning_objective"
                  value={formData.learning_objective}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 text-base border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none resize-none placeholder-secondary-400"
                  placeholder="O que os alunos devem aprender com esta aula?"
                />
              </div>

              {/* Perfil dos Alunos */}

              <div className="md:col-span-2 space-y-3">
                <label className="block text-base font-semibold text-secondary-700">
                  Perfil dos Alunos
                </label>
                <textarea
                  name="student_profile"
                  value={formData.student_profile}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 text-base border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none resize-none placeholder-secondary-400"
                  placeholder="Descreva as características da turma (opcional)"
                />
              </div>
            </div>

            {/* Submit Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Gerando Plano de Aula...
                </div>
              ) : (
                'Gerar Plano de Aula com IA'
              )}
            </button>
          </form>
        </div>

        {/* Generated Plan Section */}

        {generatedPlan && (
          <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 transform transition-all duration-500 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-2">Plano de Aula Gerado</h2>
              <div className="bg-primary-100 text-primary-800 inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold">
                Gerado com IA
              </div>
            </div>

            <div className="space-y-8">

              {/* Introdução Lúdica */}

              <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center mr-4">
                  </div>
                  <h3 className="text-xl font-bold text-secondary-800">Introdução Lúdica</h3>
                </div>
                <div className="max-w-3xl mx-auto">
                  <p className="text-secondary-700 leading-relaxed text-base text-justify">
                    {typeof generatedPlan.introducao_ludica === 'string'
                      ? generatedPlan.introducao_ludica
                      : String(generatedPlan.introducao_ludica)
                    }
                  </p>
                </div>
              </div>

              {/* Objetivo BNCC */}

              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  </div>
                  <h3 className="text-xl font-bold text-secondary-800">Objetivo BNCC</h3>
                </div>
                <div className="max-w-3xl mx-auto">
                  <p className="text-secondary-700 leading-relaxed text-base text-justify">
                    {typeof generatedPlan.objetivo_bncc === 'string'
                      ? generatedPlan.objetivo_bncc
                      : String(generatedPlan.objetivo_bncc)
                    }
                  </p>
                </div>
              </div>

              {/* Passo a Passo */}

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mr-4">
                  </div>
                  <h3 className="text-xl font-bold text-secondary-800">Passo a Passo da Atividade</h3>
                </div>

                <div className="max-w-3xl mx-auto">
                  {Array.isArray(generatedPlan.passo_a_passo) ? (
                    <ol className="space-y-4">
                      {generatedPlan.passo_a_passo.map((passo, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-semibold mr-4 mt-1">
                            {index + 1}
                          </div>
                          <p className="text-secondary-700 leading-relaxed flex-1 text-justify">
                            {typeof passo === 'string' ? passo : String(passo)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-secondary-700 leading-relaxed text-justify">
                      {typeof generatedPlan.passo_a_passo === 'string'
                        ? generatedPlan.passo_a_passo
                        : 'Passo a passo não disponível em formato de lista'
                      }
                    </p>
                  )}
                </div>

              </div>

              {/* Rubrica de Avaliação */}

              {/* Rubrica de Avaliação */}

              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                  </div>
                  <h3 className="text-xl font-bold text-secondary-800">Rubrica de Avaliação</h3>
                </div>

                {(() => {
                  const rubrica = generatedPlan.rubrica_avaliacao;

                  // Se for retorno da IA for string, exibe normalmente
                  if (typeof rubrica === 'string') {
                    return <p className="text-secondary-700 leading-relaxed text-base">{rubrica}</p>;
                  }

                  // Se o retorno for objeto complexo (com critérios e níveis)
                  if (typeof rubrica === 'object' && rubrica !== null) {
                    if (rubrica.critérios && Array.isArray(rubrica.critérios) && rubrica.níveis && Array.isArray(rubrica.níveis)) {
                      return (
                        <div className="text-secondary-700 space-y-8">

                          {/* Seção de Critérios */}

                          <div>
                            <h4 className="font-semibold text-secondary-800 mb-4 text-lg">Critérios de Avaliação</h4>
                            <div className="space-y-4">
                              {rubrica.critérios.map((criterio, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                                  <h5 className="font-medium text-purple-700 mb-2">{criterio.critério}</h5>
                                  {criterio.descritores && Array.isArray(criterio.descritores) && (
                                    <ul className="list-disc list-inside space-y-1 text-secondary-600 ml-4">
                                      {criterio.descritores.map((descritor, idx) => (
                                        <li key={idx}>{descritor}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Seção de Níveis */}

                          <div>
                            <h4 className="font-semibold text-secondary-800 mb-4 text-lg">Níveis de Desempenho</h4>
                            <div className="space-y-4">
                              {rubrica.níveis.map((nivel, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                                  <h5 className="font-medium text-purple-700 mb-1">{nivel.nível}</h5>
                                  <p className="text-secondary-600">{nivel.descrição}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Estrutura alternativa (caso a IA retorne formato diferente)
                    const criteria = rubrica.criteria || rubrica.criterios;
                    const niveis = rubrica.nivets || rubrica.niveis || rubrica.levels || rubrica.escala; // Adicionei rubrica.escala

                    // Se o retorno for estrutura simples com arrays
                    if (Array.isArray(criteria) && Array.isArray(niveis)) {
                      return (
                        <div className="text-secondary-700 space-y-6">
                          <div>
                            <h4 className="font-semibold text-secondary-800 mb-3 text-base">Critérios de Avaliação:</h4>
                            <ul className="space-y-2 ml-4">
                              {criteria.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="leading-relaxed">{String(item)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-secondary-800 mb-3 text-base">Níveis de Desempenho:</h4>
                            <ul className="space-y-2 ml-4">
                              {niveis.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="leading-relaxed">{String(item)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    }

                    // Se não for nenhuma estrutura conhecida, exibe formatado
                    return (
                      <pre className="whitespace-pre-wrap bg-white/50 p-4 rounded-lg border text-sm leading-relaxed">
                        {JSON.stringify(rubrica, null, 2)}
                      </pre>
                    );
                  }

                  return (
                    <pre className="whitespace-pre-wrap bg-white/50 p-4 rounded-lg border text-sm leading-relaxed">
                      {JSON.stringify(rubrica, null, 2)}
                    </pre>
                  );
                })()}
              </div>
            </div>

            {/* Success Footer */}

            <div className="mt-8 pt-6 border-t border-secondary-200">
              <div className="flex items-center justify-center text-secondary-500">
                Plano gerado com sucesso! Você pode preencher o formulário novamente para criar outro plano.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}

      <div className="text-center mt-12 px-4">
        <p className="text-secondary-500">
          Desenvolvido com React, Supabase e Gemini AI • Teste Técnico Escribo
        </p>
      </div>
    </div>
  )
}

export default App