import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const LessonPlanGenerator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    duration: 45,
    learning_objective: '',
    student_profile: ''
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedPlan(data)
        // Salvar no Supabase
        await saveLessonPlan(data)
      } else {
        console.error('Erro na geração:', data)
      };
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false);
    };
  };

  const saveLessonPlan = async (planData) => {
    const { data, error } = await supabase
      .from('lesson_plans')
      .insert([
        {
          ...formData,
          generated_content: planData
        }
      ])
      .select()

    if (error) {
      console.error('Erro ao salvar:', error)
    } else {
      console.log('Plano salvo:', data)
    };
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gerador de Planos de Aula com IA</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Matéria</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ano/Série</label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tema</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duração (minutos)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Objetivo de Aprendizagem (opcional)</label>
          <textarea
            name="learning_objective"
            value={formData.learning_objective}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Perfil dos Alunos (opcional)</label>
          <textarea
            name="student_profile"
            value={formData.student_profile}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Gerando...' : 'Gerar Plano de Aula'}
        </button>
      </form>

      {generatedPlan && (
        <div className="mt-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Plano de Aula Gerado</h2>
          <pre>{JSON.stringify(generatedPlan, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default LessonPlanGenerator