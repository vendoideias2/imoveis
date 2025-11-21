-- Create admin user with login: vendoideias, password: vendo1010
-- Hash generated for password: vendo1010
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'vendoideias@vendoideias.com',
  'Administrador',
  '$2a$10$tQZ5xY4WxH6rJ8vN9Z0xEeL3q7.YhX8xZ9vQ2wB4kC5nM6pR7sT8u',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
