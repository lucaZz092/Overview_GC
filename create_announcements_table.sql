-- Criar tabela de avisos/comunicados
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_roles TEXT[] DEFAULT ARRAY['leader', 'co_leader'], -- Quais papéis podem ver
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL = não expira
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Todos autenticados podem ler avisos ativos destinados ao seu papel
CREATE POLICY "Users can view active announcements for their role"
  ON announcements
  FOR SELECT
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      -- Admin, pastor e coordenador veem tudo
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'pastor', 'coordenador')
      )
      OR
      -- Outros veem apenas avisos destinados ao seu papel
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(target_roles)
      )
    )
  );

-- Policy: Pastor, coordenador e admin podem criar avisos
CREATE POLICY "Pastors and coordinators can create announcements"
  ON announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Policy: Pastor, coordenador e admin podem atualizar seus próprios avisos
CREATE POLICY "Pastors and coordinators can update their announcements"
  ON announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Policy: Pastor, coordenador e admin podem deletar avisos
CREATE POLICY "Pastors and coordinators can delete announcements"
  ON announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'pastor', 'coordenador')
    )
  );

-- Criar índices para melhor performance
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_expires_at ON announcements(expires_at);
CREATE INDEX idx_announcements_target_roles ON announcements USING gin(target_roles);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();
