-- Tabela para armazenar os planos de aula gerados
CREATE TABLE lesson_plans (
    id UUID PRIMARY KEY DEAFULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration INTEGER NOT NULL, -- duração em minutos
    objective TEXT,
    class_profile TEXT,
    generated_content JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

-- Devido a um erro no supabase por não ter um sistema de autenticação com 
-- user_id, optei por no final desabilitar o RLS abaixo.

-- Habilitar RLS (Row Level Security)
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios planos
CREATE POLICY "Users can view own lesson plans" ON lesson_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson plans" ON lesson_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

