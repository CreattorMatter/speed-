-- Crear tabla de usuarios para autenticación personalizada
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'limited' CHECK (role IN ('admin', 'limited')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan leer su propia información
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (true); -- Por ahora permitir lectura general, se puede restringir después

-- Política para insertar nuevos usuarios (solo admins)
CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (true); -- Por ahora permitir inserción general

-- Política para actualizar usuarios (solo admins o el mismo usuario)
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (true) WITH CHECK (true); -- Por ahora permitir actualización general

-- Comentarios para documentación
COMMENT ON TABLE public.users IS 'Tabla de usuarios para autenticación personalizada del sistema SPID';
COMMENT ON COLUMN public.users.id IS 'Identificador único del usuario';
COMMENT ON COLUMN public.users.email IS 'Email único del usuario, usado para login';
COMMENT ON COLUMN public.users.password IS 'Contraseña del usuario (debe ser hasheada en producción)';
COMMENT ON COLUMN public.users.name IS 'Nombre completo del usuario';
COMMENT ON COLUMN public.users.role IS 'Rol del usuario: admin o limited';
COMMENT ON COLUMN public.users.status IS 'Estado del usuario: active o inactive'; 